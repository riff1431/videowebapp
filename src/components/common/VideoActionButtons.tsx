"use client";

import React, { useState } from "react";
import { ThumbsUp, ThumbsDown, Share2, Bookmark, Bell, Check, Flag } from "lucide-react";
import { toggleLikeVideoAction, toggleSubscribeAction } from "@/modules/videos/video.actions";
import { reportVideoAction } from "@/modules/admin/reports.actions";

interface VideoActionButtonsProps {
  videoDbId: number;
  channelUserId: number;
  initialLikes?: number;
  initialDislikes?: number;
}

export function VideoActionButtons({
  videoDbId,
  channelUserId,
  initialLikes = 0,
  initialDislikes = 0,
}: VideoActionButtonsProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [userVote, setUserVote] = useState<1 | 2 | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState<"video" | "copyright">("video");
  const [reportText, setReportText] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  async function handleVote(type: 1 | 2) {
    if (userVote === type) {
      setUserVote(null);
      if (type === 1) setLikes((l) => Math.max(0, l - 1));
      else setDislikes((d) => Math.max(0, d - 1));
    } else {
      if (type === 1) {
        setLikes((l) => l + 1);
        if (userVote === 2) setDislikes((d) => Math.max(0, d - 1));
      } else {
        setDislikes((d) => d + 1);
        if (userVote === 1) setLikes((l) => Math.max(0, l - 1));
      }
      setUserVote(type);
    }

    await toggleLikeVideoAction({ videoDbId, type });
  }

  async function handleSubscribe() {
    setIsSubscribed(!isSubscribed);
    await toggleSubscribeAction({ channelUserId });
  }

  function handleShare() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleReportSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reportText.trim() || reportSubmitting) return;

    setReportSubmitting(true);
    let res;
    if (reportType === "copyright") {
      const { reportCopyrightAction } = await import("@/modules/admin/reports.actions");
      res = await reportCopyrightAction({
        videoId: videoDbId,
        text: reportText,
      });
    } else {
      res = await reportVideoAction({
        videoId: videoDbId,
        text: reportText,
      });
    }

    setReportSubmitting(false);
    if (res.success) {
      setReportSuccess(true);
      setTimeout(() => {
        setReportSuccess(false);
        setReportModalOpen(false);
        setReportText("");
      }, 1500);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[var(--border)]">
        {/* Subscribe Button - PlayTube Cyan Styling */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSubscribe}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer shadow-xs ${
              isSubscribed
                ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200"
                : "bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white"
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>{isSubscribed ? "Subscribed" : "Subscribe"}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Like / Dislike Pills */}
          <div className="flex items-center rounded-md bg-neutral-100 dark:bg-neutral-800 border border-[var(--border)] overflow-hidden">
            <button
              onClick={() => handleVote(1)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                userVote === 1
                  ? "text-[var(--primary)] bg-sky-50 dark:bg-sky-950/40"
                  : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>{likes.toLocaleString()}</span>
            </button>
            <div className="w-[1px] h-4 bg-neutral-300 dark:bg-neutral-700" />
            <button
              onClick={() => handleVote(2)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                userVote === 2
                  ? "text-red-500 bg-red-50 dark:bg-red-950/40"
                  : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              }`}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              {dislikes > 0 && <span>{dislikes}</span>}
            </button>
          </div>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-[var(--border)] text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Share"}</span>
          </button>

          {/* Save / Watch Later Button */}
          <button
            onClick={() => setIsSaved(!isSaved)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--border)] text-xs font-semibold transition-colors cursor-pointer ${
              isSaved
                ? "bg-sky-50 text-[var(--primary)] border-[var(--primary)]"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{isSaved ? "Saved" : "Save"}</span>
          </button>

          {/* Report Video / Copyright Button */}
          <button
            onClick={() => setReportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-[var(--border)] text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-red-500 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
            title="Report this video"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Report</span>
          </button>
        </div>
      </div>

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#2f333a] rounded-lg max-w-md w-full p-5 shadow-2xl">
            <h5 className="text-base font-bold text-neutral-900 dark:text-white mb-1">
              Report Video
            </h5>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
              Please tell us why you are reporting this video to the administrators.
            </p>

            {reportSuccess ? (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded text-emerald-600 dark:text-emerald-400 text-xs font-medium text-center">
                Your report has been submitted to the moderators. Thank you!
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Report Type
                  </label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value as "video" | "copyright")}
                    className="w-full h-9 px-3 text-xs bg-white dark:bg-[#1a1c20] border border-neutral-300 dark:border-[#2f333a] rounded focus:outline-none text-neutral-900 dark:text-white"
                  >
                    <option value="video">Inappropriate Content / Policy Violation</option>
                    <option value="copyright">Copyright Infringement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Details / Reason
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={reportText}
                    onChange={(e) => setReportText(e.target.value)}
                    placeholder="Provide specific timestamps or reasons..."
                    className="w-full p-2.5 text-xs bg-white dark:bg-[#1a1c20] border border-neutral-300 dark:border-[#2f333a] rounded focus:outline-none focus:border-[#00adef] text-neutral-900 dark:text-white resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    className="px-4 py-2 text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reportSubmitting || !reportText.trim()}
                    className="px-4 py-2 text-xs text-white bg-[#00adef] hover:bg-[#009bd6] disabled:opacity-50 rounded font-medium transition-colors"
                  >
                    {reportSubmitting ? "Submitting..." : "Submit Report"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
