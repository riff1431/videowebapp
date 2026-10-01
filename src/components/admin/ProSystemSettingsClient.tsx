"use client";

import React, { useState, useTransition, useRef } from "react";
import Link from "next/link";
import {
  Home,
  Check,
  AlertCircle,
  X,
  Paperclip,
  Shield,
  Users,
  UserCheck,
  Sliders,
  Edit,
  Trash2,
} from "lucide-react";
import {
  updateProSystemSettingsAction,
  createProPackageAction,
  updateProPackageAction,
  deleteProPackageAction,
  cancelExpiredSubscriptionsAction,
} from "@/modules/admin/pro.actions";

export interface ProPackageItem {
  id: number;
  type: string;
  price: number;
  featuredVideos: number;
  verifiedBadge: number;
  discount: number;
  image?: string;
  nightImage?: string;
  color: string;
  description: string;
  status: number;
  time: string;
  timeCount: number;
  maxUpload: string;
  features?: string;
}

interface ProSystemSettingsClientProps {
  initialConfig: Record<string, string>;
  initialPackages: ProPackageItem[];
}

const UPLOAD_SIZES = [
  { value: "2000000", label: "2 MB" },
  { value: "6000000", label: "6 MB" },
  { value: "12000000", label: "12 MB" },
  { value: "24000000", label: "24 MB" },
  { value: "48000000", label: "48 MB" },
  { value: "96000000", label: "96 MB" },
  { value: "256000000", label: "256 MB" },
  { value: "512000000", label: "512 MB" },
  { value: "1000000000", label: "1 GB" },
  { value: "5000000000", label: "5 GB" },
  { value: "10000000000", label: "10 GB" },
  { value: "1000000000000", label: "Unlimited" },
];

export function ProSystemSettingsClient({
  initialConfig,
  initialPackages,
}: ProSystemSettingsClientProps) {
  const [config, setConfig] = useState<Record<string, string>>(initialConfig);
  const [packages, setPackages] = useState<ProPackageItem[]>(initialPackages);
  const [alertMsg, setAlertMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showWhoCanDropdown, setShowWhoCanDropdown] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<ProPackageItem | null>(null);
  const [deletePackageId, setDeletePackageId] = useState<number | null>(null);

  // Form states for Add / Edit modal
  const [modalForm, setModalForm] = useState<{
    status: number;
    name: string;
    price: number;
    color: string;
    featuredVideos: number;
    verifiedBadge: number;
    maxUpload: string;
    discount: number;
    count: number;
    time: string;
    description: string;
    iconFile?: string;
    nightIconFile?: string;
  }>({
    status: 1,
    name: "",
    price: 0,
    color: "#2216C5",
    featuredVideos: 0,
    verifiedBadge: 0,
    maxUpload: "2000000",
    discount: 0,
    count: 0,
    time: "day",
    description: "",
  });

  const [modalError, setModalError] = useState<string | null>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const nightIconInputRef = useRef<HTMLInputElement>(null);

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>, field: "iconFile" | "nightIconFile") => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawUrl = event.target?.result as string;
        // Resize icon to standard 64x64 or max 128x128 via HTML5 Canvas
        const img = new Image();
        img.onload = () => {
          const maxDim = 128;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const optimizedBase64 = canvas.toDataURL("image/png");
            setModalForm((prev) => ({
              ...prev,
              [field]: optimizedBase64,
            }));
          } else {
            setModalForm((prev) => ({
              ...prev,
              [field]: rawUrl,
            }));
          }
        };
        img.src = rawUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  // Auto-save setting changes
  const updateSingleConfig = (name: string, value: string) => {
    const updated = { ...config, [name]: value };
    setConfig(updated);

    startTransition(async () => {
      const res = await updateProSystemSettingsAction({ [name]: value });
      if (!res.success) {
        setAlertMsg({ type: "error", text: res.error || "Failed to update setting" });
      }
    });
  };

  const handleCancelExpired = () => {
    startTransition(async () => {
      const res = await cancelExpiredSubscriptionsAction();
      if (res.success) {
        setAlertMsg({ type: "success", text: "Expired subscriptions cancelled successfully" });
      } else {
        setAlertMsg({ type: "error", text: res.error || "Failed to cancel expired subscriptions" });
      }
    });
  };

  const openAddModal = () => {
    setModalForm({
      status: 1,
      name: "",
      price: 0,
      color: "#2216C5",
      featuredVideos: 0,
      verifiedBadge: 0,
      maxUpload: "2000000",
      discount: 0,
      count: 0,
      time: "day",
      description: "",
    });
    setModalError(null);
    setShowAddModal(true);
  };

  const openEditModal = (pkg: ProPackageItem) => {
    setEditingPackage(pkg);
    setModalForm({
      status: pkg.status,
      name: pkg.type,
      price: pkg.price,
      color: pkg.color || "#2216C5",
      featuredVideos: pkg.featuredVideos,
      verifiedBadge: pkg.verifiedBadge,
      maxUpload: pkg.maxUpload || "2000000",
      discount: pkg.discount,
      count: pkg.timeCount,
      time: pkg.time || "month",
      description: pkg.description || "",
      iconFile: pkg.image,
      nightIconFile: pkg.nightImage,
    });
    setModalError(null);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalForm.name.trim()) {
      setModalError("Name cannot be empty");
      return;
    }

    startTransition(async () => {
      if (editingPackage) {
        const res = await updateProPackageAction(editingPackage.id, {
          type: modalForm.name,
          price: Number(modalForm.price),
          color: modalForm.color,
          status: modalForm.status,
          featuredVideos: modalForm.featuredVideos,
          verifiedBadge: modalForm.verifiedBadge,
          maxUpload: modalForm.maxUpload,
          discount: Number(modalForm.discount),
          timeCount: Number(modalForm.count),
          time: modalForm.time,
          description: modalForm.description,
          image: modalForm.iconFile,
          nightImage: modalForm.nightIconFile,
        });

        if (res.success && res.package) {
          setPackages((prev) =>
            prev.map((p) => (p.id === editingPackage.id ? (res.package as any) : p))
          );
          setEditingPackage(null);
          setAlertMsg({ type: "success", text: "Pro package updated successfully" });
        } else {
          setModalError(res.error || "Failed to update package");
        }
      } else {
        const res = await createProPackageAction({
          type: modalForm.name,
          price: Number(modalForm.price),
          color: modalForm.color,
          status: modalForm.status,
          featuredVideos: modalForm.featuredVideos,
          verifiedBadge: modalForm.verifiedBadge,
          maxUpload: modalForm.maxUpload,
          discount: Number(modalForm.discount),
          timeCount: Number(modalForm.count),
          time: modalForm.time,
          description: modalForm.description,
          image: modalForm.iconFile,
          nightImage: modalForm.nightIconFile,
        });

        if (res.success && res.package) {
          setPackages((prev) => [...prev, res.package as any]);
          setShowAddModal(false);
          setAlertMsg({ type: "success", text: "Pro package added successfully" });
        } else {
          setModalError(res.error || "Failed to add package");
        }
      }
    });
  };

  const handleDeletePackage = (id: number) => {
    startTransition(async () => {
      const res = await deleteProPackageAction(id);
      if (res.success) {
        setPackages((prev) => prev.filter((p) => p.id !== id));
        setDeletePackageId(null);
        setAlertMsg({ type: "success", text: "Pro package deleted successfully" });
      } else {
        setAlertMsg({ type: "error", text: res.error || "Failed to delete package" });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumbs matching Screenshot 2 */}
      <div>
        <h3 className="text-xl font-bold text-neutral-800 dark:text-white">
          Settings
        </h3>
        <nav className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 flex items-center gap-1.5 font-medium">
          <Link href="/admin" className="hover:underline flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>Admin Panel</span>
          </Link>
          <span>&gt;</span>
          <span className="hover:underline">Pro System</span>
          <span>&gt;</span>
          <span className="text-[#04abf2] font-semibold">
            Settings
          </span>
        </nav>
      </div>

      {alertMsg && (
        <div
          className={`p-3.5 rounded text-xs font-medium flex items-center gap-2 ${
            alertMsg.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-500"
              : "bg-red-500/10 border border-red-500/20 text-red-500"
          }`}
        >
          {alertMsg.type === "success" ? (
            <Check className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{alertMsg.text}</span>
          <button
            onClick={() => setAlertMsg(null)}
            className="ml-auto text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Grid: Left Side (Pro System Settings) & Right Side (Edit Pro Packages) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Pro System Settings Card */}
        <div className="bg-white dark:bg-[#1f2024] border border-neutral-200 dark:border-[#2b2f36] rounded-lg shadow-sm">
          <div className="p-5 flex items-center justify-between border-b border-neutral-200 dark:border-[#2b2f36]">
            <h6 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
              Pro System Settings
            </h6>
            <button
              onClick={handleCancelExpired}
              className="px-3 py-1.5 bg-[#e53935] hover:bg-[#d32f2f] text-white text-xs font-semibold rounded shadow-xs transition-colors cursor-pointer"
            >
              Cancel Expired Subscriptions
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* 1. Pro System Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block">
                  Pro System
                </label>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block mt-0.5">
                  Enable extra features with Pro System & get paid.
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  updateSingleConfig("go_pro", config.go_pro === "on" ? "off" : "on")
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  config.go_pro === "on" ? "bg-[#00c853]" : "bg-[#ef5350]"
                }`}
              >
                <span
                  className={`pointer-events-none inline-flex h-5 w-5 transform items-center justify-center rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    config.go_pro === "on" ? "translate-x-5 text-[#00c853]" : "translate-x-0 text-[#ef5350]"
                  }`}
                >
                  {config.go_pro === "on" ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                </span>
              </button>
            </div>

            <div className="border-t border-neutral-200 dark:border-[#2b2f36]" />

            {/* 2. Require Subscription To Access Site */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block">
                  Require Subscription To Access Site
                </label>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block mt-0.5">
                  Users can't access to site without purchasing any pro package. (Note: Pro system should be enabled)
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  updateSingleConfig(
                    "require_subcription",
                    config.require_subcription === "on" ? "off" : "on"
                  )
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  config.require_subcription === "on" ? "bg-[#00c853]" : "bg-[#ef5350]"
                }`}
              >
                <span
                  className={`pointer-events-none inline-flex h-5 w-5 transform items-center justify-center rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    config.require_subcription === "on" ? "translate-x-5 text-[#00c853]" : "translate-x-0 text-[#ef5350]"
                  }`}
                >
                  {config.require_subcription === "on" ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                </span>
              </button>
            </div>

            <div className="border-t border-neutral-200 dark:border-[#2b2f36]" />

            {/* 3. Allow Google Analytics for Pro Members with Filter Dropdown */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    Allow Google Analytics for Pro Memebers
                  </label>

                  {/* Filter icon button */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowWhoCanDropdown(!showWhoCanDropdown)}
                      className="w-6 h-6 rounded bg-neutral-200 dark:bg-[#2e323b] hover:bg-neutral-300 dark:hover:bg-[#383d47] flex items-center justify-center text-neutral-700 dark:text-neutral-300 transition-colors"
                      title="Who can use this feature?"
                    >
                      <Sliders className="w-3 h-3" />
                    </button>

                    {/* Popover matching Screenshot 2 */}
                    {showWhoCanDropdown && (
                      <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-[#252830] border border-neutral-300 dark:border-[#383d47] rounded-lg shadow-xl p-3 z-50">
                        <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block mb-2">
                          Who can use this feature?
                        </span>
                        <div className="flex items-center justify-around pt-1">
                          {/* Admin */}
                          <button
                            type="button"
                            onClick={() => {
                              updateSingleConfig("who_can_pro_google", "admin");
                              setShowWhoCanDropdown(false);
                            }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                              config.who_can_pro_google === "admin"
                                ? "bg-[#04abf2] text-white"
                                : "bg-neutral-100 dark:bg-[#323640] text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-[#3d424e]"
                            }`}
                            title="Admin"
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                          {/* All Users */}
                          <button
                            type="button"
                            onClick={() => {
                              updateSingleConfig("who_can_pro_google", "all");
                              setShowWhoCanDropdown(false);
                            }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                              config.who_can_pro_google === "all"
                                ? "bg-[#04abf2] text-white"
                                : "bg-neutral-100 dark:bg-[#323640] text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-[#3d424e]"
                            }`}
                            title="All Users"
                          >
                            <Users className="w-4 h-4" />
                          </button>
                          {/* Pro Users Only */}
                          <button
                            type="button"
                            onClick={() => {
                              updateSingleConfig("who_can_pro_google", "pro");
                              setShowWhoCanDropdown(false);
                            }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                              config.who_can_pro_google === "pro"
                                ? "bg-[#04abf2] text-white"
                                : "bg-neutral-100 dark:bg-[#323640] text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-[#3d424e]"
                            }`}
                            title="Pro Users Only"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block mt-0.5">
                  Pro users can set google analytics and use it on their own channel.
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  updateSingleConfig(
                    "pro_google",
                    config.pro_google === "on" ? "off" : "on"
                  )
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  config.pro_google === "on" ? "bg-[#00c853]" : "bg-[#ef5350]"
                }`}
              >
                <span
                  className={`pointer-events-none inline-flex h-5 w-5 transform items-center justify-center rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    config.pro_google === "on" ? "translate-x-5 text-[#00c853]" : "translate-x-0 text-[#ef5350]"
                  }`}
                >
                  {config.pro_google === "on" ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                </span>
              </button>
            </div>

            <div className="border-t border-neutral-200 dark:border-[#2b2f36]" />

            {/* 4. Pro Package Price */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block">
                Pro Package Price
              </label>
              <input
                type="number"
                value={config.pro_pkg_price || "10"}
                onChange={(e) => updateSingleConfig("pro_pkg_price", e.target.value)}
                className="w-full bg-white dark:bg-[#16171a] border border-neutral-300 dark:border-[#383d47] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
              />
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block">
                Set the price for PRO package.
              </span>
            </div>

            {/* 5. Free Users Import Limit */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block">
                Free Users Import Limit
              </label>
              <input
                type="number"
                value={config.user_max_import || "100"}
                onChange={(e) => updateSingleConfig("user_max_import", e.target.value)}
                className="w-full bg-white dark:bg-[#16171a] border border-neutral-300 dark:border-[#383d47] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
              />
            </div>

            {/* 6. Free Users (Not PRO) Upload Limit */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block">
                Free Users (Not PRO) Upload Limit
              </label>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block">
                Set the limit for NOT pro users.
              </span>
              <select
                value={config.max_upload_free_users || "1000000000"}
                onChange={(e) => updateSingleConfig("max_upload_free_users", e.target.value)}
                className="w-full bg-white dark:bg-[#16171a] border border-neutral-300 dark:border-[#383d47] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2] cursor-pointer"
              >
                {UPLOAD_SIZES.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 7. Pro Memebers Upload Limit */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block">
                Pro Memebers Upload Limit
              </label>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block">
                Set the limit for pro memebers.
              </span>
              <select
                value={config.max_upload_pro_users || "1000000000"}
                onChange={(e) => updateSingleConfig("max_upload_pro_users", e.target.value)}
                className="w-full bg-white dark:bg-[#16171a] border border-neutral-300 dark:border-[#383d47] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2] cursor-pointer"
              >
                {UPLOAD_SIZES.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Pro Packages Card */}
        <div className="bg-white dark:bg-[#1f2024] border border-neutral-200 dark:border-[#2b2f36] rounded-lg shadow-sm">
          <div className="p-5 border-b border-neutral-200 dark:border-[#2b2f36]">
            <h6 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-3">
              Edit Pro Packages
            </h6>
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-[#00b074] hover:bg-[#009b66] text-white text-xs font-semibold rounded shadow-xs transition-colors cursor-pointer"
            >
              Add New Package
            </button>
          </div>

          <div className="p-5 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-[#2b2f36] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3 w-32">Status</th>
                  <th className="py-2.5 px-3 w-28 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-[#2b2f36]">
                {packages.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-neutral-400">
                      No pro packages found. Click "Add New Package" to create one.
                    </td>
                  </tr>
                ) : (
                  packages.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-neutral-50 dark:hover:bg-[#252830]/50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          {pkg.image ? (
                            <img src={pkg.image} alt={pkg.type} className="w-4 h-4 object-contain rounded-xs" />
                          ) : (
                            <span
                              className="w-3.5 h-3.5 rounded-sm inline-block shrink-0"
                              style={{ backgroundColor: pkg.color || "#2216C5" }}
                            />
                          )}
                          <span
                            className="font-bold uppercase"
                            style={{ color: pkg.color || "inherit" }}
                          >
                            {pkg.type}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        {pkg.status === 1 ? (
                          <span className="inline-flex items-center gap-1 text-[#00c853] font-semibold">
                            <Check className="w-3.5 h-3.5" />
                            Enabled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[#ef5350] font-semibold">
                            <X className="w-3.5 h-3.5" />
                            Disabled
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(pkg)}
                            className="px-2.5 py-1 bg-[#04abf2] hover:bg-[#039be5] text-white rounded text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeletePackageId(pkg.id)}
                            className="px-2.5 py-1 bg-[#ef5350] hover:bg-[#e53935] text-white rounded text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Pro Package Modal matching Screenshot 3 with Light & Dark mode and File Uploads */}
      {(showAddModal || editingPackage) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#24262b] text-neutral-800 dark:text-white border border-neutral-200 dark:border-[#383d47] rounded-lg shadow-2xl w-full max-w-xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-[#383d47]">
              <h4 className="text-base font-bold text-neutral-900 dark:text-white">
                {editingPackage ? "Edit Pro Package" : "Add Pro Package"}
              </h4>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingPackage(null);
                }}
                className="w-6 h-6 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-[#383d47] dark:hover:bg-[#484e5a] flex items-center justify-center text-neutral-500 hover:text-neutral-800 dark:text-neutral-300 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveModal} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {modalError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-600 dark:text-red-300 text-xs">
                  {modalError}
                </div>
              )}

              {/* Status Switcher */}
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Status</label>
                <button
                  type="button"
                  onClick={() =>
                    setModalForm({ ...modalForm, status: modalForm.status === 1 ? 0 : 1 })
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    modalForm.status === 1 ? "bg-[#00c853]" : "bg-[#ef5350]"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-flex h-5 w-5 transform items-center justify-center rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      modalForm.status === 1 ? "translate-x-5 text-[#00c853]" : "translate-x-0 text-[#ef5350]"
                    }`}
                  >
                    {modalForm.status === 1 ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  </span>
                </button>
              </div>

              <div className="border-t border-neutral-200 dark:border-[#383d47]" />

              {/* Name, Price, Color */}
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-6">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={modalForm.name}
                    onChange={(e) => setModalForm({ ...modalForm, name: e.target.value })}
                    className="w-full bg-neutral-50 dark:bg-[#1b1c20] border border-neutral-300 dark:border-[#383d47] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
                    placeholder="e.g. VIP Star"
                  />
                </div>
                <div className="col-span-3">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    value={modalForm.price}
                    onChange={(e) =>
                      setModalForm({ ...modalForm, price: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-neutral-50 dark:bg-[#1b1c20] border border-neutral-300 dark:border-[#383d47] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
                  />
                </div>
                <div className="col-span-3">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Color
                  </label>
                  <input
                    type="color"
                    value={modalForm.color}
                    onChange={(e) => setModalForm({ ...modalForm, color: e.target.value })}
                    className="w-full h-8 bg-neutral-50 dark:bg-[#1b1c20] border border-neutral-300 dark:border-[#383d47] rounded cursor-pointer p-0.5"
                  />
                </div>
              </div>

              {/* Featured Videos */}
              <div className="flex items-center justify-between pt-2">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Featured videos
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setModalForm({
                      ...modalForm,
                      featuredVideos: modalForm.featuredVideos === 1 ? 0 : 1,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    modalForm.featuredVideos === 1 ? "bg-[#00c853]" : "bg-[#ef5350]"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-flex h-5 w-5 transform items-center justify-center rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      modalForm.featuredVideos === 1 ? "translate-x-5 text-[#00c853]" : "translate-x-0 text-[#ef5350]"
                    }`}
                  >
                    {modalForm.featuredVideos === 1 ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  </span>
                </button>
              </div>

              {/* Verified Badge */}
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Verified badge
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setModalForm({
                      ...modalForm,
                      verifiedBadge: modalForm.verifiedBadge === 1 ? 0 : 1,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    modalForm.verifiedBadge === 1 ? "bg-[#00c853]" : "bg-[#ef5350]"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-flex h-5 w-5 transform items-center justify-center rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      modalForm.verifiedBadge === 1 ? "translate-x-5 text-[#00c853]" : "translate-x-0 text-[#ef5350]"
                    }`}
                  >
                    {modalForm.verifiedBadge === 1 ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  </span>
                </button>
              </div>

              {/* Max Upload Size & Discount % */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Max Upload Size
                  </label>
                  <select
                    value={modalForm.maxUpload}
                    onChange={(e) => setModalForm({ ...modalForm, maxUpload: e.target.value })}
                    className="w-full bg-neutral-50 dark:bg-[#1b1c20] border border-neutral-300 dark:border-[#383d47] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2] cursor-pointer"
                  >
                    {UPLOAD_SIZES.map((u) => (
                      <option key={u.value} value={u.value} className="bg-white dark:bg-[#1b1c20] text-neutral-900 dark:text-white">
                        {u.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Discount %
                  </label>
                  <input
                    type="number"
                    value={modalForm.discount}
                    onChange={(e) =>
                      setModalForm({ ...modalForm, discount: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full bg-neutral-50 dark:bg-[#1b1c20] border border-neutral-300 dark:border-[#383d47] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
                  />
                </div>
              </div>

              {/* Paid Every Count & Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Paid Every
                  </label>
                  <input
                    type="number"
                    value={modalForm.count}
                    onChange={(e) =>
                      setModalForm({ ...modalForm, count: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full bg-neutral-50 dark:bg-[#1b1c20] border border-neutral-300 dark:border-[#383d47] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    &nbsp;
                  </label>
                  <select
                    value={modalForm.time}
                    onChange={(e) => setModalForm({ ...modalForm, time: e.target.value })}
                    className="w-full bg-neutral-50 dark:bg-[#1b1c20] border border-neutral-300 dark:border-[#383d47] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2] cursor-pointer"
                  >
                    <option value="day" className="bg-white dark:bg-[#1b1c20] text-neutral-900 dark:text-white">Day</option>
                    <option value="week" className="bg-white dark:bg-[#1b1c20] text-neutral-900 dark:text-white">Week</option>
                    <option value="month" className="bg-white dark:bg-[#1b1c20] text-neutral-900 dark:text-white">Month</option>
                    <option value="year" className="bg-white dark:bg-[#1b1c20] text-neutral-900 dark:text-white">Year</option>
                    <option value="unlimited" className="bg-white dark:bg-[#1b1c20] text-neutral-900 dark:text-white">Unlimited</option>
                  </select>
                </div>
              </div>

              {/* Icon & Night Icon File Uploads */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                {/* Hidden File Inputs */}
                <input
                  type="file"
                  ref={iconInputRef}
                  accept="image/png,image/jpeg,image/svg+xml"
                  onChange={(e) => handleIconChange(e, "iconFile")}
                  className="hidden"
                />
                <input
                  type="file"
                  ref={nightIconInputRef}
                  accept="image/png,image/jpeg,image/svg+xml"
                  onChange={(e) => handleIconChange(e, "nightIconFile")}
                  className="hidden"
                />

                {/* Day Icon Clickable Tile */}
                <div
                  onClick={() => iconInputRef.current?.click()}
                  className="p-3 bg-neutral-50 dark:bg-[#1b1c20] hover:bg-neutral-100 dark:hover:bg-[#202227] border border-neutral-300 dark:border-[#383d47] rounded flex items-center gap-3 cursor-pointer transition-colors group"
                >
                  <div className="w-9 h-9 rounded-full bg-neutral-200 dark:bg-[#2a2c33] group-hover:bg-[#04abf2]/20 flex items-center justify-center text-[#04abf2] shrink-0 overflow-hidden">
                    {modalForm.iconFile ? (
                      <img src={modalForm.iconFile} alt="Icon" className="w-6 h-6 object-contain" />
                    ) : (
                      <Paperclip className="w-4 h-4" />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-xs font-bold block text-neutral-800 dark:text-white">
                      {modalForm.iconFile ? "Icon Selected" : "Icon"}
                    </span>
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block truncate">
                      {modalForm.iconFile ? "Click to change" : "width: 32px, height: 32px (.png)"}
                    </span>
                  </div>
                </div>

                {/* Night Icon Clickable Tile */}
                <div
                  onClick={() => nightIconInputRef.current?.click()}
                  className="p-3 bg-neutral-50 dark:bg-[#1b1c20] hover:bg-neutral-100 dark:hover:bg-[#202227] border border-neutral-300 dark:border-[#383d47] rounded flex items-center gap-3 cursor-pointer transition-colors group"
                >
                  <div className="w-9 h-9 rounded-full bg-neutral-200 dark:bg-[#2a2c33] group-hover:bg-[#04abf2]/20 flex items-center justify-center text-[#04abf2] shrink-0 overflow-hidden">
                    {modalForm.nightIconFile ? (
                      <img src={modalForm.nightIconFile} alt="Night Icon" className="w-6 h-6 object-contain" />
                    ) : (
                      <Paperclip className="w-4 h-4" />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-xs font-bold block text-neutral-800 dark:text-white">
                      {modalForm.nightIconFile ? "Night Icon Selected" : "Night Icon"}
                    </span>
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block truncate">
                      {modalForm.nightIconFile ? "Click to change" : "width: 32px, height: 32px (.png)"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={modalForm.description}
                  onChange={(e) => setModalForm({ ...modalForm, description: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-[#1b1c20] border border-neutral-300 dark:border-[#383d47] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
                  placeholder="Package description or perks..."
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-[#383d47]">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingPackage(null);
                  }}
                  className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 dark:bg-[#383d47] dark:hover:bg-[#444a56] text-neutral-700 dark:text-white text-xs font-medium rounded transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 bg-[#04abf2] hover:bg-[#039be5] text-white text-xs font-semibold rounded shadow transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isPending ? "Please wait..." : editingPackage ? "Save Changes" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletePackageId !== null && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1f2024] border border-neutral-200 dark:border-[#383d47] rounded-lg shadow-xl max-w-sm w-full p-5 space-y-4 text-center">
            <h5 className="text-sm font-bold text-neutral-800 dark:text-neutral-100">
              Delete Pro Package
            </h5>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Are you sure you want to delete this pro package? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletePackageId(null)}
                className="px-4 py-1.5 bg-neutral-200 dark:bg-[#383d47] hover:bg-neutral-300 dark:hover:bg-[#484e5a] text-neutral-700 dark:text-white rounded text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePackage(deletePackageId)}
                disabled={isPending}
                className="px-4 py-1.5 bg-[#ef5350] hover:bg-[#e53935] text-white rounded text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                {isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
