const express = require("express");

const cors = require("cors");
const multer = require("multer");

const os = require("os");
const fs = require("fs");
const path = require("path");

const WebSocket = require("ws");

/**
 * Function to get the IP address of the machine.
 */
const getLocalIpAddress = () => {
  const interfaces = os.networkInterfaces();
  for (const interfaceName in interfaces) {
    for (const iface of interfaces[interfaceName]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "127.0.0.1";
};

const localIp = getLocalIpAddress();

// Specifying the express app and the file directory.
const app = express();
const FILE_DIR = path.join(os.homedir(), "Desktop", "shared");

if (!fs.existsSync(FILE_DIR)) {
  fs.mkdirSync(FILE_DIR, { recursive: true });
}

// Setting the cors property for inter-wifi communication.
app.use(
  cors({
    origin: ["http://localhost:3000", `http://${localIp}:3000`],
    methods: ["GET", "POST", "DELETE"],
  }),
);

// Configuration of multer for uploading the files to server.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, FILE_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// WebSocket server setup
const wss = new WebSocket.Server({ port: 5001 });

wss.on("connection", (ws) => {
  console.log("WebSocket client connected");
  ws.on("close", () => {
    console.log("WebSocket client disconnected");
  });
});

// Broadcast function to notify all connected clients
const broadcastFileUpdate = () => {
  fs.readdir(FILE_DIR, (err, files) => {
    if (err) {
      console.error("Failed to read directory:", err);
      return;
    }
    const message = JSON.stringify({ type: "fileUpdate", files });
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
};

app.get("/files", (req, res) => {
  fs.readdir(FILE_DIR, (err, files) => {
    if (err) {
      return res.status(500).send("Unable to list files!");
    }
    res.status(200).json(files);
  });
});

app.post("/upload", upload.array("files", 30), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send("No files uploaded!");
  }

  // Notify all connected clients of the file update
  broadcastFileUpdate();

  res.status(200).json({
    message: "Files uploaded successfully!",
    filenames: req.files.map((file) => file.filename),
  });
});

app.get("/download/:filename", (req, res) => {
  const fileName = path.basename(req.params.filename); // Prevent path traversal
  const filePath = path.join(FILE_DIR, fileName);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ error: "File not found!" });
    }
    res.download(filePath, fileName, (err) => {
      if (err) {
        res.status(500).json({ error: "Failed to download file!" });
      }
    });
  });
});

app.delete("/delete/:filename", (req, res) => {
  const fileName = path.basename(req.params.filename);
  const filePath = path.join(FILE_DIR, fileName);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ error: "File not found!" });
    }

    fs.unlink(filePath, (err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to delete file!" });
      }

      // Notify all connected clients of the file update
      broadcastFileUpdate();

      res.status(200).json({ message: "File deleted successfully!" });
    });
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://${localIp}:${PORT}`);
  console.log(`WebSocket server running at ws://${localIp}:5001`);
});
