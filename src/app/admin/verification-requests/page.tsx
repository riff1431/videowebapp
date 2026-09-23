import React from "react";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { BadgeCheck, Check, X } from "lucide-react";
import { revalidatePath } from "next/cache";

export const revalidate = 0;

export default async function AdminVerificationRequestsPage() {
  const pendingUsers = await db
    .select({
      id: users.id,
      name: users.name,
      username: users.username,
      email: users.email,
      avatar: users.avatar,
      verified: users.verified,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(30);

  async function toggleVerifyUserAction(formData: FormData) {
    "use server";
    const id = Number(formData.get("id"));
    const verified = formData.get("verified") === "true";

    if (id) {
      await db.update(users).set({ verified: !verified }).where(eq(users.id, id));
      revalidatePath("/admin/verification-requests");
      revalidatePath("/admin/users");
    }
  }

  return (
    <div className="space-y-6 max-w-5xl text-[var(--admin-text-main)]">
      <div>
        <h1 className="text-2xl font-bold text-[var(--admin-text-main)] tracking-tight">Channel Verification</h1>
        <p className="text-xs text-[var(--admin-text-muted)] mt-1">
          Review creators and grant verified badges across channel headers and video cards
        </p>
      </div>

      <div className="bg-[var(--admin-card-bg)] rounded-xl border border-[var(--admin-card-border)] shadow-xs overflow-hidden transition-colors duration-200">
        <div className="p-4 border-b border-[var(--admin-card-border)] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[var(--admin-text-main)]">
            Registered Creators ({pendingUsers.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[var(--admin-card-hover)] border-b border-[var(--admin-card-border)] text-[var(--admin-text-muted)] font-semibold">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--admin-card-border)]">
              {pendingUsers.map((u) => (
                <tr key={u.id} className="hover:bg-[var(--admin-card-hover)] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={u.avatar || "/upload/photos/d-avatar.jpg"}
                        alt={u.username}
                        className="w-7 h-7 rounded-full object-cover bg-neutral-300 dark:bg-neutral-700"
                      />
                      <div>
                        <div className="font-semibold text-[var(--admin-text-main)] flex items-center gap-1">
                          <span>{u.name || u.username}</span>
                          {u.verified && <BadgeCheck className="w-3.5 h-3.5 text-[#04abf2]" />}
                        </div>
                        <div className="text-[10px] text-[var(--admin-text-muted)]">@{u.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[var(--admin-text-muted)]">{u.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        u.verified
                          ? "bg-sky-500/10 text-[#04abf2] border border-sky-500/20"
                          : "bg-neutral-500/10 text-[var(--admin-text-muted)] border border-neutral-500/20"
                      }`}
                    >
                      {u.verified ? "Verified" : "Standard"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <form action={toggleVerifyUserAction} className="inline">
                      <input type="hidden" name="id" value={u.id} />
                      <input type="hidden" name="verified" value={String(u.verified)} />
                      <button
                        type="submit"
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors shadow-2xs ${
                          u.verified
                            ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
                            : "bg-[#04abf2] text-white hover:bg-[#039be5]"
                        }`}
                      >
                        {u.verified ? (
                          <>
                            <X className="w-3.5 h-3.5" />
                            <span>Revoke</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Verify Badge</span>
                          </>
                        )}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
