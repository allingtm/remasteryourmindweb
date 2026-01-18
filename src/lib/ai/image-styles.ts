// Style presets for AI image generation
// These suffixes are appended to user prompts to guide DALL-E's artistic direction

export type ImageStyleKey =
  | "illustration"
  | "photo"
  | "3d"
  | "abstract"
  | "minimal"
  | "flat"
  | "watercolor";

export interface ImageStyle {
  name: string;
  description: string;
  suffix: string;
}

export const IMAGE_STYLES: Record<ImageStyleKey, ImageStyle> = {
  illustration: {
    name: "Professional Illustration",
    description: "Clean digital art with professional aesthetics",
    suffix:
      "Modern digital illustration, clean lines, professional look, minimalist composition, suitable for tech and business",
  },
  photo: {
    name: "Photorealistic",
    description: "High-quality photography style",
    suffix:
      "Photorealistic, high quality, professional photography, sharp focus, natural lighting, 8k resolution",
  },
  "3d": {
    name: "3D Render",
    description: "Soft 3D rendered graphics",
    suffix:
      "3D rendered, soft lighting, modern aesthetic, clean background, professional product visualization",
  },
  abstract: {
    name: "Abstract Art",
    description: "Bold colors and creative compositions",
    suffix:
      "Abstract art, artistic, bold vibrant colors, creative composition, modern art style, expressive",
  },
  minimal: {
    name: "Minimalist",
    description: "Simple shapes and clean backgrounds",
    suffix:
      "Minimalist design, simple geometric shapes, clean white background, negative space, elegant simplicity",
  },
  flat: {
    name: "Flat Design",
    description: "Modern flat illustration style",
    suffix:
      "Flat design illustration, vector art style, bold solid colors, no gradients, modern UI aesthetic",
  },
  watercolor: {
    name: "Watercolor",
    description: "Soft watercolor painting style",
    suffix:
      "Watercolor painting style, soft edges, pastel colors, artistic brush strokes, gentle blending",
  },
};

/**
 * Build the full prompt with style suffix
 */
export function buildStyledPrompt(userPrompt: string, styleKey: ImageStyleKey): string {
  const style = IMAGE_STYLES[styleKey];
  return `${userPrompt}. ${style.suffix}`;
}

/**
 * Get style options for UI select
 */
export function getStyleOptions(): Array<{ value: ImageStyleKey; label: string; description: string }> {
  return Object.entries(IMAGE_STYLES).map(([key, style]) => ({
    value: key as ImageStyleKey,
    label: style.name,
    description: style.description,
  }));
}
