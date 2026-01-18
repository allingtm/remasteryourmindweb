// Image preset configurations for AI image generation
// Maps target dimensions to closest DALL-E 3 supported sizes

export type ImagePresetKey = "og" | "hero" | "square" | "infographic" | "custom";

export type DalleSize = "1024x1024" | "1792x1024" | "1024x1792";

export interface ImagePreset {
  name: string;
  description: string;
  width: number;
  height: number;
  dalleSize: DalleSize;
  aspectRatio: "landscape" | "portrait" | "square";
}

export const IMAGE_PRESETS: Record<Exclude<ImagePresetKey, "custom">, ImagePreset> = {
  og: {
    name: "OG Image",
    description: "Social sharing preview (1200×630)",
    width: 1200,
    height: 630,
    dalleSize: "1792x1024",
    aspectRatio: "landscape",
  },
  hero: {
    name: "Blog Hero",
    description: "Full-width featured image (1920×1080)",
    width: 1920,
    height: 1080,
    dalleSize: "1792x1024",
    aspectRatio: "landscape",
  },
  square: {
    name: "Square",
    description: "Instagram/social post (1080×1080)",
    width: 1080,
    height: 1080,
    dalleSize: "1024x1024",
    aspectRatio: "square",
  },
  infographic: {
    name: "Infographic",
    description: "Tall format for data (800×2000)",
    width: 800,
    height: 2000,
    dalleSize: "1024x1792",
    aspectRatio: "portrait",
  },
};

/**
 * Get the best DALL-E size for custom dimensions
 */
export function getDalleSizeForDimensions(width: number, height: number): DalleSize {
  const aspectRatio = width / height;

  if (aspectRatio > 1.3) {
    // Landscape
    return "1792x1024";
  } else if (aspectRatio < 0.77) {
    // Portrait
    return "1024x1792";
  } else {
    // Square-ish
    return "1024x1024";
  }
}

/**
 * Get preset by key, or calculate for custom dimensions
 */
export function getImagePreset(
  presetKey: ImagePresetKey,
  customWidth?: number,
  customHeight?: number
): ImagePreset {
  if (presetKey === "custom" && customWidth && customHeight) {
    const dalleSize = getDalleSizeForDimensions(customWidth, customHeight);
    const aspectRatio =
      customWidth > customHeight * 1.3
        ? "landscape"
        : customWidth < customHeight * 0.77
          ? "portrait"
          : "square";

    return {
      name: "Custom",
      description: `Custom size (${customWidth}×${customHeight})`,
      width: customWidth,
      height: customHeight,
      dalleSize,
      aspectRatio,
    };
  }

  return IMAGE_PRESETS[presetKey as Exclude<ImagePresetKey, "custom">];
}

/**
 * Parse DALL-E size string to dimensions
 */
export function parseDalleSize(size: DalleSize): { width: number; height: number } {
  const [width, height] = size.split("x").map(Number);
  return { width, height };
}
