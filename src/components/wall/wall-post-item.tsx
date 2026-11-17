"use client";

import React, { useRef, useState } from "react";
import {
  Clock,
  Link2,
  Loader2,
  Maximize2,
  MessageSquare,
  Send,
  Share2,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRelativeTime } from "@/hooks/use-relative-time";
import {
  DEFAULT_PROFILE,
  getAuthorAvatarStyle,
  GUEST_PERSONAS,
} from "@/lib/constants";
import { formatExactTimestamp, formatRelativeTime } from "@/lib/format-time";
import { cn } from "@/lib/utils";
import type { SharePostInput, WallComment, WallPost } from "@/types/wall";

interface WallPostItemProps {
  post: WallPost;
  currentAuthor: string;
  comments: WallComment[];
  shareCount: number;
  onAddComment: (
    post: WallPost,
    authorName: string,
    content: string
  ) => WallComment | null;
  onDeleteComment: (post: WallPost, commentId: string) => void;
  onToggleCommentLike: (post: WallPost, commentId: string) => void;
  onSharePost: (input: SharePostInput) => Promise<boolean>;
}

export function WallPostItem({
  post,
  currentAuthor,
  comments,
  shareCount,
  onAddComment,
  onDeleteComment,
  onToggleCommentLike,
  onSharePost,
}: WallPostItemProps) {
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

  // Comments state
  const [showComments, setShowComments] = useState(true);
  const [commentText, setCommentText] = useState("");
  const commentInputRef = useRef<HTMLInputElement | null>(null);

  // Share dialog state
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareComment, setShareComment] = useState("");
  const [shareAuthor, setShareAuthor] = useState(currentAuthor);
  const [isSharing, setIsSharing] = useState(false);

  const avatar = getAuthorAvatarStyle(post.author_name);
  const currentUserAvatar = getAuthorAvatarStyle(
    currentAuthor || DEFAULT_PROFILE.name
  );
  const sharedEmbed = post.shared_post ?? null;
  const sharedAvatar = sharedEmbed
    ? getAuthorAvatarStyle(sharedEmbed.author_name)
    : null;
  const displayImageUrl = post.image_url || sharedEmbed?.image_url || null;

  const handleFocusComment = () => {
    setShowComments(true);
    setTimeout(() => {
      commentInputRef.current?.focus();
    }, 10);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const added = onAddComment(
      post,
      currentAuthor || DEFAULT_PROFILE.name,
      commentText
    );
    if (added) {
      setCommentText("");
      setShowComments(true);
    }
  };

  const handleOpenShareDialog = () => {
    setShareAuthor(currentAuthor || DEFAULT_PROFILE.name);
    setShareComment("");
    setShareDialogOpen(true);
  };

  const handleConfirmShare = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isSharing) return;
    setIsSharing(true);
    try {
      const ok = await onSharePost({
        author_name: shareAuthor.trim() || DEFAULT_PROFILE.name,
        comment: shareComment,
        originalPost: post,
      });
      if (ok) {
        setShareDialogOpen(false);
        setShareComment("");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyPostLink = async () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}${window.location.pathname}#post-${post.id}`
        : `#post-${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Post link copied to clipboard!");
    } catch {
      toast.success("Post link ready to share!");
    }
  };

  const previewTarget = sharedEmbed ?? post;
  const previewAvatar = getAuthorAvatarStyle(previewTarget.author_name);

  return (
    <article
      id={`post-${post.id}`}
      className={cn(
        "surface-card-interactive overflow-hidden animate-post-enter",
        post.optimistic && "opacity-75"
      )}
    >
      <div className="p-4 sm:p-4.5">
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
              <div className="flex items-center gap-1 flex-wrap text-[14px] leading-snug">
                <h3 className="font-bold text-[#365899] hover:underline truncate cursor-pointer">
                  {post.author_name}
                </h3>
                {sharedEmbed && (
                  <span className="text-[13px] font-normal text-[#616770]">
                    shared{" "}
                    <strong className="font-semibold text-[#365899]">
                      {sharedEmbed.author_name}
                    </strong>
                    &apos;s post
                  </span>
                )}
              </div>
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

        {/* Shared Post Embedded Card (when this post is a shared post) */}
        {sharedEmbed && sharedAvatar && (
          <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-slate-50/60">
            <div className="p-3.5 border-l-4 border-l-[#4267b2]">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ring-1 select-none",
                    sharedAvatar.bgClass,
                    sharedAvatar.textClass,
                    sharedAvatar.ringClass
                  )}
                >
                  {sharedAvatar.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-[#365899] truncate">
                    {sharedEmbed.author_name}
                  </p>
                  <p className="text-[11px] text-[#616770]">Original Wall Post</p>
                </div>
              </div>

              {sharedEmbed.content && (
                <p className="mt-2 text-[13.5px] leading-relaxed text-[#1d2129] whitespace-pre-wrap break-words">
                  {sharedEmbed.content}
                </p>
              )}
            </div>

            {sharedEmbed.image_url && (
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                aria-label={`View photo shared by ${sharedEmbed.author_name}`}
                className="group/img relative block w-full overflow-hidden border-t border-slate-200/80 bg-slate-100 transition-all duration-200 hover:brightness-[0.98] cursor-pointer"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sharedEmbed.image_url}
                  alt={
                    sharedEmbed.content ||
                    `Photo shared by ${sharedEmbed.author_name}`
                  }
                  loading="lazy"
                  className="max-h-[340px] w-full object-cover transition-transform duration-300 group-hover/img:scale-[1.01]"
                />
                <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-md bg-slate-950/70 px-2 py-1 text-[11px] font-medium text-white opacity-0 backdrop-blur-xs transition-opacity duration-200 group-hover/img:opacity-100">
                  <Maximize2 className="size-3" />
                  <span>View Full Photo</span>
                </span>
              </button>
            )}
          </div>
        )}

        {/* Optional Attached Photo (for direct photo posts) */}
        {!sharedEmbed && post.image_url && (
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
          </div>
        )}

        {/* Lightbox Dialog for Post or Shared Photo */}
        {displayImageUrl && (
          <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
            <DialogContent className="max-w-2xl p-3 sm:p-4 bg-white">
              <DialogTitle className="text-sm font-semibold text-[#1d2129] flex items-center justify-between pr-8">
                <span>{previewTarget.author_name}</span>
                <span className="text-xs font-normal text-slate-500">
                  {exactTime}
                </span>
              </DialogTitle>
              {previewTarget.content && (
                <p className="text-sm text-slate-700">
                  {previewTarget.content}
                </p>
              )}
              <div className="overflow-hidden rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={displayImageUrl}
                  alt={
                    previewTarget.content ||
                    `Photo by ${previewTarget.author_name}`
                  }
                  className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg"
                />
              </div>
            </DialogContent>
          </Dialog>
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

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowComments((prev) => !prev)}
                className="hover:underline cursor-pointer"
              >
                {comments.length}{" "}
                {comments.length === 1 ? "Comment" : "Comments"}
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={handleOpenShareDialog}
                className="hover:underline cursor-pointer"
              >
                {shareCount > 0
                  ? `${shareCount} ${shareCount === 1 ? "Share" : "Shares"}`
                  : "Share"}
              </button>
            </div>
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
              onClick={handleFocusComment}
              className="inline-flex items-center justify-center gap-1.5 rounded-md py-1.5 text-[12.5px] font-semibold text-[#606770] transition-colors hover:bg-[#f2f3f5] active:scale-95 cursor-pointer"
            >
              <MessageSquare className="size-3.5" />
              <span>Comment</span>
            </button>

            <button
              type="button"
              onClick={handleOpenShareDialog}
              className="inline-flex items-center justify-center gap-1.5 rounded-md py-1.5 text-[12.5px] font-semibold text-[#606770] transition-colors hover:bg-[#f2f3f5] active:scale-95 cursor-pointer"
            >
              <Share2 className="size-3.5" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2016 Facebook Comments Section */}
      {showComments && (
        <div className="border-t border-slate-200/70 bg-[#f6f7f9] px-4 py-3 space-y-2.5">
          {comments.length > 0 && (
            <ul className="space-y-2.5">
              {comments.map((comment) => {
                const cAvatar = getAuthorAvatarStyle(comment.author_name);
                return (
                  <li
                    key={comment.id}
                    className="group flex items-start gap-2 text-[13px]"
                  >
                    <div
                      className={cn(
                        "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full text-[10.5px] font-bold ring-1 select-none",
                        cAvatar.bgClass,
                        cAvatar.textClass,
                        cAvatar.ringClass
                      )}
                    >
                      {cAvatar.initials}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="relative inline-block max-w-full rounded-2xl bg-white px-3 py-1.5 border border-slate-200/80 shadow-2xs">
                        <span className="font-bold text-[#365899] mr-1.5">
                          {comment.author_name}
                        </span>
                        <span className="text-[#1d2129] break-words">
                          {comment.content}
                        </span>

                        {(comment.likes ?? 0) > 0 && (
                          <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200/70 px-1.5 py-0.2 text-[10.5px] font-semibold text-[#365899] align-middle">
                            <ThumbsUp className="size-2.5 fill-current text-[#4267b2]" />
                            <span>{comment.likes}</span>
                          </span>
                        )}
                      </div>

                      <div className="mt-0.5 flex items-center gap-2.5 pl-2 text-[11px] text-[#606770]">
                        <button
                          type="button"
                          onClick={() => onToggleCommentLike(post, comment.id)}
                          className={cn(
                            "font-semibold hover:underline cursor-pointer",
                            comment.liked ? "text-[#4267b2]" : "text-[#606770]"
                          )}
                        >
                          Like
                        </button>
                        <span>·</span>
                        <span className="tabular-nums">
                          {formatRelativeTime(comment.created_at)}
                        </span>
                        <button
                          type="button"
                          onClick={() => onDeleteComment(post, comment.id)}
                          title="Delete comment"
                          aria-label="Delete comment"
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition-opacity cursor-pointer"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Write a comment input row */}
          <form
            onSubmit={handleCommentSubmit}
            className="flex items-center gap-2 pt-0.5"
          >
            <div
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full text-[10.5px] font-bold ring-1 select-none",
                currentUserAvatar.bgClass,
                currentUserAvatar.textClass,
                currentUserAvatar.ringClass
              )}
              title={`Commenting as ${currentAuthor || DEFAULT_PROFILE.name}`}
            >
              {currentUserAvatar.initials}
            </div>

            <div className="relative flex-1 flex items-center">
              <input
                ref={commentInputRef}
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={`Write a comment as ${
                  (currentAuthor || DEFAULT_PROFILE.name).split(" ")[0]
                }...`}
                aria-label={`Write a comment on ${post.author_name}'s post`}
                maxLength={280}
                className="h-8 w-full rounded-full border border-slate-300/90 bg-white pl-3.5 pr-9 text-[12.5px] text-[#1d2129] placeholder:text-[#8d949e] focus:border-[#4267b2] focus:outline-none focus:ring-2 focus:ring-blue-500/15"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                aria-label="Post comment"
                title="Post comment"
                className="absolute right-1.5 inline-flex size-6 items-center justify-center rounded-full text-[#4267b2] transition-colors hover:bg-blue-50 disabled:text-slate-300 disabled:hover:bg-transparent cursor-pointer"
              >
                <Send className="size-3.5" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Share Post Modal Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="max-w-lg bg-white p-0 overflow-hidden">
          <div className="border-b border-slate-200 bg-[#f6f7f9] px-4 py-3 pr-10">
            <DialogTitle className="text-[15px] font-bold text-[#1d2129] flex items-center gap-2">
              <Share2 className="size-4 text-[#4267b2]" />
              <span>Share on Wall</span>
            </DialogTitle>
          </div>

          <form onSubmit={handleConfirmShare} className="p-4 space-y-3.5">
            {/* Author selector inside Share Modal */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span>Sharing as:</span>
                <input
                  type="text"
                  value={shareAuthor}
                  onChange={(e) => setShareAuthor(e.target.value.slice(0, 36))}
                  placeholder="Your name..."
                  className="h-7 w-36 rounded-md border border-slate-300 bg-white px-2 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-1">
                {GUEST_PERSONAS.slice(0, 3).map((persona) => (
                  <button
                    key={persona}
                    type="button"
                    onClick={() => setShareAuthor(persona)}
                    className={cn(
                      "rounded px-2 py-0.5 text-[11px] font-medium transition-colors cursor-pointer",
                      shareAuthor === persona
                        ? "bg-blue-100 text-blue-700 font-semibold"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                  >
                    {persona.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional commentary input */}
            <textarea
              value={shareComment}
              onChange={(e) => setShareComment(e.target.value.slice(0, 220))}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                  e.preventDefault();
                  handleConfirmShare();
                }
              }}
              placeholder="Say something about this... (optional)"
              rows={2}
              className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 text-[14px] text-[#1d2129] placeholder:text-slate-400 focus:border-[#4267b2] focus:bg-white focus:outline-none"
            />

            {/* Embedded Preview of the Post Being Shared */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 border-l-4 border-l-[#4267b2]">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ring-1",
                    previewAvatar.bgClass,
                    previewAvatar.textClass,
                    previewAvatar.ringClass
                  )}
                >
                  {previewAvatar.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-[#365899] truncate">
                    {previewTarget.author_name}
                  </p>
                  <p className="text-[11px] text-slate-500">Original Post</p>
                </div>
              </div>

              {previewTarget.content && (
                <p className="mt-2 text-[13px] text-slate-700 line-clamp-3 whitespace-pre-wrap">
                  {previewTarget.content}
                </p>
              )}

              {displayImageUrl && (
                <div className="mt-2 overflow-hidden rounded-md border border-slate-200 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={displayImageUrl}
                    alt="Shared post preview"
                    className="h-28 w-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCopyPostLink}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <Link2 className="size-3.5" />
                <span>Copy Link</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShareDialogOpen(false)}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  disabled={isSharing}
                  className="h-8 rounded-lg px-4 text-xs font-semibold"
                >
                  {isSharing ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Sharing...</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="size-3.5" />
                      <span>Share to Wall</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </article>
  );
}
