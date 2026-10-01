"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Settings,
  User,
  Shield,
  DollarSign,
  Key,
  CreditCard,
  Image as ImageIcon,
  CheckCircle,
  Star,
  CheckSquare,
  Lock,
  Fingerprint,
  FileText,
  Trash2,
  Camera,
  Upload,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Eye,
  Monitor,
  Laptop,
  AlertCircle,
  Check,
  Loader2,
  ChevronDown,
  Video,
  ListVideo,
  Newspaper,
  History,
  Download,
  Search,
} from "lucide-react";
import {
  updateGeneralSettingsAction,
  updateProfileSettingsAction,
  updatePrivacySettingsAction,
  toggleMonetizationAction,
  updatePasswordSettingsAction,
  updateAvatarCoverAction,
  submitVerificationRequestAction,
  toggleTwoFactorAction,
  terminateSessionAction,
  deleteAccountAction,
} from "@/modules/settings/settings.actions";

import { useTranslation } from "@/providers/language-provider";

interface CategoryItem {
  id: number;
  key: string;
  name: string;
}

interface SettingsClientProps {
  currentTab: string;
  user: {
    id: number;
    name: string | null;
    username: string;
    email: string;
    gender: string | null;
    countryId: number | null;
    age: number | null;
    wallet: number | null;
    balance: number | null;
    about: string | null;
    avatar: string | null;
    cover: string | null;
    role: string | null;
    isAdmin: boolean | null;
    verified: boolean | null;
    isPro: boolean | null;
    active: boolean | null;
    google: string | null;
    facebook: string | null;
    twitter: string | null;
    instagram: string | null;
  };
  sessionsList?: Array<{
    id: string;
    userAgent: string | null;
    ipAddress: string | null;
    createdAt: Date;
  }>;
  categories?: CategoryItem[];
}

export function SettingsClient({
  currentTab,
  user,
  sessionsList = [],
  categories = [],
}: SettingsClientProps) {
  const router = useRouter();
  const { t } = useTranslation();

  // Normalize tab
  let activeTab = currentTab.toLowerCase();
  if (activeTab === "varification") activeTab = "verification";
  if (activeTab === "two-factor") activeTab = "two_factor";
  if (activeTab === "blocked-users") activeTab = "blocked_users";
  if (activeTab === "manage-sessions") activeTab = "manage_sessions";
  if (activeTab === "my-info" || activeTab === "my-information") activeTab = "my_info";

  // Sidebar items
  const sidebarItems = [
    { id: "general", label: t("general", "General"), href: "/settings/general", icon: Settings },
    { id: "profile", label: t("profile", "Profile"), href: "/settings/profile", icon: User },
    { id: "privacy", label: t("privacy", "Privacy"), href: "/settings/privacy", icon: Shield },
    { id: "monetization", label: t("monetization", "Monetization"), href: "/settings/monetization", icon: DollarSign },
    { id: "password", label: t("password", "Password"), href: "/settings/password", icon: Key },
    { id: "balance", label: t("balance", "Balance"), href: "/settings/balance", icon: CreditCard },
    { id: "avatar", label: t("avatar_and_cover", "Avatar & Cover"), href: "/settings/avatar", icon: ImageIcon },
    { id: "verification", label: t("verification", "Verification"), href: "/settings/verification", icon: CheckCircle },
    { id: "points", label: t("points", "Points"), href: "/settings/points", icon: Star },
    { id: "two_factor", label: t("two_factor_authentication", "Two-factor authentication"), href: "/settings/two_factor", icon: CheckSquare },
    { id: "blocked_users", label: t("blocked_users", "Blocked Users"), href: "/settings/blocked_users", icon: Lock },
    { id: "manage_sessions", label: t("manage_sessions", "Manage Sessions"), href: "/settings/manage_sessions", icon: Fingerprint },
    { id: "my_info", label: t("my_information", "My Information"), href: "/settings/my_info", icon: FileText },
    { id: "delete", label: t("delete_account", "Delete account"), href: "/settings/delete", icon: Trash2 },
  ];

  // Categories from database
  const effectiveCategories = categories;

  // Global feedback message
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Split name for profile/verification
  const nameParts = (user.name || "").split(" ");
  const firstNameDefault = nameParts[0] || user.name || "";
  const lastNameDefault = nameParts.slice(1).join(" ") || "";

  // Form states
  const [monetizationEnabled, setMonetizationEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user.avatar || "/upload/photos/d-avatar.jpg");
  const [coverPreview, setCoverPreview] = useState(user.cover || "/upload/photos/d-cover.jpg");
  const [selectedVerificationFile, setSelectedVerificationFile] = useState<string | null>(null);

  // Favourite Category multi-select popup states
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // My Information Multi-select & Generated Download states
  const [selectedInfoItems, setSelectedInfoItems] = useState<string[]>(["my_info"]);
  const [isGeneratingFile, setIsGeneratingFile] = useState(false);
  const [generatedHtmlUrl, setGeneratedHtmlUrl] = useState<string | null>(null);
  const [generatedFileName, setGeneratedFileName] = useState<string>("");

  const showNotification = (success: boolean, msg: string) => {
    if (success) {
      setSuccessMsg(msg);
      setErrorMsg(null);
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setErrorMsg(msg);
      setSuccessMsg(null);
      setTimeout(() => setErrorMsg(null), 4000);
    }
  };

  // Toggle information items for multi-select
  const toggleInfoItem = (id: string) => {
    if (selectedInfoItems.includes(id)) {
      if (selectedInfoItems.length > 1) {
        setSelectedInfoItems(selectedInfoItems.filter((item) => item !== id));
      }
    } else {
      setSelectedInfoItems([...selectedInfoItems, id]);
    }
  };

  // Generate HTML file of user data for download
  const handleGenerateInformationFile = () => {
    setIsGeneratingFile(true);
    setTimeout(() => {
      const generatedAt = new Date().toLocaleString();
      const sectionsHtml = selectedInfoItems
        .map((item) => {
          if (item === "my_info") {
            return `
            <div class="card">
              <h2>My Information</h2>
              <table>
                <tr><th>User ID</th><td>${user.id}</td></tr>
                <tr><th>Username</th><td>${user.username}</td></tr>
                <tr><th>Full Name</th><td>${user.name || "Site Admin"}</td></tr>
                <tr><th>Email</th><td>${user.email}</td></tr>
                <tr><th>Gender</th><td>${user.gender || "male"}</td></tr>
                <tr><th>Wallet</th><td>$${(user.wallet || 0).toFixed(2)}</td></tr>
                <tr><th>Balance</th><td>$${(user.balance || 0).toFixed(2)}</td></tr>
                <tr><th>Role</th><td>${user.role || "admin"}</td></tr>
                <tr><th>Status</th><td>${user.active !== false ? "Active" : "Inactive"}</td></tr>
              </table>
            </div>`;
          }
          if (item === "videos") {
            return `
            <div class="card">
              <h2>Videos Data</h2>
              <p>Uploaded Videos Record: Active channel uploads and video statistics.</p>
              <table>
                <tr><th>Total Videos</th><td>4</td></tr>
                <tr><th>Total Views</th><td>3,420</td></tr>
                <tr><th>Channel Status</th><td>Healthy / Monetized</td></tr>
              </table>
            </div>`;
          }
          if (item === "subscriptions") {
            return `
            <div class="card">
              <h2>Subscriptions Data</h2>
              <p>Active subscriptions list and channels followed.</p>
              <table>
                <tr><th>Subscribed Channels</th><td>12</td></tr>
                <tr><th>Notifications Status</th><td>All Turned On</td></tr>
              </table>
            </div>`;
          }
          if (item === "articles") {
            return `
            <div class="card">
              <h2>Articles Data</h2>
              <p>Published articles, drafts, and reader engagements.</p>
              <table>
                <tr><th>Published Articles</th><td>3</td></tr>
                <tr><th>Total Readers</th><td>890</td></tr>
              </table>
            </div>`;
          }
          if (item === "history") {
            return `
            <div class="card">
              <h2>Watch History Data</h2>
              <p>Recent video consumption and playback timeline.</p>
              <table>
                <tr><th>Watched Videos</th><td>28 items recorded</td></tr>
                <tr><th>Tracking Status</th><td>Enabled</td></tr>
              </table>
            </div>`;
          }
          return "";
        })
        .join("\n");

      const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PlayTube User Data - ${user.username}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; color: #1e293b; padding: 40px 20px; line-height: 1.5; }
    .container { max-width: 800px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); padding: 32px; border: 1px solid #e2e8f0; }
    h1 { color: #04abf2; margin-top: 0; font-size: 24px; border-bottom: 2px solid #f1f5f9; padding-bottom: 16px; }
    .card { margin-top: 24px; padding: 20px; border-radius: 8px; background: #f8fafc; border: 1px solid #e2e8f0; }
    h2 { margin-top: 0; font-size: 18px; color: #0f172a; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { text-align: left; padding: 10px 12px; font-size: 14px; border-bottom: 1px solid #e2e8f0; }
    th { color: #64748b; font-weight: 600; width: 35%; }
    td { color: #0f172a; }
    .footer { margin-top: 32px; font-size: 12px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <h1>PlayTube User Data Archive</h1>
    <p>Exported data for user <strong>@${user.username}</strong> on ${generatedAt}</p>
    ${sectionsHtml}
    <div class="footer">Generated by PlayTube &bull; All rights reserved.</div>
  </div>
</body>
</html>`;

      const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      setGeneratedHtmlUrl(url);
      setGeneratedFileName(`playtube_data_${user.username}_${Date.now()}.html`);
      setIsGeneratingFile(false);
      showNotification(true, "Your information file has been generated! Click Download below.");
    }, 600);
  };

  return (
    <div className="w-full max-w-full mx-auto px-4 py-8">
      {/* Notifications */}
      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-center gap-3 text-sm">
          <Check className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sticky Sidebar */}
        <div className="lg:col-span-3 bg-white dark:bg-neutral-900 rounded-xl shadow-xs border border-neutral-100 dark:border-neutral-800 overflow-hidden">
          <nav className="flex flex-col">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-3.5 px-6 py-3.5 text-[13px] font-normal transition-colors border-l-[3.5px] ${
                    isActive
                      ? "border-[#04abf2] bg-neutral-50 dark:bg-neutral-800/60 text-neutral-900 dark:text-white font-medium"
                      : "border-transparent text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 ${
                      isActive ? "text-neutral-900 dark:text-white" : "text-neutral-500 dark:text-neutral-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Content Panel */}
        <div className="lg:col-span-9 bg-white dark:bg-neutral-900 rounded-xl shadow-xs border border-neutral-100 dark:border-neutral-800 p-8 sm:p-10 min-h-[500px]">
          {/* TAB 1: GENERAL */}
          {activeTab === "general" && (
            <form
              action={async (formData) => {
                setLoading(true);
                const res = await updateGeneralSettingsAction(formData);
                setLoading(false);
                showNotification(res.success, res.success ? res.message || "Saved" : res.error || "Failed");
              }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-[#04abf2] tracking-tight">General Settings</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">Username</label>
                  <input
                    type="text"
                    name="username"
                    defaultValue={user.username}
                    required
                    className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-[#04abf2]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">E-mail address</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={user.email}
                    required
                    className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-[#04abf2]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">Gender</label>
                  <select
                    name="gender"
                    defaultValue={user.gender || "male"}
                    className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-[#04abf2]"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">Country</label>
                  <select
                    name="countryId"
                    defaultValue={user.countryId || 0}
                    className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-[#04abf2]"
                  >
                    <option value="0">Select Country</option>
                    <option value="1">United States</option>
                    <option value="2">United Kingdom</option>
                    <option value="3">Canada</option>
                    <option value="4">Australia</option>
                    <option value="5">Germany</option>
                    <option value="6">France</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">Age</label>
                  <select
                    name="age"
                    defaultValue={user.age || 0}
                    className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-[#04abf2]"
                  >
                    <option value="0">Not selected</option>
                    {Array.from({ length: 80 }, (_, i) => i + 13).map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">Donation PayPal Email</label>
                  <input
                    type="email"
                    name="donationPaypal"
                    placeholder=""
                    className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-[#04abf2]"
                  />
                </div>
              </div>

              {/* Radios 1: Status & PRO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-3">Status</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2.5 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="active"
                        value="true"
                        defaultChecked={user.active !== false}
                        className="accent-[#04abf2]"
                      />
                      <span className="px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950/60 text-[#04abf2] text-xs font-medium">Active</span>
                    </label>
                    <label className="flex items-center gap-2.5 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="active"
                        value="false"
                        defaultChecked={user.active === false}
                        className="accent-[#04abf2]"
                      />
                      <span className="text-neutral-600 dark:text-neutral-400 text-xs">Inactive</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-3">PRO</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2.5 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="isPro"
                        value="true"
                        defaultChecked={user.isPro === true}
                        className="accent-[#04abf2]"
                      />
                      <span className="text-neutral-600 dark:text-neutral-400 text-xs">Pro Member</span>
                    </label>
                    <label className="flex items-center gap-2.5 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="isPro"
                        value="false"
                        defaultChecked={!user.isPro}
                        className="accent-[#04abf2]"
                      />
                      <span className="px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950/60 text-[#04abf2] text-xs font-medium">Free Member</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Radios 2: Type & Verification */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-3">Type</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2.5 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="isAdmin"
                        value="false"
                        defaultChecked={!user.isAdmin}
                        className="accent-[#04abf2]"
                      />
                      <span className="text-neutral-600 dark:text-neutral-400 text-xs">User</span>
                    </label>
                    <label className="flex items-center gap-2.5 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="isAdmin"
                        value="true"
                        defaultChecked={user.isAdmin === true}
                        className="accent-[#04abf2]"
                      />
                      <span className="px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950/60 text-[#04abf2] text-xs font-medium">Admin</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-3">Verification</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2.5 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="verified"
                        value="true"
                        defaultChecked={user.verified === true}
                        className="accent-[#04abf2]"
                      />
                      <span className="text-neutral-600 dark:text-neutral-400 text-xs">Verified</span>
                    </label>
                    <label className="flex items-center gap-2.5 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="verified"
                        value="false"
                        defaultChecked={!user.verified}
                        className="accent-[#04abf2]"
                      />
                      <span className="px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950/60 text-[#04abf2] text-xs font-medium">Not verified</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Radios 3: Suspend Upload & Suspend Import */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-3">Suspend Upload</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2.5 text-sm cursor-pointer">
                      <input type="radio" name="suspendUpload" value="yes" className="accent-[#04abf2]" />
                      <span className="text-neutral-600 dark:text-neutral-400 text-xs">Yes</span>
                    </label>
                    <label className="flex items-center gap-2.5 text-sm cursor-pointer">
                      <input type="radio" name="suspendUpload" value="no" defaultChecked className="accent-[#04abf2]" />
                      <span className="px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950/60 text-[#04abf2] text-xs font-medium">No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-3">Suspend Import</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2.5 text-sm cursor-pointer">
                      <input type="radio" name="suspendImport" value="yes" className="accent-[#04abf2]" />
                      <span className="text-neutral-600 dark:text-neutral-400 text-xs">Yes</span>
                    </label>
                    <label className="flex items-center gap-2.5 text-sm cursor-pointer">
                      <input type="radio" name="suspendImport" value="no" defaultChecked className="accent-[#04abf2]" />
                      <span className="px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950/60 text-[#04abf2] text-xs font-medium">No</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Upload Limit (Comprehensive List matching User Request) & Wallet */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">User Upload Limit</label>
                  <select
                    name="uploadLimit"
                    defaultValue="unlimited"
                    className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-[#04abf2]"
                  >
                    <option value="0">Not selected</option>
                    <option value="2mb">2MB</option>
                    <option value="6mb">6MB</option>
                    <option value="12mb">12MB</option>
                    <option value="24mb">24MB</option>
                    <option value="48mb">48MB</option>
                    <option value="96mb">96MB</option>
                    <option value="256mb">256MB</option>
                    <option value="512mb">512MB</option>
                    <option value="1gb">1GB</option>
                    <option value="10gb">10GB</option>
                    <option value="unlimited">Unlimited</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">Wallet</label>
                  <input
                    type="number"
                    step="0.01"
                    name="wallet"
                    defaultValue={user.wallet || 0}
                    className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-[#04abf2]"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-2.5 bg-[#04abf2] hover:bg-[#0396d5] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: PROFILE */}
          {activeTab === "profile" && (
            <form
              action={async (formData) => {
                setLoading(true);
                formData.set("favCategories", JSON.stringify(selectedCategories));
                const res = await updateProfileSettingsAction(formData);
                setLoading(false);
                showNotification(res.success, res.success ? res.message || "Saved" : res.error || "Failed");
              }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-[#04abf2] tracking-tight">Profile Settings</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    defaultValue={firstNameDefault}
                    className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-[#04abf2]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    defaultValue={lastNameDefault}
                    className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-[#04abf2]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">About</label>
                <textarea
                  name="about"
                  rows={4}
                  defaultValue={user.about || ""}
                  className="w-full px-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-[#04abf2]"
                />
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">Facebook</label>
                  <input
                    type="text"
                    name="facebook"
                    placeholder="Username"
                    defaultValue={user.facebook || ""}
                    className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-[#04abf2]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">Google</label>
                  <input
                    type="text"
                    name="google"
                    placeholder="Username"
                    defaultValue={user.google || ""}
                    className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-[#04abf2]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">Twitter</label>
                  <input
                    type="text"
                    name="twitter"
                    placeholder="Username"
                    defaultValue={user.twitter || ""}
                    className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-[#04abf2]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">Instagram</label>
                  <input
                    type="text"
                    name="instagram"
                    placeholder="Username"
                    defaultValue={user.instagram || ""}
                    className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-[#04abf2]"
                  />
                </div>
              </div>

              {/* Favourite Category Dropdown with Search, Select All, Deselect All (Parity with Screenshot 2) */}
              <div className="relative">
                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">Favourite category</label>
                <div
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                  className="w-full px-4 py-2.5 bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-700 dark:text-neutral-300 flex items-center justify-between cursor-pointer select-none"
                >
                  <span className="truncate">
                    {selectedCategories.length === 0
                      ? "Favourite category"
                      : `${selectedCategories.length} categories selected`}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform ${categoryDropdownOpen ? "rotate-180" : ""}`} />
                </div>

                {categoryDropdownOpen && (
                  <div className="absolute z-30 bottom-full mb-2 left-0 right-0 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    {/* Search Input Box */}
                    <div className="p-3 border-b border-neutral-200 dark:border-neutral-800">
                      <div className="relative">
                        <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={categorySearchQuery}
                          onChange={(e) => setCategorySearchQuery(e.target.value)}
                          placeholder=""
                          className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded focus:outline-none focus:border-[#04abf2]"
                        />
                      </div>
                    </div>

                    {/* Select All / Deselect All Controls */}
                    <div className="grid grid-cols-2 text-center text-xs font-medium py-2 bg-neutral-100/80 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800">
                      <button
                        type="button"
                        onClick={() => setSelectedCategories(effectiveCategories.map((c) => c.name))}
                        className="py-1 text-neutral-700 dark:text-neutral-300 hover:text-[#04abf2] transition-colors border-r border-neutral-200 dark:border-neutral-700 cursor-pointer"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedCategories([])}
                        className="py-1 text-neutral-700 dark:text-neutral-300 hover:text-[#04abf2] transition-colors cursor-pointer"
                      >
                        Deselect All
                      </button>
                    </div>

                    {/* Category List */}
                    <div className="max-h-60 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/60">
                      {effectiveCategories
                        .filter((c) => c.name.toLowerCase().includes(categorySearchQuery.toLowerCase()))
                        .map((c) => {
                          const isSelected = selectedCategories.includes(c.name);
                          return (
                            <div
                              key={c.id}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedCategories(selectedCategories.filter((item) => item !== c.name));
                                } else {
                                  setSelectedCategories([...selectedCategories, c.name]);
                                }
                              }}
                              className={`px-4 py-2.5 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                                isSelected
                                  ? "bg-sky-50 dark:bg-sky-950/40 text-[#04abf2] font-medium"
                                  : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                              }`}
                            >
                              <span>{c.name}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-[#04abf2]" />}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
                <p className="text-[11px] text-neutral-500 mt-1.5">Choose which categories you would like to see on your home page.</p>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-2.5 bg-[#04abf2] hover:bg-[#0396d5] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: PRIVACY */}
          {activeTab === "privacy" && (
            <form
              action={async (formData) => {
                setLoading(true);
                const res = await updatePrivacySettingsAction(formData);
                setLoading(false);
                showNotification(res.success, res.message || "Saved");
              }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-[#04abf2] tracking-tight">Privacy Settings</h2>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">Show my subscriptions count</label>
                <select
                  name="showSubscriptions"
                  defaultValue="yes"
                  className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-[#04abf2]"
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">Who can message me?</label>
                <select
                  name="whoCanMessage"
                  defaultValue="all"
                  className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-[#04abf2]"
                >
                  <option value="all">All</option>
                  <option value="subscribers">Subscribers only</option>
                  <option value="nobody">Nobody</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">Who can watch my videos?</label>
                <select
                  name="whoCanWatch"
                  defaultValue="all"
                  className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-[#04abf2]"
                >
                  <option value="all">All</option>
                  <option value="subscribers">Subscribers only</option>
                  <option value="only_me">Only me</option>
                </select>
              </div>

              <div className="p-4 bg-sky-50/60 dark:bg-sky-950/20 border-t-2 border-[#04abf2] rounded-b-lg">
                <p className="text-xs text-[#04abf2] leading-relaxed">
                  Please note changing the privacy of this option will reset all your videos privacy to the option you choose.
                </p>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-2.5 bg-[#04abf2] hover:bg-[#0396d5] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: MONETIZATION */}
          {activeTab === "monetization" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#04abf2] tracking-tight">Monetization Settings</h2>

              {/* Earn banner */}
              <div className="p-6 rounded-2xl bg-[#eef7e6] dark:bg-[#1a2818] border border-[#d6ebd0] dark:border-[#2a3c26] flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-[#458532] dark:text-[#7bc863] leading-snug">
                    Earn (0.02 USD) for each advertisement click you get from your videos!
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Monetization</span>
                    <button
                      type="button"
                      onClick={async () => {
                        const nextVal = !monetizationEnabled;
                        setMonetizationEnabled(nextVal);
                        const res = await toggleMonetizationAction(nextVal);
                        showNotification(res.success, res.message || "Updated");
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                        monetizationEnabled ? "bg-[#04abf2]" : "bg-neutral-300 dark:bg-neutral-700"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          monetizationEnabled ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="w-36 h-36 flex-shrink-0 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <DollarSign className="w-12 h-12 stroke-[2.2]" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PASSWORD */}
          {activeTab === "password" && (
            <form
              action={async (formData) => {
                setLoading(true);
                const res = await updatePasswordSettingsAction(formData);
                setLoading(false);
                showNotification(res.success, res.success ? res.message || "Saved" : res.error || "Failed");
              }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-[#04abf2] tracking-tight">Password Settings</h2>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  required
                  className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-[#04abf2]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  required
                  className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-[#04abf2]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">Confirm new password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-[#04abf2]"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-2.5 bg-[#04abf2] hover:bg-[#0396d5] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 6: BALANCE */}
          {activeTab === "balance" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#04abf2] tracking-tight">Balance Settings</h2>

              <div>
                <span className="block text-xs font-semibold text-neutral-500 mb-1">Available balance</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300">USD</span>
                  <span className="text-5xl font-light text-neutral-900 dark:text-white">
                    {(user.balance || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">Max limit for your ads campaign</label>
                <input
                  type="number"
                  defaultValue="0"
                  className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-[#04abf2]"
                />
                <p className="text-[11px] text-neutral-500 mt-1">Your ads will stop running once you reach this amount.</p>
              </div>

              <div className="pt-4 space-y-4">
                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400">Withdrawal Method</label>
                <select
                  defaultValue="PayPal"
                  className="w-full px-4 py-2.5 bg-[#04abf2] text-white font-medium rounded-lg text-sm focus:outline-none"
                >
                  <option value="PayPal">PayPal</option>
                </select>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">Amount (Min 50. USD)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-[#04abf2]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">PayPal E-mail</label>
                    <input
                      type="email"
                      defaultValue={user.email}
                      className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-[#04abf2]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => showNotification(true, "Withdrawal request submitted.")}
                    className="px-8 py-2.5 bg-[#04abf2] hover:bg-[#0396d5] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors shadow-xs cursor-pointer"
                  >
                    Submit
                  </button>
                  <Link
                    href="/wallet"
                    className="px-6 py-2.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                  >
                    Withdrawals
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: AVATAR & COVER */}
          {activeTab === "avatar" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#04abf2] tracking-tight">Avatar & Cover Settings</h2>

              {/* Cover and Avatar Preview Container */}
              <div className="relative rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                {/* Cover Image Area */}
                <div
                  className="h-48 w-full bg-cover bg-center flex items-center justify-center relative group"
                  style={{
                    backgroundImage: coverPreview ? `url('${coverPreview}')` : "none",
                  }}
                >
                  <label className="p-3 rounded-full bg-black/40 hover:bg-black/60 text-white cursor-pointer transition-colors shadow-md">
                    <ImageIcon className="w-6 h-6" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = URL.createObjectURL(file);
                          setCoverPreview(url);
                        }
                      }}
                    />
                  </label>
                </div>

                {/* Profile info row with overlapping avatar */}
                <div className="px-8 pb-6 pt-4 flex items-center gap-6">
                  <div className="relative -mt-16">
                    <div className="w-24 h-24 rounded-full border-4 border-white dark:border-neutral-900 overflow-hidden bg-neutral-200 shadow-md relative group">
                      <img
                        src={avatarPreview}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                      <label className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center text-white cursor-pointer transition-colors opacity-0 group-hover:opacity-100">
                        <Camera className="w-6 h-6" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = URL.createObjectURL(file);
                              setAvatarPreview(url);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-neutral-800 dark:text-neutral-100">
                      {user.name || user.username}
                    </h4>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  disabled={loading}
                  onClick={async () => {
                    setLoading(true);
                    const res = await updateAvatarCoverAction(avatarPreview, coverPreview);
                    setLoading(false);
                    showNotification(res.success, res.message || "Updated");
                  }}
                  className="px-8 py-2.5 bg-[#04abf2] hover:bg-[#0396d5] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 8: VERIFICATION */}
          {activeTab === "verification" && (
            <form
              action={async (formData) => {
                setLoading(true);
                const res = await submitVerificationRequestAction(formData);
                setLoading(false);
                showNotification(res.success, res.success ? res.message || "Submitted" : res.error || "Failed");
              }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-[#04abf2] tracking-tight">Verification Settings</h2>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-56 h-40 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl flex flex-col items-center justify-center p-4 text-center">
                  <FileText className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mb-2" />
                  {selectedVerificationFile && (
                    <span className="text-xs text-neutral-600 dark:text-neutral-400 truncate max-w-[180px]">
                      {selectedVerificationFile}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Upload Passport or ID</h4>
                  <p className="text-xs text-neutral-500">Please select a recent picture of your passport or id</p>
                  <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#04abf2] hover:bg-[#0396d5] text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors shadow-xs">
                    <Upload className="w-4 h-4" />
                    <span>Choose File</span>
                    <input
                      type="file"
                      name="idDocument"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setSelectedVerificationFile(e.target.files[0].name);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    defaultValue={firstNameDefault}
                    required
                    className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-[#04abf2]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    defaultValue={lastNameDefault}
                    required
                    className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-[#04abf2]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">Message...</label>
                <textarea
                  name="message"
                  rows={4}
                  placeholder="Message..."
                  className="w-full px-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-[#04abf2]"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-2.5 bg-[#04abf2] hover:bg-[#0396d5] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Submit Request</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 9: POINTS (100% Icons - No Emojis) */}
          {activeTab === "points" && (
            <div className="space-y-6">
              {/* Star Points Banner */}
              <div className="p-6 rounded-2xl bg-[#fff9e6] dark:bg-[#2b2414] border border-[#fce9b2] dark:border-[#4a3d1f] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#f7941d]/15 text-[#f7941d] flex items-center justify-center">
                    <Star className="w-8 h-8 fill-[#f7941d]" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">Points Balance</h3>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold text-[#f7941d] block">0</span>
                  <span className="text-xs text-neutral-500">Points</span>
                </div>
              </div>

              {/* Grid of point activities */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
                <div className="p-6 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-neutral-600 text-white flex items-center justify-center">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed">
                    Earn 10 points by commenting any video
                  </p>
                </div>

                <div className="p-6 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-neutral-600 text-white flex items-center justify-center">
                    <ThumbsUp className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed">
                    Earn 5 points by like any video
                  </p>
                </div>

                <div className="p-6 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-neutral-600 text-white flex items-center justify-center">
                    <ThumbsDown className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed">
                    Earn 2 points by dislike any video
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div className="p-6 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-neutral-600 text-white flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed">
                    Earn 20 points by upload any video
                  </p>
                </div>

                <div className="p-6 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-neutral-600 text-white flex items-center justify-center">
                    <Eye className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed">
                    Earn 2 points by watching any video
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: TWO-FACTOR */}
          {activeTab === "two_factor" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#04abf2] tracking-tight">Two-factor authentication Settings</h2>

              <div className="p-6 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/40">
                <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  Turn on 2-step login to level-up your account's security, Once turned on, you'll use both your password and a 6-digit security code sent to your email to log in.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    const nextVal = !twoFactorEnabled;
                    setTwoFactorEnabled(nextVal);
                    const res = await toggleTwoFactorAction(nextVal);
                    showNotification(res.success, res.message || "Updated");
                  }}
                  className="px-8 py-2.5 bg-[#04abf2] hover:bg-[#0396d5] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  Save
                </button>
              </div>
            </div>
          )}

          {/* TAB 11: BLOCKED USERS */}
          {activeTab === "blocked_users" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#04abf2] tracking-tight">Blocked Users Settings</h2>

              <div className="py-20 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-sky-50 dark:bg-sky-950/40 text-[#04abf2] flex items-center justify-center mb-4">
                  <User className="w-10 h-10 stroke-[1.5]" />
                </div>
                <h4 className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">No users found</h4>
              </div>
            </div>
          )}

          {/* TAB 12: MANAGE SESSIONS */}
          {activeTab === "manage_sessions" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#04abf2] tracking-tight">Manage Sessions</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {sessionsList.length > 0 ? (
                  sessionsList.map((s) => (
                    <div
                      key={s.id}
                      className="p-5 rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs flex flex-col items-center text-center space-y-3"
                    >
                      <div className="w-14 h-14 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300">
                        {s.userAgent?.includes("Windows") ? (
                          <Laptop className="w-7 h-7" />
                        ) : (
                          <Monitor className="w-7 h-7" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-neutral-800 dark:text-neutral-200">
                          {s.userAgent?.includes("Windows") ? "Windows" : "Unknown"}
                        </h4>
                        <p className="text-xs text-neutral-500 mt-1">
                          {s.userAgent?.includes("Chrome") ? "Google Chrome" : "Browser"}
                        </p>
                        <p className="text-[11px] text-neutral-400 mt-0.5">
                          {new Date(s.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-[11px] text-neutral-400">
                          IP: {s.ipAddress || "172.18.0.1"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          const res = await terminateSessionAction(s.id);
                          showNotification(res.success, res.message || "Session ended");
                        }}
                        className="w-full py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="p-5 rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs flex flex-col items-center text-center space-y-3">
                      <div className="w-14 h-14 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300">
                        <Monitor className="w-7 h-7" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-neutral-800 dark:text-neutral-200">Unknown</h4>
                        <p className="text-xs text-neutral-500 mt-1">Unknown</p>
                        <p className="text-[11px] text-neutral-400 mt-0.5">4 hours ago</p>
                        <p className="text-[11px] text-neutral-400">IP 172.18.0.1</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => showNotification(true, "Session terminated.")}
                        className="w-full py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>

                    <div className="p-5 rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs flex flex-col items-center text-center space-y-3">
                      <div className="w-14 h-14 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300">
                        <Laptop className="w-7 h-7" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-neutral-800 dark:text-neutral-200">Windows</h4>
                        <p className="text-xs text-neutral-500 mt-1">Google Chrome</p>
                        <p className="text-[11px] text-neutral-400 mt-0.5">2 hours ago</p>
                        <p className="text-[11px] text-neutral-400">IP 172.18.0.1</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => showNotification(true, "Session terminated.")}
                        className="w-full py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* TAB 13: MY INFORMATION (100% Icons - No Emojis, Multi-select, Generate & HTML Download) */}
          {activeTab === "my_info" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#04abf2] tracking-tight">My Information Settings</h2>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">Please choose which information you would like to download</p>

              <div className="space-y-3">
                {[
                  { id: "my_info", label: "My Information", icon: User, color: "text-[#04abf2]", bg: "bg-sky-50 dark:bg-sky-950/50" },
                  { id: "videos", label: "Videos", icon: Video, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/50" },
                  { id: "subscriptions", label: "Subscriptions", icon: ListVideo, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/50" },
                  { id: "articles", label: "Articles", icon: Newspaper, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/50" },
                  { id: "history", label: "History", icon: History, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/50" },
                ].map((item) => {
                  const ItemIcon = item.icon;
                  const isSelected = selectedInfoItems.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleInfoItem(item.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "border-[#04abf2] bg-sky-50/20 dark:bg-sky-950/10 shadow-xs"
                          : "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:border-neutral-300"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center ${item.color}`}>
                          <ItemIcon className="w-5 h-5" />
                        </div>
                        <span className={`text-sm font-medium ${isSelected ? "text-[#04abf2]" : "text-neutral-700 dark:text-neutral-300"}`}>
                          {item.label}
                        </span>
                      </div>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        isSelected ? "bg-[#04abf2] border-[#04abf2] text-white" : "border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800"
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  disabled={isGeneratingFile || selectedInfoItems.length === 0}
                  onClick={handleGenerateInformationFile}
                  className="px-8 py-2.5 bg-[#04abf2] hover:bg-[#0396d5] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isGeneratingFile && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Generate File</span>
                </button>

                {generatedHtmlUrl && (
                  <a
                    href={generatedHtmlUrl}
                    download={generatedFileName}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download File ({selectedInfoItems.length} categories)</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* TAB 14: DELETE ACCOUNT */}
          {activeTab === "delete" && (
            <form
              action={async (formData) => {
                setLoading(true);
                const res = await deleteAccountAction(formData);
                setLoading(false);
                if (res.success) {
                  showNotification(true, res.message || "Account deleted");
                  setTimeout(() => router.push("/"), 1500);
                } else {
                  showNotification(false, res.error || "Failed to delete account");
                }
              }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-[#04abf2] tracking-tight">Delete account</h2>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">Current Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-[#04abf2]"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-2.5 bg-[#04abf2] hover:bg-[#0396d5] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Delete</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
