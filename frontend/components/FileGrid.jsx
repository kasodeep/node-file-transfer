"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FileIcon } from "lucide-react";
import { FileCard } from "@/components/FileCard";

/**
 * Renders the responsive file grid, or a loading spinner / empty state
 * when appropriate.
 */
export function FileGrid({
    files,
    loading,
    search,
    selected,
    onToggleSelect,
    onDownload,
    onDelete,
}) {
    // ── Loading ──────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex justify-center items-center h-56">
                <motion.div
                    animate={{ rotate: 360, scale: [1, 1.15, 1] }}
                    transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
                    className="w-14 h-14 border-4 border-yellow-500 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    // ── Empty state ───────────────────────────────────────────────────────────
    if (files.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-48 text-white/35"
            >
                <FileIcon className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-lg font-medium">
                    {search
                        ? "No files match your search."
                        : "No files yet — upload something!"}
                </p>
            </motion.div>
        );
    }

    // ── Grid ─────────────────────────────────────────────────────────────────
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 mt-6 pb-10"
            >
                {files.map((file, index) => (
                    <FileCard
                        key={file.name}
                        file={file}
                        index={index}
                        isSelected={selected.has(file.name)}
                        onToggle={onToggleSelect}
                        onDownload={onDownload}
                        onDelete={onDelete}
                    />
                ))}
            </motion.div>
        </AnimatePresence>
    );
}