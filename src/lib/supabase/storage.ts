import {
  ALLOWED_IMAGE_TYPES,
  MAX_PHOTO_SIZE_BYTES,
  SUPABASE_STORAGE_BUCKET,
} from "@/lib/constants";
import { getSupabaseClient } from "@/lib/supabase/client";

export function validatePhotoFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Please select a valid image file (JPG, PNG, GIF, or WebP).";
  }
  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    return "Photo exceeds the 5MB size limit. Please choose a smaller image.";
  }
  return null;
}

/**
 * Converts a File to an optimized Data URL as a resilient fallback
 * when Supabase Storage bucket is not yet created or in local demo mode.
 */
export async function fileToOptimizedDataUrl(file: File): Promise<string> {
  // Keep GIFs untouched so animations stay intact
  if (file.type === "image/gif" || typeof document === "undefined") {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Failed to read image file."));
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => resolve(String(reader.result));
      img.onload = () => {
        const maxDim = 1200;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(String(reader.result));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.86));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a photo to Supabase Storage (`wall-photos` bucket) and returns its public URL.
 * Gracefully falls back to an optimized Data URL if the bucket hasn't been configured yet.
 */
export async function uploadWallPhoto(file: File): Promise<string> {
  const validationError = validatePhotoFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return fileToOptimizedDataUrl(file);
  }

  try {
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeExt = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext)
      ? ext
      : "jpg";
    const filePath = `posts/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}.${safeExt}`;

    const { error: uploadError } = await supabase.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      // Fallback so the post with photo still saves cleanly in the `posts.image_url` column
      return fileToOptimizedDataUrl(file);
    }

    const { data } = supabase.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .getPublicUrl(filePath);

    return data.publicUrl || (await fileToOptimizedDataUrl(file));
  } catch {
    return fileToOptimizedDataUrl(file);
  }
}

