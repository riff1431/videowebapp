import React from "react";

interface GreetingHeroProps {
  name?: string | null;
}

export function GreetingHero({ name }: GreetingHeroProps) {
  const displayName = name ? name.trim() : "Friend";

  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--default-text)] tracking-tight flex items-center gap-2">
          <span>Hey {displayName}, Have a good day!</span>
          <span className="inline-block hover:scale-110 transition-transform select-none">
            👋
          </span>
        </h1>
      </div>
    </div>
  );
}
