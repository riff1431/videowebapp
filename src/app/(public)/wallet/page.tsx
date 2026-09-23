import React from "react";
import Link from "next/link";
import { db } from "@/db";
import { users, transactions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Wallet, DollarSign, ArrowUpRight, ArrowDownLeft, Plus, History, ShieldCheck } from "lucide-react";
import { depositWalletAction, requestWithdrawalAction } from "@/modules/wallet/wallet.actions";

export const revalidate = 0; // Dynamic real-time ledger

export default async function WalletPage() {
  const [user] = await db.select().from(users).limit(1);
  const walletAmount = user?.wallet || 0;
  const balanceAmount = user?.balance || 0;

  // Fetch recent ledger transactions
  const userTransactions = await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, user?.id || 1))
    .orderBy(desc(transactions.id))
    .limit(20);

  async function handleDeposit(formData: FormData) {
    "use server";
    const amt = parseFloat(formData.get("amount") as string);
    if (!isNaN(amt) && amt > 0) {
      await depositWalletAction(amt);
    }
  }

  async function handleWithdraw(formData: FormData) {
    "use server";
    const amt = parseFloat(formData.get("amount") as string);
    const email = formData.get("email") as string;
    if (!isNaN(amt) && amt > 0 && email) {
      await requestWithdrawalAction(amt, email);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* PlayTube yp_sett_header Header */}
      <div className="flex items-center gap-3 pb-6 border-b border-[var(--border)] mb-8">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
          <Wallet className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Wallet & Earnings
          </h1>
          <p className="text-xs text-neutral-500">
            Manage your personal wallet balance, payouts, and purchase history
          </p>
        </div>
      </div>

      {/* Cards Row matching PlayTube pt_invit_link green/blue */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Wallet Balance Card (For purchases & Pro) */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
              Personal Wallet
            </span>
            <div className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">
              ${walletAmount.toFixed(2)}
            </div>
            <p className="mt-1 text-xs text-emerald-100">
              Used for buying movie rentals, gifts, and PRO memberships.
            </p>
          </div>

          {/* Quick Replenish Form */}
          <form action={handleDeposit} className="mt-6 pt-4 border-t border-white/20 flex gap-2 relative z-10">
            <input
              type="number"
              name="amount"
              min="5"
              step="5"
              placeholder="$50"
              required
              className="w-24 px-3 py-2 bg-white/20 text-white placeholder-emerald-200 text-xs font-bold rounded-xl focus:outline-none border border-white/30"
            />
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Top-Up Wallet</span>
            </button>
          </form>
        </div>

        {/* Creator Earnings Card (For monetization payouts) */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
              Creator Earnings
            </span>
            <div className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">
              ${balanceAmount.toFixed(2)}
            </div>
            <p className="mt-1 text-xs text-blue-100">
              Revenue generated from video monetization, views, and subscriptions.
            </p>
          </div>

          {/* Withdrawal Request Form */}
          <form action={handleWithdraw} className="mt-6 pt-4 border-t border-white/20 flex flex-col sm:flex-row gap-2 relative z-10">
            <input
              type="number"
              name="amount"
              min="10"
              step="5"
              placeholder="Amount ($)"
              required
              className="w-full sm:w-28 px-3 py-2 bg-white/20 text-white placeholder-blue-200 text-xs font-bold rounded-xl focus:outline-none border border-white/30"
            />
            <input
              type="email"
              name="email"
              placeholder="PayPal Email Address"
              required
              className="flex-1 px-3 py-2 bg-white/20 text-white placeholder-blue-200 text-xs rounded-xl focus:outline-none border border-white/30"
            />
            <button
              type="submit"
              className="py-2 px-4 bg-white text-blue-800 hover:bg-blue-50 text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Withdraw</span>
            </button>
          </form>
        </div>
      </div>

      {/* Transactions History Ledger */}
      <div className="bg-white dark:bg-neutral-900 border border-[var(--border)] rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border)] mb-6">
          <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <History className="w-4 h-4 text-neutral-500" />
            <span>Transaction Ledger</span>
          </h3>
          <span className="text-xs text-neutral-500">
            {userTransactions.length} records found
          </span>
        </div>

        {userTransactions.length === 0 ? (
          <div className="text-center py-10">
            <DollarSign className="w-10 h-10 text-neutral-400 mx-auto mb-2 opacity-50" />
            <p className="text-xs text-neutral-500">
              No transactions recorded yet in your account.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] text-neutral-500 uppercase tracking-wider font-semibold">
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Description</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] text-neutral-700 dark:text-neutral-300">
                {userTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                    <td className="py-3 font-bold uppercase tracking-wider text-[11px]">
                      {tx.type}
                    </td>
                    <td className="py-3">{tx.description || "N/A"}</td>
                    <td className="py-3 font-semibold">
                      {tx.type === "deposit" ? "+" : "-"}${tx.amount.toFixed(2)}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          tx.status === "completed"
                            ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700"
                            : "bg-amber-100 dark:bg-amber-950/40 text-amber-700"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 text-neutral-500">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
