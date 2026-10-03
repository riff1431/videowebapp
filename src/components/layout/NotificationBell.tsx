"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Bell, Check, ExternalLink, Loader2 } from "lucide-react";
import {
  fetchUserNotificationsAction,
  markNotificationsReadAction,
} from "@/modules/notifications/notification.actions";

export interface NotificationItem {
  id: number;
  type: string;
  text: string;
  url: string;
  seen: number;
  createdAt: Date | string;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial fetch of unread count and latest notifications
    fetchUserNotificationsAction().then((res) => {
      if (res.success && res.notifications) {
        setItems(res.notifications as any);
        setUnreadCount(res.unreadCount || 0);
      }
    });

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleOpenDropdown() {
    const nextState = !open;
    setOpen(nextState);

    if (nextState) {
      setLoading(true);
      const res = await fetchUserNotificationsAction();
      if (res.success && res.notifications) {
        setItems(res.notifications as any);
        setUnreadCount(res.unreadCount || 0);
      }
      setLoading(false);

      if (unreadCount > 0) {
        // Mark all as read
        await markNotificationsReadAction();
        setUnreadCount(0);
        setItems((prev) => prev.map((item) => ({ ...item, seen: 1 })));
      }
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpenDropdown}
        className="p-1.5 text-neutral-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/10 rounded-md transition-colors relative cursor-pointer"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center leading-tight">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-[#212121] rounded-xl shadow-2xl border border-[var(--border)] py-2 z-50 text-xs">
          <div className="px-4 py-2 border-b border-[var(--border)] flex items-center justify-between font-bold text-neutral-900 dark:text-white">
            <span>Notifications</span>
            {unreadCount === 0 && (
              <span className="text-[11px] font-normal text-neutral-400">All caught up</span>
            )}
          </div>

          {loading ? (
            <div className="p-6 text-center text-neutral-400 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading notifications...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="p-6 text-center text-neutral-400">
              No notifications yet.
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {items.map((n) => (
                <Link
                  key={n.id}
                  href={n.url || "/"}
                  onClick={() => setOpen(false)}
                  className={`block px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
                    n.seen === 0 ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                  }`}
                >
                  <p className="text-xs text-neutral-800 dark:text-neutral-200 leading-snug">
                    {n.text}
                  </p>
                  <span className="text-[10px] text-neutral-400 mt-1 block">
                    {new Date(n.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
