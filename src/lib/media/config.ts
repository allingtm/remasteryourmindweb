export const MEDIA_CONFIG = {
  maxFileSize: 50 * 1024 * 1024, // 50MB
  bucket: "media",
  allowedTypes: {
    image: [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ],
    video: ["video/mp4", "video/webm", "video/ogg"],
    audio: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/webm"],
  },
  acceptString: {
    image: "image/jpeg,image/png,image/gif,image/webp,image/svg+xml",
    video: "video/mp4,video/webm,video/ogg",
    audio: "audio/mpeg,audio/wav,audio/ogg,audio/webm",
    all: "image/jpeg,image/png,image/gif,image/webp,image/svg+xml,video/mp4,video/webm,video/ogg,audio/mpeg,audio/wav,audio/ogg,audio/webm",
  },
} as const;

export type MediaFileType = "image" | "video" | "audio";

export function getFileType(mimeType: string): MediaFileType | null {
  if (MEDIA_CONFIG.allowedTypes.image.includes(mimeType as never)) {
    return "image";
  }
  if (MEDIA_CONFIG.allowedTypes.video.includes(mimeType as never)) {
    return "video";
  }
  if (MEDIA_CONFIG.allowedTypes.audio.includes(mimeType as never)) {
    return "audio";
  }
  return null;
}

export function isAllowedFileType(mimeType: string): boolean {
  return getFileType(mimeType) !== null;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function generateStoragePath(
  fileType: MediaFileType,
  filename: string
): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${fileType}s/${year}/${month}/${filename}`;
}
