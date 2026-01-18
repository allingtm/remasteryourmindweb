"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Play, Pause, Volume2, VolumeX } from "lucide-react";
import type { MediaItem } from "@/types";

interface MediaAudioProps {
  id: string;
  showWaveform?: boolean;
  className?: string;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function MediaAudio({
  id,
  className = "",
}: MediaAudioProps) {
  const [media, setMedia] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    async function fetchMedia() {
      try {
        const response = await fetch(`/api/admin/media/${id}`);
        if (!response.ok) {
          throw new Error("Audio not found");
        }
        const data = await response.json();
        setMedia(data.media);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load audio");
      } finally {
        setLoading(false);
      }
    }

    fetchMedia();
  }, [id]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-20 bg-muted rounded-lg my-6">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !media) {
    return (
      <div className="flex items-center justify-center h-20 bg-muted rounded-lg text-muted-foreground text-sm my-6">
        {error || "Audio not found"}
      </div>
    );
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <figure className={`my-6 ${className}`}>
      <div className="bg-muted rounded-lg p-4">
        <audio
          ref={audioRef}
          src={media.public_url}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
        />

        <div className="flex items-center gap-4">
          {/* Play/Pause button */}
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors flex-shrink-0"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </button>

          {/* Progress bar */}
          <div className="flex-1 min-w-0">
            <div className="relative h-2 bg-background rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-primary rounded-full"
                style={{ width: `${progress}%` }}
              />
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Mute button */}
          <button
            onClick={toggleMute}
            className="w-8 h-8 rounded-full hover:bg-background flex items-center justify-center transition-colors flex-shrink-0"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Volume2 className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </div>

        {/* Title */}
        <p className="mt-3 text-sm font-medium truncate">
          {media.original_filename}
        </p>
      </div>

      {media.caption && (
        <figcaption className="mt-2 text-center text-sm text-muted-foreground">
          {media.caption}
        </figcaption>
      )}
    </figure>
  );
}
