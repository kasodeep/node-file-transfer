const express = require("express");
const cors = require("cors");
const multer = require("multer");

const os = require("os");
const fs = require("fs");
const path = require("path");

const WebSocket = require("ws");

// Config
const PORT = 5000;
const WS_PORT = 5001;
const FILE_DIR = path.join(os.homedir(), "Desktop", "shared");
const MAX_FILE_SIZE_MB = 500; // 500 MB max file size

// Helpers
const getLocalIp = () => {
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) return iface.address;
    }
  }
  return "127.0.0.1";
};

/** Read FILE_DIR and return an array of { name, size } objects. */
const readFileList = () => {
  const entries = fs.readdirSync(FILE_DIR);
  return entries.map(name => {
    try {
      const stat = fs.statSync(path.join(FILE_DIR, name));
      return { name, size: stat.size };
    } catch {
      return { name, size: 0 };
    }
  });
};

// Setup
if (!fs.existsSync(FILE_DIR)) fs.mkdirSync(FILE_DIR, { recursive: true });

// express setup
const localIp = getLocalIp();
const app = express();
app.use(express.json());

// CORS: allow local dev and LAN access
app.use(cors({
  origin: (_origin, cb) => cb(null, true), // allow all origins on a LAN tool
  methods: ["GET", "POST", "DELETE"],
}));

// multer
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, FILE_DIR),
  filename: (_req, file, cb) => cb(null, file.originalname),
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
});

// WebSocket broadcast
const wss = new WebSocket.Server({ port: WS_PORT });

wss.on("connection", (ws) => {
  console.log("WS client connected");

  // Send current file list immediately on connect
  ws.send(JSON.stringify({ type: "fileUpdate", files: readFileList() }));
  ws.on("close", () => console.log("WS client disconnected"));
});

function broadcast() {
  const payload = JSON.stringify({ type: "fileUpdate", files: readFileList() });
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) client.send(payload);
  }
}

// Routes

/** GET /files → [{ name, size }] */
app.get("/files", (_req, res) => {
  try {
    res.json(readFileList());
  } catch (err) {
    res.status(500).json({ error: "Unable to list files" });
  }
});

/** POST /upload — multipart, up to 30 files */
app.post("/upload", upload.array("files", 30), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ error: "No files uploaded" });
  broadcast();
  res.json({
    message: "Files uploaded successfully",
    filenames: req.files.map(f => f.filename),
  });
});

/** GET /download/:filename */
app.get("/download/:filename", (req, res) => {
  const name = path.basename(req.params.filename); // prevent path traversal
  const filePath = path.join(FILE_DIR, name);

  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "File not found" });

  res.download(filePath, name, (err) => {
    if (err && !res.headersSent) res.status(500).json({ error: "Download failed" });
  });
});

/** DELETE /delete/:filename — single file */
app.delete("/delete/:filename", (req, res) => {
  const name = path.basename(req.params.filename);
  const filePath = path.join(FILE_DIR, name);

  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "File not found" });

  try {
    fs.unlinkSync(filePath);
    broadcast();
    res.json({ message: "File deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete file" });
  }
});

/**
 * DELETE /bulk-delete — delete multiple files atomically.
 * Body: { filenames: string[] }
 * Returns: { deleted: string[], failed: string[] }
 */
app.delete("/bulk-delete", (req, res) => {
  const { filenames } = req.body;

  if (!Array.isArray(filenames) || filenames.length === 0) {
    return res.status(400).json({ error: "filenames array is required" });
  }

  const deleted = [];
  const failed = [];

  for (const raw of filenames) {
    const name = path.basename(raw); // sanitise each name
    const filePath = path.join(FILE_DIR, name);
    try {
      if (!fs.existsSync(filePath)) throw new Error("not found");
      fs.unlinkSync(filePath);
      deleted.push(name);
    } catch {
      failed.push(name);
    }
  }

  if (deleted.length > 0) broadcast();

  const status = failed.length === 0 ? 200 : failed.length === filenames.length ? 500 : 207;
  res.status(status).json({ deleted, failed });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`HTTP  → http://${localIp}:${PORT}`);
  console.log(`WS    → ws://${localIp}:${WS_PORT}`);
  console.log(`Files → ${FILE_DIR}`);
});