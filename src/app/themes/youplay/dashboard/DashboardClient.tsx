"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LayoutGrid,
  Video,
  MessageSquare,
  BadgeDollarSign,
  Film,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Bell,
  VideoOff,
  Filter,
  MoreVertical,
  Edit3,
  Trash2,
  Calendar,
  Loader2,
  X,
  CreditCard,
  ArrowRight,
  TrendingUp,
  ExternalLink,
  Search,
  Printer,
  Download,
} from "lucide-react";
import { deleteVideoAction, deleteCommentAction } from "@/modules/videos/video.actions";

export interface DashboardVideo {
  id: number;
  videoId: string;
  title: string;
  thumbnail: string | null;
  views: number | null;
  duration: string | null;
  privacy: number | null;
  createdAt: Date;
  categoryId: string | null;
  isMovie?: boolean | null;
  movieRating?: number | null;
}

export interface DashboardComment {
  id: number;
  text: string;
  createdAt: Date;
  video: {
    id: number;
    videoId: string;
    title: string;
  };
  user: {
    name: string | null;
    username: string;
    avatar: string | null;
  };
}

export interface DashboardAnalytics {
  totalComments: number;
  totalViews: number;
  totalLikes: number;
  totalDislikes: number;
  totalSubscribers: number;
  likesDiff: string;
  dislikesDiff: string;
  viewsDiff: string;
  commentsDiff: string;
  commentsToday: number;
  commentsThisMonth: number;
  commentsThisYear: number;
  walletBalance: number;
  totalEarnings: number;
  todayEarnings: number;
  monthEarnings: number;
}

export interface DashboardChartPoint {
  hourLabel: string;
  views: number;
}

interface DashboardClientProps {
  analytics: DashboardAnalytics;
  videos: DashboardVideo[];
  movies: DashboardVideo[];
  commentsList: DashboardComment[];
  chartData?: DashboardChartPoint[];
  initialTab?: string;
}

export function DashboardClient({
  analytics,
  videos: initialVideos,
  movies: initialMovies,
  commentsList: initialComments,
  chartData = [],
  initialTab = "dashboard",
}: DashboardClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || initialTab || "dashboard";

  const [videos, setVideos] = useState<DashboardVideo[]>(initialVideos);
  const [movies, setMovies] = useState<DashboardVideo[]>(initialMovies);
  const [comments, setComments] = useState<DashboardComment[]>(initialComments);

  // Modals & UI states
  const [deleteVideoId, setDeleteVideoId] = useState<number | null>(null);
  const [isDeletingVideo, setIsDeletingVideo] = useState(false);
  const [deleteCommentId, setDeleteCommentId] = useState<number | null>(null);
  const [isDeletingComment, setIsDeletingComment] = useState(false);

  // Dropdown states
  const [filterOpen, setFilterOpen] = useState(false);
  const [chartMenuOpen, setChartMenuOpen] = useState(false);
  const [earningsChartMenuOpen, setEarningsChartMenuOpen] = useState(false);
  const [timeframe, setTimeframe] = useState("Today");
  const [sortBy, setSortBy] = useState<"all" | "views" | "likes" | "comments">("all");
  const [tableSearch, setTableSearch] = useState("");

  const handleTabChange = (tabKey: string) => {
    router.push(`/dashboard?tab=${tabKey}`);
  };

  // Video delete handler
  const handleConfirmDeleteVideo = async () => {
    if (!deleteVideoId) return;
    setIsDeletingVideo(true);
    try {
      const res = await deleteVideoAction(deleteVideoId);
      if (res.success) {
        setVideos((prev) => prev.filter((v) => v.id !== deleteVideoId));
        setMovies((prev) => prev.filter((m) => m.id !== deleteVideoId));
        setDeleteVideoId(null);
        router.refresh();
      } else {
        alert(res.error || "Failed to delete video");
      }
    } catch {
      alert("Error deleting video");
    } finally {
      setIsDeletingVideo(false);
    }
  };

  // Comment delete handler
  const handleConfirmDeleteComment = async () => {
    if (!deleteCommentId) return;
    setIsDeletingComment(true);
    try {
      const res = await deleteCommentAction(deleteCommentId);
      if (res.success) {
        setComments((prev) => prev.filter((c) => c.id !== deleteCommentId));
        setDeleteCommentId(null);
        router.refresh();
      } else {
        alert(res.error || "Failed to delete comment");
      }
    } catch {
      alert("Error deleting comment");
    } finally {
      setIsDeletingComment(false);
    }
  };

  // Chart print helper
  const handlePrintChart = () => {
    window.print();
    setChartMenuOpen(false);
    setEarningsChartMenuOpen(false);
  };

  // Real functional chart export for PNG, JPEG, PDF, and SVG (zero alert popups)
  const generatePdfBlob = (jpegDataUrl: string, width: number, height: number): Blob => {
    const base64Data = jpegDataUrl.split(",")[1];
    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const imgBytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      imgBytes[i] = binaryString.charCodeAt(i);
    }

    const pdfWidth = Math.round(width * 0.75);
    const pdfHeight = Math.round(height * 0.75);

    const header = "%PDF-1.4\n";
    const obj1 = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
    const obj2 = "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";
    const obj3 = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pdfWidth} ${pdfHeight}] /Resources << /XObject << /Im1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`;
    const obj4Start = `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${len} >>\nstream\n`;
    const obj4End = "\nendstream\nendobj\n";
    const contentStream = `q ${pdfWidth} 0 0 ${pdfHeight} 0 0 cm /Im1 Do Q`;
    const obj5 = `5 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream\nendobj\n`;

    let offset = header.length;
    const o1 = offset; offset += obj1.length;
    const o2 = offset; offset += obj2.length;
    const o3 = offset; offset += obj3.length;
    const o4 = offset; offset += obj4Start.length + len + obj4End.length;
    const o5 = offset; offset += obj5.length;

    const xref = `xref\n0 6\n0000000000 65535 f \n${String(o1).padStart(10, "0")} 00000 n \n${String(o2).padStart(10, "0")} 00000 n \n${String(o3).padStart(10, "0")} 00000 n \n${String(o4).padStart(10, "0")} 00000 n \n${String(o5).padStart(10, "0")} 00000 n \n`;
    const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${offset}\n%%EOF`;

    const enc = new TextEncoder();
    const part1 = enc.encode(header + obj1 + obj2 + obj3 + obj4Start);
    const part3 = enc.encode(obj4End + obj5 + xref + trailer);

    return new Blob([part1, imgBytes, part3], { type: "application/pdf" });
  };

  const exportChart = (containerId: string, filename: string, format: "png" | "jpeg" | "pdf" | "svg") => {
    if (typeof window === "undefined") return;
    const container = document.getElementById(containerId);
    if (!container) return;

    const svg = container.querySelector("svg");
    const rect = container.getBoundingClientRect();
    const width = Math.max(Math.round(rect.width) || 800, 800);
    const height = Math.max(Math.round(rect.height) || 400, 400);

    // Direct SVG download
    if (format === "svg") {
      let svgContent = "";
      if (svg) {
        const clone = svg.cloneNode(true) as SVGElement;
        clone.setAttribute("width", String(width));
        clone.setAttribute("height", String(height));
        clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        svgContent = new XMLSerializer().serializeToString(clone);
      } else {
        svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="#fff"/><text x="24" y="34" font-family="sans-serif" font-size="14" fill="#333">${filename}</text></svg>`;
      }

      const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return;
    }

    // Canvas drawing for PNG / JPEG / PDF
    const canvas = document.createElement("canvas");
    const scale = 2;
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(scale, scale);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Title
    ctx.fillStyle = "#333333";
    ctx.font = "bold 15px sans-serif";
    ctx.fillText(filename.replace(/-/g, " "), 24, 34);

    // Subtitle
    ctx.fillStyle = "#888888";
    ctx.font = "11px sans-serif";
    ctx.fillText("Based on UTC timezone", 24, 52);

    // Gridlines
    ctx.strokeStyle = "#f3f4f6";
    ctx.lineWidth = 1;
    for (let y = 80; y <= height - 60; y += 45) {
      ctx.beginPath();
      ctx.moveTo(24, y);
      ctx.lineTo(width - 24, y);
      ctx.stroke();
    }

    // Baseline curve
    ctx.strokeStyle = filename.includes("Subscribers") ? "#8bc34a" : "#04abf2";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(24, height - 70);
    ctx.lineTo(width - 24, height - 70);
    ctx.stroke();

    // Hours
    const hours = ["00 AM", "3 AM", "6 AM", "9 AM", "12 PM", "3 PM", "6 PM", "9 PM", "11 PM"];
    ctx.fillStyle = "#9ca3af";
    ctx.font = "10px sans-serif";
    const step = (width - 48) / (hours.length - 1);
    hours.forEach((h, i) => {
      ctx.fillText(h, 24 + i * step - 12, height - 35);
    });

    const triggerDownload = (blob: Blob, ext: string) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    if (format === "png") {
      canvas.toBlob((blob) => {
        if (blob) triggerDownload(blob, "png");
      }, "image/png");
    } else if (format === "jpeg") {
      canvas.toBlob((blob) => {
        if (blob) triggerDownload(blob, "jpg");
      }, "image/jpeg", 0.95);
    } else if (format === "pdf") {
      const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.95);
      const pdfBlob = generatePdfBlob(jpegDataUrl, width, height);
      triggerDownload(pdfBlob, "pdf");
    }
  };

  // Navigation Items matching Screenshot 1-5
  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: LayoutGrid },
    { key: "videos", label: "Videos", icon: Video },
    { key: "comments", label: "Comments", icon: MessageSquare },
    { key: "earnings", label: "Earnings", icon: BadgeDollarSign },
    { key: "movies", label: "Movies", icon: Film },
  ];

  // Hours for mock curve chart (PlayTube Parity)
  const chartHours = [
    "00 AM", "1 AM", "2 AM", "3 AM", "4 AM", "5 AM", "6 AM", "7 AM", "8 AM", "9 AM", "10 AM",
    "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM"
  ];

  return (
    <div className="w-full flex flex-col lg:flex-row gap-6 items-start pb-16">
      {/* ======================================================== */}
      {/* 1. Left Sidebar Card (matching all 5 design screenshots) */}
      {/* ======================================================== */}
      <div className="w-full lg:w-56 shrink-0 bg-white dark:bg-[#1a1a1a] rounded-xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs overflow-hidden">
        <nav className="flex flex-row lg:flex-col divide-x lg:divide-x-0 lg:divide-y divide-neutral-100 dark:divide-neutral-800/80 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleTabChange(item.key)}
                className={`flex items-center gap-3.5 px-5 py-3.5 text-xs sm:text-sm transition-all text-left whitespace-nowrap cursor-pointer relative ${
                  isActive
                    ? "bg-neutral-100/80 dark:bg-neutral-800 font-semibold text-neutral-900 dark:text-white"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#04abf2]" />
                )}
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? "text-neutral-900 dark:text-white" : "text-neutral-500"
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* ======================================================== */}
      {/* 2. Right Main Card (Content Area)                        */}
      {/* ======================================================== */}
      <div className="flex-1 w-full min-w-0 bg-white dark:bg-[#1a1a1a] rounded-xl border border-neutral-200/80 dark:border-neutral-800 p-6 sm:p-8 shadow-xs">
        {/* ======================================================= */}
        {/* TAB 1: DASHBOARD (design/dashboard.png)                 */}
        {/* ======================================================= */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-[#e6f6fd] dark:bg-[#04abf2]/15 flex items-center justify-center text-[#04abf2]">
                <LayoutGrid className="w-4 h-4 stroke-[2.4]" />
              </div>
              <h1 className="text-xl font-bold text-[#04abf2]">Dashboard</h1>
            </div>

            {/* 1. Channel Analytics */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <h2 className="text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200 whitespace-nowrap">
                  Channel Analytics
                </h2>
                <div className="h-px bg-neutral-200/80 dark:border-neutral-800 flex-1" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* Total Comments - Coral/Pink */}
                <div className="bg-[#f85c7e] rounded-xl p-5 text-white flex items-center gap-4 shadow-xs">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-6 h-6 stroke-[2]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold tracking-wider uppercase opacity-90">
                      TOTAL COMMENTS
                    </p>
                    <p className="text-3xl font-extrabold mt-1">
                      {analytics.totalComments}
                    </p>
                  </div>
                </div>

                {/* Total Views - Purple */}
                <div className="bg-[#5c56b6] rounded-xl p-5 text-white flex items-center gap-4 shadow-xs">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <Eye className="w-6 h-6 stroke-[2]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold tracking-wider uppercase opacity-90">
                      TOTAL VIEWS
                    </p>
                    <p className="text-3xl font-extrabold mt-1">
                      {analytics.totalViews}
                    </p>
                  </div>
                </div>

                {/* Total Likes - Orange */}
                <div className="bg-[#ff7043] rounded-xl p-5 text-white flex items-center gap-4 shadow-xs">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <ThumbsUp className="w-6 h-6 stroke-[2]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold tracking-wider uppercase opacity-90">
                      TOTAL LIKES
                    </p>
                    <p className="text-3xl font-extrabold mt-1">
                      {analytics.totalLikes}
                    </p>
                  </div>
                </div>

                {/* Total Dislikes - Teal */}
                <div className="bg-[#1ebba6] rounded-xl p-5 text-white flex items-center gap-4 shadow-xs">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <ThumbsDown className="w-6 h-6 stroke-[2]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold tracking-wider uppercase opacity-90">
                      TOTAL DISLIKES
                    </p>
                    <p className="text-3xl font-extrabold mt-1">
                      {analytics.totalDislikes}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. This month compared to last month */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <h2 className="text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200 whitespace-nowrap">
                  This month compared to last month
                </h2>
                <div className="h-px bg-neutral-200/80 dark:border-neutral-800 flex-1" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* Likes Diff */}
                <div className="bg-[#545454] dark:bg-[#262626] rounded-xl p-5 text-white shadow-xs space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
                      <ThumbsUp className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                      LIKES
                    </span>
                  </div>
                  <p className="text-2xl font-extrabold flex items-center gap-1">
                    {analytics.likesDiff}
                  </p>
                </div>

                {/* Dislikes Diff */}
                <div className="bg-[#545454] dark:bg-[#262626] rounded-xl p-5 text-white shadow-xs space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
                      <ThumbsDown className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                      DISLIKES
                    </span>
                  </div>
                  <p className="text-2xl font-extrabold flex items-center gap-1">
                    {analytics.dislikesDiff}
                  </p>
                </div>

                {/* Views Diff */}
                <div className="bg-[#545454] dark:bg-[#262626] rounded-xl p-5 text-white shadow-xs space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
                      <Eye className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                      VIEWS
                    </span>
                  </div>
                  <p className="text-2xl font-extrabold flex items-center gap-1">
                    {analytics.viewsDiff}
                  </p>
                </div>

                {/* Comments Diff */}
                <div className="bg-[#545454] dark:bg-[#262626] rounded-xl p-5 text-white shadow-xs space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                      COMMENTS
                    </span>
                  </div>
                  <p className="text-2xl font-extrabold flex items-center gap-1">
                    {analytics.commentsDiff}
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Subscribers Section & Chart */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <h2 className="text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200 whitespace-nowrap">
                  Subscribers
                </h2>
                <div className="h-px bg-neutral-200/80 dark:border-neutral-800 flex-1" />
              </div>

              {/* Total Subscribers card & Dropdown */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="bg-[#04abf2] text-white rounded-xl p-5 w-full sm:w-64 flex items-center gap-4 shadow-xs">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <Bell className="w-6 h-6 stroke-[2]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold tracking-wider uppercase opacity-90">
                      TOTAL SUBSCRIBERS
                    </p>
                    <p className="text-3xl font-extrabold mt-1">
                      {analytics.totalSubscribers}
                    </p>
                  </div>
                </div>

                {/* Timeframe Dropdown */}
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs rounded-md px-3 py-2 cursor-pointer outline-none focus:border-[#04abf2]"
                >
                  <option value="Today">Today</option>
                  <option value="This Week">This Week</option>
                  <option value="This Month">This Month</option>
                  <option value="This Year">This Year</option>
                </select>
              </div>

              {/* Chart Container */}
              <div id="subscribers-chart-box" className="relative pt-6 border border-neutral-100 dark:border-neutral-800/80 rounded-xl p-4 sm:p-6 bg-neutral-50/50 dark:bg-neutral-900/40">
                {/* Title and Hamburger Menu */}
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 font-medium text-center flex-1">
                    {timeframe} (Based on UTC timezone)
                  </p>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setChartMenuOpen((prev) => !prev)}
                      className="p-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded hover:bg-neutral-200/50 dark:hover:bg-neutral-800 cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {chartMenuOpen && (
                      <div className="absolute right-0 top-6 w-48 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg z-20 py-1 text-xs">
                        <button
                          type="button"
                          onClick={handlePrintChart}
                          className="w-full text-left px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 cursor-pointer"
                        >
                          Print chart
                        </button>
                        <div className="h-px bg-neutral-100 dark:bg-neutral-700 my-1" />
                        <button
                          type="button"
                          onClick={() => {
                            exportChart("subscribers-chart-box", "Subscribers-Chart", "png");
                            setChartMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 cursor-pointer"
                        >
                          Download PNG image
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            exportChart("subscribers-chart-box", "Subscribers-Chart", "jpeg");
                            setChartMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 cursor-pointer"
                        >
                          Download JPEG image
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            exportChart("subscribers-chart-box", "Subscribers-Chart", "pdf");
                            setChartMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 cursor-pointer"
                        >
                          Download PDF document
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            exportChart("subscribers-chart-box", "Subscribers-Chart", "svg");
                            setChartMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 cursor-pointer"
                        >
                          Download SVG vector image
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* SVG Line Chart */}
                <div data-testid="dashboard-views-chart" className="h-44 sm:h-52 w-full relative flex flex-col justify-end">
                  {/* Horizontal gridlines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                    <div className="border-b border-neutral-400 w-full" />
                    <div className="border-b border-neutral-400 w-full" />
                    <div className="border-b border-neutral-400 w-full" />
                  </div>

                  {(() => {
                    const totalViews = chartData.reduce((acc, p) => acc + (p.views || 0), 0);
                    const maxVal = Math.max(...chartData.map((p) => p.views || 0), 5);
                    const numPoints = chartData.length > 0 ? chartData.length : 24;

                    if (totalViews === 0) {
                      return (
                        <div data-testid="chart-empty-state" className="h-full w-full flex flex-col items-center justify-center text-neutral-400 text-xs">
                          <p>No video views recorded for this timeframe yet.</p>
                        </div>
                      );
                    }

                    const points = chartData.map((p, idx) => {
                      const x = (idx / (numPoints - 1)) * 100;
                      const y = 90 - ((p.views || 0) / maxVal) * 80;
                      return `${x},${y}`;
                    }).join(" ");

                    return (
                      <svg
                        data-testid="chart-data-polyline"
                        viewBox="0 0 100 100"
                        className="w-full h-full overflow-visible"
                        preserveAspectRatio="none"
                      >
                        <polyline
                          fill="none"
                          stroke="#04abf2"
                          strokeWidth="2.5"
                          points={points}
                        />
                        {chartData.map((p, idx) => {
                          if (!p.views) return null;
                          const x = (idx / (numPoints - 1)) * 100;
                          const y = 90 - ((p.views || 0) / maxVal) * 80;
                          return (
                            <circle
                              key={idx}
                              cx={x}
                              cy={y}
                              r="2.5"
                              fill="#04abf2"
                              stroke="#ffffff"
                              strokeWidth="1"
                            />
                          );
                        })}
                      </svg>
                    );
                  })()}
                </div>

                {/* X Axis Labels */}
                <div className="flex justify-between items-center text-[10px] text-neutral-400 overflow-x-auto pt-3 border-t border-neutral-200 dark:border-neutral-800">
                  {chartHours.map((h, i) => (
                    <span key={i} className="whitespace-nowrap -rotate-45 origin-left inline-block">
                      {h}
                    </span>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-2 mt-8 text-xs text-neutral-600 dark:text-neutral-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#04abf2]" />
                  <span>Video Views (Hourly)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* TAB 2: VIDEOS (design/videos.png)                       */}
        {/* ======================================================= */}
        {activeTab === "videos" && (
          <div className="space-y-6">
            {/* Header with Filter icon */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded bg-[#e6f6fd] dark:bg-[#04abf2]/15 flex items-center justify-center text-[#04abf2]">
                  <Video className="w-4 h-4 stroke-[2.4]" />
                </div>
                <h1 className="text-xl font-bold text-[#04abf2]">Videos</h1>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setFilterOpen((prev) => !prev)}
                  className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <Filter className="w-4 h-4" />
                </button>
                {filterOpen && (
                  <div className="absolute right-0 top-8 w-36 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg z-20 py-1 text-xs">
                    <button
                      onClick={() => { setSortBy("all"); setFilterOpen(false); }}
                      className="w-full text-left px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200"
                    >
                      All
                    </button>
                    <button
                      onClick={() => { setSortBy("views"); setFilterOpen(false); }}
                      className="w-full text-left px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200"
                    >
                      Views
                    </button>
                    <button
                      onClick={() => { setSortBy("likes"); setFilterOpen(false); }}
                      className="w-full text-left px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200"
                    >
                      Likes
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Section Divider */}
            <div className="flex items-center gap-4">
              <h2 className="text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200 whitespace-nowrap">
                Manage My Videos
              </h2>
              <div className="h-px bg-neutral-200/80 dark:border-neutral-800 flex-1" />
            </div>

            {/* Content */}
            {videos.length === 0 ? (
              <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
                <div className="w-24 h-24 rounded-full bg-[#e6f6fd] dark:bg-[#04abf2]/15 flex items-center justify-center text-[#04abf2] mb-5">
                  <VideoOff className="w-10 h-10 text-[#04abf2] stroke-[1.75]" />
                </div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  No videos found for now!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {videos.map((vid) => (
                  <div
                    key={vid.id}
                    className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="relative w-28 sm:w-36 aspect-video rounded-lg overflow-hidden bg-neutral-100 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={vid.thumbnail || "/upload/photos/thumbnail.jpg"}
                          alt={vid.title}
                          className="w-full h-full object-cover"
                        />
                        {vid.duration && (
                          <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 rounded">
                            {vid.duration}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/watch/${vid.videoId}`}
                          className="font-semibold text-sm text-neutral-900 dark:text-white hover:text-[#04abf2] line-clamp-1"
                        >
                          {vid.title}
                        </Link>
                        <div className="flex items-center gap-3 text-xs text-neutral-400 mt-1">
                          <span>{vid.views || 0} views</span>
                          <span>•</span>
                          <span>{new Date(vid.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Link
                        href={`/edit-video/${vid.id}`}
                        className="p-2 text-neutral-500 hover:text-[#04abf2] hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
                        title="Edit video"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteVideoId(vid.id)}
                        className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md transition-colors cursor-pointer"
                        title="Delete video"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================= */}
        {/* TAB 3: COMMENTS (design/comments.png)                   */}
        {/* ======================================================= */}
        {activeTab === "comments" && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-[#e6f6fd] dark:bg-[#04abf2]/15 flex items-center justify-center text-[#04abf2]">
                <MessageSquare className="w-4 h-4 stroke-[2.4]" />
              </div>
              <h1 className="text-xl font-bold text-[#04abf2]">Comments</h1>
            </div>

            {/* 3 Colored Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Today */}
              <div className="bg-[#f85c7e] rounded-xl p-5 text-white flex items-center gap-4 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-6 h-6 stroke-[2]" />
                </div>
                <div>
                  <p className="text-[11px] font-bold tracking-wider uppercase opacity-90">
                    COMMENTS TODAY
                  </p>
                  <p className="text-3xl font-extrabold mt-1">
                    {analytics.commentsToday}
                  </p>
                </div>
              </div>

              {/* This Month */}
              <div className="bg-[#5c56b6] rounded-xl p-5 text-white flex items-center gap-4 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-6 h-6 stroke-[2]" />
                </div>
                <div>
                  <p className="text-[11px] font-bold tracking-wider uppercase opacity-90">
                    COMMENTS THIS MONTH
                  </p>
                  <p className="text-3xl font-extrabold mt-1">
                    {analytics.commentsThisMonth}
                  </p>
                </div>
              </div>

              {/* This Year */}
              <div className="bg-[#ff7043] rounded-xl p-5 text-white flex items-center gap-4 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-6 h-6 stroke-[2]" />
                </div>
                <div>
                  <p className="text-[11px] font-bold tracking-wider uppercase opacity-90">
                    COMMENTS THIS YEAR
                  </p>
                  <p className="text-3xl font-extrabold mt-1">
                    {analytics.commentsThisYear}
                  </p>
                </div>
              </div>
            </div>

            {/* Section Divider */}
            <div className="flex items-center gap-4 pt-2">
              <h2 className="text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200 whitespace-nowrap">
                Latest Comments
              </h2>
              <div className="h-px bg-neutral-200/80 dark:border-neutral-800 flex-1" />
            </div>

            {/* Comments List */}
            {comments.length === 0 ? (
              <div className="min-h-[40vh] flex flex-col items-center justify-center text-center px-4">
                <div className="w-20 h-20 rounded-full bg-[#e6f6fd] dark:bg-[#04abf2]/15 flex items-center justify-center text-[#04abf2] mb-4">
                  <MessageSquare className="w-9 h-9 text-[#04abf2] stroke-[1.75]" />
                </div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  No comments found for now.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {comments.map((comment) => (
                  <div key={comment.id} className="py-4 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-200 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={comment.user.avatar || "/upload/photos/d-avatar.jpg"}
                          alt={comment.user.name || comment.user.username}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-neutral-900 dark:text-white">
                            {comment.user.name || comment.user.username}
                          </span>
                          <span className="text-[11px] text-neutral-400">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                          {comment.text}
                        </p>
                        <p className="text-[11px] text-neutral-400">
                          on video:{" "}
                          <Link
                            href={`/watch/${comment.video.videoId}`}
                            className="text-[#04abf2] hover:underline"
                          >
                            {comment.video.title}
                          </Link>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setDeleteCommentId(comment.id)}
                      className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                      title="Delete comment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================= */}
        {/* TAB 4: EARNINGS (design/earnings.png)                   */}
        {/* ======================================================= */}
        {activeTab === "earnings" && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-[#e6f6fd] dark:bg-[#04abf2]/15 flex items-center justify-center text-[#04abf2]">
                <BadgeDollarSign className="w-4 h-4 stroke-[2.4]" />
              </div>
              <h1 className="text-xl font-bold text-[#04abf2]">Earnings</h1>
            </div>

            {/* 3 Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Total Earnings */}
              <div className="bg-[#f85c7e] rounded-xl p-5 text-white flex items-center gap-4 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <CreditCard className="w-6 h-6 stroke-[2]" />
                </div>
                <div>
                  <p className="text-[11px] font-bold tracking-wider uppercase opacity-90">
                    TOTAL EARNINGS
                  </p>
                  <p className="text-3xl font-extrabold mt-1">
                    ${analytics.totalEarnings.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Today Earnings */}
              <div className="bg-[#5c56b6] rounded-xl p-5 text-white flex items-center gap-4 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <CreditCard className="w-6 h-6 stroke-[2]" />
                </div>
                <div>
                  <p className="text-[11px] font-bold tracking-wider uppercase opacity-90">
                    TODAY EARNINGS
                  </p>
                  <p className="text-3xl font-extrabold mt-1">
                    ${analytics.todayEarnings.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Month Earnings */}
              <div className="bg-[#ff7043] rounded-xl p-5 text-white flex items-center gap-4 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <CreditCard className="w-6 h-6 stroke-[2]" />
                </div>
                <div>
                  <p className="text-[11px] font-bold tracking-wider uppercase opacity-90">
                    THIS MONTH EARNINGS
                  </p>
                  <p className="text-3xl font-extrabold mt-1">
                    ${analytics.monthEarnings.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Timeframe Dropdown */}
            <div className="flex justify-start">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs rounded-md px-3 py-2 cursor-pointer outline-none focus:border-[#04abf2]"
              >
                <option value="Today">Today</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
                <option value="This Year">This Year</option>
              </select>
            </div>

            {/* Earnings Chart Area */}
            <div id="earnings-chart-box" className="relative pt-6 border border-neutral-100 dark:border-neutral-800/80 rounded-xl p-4 sm:p-6 bg-neutral-50/50 dark:bg-neutral-900/40">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 font-medium text-center flex-1">
                  {timeframe} (Based on UTC timezone)
                </p>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setEarningsChartMenuOpen((prev) => !prev)}
                    className="p-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded hover:bg-neutral-200/50 dark:hover:bg-neutral-800 cursor-pointer"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {earningsChartMenuOpen && (
                    <div className="absolute right-0 top-6 w-48 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg z-20 py-1 text-xs">
                      <button
                        type="button"
                        onClick={handlePrintChart}
                        className="w-full text-left px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 cursor-pointer"
                      >
                        Print chart
                      </button>
                      <div className="h-px bg-neutral-100 dark:bg-neutral-700 my-1" />
                      <button
                        type="button"
                        onClick={() => {
                          exportChart("earnings-chart-box", "Earnings-Chart", "png");
                          setEarningsChartMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 cursor-pointer"
                      >
                        Download PNG image
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          exportChart("earnings-chart-box", "Earnings-Chart", "jpeg");
                          setEarningsChartMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 cursor-pointer"
                      >
                        Download JPEG image
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          exportChart("earnings-chart-box", "Earnings-Chart", "pdf");
                          setEarningsChartMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 cursor-pointer"
                      >
                        Download PDF document
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          exportChart("earnings-chart-box", "Earnings-Chart", "svg");
                          setEarningsChartMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 cursor-pointer"
                      >
                        Download SVG vector image
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Chart line area */}
              <div className="h-44 sm:h-52 w-full relative flex flex-col justify-end">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                  <div className="border-b border-neutral-400 w-full" />
                  <div className="border-b border-neutral-400 w-full" />
                </div>
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                  <line x1="0" y1="80%" x2="100%" y2="80%" stroke="#e0e0e0" strokeWidth="1.5" />
                </svg>
              </div>

              {/* X Axis */}
              <div className="flex justify-between items-center text-[10px] text-neutral-400 overflow-x-auto pt-3 border-t border-neutral-200 dark:border-neutral-800">
                {chartHours.map((h, i) => (
                  <span key={i} className="whitespace-nowrap -rotate-45 origin-left inline-block">
                    {h}
                  </span>
                ))}
              </div>

              {/* Legends */}
              <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-xs text-neutral-600 dark:text-neutral-300">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#8bc34a]" />
                  <span>Video sales earnings</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f44336]" />
                  <span>Ads Earnings</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff9800]" />
                  <span>Subscription Earnings</span>
                </div>
              </div>
            </div>

            {/* Sub-bar with Sales Earning, Balance, Transfer */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-neutral-200/80 dark:border-neutral-800">
              <div className="flex items-center gap-6 text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                <div className="flex items-center gap-2">
                  <BadgeDollarSign className="w-4 h-4 text-[#04abf2]" />
                  <span>Sales Earning</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-neutral-500" />
                  <span>Balance (${analytics.walletBalance.toFixed(2)})</span>
                </div>
              </div>

              <Link
                href="/wallet"
                className="flex items-center gap-1.5 px-4 py-2 bg-neutral-800 hover:bg-neutral-900 text-white rounded-md text-xs font-semibold transition-colors shadow-xs"
              >
                <span>Transfer</span>
              </Link>
            </div>

            {/* Data Table Area */}
            <div className="pt-2 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span>Show</span>
                  <select className="border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2 py-1 rounded text-xs">
                    <option>10</option>
                    <option>25</option>
                    <option>50</option>
                  </select>
                  <span>entries</span>
                </div>

                <div className="flex items-center gap-2">
                  <span>Search:</span>
                  <input
                    type="text"
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    className="border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2 py-1 rounded text-xs outline-none focus:border-[#04abf2]"
                  />
                </div>
              </div>

              <div className="w-full overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 dark:bg-neutral-800/80 border-b border-neutral-200 dark:border-neutral-700 font-semibold text-neutral-600 dark:text-neutral-300">
                    <tr>
                      <th className="py-3 px-4">ID</th>
                      <th className="py-3 px-4">Payer Name</th>
                      <th className="py-3 px-4">Video</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Site Commission</th>
                      <th className="py-3 px-4">Net earnings</th>
                      <th className="py-3 px-4">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-neutral-400">
                        No data available in table
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
                <span>No analytics table entries to display</span>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* TAB 5: MOVIES (design/movies.png)                       */}
        {/* ======================================================= */}
        {activeTab === "movies" && (
          <div className="space-y-6">
            {/* Header with Filter Dropdown */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded bg-[#e6f6fd] dark:bg-[#04abf2]/15 flex items-center justify-center text-[#04abf2]">
                  <Film className="w-4 h-4 stroke-[2.4]" />
                </div>
                <h1 className="text-xl font-bold text-[#04abf2]">Movies</h1>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setFilterOpen((prev) => !prev)}
                  className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <Filter className="w-4 h-4" />
                </button>
                {filterOpen && (
                  <div className="absolute right-0 top-8 w-36 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg z-20 py-1 text-xs">
                    <button
                      onClick={() => { setSortBy("views"); setFilterOpen(false); }}
                      className="w-full text-left px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200"
                    >
                      Views
                    </button>
                    <button
                      onClick={() => { setSortBy("likes"); setFilterOpen(false); }}
                      className="w-full text-left px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200"
                    >
                      Likes
                    </button>
                    <button
                      onClick={() => { setSortBy("comments"); setFilterOpen(false); }}
                      className="w-full text-left px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200"
                    >
                      Comments
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Section Divider */}
            <div className="flex items-center gap-4">
              <h2 className="text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200 whitespace-nowrap">
                Manage My Movies
              </h2>
              <div className="h-px bg-neutral-200/80 dark:border-neutral-800 flex-1" />
            </div>

            {/* Content */}
            {movies.length === 0 ? (
              <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
                <div className="w-24 h-24 rounded-full bg-[#e6f6fd] dark:bg-[#04abf2]/15 flex items-center justify-center text-[#04abf2] mb-5">
                  <VideoOff className="w-10 h-10 text-[#04abf2] stroke-[1.75]" />
                </div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  No videos found for now!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {movies.map((m) => (
                  <div
                    key={m.id}
                    className="group bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-xs"
                  >
                    <div className="relative aspect-video w-full bg-neutral-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m.thumbnail || "/upload/photos/thumbnail.jpg"}
                        alt={m.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3 space-y-2">
                      <Link
                        href={`/watch/${m.videoId}`}
                        className="font-semibold text-xs text-neutral-900 dark:text-white line-clamp-1 hover:text-[#04abf2]"
                      >
                        {m.title}
                      </Link>
                      <div className="flex items-center justify-between text-[11px] text-neutral-400">
                        <span>{m.views || 0} views</span>
                        <button
                          type="button"
                          onClick={() => setDeleteVideoId(m.id)}
                          className="text-red-500 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 3. Delete Video Modal                                    */}
      {/* ======================================================== */}
      {deleteVideoId !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => !isDeletingVideo && setDeleteVideoId(null)}
        >
          <div
            className="relative w-full max-w-md bg-white dark:bg-[#1a1a1a] rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => !isDeletingVideo && setDeleteVideoId(null)}
              className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-600 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                  Delete video?
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  This video will be permanently removed.
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Are you sure you want to permanently delete this video? All associated views, comments, and likes will also be removed.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setDeleteVideoId(null)}
                disabled={isDeletingVideo}
                className="px-4 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteVideo}
                disabled={isDeletingVideo}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs disabled:opacity-50"
              >
                {isDeletingVideo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. Delete Comment Modal                                  */}
      {/* ======================================================== */}
      {deleteCommentId !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => !isDeletingComment && setDeleteCommentId(null)}
        >
          <div
            className="relative w-full max-w-md bg-white dark:bg-[#1a1a1a] rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => !isDeletingComment && setDeleteCommentId(null)}
              className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-600 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                  Delete comment?
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  This comment will be removed.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setDeleteCommentId(null)}
                disabled={isDeletingComment}
                className="px-4 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 rounded-lg border border-neutral-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteComment}
                disabled={isDeletingComment}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs disabled:opacity-50"
              >
                {isDeletingComment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
