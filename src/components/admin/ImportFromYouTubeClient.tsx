"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { importVideosAction, ImportedVideoPayload } from "@/modules/admin/videos.actions";
import { ExternalLink, Check, AlertCircle } from "lucide-react";

interface YouTubeVideoCard {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  tags: string;
  selected: boolean;
}

interface ImportFromYouTubeClientProps {
  categoriesList: { key: string; name: string }[];
  ytApiKeyConfigured: boolean;
}

export function ImportFromYouTubeClient({
  categoriesList,
  ytApiKeyConfigured,
}: ImportFromYouTubeClientProps) {
  const [keyword, setKeyword] = useState("");
  const [searchType, setSearchType] = useState<"public" | "channel">("public");
  const [limit, setLimit] = useState("50");
  const [categoryId, setCategoryId] = useState(categoriesList[0]?.key || "other");
  const [autoImport, setAutoImport] = useState("0");
  const [username, setUsername] = useState("");
  const [videos, setVideos] = useState<YouTubeVideoCard[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setIsSearching(true);
    setErrorText(null);
    setImportStatus(null);

    try {
      // Call public or backend API endpoint to query YouTube Data API
      const res = await fetch(
        `/api/admin/import/youtube?query=${encodeURIComponent(
          keyword
        )}&type=${searchType}&limit=${limit}`
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorText(data.error || "Failed to fetch videos from YouTube");
        setVideos([]);
      } else {
        const fetchedVideos: YouTubeVideoCard[] = (data.items || []).map((v: any) => ({
          id: v.id,
          title: v.title,
          description: v.description,
          thumbnail: v.thumbnail,
          duration: v.duration || "00:00",
          tags: v.tags || "",
          selected: true,
        }));
        setVideos(fetchedVideos);

        // If Auto import is on, trigger import right away
        if (autoImport === "1" && fetchedVideos.length > 0) {
          executeImport(fetchedVideos);
        }
      }
    } catch (err: any) {
      setErrorText(err.message || "Error connecting to YouTube API");
      setVideos([]);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleSelectVideo = (id: string) => {
    setVideos((prev) =>
      prev.map((v) => (v.id === id ? { ...v, selected: !v.selected } : v))
    );
  };

  const updateVideoTitle = (id: string, newTitle: string) => {
    setVideos((prev) =>
      prev.map((v) => (v.id === id ? { ...v, title: newTitle } : v))
    );
  };

  const updateVideoDescription = (id: string, newDesc: string) => {
    setVideos((prev) =>
      prev.map((v) => (v.id === id ? { ...v, description: newDesc } : v))
    );
  };

  const executeImport = (targetVideos?: YouTubeVideoCard[]) => {
    const listToImport = (targetVideos || videos).filter((v) => v.selected);
    if (listToImport.length === 0) {
      alert("No videos selected for import");
      return;
    }

    startTransition(async () => {
      const payload: ImportedVideoPayload[] = listToImport.map((v) => ({
        videoId: v.id,
        title: v.title,
        description: v.description,
        thumbnail: v.thumbnail,
        tags: v.tags,
        duration: v.duration,
        categoryId: categoryId,
        videoType: "youtube",
        videoLocation: `https://www.youtube.com/watch?v=${v.id}`,
        youtubeUrl: `https://www.youtube.com/watch?v=${v.id}`,
        username: username.trim() || undefined,
      }));

      const res = await importVideosAction(payload);
      if (res.success) {
        setImportStatus(`Successfully imported ${res.count} videos!`);
        // Remove imported from list
        setVideos((prev) => prev.filter((v) => !v.selected));
      } else {
        setErrorText(res.error || "Failed to import videos");
      }
    });
  };

  const selectedCount = videos.filter((v) => v.selected).length;

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumbs */}
      <div>
        <h3 className="text-xl font-bold text-neutral-800 dark:text-white">
          Import From YouTube
        </h3>
        <nav className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 flex items-center gap-1.5 font-medium">
          <Link href="/admin" className="text-[#04abf2] hover:underline">
            Admin Panel
          </Link>
          <span>/</span>
          <span>Videos</span>
          <span>/</span>
          <span>Import Videos</span>
          <span>/</span>
          <span className="text-neutral-700 dark:text-neutral-200">
            Import From YouTube
          </span>
        </nav>
      </div>

      {/* Warning Alert if needed */}
      {!ytApiKeyConfigured && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-sm text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            YouTube API Key is not set or empty. You can set it in Settings &gt; Import &amp; Upload Configuration. Search will run with mock/demo results.
          </span>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white dark:bg-[#1f2227] border border-neutral-200 dark:border-[#292d33] rounded-sm shadow-xs">
        <div className="p-4 border-b border-neutral-200 dark:border-[#292d33]">
          <h6 className="text-sm font-bold text-neutral-800 dark:text-white tracking-wide uppercase">
            Import Videos From YouTube
          </h6>
        </div>

        <form onSubmit={handleSearch} className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            {/* Keyword / Channel ID */}
            <div className="md:col-span-3 space-y-1">
              <label className="text-xs text-neutral-600 dark:text-neutral-300 font-medium block">
                {searchType === "public" ? "Keyword To Import" : "YouTube Channel ID"}
              </label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder=""
                className="w-full bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
                required
              />
            </div>

            {/* Search Type */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs text-neutral-600 dark:text-neutral-300 font-medium block">
                &nbsp;
              </label>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as any)}
                className="w-full bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2] cursor-pointer"
              >
                <option value="public">Public Search</option>
                <option value="channel">Import From Channel</option>
              </select>
            </div>

            {/* Limit Per Page */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs text-neutral-600 dark:text-neutral-300 font-medium block">
                &nbsp;
              </label>
              <select
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="w-full bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2] cursor-pointer"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50 (Default)</option>
              </select>
            </div>

            {/* Category */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs text-neutral-600 dark:text-neutral-300 font-medium block">
                &nbsp;
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2] cursor-pointer"
              >
                {categoriesList.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Manual / Auto Import */}
            {searchType === "public" && (
              <div className="md:col-span-3 space-y-1">
                <label className="text-xs text-neutral-600 dark:text-neutral-300 font-medium block">
                  &nbsp;
                </label>
                <select
                  value={autoImport}
                  onChange={(e) => setAutoImport(e.target.value)}
                  className="w-full bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2] cursor-pointer"
                >
                  <option value="0">Manual Import</option>
                  <option value="1">Auto Import (Auto Import After Loading)</option>
                </select>
              </div>
            )}

            {/* Import as Username */}
            <div className="md:col-span-3 space-y-1">
              <label className="text-xs text-neutral-600 dark:text-neutral-300 font-medium block">
                Import as (Username)
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Leave blank for admin"
                className="w-full bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
              />
            </div>

            {/* Search Button */}
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={isSearching}
                className="w-full py-2 bg-[#04abf2] hover:bg-[#0396d5] text-white text-xs font-semibold rounded transition-colors shadow-xs cursor-pointer"
              >
                {isSearching ? "Searching..." : "Search"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Messages */}
      {importStatus && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded text-xs font-medium flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{importStatus}</span>
        </div>
      )}

      {errorText && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{errorText}</span>
        </div>
      )}

      {/* Results Header and Cards matching Screenshot 1 */}
      {videos.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-bold text-neutral-800 dark:text-white">
              Videos ({videos.length})
            </h4>
            <button
              onClick={() => executeImport()}
              disabled={selectedCount === 0 || isPending}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded transition-colors shadow-xs cursor-pointer"
            >
              {isPending ? "Importing..." : `Import selected (${selectedCount})`}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {videos.map((v) => (
              <div
                key={v.id}
                className="bg-white dark:bg-[#1f2227] border border-neutral-200 dark:border-[#292d33] rounded-sm shadow-xs overflow-hidden flex flex-col justify-between"
              >
                <div className="relative group">
                  <a
                    href={`https://www.youtube.com/watch?v=${v.id}`}
                    target="_blank"
                    className="block relative aspect-video bg-neutral-100 dark:bg-neutral-800 overflow-hidden"
                  >
                    <img
                      src={v.thumbnail}
                      alt={v.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 text-white text-[10px] font-mono rounded">
                      {v.duration}
                    </span>
                  </a>
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div>
                      <label className="text-[11px] text-neutral-500 dark:text-neutral-400 font-semibold block mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={v.title}
                        onChange={(e) => updateVideoTitle(v.id, e.target.value)}
                        className="w-full bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-2.5 py-1.5 text-xs focus:outline-hidden focus:border-[#04abf2]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-neutral-500 dark:text-neutral-400 font-semibold block mb-1">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        value={v.description}
                        onChange={(e) => updateVideoDescription(v.id, e.target.value)}
                        className="w-full bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-2.5 py-1.5 text-xs focus:outline-hidden focus:border-[#04abf2]"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-100 dark:border-[#292d33] flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={v.selected}
                        onChange={() => toggleSelectVideo(v.id)}
                        className="rounded border-neutral-300 dark:border-neutral-700 text-[#04abf2] focus:ring-0 cursor-pointer"
                      />
                      <span className="font-medium">Import Video</span>
                    </label>

                    <a
                      href={`https://www.youtube.com/watch?v=${v.id}`}
                      target="_blank"
                      className="text-neutral-400 hover:text-[#04abf2] transition-colors"
                      title="View on YouTube"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-center">
            <button
              onClick={() => executeImport()}
              disabled={selectedCount === 0 || isPending}
              className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded transition-colors shadow-xs cursor-pointer"
            >
              {isPending ? "Importing..." : `Import selected (${selectedCount})`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
