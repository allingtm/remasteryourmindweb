"use client";

import { useState, useEffect } from "react";
import { X, Check, Sparkles, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AIGeneratedContent } from "@/lib/ai/types";

interface AIGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  generatedContent: AIGeneratedContent;
  existingFields: {
    meta_title?: string;
    meta_description?: string;
    primary_keyword?: string;
    secondary_keywords?: string;
    subtitle?: string;
    excerpt?: string;
    ai_summary?: string;
    key_takeaways?: string;
    questions_answered?: string;
    og_image?: string;
  };
  availableTags: Array<{ id: string; name: string }>;
  onApply: (selectedContent: SelectedContent) => void;
}

export interface SelectedContent {
  seo?: {
    meta_title?: string;
    meta_description?: string;
    primary_keyword?: string;
    secondary_keywords?: string[];
  };
  content?: {
    subtitle?: string;
    excerpt?: string;
    title?: string;
  };
  ai_optimization?: {
    ai_summary?: string;
    key_takeaways?: string[];
    questions_answered?: string[];
    definitive_statements?: string[];
  };
  categorization?: {
    suggested_tag_ids?: string[];
  };
  faqs?: Array<{ question: string; answer: string }>;
  entities?: Array<{ name: string; type: string }>;
  og_image?: string;
}

interface FieldSelection {
  [key: string]: boolean;
}

export function AIGenerationModal({
  isOpen,
  onClose,
  generatedContent,
  existingFields,
  availableTags,
  onApply,
}: AIGenerationModalProps) {
  const [selectedFields, setSelectedFields] = useState<FieldSelection>({});
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);

  // Initialize selections - pre-select fields that are currently empty
  useEffect(() => {
    if (isOpen) {
      const initialSelections: FieldSelection = {};

      // SEO fields
      if (!existingFields.meta_title) initialSelections["seo.meta_title"] = true;
      if (!existingFields.meta_description) initialSelections["seo.meta_description"] = true;
      if (!existingFields.primary_keyword) initialSelections["seo.primary_keyword"] = true;
      if (!existingFields.secondary_keywords) initialSelections["seo.secondary_keywords"] = true;

      // Content fields
      if (!existingFields.subtitle) initialSelections["content.subtitle"] = true;
      if (!existingFields.excerpt) initialSelections["content.excerpt"] = true;

      // AI optimization fields
      if (!existingFields.ai_summary) initialSelections["ai.ai_summary"] = true;
      if (!existingFields.key_takeaways) initialSelections["ai.key_takeaways"] = true;
      if (!existingFields.questions_answered) initialSelections["ai.questions_answered"] = true;
      initialSelections["ai.definitive_statements"] = true; // New field, always select

      // Categorization
      initialSelections["categorization.tags"] = true;

      // FAQs
      initialSelections["faqs"] = true;

      // Entities
      initialSelections["entities"] = true;

      // OG Image
      if (!existingFields.og_image && generatedContent.og_image) {
        initialSelections["og_image"] = true;
      }

      setSelectedFields(initialSelections);
      setSelectedTitle(null);
    }
  }, [isOpen, existingFields, generatedContent.og_image]);

  const toggleField = (fieldKey: string) => {
    setSelectedFields((prev) => ({
      ...prev,
      [fieldKey]: !prev[fieldKey],
    }));
  };

  const getSelectedCount = () => {
    return Object.values(selectedFields).filter(Boolean).length + (selectedTitle ? 1 : 0);
  };

  const handleApply = () => {
    const selected: SelectedContent = {};

    // SEO
    if (
      selectedFields["seo.meta_title"] ||
      selectedFields["seo.meta_description"] ||
      selectedFields["seo.primary_keyword"] ||
      selectedFields["seo.secondary_keywords"]
    ) {
      selected.seo = {};
      if (selectedFields["seo.meta_title"]) {
        selected.seo.meta_title = generatedContent.seo.meta_title;
      }
      if (selectedFields["seo.meta_description"]) {
        selected.seo.meta_description = generatedContent.seo.meta_description;
      }
      if (selectedFields["seo.primary_keyword"]) {
        selected.seo.primary_keyword = generatedContent.seo.primary_keyword;
      }
      if (selectedFields["seo.secondary_keywords"]) {
        selected.seo.secondary_keywords = generatedContent.seo.secondary_keywords;
      }
    }

    // Content
    if (selectedFields["content.subtitle"] || selectedFields["content.excerpt"] || selectedTitle) {
      selected.content = {};
      if (selectedFields["content.subtitle"]) {
        selected.content.subtitle = generatedContent.content.subtitle;
      }
      if (selectedFields["content.excerpt"]) {
        selected.content.excerpt = generatedContent.content.excerpt;
      }
      if (selectedTitle) {
        selected.content.title = selectedTitle;
      }
    }

    // AI Optimization
    if (
      selectedFields["ai.ai_summary"] ||
      selectedFields["ai.key_takeaways"] ||
      selectedFields["ai.questions_answered"] ||
      selectedFields["ai.definitive_statements"]
    ) {
      selected.ai_optimization = {};
      if (selectedFields["ai.ai_summary"]) {
        selected.ai_optimization.ai_summary = generatedContent.ai_optimization.ai_summary;
      }
      if (selectedFields["ai.key_takeaways"]) {
        selected.ai_optimization.key_takeaways = generatedContent.ai_optimization.key_takeaways;
      }
      if (selectedFields["ai.questions_answered"]) {
        selected.ai_optimization.questions_answered =
          generatedContent.ai_optimization.questions_answered;
      }
      if (selectedFields["ai.definitive_statements"]) {
        selected.ai_optimization.definitive_statements =
          generatedContent.ai_optimization.definitive_statements;
      }
    }

    // Categorization
    if (selectedFields["categorization.tags"]) {
      selected.categorization = {
        suggested_tag_ids: generatedContent.categorization.suggested_tag_ids,
      };
    }

    // FAQs
    if (selectedFields["faqs"]) {
      selected.faqs = generatedContent.faqs;
    }

    // Entities
    if (selectedFields["entities"]) {
      selected.entities = generatedContent.entities;
    }

    // OG Image
    if (selectedFields["og_image"] && generatedContent.og_image) {
      selected.og_image = generatedContent.og_image.url;
    }

    onApply(selected);
    onClose();
  };

  if (!isOpen) return null;

  const tagNames = generatedContent.categorization.suggested_tag_ids
    .map((id) => availableTags.find((t) => t.id === id)?.name)
    .filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-background rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col mx-4">
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
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* SEO Section */}
          <Section title="SEO">
            <FieldRow
              label="Meta Title"
              value={generatedContent.seo.meta_title}
              charCount={`${generatedContent.seo.meta_title.length}/60`}
              selected={selectedFields["seo.meta_title"]}
              onToggle={() => toggleField("seo.meta_title")}
              hasExisting={!!existingFields.meta_title}
            />
            <FieldRow
              label="Meta Description"
              value={generatedContent.seo.meta_description}
              charCount={`${generatedContent.seo.meta_description.length}/160`}
              selected={selectedFields["seo.meta_description"]}
              onToggle={() => toggleField("seo.meta_description")}
              hasExisting={!!existingFields.meta_description}
            />
            <FieldRow
              label="Primary Keyword"
              value={generatedContent.seo.primary_keyword}
              selected={selectedFields["seo.primary_keyword"]}
              onToggle={() => toggleField("seo.primary_keyword")}
              hasExisting={!!existingFields.primary_keyword}
            />
            <FieldRow
              label="Secondary Keywords"
              value={generatedContent.seo.secondary_keywords.join(", ")}
              selected={selectedFields["seo.secondary_keywords"]}
              onToggle={() => toggleField("seo.secondary_keywords")}
              hasExisting={!!existingFields.secondary_keywords}
            />
          </Section>

          {/* Content Section */}
          <Section title="Content">
            <FieldRow
              label="Subtitle"
              value={generatedContent.content.subtitle}
              charCount={`${generatedContent.content.subtitle?.length || 0}/100`}
              selected={selectedFields["content.subtitle"]}
              onToggle={() => toggleField("content.subtitle")}
              hasExisting={!!existingFields.subtitle}
            />
            <FieldRow
              label="Excerpt"
              value={generatedContent.content.excerpt}
              charCount={`${generatedContent.content.excerpt?.length || 0}/160`}
              selected={selectedFields["content.excerpt"]}
              onToggle={() => toggleField("content.excerpt")}
              hasExisting={!!existingFields.excerpt}
            />
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                Alternative Titles (optional)
              </div>
              <div className="space-y-2">
                {generatedContent.content.suggested_titles.map((title, i) => (
                  <label
                    key={i}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors",
                      selectedTitle === title
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/50"
                    )}
                  >
                    <input
                      type="radio"
                      name="suggested_title"
                      checked={selectedTitle === title}
                      onChange={() => setSelectedTitle(selectedTitle === title ? null : title)}
                      className="mt-0.5"
                    />
                    <span className="text-sm">{title}</span>
                  </label>
                ))}
              </div>
            </div>
          </Section>

          {/* AI Optimization Section */}
          <Section title="AI Optimization">
            <FieldRow
              label="AI Summary"
              value={generatedContent.ai_optimization.ai_summary}
              selected={selectedFields["ai.ai_summary"]}
              onToggle={() => toggleField("ai.ai_summary")}
              hasExisting={!!existingFields.ai_summary}
            />
            <FieldRow
              label="Key Takeaways"
              value={generatedContent.ai_optimization.key_takeaways.map((t) => `• ${t}`).join("\n")}
              selected={selectedFields["ai.key_takeaways"]}
              onToggle={() => toggleField("ai.key_takeaways")}
              hasExisting={!!existingFields.key_takeaways}
              multiline
            />
            <FieldRow
              label="Questions Answered"
              value={generatedContent.ai_optimization.questions_answered.join("\n")}
              selected={selectedFields["ai.questions_answered"]}
              onToggle={() => toggleField("ai.questions_answered")}
              hasExisting={!!existingFields.questions_answered}
              multiline
            />
            <FieldRow
              label="Definitive Statements"
              value={generatedContent.ai_optimization.definitive_statements
                .map((s) => `• ${s}`)
                .join("\n")}
              selected={selectedFields["ai.definitive_statements"]}
              onToggle={() => toggleField("ai.definitive_statements")}
              multiline
            />
          </Section>

          {/* Categorization Section */}
          {tagNames.length > 0 && (
            <Section title="Tags">
              <FieldRow
                label="Suggested Tags"
                value={tagNames.join(", ")}
                selected={selectedFields["categorization.tags"]}
                onToggle={() => toggleField("categorization.tags")}
              />
            </Section>
          )}

          {/* FAQs Section */}
          {generatedContent.faqs.length > 0 && (
            <Section title={`FAQs (${generatedContent.faqs.length})`}>
              <label
                className={cn(
                  "flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors",
                  selectedFields["faqs"]
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/50"
                )}
              >
                <input
                  type="checkbox"
                  checked={selectedFields["faqs"] || false}
                  onChange={() => toggleField("faqs")}
                  className="mt-1"
                />
                <div className="flex-1 space-y-3">
                  {generatedContent.faqs.map((faq, i) => (
                    <div key={i} className="text-sm">
                      <div className="font-medium">{faq.question}</div>
                      <div className="text-muted-foreground mt-1">{faq.answer}</div>
                    </div>
                  ))}
                </div>
              </label>
            </Section>
          )}

          {/* Entities Section */}
          {generatedContent.entities.length > 0 && (
            <Section title="Entities">
              <FieldRow
                label="Extracted Entities"
                value={generatedContent.entities.map((e) => `${e.name} (${e.type})`).join(", ")}
                selected={selectedFields["entities"]}
                onToggle={() => toggleField("entities")}
              />
            </Section>
          )}

          {/* OG Image Section */}
          {generatedContent.og_image && (
            <Section title="OG Image">
              <label
                className={cn(
                  "flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors",
                  selectedFields["og_image"]
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/50"
                )}
              >
                <input
                  type="checkbox"
                  checked={selectedFields["og_image"] || false}
                  onChange={() => toggleField("og_image")}
                  className="mt-1"
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <ImageIcon className="h-4 w-4" />
                    Generated Image
                    {existingFields.og_image && (
                      <span className="text-xs text-amber-600">(will replace existing)</span>
                    )}
                  </div>
                  <img
                    src={generatedContent.og_image.url}
                    alt="Generated OG Image"
                    className="rounded-md max-h-48 object-cover"
                  />
                  <p className="text-xs text-muted-foreground">
                    Prompt: {generatedContent.og_image.prompt}
                  </p>
                </div>
              </label>
            </Section>
          )}
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <div className="space-y-2">{children}</div>
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
