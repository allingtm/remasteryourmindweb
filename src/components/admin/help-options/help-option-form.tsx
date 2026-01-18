"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { HelpOptionWithPost, BlogPost } from "@/types";

interface HelpOptionFormProps {
  helpOption?: HelpOptionWithPost;
  posts: Pick<BlogPost, 'id' | 'slug' | 'title' | 'is_lead_article'>[];
}

export function HelpOptionForm({ helpOption, posts }: HelpOptionFormProps) {
  const router = useRouter();
  const isEditing = !!helpOption;

  const [formData, setFormData] = useState({
    text: helpOption?.text || "",
    description: helpOption?.description || "",
    post_id: helpOption?.post_id || "",
    display_order: helpOption?.display_order ?? 0,
    is_active: helpOption?.is_active ?? true,
    icon: helpOption?.icon || "",
    color: helpOption?.color || "",
  });

  const [isLoading, setIsLoading] = useState(false);

  // Filter to show lead articles first, then all others
  const sortedPosts = [...posts].sort((a, b) => {
    if (a.is_lead_article && !b.is_lead_article) return -1;
    if (!a.is_lead_article && b.is_lead_article) return 1;
    return a.title.localeCompare(b.title);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.text) {
      alert("Text is required");
      return;
    }

    if (!formData.post_id) {
      alert("Please select a linked article");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        text: formData.text,
        description: formData.description || null,
        post_id: formData.post_id,
        display_order: formData.display_order,
        is_active: formData.is_active,
        icon: formData.icon || null,
        color: formData.color || null,
      };

      const url = isEditing
        ? `/api/admin/help-options/${helpOption.id}`
        : "/api/admin/help-options";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save help option");
      }

      router.push("/admin/help-options");
      router.refresh();
    } catch (error) {
      console.error("Error saving help option:", error);
      alert(error instanceof Error ? error.message : "Failed to save help option");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!helpOption) return;

    if (!confirm("Are you sure you want to delete this help option? This cannot be undone.")) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/help-options/${helpOption.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete help option");
      }

      router.push("/admin/help-options");
      router.refresh();
    } catch (error) {
      console.error("Error deleting help option:", error);
      alert(error instanceof Error ? error.message : "Failed to delete help option");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedPost = posts.find(p => p.id === formData.post_id);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? "Edit Help Option" : "New Help Option"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing
              ? "Update this help option"
              : "Create a new help option for the homepage"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isEditing && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Main form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - main content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-card rounded-lg border border-border space-y-6">
            <div className="space-y-2">
              <Label htmlFor="text">Display Text *</Label>
              <Input
                id="text"
                value={formData.text}
                onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                placeholder="I want a website"
                required
              />
              <p className="text-xs text-muted-foreground">
                This is the text shown on the pill button
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="A brief description shown below the main text..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="post_id">Linked Article *</Label>
              <select
                id="post_id"
                value={formData.post_id}
                onChange={(e) => setFormData(prev => ({ ...prev, post_id: e.target.value }))}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                required
              >
                <option value="">Select an article...</option>
                <optgroup label="Lead Articles">
                  {sortedPosts.filter(p => p.is_lead_article).map(post => (
                    <option key={post.id} value={post.id}>
                      {post.title}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Regular Articles">
                  {sortedPosts.filter(p => !p.is_lead_article).map(post => (
                    <option key={post.id} value={post.id}>
                      {post.title}
                    </option>
                  ))}
                </optgroup>
              </select>
              {selectedPost && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Selected:</span>
                  <Link
                    href={`/${selectedPost.slug}`}
                    target="_blank"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    {selectedPost.title}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                  {!selectedPost.is_lead_article && (
                    <span className="text-xs text-amber-600 dark:text-amber-400">
                      (Not a lead article - will appear in listings)
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column - settings */}
        <div className="space-y-6">
          <div className="p-6 bg-card rounded-lg border border-border space-y-6">
            <h3 className="font-semibold">Settings</h3>

            <div className="space-y-2">
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                type="number"
                min={0}
                value={formData.display_order}
                onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
              />
              <p className="text-xs text-muted-foreground">
                Lower numbers appear first
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="is_active"
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="rounded border-input"
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                Active
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Only active options are shown on the homepage
            </p>
          </div>

          <div className="p-6 bg-card rounded-lg border border-border space-y-6">
            <h3 className="font-semibold">Styling (optional)</h3>

            <div className="space-y-2">
              <Label htmlFor="icon">Icon Name</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                placeholder="globe"
              />
              <p className="text-xs text-muted-foreground">
                Lucide icon name (e.g., globe, code, smartphone)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Pill Color</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  placeholder="#3b82f6"
                  className="flex-1"
                />
                <input
                  type="color"
                  value={formData.color || "#3b82f6"}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-10 h-10 rounded border border-input cursor-pointer"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Hex color for the pill border/accent
              </p>
            </div>

            {/* Preview */}
            {formData.text && (
              <div className="pt-4 border-t border-border">
                <Label className="mb-2 block">Preview</Label>
                <div
                  className="inline-flex px-6 py-3 rounded-full border-2 bg-background text-foreground font-medium"
                  style={{ borderColor: formData.color || "#e5e7eb" }}
                >
                  {formData.text}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
