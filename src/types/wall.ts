export interface SharedPostEmbed {
  id: string;
  author_name: string;
  content: string;
  image_url: string | null;
  created_at: string;
}

export interface WallComment {
  id: string;
  post_id: string;
  author_name: string;
  content: string;
  created_at: string;
  likes: number;
  liked?: boolean;
}

export interface WallPost {
  id: string;
  author_name: string;
  content: string;
  image_url: string | null;
  created_at: string;
  optimistic?: boolean;
  shared_post?: SharedPostEmbed | null;
}

export interface ProfileInfo {
  name: string;
  subtitle: string;
  avatarUrl: string;
  networks: string[];
  currentCity: string;
  statusTagline?: string;
}

export type ConnectionStatus =
  | "connected"      // Live Supabase + Realtime active
  | "connecting"     // Initial handshake with Supabase
  | "local-fallback" // Using local persistent storage (with BroadcastChannel live sync)
  | "error";         // Connection error (gracefully degraded)

export interface CreatePostInput {
  author_name?: string;
  content: string;
  photoFile?: File | null;
}

export interface SharePostInput {
  author_name?: string;
  comment?: string;
  originalPost: WallPost;
}


