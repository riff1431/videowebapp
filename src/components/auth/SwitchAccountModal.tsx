"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, PlusCircle, CheckCircle, Trash2, Loader2, Check } from "lucide-react";
import { useTranslation } from "@/providers/language-provider";
import {
  SwitchedAccountItem,
  switchAccountAction,
  removeSwitchedAccountAction,
  prepareAddAccountAction,
} from "@/modules/auth/switch-account.actions";
import { getPublicImageUrl } from "@/lib/storage/image-url";


interface SwitchAccountModalProps {
  initialAccounts: SwitchedAccountItem[];
  canAddMore: boolean;
}

export function SwitchAccountModal({
  initialAccounts,
  canAddMore,
}: SwitchAccountModalProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const [accounts, setAccounts] = useState<SwitchedAccountItem[]>(initialAccounts);
  const [loadingUserId, setLoadingUserId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleClose = () => {
    router.back();
  };

  const handleSwitch = async (targetUserId: number, isActive?: boolean) => {
    if (isActive) return;
    setLoadingUserId(targetUserId);
    setErrorMsg(null);
    try {
      const res = await switchAccountAction(targetUserId);
      if (res.success) {
        router.push("/");
        router.refresh();
      } else {
        setErrorMsg(res.error || t("failed_to_switch", "Failed to switch account"));
        setLoadingUserId(null);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || t("failed_to_switch", "Failed to switch account"));
      setLoadingUserId(null);
    }
  };

  const handleRemove = async (e: React.MouseEvent, userId: number) => {
    e.stopPropagation();
    try {
      const res = await removeSwitchedAccountAction(userId);
      if (res.success) {
        setAccounts((prev) => prev.filter((a) => a.userId !== userId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddAccount = async () => {
    setIsAdding(true);
    try {
      await prepareAddAccountAction();
      router.push("/login?type=add_account");
    } catch (err) {
      router.push("/login?type=add_account");
    }
  };

  // Check if only 1 account or 0 other accounts
  const otherAccounts = accounts.filter((a) => !a.isActive);
  const hasMultipleAccounts = accounts.length > 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      {/* Modal Container matching PlayTube dark theme screenshot */}
      <div className="w-full max-w-[480px] bg-[#121212] text-white rounded-xl shadow-2xl border border-neutral-800/80 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800/60">
          <h2 className="text-base font-bold text-white tracking-wide">
            {t("switch_account", "Switch Account")}
          </h2>
          <button
            onClick={handleClose}
            className="text-neutral-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Account List (when multiple accounts exist) */}
          {hasMultipleAccounts && (
            <div className="space-y-2 mb-4">
              {accounts.map((acc) => {
                const isLoading = loadingUserId === acc.userId;
                return (
                  <div
                    key={acc.userId}
                    onClick={() => handleSwitch(acc.userId, acc.isActive)}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                      acc.isActive
                        ? "bg-neutral-800/40 border-[#04abf2]/40 cursor-default"
                        : "bg-neutral-900/60 border-neutral-800/80 hover:bg-neutral-800/60 hover:border-neutral-700 cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-800 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getPublicImageUrl(acc.avatar, "/upload/photos/d-avatar.jpg") || "/upload/photos/d-avatar.jpg"}
                          alt={acc.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/upload/photos/d-avatar.jpg";
                          }}
                        />
                      </div>

                      {/* Name & Email */}
                      <div className="min-w-0 text-left">
                        <p className="text-xs font-semibold text-white truncate">
                          {acc.name}
                        </p>
                        <p className="text-[11px] text-neutral-400 truncate">
                          {acc.email}
                        </p>
                      </div>
                    </div>

                    {/* Status / Action */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 text-[#04abf2] animate-spin" />
                      ) : acc.isActive ? (
                        <div className="w-5 h-5 rounded-full bg-[#04abf2]/20 flex items-center justify-center text-[#04abf2]">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => handleRemove(e, acc.userId)}
                          className="opacity-60 hover:opacity-100 hover:text-red-400 p-1 transition-opacity cursor-pointer"
                          title={t("remove", "Remove")}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Account Button (Matching screenshot pixel-perfect) */}
          {canAddMore && (
            <button
              onClick={handleAddAccount}
              disabled={isAdding}
              className="w-full h-11 bg-[#04abf2] hover:bg-[#0399d8] active:bg-[#028ec8] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md disabled:opacity-70"
            >
              {isAdding ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <>
                  <PlusCircle className="w-4 h-4 fill-white text-[#04abf2]" />
                  <span>{t("add_account", "Add Account")}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
