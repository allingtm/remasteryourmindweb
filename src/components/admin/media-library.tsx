"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Search, Image, Video, Music, Grid, List, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MediaCard } from "./media-card";
import { MediaUploadModal } from "./media-upload-modal";
import { MediaEditModal } from "./media-edit-modal";
import { AIImageModal } from "./ai-image-modal";
import type { MediaItem } from "@/types";

interface MediaLibraryProps {
  initialMedia: MediaItem[];
  stats: {
    total: number;
    images: number;
    videos: number;
    audio: number;
  };
}

const TYPE_OPTIONS = [
  { value: "all", label: "All", icon: Grid },
  { value: "image", label: "Images", icon: Image },
  { value: "video", label: "Videos", icon: Video },
  { value: "audio", label: "Audio", icon: Music },
];

export function MediaLibrary({ initialMedia, stats }: MediaLibraryProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentType = searchParams.get("type") || "all";
  const currentSearch = searchParams.get("search") || "";

  const [media, setMedia] = useState<MediaItem[]>(initialMedia);
  const [searchQuery, setSearchQuery] = useState(currentSearch);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAIGenerateOpen, setIsAIGenerateOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleTypeChange = (type: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (type === "all") {
      params.delete("type");
    } else {
      params.set("type", type);
    }
    router.push(`/admin/media?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery) {
      params.set("search", searchQuery);
    } else {
      params.delete("search");
    }
    router.push(`/admin/media?${params.toString()}`);
  };

  const handleUploadComplete = useCallback((newMedia: MediaItem) => {
    setMedia((prev) => [newMedia, ...prev]);
    router.refresh();
  }, [router]);

  const handleAIImageSaved = useCallback((newMedia: MediaItem) => {
    setMedia((prev) => [newMedia, ...prev]);
    setIsAIGenerateOpen(false);
    router.refresh();
  }, [router]);

  const handleEditComplete = useCallback((updatedMedia: MediaItem) => {
    setMedia((prev) =>
      prev.map((m) => (m.id === updatedMedia.id ? updatedMedia : m))
    );
    setEditingMedia(null);
  }, []);

  const handleDelete = async (mediaItem: MediaItem) => {
    if (!confirm(`Are you sure you want to delete "${mediaItem.original_filename}"?`)) {
      return;
    }

    setIsDeleting(mediaItem.id);
    try {
      const response = await fetch(`/api/admin/media/${mediaItem.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMedia((prev) => prev.filter((m) => m.id !== mediaItem.id));
        router.refresh();
      } else {
        const result = await response.json();
        alert(result.error || "Failed to delete media");
      }
    } catch {
      alert("Failed to delete media");
    } finally {
      setIsDeleting(null);
    }
  };

  const getStatCount = (type: string) => {
    switch (type) {
      case "image":
        return stats.images;
      case "video":
        return stats.videos;
      case "audio":
        return stats.audio;
      default:
        return stats.total;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Media Library</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsAIGenerateOpen(true)}>
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Image
          </Button>
          <Button onClick={() => setIsUploadOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Type Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          {TYPE_OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => handleTypeChange(option.value)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  currentType === option.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <Icon className="h-4 w-4" />
                {option.label}
                <span className="text-xs opacity-75">
                  ({getStatCount(option.value)})
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & View Mode */}
        <div className="flex items-center gap-2 ml-auto">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-[200px]"
            />
          </form>
          <div className="flex items-center gap-1 border border-border rounded-md p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded ${
                viewMode === "grid"
                  ? "bg-muted"
                  : "hover:bg-muted/50"
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded ${
                viewMode === "list"
                  ? "bg-muted"
                  : "hover:bg-muted/50"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Media Grid/List */}
      {media.length === 0 ? (
        <div className="bg-background rounded-lg border border-border p-12 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Image className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-4">No media found</p>
          <Button onClick={() => setIsUploadOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Upload your first file
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {media.map((item) => (
            <MediaCard
              key={item.id}
              media={item}
              onEdit={() => setEditingMedia(item)}
              onDelete={() => handleDelete(item)}
              isDeleting={isDeleting === item.id}
            />
          ))}
        </div>
      ) : (
        <div className="bg-background rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Preview
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground hidden sm:table-cell">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground hidden md:table-cell">
                  Size
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {media.map((item) => (
                <MediaCard
                  key={item.id}
                  media={item}
                  variant="row"
                  onEdit={() => setEditingMedia(item)}
                  onDelete={() => handleDelete(item)}
                  isDeleting={isDeleting === item.id}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Modal */}
      <MediaUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadComplete={handleUploadComplete}
      />

      {/* Edit Modal */}
      {editingMedia && (
        <MediaEditModal
          media={editingMedia}
          isOpen={!!editingMedia}
          onClose={() => setEditingMedia(null)}
          onSave={handleEditComplete}
        />
      )}

      {/* AI Image Generation Modal */}
      <AIImageModal
        isOpen={isAIGenerateOpen}
        onClose={() => setIsAIGenerateOpen(false)}
        onImageSaved={handleAIImageSaved}
        context="media-library"
      />
    </div>
  );
}
