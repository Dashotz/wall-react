"use client";

import { Gift, MapPin, Play, ShoppingBag, Users } from "lucide-react";
import { toast } from "sonner";
import { getAuthorAvatarStyle } from "@/lib/constants";
import { cn } from "@/lib/utils";

const MARKETPLACE_ITEMS = [
  {
    title: "iPod Classic 160GB (Silver)",
    price: "$85",
    location: "Palo Alto, CA",
    tag: "Electronics",
    emoji: "🎵",
  },
  {
    title: "Nintendo 3DS XL + Pokemon",
    price: "$110",
    location: "San Francisco, CA",
    tag: "Gaming",
    emoji: "🎮",
  },
  {
    title: "Custom Mechanical Keyboard",
    price: "$65",
    location: "Menlo Park, CA",
    tag: "Accessories",
    emoji: "⌨️",
  },
  {
    title: "Canon AE-1 35mm Film Camera",
    price: "$120",
    location: "San Jose, CA",
    tag: "Photography",
    emoji: "📷",
  },
];

const ONLINE_FRIENDS = [
  { name: "Maya Lin", activity: "Playing Dragon City 🐉" },
  { name: "Marcus Vance", activity: "Playing 8 Ball Pool 🎱" },
  { name: "Elena Rostova", activity: "Active now" },
  { name: "Devon Brooks", activity: "Playing Criminal Case 🔍" },
  { name: "Sora Takahashi", activity: "Playing Ninja Saga 🥷" },
];

export function RightSidebar() {
  return (
    <aside
      aria-label="Games, Marketplace, and Contacts"
      className="w-full xl:w-[290px] shrink-0 space-y-4"
    >
      <div className="xl:sticky xl:top-16 space-y-4">
        {/* Featured Nostalgic Game Card: Dragon City */}
        <div className="surface-card overflow-hidden">
          <div className="bg-gradient-to-br from-[#ff6b00] via-[#e63946] to-[#7209b7] p-4 text-white relative overflow-hidden">
            <div className="flex items-start justify-between gap-2 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="flex size-11 items-center justify-center rounded-xl bg-white/20 text-2xl backdrop-blur-xs border border-white/30 shadow-sm">
                  🐉
                </div>
                <div>
                  <span className="inline-block rounded bg-amber-300 px-1.5 py-0.2 text-[9px] font-extrabold uppercase tracking-wider text-slate-950">
                    Featured Game
                  </span>
                  <h3 className="text-[16px] font-extrabold leading-tight mt-0.5">
                    Dragon City
                  </h3>
                </div>
              </div>
            </div>

            <p className="mt-2.5 text-[12px] text-white/90 leading-snug relative z-10">
              Breed Legacy & Pure Dragons, build floating islands, and battle in the Dragon League!
            </p>

            <div className="mt-3 flex items-center justify-between gap-2 relative z-10">
              <span className="text-[11px] font-medium text-amber-100">
                🔥 14 friends playing
              </span>
              <button
                type="button"
                onClick={() =>
                  toast.success(
                    "🐉 Dragon City: Collected 45,000 Gold & 12,000 Food from your islands!"
                  )
                }
                className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-[12px] font-bold text-[#d90429] shadow-sm transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Play className="size-3 fill-current" />
                <span>Play Now</span>
              </button>
            </div>
          </div>

          {/* Pending Game Requests (Classic 2016 FB vibe) */}
          <div className="p-3 bg-amber-50/40 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#606770]">
              <span className="flex items-center gap-1.5">
                <Gift className="size-3.5 text-rose-500" />
                <span>Game Requests (2)</span>
              </span>
            </div>

            <div className="space-y-1.5 text-[12px]">
              <div className="flex items-center justify-between gap-2 rounded-lg bg-white p-2 border border-slate-200/70">
                <div className="min-w-0">
                  <p className="font-semibold text-[#1d2129] truncate">
                    Maya sent a Dragon Egg 🥚
                  </p>
                  <p className="text-[11px] text-[#606770]">Dragon City</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    toast.success("🥚 Accepted Maya's Mystery Dragon Egg!")
                  }
                  className="shrink-0 rounded bg-[#4267b2] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#365899] cursor-pointer"
                >
                  Accept
                </button>
              </div>

              <div className="flex items-center justify-between gap-2 rounded-lg bg-white p-2 border border-slate-200/70">
                <div className="min-w-0">
                  <p className="font-semibold text-[#1d2129] truncate">
                    Devon sent +20 Energy ⚡
                  </p>
                  <p className="text-[11px] text-[#606770]">Criminal Case</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    toast.success("⚡ Claimed +20 Energy for Criminal Case!")
                  }
                  className="shrink-0 rounded bg-[#4267b2] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#365899] cursor-pointer"
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Marketplace Picks Widget */}
        <div className="surface-card p-3.5">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <ShoppingBag className="size-4 text-[#365899]" />
              <h3 className="text-[13px] font-bold text-[#1d2129]">
                Marketplace Picks
              </h3>
            </div>
            <span className="inline-flex items-center gap-0.5 text-[11px] text-[#606770]">
              <MapPin className="size-3" />
              <span>Bay Area</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {MARKETPLACE_ITEMS.map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={() =>
                  toast(
                    `🛒 Marketplace: "${item.title}" (${item.price}) — Listed in ${item.location}`
                  )
                }
                className="group flex flex-col items-start rounded-xl border border-slate-200/80 bg-slate-50/70 p-2.5 text-left transition-all hover:border-blue-300 hover:bg-white hover:shadow-xs cursor-pointer"
              >
                <div className="flex h-14 w-full items-center justify-center rounded-lg bg-white text-2xl border border-slate-100 group-hover:scale-[1.03] transition-transform">
                  {item.emoji}
                </div>
                <p className="mt-2 text-[13px] font-extrabold text-[#1d2129]">
                  {item.price}
                </p>
                <p className="text-[11.5px] font-medium text-[#4b4f56] line-clamp-1">
                  {item.title}
                </p>
                <p className="text-[10px] text-[#8d949e] mt-0.5">
                  {item.location}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Online Friends / Chat Contacts */}
        <div className="surface-card p-3.5">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <Users className="size-4 text-emerald-600" />
              <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#606770]">
                Contacts · Online (5)
              </h3>
            </div>
          </div>

          <ul className="space-y-1">
            {ONLINE_FRIENDS.map((friend) => {
              const avatar = getAuthorAvatarStyle(friend.name);
              return (
                <li key={friend.name}>
                  <button
                    type="button"
                    onClick={() =>
                      toast(`💬 Chat with ${friend.name} (${friend.activity})`)
                    }
                    className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-[#f2f3f5] cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative">
                        <div
                          className={cn(
                            "flex size-7 shrink-0 items-center justify-center rounded-full text-[10.5px] font-bold ring-1",
                            avatar.bgClass,
                            avatar.textClass,
                            avatar.ringClass
                          )}
                        >
                          {avatar.initials}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12.5px] font-semibold text-[#1d2129] truncate">
                          {friend.name}
                        </p>
                        <p className="text-[10.5px] text-[#606770] truncate">
                          {friend.activity}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </aside>
  );
}

