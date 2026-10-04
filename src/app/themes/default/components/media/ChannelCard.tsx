"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar } from "@/app/themes/default/components/ui/avatar";
import { Button } from "@/app/themes/default/components/ui/button";
import { CheckCircle2, Loader2, UserCheck, UserPlus } from "lucide-react";
import { toggleSubscribeAction } from "@/modules/videos/video.actions";
import { getPublicImageUrl } from "@/lib/storage/image-url";
import { useTranslation } from "@/providers/language-provider";

export interface ChannelItem {
  id: number;
  username: string;
  name: string | null;
  avatar: string | null;
  cover?: string | null;
  verified?: boolean | null;
  subscriberCount?: number;
  videoCount?: number;
  isSubscribed?: boolean;
}

export function ChannelCard({
  channel,
  isLoggedIn = false,
}: {
  channel: ChannelItem;
  isLoggedIn?: boolean;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const [subscribed, setSubscribed] = useState(Boolean(channel.isSubscribed));
  const [subCount, setSubCount] = useState(channel.subscriberCount || 0);
  const [loading, setLoading] = useState(false);

  const avatarUrl =
    getPublicImageUrl(channel.avatar, "/upload/photos/d-avatar.jpg") ||
    "/upload/photos/d-avatar.jpg";
  const displayName = channel.name || channel.username;

  const handleSubscribeToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    if (!isLoggedIn) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setLoading(true);
    const nextSubscribed = !subscribed;
    setSubscribed(nextSubscribed);
    setSubCount((prev) => (nextSubscribed ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const res = await toggleSubscribeAction({ channelUserId: channel.id });
      if (!res.success) {
        setSubscribed(subscribed);
        setSubCount(channel.subscriberCount || 0);
      }
    } catch {
      setSubscribed(subscribed);
      setSubCount(channel.subscriberCount || 0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
      <Link
        href={`/@${channel.username}`}
        className="flex items-center gap-3.5 min-w-0"
      >
        <Avatar
          src={avatarUrl}
          alt={displayName}
          size="lg"
          className="ring-2 ring-black/5 dark:ring-white/10"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <h4 className="text-xs sm:text-sm font-semibold text-[var(--default-text)] truncate">
              {displayName}
            </h4>
            {channel.verified && (
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            )}
          </div>
          <p className="text-[11px] text-[var(--default-muted)] truncate">
            @{channel.username} • {subCount.toLocaleString()} {t("subscribers", "subscribers")}
          </p>
        </div>
      </Link>

      <Button
        type="button"
        size="sm"
        variant={subscribed ? "subtle" : "default"}
        onClick={handleSubscribeToggle}
        disabled={loading}
        className="shrink-0 rounded-full px-4 text-[11px]"
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
        ) : subscribed ? (
          <UserCheck className="w-3.5 h-3.5 mr-1" />
        ) : (
          <UserPlus className="w-3.5 h-3.5 mr-1" />
        )}
        <span>{subscribed ? t("subscribed", "Subscribed") : t("subscribe", "Subscribe")}</span>
      </Button>
    </div>
  );
}
