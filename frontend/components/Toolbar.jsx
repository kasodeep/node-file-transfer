"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    Search, X, ArrowUpDown, RefreshCw,
    CheckSquare, Square, DownloadCloud, Trash2,
} from "lucide-react";
import { SORT_OPTIONS } from "@/lib/constants";
import { formatBytes } from "@/lib/utils";

/**
 * Toolbar: search input, sort selector, refresh, select-all toggle,
 * and the contextual bulk-action bar that slides in when files are selected.
 */
export function Toolbar({
    search, onSearchChange,
    sortIdx, onSortChange,
    onRefresh,
    allSelected, onToggleSelectAll,
    selected,
    onClearSelection,
    onBulkDownload,
    onBulkDeleteOpen,
    totalFiles, totalSize, filteredCount,
}) {
    const hasSelection = selected.size > 0;

    return (
        <div className="relative z-10 container mx-auto px-6 pt-6 pb-1">

            {/* ── Controls row ── */}
            <div className="flex flex-wrap gap-2.5 items-center">

                {/* Search */}
                <div className="flex items-center gap-2 bg-black/40 border border-white/15 backdrop-blur rounded-lg px-3 py-2 flex-1 min-w-[180px]">
                    <Search className="w-4 h-4 text-white/40 shrink-0" />
                    <input
                        type="text"
                        placeholder="Search files…"
                        value={search}
                        onChange={e => onSearchChange(e.target.value)}
                        className="bg-transparent outline-none text-sm w-full placeholder-white/35 text-white"
                    />
                    {search && (
                        <button
                            onClick={() => onSearchChange("")}
                            className="text-white/40 hover:text-white transition-colors"
                            aria-label="Clear search"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* Sort */}
                <div className="flex items-center gap-1.5 bg-black/40 border border-white/15 backdrop-blur rounded-lg px-3 py-2 shrink-0">
                    <ArrowUpDown className="w-3.5 h-3.5 text-white/40 shrink-0" />
                    <select
                        value={sortIdx}
                        onChange={e => onSortChange(Number(e.target.value))}
                        className="bg-transparent outline-none text-sm text-white/80 cursor-pointer"
                    >
                        {SORT_OPTIONS.map((opt, i) => (
                            <option key={i} value={i} className="bg-gray-900 text-white">
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Refresh */}
                <button
                    onClick={onRefresh}
                    title="Refresh file list"
                    className="bg-black/40 border border-white/15 backdrop-blur rounded-lg p-2.5 hover:bg-white/10 transition-colors shrink-0"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>

                {/* Select / Deselect all (scoped to visible filtered list) */}
                <button
                    onClick={onToggleSelectAll}
                    className="bg-black/40 border border-white/15 backdrop-blur rounded-lg px-3 py-2 flex items-center gap-2 text-sm hover:bg-white/10 transition-colors shrink-0"
                >
                    {allSelected
                        ? <CheckSquare className="w-4 h-4 text-yellow-400" />
                        : <Square className="w-4 h-4 text-white/50" />}
                    {allSelected ? "Deselect All" : "Select All"}
                </button>
            </div>

            {/* ── Bulk action bar (slides in when selection is non-empty) ── */}
            <AnimatePresence>
                {hasSelection && (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="mt-3 flex items-center gap-2.5 flex-wrap bg-white/5 border border-white/10 backdrop-blur rounded-xl px-4 py-2.5"
                    >
                        {/* Selection count badge */}
                        <span className="text-sm font-semibold text-yellow-300">
                            {selected.size} selected
                        </span>

                        <div className="w-px h-4 bg-white/20" />

                        {/* Bulk download */}
                        <button
                            onClick={onBulkDownload}
                            className="flex items-center gap-1.5 bg-blue-600/80 hover:bg-blue-500 border border-blue-400/30 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors"
                        >
                            <DownloadCloud className="w-4 h-4" />
                            Download {selected.size}
                        </button>

                        {/* Bulk delete */}
                        <button
                            onClick={onBulkDeleteOpen}
                            className="flex items-center gap-1.5 bg-red-600/80 hover:bg-red-500 border border-red-400/30 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete {selected.size}
                        </button>

                        {/* Clear selection */}
                        <button
                            onClick={onClearSelection}
                            className="ml-auto text-white/40 hover:text-white transition-colors"
                            aria-label="Clear selection"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Summary line ── */}
            <p className="text-xs text-white/35 mt-2">
                {filteredCount} of {totalFiles} file{totalFiles !== 1 ? "s" : ""}
                {totalFiles > 0 && ` · ${formatBytes(totalSize)} total`}
            </p>
        </div>
    );
}