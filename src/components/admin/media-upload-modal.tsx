"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { X, Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MEDIA_CONFIG, formatFileSize, isAllowedFileType } from "@/lib/media/config";
import type { MediaItem } from "@/types";

interface MediaUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: (media: MediaItem) => void;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "complete" | "error";
  error?: string;
  altText: string;
  tags: string;
}

export function MediaUploadModal({
  isOpen,
  onClose,
  onUploadComplete,
}: MediaUploadModalProps) {
  const [files, setFiles] = useState<UploadingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles
      .filter((file) => {
        if (!isAllowedFileType(file.type)) {
          alert(`File type ${file.type} is not allowed`);
          return false;
        }
        if (file.size > MEDIA_CONFIG.maxFileSize) {
          alert(`File ${file.name} exceeds 50MB limit`);
          return false;
        }
        return true;
      })
      .map((file) => ({
        file,
        progress: 0,
        status: "pending" as const,
        altText: "",
        tags: "",
      }));

    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"],
      "video/*": [".mp4", ".webm", ".ogg"],
      "audio/*": [".mp3", ".wav", ".ogg", ".webm"],
    },
    maxSize: MEDIA_CONFIG.maxFileSize,
  });

  const updateFile = (index: number, updates: Partial<UploadingFile>) => {
    setFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, ...updates } : f))
    );
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    setIsUploading(true);

    for (let i = 0; i < files.length; i++) {
      const uploadFile = files[i];
      if (uploadFile.status !== "pending") continue;

      updateFile(i, { status: "uploading", progress: 10 });

      try {
        const formData = new FormData();
        formData.append("file", uploadFile.file);
        if (uploadFile.altText) {
          formData.append("alt_text", uploadFile.altText);
        }
        if (uploadFile.tags) {
          formData.append("tags", uploadFile.tags);
        }

        updateFile(i, { progress: 50 });

        const response = await fetch("/api/admin/media", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || "Upload failed");
        }

        const { media } = await response.json();
        updateFile(i, { status: "complete", progress: 100 });
        onUploadComplete(media);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Upload failed";
        updateFile(i, { status: "error", error: message });
      }
    }

    setIsUploading(false);
  };

  const handleClose = () => {
    if (isUploading) return;
    setFiles([]);
    onClose();
  };

  const pendingCount = files.filter((f) => f.status === "pending").length;
  const completedCount = files.filter((f) => f.status === "complete").length;

  if (!isOpen) return null;

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
          <h2 className="text-lg font-semibold">Upload Media</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            disabled={isUploading}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-primary">Drop files here...</p>
            ) : (
              <>
                <p className="text-foreground font-medium mb-1">
                  Drag and drop files here
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to select files
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Images, videos, and audio up to 50MB each
                </p>
              </>
            )}
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">
                  Files ({completedCount}/{files.length} uploaded)
                </h3>
                {!isUploading && pendingCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFiles([])}
                  >
                    Clear all
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                {files.map((uploadFile, index) => (
                  <div
                    key={index}
                    className="border border-border rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {uploadFile.status === "complete" && (
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          )}
                          {uploadFile.status === "error" && (
                            <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                          )}
                          {uploadFile.status === "uploading" && (
                            <Loader2 className="h-4 w-4 animate-spin text-primary flex-shrink-0" />
                          )}
                          <p className="font-medium truncate">
                            {uploadFile.file.name}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(uploadFile.file.size)}
                        </p>
                        {uploadFile.error && (
                          <p className="text-sm text-destructive mt-1">
                            {uploadFile.error}
                          </p>
                        )}
                      </div>

                      {uploadFile.status === "pending" && !isUploading && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {/* Metadata inputs for pending files */}
                    {uploadFile.status === "pending" && (
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div>
                          <Label htmlFor={`alt-${index}`} className="text-xs">
                            Alt text
                          </Label>
                          <Input
                            id={`alt-${index}`}
                            value={uploadFile.altText}
                            onChange={(e) =>
                              updateFile(index, { altText: e.target.value })
                            }
                            placeholder="Describe this media"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`tags-${index}`} className="text-xs">
                            Tags (comma-separated)
                          </Label>
                          <Input
                            id={`tags-${index}`}
                            value={uploadFile.tags}
                            onChange={(e) =>
                              updateFile(index, { tags: e.target.value })
                            }
                            placeholder="hero, product, team"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    )}

                    {/* Progress bar */}
                    {uploadFile.status === "uploading" && (
                      <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${uploadFile.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            {completedCount === files.length && files.length > 0
              ? "Done"
              : "Cancel"}
          </Button>
          {pendingCount > 0 && (
            <Button onClick={uploadFiles} disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload {pendingCount} file{pendingCount !== 1 ? "s" : ""}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
