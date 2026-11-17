"use client";

import { useState } from "react";
import {
  Clock,
  Maximize2,
  MessageSquare,
  Share2,
  ThumbsUp,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRelativeTime } from "@/hooks/use-relative-time";
import { getAuthorAvatarStyle } from "@/lib/constants";
import { formatExactTimestamp } from "@/lib/format-time";
import { cn } from "@/lib/utils";
import type { WallPost } from "@/types/wall";

interface WallPostItemProps {
  post: WallPost;
}

export function WallPostItem({ post }: WallPostItemProps) {
  const relativeTime = useRelativeTime(post.created_at);
  const exactTime = formatExactTimestamp(post.created_at);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(() => {
    let h = 0;
    for (let i = 0; i < post.id.length; i++) {
      h = post.id.charCodeAt(i) + ((h << 5) - h);
    }
    return (Math.abs(h) % 9) + 2;
  });

  const avatar = getAuthorAvatarStyle(post.author_name);

  return (
    <article
      className={cn(
        "surface-card-interactive p-4 sm:p-4.5 animate-post-enter",
        post.optimistic && "opacity-75"
      )}
    >
      {/* Header Row: Default Avatar, Author & Relative Timestamp */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-full text-[13px] font-bold ring-1 select-none",
              avatar.bgClass,
              avatar.textClass,
              avatar.ringClass
            )}
          >
            {avatar.initials}
          </div>

          <div className="min-w-0">
            <h3 className="text-[14px] font-bold text-[#365899] hover:underline truncate cursor-pointer">
              {post.author_name}
            </h3>
            <time
              dateTime={post.created_at}
              title={exactTime}
              className="inline-flex items-center gap-1 text-[11.5px] text-[#616770] tabular-nums"
            >
              <span>{relativeTime}</span>
              <span>·</span>
              <Clock className="size-3 opacity-75" />
            </time>
          </div>
        </div>
      </div>

      {/* Message Body */}
      {post.content && post.content.trim().length > 0 && (
        <p className="mt-3 text-[14.5px] leading-[1.55] text-[#1d2129] whitespace-pre-wrap break-words">
          {post.content}
        </p>
      )}

      {/* Optional Attached Photo */}
      {post.image_url && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            aria-label={`View photo shared by ${post.author_name}`}
            className="group/img relative block w-full overflow-hidden rounded-lg border border-slate-200/80 bg-slate-100 transition-all duration-200 hover:brightness-[0.98] cursor-pointer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.image_url}
              alt={
                post.content
                  ? `${post.author_name}: ${post.content}`
                  : `Photo shared by ${post.author_name}`
              }
              loading="lazy"
              className="max-h-[380px] w-full object-cover transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/img:scale-[1.01]"
            />
            <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-md bg-slate-950/70 px-2 py-1 text-[11px] font-medium text-white opacity-0 backdrop-blur-xs transition-opacity duration-200 group-hover/img:opacity-100">
              <Maximize2 className="size-3" />
              <span>View Full Photo</span>
            </span>
          </button>

          <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
            <DialogContent className="max-w-2xl p-3 sm:p-4 bg-white">
              <DialogTitle className="text-sm font-semibold text-[#1d2129] flex items-center justify-between pr-8">
                <span>{post.author_name}</span>
                <span className="text-xs font-normal text-slate-500">
                  {exactTime}
                </span>
              </DialogTitle>
              {post.content && (
                <p className="text-sm text-slate-700">{post.content}</p>
              )}
              <div className="overflow-hidden rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.image_url}
                  alt={post.content || `Photo by ${post.author_name}`}
                  className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg"
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* 2016 Facebook Reaction Summary & Action Bar */}
      <div className="mt-3 pt-2.5 border-t border-slate-100">
        <div className="flex items-center justify-between text-[12px] text-[#606770] mb-2 px-1">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-flex size-4 items-center justify-center rounded-full bg-[#4267b2] text-white">
              <ThumbsUp className="size-2.5 fill-current" />
            </span>
            <span>{likeCount}</span>
          </span>
          <span>Wall Post</span>
        </div>

        <div className="grid grid-cols-3 gap-1 pt-1 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              setLiked((prev) => !prev);
              setLikeCount((c) => (liked ? c - 1 : c + 1));
            }}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-md py-1.5 text-[12.5px] font-semibold transition-colors hover:bg-[#f2f3f5] active:scale-95 cursor-pointer",
              liked ? "text-[#4267b2]" : "text-[#606770]"
            )}
          >
            <ThumbsUp className={cn("size-3.5", liked && "fill-current")} />
            <span>Like</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const textarea = document.querySelector("textarea");
              textarea?.focus();
            }}
            className="inline-flex items-center justify-center gap-1.5 rounded-md py-1.5 text-[12.5px] font-semibold text-[#606770] transition-colors hover:bg-[#f2f3f5] active:scale-95 cursor-pointer"
          >
            <MessageSquare className="size-3.5" />
            <span>Write on Wall</span>
          </button>

          <button
            type="button"
            onClick={() => toast.success(`Shared ${post.author_name}'s post!`)}
            className="inline-flex items-center justify-center gap-1.5 rounded-md py-1.5 text-[12.5px] font-semibold text-[#606770] transition-colors hover:bg-[#f2f3f5] active:scale-95 cursor-pointer"
          >
            <Share2 className="size-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </article>
  );
}
