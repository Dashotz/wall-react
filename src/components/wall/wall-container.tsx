"use client";

import { ProfileSidebar } from "@/components/wall/profile-sidebar";
import { RightSidebar } from "@/components/wall/right-sidebar";
import { WallComposer } from "@/components/wall/wall-composer";
import { WallFeed } from "@/components/wall/wall-feed";
import { WallHeader } from "@/components/wall/wall-header";
import { useWallPosts } from "@/hooks/use-wall-posts";
import { DEFAULT_PROFILE } from "@/lib/constants";

export function WallContainer() {
  const {
    posts,
    isLoading,
    isSubmitting,
    createPost,
    refreshPosts,
  } = useWallPosts();

  return (
    <div id="top" className="min-h-screen w-full bg-[#e9ebee] flex flex-col">
      {/* Classic 2016 Top Blue Navigation Bar */}
      <WallHeader onRefresh={refreshPosts} isLoading={isLoading} />

      {/* Three-Column 2016 Social Layout (Left Sidebar + Center Wall + Right Games/Marketplace Sidebar) */}
      <div className="mx-auto flex w-full max-w-[1220px] flex-1 flex-col lg:flex-row gap-4 sm:gap-5 px-3 sm:px-6 py-4 sm:py-5">
        {/* Left Sidebar: Default Profile, Marketplace Nav & Nostalgic Games Shortcuts */}
        <ProfileSidebar profile={DEFAULT_PROFILE} />

        {/* Center Column: Wall Composer & Dynamic Feed */}
        <main className="flex-1 min-w-0">
          <WallComposer onShare={createPost} isSubmitting={isSubmitting} />
          <WallFeed posts={posts} isLoading={isLoading} />
        </main>

        {/* Right Sidebar: Dragon City Featured Game, Game Requests, Marketplace & Online Contacts */}
        <RightSidebar />
      </div>
    </div>
  );
}
