"use client";

import { useState, useCallback } from "react";
import type { AICategoryContent } from "@/lib/ai/types";

interface UseCategoryAIGenerationOptions {
  onSuccess?: (data: AICategoryContent) => void;
  onError?: (error: string) => void;
}

interface GenerateParams {
  name: string;
  prompt?: string;
}

export function useCategoryAIGeneration(options: UseCategoryAIGenerationOptions = {}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<AICategoryContent | null>(null);

  const generate = useCallback(
    async (params: GenerateParams) => {
      setIsGenerating(true);
      setError(null);

      try {
        const response = await fetch("/api/admin/categories/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to generate content");
        }

        const data = result.data as AICategoryContent;
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
