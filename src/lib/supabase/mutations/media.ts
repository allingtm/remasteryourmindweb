import { createClient } from "../server";
import type { MediaItem } from "@/types";

export interface CreateMediaData {
  filename: string;
  original_filename: string;
  storage_path: string;
  public_url: string;
  file_type: "image" | "video" | "audio";
  mime_type: string;
  file_size: number;
  width?: number;
  height?: number;
  duration?: number;
  alt_text?: string;
  caption?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  uploaded_by?: string;
}

export interface UpdateMediaData {
  id: string;
  alt_text?: string;
  caption?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export async function createMedia(
  data: CreateMediaData
): Promise<{ media: MediaItem | null; error: string | null }> {
  const supabase = await createClient();

  const { data: media, error } = await supabase
    .from("sws2026_media")
    .insert({
      ...data,
      tags: data.tags || [],
      metadata: data.metadata || {},
    })
    .select()
    .single();

  if (error) {
    return { media: null, error: error.message };
  }

  return { media: media as MediaItem, error: null };
}

export async function updateMedia(
  data: UpdateMediaData
): Promise<{ media: MediaItem | null; error: string | null }> {
  const supabase = await createClient();
  const { id, ...updateData } = data;

  const { data: media, error } = await supabase
    .from("sws2026_media")
    .update({ ...updateData, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { media: null, error: error.message };
  }

  return { media: media as MediaItem, error: null };
}

export async function deleteMedia(
  id: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  // First get the media to get the storage path
  const { data: media } = await supabase
    .from("sws2026_media")
    .select("storage_path")
    .eq("id", id)
    .single();

  if (media?.storage_path) {
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from("media")
      .remove([media.storage_path]);

    if (storageError) {
      console.error("Error deleting from storage:", storageError);
      // Continue to delete from database even if storage delete fails
    }
  }

  // Delete from database
  const { error } = await supabase
    .from("sws2026_media")
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

export async function bulkDeleteMedia(
  ids: string[]
): Promise<{ success: boolean; deletedCount: number; error: string | null }> {
  const supabase = await createClient();

  // Get all storage paths
  const { data: mediaItems } = await supabase
    .from("sws2026_media")
    .select("storage_path")
    .in("id", ids);

  if (mediaItems && mediaItems.length > 0) {
    const paths = mediaItems.map((m) => m.storage_path).filter(Boolean);
    if (paths.length > 0) {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("media")
        .remove(paths);

      if (storageError) {
        console.error("Error bulk deleting from storage:", storageError);
      }
    }
  }

  // Delete from database
  const { error } = await supabase
    .from("sws2026_media")
    .delete()
    .in("id", ids);

  if (error) {
    return { success: false, deletedCount: 0, error: error.message };
  }

  return { success: true, deletedCount: ids.length, error: null };
}
