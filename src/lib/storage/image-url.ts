/**
 * Universal Image URL Helper for Database-Driven & Uploaded Assets.
 *
 * Handles:
 * - Null / undefined / empty string -> returns null (or fallback if provided)
 * - Absolute URLs (http://, https://, data:, blob:) -> returns as-is
 * - Root-relative local paths (/upload/..., /photos/..., /logo.png) -> returns as-is
 * - Storage bucket relative paths (e.g. "playtube-uploads/...", "uploads/...", "photos/...")
 *   -> formats into Supabase public URL if configured
 */

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";

export function getPublicImageUrl(
  pathOrUrl?: string | null,
  fallback?: string | null
): string | null {
  if (!pathOrUrl || typeof pathOrUrl !== "string") {
    return fallback ?? null;
  }

  const trimmed = pathOrUrl.trim();
  if (!trimmed) {
    return fallback ?? null;
  }

  // Absolute URLs or data/blob schemes
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }

  // Root-relative path (e.g., /upload/..., /logo.png, /favicon.ico)
  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  // If path looks like a storage path or relative path, check Supabase configuration
  if (SUPABASE_URL) {
    // If it starts with a known bucket or folder path
    const cleanUrl = SUPABASE_URL.replace(/\/+$/, "");
    if (trimmed.startsWith("playtube-uploads/") || trimmed.startsWith("playtube-videos/")) {
      return `${cleanUrl}/storage/v1/object/public/${trimmed}`;
    }
    // Default bucket for general uploads
    return `${cleanUrl}/storage/v1/object/public/playtube-uploads/${trimmed}`;
  }

  // Fallback: prefix with leading slash if it's a relative path on local filesystem
  return `/${trimmed}`;
}
