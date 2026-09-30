import React from "react";
import Link from "next/link";
import { db } from "@/db";
import { users, messages } from "@/db/schema";
import { eq, or, and, desc, ne } from "drizzle-orm";
import { MessageSquare, Send, Trash2, Search, User, CheckCheck, Clock } from "lucide-react";
import { sendMessageAction, clearChatAction } from "@/modules/messages/message.actions";
import { requireAuth } from "@/lib/auth/require-auth";

interface MessagesPageProps {
  searchParams: Promise<{
    user?: string;
  }>;
}

export const revalidate = 0; // Dynamic chat

export default async function MessagesPage({ searchParams }: MessagesPageProps) {
  const session = await requireAuth("/messages");
  const resolvedParams = await searchParams;
  const targetUsername = resolvedParams.user || "";

  const [currentUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, Number(session.user.id)))
    .limit(1);

  // Fetch all potential conversation partners
  const contactUsers = await db
    .select({
      id: users.id,
      username: users.username,
      name: users.name,
      avatar: users.avatar,
      verified: users.verified,
    })
    .from(users)
    .where(ne(users.id, currentUser?.id || 1))
    .limit(20);

  // Active chat user
  let activeUser = contactUsers[0] || null;
  if (targetUsername) {
    const found = contactUsers.find((u) => u.username === targetUsername);
    if (found) activeUser = found;
  }

  // Fetch message history with activeUser
  let chatMessages: any[] = [];
  if (currentUser && activeUser) {
    chatMessages = await db
      .select()
      .from(messages)
      .where(
        or(
          and(eq(messages.fromId, currentUser.id), eq(messages.toId, activeUser.id)),
          and(eq(messages.fromId, activeUser.id), eq(messages.toId, currentUser.id))
        )
      )
      .orderBy(messages.id)
      .limit(100);
  }

  async function handleSendMessage(formData: FormData) {
    "use server";
    const text = formData.get("text") as string;
    if (text && activeUser) {
      await sendMessageAction(activeUser.id, text);
    }
  }

  async function handleClearChat() {
    "use server";
    if (activeUser) {
      await clearChatAction(activeUser.id);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* PlayTube pt_msg_main layout */}
      <div className="bg-white dark:bg-neutral-900 border border-[var(--border)] rounded-2xl overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-12 min-h-[620px]">
        {/* Left Sidebar Users List */}
        <div className="md:col-span-4 border-r border-[var(--border)] flex flex-col">
          <div className="p-4 border-b border-[var(--border)]">
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2 mb-3">
              <MessageSquare className="w-5 h-5 text-[var(--primary)]" />
              <span>Direct Messages</span>
            </h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-[var(--primary)]"
              />
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2" />
            </div>
          </div>

          {/* Conversations list */}
          <div className="flex-1 overflow-y-auto divide-y divide-[var(--border)]">
            {contactUsers.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-500">
                No users available to message.
              </div>
            ) : (
              contactUsers.map((u) => {
                const isActive = activeUser?.id === u.id;
                return (
                  <Link
                    key={u.id}
                    href={`/messages?user=${u.username}`}
                    className={`flex items-center gap-3 p-3.5 transition-colors ${
                      isActive
                        ? "bg-[var(--primary)]/10 text-neutral-900 dark:text-white"
                        : "hover:bg-neutral-50 dark:hover:bg-neutral-800/50 text-neutral-700 dark:text-neutral-300"
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={u.avatar || "/upload/photos/d-avatar.jpg"}
                        alt={u.name || u.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-neutral-900" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold truncate">
                          {u.name || u.username}
                        </h4>
                      </div>
                      <p className="text-[11px] text-neutral-500 truncate">@{u.username}</p>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Right Active Conversation Pane */}
        <div className="md:col-span-8 flex flex-col justify-between">
          {activeUser ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-800/20">
                <div className="flex items-center gap-3">
                  <Link href={`/channel/${activeUser.username}`}>
                    <img
                      src={activeUser.avatar || "/upload/photos/d-avatar.jpg"}
                      alt={activeUser.name || activeUser.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </Link>
                  <div>
                    <Link
                      href={`/channel/${activeUser.username}`}
                      className="text-sm font-bold text-neutral-900 dark:text-neutral-100 hover:text-[var(--primary)] transition-colors"
                    >
                      {activeUser.name || activeUser.username}
                    </Link>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      Active Now
                    </p>
                  </div>
                </div>

                {/* Clear chat action */}
                <form action={handleClearChat}>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                    title="Clear Conversation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Clear Chat</span>
                  </button>
                </form>
              </div>

              {/* Message Feed Area */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 max-h-[460px]">
                {chatMessages.length === 0 ? (
                  <div className="text-center py-16">
                    <MessageSquare className="w-10 h-10 text-neutral-400 mx-auto mb-2 opacity-40" />
                    <p className="text-xs text-neutral-500">
                      No messages yet with {activeUser.name || activeUser.username}.
                      <br />
                      Say hello to start the conversation!
                    </p>
                  </div>
                ) : (
                  chatMessages.map((msg) => {
                    const isMe = msg.fromId === currentUser?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                            isMe
                              ? "bg-[var(--primary)] text-white rounded-br-xs"
                              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-bl-xs"
                          }`}
                        >
                          <p>{msg.text}</p>
                          <span
                            className={`block text-[9px] mt-1 text-right ${
                              isMe ? "text-white/75" : "text-neutral-400"
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Send Input Area matching PlayTube user-send-message */}
              <div className="p-4 border-t border-[var(--border)] bg-white dark:bg-neutral-900">
                <form action={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    name="text"
                    required
                    placeholder="Write a message..."
                    className="flex-1 px-4 py-2 text-xs sm:text-sm bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-[var(--primary)] text-neutral-900 dark:text-neutral-100 placeholder-neutral-400"
                  />
                  <button
                    type="submit"
                    className="px-5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <MessageSquare className="w-12 h-12 text-neutral-400 mb-3 opacity-50" />
              <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                Select a conversation
              </h3>
              <p className="text-xs text-neutral-500 max-w-xs mt-1">
                Choose a user from the left pane to send direct private messages.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
