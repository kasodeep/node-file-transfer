"use client";

/**
 * page.jsx — thin orchestrator.
 *
 * All state and API logic lives in useFileManager.
 * This file is pure composition: it imports sub-components and
 * passes props down. No business logic here.
 */

import { useFileManager } from "@/hooks/useFileManager";
import { Navbar } from "@/components/Navbar";
import { UploadProgress } from "@/components/UploadProgress";
import { ErrorBanner } from "@/components/ErrorBanner";
import { Toolbar } from "@/components/Toolbar";
import { FileGrid } from "@/components/FileGrid";
import { DeleteDialog } from "@/components/DeleteDialog";

export default function Home() {
  const fm = useFileManager();

  return (
    <div
      className="min-h-screen text-white relative bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: "url('/goku.jpeg')",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Full-screen dark glassmorphism overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <Navbar
        wsConnected={fm.wsConnected}
        isUploading={fm.isUploading}
        fileInputRef={fm.fileInputRef}
        onUpload={fm.uploadFiles}
      />

      {/* ── Upload progress bars ─────────────────────────────────────────── */}
      <UploadProgress uploadProgress={fm.uploadProgress} />

      {/* ── Dismissible error banners ────────────────────────────────────── */}
      <ErrorBanner errors={fm.errors} onDismiss={fm.dismissError} />

      {/* ── Toolbar: search · sort · select · bulk actions ───────────────── */}
      <Toolbar
        search={fm.search} onSearchChange={fm.setSearch}
        sortIdx={fm.sortIdx} onSortChange={fm.setSortIdx}
        onRefresh={fm.fetchFiles}
        allSelected={fm.allSelected} onToggleSelectAll={fm.toggleSelectAll}
        selected={fm.selected} onClearSelection={fm.clearSelection}
        onBulkDownload={fm.bulkDownload}
        onBulkDeleteOpen={fm.openBulkDelete}
        totalFiles={fm.files.length}
        filteredCount={fm.filteredFiles.length}
        totalSize={fm.totalSize}
      />

      {/* ── File grid ────────────────────────────────────────────────────── */}
      <div className="relative z-10 container mx-auto px-6">
        <FileGrid
          files={fm.filteredFiles}
          loading={fm.loading}
          search={fm.search}
          selected={fm.selected}
          onToggleSelect={fm.toggleSelect}
          onDownload={fm.downloadFile}
          onDelete={fm.confirmSingleDelete}
        />
      </div>

      {/* ── Single-file delete dialog ─────────────────────────────────────── */}
      <DeleteDialog
        open={!!fm.singleDelete}
        title="Delete file?"
        description={
          <>
            <span className="text-yellow-400 font-medium">{fm.singleDelete}</span>
            {" "}will be permanently removed. This cannot be undone.
          </>
        }
        onConfirm={fm.executeSingleDelete}
        onCancel={fm.cancelSingleDelete}
      />

      {/* ── Bulk delete dialog ───────────────────────────────────────────── */}
      <DeleteDialog
        open={fm.bulkDeleteOpen}
        title={`Delete ${fm.selected.size} file${fm.selected.size !== 1 ? "s" : ""}?`}
        description={
          <>
            You are about to permanently delete{" "}
            <span className="text-yellow-400 font-medium">{fm.selected.size} file{fm.selected.size !== 1 ? "s" : ""}</span>.
            {" "}This cannot be undone.
          </>
        }
        onConfirm={fm.executeBulkDelete}
        onCancel={fm.closeBulkDelete}
      />
    </div>
  );
}