"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useReconnectingWS } from "@/hooks/useReconnectingWS";
import { API_URL, WS_URL, SORT_OPTIONS } from "@/lib/constants";
import { uid } from "@/lib/utils";

/**
 * Central hook that owns all file-manager state and exposes clean actions.
 *
 * State shape
 * ───────────
 * files          [{ name: string, size: number }]   — from server
 * errors         [{ id: number, msg: string }]       — dismissible banners
 * loading        boolean
 * isUploading    boolean
 * uploadProgress { [filename]: 0-100 }
 * search         string
 * sortIdx        number (index into SORT_OPTIONS)
 * selected       Set<string>                         — selected filenames
 * singleDelete   string | null                       — filename pending single-delete confirm
 * bulkDeleteOpen boolean
 *
 * Exposed actions
 * ───────────────
 * fetchFiles()
 * uploadFiles(fileList)
 * downloadFile(filename)
 * bulkDownload()
 * confirmSingleDelete(filename)
 * cancelSingleDelete()
 * executeSingleDelete()
 * openBulkDelete()
 * closeBulkDelete()
 * executeBulkDelete()
 * toggleSelect(filename)
 * toggleSelectAll()
 * clearSelection()
 * setSearch(str)
 * setSortIdx(n)
 * dismissError(id)
 *
 * Derived
 * ───────
 * filteredFiles  sorted + filtered view of files
 * wsConnected    boolean
 * totalSize      number (bytes)
 * allSelected    boolean
 */
export function useFileManager() {
    // ── Raw state ──────────────────────────────────────────────────────────────
    const [files, setFiles] = useState([]);
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});
    const [search, setSearch] = useState("");
    const [sortIdx, setSortIdx] = useState(0);
    const [selected, setSelected] = useState(new Set());
    const [singleDelete, setSingleDelete] = useState(null);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

    const fileInputRef = useRef(null);
    const { toast } = useToast();

    // ── Error helpers ──────────────────────────────────────────────────────────
    const pushError = useCallback((msg) => setErrors(p => [...p, { id: uid(), msg }]), []);
    const dismissError = useCallback((id) => setErrors(p => p.filter(e => e.id !== id)), []);

    // ── WebSocket ──────────────────────────────────────────────────────────────
    const handleWsMessage = useCallback((msg) => {
        if (msg.type !== "fileUpdate") return;
        const incoming = msg.files; // [{ name, size }]
        setFiles(incoming);
        // Prune stale selections
        setSelected(prev => {
            const live = new Set(incoming.map(f => f.name));
            const next = new Set([...prev].filter(n => live.has(n)));
            return next.size === prev.size ? prev : next;
        });
    }, []);

    const wsConnected = useReconnectingWS(WS_URL, handleWsMessage);

    // ── Fetch ──────────────────────────────────────────────────────────────────
    const fetchFiles = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/files`);
            if (!res.ok) throw new Error("Failed to fetch files");
            setFiles(await res.json());
        } catch (err) {
            pushError(err.message);
        } finally {
            setLoading(false);
        }
    }, [pushError]);

    useEffect(() => { fetchFiles(); }, [fetchFiles]);

    // ── Upload ─────────────────────────────────────────────────────────────────
    const uploadFiles = useCallback(async (fileList) => {
        if (!fileList?.length) return;
        setIsUploading(true);

        const formData = new FormData();
        const names = [];
        for (const file of fileList) {
            formData.append("files", file);
            names.push(file.name);
        }
        setUploadProgress(Object.fromEntries(names.map(n => [n, 0])));

        await new Promise((resolve) => {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", `${API_URL}/upload`);

            xhr.upload.onprogress = (e) => {
                if (!e.lengthComputable) return;
                const pct = Math.round((e.loaded / e.total) * 100);
                setUploadProgress(Object.fromEntries(names.map(n => [n, pct])));
            };

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    toast({ title: "Upload successful!", description: `${names.length} file(s) uploaded.` });
                } else {
                    try { pushError(JSON.parse(xhr.responseText).error ?? "Upload failed"); }
                    catch { pushError("Upload failed"); }
                }
                resolve();
            };

            xhr.onerror = () => { pushError("Network error during upload"); resolve(); };
            xhr.send(formData);
        });

        setUploadProgress({});
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }, [pushError, toast]);

    // ── Download ───────────────────────────────────────────────────────────────
    const downloadFile = useCallback(async (filename) => {
        try {
            const res = await fetch(`${API_URL}/download/${encodeURIComponent(filename)}`);
            if (!res.ok) throw new Error("Failed to download");
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url; a.download = filename; a.click();
            URL.revokeObjectURL(url);
            toast({ title: "Download started", description: filename });
        } catch (err) {
            toast({ title: "Download failed", description: err.message, variant: "destructive" });
        }
    }, [toast]);

    // Sequential to avoid popup blockers
    const bulkDownload = useCallback(async () => {
        const names = [...selected];
        toast({ title: `Downloading ${names.length} file(s)…` });
        for (const name of names) {
            await downloadFile(name);
            await new Promise(r => setTimeout(r, 350));
        }
    }, [selected, downloadFile, toast]);

    // ── Single delete ──────────────────────────────────────────────────────────
    const confirmSingleDelete = useCallback((filename) => setSingleDelete(filename), []);
    const cancelSingleDelete = useCallback(() => setSingleDelete(null), []);

    const executeSingleDelete = useCallback(async () => {
        if (!singleDelete) return;
        const name = singleDelete;
        setSingleDelete(null);
        try {
            const res = await fetch(`${API_URL}/delete/${encodeURIComponent(name)}`, { method: "DELETE" });
            if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? "Delete failed"); }
            setSelected(prev => { const n = new Set(prev); n.delete(name); return n; });
            toast({ title: "File deleted", description: name });
        } catch (err) { pushError(err.message); }
    }, [singleDelete, toast, pushError]);

    // ── Bulk delete ────────────────────────────────────────────────────────────
    const openBulkDelete = useCallback(() => setBulkDeleteOpen(true), []);
    const closeBulkDelete = useCallback(() => setBulkDeleteOpen(false), []);

    const executeBulkDelete = useCallback(async () => {
        const names = [...selected];
        setBulkDeleteOpen(false);

        const results = await Promise.allSettled(
            names.map(name =>
                fetch(`${API_URL}/delete/${encodeURIComponent(name)}`, { method: "DELETE" })
                    .then(r => { if (!r.ok) throw new Error(name); })
            )
        );

        const failed = results
            .filter(r => r.status === "rejected")
            .map(r => r.reason?.message ?? "unknown");

        if (failed.length === 0) {
            toast({ title: `${names.length} file(s) deleted.` });
        } else {
            pushError(`Could not delete: ${failed.join(", ")}`);
            toast({
                title: `${names.length - failed.length} deleted, ${failed.length} failed.`,
                variant: "destructive",
            });
        }
        setSelected(new Set());
    }, [selected, toast, pushError]);

    // ── Selection ──────────────────────────────────────────────────────────────
    const toggleSelect = useCallback((name) =>
        setSelected(prev => {
            const next = new Set(prev);
            next.has(name) ? next.delete(name) : next.add(name);
            return next;
        }), []);

    // Derived: is every visible file selected?
    const filteredFiles = files
        .filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
        .sort(SORT_OPTIONS[sortIdx].fn);

    const allSelected = filteredFiles.length > 0 && filteredFiles.every(f => selected.has(f.name));

    const toggleSelectAll = useCallback(() => {
        if (allSelected) {
            setSelected(prev => {
                const next = new Set(prev);
                filteredFiles.forEach(f => next.delete(f.name));
                return next;
            });
        } else {
            setSelected(prev => {
                const next = new Set(prev);
                filteredFiles.forEach(f => next.add(f.name));
                return next;
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allSelected, filteredFiles]);

    const clearSelection = useCallback(() => setSelected(new Set()), []);

    // ── Derived aggregates ─────────────────────────────────────────────────────
    const totalSize = files.reduce((s, f) => s + (f.size ?? 0), 0);

    return {
        // state
        files, filteredFiles, errors, loading,
        isUploading, uploadProgress,
        search, sortIdx,
        selected, allSelected,
        singleDelete, bulkDeleteOpen,
        wsConnected, totalSize,
        fileInputRef,
        // actions
        fetchFiles, uploadFiles,
        downloadFile, bulkDownload,
        confirmSingleDelete, cancelSingleDelete, executeSingleDelete,
        openBulkDelete, closeBulkDelete, executeBulkDelete,
        toggleSelect, toggleSelectAll, clearSelection,
        setSearch, setSortIdx,
        dismissError,
    };
}