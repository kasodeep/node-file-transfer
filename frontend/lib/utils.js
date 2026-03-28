import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format a byte count into a human-readable string.
 * Returns "—" for null / zero.
 */
export function formatBytes(bytes) {
  if (!bytes) return "—";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

/**
 * Extract the lowercase extension from a filename.
 * e.g. "report.PDF" → "pdf"
 */
export function getExt(filename) {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

/**
 * Generate a stable unique id (Date.now + random to avoid collisions
 * when called multiple times in the same ms).
 */
export function uid() {
  return Date.now() + Math.random();
}