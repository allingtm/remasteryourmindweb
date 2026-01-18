"use client";

import { useState, useCallback } from "react";
import type { AIGeneratedContent } from "@/lib/ai/types";

interface UseAIGenerationOptions {
  onSuccess?: (data: AIGeneratedContent) => void;
  onError?: (error: string) => void;
}

interface GenerateParams {
  title: string;
  content: string;
  availableTags: Array<{ id: string; name: string }>;
  generateImage?: boolean;
  existingExcerpt?: string;
}

export function useAIGeneration(options: UseAIGenerationOptions = {}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<AIGeneratedContent | null>(null);

  const generate = useCallback(
    async (params: GenerateParams) => {
      setIsGenerating(true);
      setError(null);

      try {
        const response = await fetch("/api/admin/posts/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to generate content");
        }

        const data = result.data as AIGeneratedContent;
        setGeneratedContent(data);
        options.onSuccess?.(data);
        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to generate content";
        setError(message);
        options.onError?.(message);
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setGeneratedContent(null);
    setError(null);
  }, []);

  return {
    generate,
    isGenerating,
    error,
    generatedContent,
    reset,
  };
}
