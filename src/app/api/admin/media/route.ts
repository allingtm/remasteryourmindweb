import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAllMedia, getMediaStats } from "@/lib/supabase/queries/media";
import { createMedia } from "@/lib/supabase/mutations/media";
import {
  MEDIA_CONFIG,
  getFileType,
  isAllowedFileType,
  generateStoragePath,
} from "@/lib/media/config";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") as "image" | "video" | "audio" | null;
    const search = searchParams.get("search") || undefined;
    const tagsParam = searchParams.get("tags");
    const tags = tagsParam ? tagsParam.split(",") : undefined;
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const includeStats = searchParams.get("stats") === "true";

    const media = await getAllMedia({
      type: type || undefined,
      search,
      tags,
      limit,
      offset,
    });

    const response: { media: typeof media; stats?: Awaited<ReturnType<typeof getMediaStats>> } = { media };

    if (includeStats) {
      response.stats = await getMediaStats();
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 }
    );
  }
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

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const altText = formData.get("alt_text") as string | null;
    const caption = formData.get("caption") as string | null;
    const tagsString = formData.get("tags") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!isAllowedFileType(file.type)) {
      return NextResponse.json(
        { error: `File type ${file.type} is not allowed` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MEDIA_CONFIG.maxFileSize) {
      return NextResponse.json(
        { error: `File size exceeds maximum of 50MB` },
        { status: 400 }
      );
    }

    const fileType = getFileType(file.type)!;
    const fileExt = file.name.split(".").pop() || "";
    const uniqueFilename = `${uuidv4()}.${fileExt}`;
    const storagePath = generateStoragePath(fileType, uniqueFilename);

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(MEDIA_CONFIG.bucket)
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file to storage" },
        { status: 500 }
      );
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(MEDIA_CONFIG.bucket).getPublicUrl(storagePath);

    // Parse tags
    const tags = tagsString
      ? tagsString.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    // Create database record
    const { media, error } = await createMedia({
      filename: uniqueFilename,
      original_filename: file.name,
      storage_path: storagePath,
      public_url: publicUrl,
      file_type: fileType,
      mime_type: file.type,
      file_size: file.size,
      alt_text: altText || undefined,
      caption: caption || undefined,
      tags,
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
    console.error("Error uploading media:", error);
    const message =
      error instanceof Error ? error.message : "Failed to upload media";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
