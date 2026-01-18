"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { MediaLightbox } from "./media-lightbox";
import type { MediaItem } from "@/types";

interface MediaGalleryProps {
  ids: string;
  columns?: 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
  showCaptions?: boolean;
}

const gapClasses = {
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
};

const columnClasses = {
  2: "grid-cols-2",
  3: "grid-cols-2 md:grid-cols-3",
  4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
};

export function MediaGallery({
  ids,
  columns = 3,
  gap = "md",
  showCaptions = false,
}: MediaGalleryProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    async function fetchMedia() {
      try {
        // Parse the ids string - can be comma-separated or JSON array
        let idArray: string[];
        if (ids.startsWith("[")) {
          idArray = JSON.parse(ids);
        } else {
          idArray = ids.split(",").map((id) => id.trim());
        }

        // Fetch each media item
        const responses = await Promise.all(
          idArray.map((id) => fetch(`/api/admin/media/${id}`))
        );

        const mediaItems: MediaItem[] = [];
        for (const response of responses) {
          if (response.ok) {
            const data = await response.json();
            if (data.media) {
              mediaItems.push(data.media);
            }
          }
        }

        setMedia(mediaItems);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load gallery");
      } finally {
        setLoading(false);
      }
    }

    fetchMedia();
  }, [ids]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 bg-muted rounded-lg my-6">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-48 bg-muted rounded-lg text-muted-foreground text-sm my-6">
        {error}
      </div>
    );
  }

  if (media.length === 0) {
    return null;
  }

  return (
    <>
      <div className={`grid ${columnClasses[columns]} ${gapClasses[gap]} my-6`}>
        {media.map((item, index) => (
          <figure key={item.id} className="relative">
            <div
              className="relative aspect-square overflow-hidden rounded-lg cursor-zoom-in group"
              onClick={() => openLightbox(index)}
            >
              <Image
                src={item.public_url}
                alt={item.alt_text || ""}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
            {showCaptions && item.caption && (
              <figcaption className="mt-2 text-center text-sm text-muted-foreground">
                {item.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>

      <MediaLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        media={media}
        initialIndex={lightboxIndex}
      />
    </>
  );
}
