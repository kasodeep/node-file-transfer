"use client";

import { motion, AnimatePresence } from "framer-motion";

/**
 * Animated per-file upload progress bars.
 * Only renders when at least one file is in progress.
 */
export function UploadProgress({ uploadProgress }) {
    const entries = Object.entries(uploadProgress);

    return (
        <AnimatePresence>
            {entries.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="relative z-10 bg-black/80 border-b border-white/10 px-6 py-3 space-y-2.5"
                >
                    {entries.map(([name, pct]) => (
                        <div key={name}>
                            <div className="flex justify-between text-xs text-white/60 mb-1">
                                <span className="truncate max-w-[75%]">{name}</span>
                                <span className="font-mono">{pct}%</span>
                            </div>
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ duration: 0.15, ease: "easeOut" }}
                                />
                            </div>
                        </div>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );
}