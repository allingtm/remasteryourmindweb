"use client";

import { useState, useCallback, useRef } from "react";
import type {
  FieldSuggestionRequest,
  FieldSuggestionResponse,
  SuggestionHistoryItem,
  FieldConfig,
  FieldSuggestion,
  SuggestableFieldName,
} from "@/lib/ai/types";

interface UseFieldSuggestionOptions {
  onSuccess?: (suggestions: FieldSuggestion[]) => void;
  onError?: (error: string) => void;
}

interface UseFieldSuggestionState {
  suggestions: FieldSuggestion[];
  isGenerating: boolean;
  error: string | null;
  history: SuggestionHistoryItem[];
}

interface GenerateParams {
  fieldName: SuggestableFieldName;
  fieldConfig: FieldConfig;
  currentValue: string;
  blogTitle: string;
  blogContent: string;
  userPrompt?: string;
}

export function useFieldSuggestion(options: UseFieldSuggestionOptions = {}) {
  const [state, setState] = useState<UseFieldSuggestionState>({
    suggestions: [],
    isGenerating: false,
    error: null,
    history: [],
  });

  // Track all suggestion values to help avoid duplicates
  const allSuggestionsRef = useRef<Set<string>>(new Set());

  const generate = useCallback(
    async (params: GenerateParams) => {
      setState((prev) => ({
        ...prev,
        isGenerating: true,
        error: null,
      }));

      try {
        const request: FieldSuggestionRequest = {
          fieldName: params.fieldName,
          fieldConfig: params.fieldConfig,
          currentValue: params.currentValue,
          blogTitle: params.blogTitle,
          blogContent: params.blogContent,
          userPrompt: params.userPrompt,
          history: state.history,
          suggestionCount: params.fieldConfig.suggestionCount,
        };

        const response = await fetch("/api/admin/posts/suggest-field", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to generate suggestions");
        }

        const data = result.data as FieldSuggestionResponse;

        // Filter out any duplicates from previous suggestions
        const newSuggestions = data.suggestions.filter(
          (s) => !allSuggestionsRef.current.has(s.value)
        );

        // Add new suggestions to tracking set
        newSuggestions.forEach((s) => allSuggestionsRef.current.add(s.value));

        // Build new history items
        const newHistoryItems: SuggestionHistoryItem[] = [];

        if (params.userPrompt) {
          newHistoryItems.push({
            role: "user",
            content: params.userPrompt,
            timestamp: Date.now(),
          });
        }

        // Record the suggestions in history so future requests avoid them
        newHistoryItems.push({
          role: "assistant",
          content: newSuggestions.map((s) => s.value).join("\n---\n"),
          timestamp: Date.now(),
        });

        setState((prev) => ({
          ...prev,
          suggestions: [...prev.suggestions, ...newSuggestions],
          history: [...prev.history, ...newHistoryItems],
          isGenerating: false,
        }));

        options.onSuccess?.(newSuggestions);
        return newSuggestions;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to generate suggestions";
        setState((prev) => ({
          ...prev,
          error: message,
          isGenerating: false,
        }));
        options.onError?.(message);
        return null;
      }
    },
    [state.history, options]
  );

  const reset = useCallback(() => {
    setState({
      suggestions: [],
      isGenerating: false,
      error: null,
      history: [],
    });
    allSuggestionsRef.current.clear();
  }, []);

  const clearSuggestions = useCallback(() => {
    setState((prev) => ({
      ...prev,
      suggestions: [],
    }));
  }, []);

  const removeSuggestion = useCallback((value: string) => {
    setState((prev) => ({
      ...prev,
      suggestions: prev.suggestions.filter((s) => s.value !== value),
    }));
  }, []);

  return {
    suggestions: state.suggestions,
    isGenerating: state.isGenerating,
    error: state.error,
    history: state.history,
    generate,
    reset,
    clearSuggestions,
    removeSuggestion,
  };
}
