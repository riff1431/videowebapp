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
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Channel Verification</h1>
        <p className="text-xs text-gray-500 mt-1">
          Review creators and grant verified badges across channel headers and video cards
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-800">
            Registered Creators ({pendingUsers.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/75 border-b border-gray-100 text-gray-500 font-semibold">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pendingUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={u.avatar || "/upload/photos/d-avatar.jpg"}
                        alt={u.username}
                        className="w-7 h-7 rounded-full object-cover bg-gray-200"
                      />
                      <div>
                        <div className="font-semibold text-gray-800 flex items-center gap-1">
                          <span>{u.name || u.username}</span>
                          {u.verified && <BadgeCheck className="w-3.5 h-3.5 text-[var(--primary)]" />}
                        </div>
                        <div className="text-[10px] text-gray-400">@{u.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-500">{u.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        u.verified
                          ? "bg-sky-100 text-[var(--primary)]"
                          : "bg-gray-100 text-gray-600"
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
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]"
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
