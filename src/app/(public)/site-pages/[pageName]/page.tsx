import React from "react";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { customPages } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

interface SitePageProps {
  params: Promise<{ pageName: string }>;
}

export default async function CustomSitePage({ params }: SitePageProps) {
  const { pageName } = await params;

  const rows = await db
    .select()
    .from(customPages)
    .where(eq(customPages.pageName, pageName))
    .limit(1);

  if (!rows || rows.length === 0) {
    notFound();
  }

  const page = rows[0];

  // If pageType === 0: empty standalone page without header/container background
  if (page.pageType === 0) {
    return (
      <div className="min-h-screen p-6 max-w-4xl mx-auto">
        <div
          className="prose dark:prose-invert max-w-none text-neutral-800 dark:text-neutral-200"
          dangerouslySetInnerHTML={{ __html: page.pageContent }}
        />
      </div>
    );
  }

  // pageType === 1: include background and header container matching PlayTube custom_page layout
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
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {page.pageTitle}
            </h1>
            <p className="text-xs text-neutral-500">
              Published on PlayTube • Custom Page
            </p>
          </div>
        </div>

        <div
          className="prose dark:prose-invert max-w-none text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: page.pageContent }}
        />
      </div>
    </div>
  );
}
