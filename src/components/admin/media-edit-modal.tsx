"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Copy, Check, Loader2, Image as ImageIcon, Video, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatFileSize } from "@/lib/media/config";
import type { MediaItem } from "@/types";

interface MediaEditModalProps {
  media: MediaItem;
  isOpen: boolean;
  onClose: () => void;
  onSave: (media: MediaItem) => void;
}

export function MediaEditModal({
  media,
  isOpen,
  onClose,
  onSave,
}: MediaEditModalProps) {
  const [altText, setAltText] = useState(media.alt_text || "");
  const [caption, setCaption] = useState(media.caption || "");
  const [tags, setTags] = useState(media.tags.join(", "));
  const [isSaving, setIsSaving] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedShortcode, setCopiedShortcode] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin/media/${media.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alt_text: altText || null,
          caption: caption || null,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to save");
      }

      const { media: updatedMedia } = await response.json();
      onSave(updatedMedia);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save";
      alert(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(media.public_url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyShortcode = async () => {
    const tagName =
      media.file_type === "image"
        ? "mediaimage"
        : media.file_type === "video"
        ? "mediavideo"
        : "mediaaudio";
    const shortcode = `<${tagName} id="${media.id}"></${tagName}>`;
    await navigator.clipboard.writeText(shortcode);
    setCopiedShortcode(true);
    setTimeout(() => setCopiedShortcode(false), 2000);
  };

  const getMediaIcon = () => {
    switch (media.file_type) {
      case "image":
        return ImageIcon;
      case "video":
        return Video;
      case "audio":
        return Music;
      default:
        return ImageIcon;
    }
  };

  const Icon = getMediaIcon();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-background rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">Edit Media</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Preview */}
            <div>
              <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                {media.file_type === "image" ? (
                  <Image
                    src={media.public_url}
                    alt={media.alt_text || media.original_filename}
                    fill
                    className="object-contain"
                  />
                ) : media.file_type === "video" ? (
                  <video
                    src={media.public_url}
                    controls
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <Icon className="h-16 w-16 text-muted-foreground" />
                    <audio src={media.public_url} controls className="w-full px-4" />
                  </div>
                )}
              </div>

              {/* File Info */}
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Filename:</span>
                  <span className="font-medium truncate ml-2">
                    {media.original_filename}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium">{media.mime_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Size:</span>
                  <span className="font-medium">
                    {formatFileSize(media.file_size)}
                  </span>
                </div>
                {media.width && media.height && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dimensions:</span>
                    <span className="font-medium">
                      {media.width} x {media.height}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Uploaded:</span>
                  <span className="font-medium">
                    {new Date(media.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Copy buttons */}
              <div className="mt-4 space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleCopyUrl}
                >
                  {copiedUrl ? (
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  {copiedUrl ? "Copied!" : "Copy URL"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleCopyShortcode}
                >
                  {copiedShortcode ? (
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  {copiedShortcode ? "Copied!" : "Copy Shortcode"}
                </Button>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="alt_text">Alt Text</Label>
                <Textarea
                  id="alt_text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Describe this media for accessibility"
                  className="mt-1"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Describe the content of this media for screen readers
                </p>
              </div>

              <div>
                <Label htmlFor="caption">Caption</Label>
                <Textarea
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Optional caption to display with media"
                  className="mt-1"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="hero, product, team (comma-separated)"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Add tags to help organize and find media
                </p>
              </div>

              <div>
                <Label>ID</Label>
                <Input value={media.id} readOnly className="mt-1 font-mono text-xs" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
