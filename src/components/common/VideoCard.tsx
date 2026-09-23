import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export interface VideoCardProps {
  videoId: string;
  title: string;
  thumbnail: string;
  duration?: string | null;
  views?: number | null;
  createdAt?: Date | null;
  user: {
    username: string;
    name?: string | null;
    avatar?: string | null;
    verified?: boolean | null;
  };
}

export function VideoCard({
  videoId,
  title,
  thumbnail,
  duration = "00:00",
  views = 0,
  user,
}: VideoCardProps) {
  return (
    <div className="group flex flex-col bg-[var(--card-bg)] rounded-lg overflow-hidden border border-[var(--card-border)] hover:shadow-md transition-shadow">
      <Link href={`/watch/${videoId}`} className="relative aspect-video w-full bg-neutral-900 block overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60";
          }}
        />
        {duration && (
          <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 text-[11px] font-medium bg-black/80 text-white rounded">
            {duration}
          </span>
        )}
      </Link>

      <div className="p-3 flex gap-3">
        <Link href={`/@${user.username}`} className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={user.avatar || "/upload/photos/d-avatar.jpg"}
            alt={user.name || user.username}
            className="w-9 h-9 rounded-full object-cover bg-neutral-200"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60";
            }}
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/watch/${videoId}`}>
            <h3 className="font-semibold text-sm leading-snug line-clamp-2 text-neutral-900 dark:text-neutral-100 hover:text-[var(--primary)] transition-colors">
              {title}
            </h3>
          </Link>
          <Link
            href={`/@${user.username}`}
            className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 mt-1"
          >
            <span className="truncate">{user.name || user.username}</span>
            {user.verified && <CheckCircle2 className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />}
          </Link>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            <span>{(views || 0).toLocaleString()} views</span>
          </div>
        </div>
      </div>
    </div>
  );
}
