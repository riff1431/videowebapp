"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  addCurrencyAction,
  setDefaultCurrencyAction,
  deleteCurrenciesAction,
} from "@/modules/admin/currencies.actions";

interface CurrencyItem {
  id: number;
  currencyCode: string;
  currencySymbol: string;
  isDefault: boolean;
}

interface ManageCurrenciesClientProps {
  initialCurrencies: CurrencyItem[];
}

export function ManageCurrenciesClient({ initialCurrencies }: ManageCurrenciesClientProps) {
  const [currenciesList, setCurrenciesList] = useState<CurrencyItem[]>(initialCurrencies);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [, startTransition] = useTransition();

  const toggleSelectAll = () => {
    if (selectedIds.length === currenciesList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currenciesList.map((c) => c.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSetDefault = (id: number) => {
    startTransition(async () => {
      await setDefaultCurrencyAction(id);
      setCurrenciesList((prev) =>
        prev.map((c) => ({
          ...c,
          isDefault: c.id === id,
        }))
      );
    });
  };

  const handleDeleteOne = (id: number) => {
    if (confirm("Are you sure you want to delete this currency?")) {
      startTransition(async () => {
        await deleteCurrenciesAction([id]);
        setCurrenciesList((prev) => prev.filter((c) => c.id !== id));
      });
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedIds.length} currency(ies)?`)) {
      startTransition(async () => {
        await deleteCurrenciesAction(selectedIds);
        setCurrenciesList((prev) => prev.filter((c) => !selectedIds.includes(c.id)));
        setSelectedIds([]);
      });
    }
  };

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await addCurrencyAction(formData);
    if (res.success) {
      window.location.reload();
    } else {
      alert(res.error || "Failed to add currency");
    }
  };

  return (
    <div className="space-y-6 text-neutral-800 dark:text-[#adb5bd] w-full max-w-full font-sans antialiased">
      {/* Notice Banner matching Screenshot 1 */}
      <div className="p-3.5 bg-[#fcf8e3] dark:bg-amber-950/30 border border-[#faebcc] dark:border-amber-900/40 text-[#8a6d3b] dark:text-amber-300 rounded text-xs leading-relaxed">
        <span className="font-bold mr-1">?</span>
        Please note that not all currencies are supported by PayPal, stripe, 2checkout, alipay. If the currency you adding isn't supported, You can set the default payment currency for each payment method from{" "}
        <Link href="/admin/payment-settings" className="underline font-semibold">
          Payment Settings
        </Link>
        .
      </div>

      {/* Breadcrumb Header */}
      <div>
        <h3 className="text-[22px] font-semibold text-neutral-900 dark:text-white tracking-tight">
          Manage Currencies
        </h3>
        <nav className="flex items-center gap-1.5 text-xs text-[#008DD1] mt-1">
          <Link href="/admin" className="hover:underline flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span>Admin Panel</span>
          </Link>
          <span className="text-gray-400 dark:text-gray-500">&gt;</span>
          <span className="text-[#008DD1]">Settings</span>
          <span className="text-gray-400 dark:text-gray-500">&gt;</span>
          <span className="text-neutral-500 dark:text-gray-400">Manage Currencies</span>
        </nav>
      </div>

      {/* Add Currency Card matching Screenshot 1 */}
      <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg p-6 shadow-xs">
        <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white mb-6">
          Add Currency
        </h6>

        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs text-neutral-800 dark:text-[#ced4da] font-medium block">
              Currency Code (e.g: USD)
            </label>
            <input
              type="text"
              name="currencyCode"
              required
              placeholder="USD"
              className="w-full bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs uppercase focus:outline-hidden focus:border-[#04abf2]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-neutral-800 dark:text-[#ced4da] font-medium block">
              Currency Symbol (e.g: $)
            </label>
            <input
              type="text"
              name="currencySymbol"
              required
              placeholder="$"
              className="w-full bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-6 py-2 bg-[#04abf2] hover:bg-[#0396d5] text-white text-xs font-semibold rounded transition-colors shadow-xs cursor-pointer"
            >
              Add
            </button>
          </div>
        </form>
      </div>

      {/* Currencies Table Card matching Screenshots 1 & 2 */}
      <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg shadow-xs overflow-hidden">
        <div className="p-5 border-b border-neutral-200 dark:border-[#292d33]">
          <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white">
            Currencies
          </h6>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-[#292d33] text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                <th className="py-3 px-5 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === currenciesList.length && currenciesList.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-neutral-300 dark:border-neutral-700 text-[#04abf2] focus:ring-0"
                  />
                </th>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">CURRENCY CODE</th>
                <th className="py-3 px-4">CURRENCY SYMBOL</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-[#2a2e36]">
              {currenciesList.map((cur) => (
                <tr key={cur.id} className="hover:bg-neutral-50 dark:hover:bg-[#181a1d] transition-colors">
                  <td className="py-3.5 px-5">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(cur.id)}
                      onChange={() => toggleSelectOne(cur.id)}
                      className="rounded border-neutral-300 dark:border-neutral-700 text-[#04abf2] focus:ring-0"
                    />
                  </td>
                  <td className="py-3.5 px-4 font-mono text-neutral-600 dark:text-neutral-300">
                    {cur.id}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-neutral-900 dark:text-white">
                    {cur.currencyCode}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-neutral-800 dark:text-white">
                    {cur.currencySymbol}
                  </td>
                  <td className="py-3.5 px-4">
                    {cur.isDefault ? (
                      <span className="text-neutral-700 dark:text-neutral-300 font-medium">Default</span>
                    ) : (
                      <span className="text-neutral-400">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      {!cur.isDefault && (
                        <button
                          onClick={() => handleSetDefault(cur.id)}
                          className="px-2.5 py-1 text-[11px] rounded bg-[#5cb85c]/10 text-[#5cb85c] hover:bg-[#5cb85c] hover:text-white font-medium transition-colors cursor-pointer"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteOne(cur.id)}
                        className="px-2.5 py-1 text-[11px] rounded bg-[#d9534f]/10 text-[#d9534f] hover:bg-[#d9534f] hover:text-white font-medium uppercase transition-colors cursor-pointer"
                      >
                        DELETE
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Delete Selected Button */}
        <div className="p-5 border-t border-neutral-200 dark:border-[#292d33]">
          <button
            onClick={handleDeleteSelected}
            disabled={selectedIds.length === 0}
            className={`px-5 py-2 text-white text-xs font-semibold rounded transition-colors shadow-xs cursor-pointer ${
              selectedIds.length > 0 ? "bg-[#04abf2] hover:bg-[#0396d5]" : "bg-[#04abf2]/50 cursor-not-allowed"
            }`}
          >
            Delete Selected
          </button>
        </div>
      </div>
    </div>
  );
}
