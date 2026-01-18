"use client";

import { useState, useCallback } from "react";
import type { ImagePresetKey } from "@/lib/ai/image-presets";
import type { ImageStyleKey } from "@/lib/ai/image-styles";
import type { MediaItem } from "@/types";

export interface GeneratedImagePreview {
  imageUrl: string;
  revisedPrompt: string;
  width: number;
  height: number;
  dalleSize: string;
}

export interface GenerateParams {
  prompt: string;
  imageType: ImagePresetKey;
  style?: ImageStyleKey;
  customWidth?: number;
  customHeight?: number;
}

export interface SaveParams {
  imageUrl: string;
  prompt: string;
  revisedPrompt?: string;
  imageType: ImagePresetKey;
  width: number;
  height: number;
  altText?: string;
  caption?: string;
  tags?: string[];
}

export interface UseAIImageGenerationOptions {
  onGenerateSuccess?: (preview: GeneratedImagePreview) => void;
  onSaveSuccess?: (media: MediaItem) => void;
  onError?: (error: string) => void;
}

export function useAIImageGeneration(options?: UseAIImageGenerationOptions) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<GeneratedImagePreview | null>(null);

  const generate = useCallback(
    async (params: GenerateParams): Promise<GeneratedImagePreview | null> => {
      setIsGenerating(true);
      setError(null);

      try {
        const response = await fetch("/api/admin/media/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMessage = data.error || "Failed to generate image";
          setError(errorMessage);
          options?.onError?.(errorMessage);
          return null;
        }

        const generatedPreview: GeneratedImagePreview = {
          imageUrl: data.imageUrl,
          revisedPrompt: data.revisedPrompt,
          width: data.width,
          height: data.height,
          dalleSize: data.dalleSize,
        };

        setPreview(generatedPreview);
        options?.onGenerateSuccess?.(generatedPreview);
        return generatedPreview;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to generate image";
        setError(errorMessage);
        options?.onError?.(errorMessage);
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    [options]
  );

  const save = useCallback(
    async (params: SaveParams): Promise<MediaItem | null> => {
      setIsSaving(true);
      setError(null);

      try {
        const response = await fetch("/api/admin/media/generate/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMessage = data.error || "Failed to save image";
          setError(errorMessage);
          options?.onError?.(errorMessage);
          return null;
        }

        const media = data.media as MediaItem;
        setPreview(null); // Clear preview after successful save
        options?.onSaveSuccess?.(media);
        return media;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to save image";
        setError(errorMessage);
        options?.onError?.(errorMessage);
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setPreview(null);
    setError(null);
    setIsGenerating(false);
    setIsSaving(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    generate,
    save,
    reset,
    clearError,
    isGenerating,
    isSaving,
    isLoading: isGenerating || isSaving,
    error,
    preview,
  };
}
