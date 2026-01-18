"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { MediaLightbox } from "./media-lightbox";
import type { MediaItem } from "@/types";

interface MediaImageProps {
  id: string;
  className?: string;
  sizes?: string;
  showCaption?: boolean;
}

export function MediaImage({
  id,
  className = "",
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px",
  showCaption = true,
}: MediaImageProps) {
  const [media, setMedia] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    async function fetchMedia() {
      try {
        const response = await fetch(`/api/admin/media/${id}`);
        if (!response.ok) {
          throw new Error("Media not found");
        }
        const data = await response.json();
        setMedia(data.media);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load media");
      } finally {
        setLoading(false);
      }
    }

    fetchMedia();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 bg-muted rounded-lg">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !media) {
    return (
      <div className="flex items-center justify-center h-48 bg-muted rounded-lg text-muted-foreground text-sm">
        {error || "Media not found"}
      </div>
    );
  }

  return (
    <>
      <figure className={`my-6 ${className}`}>
        <div
          className="relative overflow-hidden rounded-lg cursor-zoom-in"
          onClick={() => setLightboxOpen(true)}
        >
          <Image
            src={media.public_url}
            alt={media.alt_text || ""}
            width={media.width || 1200}
            height={media.height || 800}
            sizes={sizes}
            className="w-full h-auto"
          />
        </div>
        {showCaption && media.caption && (
          <figcaption className="mt-2 text-center text-sm text-muted-foreground">
            {media.caption}
          </figcaption>
        )}
      </figure>

      <MediaLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        media={[media]}
        initialIndex={0}
      />
    </>
  );
}
