"use client";

import { useState, useEffect } from "react";
import { Loader2, Play } from "lucide-react";
import type { MediaItem } from "@/types";

interface MediaVideoProps {
  id: string;
  autoplay?: boolean;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
  className?: string;
}

export function MediaVideo({
  id,
  autoplay = false,
  controls = true,
  loop = false,
  muted = false,
  className = "",
}: MediaVideoProps) {
  const [media, setMedia] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(autoplay);

  useEffect(() => {
    async function fetchMedia() {
      try {
        const response = await fetch(`/api/admin/media/${id}`);
        if (!response.ok) {
          throw new Error("Video not found");
        }
        const data = await response.json();
        setMedia(data.media);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load video");
      } finally {
        setLoading(false);
      }
    }

    fetchMedia();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center aspect-video bg-muted rounded-lg my-6">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !media) {
    return (
      <div className="flex items-center justify-center aspect-video bg-muted rounded-lg text-muted-foreground text-sm my-6">
        {error || "Video not found"}
      </div>
    );
  }

  return (
    <figure className={`my-6 ${className}`}>
      <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
        <video
          src={media.public_url}
          autoPlay={autoplay}
          controls={controls}
          loop={loop}
          muted={muted}
          playsInline
          className="w-full h-full object-contain"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        {!isPlaying && !controls && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <button
              className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
              onClick={(e) => {
                const video = e.currentTarget.previousElementSibling as HTMLVideoElement;
                video.play();
              }}
            >
              <Play className="h-8 w-8 text-black ml-1" />
            </button>
          </div>
        )}
      </div>
      {media.caption && (
        <figcaption className="mt-2 text-center text-sm text-muted-foreground">
          {media.caption}
        </figcaption>
      )}
    </figure>
  );
}
