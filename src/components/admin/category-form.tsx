"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BlogCategory } from "@/types";
import type { AICategoryContent } from "@/lib/ai/types";
import { useCategoryAIGeneration } from "@/hooks/use-category-ai-generation";
import { CategoryAIInputModal } from "./category-ai-input-modal";
import { CategoryAISelectionModal } from "./category-ai-selection-modal";

interface CategoryFormProps {
  category?: BlogCategory;
}

interface FormData {
  name: string;
  slug: string;
  description: string;
  subtitle: string;
  meta_title: string;
  meta_description: string;
  color: string;
  display_order: number;
  show_in_nav: boolean;
  show_on_homepage: boolean;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter();
  const isEditing = !!category;

  const [formData, setFormData] = useState<FormData>({
    name: category?.name || "",
    slug: category?.slug || "",
    description: category?.description || "",
    subtitle: category?.subtitle || "",
    meta_title: category?.meta_title || "",
    meta_description: category?.meta_description || "",
    color: category?.color || "#3b82f6",
    display_order: category?.display_order || 0,
    show_in_nav: category?.show_in_nav ?? true,
    show_on_homepage: category?.show_on_homepage ?? true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [slugEdited, setSlugEdited] = useState(isEditing);

  // AI generation state
  const [showInputModal, setShowInputModal] = useState(false);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const { generate, isGenerating, error: aiError, generatedContent, reset: resetAI } = useCategoryAIGeneration({
    onSuccess: () => {
      setShowInputModal(false);
      setShowSelectionModal(true);
    },
    onError: (error) => {
      setError(error);
    },
  });

  // Auto-generate slug from name
  useEffect(() => {
    if (!slugEdited && formData.name) {
      setFormData((prev) => ({ ...prev, slug: generateSlug(prev.name) }));
    }
  }, [formData.name, slugEdited]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === "slug") {
      setSlugEdited(true);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? parseInt(value, 10) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const url = isEditing
        ? `/api/admin/categories/${category.id}`
        : "/api/admin/categories";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save category");
      }

      router.push("/admin/categories");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save category");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAIGenerate = (name: string, prompt?: string) => {
    generate({ name, prompt });
  };

  const handleApplyAIContent = (selectedContent: Partial<AICategoryContent>) => {
    setFormData((prev) => ({
      ...prev,
      ...(selectedContent.subtitle && { subtitle: selectedContent.subtitle }),
      ...(selectedContent.description && { description: selectedContent.description }),
      ...(selectedContent.meta_title && { meta_title: selectedContent.meta_title }),
      ...(selectedContent.meta_description && { meta_description: selectedContent.meta_description }),
    }));
    resetAI();
  };

  const handleCloseSelectionModal = () => {
    setShowSelectionModal(false);
    resetAI();
  };

  const handleDelete = async () => {
    if (!category || !confirm("Are you sure you want to delete this category?")) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete category");
      }

      router.push("/admin/categories");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete category");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          {isEditing ? "Edit Category" : "New Category"}
        </h1>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowInputModal(true)}
            disabled={isLoading || isGenerating}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate with AI
          </Button>
          {isEditing && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md p-3 mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-background rounded-lg border border-border p-4 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1.5">
              Name <span className="text-destructive">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              required
              className={cn(
                "w-full px-3 py-2 rounded-md border border-input bg-background",
                "focus:outline-none focus:ring-2 focus:ring-ring"
              )}
              placeholder="Category name"
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium mb-1.5">
              Slug <span className="text-destructive">*</span>
            </label>
            <input
              id="slug"
              name="slug"
              type="text"
              value={formData.slug}
              onChange={handleInputChange}
              required
              className={cn(
                "w-full px-3 py-2 rounded-md border border-input bg-background",
                "focus:outline-none focus:ring-2 focus:ring-ring"
              )}
              placeholder="category-slug"
            />
          </div>

          <div>
            <label htmlFor="subtitle" className="block text-sm font-medium mb-1.5">
              Subtitle
            </label>
            <input
              id="subtitle"
              name="subtitle"
              type="text"
              value={formData.subtitle}
              onChange={handleInputChange}
              className={cn(
                "w-full px-3 py-2 rounded-md border border-input bg-background",
                "focus:outline-none focus:ring-2 focus:ring-ring"
              )}
              placeholder="Short tagline for category page"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1.5">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className={cn(
                "w-full px-3 py-2 rounded-md border border-input bg-background",
                "focus:outline-none focus:ring-2 focus:ring-ring"
              )}
              placeholder="Category description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="color" className="block text-sm font-medium mb-1.5">
                Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="color"
                  name="color"
                  type="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="w-10 h-10 rounded border border-input cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                  className={cn(
                    "flex-1 px-3 py-2 rounded-md border border-input bg-background",
                    "focus:outline-none focus:ring-2 focus:ring-ring"
                  )}
                  placeholder="#3b82f6"
                />
              </div>
            </div>

            <div>
              <label htmlFor="display_order" className="block text-sm font-medium mb-1.5">
                Display Order
              </label>
              <input
                id="display_order"
                name="display_order"
                type="number"
                min={0}
                value={formData.display_order}
                onChange={handleInputChange}
                className={cn(
                  "w-full px-3 py-2 rounded-md border border-input bg-background",
                  "focus:outline-none focus:ring-2 focus:ring-ring"
                )}
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <input
                id="show_in_nav"
                name="show_in_nav"
                type="checkbox"
                checked={formData.show_in_nav}
                onChange={handleInputChange}
                className="rounded border-input"
              />
              <label htmlFor="show_in_nav" className="text-sm">
                Show in navigation
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="show_on_homepage"
                name="show_on_homepage"
                type="checkbox"
                checked={formData.show_on_homepage}
                onChange={handleInputChange}
                className="rounded border-input"
              />
              <label htmlFor="show_on_homepage" className="text-sm">
                Show on homepage
              </label>
            </div>
          </div>
        </div>

        <div className="bg-background rounded-lg border border-border p-4 space-y-4">
          <h3 className="font-medium">SEO Settings</h3>

          <div>
            <label htmlFor="meta_title" className="block text-sm font-medium mb-1.5">
              Meta Title
            </label>
            <input
              id="meta_title"
              name="meta_title"
              type="text"
              value={formData.meta_title}
              onChange={handleInputChange}
              maxLength={60}
              className={cn(
                "w-full px-3 py-2 rounded-md border border-input bg-background",
                "focus:outline-none focus:ring-2 focus:ring-ring"
              )}
              placeholder="SEO title (max 60 chars)"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData.meta_title.length}/60 characters
            </p>
          </div>

          <div>
            <label htmlFor="meta_description" className="block text-sm font-medium mb-1.5">
              Meta Description
            </label>
            <textarea
              id="meta_description"
              name="meta_description"
              value={formData.meta_description}
              onChange={handleInputChange}
              maxLength={160}
              rows={2}
              className={cn(
                "w-full px-3 py-2 rounded-md border border-input bg-background",
                "focus:outline-none focus:ring-2 focus:ring-ring"
              )}
              placeholder="SEO description (max 160 chars)"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData.meta_description.length}/160 characters
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button type="submit" disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save Category"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/categories")}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </form>

      {/* AI Input Modal */}
      <CategoryAIInputModal
        isOpen={showInputModal}
        onClose={() => setShowInputModal(false)}
        onGenerate={handleAIGenerate}
        isGenerating={isGenerating}
        initialName={formData.name}
      />

      {/* AI Selection Modal */}
      {generatedContent && (
        <CategoryAISelectionModal
          isOpen={showSelectionModal}
          onClose={handleCloseSelectionModal}
          generatedContent={generatedContent}
          existingFields={{
            subtitle: formData.subtitle,
            description: formData.description,
            meta_title: formData.meta_title,
            meta_description: formData.meta_description,
          }}
          onApply={handleApplyAIContent}
        />
      )}
    </div>
  );
}
