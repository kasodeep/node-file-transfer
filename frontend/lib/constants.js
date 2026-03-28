export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://192.168.1.9:5000";
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://192.168.1.9:5001";

export const WS_RECONNECT_BASE_MS = 1_000;
export const WS_RECONNECT_MAX_MS = 30_000;

export const EXT_COLORS = {
    pdf: "text-red-400",
    jpg: "text-sky-400", jpeg: "text-sky-400",
    png: "text-sky-400", gif: "text-sky-400", webp: "text-sky-400",
    docx: "text-blue-400", doc: "text-blue-400",
    xlsx: "text-green-500", csv: "text-green-400",
    txt: "text-gray-300", md: "text-gray-300",
    java: "text-orange-400",
    js: "text-yellow-400", ts: "text-blue-300",
    jsx: "text-yellow-300", tsx: "text-blue-200",
    py: "text-green-400",
    go: "text-cyan-400",
    rs: "text-orange-300",
    ipynb: "text-purple-400",
    zip: "text-pink-400", tar: "text-pink-300", gz: "text-pink-300",
    mp4: "text-fuchsia-400", mp3: "text-fuchsia-300",
};

export const SORT_OPTIONS = [
    { label: "Name A→Z", fn: (a, b) => a.name.localeCompare(b.name) },
    { label: "Name Z→A", fn: (a, b) => b.name.localeCompare(a.name) },
    { label: "Size ↑", fn: (a, b) => (a.size ?? 0) - (b.size ?? 0) },
    { label: "Size ↓", fn: (a, b) => (b.size ?? 0) - (a.size ?? 0) },
    {
        label: "Type",
        fn: (a, b) =>
            (a.name.split(".").pop() ?? "").localeCompare(b.name.split(".").pop() ?? ""),
    },
];