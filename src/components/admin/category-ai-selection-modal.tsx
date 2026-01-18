"use client";

import { useState, useEffect } from "react";
import { X, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AICategoryContent } from "@/lib/ai/types";

interface CategoryAISelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  generatedContent: AICategoryContent;
  existingFields: {
    subtitle?: string;
    description?: string;
    meta_title?: string;
    meta_description?: string;
  };
  onApply: (selectedContent: Partial<AICategoryContent>) => void;
}

interface FieldSelection {
  subtitle: boolean;
  description: boolean;
  meta_title: boolean;
  meta_description: boolean;
}

export function CategoryAISelectionModal({
  isOpen,
  onClose,
  generatedContent,
  existingFields,
  onApply,
}: CategoryAISelectionModalProps) {
  const [selectedFields, setSelectedFields] = useState<FieldSelection>({
    subtitle: false,
    description: false,
    meta_title: false,
    meta_description: false,
  });

  // Initialize selections - pre-select fields that are currently empty
  useEffect(() => {
    if (isOpen) {
      setSelectedFields({
        subtitle: !existingFields.subtitle,
        description: !existingFields.description,
        meta_title: !existingFields.meta_title,
        meta_description: !existingFields.meta_description,
      });
    }
  }, [isOpen, existingFields]);

  const toggleField = (field: keyof FieldSelection) => {
    setSelectedFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const getSelectedCount = () => {
    return Object.values(selectedFields).filter(Boolean).length;
  };

  const handleApply = () => {
    const selected: Partial<AICategoryContent> = {};

    if (selectedFields.subtitle) {
      selected.subtitle = generatedContent.subtitle;
    }
    if (selectedFields.description) {
      selected.description = generatedContent.description;
    }
    if (selectedFields.meta_title) {
      selected.meta_title = generatedContent.meta_title;
    }
    if (selectedFields.meta_description) {
      selected.meta_description = generatedContent.meta_description;
    }

    onApply(selected);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-background rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">AI-Generated Content</h2>
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
          <p className="text-sm text-muted-foreground">
            Select which fields to apply to your category. Empty fields are pre-selected.
          </p>

          <FieldRow
            label="Subtitle"
            value={generatedContent.subtitle}
            charCount={`${generatedContent.subtitle.length}/100`}
            selected={selectedFields.subtitle}
            onToggle={() => toggleField("subtitle")}
            hasExisting={!!existingFields.subtitle}
          />

          <FieldRow
            label="Description"
            value={generatedContent.description}
            charCount={`${generatedContent.description.length} chars`}
            selected={selectedFields.description}
            onToggle={() => toggleField("description")}
            hasExisting={!!existingFields.description}
            multiline
          />

          <FieldRow
            label="Meta Title"
            value={generatedContent.meta_title}
            charCount={`${generatedContent.meta_title.length}/60`}
            selected={selectedFields.meta_title}
            onToggle={() => toggleField("meta_title")}
            hasExisting={!!existingFields.meta_title}
          />

          <FieldRow
            label="Meta Description"
            value={generatedContent.meta_description}
            charCount={`${generatedContent.meta_description.length}/160`}
            selected={selectedFields.meta_description}
            onToggle={() => toggleField("meta_description")}
            hasExisting={!!existingFields.meta_description}
            multiline
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border bg-muted/30">
          <p className="text-sm text-muted-foreground">
            {getSelectedCount()} field{getSelectedCount() !== 1 ? "s" : ""} selected
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleApply} disabled={getSelectedCount() === 0}>
              <Check className="h-4 w-4 mr-2" />
              Apply Selected
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FieldRowProps {
  label: string;
  value: string;
  charCount?: string;
  selected: boolean;
  onToggle: () => void;
  hasExisting?: boolean;
  multiline?: boolean;
}

function FieldRow({
  label,
  value,
  charCount,
  selected,
  onToggle,
  hasExisting,
  multiline,
}: FieldRowProps) {
  return (
    <label
      className={cn(
        "flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors",
        selected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-muted-foreground/50"
      )}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={onToggle}
        className="mt-1"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{label}</span>
          {charCount && (
            <span className="text-xs text-muted-foreground">({charCount})</span>
          )}
          {hasExisting && (
            <span className="text-xs text-amber-600">(will replace existing)</span>
          )}
        </div>
        <p
          className={cn(
            "text-sm text-muted-foreground mt-1",
            multiline ? "whitespace-pre-wrap" : "truncate"
          )}
        >
          {value}
        </p>
      </div>
    </label>
  );
}
