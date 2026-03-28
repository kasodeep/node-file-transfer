"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X } from "lucide-react";

/**
 * Renders a stack of dismissible error banners.
 */
export function ErrorBanner({ errors, onDismiss }) {
    return (
        <div className="relative z-10 px-6 pt-3 space-y-2">
            <AnimatePresence>
                {errors.map(e => (
                    <motion.div
                        key={e.id}
                        initial={{ opacity: 0, y: -10, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-red-500/80 backdrop-blur px-4 py-2.5 rounded-lg flex items-center gap-3 text-sm shadow-lg"
                    >
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span className="flex-1">{e.msg}</span>
                        <button
                            onClick={() => onDismiss(e.id)}
                            className="hover:opacity-70 transition-opacity"
                            aria-label="Dismiss error"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}