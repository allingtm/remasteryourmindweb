"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Sparkles,
  Loader2,
  RefreshCw,
  Save,
  AlertCircle,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useAIImageGeneration,
  type GeneratedImagePreview,
} from "@/hooks/use-ai-image-generation";
import {
  IMAGE_PRESETS,
  type ImagePresetKey,
} from "@/lib/ai/image-presets";
import { IMAGE_STYLES, type ImageStyleKey } from "@/lib/ai/image-styles";
import type { MediaItem } from "@/types";

interface AIImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSaved: (media: MediaItem) => void;
  initialPrompt?: string;
  defaultType?: ImagePresetKey;
  context?: "media-library" | "post-editor";
}

type ModalStep = "configure" | "generating" | "preview" | "saving";

export function AIImageModal({
  isOpen,
  onClose,
  onImageSaved,
  initialPrompt = "",
  defaultType = "og",
  context = "media-library",
}: AIImageModalProps) {
  // Form state
  const [prompt, setPrompt] = useState(initialPrompt);
  const [imageType, setImageType] = useState<ImagePresetKey>(defaultType);
  const [style, setStyle] = useState<ImageStyleKey>("illustration");
  const [customWidth, setCustomWidth] = useState(1200);
  const [customHeight, setCustomHeight] = useState(630);
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");

  // Modal step state
  const [step, setStep] = useState<ModalStep>("configure");

  // AI generation hook
  const {
    generate,
    save,
    reset,
    isGenerating,
    isSaving,
    error,
    preview,
  } = useAIImageGeneration();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setPrompt(initialPrompt);
      setImageType(defaultType);
      setStep("configure");
      reset();
    }
  }, [isOpen, initialPrompt, defaultType, reset]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setStep("generating");
    const result = await generate({
      prompt: prompt.trim(),
      imageType,
      style,
      customWidth: imageType === "custom" ? customWidth : undefined,
      customHeight: imageType === "custom" ? customHeight : undefined,
    });

    if (result) {
      setStep("preview");
    } else {
      setStep("configure");
    }
  };

  const handleRegenerate = async () => {
    setStep("generating");
    const result = await generate({
      prompt: prompt.trim(),
      imageType,
      style,
      customWidth: imageType === "custom" ? customWidth : undefined,
      customHeight: imageType === "custom" ? customHeight : undefined,
    });

    if (result) {
      setStep("preview");
    } else {
      setStep("configure");
    }
  };

  const handleSave = async () => {
    if (!preview) return;

    setStep("saving");
    const media = await save({
      imageUrl: preview.imageUrl,
      prompt: prompt.trim(),
      revisedPrompt: preview.revisedPrompt,
      imageType,
      width: preview.width,
      height: preview.height,
      altText: altText.trim() || undefined,
      caption: caption.trim() || undefined,
    });

    if (media) {
      onImageSaved(media);
      handleClose();
    } else {
      setStep("preview");
    }
  };

  const handleClose = () => {
    if (isGenerating || isSaving) return;
    reset();
    setPrompt("");
    setAltText("");
    setCaption("");
    setStep("configure");
    onClose();
  };

  const getPresetLabel = (key: ImagePresetKey): string => {
    if (key === "custom") return "Custom";
    return IMAGE_PRESETS[key].name;
  };

  const getPresetDescription = (key: ImagePresetKey): string => {
    if (key === "custom") return `Custom size (${customWidth}×${customHeight})`;
    return IMAGE_PRESETS[key].description;
  };

  if (!isOpen) return null;

  const isLoading = isGenerating || isSaving;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-background rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Generate AI Image</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Error display */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Configuration Form */}
          {(step === "configure" || step === "generating") && (
            <div className="space-y-5">
              {/* Image Type Selection */}
              <div>
                <Label className="text-sm font-medium">Image Type</Label>
                <div className="mt-2 grid gap-2">
                  {(["og", "hero", "square", "infographic", "custom"] as ImagePresetKey[]).map(
                    (type) => (
                      <label
                        key={type}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          imageType === type
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="imageType"
                          value={type}
                          checked={imageType === type}
                          onChange={() => setImageType(type)}
                          className="sr-only"
                          disabled={isLoading}
                        />
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            imageType === type
                              ? "border-primary"
                              : "border-muted-foreground"
                          }`}
                        >
                          {imageType === type && (
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{getPresetLabel(type)}</p>
                          <p className="text-sm text-muted-foreground">
                            {getPresetDescription(type)}
                          </p>
                        </div>
                      </label>
                    )
                  )}
                </div>

                {/* Custom dimensions */}
                {imageType === "custom" && (
                  <div className="mt-3 flex items-center gap-3">
                    <div>
                      <Label htmlFor="customWidth" className="text-xs">
                        Width
                      </Label>
                      <Input
                        id="customWidth"
                        type="number"
                        value={customWidth}
                        onChange={(e) =>
                          setCustomWidth(parseInt(e.target.value) || 1024)
                        }
                        min={256}
                        max={4096}
                        className="mt-1 w-24"
                        disabled={isLoading}
                      />
                    </div>
                    <span className="mt-6 text-muted-foreground">×</span>
                    <div>
                      <Label htmlFor="customHeight" className="text-xs">
                        Height
                      </Label>
                      <Input
                        id="customHeight"
                        type="number"
                        value={customHeight}
                        onChange={(e) =>
                          setCustomHeight(parseInt(e.target.value) || 1024)
                        }
                        min={256}
                        max={4096}
                        className="mt-1 w-24"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Style Selection */}
              <div>
                <Label htmlFor="style" className="text-sm font-medium">
                  Style
                </Label>
                <select
                  id="style"
                  value={style}
                  onChange={(e) => setStyle(e.target.value as ImageStyleKey)}
                  className="mt-1.5 w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                  disabled={isLoading}
                >
                  {Object.entries(IMAGE_STYLES).map(([key, styleInfo]) => (
                    <option key={key} value={key}>
                      {styleInfo.name} - {styleInfo.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Prompt */}
              <div>
                <Label htmlFor="prompt" className="text-sm font-medium">
                  Prompt <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the image you want to generate..."
                  rows={4}
                  className="mt-1.5"
                  disabled={isLoading}
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Be specific about the subject, composition, and mood. The
                  selected style will be added automatically.
                </p>
              </div>

              {/* Context hint for post editor */}
              {context === "post-editor" && (
                <div className="p-3 rounded-lg bg-muted/50 flex items-start gap-2">
                  <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    After saving, you can use this image as your featured image
                    or insert it into your content.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Generating state */}
          {step === "generating" && (
            <div className="mt-6 flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-lg font-medium">Generating your image...</p>
              <p className="text-sm text-muted-foreground">
                This may take 10-20 seconds
              </p>
            </div>
          )}

          {/* Preview */}
          {(step === "preview" || step === "saving") && preview && (
            <div className="space-y-5">
              {/* Generated Image */}
              <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                <Image
                  src={preview.imageUrl}
                  alt="Generated image preview"
                  fill
                  className="object-contain"
                  unoptimized // OpenAI URLs are temporary
                />
              </div>

              {/* Revised Prompt Info */}
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  DALL-E interpreted your prompt as:
                </p>
                <p className="text-sm">{preview.revisedPrompt}</p>
              </div>

              {/* Image Info */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Size: {preview.dalleSize}</span>
                <span>•</span>
                <span>
                  Target: {preview.width}×{preview.height}
                </span>
              </div>

              {/* Metadata Inputs */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="altText" className="text-sm">
                    Alt Text
                  </Label>
                  <Input
                    id="altText"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="Describe this image for accessibility"
                    className="mt-1.5"
                    disabled={isSaving}
                  />
                </div>
                <div>
                  <Label htmlFor="caption" className="text-sm">
                    Caption (optional)
                  </Label>
                  <Input
                    id="caption"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Optional caption for display"
                    className="mt-1.5"
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border">
          <div>
            {step === "preview" && (
              <Button
                variant="outline"
                onClick={handleRegenerate}
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>

            {step === "configure" && (
              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isLoading}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate
              </Button>
            )}

            {(step === "preview" || step === "saving") && (
              <Button onClick={handleSave} disabled={isLoading}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save to Library
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
