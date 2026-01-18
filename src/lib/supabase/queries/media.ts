import { createClient } from '../server';
import type { MediaItem } from '@/types';

export interface MediaQueryOptions {
  type?: 'image' | 'video' | 'audio';
  search?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export async function getAllMedia(options: MediaQueryOptions = {}): Promise<MediaItem[]> {
  const supabase = await createClient();
  const { type, search, tags, limit = 50, offset = 0 } = options;

  let query = supabase
    .from('sws2026_media')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (type) {
    query = query.eq('file_type', type);
  }

  if (search) {
    query = query.or(`filename.ilike.%${search}%,original_filename.ilike.%${search}%,alt_text.ilike.%${search}%`);
  }

  if (tags && tags.length > 0) {
    query = query.overlaps('tags', tags);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching media:', error);
    return [];
  }

  return data || [];
}

export async function getMediaById(id: string): Promise<MediaItem | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('sws2026_media')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching media by id:', error);
    return null;
  }

  return data;
}

export async function getMediaByIds(ids: string[]): Promise<MediaItem[]> {
  if (ids.length === 0) return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('sws2026_media')
    .select('*')
    .in('id', ids);

  if (error) {
    console.error('Error fetching media by ids:', error);
    return [];
  }

  // Preserve order of input ids
  const mediaMap = new Map(data?.map(m => [m.id, m]) || []);
  return ids.map(id => mediaMap.get(id)).filter((m): m is MediaItem => m !== undefined);
}

export async function getMediaCount(type?: 'image' | 'video' | 'audio'): Promise<number> {
  const supabase = await createClient();

  let query = supabase
    .from('sws2026_media')
    .select('*', { count: 'exact', head: true });

  if (type) {
    query = query.eq('file_type', type);
  }

  const { count, error } = await query;

  if (error) {
    console.error('Error fetching media count:', error);
    return 0;
  }

  return count || 0;
}

export async function getMediaStats(): Promise<{ total: number; images: number; videos: number; audio: number }> {
  const [total, images, videos, audio] = await Promise.all([
    getMediaCount(),
    getMediaCount('image'),
    getMediaCount('video'),
    getMediaCount('audio'),
  ]);

  return { total, images, videos, audio };
}
