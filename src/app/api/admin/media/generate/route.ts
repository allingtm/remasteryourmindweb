import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import {
  type ImagePresetKey,
  type DalleSize,
  getImagePreset,
} from "@/lib/ai/image-presets";
import { type ImageStyleKey, buildStyledPrompt } from "@/lib/ai/image-styles";

let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

export interface GenerateImageRequest {
  prompt: string;
  imageType: ImagePresetKey;
  style?: ImageStyleKey;
  customWidth?: number;
  customHeight?: number;
}

export interface GenerateImageResponse {
  imageUrl: string;
  revisedPrompt: string;
  width: number;
  height: number;
  dalleSize: DalleSize;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as GenerateImageRequest;
    const { prompt, imageType, style = "illustration", customWidth, customHeight } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    if (!imageType) {
      return NextResponse.json(
        { error: "Image type is required" },
        { status: 400 }
      );
    }

    // Get preset configuration
    const preset = getImagePreset(imageType, customWidth, customHeight);

    if (!preset) {
      return NextResponse.json(
        { error: "Invalid image type or missing custom dimensions" },
        { status: 400 }
      );
    }

    // Build styled prompt
    const styledPrompt = buildStyledPrompt(prompt.trim(), style);

    // Generate image with DALL-E 3
    const openai = getOpenAI();
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: styledPrompt,
      n: 1,
      size: preset.dalleSize,
      quality: "standard",
    });

    const imageUrl = imageResponse.data?.[0]?.url;
    const revisedPrompt = imageResponse.data?.[0]?.revised_prompt || styledPrompt;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Failed to generate image" },
        { status: 500 }
      );
    }

    const response: GenerateImageResponse = {
      imageUrl,
      revisedPrompt,
      width: preset.width,
      height: preset.height,
      dalleSize: preset.dalleSize,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error generating image:", error);

    // Handle specific OpenAI errors
    if (error instanceof OpenAI.APIError) {
      if (error.status === 400 && error.message.includes("content_policy")) {
        return NextResponse.json(
          { error: "Your prompt was rejected by content policy. Please try a different description." },
          { status: 400 }
        );
      }
      if (error.status === 429) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please wait a moment and try again." },
          { status: 429 }
        );
      }
    }

    const message =
      error instanceof Error ? error.message : "Failed to generate image";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
