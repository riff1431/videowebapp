"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  createBackupAction,
  getLastBackupDateAction,
} from "@/modules/admin/backup.actions";

export default function BackupPage() {
  const [lastBackup, setLastBackup] = useState<string>("01-10-2026");
  const [loading, setLoading] = useState(false);
  const [buttonText, setButtonText] = useState("Create New Backup");
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    async function loadDate() {
      const date = await getLastBackupDateAction();
      if (date) setLastBackup(date);
    }
    loadDate();
  }, []);

  const handleBackupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setButtonText("Please wait..");
    setNotice(null);

    try {
      const res = await createBackupAction();
      if (res.success && res.date) {
        setLastBackup(res.date);
        setButtonText("Backup Complete!");
        setNotice(`Backup completed successfully! Saved to ./script_backups/${res.date}/`);
      } else {
        setButtonText("Create New Backup");
        setNotice(`Backup failed: ${res.error || "Unknown error"}`);
      }
    } catch (err: any) {
      setButtonText("Create New Backup");
      setNotice(`Backup failed: ${err.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setButtonText("Create New Full Backup");
      }, 2500);
    }
  };

  return (
    <div className="w-full font-sans antialiased text-[#212529] dark:text-[#8c96a3]">
      {/* Title & Breadcrumbs matching 2nd screenshot */}
      <div className="mb-6">
        <h3 className="text-[22px] font-semibold text-neutral-900 dark:text-white tracking-tight mb-1">
          Backup
        </h3>
        <nav className="flex items-center gap-1.5 text-xs text-[#008DD1]">
          <Link href="/admin" className="hover:underline flex items-center gap-1">
            <svg
              className="w-3.5 h-3.5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span>Admin Panel</span>
          </Link>
          <span className="text-neutral-400 dark:text-[#555a64]">&gt;</span>
          <span className="text-[#008DD1]">Backup</span>
        </nav>
      </div>

      {notice && (
        <div className="mb-4 px-4 py-2.5 rounded-md text-xs font-medium bg-[#1e3a47] border border-[#2b5668] text-[#38bdf8]">
          {notice}
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg p-6 shadow-xs max-w-full">
        <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white mb-4">
          Backup SQL &amp; Files
        </h6>

        {/* PlayTube Backup SVG Icon */}
        <div className="mb-4">
          <svg
            className="rounded-full"
            height="80"
            viewBox="0 0 32 32"
            width="80"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="m26 32h-20c-3.314 0-6-2.686-6-6v-20c0-3.314 2.686-6 6-6h20c3.314 0 6 2.686 6 6v20c0 3.314-2.686 6-6 6z"
              fill="#e3f8fa"
            />
            <path
              d="m20 16c-.737 0-1.435.205-2.05.577l-.43-.43c-.143-.143-.358-.186-.545-.108-.187.077-.309.26-.309.462v1.667c0 .276.224.5.5.5h1.667c.202 0 .385-.122.462-.309s.035-.402-.109-.545l-.252-.252c.331-.145.689-.228 1.065-.228 1.471 0 2.667 1.196 2.667 2.667 0 1.47-1.196 2.667-2.667 2.667-1.268 0-2.364-.895-2.606-2.128-.071-.361-.423-.598-.783-.526-.361.071-.597.421-.526.783.367 1.855 2.012 3.203 3.916 3.203 2.206 0 4-1.794 4-4s-1.794-4-4-4z"
              fill="#8ce1eb"
            />
            <g fill="#26c6da">
              <path d="m8 14v4h7.334v-1.5c0-.747.447-1.407 1.133-1.693.58-.24 1.227-.16 1.727.18.573-.207 1.18-.32 1.807-.32v-.667z" />
              <path d="m14.78 21.053c-.127-.64.073-1.267.48-1.72h-7.26v2.833c0 1.014.82 1.834 1.833 1.834h6.654c-.86-.747-1.474-1.767-1.707-2.947z" />
              <path d="m18.167 8h-8.334c-1.013 0-1.833.82-1.833 1.833v2.833h12v-2.833c0-1.013-.82-1.833-1.833-1.833zm-7.834 3.333c-.553 0-1-.447-1-1s.447-1 1-1 1 .447 1 1c0 .554-.447 1-1 1zm3.334 0c-.553 0-1-.447-1-1s.447-1 1-1 1 .447 1 1c0 .554-.447 1-1 1zm3.333 0c-.553 0-1-.447-1-1s.447-1 1-1 1 .447 1 1c0 .554-.447 1-1 1z" />
            </g>
          </svg>
        </div>

        {/* Information List with exact PlayTube icons & labels */}
        <div className="space-y-3 text-[13px] text-neutral-700 dark:text-[#c4cad4] mb-6">
          <p className="flex items-center gap-2">
            <b className="text-neutral-900 dark:text-white flex items-center gap-1.5 font-semibold">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                className="shrink-0"
              >
                <path
                  fill="currentColor"
                  d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12S17.5 2 12 2M14 17L11 11.8V7H12.5V11.4L15.3 16.3L14 17Z"
                />
              </svg>
              Last Backup:
            </b>
            <span className="last_backup font-normal">{lastBackup}</span>
          </p>

          <p className="flex items-center gap-2">
            <b className="text-neutral-900 dark:text-white flex items-center gap-1.5 font-semibold">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                className="shrink-0"
              >
                <path
                  fill="currentColor"
                  d="M10,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V8C22,6.89 21.1,6 20,6H12L10,4Z"
                />
              </svg>
              Backups directory:
            </b>
            <span className="font-normal font-mono">./script_backups/</span>
          </p>

          <p className="flex items-center gap-2">
            <b className="text-neutral-900 dark:text-white flex items-center gap-1.5 font-semibold">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                className="shrink-0"
              >
                <path
                  fill="currentColor"
                  d="M13,9V3.5L18.5,9M6,2C4.89,2 4,2.89 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6Z"
                />
              </svg>
              Backup type:
            </b>
            <span className="font-normal">
              all files including ./upload folder and full backup of your database.
            </span>
          </p>

          <p className="flex items-center gap-2">
            <b className="text-neutral-900 dark:text-white flex items-center gap-1.5 font-semibold">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                className="shrink-0"
              >
                <path
                  fill="currentColor"
                  d="M17,3A2,2 0 0,1 19,5V15A2,2 0 0,1 17,17H13V19H14A1,1 0 0,1 15,20H22V22H15A1,1 0 0,1 14,23H10A1,1 0 0,1 9,22H2V20H9A1,1 0 0,1 10,19H11V17H7C5.89,17 5,16.1 5,15V5A2,2 0 0,1 7,3H17M12,14.5L16.5,10H13V6H11V10H7.5L12,14.5Z"
                />
              </svg>
              It&apos;s recommended to download the backups via FTP.
            </b>
          </p>
        </div>

        {/* Action Button matching screenshot turquoise/cyan button */}
        <form onSubmit={handleBackupSubmit} className="mb-4">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-[#26b4c4] hover:bg-[#209fae] active:bg-[#1a8b98] text-white font-medium text-[13px] rounded shadow-xs transition-colors cursor-pointer disabled:opacity-60"
          >
            {buttonText}
          </button>
        </form>

        {/* Alert box matching screenshot 2 blue/teal alert */}
        <div className="bg-[#e8f7fa] dark:bg-[#1a3844] text-[#00667a] dark:text-[#88d9e6] border border-[#bce8f1] dark:border-[#224b5c] px-4 py-3 rounded text-[13px]">
          Please note that it may take several minutes.
        </div>
      </div>
    </div>
  );
}
