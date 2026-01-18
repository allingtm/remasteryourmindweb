import { createClient } from '../server';
import type { BlogCategory } from '@/types';

export async function getCategories(): Promise<BlogCategory[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('sws2026_blog_categories')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data || [];
}

export async function getNavCategories(): Promise<BlogCategory[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('sws2026_blog_categories')
    .select('*')
    .eq('show_in_nav', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching nav categories:', error);
    return [];
  }

  return data || [];
}

export async function getHomepageCategories(): Promise<BlogCategory[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('sws2026_blog_categories')
    .select('*')
    .eq('show_on_homepage', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching homepage categories:', error);
    return [];
  }

  return data || [];
}

export async function getCategoryBySlug(slug: string): Promise<BlogCategory | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('sws2026_blog_categories')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('Error fetching category:', error);
    return null;
  }

  return data;
}
