"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileIcon, Download, Trash2, CheckSquare, Square } from "lucide-react";
import { EXT_COLORS } from "@/lib/constants";
import { formatBytes, getExt } from "@/lib/utils";

// ── Animation variants ────────────────────────────────────────────────────────
const cardVariants = {
    hidden: { opacity: 0, y: 32, rotateY: -10 },
    visible: (i) => ({
        opacity: 1, y: 0, rotateY: 0,
        transition: { delay: i * 0.055, duration: 0.4, type: "spring", stiffness: 120 },
    }),
    hover: {
        scale: 1.03, z: 30,
        boxShadow: "0 20px 40px -10px rgba(0,0,0,0.6)",
        transition: { duration: 0.2 },
    },
    exit: { opacity: 0, scale: 0.85, transition: { duration: 0.2 } },
};

// ── FileTypeIcon ──────────────────────────────────────────────────────────────
function FileTypeIcon({ filename }) {
    const ext = getExt(filename);
    const color = EXT_COLORS[ext] ?? "text-yellow-300";
    return <FileIcon className={`w-7 h-7 ${color} shrink-0`} />;
}

// ── FileCard ──────────────────────────────────────────────────────────────────
/**
 * A single file card.
 * Clicking the card body toggles selection.
 * Download / Delete buttons stop propagation so they don't also toggle.
 */
export function FileCard({ file, index, isSelected, onToggle, onDownload, onDelete }) {
    return (
        <motion.div
            layout
            custom={index}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            exit="exit"
        >
            <Card
                onClick={() => onToggle(file.name)}
                className={`relative overflow-hidden border backdrop-blur-md rounded-xl h-full cursor-pointer transition-all duration-200
          ${isSelected
                        ? "border-yellow-400/80 bg-gradient-to-br from-yellow-600/40 to-orange-700/40 shadow-[0_0_0_2px_rgba(250,204,21,0.4)]"
                        : "border-white/10 bg-gradient-to-br from-orange-600/80 to-red-700/80 hover:border-white/25"
                    }`}
            >
                {/* Dark scrim */}
                <div className="absolute inset-0 bg-black/20 rounded-xl pointer-events-none" />

                <CardContent className="p-5 relative z-10">

                    {/* ── Header row: icon + ext badge ── */}
                    <div className="flex justify-between items-start mb-3">
                        {/* Checkbox + icon */}
                        <div className="flex items-center gap-2.5">
                            <motion.div
                                animate={{ scale: isSelected ? 1.1 : 1 }}
                                transition={{ duration: 0.15 }}
                            >
                                {isSelected
                                    ? <CheckSquare className="w-5 h-5 text-yellow-400" />
                                    : <Square className="w-5 h-5 text-white/30" />}
                            </motion.div>
                            <FileTypeIcon filename={file.name} />
                        </div>

                        {/* Extension badge */}
                        <span className="bg-yellow-500/20 text-yellow-200 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                            {getExt(file.name) || "—"}
                        </span>
                    </div>

                    {/* ── Filename ── */}
                    <h3
                        className="text-sm font-bold text-yellow-100 truncate mb-0.5"
                        title={file.name}
                    >
                        {file.name}
                    </h3>

                    {/* ── Size ── */}
                    <p className="text-xs text-white/40 mb-4">{formatBytes(file.size)}</p>

                    {/* ── Action buttons — stop propagation to avoid toggling selection ── */}
                    <div
                        className="flex gap-2"
                        onClick={e => e.stopPropagation()}
                    >
                        <Button
                            size="sm"
                            onClick={() => onDownload(file.name)}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors py-1.5"
                        >
                            <Download className="w-3.5 h-3.5" />
                            Download
                        </Button>

                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => onDelete(file.name)}
                            className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg flex items-center justify-center transition-colors"
                            aria-label={`Delete ${file.name}`}
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}