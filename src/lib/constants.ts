import type { ProfileInfo, WallComment, WallPost } from "@/types/wall";

export const MAX_POST_LENGTH = 280;
export const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

export const SUPABASE_TABLE_NAME = "posts";
export const SUPABASE_STORAGE_BUCKET = "wall-photos";
export const LOCAL_STORAGE_KEY = "wall_react_posts_v3";
export const COMMENTS_STORAGE_KEY = "wall_react_comments_v1";
export const SHARE_COUNTS_STORAGE_KEY = "wall_react_share_counts_v1";
export const BROADCAST_CHANNEL_NAME = "wall_react_realtime_sync";

export const DEFAULT_PROFILE: ProfileInfo = {
  name: "Alex Rivera",
  subtitle: "@alexrivera · Public Wall",
  avatarUrl: "", // Uses crisp default vector avatar component
  networks: ["Design Engineering", "Open Web Alumni"],
  currentCity: "San Francisco, CA",
  statusTagline: "Building nostalgic interfaces with modern craft. Leave a note on the wall below.",
};

export const GUEST_PERSONAS = [
  "Alex Rivera",
  "Maya Lin",
  "Marcus Vance",
  "Elena Rostova",
  "Devon Brooks",
  "Sora Takahashi",
] as const;

export function getAuthorAvatarStyle(name: string): {
  initials: string;
  bgClass: string;
  textClass: string;
  ringClass: string;
} {
  const clean = (name || "Visitor").trim();
  const parts = clean.split(/\s+/);
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : clean.slice(0, 2).toUpperCase();

  const palettes = [
    {
      bgClass: "bg-blue-600/10",
      textClass: "text-blue-700",
      ringClass: "ring-blue-600/20",
    },
    {
      bgClass: "bg-slate-900/8",
      textClass: "text-slate-800",
      ringClass: "ring-slate-900/15",
    },
    {
      bgClass: "bg-emerald-600/10",
      textClass: "text-emerald-700",
      ringClass: "ring-emerald-600/20",
    },
    {
      bgClass: "bg-amber-500/12",
      textClass: "text-amber-800",
      ringClass: "ring-amber-500/25",
    },
    {
      bgClass: "bg-indigo-600/10",
      textClass: "text-indigo-700",
      ringClass: "ring-indigo-600/20",
    },
    {
      bgClass: "bg-rose-600/10",
      textClass: "text-rose-700",
      ringClass: "ring-rose-600/20",
    },
  ];

  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = clean.charCodeAt(i) + ((hash << 5) - hash);
  }
  const palette = palettes[Math.abs(hash) % palettes.length];

  return {
    initials,
    ...palette,
  };
}

export function getInitialSeedPosts(): WallPost[] {
  const now = Date.now();
  const min = 60 * 1000;
  const hour = 60 * min;

  return [
    {
      id: "seed-1",
      author_name: "Alex Rivera",
      content:
        "Late-night ship session — Supabase Realtime + Next.js is officially live on the Wall. Drop a message or photo below!",
      image_url: "/images/late-night-ship.jpg",
      created_at: new Date(now - 30 * 1000).toISOString(),
    },
    {
      id: "seed-2",
      author_name: "Maya Lin",
      content:
        "Golden hour walk up the foothills trail to clear my head after shipping the new design system.",
      image_url: "/images/palo-alto-trail.jpg",
      created_at: new Date(now - 12 * min).toISOString(),
    },
    {
      id: "seed-3",
      author_name: "Marcus Vance",
      content:
        "There was something special about the 2008 web—no algorithms, just a chronological wall where friends left notes.",
      image_url: null,
      created_at: new Date(now - 38 * min).toISOString(),
    },
    {
      id: "seed-4",
      author_name: "Elena Rostova",
      content:
        "Tested the live sync across two browser windows—the spring entrance animation on new posts feels super snappy.",
      image_url: null,
      created_at: new Date(now - 2 * hour).toISOString(),
    },
    {
      id: "seed-5",
      author_name: "Devon Brooks",
      content:
        "Just pulled an all-nighter debugging WebSockets. Turns out a good espresso and clean SQL schemas solve 90% of problems.",
      image_url: null,
      created_at: new Date(now - 5 * hour).toISOString(),
    },
  ];
}

export function getDefaultCommentsForPost(post: WallPost): WallComment[] {
  const postTime = new Date(post.created_at).getTime() || Date.now();
  const min = 60 * 1000;

  if (
    post.id === "seed-1" ||
    post.content.includes("Late-night ship session")
  ) {
    return [
      {
        id: `default-c1-${post.id}`,
        post_id: post.id,
        author_name: "Maya Lin",
        content: "Congrats on shipping! The realtime sync is super fast.",
        created_at: new Date(postTime + 2 * min).toISOString(),
        likes: 2,
      },
      {
        id: `default-c2-${post.id}`,
        post_id: post.id,
        author_name: "Marcus Vance",
        content: "Classic 2016 Facebook vibes, love the layout!",
        created_at: new Date(postTime + 5 * min).toISOString(),
        likes: 1,
      },
    ];
  }

  if (post.id === "seed-2" || post.content.includes("Golden hour walk")) {
    return [
      {
        id: `default-c3-${post.id}`,
        post_id: post.id,
        author_name: "Elena Rostova",
        content: "Incredible view! Well deserved break.",
        created_at: new Date(postTime + 4 * min).toISOString(),
        likes: 3,
      },
    ];
  }

  return [];
}

