"use client";

import {
  Bookmark,
  Calendar,
  Clock,
  Flame,
  Gamepad2,
  Globe,
  LayoutList,
  MapPin,
  MessageSquare,
  Store,
  Trophy,
  User,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import type { ProfileInfo } from "@/types/wall";

interface ProfileSidebarProps {
  profile: ProfileInfo;
}

const EXPLORE_ITEMS = [
  {
    label: "Wall Feed",
    icon: LayoutList,
    active: true,
    badge: null,
    color: "text-[#365899]",
  },
  {
    label: "Marketplace",
    icon: Store,
    active: false,
    badge: "New",
    color: "text-sky-600",
  },
  {
    label: "Messenger",
    icon: MessageSquare,
    active: false,
    badge: "2",
    color: "text-blue-500",
  },
  {
    label: "Friends",
    icon: Users,
    active: false,
    badge: null,
    color: "text-indigo-500",
  },
  {
    label: "Memories",
    icon: Clock,
    active: false,
    badge: null,
    color: "text-teal-600",
  },
  {
    label: "Events",
    icon: Calendar,
    active: false,
    badge: "3",
    color: "text-rose-500",
  },
  {
    label: "Saved",
    icon: Bookmark,
    active: false,
    badge: null,
    color: "text-purple-600",
  },
];

const NOSTALGIC_GAMES = [
  {
    name: "Dragon City",
    emoji: "🐉",
    status: "Egg ready to hatch!",
    badge: "HOT",
    toastMsg: "🐉 Launching Dragon City — Your Pure Dragon egg is ready to hatch!",
  },
  {
    name: "8 Ball Pool",
    emoji: "🎱",
    status: "Marcus challenged you",
    badge: "1v1",
    toastMsg: "🎱 8 Ball Pool — Joining table in London Pub (500 Coins)!",
  },
  {
    name: "Criminal Case",
    emoji: "🔍",
    status: "Energy full (110/110)",
    badge: null,
    toastMsg: "🔍 Criminal Case — Investigating Scene 4 in Grimsborough!",
  },
  {
    name: "Ninja Saga",
    emoji: "🥷",
    status: "Chunin Exam open",
    badge: null,
    toastMsg: "🥷 Ninja Saga — Entering the Chunin Exam Arena!",
  },
  {
    name: "Pet Society",
    emoji: "🐾",
    status: "Daily coins waiting",
    badge: null,
    toastMsg: "🐾 Pet Society — Visiting your pet's house!",
  },
  {
    name: "Candy Crush Saga",
    emoji: "🍬",
    status: "Level 245",
    badge: null,
    toastMsg: "🍬 Candy Crush Saga —Elena sent you 3 extra lives!",
  },
  {
    name: "Social Empires",
    emoji: "⚔️",
    status: "Train your dragons",
    badge: null,
    toastMsg: "⚔️ Social Empires — Your kingdom resources are ready to collect!",
  },
];

export function ProfileSidebar({ profile }: ProfileSidebarProps) {
  return (
    <aside
      aria-label="Sidebar Navigation and Profile"
      className="w-full lg:w-[250px] shrink-0"
    >
      <div className="lg:sticky lg:top-16 space-y-4">
        {/* Default User Profile Card */}
        <div className="surface-card overflow-hidden p-4">
          <div className="flex items-center gap-3">
            {/* Default Avatar Icon */}
            <div className="relative flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#e4e9f2] to-[#cfd8e8] text-[#4b679e] ring-2 ring-white shadow-xs">
              <User className="size-6 stroke-[2]" />
              <span
                title="Online"
                className="absolute bottom-0 right-0 size-3 rounded-full bg-emerald-500 ring-2 ring-white"
              />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-[15px] font-bold text-[#1d2129] truncate">
                {profile.name}
              </h2>
              <p className="text-[12px] text-[#606770] truncate">
                View your Wall profile
              </p>
            </div>
          </div>

          {/* Info Box (Networks & Current City) */}
          <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-2 text-[12px] text-[#4b4f56]">
            <div className="flex items-center gap-2">
              <Globe className="size-3.5 text-[#8d949e] shrink-0" />
              <span>
                Networks:{" "}
                <strong className="font-semibold text-[#1d2129]">
                  {profile.networks.join(", ")}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="size-3.5 text-[#8d949e] shrink-0" />
              <span>
                Lives in{" "}
                <strong className="font-semibold text-[#1d2129]">
                  {profile.currentCity}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* 2016 Facebook Explore Menu (Marketplace, Messenger, etc.) */}
        <div className="surface-card p-2.5">
          <p className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#606770]">
            Explore
          </p>
          <ul className="mt-1 space-y-0.5">
            {EXPLORE_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() =>
                      toast(`${item.label} — Viewing ${item.label}`)
                    }
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-[13px] transition-colors cursor-pointer ${
                      item.active
                        ? "bg-[#e9ebee] font-bold text-[#1d2129]"
                        : "font-medium text-[#4b4f56] hover:bg-[#f2f3f5] hover:text-[#1d2129]"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className={`size-4 ${item.color}`} />
                      <span>{item.label}</span>
                    </span>
                    {item.badge && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          item.badge === "New"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Nostalgic Games Shortcuts (Dragon City, 8 Ball Pool, Criminal Case...) */}
        <div className="surface-card p-2.5 hidden sm:block">
          <div className="flex items-center justify-between px-2.5 py-1">
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#606770]">
              <Gamepad2 className="size-3.5 text-[#365899]" />
              <span>Games & Shortcuts</span>
            </span>
            <Trophy className="size-3.5 text-amber-500" />
          </div>

          <ul className="mt-1 space-y-1">
            {NOSTALGIC_GAMES.map((game) => (
              <li key={game.name}>
                <button
                  type="button"
                  onClick={() => toast(game.toastMsg)}
                  className="group flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left transition-colors hover:bg-[#f2f3f5] cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-base shadow-2xs group-hover:scale-105 transition-transform">
                      {game.emoji}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-semibold text-[#1d2129] truncate group-hover:text-[#365899]">
                        {game.name}
                      </p>
                      <p className="text-[10.5px] text-[#606770] truncate">
                        {game.status}
                      </p>
                    </div>
                  </div>
                  {game.badge && (
                    <span className="inline-flex shrink-0 items-center gap-0.5 rounded bg-amber-500/15 px-1.5 py-0.5 text-[9.5px] font-bold text-amber-700">
                      <Flame className="size-2.5 text-amber-600" />
                      {game.badge}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
