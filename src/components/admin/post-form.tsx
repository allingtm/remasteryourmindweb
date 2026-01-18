"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Save, Eye, Trash2, ChevronDown, ChevronUp, Plus, X, Upload, FileText, ClipboardPaste, Image, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarkdownEditor } from "./markdown-editor";
import { StatusBadge } from "./status-badge";
import { AIGenerateButton } from "./ai-generate-button";
import { AIGenerationModal, type SelectedContent } from "./ai-generation-modal";
import { SuggestableField } from "./suggestable-field";
import { useAIGeneration } from "@/hooks/use-ai-generation";
import { MediaPickerModal } from "./media-picker-modal";
import { AIImageModal } from "./ai-image-modal";
import { CalendlySettings } from "./calendly-settings";
import { cn } from "@/lib/utils";
import type { BlogPostWithRelations, BlogCategory, BlogTag, BlogFaq, MediaItem, Survey } from "@/types";
import type { AIGeneratedContent } from "@/lib/ai/types";

interface PostFormProps {
  post?: BlogPostWithRelations;
  categories: BlogCategory[];
  tags: BlogTag[];
  authorId: string;
}

interface FormData {
  title: string;
  slug: string;
  subtitle: string;
  excerpt: string;
  content: string;
  featured_image: string;
  featured_image_alt: string;
  og_image: string;
  category_id: string;
  status: "draft" | "scheduled" | "published" | "archived";
  scheduled_for: string;
  is_featured: boolean;
  featured_order: number;
  meta_title: string;
  meta_description: string;
  primary_keyword: string;
  secondary_keywords: string;
  ai_summary: string;
  key_takeaways: string;
  questions_answered: string;
  definitive_statements: string;
}

interface FaqItem {
  id?: string;
  question: string;
  answer: string;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function PostForm({ post, categories, tags, authorId }: PostFormProps) {
  const router = useRouter();
  const isEditing = !!post;

  const [formData, setFormData] = useState<FormData>({
    title: post?.title || "",
    slug: post?.slug || "",
    subtitle: post?.subtitle || "",
    excerpt: post?.excerpt || "",
    content: post?.content || "",
    featured_image: post?.featured_image || "",
    featured_image_alt: post?.featured_image_alt || "",
    og_image: post?.og_image || "",
    category_id: post?.category_id || categories[0]?.id || "",
    status: post?.status || "draft",
    scheduled_for: post?.scheduled_for?.slice(0, 16) || "",
    is_featured: post?.is_featured || false,
    featured_order: post?.featured_order || 1,
    meta_title: post?.meta_title || "",
    meta_description: post?.meta_description || "",
    primary_keyword: post?.primary_keyword || "",
    secondary_keywords: post?.secondary_keywords?.join(", ") || "",
    ai_summary: post?.ai_summary || "",
    key_takeaways: post?.key_takeaways?.join("\n") || "",
    questions_answered: post?.questions_answered?.join("\n") || "",
    definitive_statements: post?.definitive_statements?.join("\n") || "",
  });

  const [selectedTags, setSelectedTags] = useState<string[]>(
    post?.tags?.map((t) => t.id) || []
  );

  const [faqs, setFaqs] = useState<FaqItem[]>(
    post?.faqs?.map((f) => ({ id: f.id, question: f.question, answer: f.answer })) || []
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSeoSection, setShowSeoSection] = useState(false);
  const [showAiSection, setShowAiSection] = useState(false);
  const [showFaqSection, setShowFaqSection] = useState(faqs.length > 0);
  const [slugEdited, setSlugEdited] = useState(isEditing);
  const [showAiModal, setShowAiModal] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<AIGeneratedContent | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importContent, setImportContent] = useState("");
  const [showImportMenu, setShowImportMenu] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showFeaturedImagePicker, setShowFeaturedImagePicker] = useState(false);
  const [showAIImageModal, setShowAIImageModal] = useState(false);
  const [aiImageTarget, setAIImageTarget] = useState<"content" | "featured">("content");
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>(post?.survey_id || "");
  const [enquiryCTATitle, setEnquiryCTATitle] = useState(post?.enquiry_cta_title || "");

  // Lead article state
  const [isLeadArticle, setIsLeadArticle] = useState(post?.is_lead_article || false);

  // Calendly state
  const [calendlyEnabled, setCalendlyEnabled] = useState(post?.calendly_enabled || false);
  const [calendlyEventTypeUri, setCalendlyEventTypeUri] = useState(post?.calendly_event_type_uri || "");
  const [calendlySchedulingUrl, setCalendlySchedulingUrl] = useState(post?.calendly_scheduling_url || "");
  const [calendlyCtaTitle, setCalendlyCtaTitle] = useState(post?.calendly_cta_title || "Schedule a Meeting");
  const [calendlyCtaDescription, setCalendlyCtaDescription] = useState(post?.calendly_cta_description || "");

  const { generate, isGenerating, error: aiError } = useAIGeneration({
    onSuccess: (data) => {
      setGeneratedContent(data);
      setShowAiModal(true);
    },
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportMarkdown = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setFormData((prev) => ({ ...prev, content }));
      }
    };
    reader.readAsText(file);

    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleApplyInlineImport = () => {
    if (importContent.trim()) {
      setFormData((prev) => ({ ...prev, content: importContent }));
      setShowImportDialog(false);
      setImportContent("");
    }
  };

  const handleInsertMedia = (media: MediaItem | MediaItem[]) => {
    const items = Array.isArray(media) ? media : [media];
    const shortcodes = items.map((item) => {
      const tagName =
        item.file_type === "image"
          ? "mediaimage"
          : item.file_type === "video"
          ? "mediavideo"
          : "mediaaudio";
      return `<${tagName} id="${item.id}"></${tagName}>`;
    });
    const insertText = shortcodes.join("\n\n");

    // Append to content with newlines
    setFormData((prev) => ({
      ...prev,
      content: prev.content ? `${prev.content}\n\n${insertText}` : insertText,
    }));
    setShowMediaPicker(false);
  };

  const handleSelectFeaturedImage = (media: MediaItem | MediaItem[]) => {
    const item = Array.isArray(media) ? media[0] : media;
    if (item && item.file_type === "image") {
      setFormData((prev) => ({
        ...prev,
        featured_image: item.public_url,
        featured_image_alt: item.alt_text || prev.featured_image_alt,
      }));
    }
    setShowFeaturedImagePicker(false);
  };

  const handleAIImageSaved = (media: MediaItem) => {
    if (aiImageTarget === "featured") {
      // Use as featured image
      setFormData((prev) => ({
        ...prev,
        featured_image: media.public_url,
        featured_image_alt: media.alt_text || prev.featured_image_alt,
      }));
    } else {
      // Insert into content
      const shortcode = `<mediaimage id="${media.id}"></mediaimage>`;
      setFormData((prev) => ({
        ...prev,
        content: prev.content ? `${prev.content}\n\n${shortcode}` : shortcode,
      }));
    }
    setShowAIImageModal(false);
  };

  // Load surveys on mount
  useEffect(() => {
    async function loadSurveys() {
      try {
        const response = await fetch("/api/admin/surveys?status=active");
        if (response.ok) {
          const data = await response.json();
          setSurveys(data.surveys || []);
        }
      } catch (error) {
        console.error("Failed to load surveys:", error);
      }
    }
    loadSurveys();
  }, []);

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugEdited && formData.title) {
      setFormData((prev) => ({ ...prev, slug: generateSlug(prev.title) }));
    }
  }, [formData.title, slugEdited]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === "slug") {
      setSlugEdited(true);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleAddFaq = () => {
    setFaqs((prev) => [...prev, { question: "", answer: "" }]);
    setShowFaqSection(true);
  };

  const handleRemoveFaq = (index: number) => {
    setFaqs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFaqChange = (
    index: number,
    field: "question" | "answer",
    value: string
  ) => {
    setFaqs((prev) =>
      prev.map((faq, i) => (i === index ? { ...faq, [field]: value } : faq))
    );
  };

  const handleAIGenerate = async () => {
    await generate({
      title: formData.title,
      content: formData.content,
      availableTags: tags.map((t) => ({ id: t.id, name: t.name })),
      generateImage: !formData.og_image,
      existingExcerpt: formData.excerpt || undefined,
    });
  };

  const handleApplyAIContent = (selected: SelectedContent) => {
    setFormData((prev) => {
      const updated = { ...prev };

      // SEO fields
      if (selected.seo?.meta_title) updated.meta_title = selected.seo.meta_title;
      if (selected.seo?.meta_description) updated.meta_description = selected.seo.meta_description;
      if (selected.seo?.primary_keyword) updated.primary_keyword = selected.seo.primary_keyword;
      if (selected.seo?.secondary_keywords) {
        updated.secondary_keywords = selected.seo.secondary_keywords.join(", ");
      }

      // Content fields
      if (selected.content?.subtitle) updated.subtitle = selected.content.subtitle;
      if (selected.content?.excerpt) updated.excerpt = selected.content.excerpt;
      if (selected.content?.title) updated.title = selected.content.title;

      // AI optimization fields
      if (selected.ai_optimization?.ai_summary) {
        updated.ai_summary = selected.ai_optimization.ai_summary;
      }
      if (selected.ai_optimization?.key_takeaways) {
        updated.key_takeaways = selected.ai_optimization.key_takeaways.join("\n");
      }
      if (selected.ai_optimization?.questions_answered) {
        updated.questions_answered = selected.ai_optimization.questions_answered.join("\n");
      }
      if (selected.ai_optimization?.definitive_statements) {
        updated.definitive_statements = selected.ai_optimization.definitive_statements.join("\n");
      }

      // OG Image
      if (selected.og_image) updated.og_image = selected.og_image;

      return updated;
    });

    // Tags
    if (selected.categorization?.suggested_tag_ids) {
      setSelectedTags((prev) => {
        const newTags = new Set([...prev, ...selected.categorization!.suggested_tag_ids!]);
        return Array.from(newTags);
      });
    }

    // FAQs
    if (selected.faqs && selected.faqs.length > 0) {
      setFaqs((prev) => [...prev, ...selected.faqs!]);
      setShowFaqSection(true);
    }

    // Expand sections that received content
    if (selected.seo) setShowSeoSection(true);
    if (selected.ai_optimization) setShowAiSection(true);
  };

  const handleSubmit = async (saveStatus?: "draft" | "published") => {
    setIsLoading(true);
    setError("");

    const status = saveStatus || formData.status;

    const payload = {
      ...formData,
      status,
      author_id: authorId,
      // Convert empty strings to null for optional fields
      scheduled_for: formData.scheduled_for || null,
      featured_image: formData.featured_image || null,
      featured_image_alt: formData.featured_image_alt || null,
      og_image: formData.og_image || null,
      subtitle: formData.subtitle || null,
      excerpt: formData.excerpt || null,
      meta_title: formData.meta_title || null,
      meta_description: formData.meta_description || null,
      primary_keyword: formData.primary_keyword || null,
      ai_summary: formData.ai_summary || null,
      secondary_keywords: formData.secondary_keywords
        ? formData.secondary_keywords.split(",").map((k) => k.trim()).filter(Boolean)
        : [],
      key_takeaways: formData.key_takeaways
        ? formData.key_takeaways.split("\n").map((k) => k.trim()).filter(Boolean)
        : [],
      questions_answered: formData.questions_answered
        ? formData.questions_answered.split("\n").map((k) => k.trim()).filter(Boolean)
        : [],
      definitive_statements: formData.definitive_statements
        ? formData.definitive_statements.split("\n").map((k) => k.trim()).filter(Boolean)
        : [],
      tags: selectedTags,
      faqs: faqs.filter((f) => f.question.trim() && f.answer.trim()),
      survey_id: selectedSurveyId || null,
      enquiry_cta_title: enquiryCTATitle || null,
      // Lead article
      is_lead_article: isLeadArticle,
      // Calendly fields
      calendly_enabled: calendlyEnabled,
      calendly_event_type_uri: calendlyEventTypeUri || null,
      calendly_scheduling_url: calendlySchedulingUrl || null,
      calendly_cta_title: calendlyCtaTitle || null,
      calendly_cta_description: calendlyCtaDescription || null,
    };

    try {
      const url = isEditing
        ? `/api/admin/posts/${post.id}`
        : "/api/admin/posts";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save post");
      }

      router.push("/admin/posts");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save post");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!post || !confirm("Are you sure you want to delete this post?")) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/posts/${post.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to delete post");
      }

      router.push("/admin/posts");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete post");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isEditing ? "Edit Post" : "New Post"}
          </h1>
          {isEditing && <StatusBadge status={post.status} className="mt-2" />}
        </div>
        <div className="flex items-center gap-2">
          {isEditing && (
            <>
              <Button variant="outline" size="sm" asChild>
                <a href={`/admin/posts/${post.id}/preview`} target="_blank">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </a>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md p-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-background rounded-lg border border-border p-4 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="title" className="block text-sm font-medium">
                  Title <span className="text-destructive">*</span>
                </label>
                <SuggestableField
                  fieldName="title"
                  currentValue={formData.title}
                  blogTitle={formData.title}
                  blogContent={formData.content}
                  onSuggestionSelect={(value) =>
                    setFormData((prev) => ({ ...prev, title: value }))
                  }
                  disabled={isLoading}
                />
              </div>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleInputChange}
                required
                className={cn(
                  "w-full px-3 py-2 rounded-md border border-input bg-background",
                  "focus:outline-none focus:ring-2 focus:ring-ring"
                )}
                placeholder="Post title"
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
                placeholder="post-url-slug"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="subtitle" className="block text-sm font-medium">
                  Subtitle
                </label>
                <SuggestableField
                  fieldName="subtitle"
                  currentValue={formData.subtitle}
                  blogTitle={formData.title}
                  blogContent={formData.content}
                  onSuggestionSelect={(value) =>
                    setFormData((prev) => ({ ...prev, subtitle: value }))
                  }
                  disabled={isLoading}
                />
              </div>
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
                placeholder="Optional subtitle"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="excerpt" className="block text-sm font-medium">
                  Excerpt
                </label>
                <SuggestableField
                  fieldName="excerpt"
                  currentValue={formData.excerpt}
                  blogTitle={formData.title}
                  blogContent={formData.content}
                  onSuggestionSelect={(value) =>
                    setFormData((prev) => ({ ...prev, excerpt: value }))
                  }
                  disabled={isLoading}
                />
              </div>
              <textarea
                id="excerpt"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleInputChange}
                rows={2}
                className={cn(
                  "w-full px-3 py-2 rounded-md border border-input bg-background",
                  "focus:outline-none focus:ring-2 focus:ring-ring"
                )}
                placeholder="Brief description for post cards"
              />
            </div>
          </div>

          {/* Content */}
          <div className="bg-background rounded-lg border border-border p-4">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium">
                Content <span className="text-destructive">*</span>
              </label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMediaPicker(true)}
                >
                  <Image className="h-4 w-4 mr-2" />
                  Media
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAIImageTarget("content");
                    setShowAIImageModal(true);
                  }}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Image
                </Button>
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".md,.markdown,.txt"
                  onChange={handleImportMarkdown}
                  className="hidden"
                  aria-label="Import markdown file"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowImportMenu(!showImportMenu)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
                {showImportMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowImportMenu(false)}
                    />
                    <div className="absolute right-0 mt-1 w-48 bg-background border border-border rounded-md shadow-lg z-20">
                      <button
                        type="button"
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-left"
                        onClick={() => {
                          fileInputRef.current?.click();
                          setShowImportMenu(false);
                        }}
                      >
                        <FileText className="h-4 w-4" />
                        From File
                      </button>
                      <button
                        type="button"
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-left"
                        onClick={() => {
                          setShowImportDialog(true);
                          setShowImportMenu(false);
                        }}
                      >
                        <ClipboardPaste className="h-4 w-4" />
                        Paste Inline
                      </button>
                    </div>
                  </>
                )}
              </div>
              </div>
            </div>
            <MarkdownEditor
              value={formData.content}
              onChange={(value) => setFormData((prev) => ({ ...prev, content: value }))}
              height={500}
            />
          </div>

          {/* Media */}
          <div className="bg-background rounded-lg border border-border p-4 space-y-4">
            <h3 className="font-medium">Media</h3>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="featured_image" className="block text-sm font-medium">
                  Featured Image URL
                </label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAIImageTarget("featured");
                      setShowAIImageModal(true);
                    }}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFeaturedImagePicker(true)}
                  >
                    <Image className="h-4 w-4 mr-2" />
                    Select from Library
                  </Button>
                </div>
              </div>
              <input
                id="featured_image"
                name="featured_image"
                type="url"
                value={formData.featured_image}
                onChange={handleInputChange}
                className={cn(
                  "w-full px-3 py-2 rounded-md border border-input bg-background",
                  "focus:outline-none focus:ring-2 focus:ring-ring"
                )}
                placeholder="https://..."
              />
            </div>
            <div>
              <label htmlFor="featured_image_alt" className="block text-sm font-medium mb-1.5">
                Featured Image Alt Text
              </label>
              <input
                id="featured_image_alt"
                name="featured_image_alt"
                type="text"
                value={formData.featured_image_alt}
                onChange={handleInputChange}
                className={cn(
                  "w-full px-3 py-2 rounded-md border border-input bg-background",
                  "focus:outline-none focus:ring-2 focus:ring-ring"
                )}
                placeholder="Describe the image"
              />
            </div>
            <div>
              <label htmlFor="og_image" className="block text-sm font-medium mb-1.5">
                OG Image URL
              </label>
              <input
                id="og_image"
                name="og_image"
                type="url"
                value={formData.og_image}
                onChange={handleInputChange}
                className={cn(
                  "w-full px-3 py-2 rounded-md border border-input bg-background",
                  "focus:outline-none focus:ring-2 focus:ring-ring"
                )}
                placeholder="https://... (auto-generated by AI)"
              />
              {formData.og_image && (
                <div className="mt-2">
                  <img
                    src={formData.og_image}
                    alt="OG Image preview"
                    className="rounded-md max-h-40 object-cover border border-border"
                  />
                </div>
              )}
            </div>
          </div>

          {/* SEO Section */}
          <div className="bg-background rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setShowSeoSection(!showSeoSection)}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <h3 className="font-medium">SEO Settings</h3>
              {showSeoSection ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
            {showSeoSection && (
              <div className="p-4 pt-0 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="meta_title" className="block text-sm font-medium">
                      Meta Title
                    </label>
                    <SuggestableField
                      fieldName="meta_title"
                      currentValue={formData.meta_title}
                      blogTitle={formData.title}
                      blogContent={formData.content}
                      onSuggestionSelect={(value) =>
                        setFormData((prev) => ({ ...prev, meta_title: value }))
                      }
                      disabled={isLoading}
                    />
                  </div>
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
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="meta_description" className="block text-sm font-medium">
                      Meta Description
                    </label>
                    <SuggestableField
                      fieldName="meta_description"
                      currentValue={formData.meta_description}
                      blogTitle={formData.title}
                      blogContent={formData.content}
                      onSuggestionSelect={(value) =>
                        setFormData((prev) => ({ ...prev, meta_description: value }))
                      }
                      disabled={isLoading}
                    />
                  </div>
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
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="primary_keyword" className="block text-sm font-medium">
                      Primary Keyword
                    </label>
                    <SuggestableField
                      fieldName="primary_keyword"
                      currentValue={formData.primary_keyword}
                      blogTitle={formData.title}
                      blogContent={formData.content}
                      onSuggestionSelect={(value) =>
                        setFormData((prev) => ({ ...prev, primary_keyword: value }))
                      }
                      disabled={isLoading}
                    />
                  </div>
                  <input
                    id="primary_keyword"
                    name="primary_keyword"
                    type="text"
                    value={formData.primary_keyword}
                    onChange={handleInputChange}
                    className={cn(
                      "w-full px-3 py-2 rounded-md border border-input bg-background",
                      "focus:outline-none focus:ring-2 focus:ring-ring"
                    )}
                    placeholder="Main keyword"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="secondary_keywords" className="block text-sm font-medium">
                      Secondary Keywords
                    </label>
                    <SuggestableField
                      fieldName="secondary_keywords"
                      currentValue={formData.secondary_keywords}
                      blogTitle={formData.title}
                      blogContent={formData.content}
                      onSuggestionSelect={(value) =>
                        setFormData((prev) => ({ ...prev, secondary_keywords: value }))
                      }
                      disabled={isLoading}
                    />
                  </div>
                  <input
                    id="secondary_keywords"
                    name="secondary_keywords"
                    type="text"
                    value={formData.secondary_keywords}
                    onChange={handleInputChange}
                    className={cn(
                      "w-full px-3 py-2 rounded-md border border-input bg-background",
                      "focus:outline-none focus:ring-2 focus:ring-ring"
                    )}
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>
              </div>
            )}
          </div>

          {/* AI Optimization Section */}
          <div className="bg-background rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setShowAiSection(!showAiSection)}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <h3 className="font-medium">AI Optimization</h3>
              {showAiSection ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
            {showAiSection && (
              <div className="p-4 pt-0 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="ai_summary" className="block text-sm font-medium">
                      AI Summary
                    </label>
                    <SuggestableField
                      fieldName="ai_summary"
                      currentValue={formData.ai_summary}
                      blogTitle={formData.title}
                      blogContent={formData.content}
                      onSuggestionSelect={(value) =>
                        setFormData((prev) => ({ ...prev, ai_summary: value }))
                      }
                      disabled={isLoading}
                    />
                  </div>
                  <textarea
                    id="ai_summary"
                    name="ai_summary"
                    value={formData.ai_summary}
                    onChange={handleInputChange}
                    rows={3}
                    className={cn(
                      "w-full px-3 py-2 rounded-md border border-input bg-background",
                      "focus:outline-none focus:ring-2 focus:ring-ring"
                    )}
                    placeholder="2-3 sentence TL;DR for AI citation"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="key_takeaways" className="block text-sm font-medium">
                      Key Takeaways (one per line)
                    </label>
                    <SuggestableField
                      fieldName="key_takeaways"
                      currentValue={formData.key_takeaways}
                      blogTitle={formData.title}
                      blogContent={formData.content}
                      onSuggestionSelect={(value) =>
                        setFormData((prev) => ({ ...prev, key_takeaways: value }))
                      }
                      disabled={isLoading}
                    />
                  </div>
                  <textarea
                    id="key_takeaways"
                    name="key_takeaways"
                    value={formData.key_takeaways}
                    onChange={handleInputChange}
                    rows={4}
                    className={cn(
                      "w-full px-3 py-2 rounded-md border border-input bg-background",
                      "focus:outline-none focus:ring-2 focus:ring-ring"
                    )}
                    placeholder="Key point 1&#10;Key point 2&#10;Key point 3"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="questions_answered" className="block text-sm font-medium">
                      Questions Answered (one per line)
                    </label>
                    <SuggestableField
                      fieldName="questions_answered"
                      currentValue={formData.questions_answered}
                      blogTitle={formData.title}
                      blogContent={formData.content}
                      onSuggestionSelect={(value) =>
                        setFormData((prev) => ({ ...prev, questions_answered: value }))
                      }
                      disabled={isLoading}
                    />
                  </div>
                  <textarea
                    id="questions_answered"
                    name="questions_answered"
                    value={formData.questions_answered}
                    onChange={handleInputChange}
                    rows={4}
                    className={cn(
                      "w-full px-3 py-2 rounded-md border border-input bg-background",
                      "focus:outline-none focus:ring-2 focus:ring-ring"
                    )}
                    placeholder="What is X?&#10;How does X work?&#10;Why use X?"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="definitive_statements" className="block text-sm font-medium">
                      Definitive Statements (one per line)
                    </label>
                    <SuggestableField
                      fieldName="definitive_statements"
                      currentValue={formData.definitive_statements}
                      blogTitle={formData.title}
                      blogContent={formData.content}
                      onSuggestionSelect={(value) =>
                        setFormData((prev) => ({ ...prev, definitive_statements: value }))
                      }
                      disabled={isLoading}
                    />
                  </div>
                  <textarea
                    id="definitive_statements"
                    name="definitive_statements"
                    value={formData.definitive_statements}
                    onChange={handleInputChange}
                    rows={4}
                    className={cn(
                      "w-full px-3 py-2 rounded-md border border-input bg-background",
                      "focus:outline-none focus:ring-2 focus:ring-ring"
                    )}
                    placeholder="Quotable facts from your content"
                  />
                </div>
              </div>
            )}
          </div>

          {/* FAQs Section */}
          <div className="bg-background rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setShowFaqSection(!showFaqSection)}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <h3 className="font-medium">FAQs ({faqs.length})</h3>
              {showFaqSection ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
            {showFaqSection && (
              <div className="p-4 pt-0 space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium text-muted-foreground">
                        FAQ #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFaq(index)}
                        className="text-destructive hover:text-destructive/80"
                        aria-label={`Remove FAQ #${index + 1}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Question</label>
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => handleFaqChange(index, "question", e.target.value)}
                        className={cn(
                          "w-full px-3 py-2 rounded-md border border-input bg-background",
                          "focus:outline-none focus:ring-2 focus:ring-ring"
                        )}
                        placeholder="What is...?"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Answer</label>
                      <textarea
                        value={faq.answer}
                        onChange={(e) => handleFaqChange(index, "answer", e.target.value)}
                        rows={3}
                        className={cn(
                          "w-full px-3 py-2 rounded-md border border-input bg-background",
                          "focus:outline-none focus:ring-2 focus:ring-ring"
                        )}
                        placeholder="The answer is..."
                      />
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={handleAddFaq}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add FAQ
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Generation */}
          <div className="bg-background rounded-lg border border-border p-4">
            <AIGenerateButton
              onClick={handleAIGenerate}
              isGenerating={isGenerating}
              disabled={isLoading}
              contentLength={formData.content.length}
            />
            {aiError && (
              <p className="text-xs text-destructive mt-2">{aiError}</p>
            )}
          </div>

          {/* Publish Settings */}
          <div className="bg-background rounded-lg border border-border p-4 space-y-4">
            <h3 className="font-medium">Publish</h3>
            <div>
              <label htmlFor="status" className="block text-sm font-medium mb-1.5">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className={cn(
                  "w-full px-3 py-2 rounded-md border border-input bg-background",
                  "focus:outline-none focus:ring-2 focus:ring-ring"
                )}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {formData.status === "scheduled" && (
              <div>
                <label htmlFor="scheduled_for" className="block text-sm font-medium mb-1.5">
                  Scheduled For
                </label>
                <input
                  id="scheduled_for"
                  name="scheduled_for"
                  type="datetime-local"
                  value={formData.scheduled_for}
                  onChange={handleInputChange}
                  className={cn(
                    "w-full px-3 py-2 rounded-md border border-input bg-background",
                    "focus:outline-none focus:ring-2 focus:ring-ring"
                  )}
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                id="is_featured"
                name="is_featured"
                type="checkbox"
                checked={formData.is_featured}
                onChange={handleInputChange}
                className="rounded border-input"
              />
              <label htmlFor="is_featured" className="text-sm">
                Featured post
              </label>
            </div>

            {formData.is_featured && (
              <div>
                <label htmlFor="featured_order" className="block text-sm font-medium mb-1.5">
                  Featured Order
                </label>
                <input
                  id="featured_order"
                  name="featured_order"
                  type="number"
                  min={1}
                  max={10}
                  value={formData.featured_order}
                  onChange={handleInputChange}
                  className={cn(
                    "w-full px-3 py-2 rounded-md border border-input bg-background",
                    "focus:outline-none focus:ring-2 focus:ring-ring"
                  )}
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                id="is_lead_article"
                type="checkbox"
                checked={isLeadArticle}
                onChange={(e) => setIsLeadArticle(e.target.checked)}
                className="rounded border-input"
              />
              <label htmlFor="is_lead_article" className="text-sm">
                Lead article
              </label>
            </div>
            {isLeadArticle && (
              <p className="text-xs text-muted-foreground -mt-2">
                Lead articles are hidden from all listings but accessible via direct URL.
                Link them from Help Options on the homepage.
              </p>
            )}

            <div className="flex flex-col gap-2 pt-4 border-t border-border">
              <Button
                onClick={() => handleSubmit("published")}
                disabled={isLoading}
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : "Publish"}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSubmit("draft")}
                disabled={isLoading}
              >
                Save as Draft
              </Button>
            </div>
          </div>

          {/* Category */}
          <div className="bg-background rounded-lg border border-border p-4">
            <label htmlFor="category_id" className="block text-sm font-medium mb-1.5">
              Category <span className="text-destructive">*</span>
            </label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleInputChange}
              className={cn(
                "w-full px-3 py-2 rounded-md border border-input bg-background",
                "focus:outline-none focus:ring-2 focus:ring-ring"
              )}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="bg-background rounded-lg border border-border p-4">
            <h3 className="font-medium mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleTagToggle(tag.id)}
                  className={cn(
                    "px-3 py-1 rounded-full text-sm transition-colors",
                    selectedTags.includes(tag.id)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {tag.name}
                </button>
              ))}
              {tags.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No tags available
                </p>
              )}
            </div>
          </div>

          {/* Enquiry Settings */}
          <div className="bg-background rounded-lg border border-border p-4 space-y-4">
            <h3 className="font-medium">Enquiry Settings</h3>
            <div>
              <label htmlFor="survey_id" className="block text-sm font-medium mb-1.5">
                Enquiry Survey
              </label>
              <select
                id="survey_id"
                value={selectedSurveyId}
                onChange={(e) => setSelectedSurveyId(e.target.value)}
                className={cn(
                  "w-full px-3 py-2 rounded-md border border-input bg-background",
                  "focus:outline-none focus:ring-2 focus:ring-ring"
                )}
              >
                <option value="">No enquiry form</option>
                {surveys.map((survey) => (
                  <option key={survey.id} value={survey.id}>
                    {survey.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Select a survey to show as the enquiry CTA on this post
              </p>
            </div>

            {selectedSurveyId && (
              <div>
                <label htmlFor="enquiry_cta_title" className="block text-sm font-medium mb-1.5">
                  CTA Title
                </label>
                <input
                  id="enquiry_cta_title"
                  type="text"
                  value={enquiryCTATitle}
                  onChange={(e) => setEnquiryCTATitle(e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 rounded-md border border-input bg-background",
                    "focus:outline-none focus:ring-2 focus:ring-ring"
                  )}
                  placeholder="Get a Free Quote"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  The title shown on the enquiry button
                </p>
              </div>
            )}
          </div>

          {/* Calendly Settings */}
          <CalendlySettings
            enabled={calendlyEnabled}
            onEnabledChange={setCalendlyEnabled}
            eventTypeUri={calendlyEventTypeUri}
            onEventTypeUriChange={setCalendlyEventTypeUri}
            schedulingUrl={calendlySchedulingUrl}
            onSchedulingUrlChange={setCalendlySchedulingUrl}
            ctaTitle={calendlyCtaTitle}
            onCtaTitleChange={setCalendlyCtaTitle}
            ctaDescription={calendlyCtaDescription}
            onCtaDescriptionChange={setCalendlyCtaDescription}
          />
        </div>
      </div>

      {/* AI Generation Modal */}
      {generatedContent && (
        <AIGenerationModal
          isOpen={showAiModal}
          onClose={() => setShowAiModal(false)}
          generatedContent={generatedContent}
          existingFields={{
            meta_title: formData.meta_title,
            meta_description: formData.meta_description,
            primary_keyword: formData.primary_keyword,
            secondary_keywords: formData.secondary_keywords,
            subtitle: formData.subtitle,
            excerpt: formData.excerpt,
            ai_summary: formData.ai_summary,
            key_takeaways: formData.key_takeaways,
            questions_answered: formData.questions_answered,
            og_image: formData.og_image,
          }}
          availableTags={tags}
          onApply={handleApplyAIContent}
        />
      )}

      {/* Import Markdown Dialog */}
      {showImportDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => {
              setShowImportDialog(false);
              setImportContent("");
            }}
          />
          <div className="relative bg-background border border-border rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold">Import Markdown</h2>
              <button
                type="button"
                onClick={() => {
                  setShowImportDialog(false);
                  setImportContent("");
                }}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-auto">
              <p className="text-sm text-muted-foreground mb-3">
                Paste or type your markdown content below. This will replace the current content.
              </p>
              <textarea
                value={importContent}
                onChange={(e) => setImportContent(e.target.value)}
                className={cn(
                  "w-full h-80 px-3 py-2 rounded-md border border-input bg-background font-mono text-sm",
                  "focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                )}
                placeholder="# Your Markdown Here&#10;&#10;Paste or type your markdown content..."
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowImportDialog(false);
                  setImportContent("");
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleApplyInlineImport}
                disabled={!importContent.trim()}
              >
                <ClipboardPaste className="h-4 w-4 mr-2" />
                Import Content
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Media Picker Modal - for inserting into content */}
      <MediaPickerModal
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={handleInsertMedia}
        multiple
        title="Insert Media"
      />

      {/* Featured Image Picker Modal */}
      <MediaPickerModal
        isOpen={showFeaturedImagePicker}
        onClose={() => setShowFeaturedImagePicker(false)}
        onSelect={handleSelectFeaturedImage}
        allowedTypes={["image"]}
        title="Select Featured Image"
      />

      {/* AI Image Generation Modal */}
      <AIImageModal
        isOpen={showAIImageModal}
        onClose={() => setShowAIImageModal(false)}
        onImageSaved={handleAIImageSaved}
        initialPrompt={formData.title ? `Illustration for: ${formData.title}` : ""}
        defaultType={aiImageTarget === "featured" ? "og" : "hero"}
        context="post-editor"
      />
    </div>
  );
}
