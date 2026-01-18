"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Search, Upload, Image, Video, Music, Grid, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MediaCard } from "./media-card";
import type { MediaItem } from "@/types";

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: MediaItem | MediaItem[]) => void;
  multiple?: boolean;
  allowedTypes?: ("image" | "video" | "audio")[];
  title?: string;
}

const TYPE_OPTIONS = [
  { value: "all", label: "All", icon: Grid },
  { value: "image", label: "Images", icon: Image },
  { value: "video", label: "Videos", icon: Video },
  { value: "audio", label: "Audio", icon: Music },
];

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  multiple = false,
  allowedTypes,
  title = "Select Media",
}: MediaPickerModalProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filteredTypeOptions = allowedTypes
    ? TYPE_OPTIONS.filter(
        (opt) => opt.value === "all" || allowedTypes.includes(opt.value as "image" | "video" | "audio")
      )
    : TYPE_OPTIONS;

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedType !== "all") {
        params.set("type", selectedType);
      }
      if (searchQuery) {
        params.set("search", searchQuery);
      }
      params.set("limit", "100");

      const response = await fetch(`/api/admin/media?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        // Filter by allowed types if specified
        let filteredMedia = data.media;
        if (allowedTypes && allowedTypes.length > 0) {
          filteredMedia = data.media.filter((m: MediaItem) =>
            allowedTypes.includes(m.file_type)
          );
        }
        setMedia(filteredMedia);
      }
    } catch (error) {
      console.error("Failed to fetch media:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedType, searchQuery, allowedTypes]);

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen, fetchMedia]);

  const handleSelect = (item: MediaItem) => {
    if (multiple) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(item.id)) {
          next.delete(item.id);
        } else {
          next.add(item.id);
        }
        return next;
      });
    } else {
      onSelect(item);
      onClose();
    }
  };

  const handleConfirm = () => {
    const selectedMedia = media.filter((m) => selectedIds.has(m.id));
    onSelect(selectedMedia);
    onClose();
  };

  const handleClose = () => {
    setSelectedIds(new Set());
    setSearchQuery("");
    setSelectedType("all");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-background rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Type Filter */}
            <div className="flex items-center gap-2 overflow-x-auto">
              {filteredTypeOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => setSelectedType(option.value)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                      selectedType === option.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {option.label}
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="relative ml-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search media..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-[200px]"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-220px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : media.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Image className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No media found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {media.map((item) => (
                <MediaCard
                  key={item.id}
                  media={item}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  onSelect={() => handleSelect(item)}
                  isSelected={selectedIds.has(item.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            {multiple && selectedIds.size > 0 && (
              <span>{selectedIds.size} selected</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            {multiple && (
              <Button onClick={handleConfirm} disabled={selectedIds.size === 0}>
                Select ({selectedIds.size})
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
