"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Sparkles, Loader2, RefreshCw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFieldSuggestion } from "@/hooks/use-field-suggestion";
import type { FieldConfig, FieldSuggestion, SuggestableFieldName } from "@/lib/ai/types";

interface FieldSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  fieldConfig: FieldConfig;
  currentValue: string;
  blogTitle: string;
  blogContent: string;
  onSelect: (value: string) => void;
}

export function FieldSuggestionModal({
  isOpen,
  onClose,
  fieldConfig,
  currentValue,
  blogTitle,
  blogContent,
  onSelect,
}: FieldSuggestionModalProps) {
  const [userPrompt, setUserPrompt] = useState("");
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [hasInitiallyGenerated, setHasInitiallyGenerated] = useState(false);

  const { suggestions, isGenerating, error, generate, reset } = useFieldSuggestion();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      reset();
      setUserPrompt("");
      setSelectedSuggestion(null);
      setHasInitiallyGenerated(false);
    }
  }, [isOpen, reset]);

  // Auto-generate on open if content is sufficient
  useEffect(() => {
    if (isOpen && !hasInitiallyGenerated && blogContent.length >= 50) {
      setHasInitiallyGenerated(true);
      handleGenerate();
    }
  }, [isOpen, hasInitiallyGenerated, blogContent.length]);

  const handleGenerate = useCallback(async () => {
    await generate({
      fieldName: fieldConfig.name,
      fieldConfig,
      currentValue,
      blogTitle,
      blogContent,
      userPrompt: userPrompt.trim() || undefined,
    });
    setUserPrompt("");
  }, [generate, fieldConfig, currentValue, blogTitle, blogContent, userPrompt]);

  const handleSelect = () => {
    if (selectedSuggestion) {
      onSelect(selectedSuggestion);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  if (!isOpen) return null;

  const canGenerate = blogContent.length >= 50;
  const hasConstraints = fieldConfig.minLength || fieldConfig.maxLength;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-background rounded-lg shadow-xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-lg font-semibold">Suggest {fieldConfig.label}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {fieldConfig.description}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Character limit indicator */}
          {hasConstraints && (
            <div className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1 inline-block">
              {fieldConfig.minLength && fieldConfig.maxLength
                ? `${fieldConfig.minLength}-${fieldConfig.maxLength} characters`
                : fieldConfig.maxLength
                ? `Max ${fieldConfig.maxLength} characters`
                : `Min ${fieldConfig.minLength} characters`}
              {fieldConfig.isList && " (list field)"}
            </div>
          )}

          {/* Current value */}
          {currentValue && (
            <div className="bg-muted/50 rounded-md p-3">
              <div className="text-xs font-medium text-muted-foreground mb-1">
                Current value
              </div>
              <p className="text-sm whitespace-pre-wrap">{currentValue}</p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md p-3">
              {error}
            </div>
          )}

          {/* Not enough content warning */}
          {!canGenerate && (
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 text-sm rounded-md p-3">
              Please add at least 50 characters of content before generating suggestions.
            </div>
          )}

          {/* Suggestions list */}
          {suggestions.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">
                Suggestions ({suggestions.length})
              </div>
              {suggestions.map((suggestion, index) => (
                <SuggestionItem
                  key={`${suggestion.value.slice(0, 20)}-${index}`}
                  suggestion={suggestion}
                  isSelected={selectedSuggestion === suggestion.value}
                  onSelect={() => setSelectedSuggestion(suggestion.value)}
                  maxLength={fieldConfig.maxLength}
                />
              ))}
            </div>
          )}

          {/* Loading state */}
          {isGenerating && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">
                Generating suggestions...
              </span>
            </div>
          )}

          {/* Custom prompt input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {suggestions.length > 0 ? "Refine suggestions" : "Optional instructions"}
            </label>
            <textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isGenerating || !canGenerate}
              rows={2}
              className={cn(
                "w-full px-3 py-2 rounded-md border border-input bg-background text-sm",
                "focus:outline-none focus:ring-2 focus:ring-ring",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "resize-none"
              )}
              placeholder={
                suggestions.length > 0
                  ? "e.g., Make it more casual, focus on benefits, target enterprise..."
                  : "e.g., Focus on SEO, be more technical, emphasize security..."
              }
            />
            <p className="text-xs text-muted-foreground">
              Press Enter to generate{suggestions.length > 0 ? " more" : ""}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border bg-muted/30">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGenerate}
            disabled={isGenerating || !canGenerate}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isGenerating && "animate-spin")} />
            {suggestions.length > 0 ? "Suggest More" : "Generate"}
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSelect} disabled={!selectedSuggestion}>
              <Check className="h-4 w-4 mr-2" />
              Use Selected
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SuggestionItemProps {
  suggestion: FieldSuggestion;
  isSelected: boolean;
  onSelect: () => void;
  maxLength?: number;
}

function SuggestionItem({
  suggestion,
  isSelected,
  onSelect,
  maxLength,
}: SuggestionItemProps) {
  const charCount = suggestion.value.length;
  const isOverLimit = maxLength && charCount > maxLength;

  return (
    <label
      className={cn(
        "flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors",
        isSelected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-muted-foreground/50"
      )}
    >
      <input
        type="radio"
        name="suggestion"
        checked={isSelected}
        onChange={onSelect}
        className="mt-1"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm whitespace-pre-wrap">{suggestion.value}</p>
        <div className="flex items-center gap-3 mt-1.5">
          {maxLength && (
            <span
              className={cn(
                "text-xs",
                isOverLimit ? "text-destructive" : "text-muted-foreground"
              )}
            >
              {charCount}/{maxLength}
            </span>
          )}
          {suggestion.reasoning && (
            <span className="text-xs text-muted-foreground italic">
              {suggestion.reasoning}
            </span>
          )}
        </div>
      </div>
    </label>
  );
}
