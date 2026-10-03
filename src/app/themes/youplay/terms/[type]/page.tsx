import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FileText, Shield, Info, ArrowLeft, RefreshCw, HelpCircle } from "lucide-react";
import { db } from "@/db";
import { termsPages, faqs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

interface TermsPageProps {
  params: Promise<{ type: string }>;
}

export default async function TermsPage({ params }: TermsPageProps) {
  const { type } = await params;

  const validTypes: Record<
    string,
    { dbKey?: string; title: string; desc: string; icon: any }
  > = {
    terms: {
      dbKey: "terms_of_use_page",
      title: "Terms of Use",
      desc: "Please review our terms of service and conditions for using PlayTube.",
      icon: FileText,
    },
    privacy: {
      dbKey: "privacy_policy_page",
      title: "Privacy Policy",
      desc: "Learn how we protect your personal data, videos, and platform interactions.",
      icon: Shield,
    },
    about: {
      dbKey: "about_page",
      title: "About Us",
      desc: "PlayTube is the next-generation video sharing and creator empowerment network.",
      icon: Info,
    },
    refund: {
      dbKey: "refund_terms_page",
      title: "Refund Policy",
      desc: "Review our purchase, payment, and refund policies.",
      icon: RefreshCw,
    },
    faqs: {
      title: "Frequently Asked Questions",
      desc: "Find answers to frequently asked questions about PlayTube.",
      icon: HelpCircle,
    },
  };

  const pageInfo = validTypes[type];
  if (!pageInfo) {
    notFound();
  }

  const Icon = pageInfo.icon;

  // Handle FAQs page
  if (type === "faqs") {
    let faqList: { id: number; question: string; answer: string }[] = [];
    try {
      faqList = await db.select().from(faqs).orderBy(desc(faqs.id));
    } catch {}

    return (
      <div className="max-w-4xl mx-auto space-y-6 py-6 px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-[var(--primary)] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-[var(--border)] p-6 md:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[var(--border)]">
            <div className="w-10 h-10 rounded-lg bg-sky-100 dark:bg-sky-950 text-[var(--primary)] flex items-center justify-center">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                {pageInfo.title}
              </h1>
              <p className="text-xs text-neutral-500">{pageInfo.desc}</p>
            </div>
          </div>

          {faqList.length === 0 ? (
            <p className="text-sm text-neutral-500">No FAQs available at this time.</p>
          ) : (
            <div className="space-y-4">
              {faqList.map((faq) => (
                <div
                  key={faq.id}
                  className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700/60 bg-neutral-50/50 dark:bg-neutral-900/40 space-y-2"
                >
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <span className="text-[var(--primary)] font-mono font-bold">Q.</span>
                    <span>{faq.question}</span>
                  </h3>
                  <div className="text-xs text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap pl-5 leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Handle Terms / Privacy / About / Refund pages
  let customHtml = "";
  if (pageInfo.dbKey) {
    try {
      const rows = await db
        .select()
        .from(termsPages)
        .where(eq(termsPages.type, pageInfo.dbKey))
        .limit(1);

      if (rows.length > 0) {
        // If disabled by admin, return notFound() or show disabled note
        if (rows[0].enabled === 0) {
          notFound();
        }
        if (rows[0].translations) {
          const trans = JSON.parse(rows[0].translations);
          // Look for english or first available translation
          customHtml = trans["english"] || Object.values(trans)[0] || "";
        }
      }
    } catch {}
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6 px-4">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-[var(--primary)] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Home</span>
      </Link>

      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-[var(--border)] p-6 md:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[var(--border)]">
          <div className="w-10 h-10 rounded-lg bg-sky-100 dark:bg-sky-950 text-[var(--primary)] flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {pageInfo.title}
            </h1>
            <p className="text-xs text-neutral-500">{pageInfo.desc}</p>
          </div>
        </div>

        {customHtml ? (
          <div
            className="prose dark:prose-invert max-w-none text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: customHtml }}
          />
        ) : (
          <div className="prose dark:prose-invert max-w-none text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed space-y-4">
            <p>
              Welcome to PlayTube. By accessing and using this service, you agree to
              comply with and be bound by the terms and policies set forth on this
              page. All uploaded media must respect intellectual property rights and
              community guidelines.
            </p>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white mt-4">
              1. Content Guidelines &amp; Ownership
            </h3>
            <p>
              Creators maintain ownership of all original video content uploaded to
              the platform. By submitting content, you grant PlayTube a non-exclusive
              license to host, display, and stream your media globally.
            </p>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white mt-4">
              2. User Security &amp; Privacy
            </h3>
            <p>
              We take your privacy seriously. Account data, watch histories, and
              personal credentials are protected using industry-standard encryption,
              PostgreSQL storage, and Better Auth authentication session guards.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
