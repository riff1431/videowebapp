import React from "react";

export function ShortsIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.77 10.32l-1.2-.5L18 9.06a3.74 3.74 0 0 0-3.5-5.26 3.8 3.8 0 0 0-2.8 1.3L6.46 11.2a3.75 3.75 0 0 0 3.4 5.94l1.2.5-1.43.76a3.75 3.75 0 0 0 3.5 5.3 3.8 3.8 0 0 0 2.8-1.3l5.24-6.1a3.75 3.75 0 0 0-3.4-5.98zM10 14.65v-5.3L15 12l-5 2.65z" />
    </svg>
  );
}
