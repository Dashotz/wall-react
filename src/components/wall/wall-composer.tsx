"use client";

import React, { useRef, useState } from "react";
import { ImagePlus, Loader2, PencilLine, Send, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_PROFILE,
  getAuthorAvatarStyle,
  GUEST_PERSONAS,
  MAX_POST_LENGTH,
} from "@/lib/constants";
import { validatePhotoFile } from "@/lib/supabase/storage";
import { cn } from "@/lib/utils";
import type { CreatePostInput } from "@/types/wall";

interface WallComposerProps {
  onShare: (input: CreatePostInput) => Promise<boolean>;
  isSubmitting: boolean;
  authorName?: string;
  onAuthorChange?: (name: string) => void;
}

export function WallComposer({
  onShare,
  isSubmitting,
  authorName: controlledAuthor,
  onAuthorChange,
}: WallComposerProps) {
  const [content, setContent] = useState<string>("");
  const [internalAuthorName, setInternalAuthorName] = useState<string>(
    DEFAULT_PROFILE.name
  );
  const authorName = controlledAuthor ?? internalAuthorName;
  const setAuthorName = (name: string) => {
    setInternalAuthorName(name);
    onAuthorChange?.(name);
  };
  const [isEditingAuthor, setIsEditingAuthor] = useState<boolean>(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const charsRemaining = MAX_POST_LENGTH - content.length;
  const progressRatio = Math.min(1, content.length / MAX_POST_LENGTH);
  const canShare =
    (content.trim().length > 0 || photoFile !== null) &&
    charsRemaining >= 0 &&
    !isSubmitting;

  const avatarStyle = getAuthorAvatarStyle(authorName);

  const handlePhotoSelection = (file: File | null | undefined) => {
    if (!file) return;
    const error = validatePhotoFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setPhotoFile(file);
    setPhotoPreview(previewUrl);
  };

  const clearPhoto = () => {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!canShare) return;

    const currentContent = content;
    const currentPhoto = photoFile;
    const currentAuthor = authorName.trim() || DEFAULT_PROFILE.name;

    setContent("");
    clearPhoto();

    const ok = await onShare({
      author_name: currentAuthor,
      content: currentContent,
      photoFile: currentPhoto,
    });

    if (!ok) {
      setContent(currentContent);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handlePhotoSelection(droppedFile);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="surface-card overflow-hidden transition-shadow duration-200 focus-within:shadow-[inset_0_1px_0_0_rgba(255,255,255,1),0_0_0_1px_rgba(37,99,235,0.35),0_8px_24px_-4px_rgba(37,99,235,0.1)]"
    >
      {/* Top Author Identity Bar */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/60 px-4 py-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ring-1",
              avatarStyle.bgClass,
              avatarStyle.textClass,
              avatarStyle.ringClass
            )}
          >
            {avatarStyle.initials}
          </div>

          {!isEditingAuthor ? (
            <div className="flex items-center gap-1.5 text-[12.5px] text-slate-600 truncate">
              <span>Posting as</span>
              <button
                type="button"
                onClick={() => setIsEditingAuthor(true)}
                title="Click to customize display name"
                className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 font-semibold text-slate-900 shadow-2xs border border-slate-200/80 transition-colors hover:border-blue-400 hover:text-blue-700 cursor-pointer"
              >
                <span>{authorName}</span>
                <PencilLine className="size-3 text-slate-400" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 flex-wrap">
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value.slice(0, 36))}
                placeholder="Your name..."
                aria-label="Author name"
                className="h-7 w-36 rounded-md border border-blue-400 bg-white px-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <div className="hidden sm:flex items-center gap-1">
                {GUEST_PERSONAS.slice(0, 3).map((persona) => (
                  <button
                    key={persona}
                    type="button"
                    onClick={() => {
                      setAuthorName(persona);
                      setIsEditingAuthor(false);
                    }}
                    className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-200/80 hover:text-slate-900 cursor-pointer"
                  >
                    {persona.split(" ")[0]}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!authorName.trim()) setAuthorName(DEFAULT_PROFILE.name);
                  setIsEditingAuthor(false);
                }}
                className="rounded-md bg-blue-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-blue-700 cursor-pointer"
              >
                Done
              </button>
            </div>
          )}
        </div>

        <span className="hidden sm:inline-block font-mono text-[10.5px] text-slate-400">
          ⌘ + Enter to share
        </span>
      </div>

      {/* Main Composer Body */}
      <div className="p-4 sm:p-5">
        <textarea
          value={content}
          onChange={(e) => {
            const val = e.target.value;
            if (val.length <= MAX_POST_LENGTH) {
              setContent(val);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder="What's on your mind? Write a note on the wall..."
          maxLength={MAX_POST_LENGTH}
          aria-label="What's on your mind?"
          rows={3}
          disabled={isSubmitting}
          className="w-full resize-none border-0 bg-transparent p-0 text-[15px] leading-relaxed text-[#0b0f19] placeholder:text-slate-400 focus:outline-none disabled:opacity-50"
        />

        {/* Photo Upload Dropzone / Preview */}
        <div className="mt-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={(e) => handlePhotoSelection(e.target.files?.[0])}
            className="hidden"
            aria-label="Upload photo"
          />

          {!photoPreview ? (
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={cn(
                "group flex items-center justify-center gap-3 rounded-xl border border-dashed px-4 py-3.5 text-center transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer select-none",
                isDragging
                  ? "border-blue-600 bg-blue-50/70 scale-[0.995]"
                  : "border-slate-200/90 bg-slate-50/50 hover:border-blue-400/70 hover:bg-blue-50/30"
              )}
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-white text-slate-500 shadow-2xs border border-slate-200/70 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 group-hover:text-blue-600">
                <ImagePlus className="size-4" />
              </div>
              <div className="text-left">
                <p className="text-[12.5px] text-slate-600">
                  <span className="font-semibold text-slate-800 group-hover:text-blue-700">
                    Click to add photo
                  </span>{" "}
                  <span className="text-slate-400">(optional)</span>
                </p>
                <p className="font-mono text-[10.5px] text-slate-400">
                  JPG, PNG, GIF up to 5MB
                </p>
              </div>
            </div>
          ) : (
            <div className="relative flex items-center gap-3.5 rounded-xl border border-slate-200/90 bg-slate-50/80 p-2.5 animate-post-enter">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoPreview}
                alt="Selected photo preview"
                className="h-20 w-28 rounded-lg object-cover border border-slate-200 bg-white"
              />
              <div className="min-w-0 flex-1 pr-7">
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {photoFile?.name ?? "Attached photo"}
                </p>
                {photoFile && (
                  <p className="font-mono text-[11px] text-slate-500 mt-0.5">
                    {(photoFile.size / 1024).toFixed(0)} KB · Ready to upload
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-1.5 text-[11.5px] font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  Replace image
                </button>
              </div>
              <button
                type="button"
                onClick={clearPhoto}
                aria-label="Remove attached photo"
                className="absolute right-2.5 top-2.5 inline-flex size-6 items-center justify-center rounded-full bg-white text-slate-500 shadow-xs border border-slate-200 transition-transform hover:scale-105 hover:text-slate-900 active:scale-95 cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer Bar: Character Limit Progress & Tactile Share Button */}
      <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/40 px-4 py-2.5 sm:px-5">
        <div className="flex items-center gap-2">
          {/* Circular SVG Progress Ring */}
          <svg className="size-4 -rotate-90" viewBox="0 0 20 20">
            <circle
              cx="10"
              cy="10"
              r="7.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              className="text-slate-200"
            />
            <circle
              cx="10"
              cy="10"
              r="7.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeDasharray={2 * Math.PI * 7.5}
              strokeDashoffset={2 * Math.PI * 7.5 * (1 - progressRatio)}
              strokeLinecap="round"
              className={cn(
                "transition-all duration-150",
                charsRemaining <= 0
                  ? "text-red-500"
                  : charsRemaining <= 25
                  ? "text-amber-500"
                  : "text-blue-600"
              )}
            />
          </svg>
          <span
            aria-live="polite"
            className={cn(
              "font-mono text-[11.5px] transition-colors duration-150",
              charsRemaining <= 0
                ? "font-semibold text-red-600"
                : charsRemaining <= 25
                ? "font-medium text-amber-600"
                : "text-slate-500"
            )}
          >
            {charsRemaining} characters remaining
          </span>
        </div>

        <Button
          type="submit"
          disabled={!canShare}
          className={cn(
            "h-9 rounded-lg px-5 text-[13px] font-semibold",
            !canShare &&
              "bg-slate-200/80 text-slate-400 shadow-none disabled:opacity-100"
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              <span>Sharing...</span>
            </>
          ) : (
            <>
              <span>Share</span>
              <Send className="size-3.5" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
