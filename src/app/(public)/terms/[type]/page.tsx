import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FileText, Shield, Info, ArrowLeft } from "lucide-react";

interface TermsPageProps {
  params: Promise<{ type: string }>;
}

export default async function TermsPage({ params }: TermsPageProps) {
  const { type } = await params;

  const validTypes: Record<string, { title: string; desc: string; icon: any }> = {
    terms: {
      title: "Terms of Use",
      desc: "Please review our terms of service and conditions for using PlayTube.",
      icon: FileText,
    },
    privacy: {
      title: "Privacy Policy",
      desc: "Learn how we protect your personal data, videos, and platform interactions.",
      icon: Shield,
    },
    about: {
      title: "About Us",
      desc: "PlayTube is the next-generation video sharing and creator empowerment network.",
      icon: Info,
    },
  };

  const pageInfo = validTypes[type];
  if (!pageInfo) {
    notFound();
  }

  const Icon = pageInfo.icon;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">{pageInfo.title}</h1>
            <p className="text-xs text-neutral-500">{pageInfo.desc}</p>
          </div>
        </div>

        <div className="prose dark:prose-invert max-w-none text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed space-y-4">
          <p>
            Welcome to PlayTube. By accessing and using this service, you agree to comply with and be bound by the terms and policies set forth on this page. All uploaded media must respect intellectual property rights and community guidelines.
          </p>
          <h3 className="text-base font-bold text-neutral-900 dark:text-white mt-4">1. Content Guidelines & Ownership</h3>
          <p>
            Creators maintain ownership of all original video content uploaded to the platform. By submitting content, you grant PlayTube a non-exclusive license to host, display, and stream your media globally.
          </p>
          <h3 className="text-base font-bold text-neutral-900 dark:text-white mt-4">2. User Security & Privacy</h3>
          <p>
            We take your privacy seriously. Account data, watch histories, and personal credentials are protected using industry-standard encryption, PostgreSQL storage, and Better Auth authentication session guards.
          </p>
          <h3 className="text-base font-bold text-neutral-900 dark:text-white mt-4">3. Pro & Monetization Features</h3>
          <p>
            Subscriptions, wallet top-ups, and monetization earnings are governed by our creator terms and payout schedules. Fraudulent or artificial engagement is strictly prohibited.
          </p>
        </div>
      </div>
    </div>
  );
}
