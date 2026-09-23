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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Manage Users
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Browse registered channels, assign administrator permissions, and verify accounts.
          </p>
        </div>
        <div className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-gray-600 font-medium">
          Showing {allUsers.length} users
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Verified</th>
                <th className="py-3.5 px-4">Admin Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400 text-sm">
                    No users registered.
                  </td>
                </tr>
              ) : (
                allUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden shrink-0 border border-gray-200">
                          {u.avatar ? (
                            <img
                              src={u.avatar}
                              alt={u.name || u.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-xs text-gray-500">
                              {u.username[0]?.toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-xs">
                            {u.name || u.username}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            @{u.username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-600 font-mono">
                      {u.email}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === "admin" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
                      }`}>
                        {(u.role || "user").toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      {u.verified ? (
                        <span className="inline-flex items-center gap-1 text-blue-600 font-medium">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Verified
                        </span>
                      ) : (
                        <span className="text-gray-400">Unverified</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      {u.isAdmin ? (
                        <span className="inline-flex items-center gap-1 text-red-600 font-semibold">
                          <Shield className="w-3.5 h-3.5" />
                          Administrator
                        </span>
                      ) : (
                        <span className="text-gray-400">Standard User</span>
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
