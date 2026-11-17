"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  BROADCAST_CHANNEL_NAME,
  DEFAULT_PROFILE,
  getInitialSeedPosts,
  LOCAL_STORAGE_KEY,
  MAX_POST_LENGTH,
  SUPABASE_TABLE_NAME,
} from "@/lib/constants";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { uploadWallPhoto } from "@/lib/supabase/storage";
import type {
  ConnectionStatus,
  CreatePostInput,
  WallPost,
} from "@/types/wall";

/**
 * Normalizes a database row from Supabase into a strict WallPost object,
 * gracefully handling common column naming variations (`content`, `message`, `body`).
 */
function normalizePostRow(row: Record<string, unknown>): WallPost {
  const rawAuthor = String(
    row.author_name ?? row.author ?? row.username ?? DEFAULT_PROFILE.name
  );
  const author_name =
    rawAuthor === "Greg Wientjes" ? DEFAULT_PROFILE.name : rawAuthor;

  const rawContent = String(row.content ?? row.message ?? row.body ?? "");
  const content = rawContent.replace(/\bGreg\b/g, "Alex");

  return {
    id: String(row.id ?? crypto.randomUUID()),
    author_name,
    content,
    image_url:
      typeof row.image_url === "string" && row.image_url.trim().length > 0
        ? row.image_url
        : typeof row.photo_url === "string" && row.photo_url.trim().length > 0
        ? row.photo_url
        : null,
    created_at:
      typeof row.created_at === "string"
        ? row.created_at
        : new Date().toISOString(),
  };
}

function loadLocalPosts(): WallPost[] {
  if (typeof window === "undefined") {
    return getInitialSeedPosts();
  }
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      const seed = getInitialSeedPosts();
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    const seed = getInitialSeedPosts();
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(seed));
    return seed;
  } catch {
    return getInitialSeedPosts();
  }
}

function saveLocalPosts(posts: WallPost[]) {
  if (typeof window === "undefined") return;
  try {
    const cleanPosts = posts.map(({ optimistic, ...rest }) => rest);
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cleanPosts));
  } catch {
    // Ignore storage quota errors
  }
}

export function useWallPosts() {
  const [posts, setPosts] = useState<WallPost[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");
  const [realtimeEventsCount, setRealtimeEventsCount] = useState<number>(0);

  const broadcastRef = useRef<BroadcastChannel | null>(null);

  const fetchPosts = useCallback(async () => {
    const supabase = getSupabaseClient();

    if (!supabase || !isSupabaseConfigured()) {
      const local = loadLocalPosts();
      setPosts(local);
      setConnectionStatus("local-fallback");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from(SUPABASE_TABLE_NAME)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        console.warn("Supabase query warning, falling back to local cache:", error.message);
        const local = loadLocalPosts();
        setPosts(local);
        setConnectionStatus("error");
        setIsLoading(false);
        return;
      }

      const normalized = (data ?? []).map((row) =>
        normalizePostRow(row as Record<string, unknown>)
      );

      setPosts(normalized);
      setConnectionStatus("connected");
    } catch (err) {
      console.warn("Failed to fetch posts from Supabase:", err);
      setPosts(loadLocalPosts());
      setConnectionStatus("error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();

    // Set up cross-tab BroadcastChannel for instant multi-tab sync
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      broadcastRef.current = channel;
      channel.onmessage = (event) => {
        const payload = event.data;
        if (payload?.type === "NEW_POST" && payload.post) {
          const incoming = payload.post as WallPost;
          setPosts((prev) => {
            if (prev.some((p) => p.id === incoming.id)) return prev;
            const updated = [incoming, ...prev];
            saveLocalPosts(updated);
            return updated;
          });
          setRealtimeEventsCount((c) => c + 1);
        }
      };
    }

    // Set up Supabase Realtime subscription on `public.posts`
    const supabase = getSupabaseClient();
    if (!supabase) {
      return () => {
        broadcastRef.current?.close();
      };
    }

    const realtimeChannel = supabase
      .channel("wall-posts-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: SUPABASE_TABLE_NAME,
        },
        (payload) => {
          const newPost = normalizePostRow(
            payload.new as Record<string, unknown>
          );
          setPosts((prev) => {
            // Avoid duplicating if already added via optimistic / direct insert response
            if (prev.some((p) => p.id === newPost.id)) {
              return prev.map((p) => (p.id === newPost.id ? newPost : p));
            }
            return [newPost, ...prev];
          });
          setRealtimeEventsCount((c) => c + 1);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: SUPABASE_TABLE_NAME,
        },
        (payload) => {
          const deletedId = String(
            (payload.old as Record<string, unknown>)?.id ?? ""
          );
          if (deletedId) {
            setPosts((prev) => prev.filter((p) => p.id !== deletedId));
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setConnectionStatus("connected");
        }
      });

    return () => {
      broadcastRef.current?.close();
      supabase.removeChannel(realtimeChannel);
    };
  }, [fetchPosts]);

  const createPost = useCallback(
    async ({ author_name, content, photoFile }: CreatePostInput): Promise<boolean> => {
      const trimmedContent = content.trim();
      if (!trimmedContent && !photoFile) {
        toast.error("Write a message or attach a photo before sharing.");
        return false;
      }

      if (trimmedContent.length > MAX_POST_LENGTH) {
        toast.error(`Messages must be ${MAX_POST_LENGTH} characters or fewer.`);
        return false;
      }

      setIsSubmitting(true);
      const finalAuthor =
        author_name && author_name.trim().length > 0
          ? author_name.trim()
          : DEFAULT_PROFILE.name;

      const tempId = `optimistic-${Date.now()}`;
      const localPreviewUrl = photoFile
        ? URL.createObjectURL(photoFile)
        : null;

      // Frame-0 Optimistic UI insertion (Emil Kowalski motion principle)
      const optimisticPost: WallPost = {
        id: tempId,
        author_name: finalAuthor,
        content: trimmedContent,
        image_url: localPreviewUrl,
        created_at: new Date().toISOString(),
        optimistic: true,
      };

      setPosts((prev) => [optimisticPost, ...prev]);

      try {
        let uploadedImageUrl: string | null = null;
        if (photoFile) {
          uploadedImageUrl = await uploadWallPhoto(photoFile);
        }

        const supabase = getSupabaseClient();

        if (supabase && connectionStatus !== "local-fallback") {
          const { data, error } = await supabase
            .from(SUPABASE_TABLE_NAME)
            .insert({
              author_name: finalAuthor,
              content: trimmedContent,
              image_url: uploadedImageUrl,
            })
            .select("*")
            .single();

          if (error) {
            throw new Error(error.message);
          }

          const confirmedPost = normalizePostRow(
            data as Record<string, unknown>
          );

          setPosts((prev) => {
            // Remove optimistic temp row and deduplicate if Realtime arrived first
            const withoutTemp = prev.filter(
              (p) => p.id !== tempId && p.id !== confirmedPost.id
            );
            return [confirmedPost, ...withoutTemp];
          });

          broadcastRef.current?.postMessage({
            type: "NEW_POST",
            post: confirmedPost,
          });

          toast.success("Shared to the Wall!");
          return true;
        } else {
          // Local persistent storage mode
          const savedPost: WallPost = {
            id: crypto.randomUUID(),
            author_name: finalAuthor,
            content: trimmedContent,
            image_url: uploadedImageUrl,
            created_at: new Date().toISOString(),
          };

          setPosts((prev) => {
            const next = [
              savedPost,
              ...prev.filter((p) => p.id !== tempId),
            ];
            saveLocalPosts(next);
            return next;
          });

          broadcastRef.current?.postMessage({
            type: "NEW_POST",
            post: savedPost,
          });

          toast.success("Shared to the Wall!");
          return true;
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Could not share post.";
        // Rollback optimistic row on hard error
        setPosts((prev) => prev.filter((p) => p.id !== tempId));
        toast.error(message);
        return false;
      } finally {
        if (localPreviewUrl) {
          URL.revokeObjectURL(localPreviewUrl);
        }
        setIsSubmitting(false);
      }
    },
    [connectionStatus]
  );

  return {
    posts,
    isLoading,
    isSubmitting,
    connectionStatus,
    realtimeEventsCount,
    createPost,
    refreshPosts: fetchPosts,
  };
}

