"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  getFaqsAction,
  createFaqAction,
  deleteFaqAction,
  type FaqItem,
} from "@/modules/admin/pages.actions";

export default function ManageFaqs() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadFaqs = async () => {
    setLoading(true);
    const data = await getFaqsAction();
    setFaqs(data);
    setLoading(false);
  };

  useEffect(() => {
    loadFaqs();
  }, []);

  const handleCreateFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creating) return;

    setCreating(true);
    setNotice(null);

    const res = await createFaqAction(question, answer);
    setCreating(false);

    if (res.success && res.faq) {
      setFaqs([res.faq, ...faqs]);
      setQuestion("");
      setAnswer("");
      setNotice({ type: "success", text: "FAQ added successfully!" });
      setTimeout(() => setNotice(null), 3000);
    } else {
      setNotice({ type: "error", text: res.error || "Please check your details." });
    }
  };

  const handleDeleteFaq = async (id: number) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;
    const res = await deleteFaqAction(id);
    if (res.success) {
      setFaqs(faqs.filter((f) => f.id !== id));
      setNotice({ type: "success", text: "FAQ deleted successfully!" });
      setTimeout(() => setNotice(null), 3000);
    } else {
      setNotice({ type: "error", text: res.error || "Failed to delete FAQ" });
    }
  };

  const toggleAccordion = (id: number) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <div className="w-full font-sans antialiased text-[#212529] dark:text-[#8c96a3]">
      {/* Title & Breadcrumbs matching design/pages/manage-faqs/1.png */}
      <div className="mb-6">
        <h3 className="text-[22px] font-semibold text-neutral-900 dark:text-white tracking-tight mb-1">
          Manage FAQs
        </h3>
        <nav className="flex items-center gap-1.5 text-xs text-[#008DD1]">
          <Link href="/admin" className="hover:underline flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span>Admin Panel</span>
          </Link>
          <span className="text-neutral-400 dark:text-[#555a64]">&gt;</span>
          <span className="hover:underline">Pages</span>
          <span className="text-neutral-400 dark:text-[#555a64]">&gt;</span>
          <span className="text-[#008DD1]">Manage FAQs</span>
        </nav>
      </div>

      {notice && (
        <div
          className={`mb-4 px-4 py-2.5 rounded-md text-xs font-medium border ${
            notice.type === "success"
              ? "bg-[#18362d] border-[#1d4c3f] text-[#34d399]"
              : "bg-[#361818] border-[#4c1d1d] text-[#f87171]"
          }`}
        >
          {notice.text}
        </div>
      )}

      {/* Grid Layout matching 1.png (Left: Create New FAQ, Right: Manage FAQs) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (col-lg-4 col-md-6): Create New FAQ */}
        <div className="lg:col-span-4 bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg p-6 shadow-xs">
          <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white mb-4">
            Create New FAQ
          </h6>

          <form onSubmit={handleCreateFaq} className="space-y-4">
            <div>
              <input
                type="text"
                required
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Write your question"
                className="w-full h-10 px-3 text-xs bg-white dark:bg-[#1c1e22] border border-neutral-300 dark:border-[#292d33] rounded focus:outline-none focus:border-[#008DD1] text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500"
              />
            </div>

            <div>
              <textarea
                required
                rows={8}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Write your answer"
                className="w-full p-3 text-xs bg-white dark:bg-[#1c1e22] border border-neutral-300 dark:border-[#292d33] rounded focus:outline-none focus:border-[#008DD1] text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500"
              />
            </div>

            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2.5 bg-[#008DD1] hover:bg-[#007cb8] active:bg-[#006da2] text-white font-medium text-xs rounded transition-colors shadow-xs cursor-pointer disabled:opacity-60"
            >
              {creating ? "Please wait.." : "Create"}
            </button>
          </form>
        </div>

        {/* Right Column (col-lg-8 col-md-8): Manage FAQs accordion */}
        <div className="lg:col-span-8 bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg p-6 shadow-xs">
          <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white mb-4">
            Manage FAQs
          </h6>

          {loading ? (
            <div className="text-center py-8 text-neutral-400 text-xs">Loading FAQs...</div>
          ) : faqs.length === 0 ? (
            <div className="text-center py-8 text-neutral-400 text-xs">
              No FAQs available yet. Create your first FAQ using the form on the left.
            </div>
          ) : (
            <div className="space-y-3">
              {faqs.map((faq) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="border border-neutral-200 dark:border-[#292d33] rounded overflow-hidden bg-neutral-50 dark:bg-[#1c1e22] transition-colors"
                  >
                    <div
                      onClick={() => toggleAccordion(faq.id)}
                      className="p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none hover:bg-neutral-100 dark:hover:bg-[#202327]"
                    >
                      <div className="flex items-center gap-2.5 flex-1">
                        <span className="w-6 h-6 rounded bg-neutral-200 dark:bg-[#2b2f36] text-neutral-700 dark:text-neutral-300 flex items-center justify-center shrink-0 font-bold text-xs">
                          {isOpen ? "-" : "+"}
                        </span>
                        <h4 className="text-xs font-semibold text-neutral-900 dark:text-white">
                          {faq.question}
                        </h4>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFaq(faq.id);
                        }}
                        className="px-2.5 py-1 bg-[#dc3545] hover:bg-[#c82333] text-white rounded text-[11px] font-medium transition-colors cursor-pointer shrink-0"
                      >
                        Delete
                      </button>
                    </div>

                    {isOpen && (
                      <div className="p-4 bg-white dark:bg-[#22252a] border-t border-neutral-200 dark:border-[#292d33] text-xs text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
