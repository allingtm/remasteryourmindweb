"use client";

import Image from "next/image";
import { Edit, Trash2, Copy, Image as ImageIcon, Video, Music, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/lib/media/config";
import type { MediaItem } from "@/types";

interface MediaCardProps {
  media: MediaItem;
  variant?: "card" | "row";
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
  onSelect?: () => void;
  isSelected?: boolean;
}

function getMediaIcon(fileType: string) {
  switch (fileType) {
    case "image":
      return ImageIcon;
    case "video":
      return Video;
    case "audio":
      return Music;
    default:
      return ImageIcon;
  }
}

export function MediaCard({
  media,
  variant = "card",
  onEdit,
  onDelete,
  isDeleting,
  onSelect,
  isSelected,
}: MediaCardProps) {
  const Icon = getMediaIcon(media.file_type);

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(media.public_url);
  };

  const handleCopyShortcode = async () => {
    const tagName = media.file_type === "image" ? "mediaimage" :
                    media.file_type === "video" ? "mediavideo" : "mediaaudio";
    const shortcode = `<${tagName} id="${media.id}"></${tagName}>`;
    await navigator.clipboard.writeText(shortcode);
  };

  if (variant === "row") {
    return (
      <tr className="hover:bg-muted/30">
        <td className="px-4 py-3 w-16">
          <div
            className={`relative w-12 h-12 rounded overflow-hidden bg-muted flex items-center justify-center ${
              onSelect ? "cursor-pointer" : ""
            } ${isSelected ? "ring-2 ring-primary" : ""}`}
            onClick={onSelect}
          >
            {media.file_type === "image" ? (
              <Image
                src={media.public_url}
                alt={media.alt_text || media.original_filename}
                fill
                className="object-cover"
              />
            ) : (
              <Icon className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="flex flex-col">
            <span className="font-medium text-foreground line-clamp-1">
              {media.original_filename}
            </span>
            {media.alt_text && (
              <span className="text-sm text-muted-foreground line-clamp-1">
                {media.alt_text}
              </span>
            )}
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-muted-foreground capitalize hidden sm:table-cell">
          {media.file_type}
        </td>
        <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
          {formatFileSize(media.file_size)}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopyShortcode}
              title="Copy shortcode"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              disabled={isDeleting}
              className="text-destructive hover:text-destructive"
            >
              {isDeleting ? (
                <MoreHorizontal className="h-4 w-4 animate-pulse" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <div
      className={`group relative bg-background rounded-lg border border-border overflow-hidden ${
        onSelect ? "cursor-pointer" : ""
      } ${isSelected ? "ring-2 ring-primary" : ""}`}
      onClick={onSelect}
    >
      {/* Preview */}
      <div className="relative aspect-square bg-muted">
        {media.file_type === "image" ? (
          <Image
            src={media.public_url}
            alt={media.alt_text || media.original_filename}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleCopyShortcode();
            }}
            title="Copy shortcode"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            disabled={isDeleting}
            className="hover:bg-destructive hover:text-destructive-foreground"
          >
            {isDeleting ? (
              <MoreHorizontal className="h-4 w-4 animate-pulse" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2">
        <p className="text-sm font-medium text-foreground line-clamp-1">
          {media.original_filename}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(media.file_size)}
        </p>
      </div>
    </div>
  );
}
