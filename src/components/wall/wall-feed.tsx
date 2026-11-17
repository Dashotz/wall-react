"use client";

import { MessageSquarePlus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { WallPostItem } from "@/components/wall/wall-post-item";
import type { SharePostInput, WallComment, WallPost } from "@/types/wall";

interface WallFeedProps {
  posts: WallPost[];
  isLoading: boolean;
  currentAuthor: string;
  shareCounts: Record<string, number>;
  getCommentsForPost: (post: WallPost) => WallComment[];
  onAddComment: (
    post: WallPost,
    authorName: string,
    content: string
  ) => WallComment | null;
  onDeleteComment: (post: WallPost, commentId: string) => void;
  onToggleCommentLike: (post: WallPost, commentId: string) => void;
  onSharePost: (input: SharePostInput) => Promise<boolean>;
}

export function WallFeed({
  posts,
  isLoading,
  currentAuthor,
  shareCounts,
  getCommentsForPost,
  onAddComment,
  onDeleteComment,
  onToggleCommentLike,
  onSharePost,
}: WallFeedProps) {
  if (isLoading) {
    return (
      <div className="mt-4 space-y-3.5" aria-busy="true">
        {[1, 2, 3].map((n) => (
          <div key={n} className="surface-card p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-4 w-4/5" />
            {n === 1 && <Skeleton className="h-48 w-full rounded-lg mt-2" />}
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="surface-card mt-4 flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="flex size-11 items-center justify-center rounded-full bg-blue-50 text-[#365899] border border-blue-100">
          <MessageSquarePlus className="size-5" />
        </div>
        <h3 className="mt-3 text-sm font-bold text-[#1d2129]">
          No wall posts yet
        </h3>
        <p className="mt-1 max-w-xs text-xs text-[#606770] leading-relaxed">
          Type a message or attach a photo above and press Share!
        </p>
      </div>
    );
  }

  return (
    <section aria-label="Wall Posts Feed" className="mt-4">
      <div className="space-y-3.5">
        {posts.map((post) => (
          <WallPostItem
            key={post.id}
            post={post}
            currentAuthor={currentAuthor}
            comments={getCommentsForPost(post)}
            shareCount={shareCounts[post.id] ?? 0}
            onAddComment={onAddComment}
            onDeleteComment={onDeleteComment}
            onToggleCommentLike={onToggleCommentLike}
            onSharePost={onSharePost}
          />
        ))}
      </div>
    </section>
  );
}
