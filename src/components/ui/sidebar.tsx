"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

interface SidebarContextType {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  openMobile: boolean;
  setOpenMobile: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;
}

const SidebarContext = React.createContext<SidebarContextType | null>(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

export function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [open, _setOpen] = React.useState(defaultOpen);
  const [openMobile, setOpenMobile] = React.useState(false);

  const isControlled = openProp !== undefined;
  const currentOpen = isControlled ? openProp : open;

  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const next = typeof value === "function" ? value(currentOpen) : value;
      if (setOpenProp) {
        setOpenProp(next);
      } else {
        _setOpen(next);
      }
    },
    [currentOpen, setOpenProp]
  );

  const toggleSidebar = React.useCallback(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setOpenMobile((prev) => !prev);
    } else {
      setOpen((prev) => !prev);
    }
  }, [setOpen]);

  // Close mobile sidebar on resize to desktop
  React.useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) {
        setOpenMobile(false);
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        open: currentOpen,
        setOpen,
        openMobile,
        setOpenMobile,
        toggleSidebar,
      }}
    >
      <div
        className={cn("min-h-screen w-full flex flex-col", className)}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      type="button"
      aria-label="Toggle Sidebar"
      onClick={(e) => {
        onClick?.(e);
        toggleSidebar();
      }}
      className={cn(
        "inline-flex items-center justify-center p-1.5 rounded-md text-[var(--admin-text-muted)] hover:text-[var(--admin-text-main)] hover:bg-[var(--admin-card-hover)] transition-colors cursor-pointer",
        className
      )}
      {...props}
    >
      <Menu className="w-5 h-5" />
    </button>
  );
}

export function SidebarClose({
  className,
  onClick,
  ...props
}: React.ComponentProps<"button">) {
  const { setOpenMobile } = useSidebar();

  return (
    <button
      type="button"
      aria-label="Close Sidebar"
      onClick={(e) => {
        onClick?.(e);
        setOpenMobile(false);
      }}
      className={cn(
        "inline-flex items-center justify-center p-1 rounded-md text-[var(--admin-text-muted)] hover:text-[var(--admin-text-main)] transition-colors cursor-pointer",
        className
      )}
      {...props}
    >
      <X className="w-5 h-5" />
    </button>
  );
}
