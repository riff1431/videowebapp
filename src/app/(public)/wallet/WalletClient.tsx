"use client";

import React, { useState } from "react";
import {
  Wallet,
  Coins,
  X,
  Loader2,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  PlusCircle,
} from "lucide-react";
import {
  depositWalletAction,
  transferBalanceToWalletAction,
  transferWalletToBalanceAction,
} from "@/modules/wallet/wallet.actions";

interface TransactionItem {
  id: number;
  type: string;
  amount: number;
  currency: string | null;
  status: string | null;
  description: string | null;
  createdAt: Date;
}

interface WalletClientProps {
  initialWallet: number;
  initialBalance: number;
  transactions: TransactionItem[];
}

export function WalletClient({
  initialWallet,
  initialBalance,
  transactions,
}: WalletClientProps) {
  const [wallet, setWallet] = useState<number>(initialWallet);
  const [balance, setBalance] = useState<number>(initialBalance);

  // Modal states: null | 'replenish' | 'transfer'
  const [activeModal, setActiveModal] = useState<"replenish" | "transfer" | null>(null);

  // Transfer direction: "balance_to_wallet" (default in PlayTube) or "wallet_to_balance"
  const [transferDirection, setTransferDirection] = useState<
    "balance_to_wallet" | "wallet_to_balance"
  >("balance_to_wallet");

  // Form input amounts
  const [replenishAmount, setReplenishAmount] = useState<string>("10.00");
  const [transferAmount, setTransferAmount] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [transferError, setTransferError] = useState("");
  const [successBanner, setSuccessBanner] = useState("");

  const handleOpenReplenish = () => {
    setReplenishAmount("10.00");
    setActiveModal("replenish");
  };

  const handleOpenTransfer = (dir: "balance_to_wallet" | "wallet_to_balance" = "balance_to_wallet") => {
    setTransferDirection(dir);
    setTransferAmount("");
    setTransferError("");
    setActiveModal("transfer");
  };

  const handleCloseModal = () => {
    if (!loading) {
      setActiveModal(null);
      setTransferError("");
    }
  };

  const handleReplenishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(replenishAmount);
    if (isNaN(amt) || amt <= 0) return;

    setLoading(true);
    try {
      const res = await depositWalletAction(amt);
      if (res.success && res.balance !== undefined) {
        setWallet(res.balance);
        setSuccessBanner(`Successfully replenished $${amt.toFixed(2)} to your wallet!`);
        setActiveModal(null);
        setTimeout(() => setSuccessBanner(""), 5000);
      }
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const handleTransferChange = (val: string) => {
    setTransferAmount(val);
    const amt = parseFloat(val);
    const maxSource = transferDirection === "balance_to_wallet" ? balance : wallet;

    if (!isNaN(amt) && amt > maxSource) {
      if (transferDirection === "balance_to_wallet") {
        setTransferError("You don`t have enough balance to transfer!");
      } else {
        setTransferError("You don`t have enough wallet balance to transfer!");
      }
    } else {
      setTransferError("");
    }
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(transferAmount);
    if (isNaN(amt) || amt <= 0) {
      setTransferError("Please enter a valid amount.");
      return;
    }

    const maxSource = transferDirection === "balance_to_wallet" ? balance : wallet;
    if (amt > maxSource) {
      if (transferDirection === "balance_to_wallet") {
        setTransferError("You don`t have enough balance to transfer!");
      } else {
        setTransferError("You don`t have enough wallet balance to transfer!");
      }
      return;
    }

    setLoading(true);
    setTransferError("");

    try {
      if (transferDirection === "balance_to_wallet") {
        const res = await transferBalanceToWalletAction(amt);
        if (res.success) {
          setBalance((prev) => Math.max(0, prev - amt));
          setWallet((prev) => prev + amt);
          setSuccessBanner(`Successfully transferred $${amt.toFixed(2)} from balance to wallet!`);
          setActiveModal(null);
          setTimeout(() => setSuccessBanner(""), 5000);
        } else {
          setTransferError(res.error || "Failed to transfer balance.");
        }
      } else {
        const res = await transferWalletToBalanceAction(amt);
        if (res.success) {
          setWallet((prev) => Math.max(0, prev - amt));
          setBalance((prev) => prev + amt);
          setSuccessBanner(`Successfully transferred $${amt.toFixed(2)} from wallet to balance!`);
          setActiveModal(null);
          setTimeout(() => setSuccessBanner(""), 5000);
        } else {
          setTransferError(res.error || "Failed to transfer balance.");
        }
      }
    } catch {
      setTransferError("An error occurred during transfer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Top Header Card matching PlayTube UI */}
      <div className="bg-white dark:bg-[#1a1a1a] border border-neutral-200/80 dark:border-neutral-800 rounded-xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between pb-5 mb-6 border-b border-neutral-200/80 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#04abf2] flex items-center justify-center text-white shrink-0 shadow-xs">
              <Wallet className="w-4 h-4 stroke-[2.2]" />
            </div>
            <h1 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
              Wallet
            </h1>
          </div>
        </div>

        {/* Global Notification Banner */}
        {successBanner && (
          <div className="mb-6 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-2.5 shadow-2xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successBanner}</span>
          </div>
        )}

        {/* Balance Cards (Exact PlayTube Visual Parity) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: WALLET */}
          <div className="bg-[#edf5f0] dark:bg-[#16251b] border border-[#d8edd9] dark:border-[#1e3b26] rounded-xl p-6 relative flex flex-col justify-between min-h-[170px]">
            <div>
              {/* Leather Wallet Icon with snap button */}
              <div className="w-10 h-10 rounded-lg bg-[#388e3c]/15 text-[#2e7d32] dark:text-[#81c784] flex items-center justify-center mb-3">
                <Wallet className="w-6 h-6 stroke-[2]" />
              </div>
              <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                WALLET
              </p>
              <h2 className="text-3xl sm:text-4xl font-normal text-neutral-800 dark:text-white mt-1">
                ${wallet.toFixed(2)}
              </h2>
            </div>
            <div className="pt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenReplenish}
                className="bg-[#388e3c] hover:bg-[#2e7d32] active:bg-[#1b5e20] text-white text-xs font-medium px-6 py-2 rounded-full transition-colors cursor-pointer shadow-xs select-none"
              >
                Replenish
              </button>
              {wallet > 0 && (
                <button
                  type="button"
                  onClick={() => handleOpenTransfer("wallet_to_balance")}
                  className="text-xs text-neutral-600 dark:text-neutral-400 hover:text-[#04abf2] dark:hover:text-[#04abf2] transition-colors px-2 py-1 cursor-pointer"
                >
                  Transfer to Balance
                </button>
              )}
            </div>
          </div>

          {/* Card 2: AVAILABLE BALANCE */}
          <div className="bg-[#f4f7f9] dark:bg-[#1a2228] border border-[#e2e8ec] dark:border-[#27343e] rounded-xl p-6 relative flex flex-col justify-between min-h-[170px]">
            <div>
              {/* Gold Coins Icon */}
              <div className="w-10 h-10 rounded-lg bg-[#f9a825]/15 text-[#f57f17] flex items-center justify-center mb-3">
                <Coins className="w-6 h-6 stroke-[2]" />
              </div>
              <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                AVAILABLE BALANCE
              </p>
              <h2 className="text-3xl sm:text-4xl font-normal text-neutral-800 dark:text-white mt-1">
                ${balance.toFixed(2)}
              </h2>
            </div>
            <div className="pt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleOpenTransfer("balance_to_wallet")}
                className="bg-[#04abf2] hover:bg-[#0399d8] active:bg-[#028ec8] text-white text-xs font-medium px-6 py-2 rounded-full transition-colors cursor-pointer shadow-xs select-none"
              >
                Transfer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="bg-white dark:bg-[#1a1a1a] border border-neutral-200/80 dark:border-neutral-800 rounded-xl p-6 shadow-xs">
        <h3 className="text-sm font-semibold text-neutral-800 dark:text-white mb-4">
          Recent Wallet Transactions
        </h3>

        {transactions.length === 0 ? (
          <div className="py-10 text-center text-xs text-neutral-400">
            No transactions yet. Replenish your wallet or earn revenue to see records here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-100 dark:border-neutral-800 text-neutral-400 uppercase tracking-wider text-[10px]">
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold">Description</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40">
                    <td className="py-3 capitalize font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                      {tx.type === "deposit" || tx.type === "transfer" || tx.type === "revenue" ? (
                        <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400" />
                      )}
                      <span>{tx.type.replace("_", " ")}</span>
                    </td>
                    <td className="py-3 text-neutral-500 truncate max-w-xs">
                      {tx.description || "Wallet transaction"}
                    </td>
                    <td className="py-3 text-neutral-400">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td
                      className={`py-3 text-right font-semibold ${
                        tx.type === "deposit" || tx.type === "transfer" || tx.type === "revenue"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-neutral-900 dark:text-white"
                      }`}
                    >
                      {tx.type === "deposit" || tx.type === "transfer" || tx.type === "revenue" ? "+" : "-"}$
                      {tx.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* Modal 1: Replenish Wallet Balance (Image 1 Reference)     */}
      {/* ========================================================= */}
      {activeModal === "replenish" && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-[1px] animate-in fade-in duration-150">
          <div className="w-full max-w-[390px] bg-white dark:bg-[#202020] rounded-xl shadow-2xl border border-neutral-100 dark:border-neutral-800 p-6 relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2">
              <h2 className="text-base font-semibold text-neutral-800 dark:text-white">
                Wallet
              </h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors p-1 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mb-3">
              Replenish My Balance
            </p>

            <form onSubmit={handleReplenishSubmit} className="space-y-4">
              {/* Big Number Input with Underline */}
              <div className="relative border-b border-neutral-200 dark:border-neutral-700 pb-2">
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  autoFocus
                  value={replenishAmount}
                  onChange={(e) => setReplenishAmount(e.target.value)}
                  placeholder="00.00"
                  className="w-full text-4xl sm:text-5xl font-light text-neutral-700 dark:text-neutral-200 bg-transparent focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 rounded-full bg-[#4caf50] hover:bg-[#43a047] active:bg-[#388e3c] disabled:opacity-60 text-white text-sm font-medium transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Replenish</span>
                  )}
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleCloseModal}
                  className="w-full h-10 rounded-full bg-[#edf2f6] hover:bg-[#e2e8f0] dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-sm font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* Modal 2: Transfer Available Balance (Image 2 Reference)    */}
      {/* ========================================================= */}
      {activeModal === "transfer" && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-[1px] animate-in fade-in duration-150">
          <div className="w-full max-w-[390px] bg-white dark:bg-[#202020] rounded-xl shadow-2xl border border-neutral-100 dark:border-neutral-800 p-6 relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2">
              <h2 className="text-base font-semibold text-neutral-800 dark:text-white uppercase tracking-tight">
                {transferDirection === "balance_to_wallet" ? "MY BALANCE" : "WALLET TRANSFER"}
              </h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors p-1 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-3">
              {transferDirection === "balance_to_wallet"
                ? "Move your balance to your wallet so you can use it to create ads and use other features."
                : "Move funds from your spending wallet into your available creator balance."}
            </p>

            {/* Direction Indicator & Switcher */}
            <div className="flex items-center justify-between py-1.5 px-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-lg text-[11px] text-neutral-600 dark:text-neutral-300 mb-3 border border-neutral-100 dark:border-neutral-700/60">
              <span>
                Available:{" "}
                <strong className="text-neutral-900 dark:text-white font-semibold">
                  $
                  {(transferDirection === "balance_to_wallet" ? balance : wallet).toFixed(2)}
                </strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  const nextDir =
                    transferDirection === "balance_to_wallet"
                      ? "wallet_to_balance"
                      : "balance_to_wallet";
                  setTransferDirection(nextDir);
                  setTransferError("");
                }}
                className="text-[#04abf2] hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                <ArrowLeftRight className="w-3 h-3" />
                <span>
                  {transferDirection === "balance_to_wallet"
                    ? "Transfer from Wallet instead"
                    : "Transfer from Balance instead"}
                </span>
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-4">
              {/* Big Number Input with Underline */}
              <div className="relative border-b border-neutral-200 dark:border-neutral-700 pb-2">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  autoFocus
                  value={transferAmount}
                  onChange={(e) => handleTransferChange(e.target.value)}
                  placeholder="00.00"
                  className="w-full text-4xl sm:text-5xl font-light text-neutral-700 dark:text-neutral-200 bg-transparent focus:outline-none"
                />
              </div>

              {/* Exact Red Alert from Image 2 */}
              {transferError && (
                <div className="p-2.5 rounded-lg bg-[#fde8e8] dark:bg-red-950/40 text-[#e02424] dark:text-red-300 text-xs flex items-center gap-2 font-medium">
                  <div className="w-4 h-4 rounded-full bg-[#e02424] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                    !
                  </div>
                  <span>{transferError}</span>
                </div>
              )}

              {/* Action Button: Replenish Button in Green */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !!transferError}
                  className="w-full h-10 rounded-full bg-[#4caf50] hover:bg-[#43a047] active:bg-[#388e3c] disabled:opacity-60 text-white text-sm font-medium transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Transferring...</span>
                    </>
                  ) : (
                    <span>Replenish</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
