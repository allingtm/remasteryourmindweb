import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createMedia } from "@/lib/supabase/mutations/media";
import { MEDIA_CONFIG, generateStoragePath } from "@/lib/media/config";
import { v4 as uuidv4 } from "uuid";
import type { ImagePresetKey } from "@/lib/ai/image-presets";

export interface SaveGeneratedImageRequest {
  imageUrl: string;
  prompt: string;
  revisedPrompt?: string;
  imageType: ImagePresetKey;
  width: number;
  height: number;
  altText?: string;
  caption?: string;
  tags?: string[];
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

    const body = (await request.json()) as SaveGeneratedImageRequest;
    const {
      imageUrl,
      prompt,
      revisedPrompt,
      imageType,
      width,
      height,
      altText,
      caption,
      tags = [],
    } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    // Fetch the image from OpenAI's temporary URL
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch generated image. It may have expired." },
        { status: 400 }
      );
    }

    const imageBuffer = await imageResponse.arrayBuffer();

    // Generate unique filename
    const uniqueFilename = `${uuidv4()}.png`;
    const storagePath = generateStoragePath("image", uniqueFilename);

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(MEDIA_CONFIG.bucket)
      .upload(storagePath, imageBuffer, {
        contentType: "image/png",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload image to storage" },
        { status: 500 }
      );
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(MEDIA_CONFIG.bucket).getPublicUrl(storagePath);

    // Generate original filename based on prompt
    const sanitizedPrompt = prompt
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 50);
    const originalFilename = `ai-generated-${imageType}-${sanitizedPrompt}.png`;

    // Create database record with AI metadata
    const { media, error } = await createMedia({
      filename: uniqueFilename,
      original_filename: originalFilename,
      storage_path: storagePath,
      public_url: publicUrl,
      file_type: "image",
      mime_type: "image/png",
      file_size: imageBuffer.byteLength,
      width,
      height,
      alt_text: altText || undefined,
      caption: caption || undefined,
      tags: ["ai-generated", `${imageType}-image`, ...tags],
      metadata: {
        ai_generated: true,
        ai_model: "dall-e-3",
        original_prompt: prompt,
        revised_prompt: revisedPrompt,
        image_type: imageType,
        generated_at: new Date().toISOString(),
      },
      uploaded_by: user.id,
    });

    if (error || !media) {
      // Try to clean up the uploaded file
      await supabase.storage.from(MEDIA_CONFIG.bucket).remove([storagePath]);
      return NextResponse.json(
        { error: error || "Failed to create media record" },
        { status: 500 }
      );
    }

    return NextResponse.json({ media }, { status: 201 });
  } catch (error) {
    console.error("Error saving generated image:", error);
    const message =
      error instanceof Error ? error.message : "Failed to save image";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
