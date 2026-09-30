"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Layers,
  Wallet,
  Plus,
  CircleDollarSign,
  Upload,
  Loader2,
  Check,
  AlertCircle,
  Paperclip,
} from "lucide-react";
import { createAdAction } from "@/modules/ads/ads.actions";

interface CreateAdClientProps {
  wallet: number;
  balance: number;
}

export function CreateAdClient({ wallet, balance }: CreateAdClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const formData = new FormData(e.currentTarget);
    const res = await createAdAction(formData);

    setLoading(false);
    if (res.success) {
      setSuccessMsg("Advertisement created successfully!");
      setTimeout(() => {
        router.push("/ads");
      }, 1000);
    } else {
      setErrorMsg(res.error || "Failed to create ad.");
    }
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
        {/* Left Sidebar */}
        <div className="lg:col-span-3 space-y-4">
          {/* Cyan Available Balance Header Card */}
          <div className="bg-[#04abf2] text-white rounded-xl p-6 shadow-xs flex flex-col justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-90">
              <CircleDollarSign className="w-4 h-4" />
              <span>Available balance</span>
            </div>
            <div className="text-3xl sm:text-4xl font-light mt-3">
              ${balance.toFixed(2)}
            </div>
          </div>

          {/* Navigation Items */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xs border border-neutral-100 dark:border-neutral-800 overflow-hidden">
            <nav className="flex flex-col">
              {/* Advertising Tab -> takes to /ads */}
              <Link
                href="/ads"
                className="flex items-center gap-3.5 px-6 py-3.5 text-[13px] font-normal text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors border-l-[3.5px] border-transparent"
              >
                <Layers className="w-4 h-4 text-neutral-500" />
                <span>Advertising</span>
              </Link>

              {/* Wallet Button -> takes to /wallet */}
              <Link
                href="/wallet"
                className="flex items-center gap-3.5 px-6 py-3.5 text-[13px] font-normal text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors border-l-[3.5px] border-transparent"
              >
                <Wallet className="w-4 h-4 text-neutral-500" />
                <span>Wallet</span>
              </Link>

              {/* Create ad Tab (Active) */}
              <div className="flex items-center gap-3.5 px-6 py-3.5 text-[13px] font-medium text-neutral-900 dark:text-white bg-neutral-50 dark:bg-neutral-800/60 border-l-[3.5px] border-[#04abf2]">
                <Plus className="w-4 h-4 text-neutral-900 dark:text-white" />
                <span>Create ad</span>
              </div>
            </nav>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="lg:col-span-9 bg-white dark:bg-neutral-900 rounded-xl shadow-xs border border-neutral-100 dark:border-neutral-800 overflow-hidden">
          {/* Header Banner */}
          <div className="bg-[#04abf2] text-white px-8 py-5 flex items-center gap-2 text-base font-bold">
            <Layers className="w-5 h-5" />
            <Link href="/ads" className="hover:underline">
              Advertising
            </Link>
            <span className="text-white/80">&gt;</span>
            <span>Create ad</span>
          </div>

          {/* Golden accent bar */}
          <div className="h-1.5 w-full bg-[#8b7961]/40" />

          {/* Form Content */}
          <div className="p-8 sm:p-10 space-y-6">
            {/* Wallet warning / top-up prompt */}
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Your current wallet balance is: {wallet}, please top up your wallet to continue.{" "}
              <Link href="/wallet" className="text-neutral-900 dark:text-white font-medium hover:underline">
                Top Up
              </Link>
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Row 1: Name & Target Audience */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder=""
                    className="w-full px-4 py-2.5 bg-neutral-100/70 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-[#04abf2]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
                    Target Audience
                  </label>
                  <select
                    name="targetAudience"
                    defaultValue="Target Audience"
                    className="w-full px-4 py-2.5 bg-neutral-100/70 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-700 dark:text-neutral-300 focus:outline-none focus:border-[#04abf2]"
                  >
                    <option value="Target Audience">Target Audience</option>
                    <option value="All">All Audience</option>
                    <option value="Young Adults (18-24)">Young Adults (18-24)</option>
                    <option value="Adults (25-34)">Adults (25-34)</option>
                    <option value="Mature (35+)">Mature (35+)</option>
                  </select>
                </div>
              </div>

              {/* Row 2: URL & Placement */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
                    URL
                  </label>
                  <input
                    type="url"
                    name="url"
                    required
                    placeholder=""
                    className="w-full px-4 py-2.5 bg-neutral-100/70 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-[#04abf2]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
                    Placement
                  </label>
                  <select
                    name="placement"
                    defaultValue="Videos (Format Video / Image)"
                    className="w-full px-4 py-2.5 bg-neutral-100/70 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-700 dark:text-neutral-300 focus:outline-none focus:border-[#04abf2]"
                  >
                    <option value="Videos (Format Video / Image)">
                      Videos (Format Video / Image)
                    </option>
                    <option value="Sidebar Banner">Sidebar Banner</option>
                    <option value="Watch Page Banner">Watch Page Banner</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Title & Pricing (The 2 requested options) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder=""
                    className="w-full px-4 py-2.5 bg-neutral-100/70 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-[#04abf2]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
                    Pricing
                  </label>
                  <select
                    name="pricing"
                    defaultValue="Pay Per Click ($ 0.5)"
                    className="w-full px-4 py-2.5 bg-neutral-100/70 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-700 dark:text-neutral-300 focus:outline-none focus:border-[#04abf2]"
                  >
                    <option value="Pay Per Click ($ 0.5)">Pay Per Click ($ 0.5)</option>
                    <option value="Pay Per Impression ($ 0.1)">Pay Per Impression ($ 0.1)</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Description & Limits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    placeholder=""
                    className="w-full px-4 py-3 bg-neutral-100/70 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-[#04abf2]"
                  />
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
                        Spending limit per day
                      </label>
                      <input
                        type="number"
                        name="dayLimit"
                        defaultValue="0"
                        className="w-full px-4 py-2.5 bg-neutral-100/70 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-[#04abf2]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
                        Total ads spending limit
                      </label>
                      <input
                        type="number"
                        name="totalLimit"
                        defaultValue="0"
                        className="w-full px-4 py-2.5 bg-neutral-100/70 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-[#04abf2]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Select Media Upload Area */}
              <div>
                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
                  Select Media
                </label>
                <label className="w-full border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:border-[#04abf2] transition-colors">
                  <Paperclip className="w-4 h-4 text-[#04abf2]" />
                  <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    {selectedFileName || "Browse To Upload"}
                  </span>
                  <input
                    type="file"
                    name="mediaFile"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setSelectedFileName(e.target.files[0].name);
                      }
                    }}
                  />
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-2.5 bg-[#04abf2] hover:bg-[#0396d5] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  <span>PUBLISH</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
