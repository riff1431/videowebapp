"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Loader2 } from "lucide-react";
import { toggleSubscribeAction } from "@/modules/videos/video.actions";
import { useTranslation } from "@/providers/language-provider";
import { authClient } from "@/lib/auth/auth-client";

interface ChannelSubscribeButtonProps {
  channelUserId: number;
  initialSubscribed?: boolean;
}

export function ChannelSubscribeButton({
  channelUserId,
  initialSubscribed = false,
}: ChannelSubscribeButtonProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { data: session } = authClient.useSession();
  const isLoggedIn = !!session?.user;

  const [isSubscribed, setIsSubscribed] = useState(initialSubscribed);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (!isLoggedIn) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (loading) return;

    setLoading(true);
    const nextState = !isSubscribed;
    setIsSubscribed(nextState);

    try {
      const res = await toggleSubscribeAction({ channelUserId });
      if (!res.success) {
        setIsSubscribed(!nextState);
      } else {
        router.refresh();
      }
    } catch {
      setIsSubscribed(!nextState);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold uppercase rounded-md shadow-xs transition-colors cursor-pointer disabled:opacity-70 ${
        isSubscribed
          ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-600"
          : "bg-[#04abf2] hover:bg-[#0399d8] text-white"
      }`}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Bell className="w-3.5 h-3.5" />
      )}
      <span>
        {isSubscribed
          ? t("subscribed", "Subscribed")
          : t("subscribe", "Subscribe")}
      </span>
    </button>
  );
}
