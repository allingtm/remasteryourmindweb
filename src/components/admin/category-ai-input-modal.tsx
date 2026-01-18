"use client";

import { useState } from "react";
import { X, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CategoryAIInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (name: string, prompt?: string) => void;
  isGenerating: boolean;
  initialName?: string;
}

export function CategoryAIInputModal({
  isOpen,
  onClose,
  onGenerate,
  isGenerating,
  initialName = "",
}: CategoryAIInputModalProps) {
  const [name, setName] = useState(initialName);
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onGenerate(name.trim(), prompt.trim() || undefined);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-background rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Generate with AI</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label htmlFor="ai-name" className="block text-sm font-medium mb-1.5">
              Category Name <span className="text-destructive">*</span>
            </label>
            <input
              id="ai-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isGenerating}
              required
              className={cn(
                "w-full px-3 py-2 rounded-md border border-input bg-background",
                "focus:outline-none focus:ring-2 focus:ring-ring",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              placeholder="e.g., Web Development"
            />
            <p className="text-xs text-muted-foreground mt-1">
              The category name to generate content for
            </p>
          </div>

          <div>
            <label htmlFor="ai-prompt" className="block text-sm font-medium mb-1.5">
              Additional Context <span className="text-muted-foreground">(optional)</span>
            </label>
            <textarea
              id="ai-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
              rows={3}
              className={cn(
                "w-full px-3 py-2 rounded-md border border-input bg-background",
                "focus:outline-none focus:ring-2 focus:ring-ring",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              placeholder="e.g., Focus on modern frameworks like React and Next.js. Target intermediate developers."
            />
            <p className="text-xs text-muted-foreground mt-1">
              Provide additional guidance for the AI
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isGenerating || !name.trim()}>
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
