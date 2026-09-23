import React from "react";
import { db } from "@/db";
import { users } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Users, Shield, CheckCircle, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ManageUsersPage() {
  const allUsers = await db
    .select()
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(50);

  return (
    <div className="space-y-6 text-[var(--admin-text-main)]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--admin-text-main)] tracking-tight">
            Manage Users
          </h1>
          <p className="text-sm text-[var(--admin-text-muted)] mt-1">
            Browse registered channels, assign administrator permissions, and verify accounts.
          </p>
        </div>
        <div className="text-xs bg-[var(--admin-card-bg)] border border-[var(--admin-card-border)] px-3 py-1.5 rounded-lg text-[var(--admin-text-muted)] font-medium shadow-xs">
          Showing {allUsers.length} users
        </div>
      </div>

      <div className="bg-[var(--admin-card-bg)] border border-[var(--admin-card-border)] rounded-2xl shadow-xs overflow-hidden transition-colors duration-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--admin-card-hover)] border-b border-[var(--admin-card-border)] text-xs font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Verified</th>
                <th className="py-3.5 px-4">Admin Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--admin-card-border)]">
              {allUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[var(--admin-text-muted)] text-sm">
                    No users registered.
                  </td>
                </tr>
              ) : (
                allUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[var(--admin-card-hover)] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-neutral-300 dark:bg-neutral-700 overflow-hidden shrink-0 border border-[var(--admin-card-border)]">
                          {u.avatar ? (
                            <img
                              src={u.avatar}
                              alt={u.name || u.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-xs text-[var(--admin-text-muted)]">
                              {u.username[0]?.toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--admin-text-main)] text-xs">
                            {u.name || u.username}
                          </p>
                          <p className="text-[11px] text-[var(--admin-text-muted)]">
                            @{u.username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[var(--admin-text-muted)] font-mono">
                      {u.email}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === "admin" ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-neutral-500/10 text-[var(--admin-text-muted)] border border-neutral-500/20"
                      }`}>
                        {(u.role || "user").toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      {u.verified ? (
                        <span className="inline-flex items-center gap-1 text-[#04abf2] font-medium">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Verified
                        </span>
                      ) : (
                        <span className="text-[var(--admin-text-muted)]">Unverified</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      {u.isAdmin ? (
                        <span className="inline-flex items-center gap-1 text-red-500 font-semibold">
                          <Shield className="w-3.5 h-3.5" />
                          Administrator
                        </span>
                      ) : (
                        <span className="text-[var(--admin-text-muted)]">Standard User</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
