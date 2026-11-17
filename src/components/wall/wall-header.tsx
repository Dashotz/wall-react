"use client";

import {
  Bell,
  Gamepad2,
  Home,
  MessageCircle,
  RefreshCw,
  Search,
  Store,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { DEFAULT_PROFILE } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface WallHeaderProps {
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function WallHeader({
  onRefresh,
  isLoading = false,
}: WallHeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-[#29487d] bg-gradient-to-b from-[#4267b2] to-[#365899] text-white shadow-[0_2px_8px_rgba(15,23,42,0.15)]">
      <div className="mx-auto flex h-12 max-w-[1220px] items-center justify-between gap-4 px-3 sm:px-6">
        {/* Left: Brand Logo & Search Bar */}
        <div className="flex items-center gap-2.5 flex-1 max-w-md">
          <a
            href="#top"
            className="flex size-7 shrink-0 items-center justify-center rounded-[5px] bg-white text-[#365899] font-extrabold text-[19px] leading-none tracking-tighter shadow-xs select-none"
          >
            w
          </a>

          <div className="relative flex-1 max-w-[320px]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search Wall, Marketplace, or Dragon City..."
              aria-label="Search Wall"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.currentTarget.value.trim()) {
                  toast.info(`Searching for "${e.currentTarget.value.trim()}"...`);
                }
              }}
              className="h-7 w-full rounded-[4px] bg-white pl-8 pr-3 text-[12.5px] text-slate-800 placeholder:text-slate-400 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>

        {/* Center / Right Navigation Pills */}
        <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-1">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-flex items-center gap-1.5 rounded-md bg-black/15 px-3 py-1 text-[12.5px] font-semibold text-white transition-colors hover:bg-black/20 cursor-pointer"
          >
            <Home className="size-3.5" />
            <span>Home</span>
          </button>

          <button
            type="button"
            onClick={() =>
              toast("🛒 Marketplace: Browse local deals in the sidebar!")
            }
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-[12.5px] font-semibold text-white/90 transition-colors hover:bg-black/15 hover:text-white cursor-pointer"
          >
            <Store className="size-3.5" />
            <span>Marketplace</span>
          </button>

          <button
            type="button"
            onClick={() =>
              toast("🐉 Dragon City: Your habitats are full of gold! Click to collect.")
            }
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-[12.5px] font-semibold text-white/90 transition-colors hover:bg-black/15 hover:text-white cursor-pointer"
          >
            <Gamepad2 className="size-3.5" />
            <span>Games</span>
            <span className="rounded-full bg-rose-500 px-1.5 py-0.2 text-[10px] font-bold text-white leading-tight">
              3
            </span>
          </button>
        </nav>

        {/* Right User Profile Chip & Action Icons */}
        <div className="flex items-center gap-1.5">
          <div className="hidden sm:flex items-center gap-2 rounded-md px-2 py-1 text-[12.5px] font-semibold text-white hover:bg-black/15 transition-colors cursor-pointer">
            <div className="flex size-5 items-center justify-center rounded-full bg-blue-100 text-[#365899]">
              <User className="size-3.5" />
            </div>
            <span>{DEFAULT_PROFILE.name.split(" ")[0]}</span>
          </div>

          <div className="h-4 w-[1px] bg-white/20 mx-1 hidden sm:block" />

          <button
            type="button"
            onClick={() =>
              toast("💬 Messenger: Maya sent you a free gift in Dragon City!")
            }
            aria-label="Messages"
            className="relative inline-flex size-7 items-center justify-center rounded-md text-white/90 hover:bg-black/15 hover:text-white transition-colors cursor-pointer"
          >
            <MessageCircle className="size-4" />
          </button>

          <button
            type="button"
            onClick={() =>
              toast("🔔 Notification: Marcus invited you to play 8 Ball Pool!")
            }
            aria-label="Notifications"
            className="relative inline-flex size-7 items-center justify-center rounded-md text-white/90 hover:bg-black/15 hover:text-white transition-colors cursor-pointer"
          >
            <Bell className="size-4" />
            <span className="absolute right-1 top-1 size-2 rounded-full bg-rose-500 ring-1 ring-[#365899]" />
          </button>

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              aria-label="Refresh feed"
              title="Refresh feed"
              className="inline-flex size-7 items-center justify-center rounded-md text-white/90 hover:bg-black/15 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw
                className={cn("size-3.5", isLoading && "animate-spin")}
              />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
