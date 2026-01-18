import { createClient } from '../server';
import type { BlogTag } from '@/types';

export async function getAllTags(): Promise<BlogTag[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('sws2026_blog_tags')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching tags:', error);
    return [];
  }

  return data || [];
}

export async function getTagBySlug(slug: string): Promise<BlogTag | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('sws2026_blog_tags')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching tag:', error);
    return null;
  }

  return data;
}
