"use client";

import { motion } from "framer-motion";
import { Upload, Wifi, WifiOff } from "lucide-react";

/**
 * Top navigation bar.
 * Receives only the props it needs — no access to full state.
 */
export function Navbar({ wsConnected, isUploading, fileInputRef, onUpload }) {
    return (
        <nav className="relative z-10 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-600 px-5 py-3 shadow-2xl flex items-center justify-between gap-3 flex-wrap">

            {/* Brand */}
            <motion.span
                initial={{ opacity: 0, y: -14 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl font-extrabold tracking-widest uppercase flex items-center gap-2 shrink-0"
            >
                <span className="text-3xl">⚡</span> Goku Transfer
            </motion.span>

            {/* Live / reconnecting pill */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full shrink-0 ${wsConnected
                        ? "bg-green-500/30 text-green-100"
                        : "bg-red-500/30 text-red-100"
                    }`}
            >
                {wsConnected ? (
                    <><Wifi className="w-3.5 h-3.5" /> Live</>
                ) : (
                    <><WifiOff className="w-3.5 h-3.5" /> Reconnecting…</>
                )}
            </motion.div>

            {/* Upload label/button */}
            <motion.label
                whileHover={{ scale: isUploading ? 1 : 1.06 }}
                whileTap={{ scale: isUploading ? 1 : 0.93 }}
                className={`cursor-pointer bg-black/30 border border-white/20 backdrop-blur px-4 py-2 rounded-lg
          flex items-center gap-2 font-bold text-sm shrink-0 transition-colors
          ${isUploading ? "opacity-50 cursor-not-allowed" : "hover:bg-black/50"}`}
            >
                <Upload className="w-4 h-4" />
                {isUploading ? "Uploading…" : "Upload Files"}
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={e => onUpload(e.target.files)}
                    disabled={isUploading}
                />
            </motion.label>
        </nav>
    );
}