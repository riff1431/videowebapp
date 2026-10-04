import * as React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

export function Avatar({
  src,
  alt = "avatar",
  size = "md",
  className,
  ...props
}: AvatarProps) {
  const sizeMap = {
    xs: "w-6 h-6",
    sm: "w-8 h-8",
    md: "w-9 h-9",
    lg: "w-12 h-12",
    xl: "w-20 h-20",
  };

  const [hasError, setHasError] = React.useState(false);

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800",
        sizeMap[size],
        className
      )}
      {...props}
    >
      {src && !hasError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          onError={() => setHasError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-semibold text-xs text-neutral-600 dark:text-neutral-300 uppercase">
          {alt?.charAt(0) || "U"}
        </div>
      )}
    </div>
  );
}
