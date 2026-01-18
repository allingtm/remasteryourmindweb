import { createClient } from '../server';
import type { HelpOption, HelpOptionWithPost, BlogPost } from '@/types';

/**
 * Get active help options for homepage display
 * Returns only active options ordered by display_order
 */
export async function getActiveHelpOptions(): Promise<HelpOptionWithPost[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('sws2026_help_options')
    .select(`
      *,
      post:sws2026_blog_posts(id, slug, title)
    `)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching active help options:', error);
    return [];
  }

  return (data || []) as HelpOptionWithPost[];
}

/**
 * Get all help options for admin panel
 * Returns all options (active and inactive) ordered by display_order
 */
export async function getAllHelpOptions(): Promise<HelpOptionWithPost[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('sws2026_help_options')
    .select(`
      *,
      post:sws2026_blog_posts(id, slug, title)
    `)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching all help options:', error);
    return [];
  }

  return (data || []) as HelpOptionWithPost[];
}

/**
 * Get a single help option by ID
 */
export async function getHelpOptionById(id: string): Promise<HelpOptionWithPost | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('sws2026_help_options')
    .select(`
      *,
      post:sws2026_blog_posts(id, slug, title)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching help option:', error);
    return null;
  }

  return data as HelpOptionWithPost;
}

/**
 * Get help option counts for admin dashboard
 */
export async function getHelpOptionCounts(): Promise<{ total: number; active: number; inactive: number }> {
  const supabase = await createClient();

  const { data: options } = await supabase
    .from('sws2026_help_options')
    .select('is_active');

  const counts = {
    total: options?.length || 0,
    active: options?.filter(o => o.is_active).length || 0,
    inactive: options?.filter(o => !o.is_active).length || 0,
  };

  return counts;
}

/**
 * Get all lead articles for dropdown in help option form
 * Returns only published posts marked as lead articles
 */
export async function getLeadArticles(): Promise<Pick<BlogPost, 'id' | 'slug' | 'title'>[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('sws2026_blog_posts')
    .select('id, slug, title')
    .eq('status', 'published')
    .eq('is_lead_article', true)
    .order('title', { ascending: true });

  if (error) {
    console.error('Error fetching lead articles:', error);
    return [];
  }

  return data || [];
}

/**
 * Get all published posts for dropdown (used when creating lead articles)
 */
export async function getAllPublishedPosts(): Promise<Pick<BlogPost, 'id' | 'slug' | 'title' | 'is_lead_article'>[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('sws2026_blog_posts')
    .select('id, slug, title, is_lead_article')
    .eq('status', 'published')
    .order('title', { ascending: true });

  if (error) {
    console.error('Error fetching published posts:', error);
    return [];
  }

  return data || [];
}
