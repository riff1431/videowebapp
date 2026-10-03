"use client";

import React, { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { testSmtpEmailAction } from "@/modules/admin/settings.actions";

export function TestEmailBox() {
  const [testEmail, setTestEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  async function handleSendTest(e: React.FormEvent) {
    e.preventDefault();
    if (!testEmail || loading) return;

    setLoading(true);
    setResult(null);

    const res = await testSmtpEmailAction(testEmail);
    setLoading(false);
    if (res.success) {
      setResult({
        success: true,
        message: "Test email dispatched successfully! Please check your inbox / spam folder.",
      });
    } else {
      setResult({
        success: false,
        message: res.error || "Failed to send test email. Check your SMTP settings and logs.",
      });
    }
  }

  return (
    <div className="bg-[var(--admin-card-bg)] border border-[var(--admin-card-border)] rounded-xl p-6 shadow-xs space-y-4">
      <div>
        <h4 className="text-sm font-bold text-[var(--admin-text-main)]">
          Test E-mail Configuration
        </h4>
        <p className="text-xs text-[var(--admin-text-muted)] mt-1">
          Send a verification test message to ensure your SMTP server and credentials are functionally responding.
        </p>
      </div>

      <form onSubmit={handleSendTest} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <input
          type="email"
          required
          placeholder="your-email@example.com"
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
          className="flex-1 w-full px-3.5 py-2 text-xs bg-[var(--admin-input-bg)] border border-[var(--admin-input-border)] rounded-lg focus:outline-none focus:border-[var(--primary)] text-[var(--admin-text-main)] placeholder-[var(--admin-text-muted)]"
        />
        <button
          type="submit"
          disabled={loading || !testEmail}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          <span>Send Test Email</span>
        </button>
      </form>

      {result && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
            result.success
              ? "bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400"
              : "bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400"
          }`}
        >
          {result.success ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{result.message}</span>
        </div>
      )}
    </div>
  );
}
