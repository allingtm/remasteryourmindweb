import { createClient } from '../server';
import type { BlogPost, BlogPostWithRelations, BlogAuthor, BlogCategory, BlogTag, BlogFaq } from '@/types';

const POST_SELECT = `
  *,
  author:sws2026_blog_authors(*),
  category:sws2026_blog_categories(*),
  tags:sws2026_blog_post_tags(
    tag:sws2026_blog_tags(*)
  ),
  faqs:sws2026_blog_faqs(*),
  survey:sws2026_surveys(*)
`;

function transformPost(data: any): BlogPostWithRelations {
  return {
    ...data,
    author: data.author,
    category: data.category,
    tags: data.tags?.map((t: any) => t.tag).filter(Boolean) || [],
    faqs: data.faqs || [],
    survey: data.survey || null,
  };
}

export async function getFeaturedPosts(limit: number = 3): Promise<BlogPostWithRelations[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('sws2026_blog_posts')
    .select(POST_SELECT)
    .eq('status', 'published')
    .eq('is_featured', true)
    .eq('is_lead_article', false)
    .lte('published_at', new Date().toISOString())
    .order('featured_order', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Error fetching featured posts:', error);
    return [];
  }

  return (data || []).map(transformPost);
}

export async function getLatestPosts(limit: number = 12, offset: number = 0): Promise<BlogPostWithRelations[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('sws2026_blog_posts')
    .select(POST_SELECT)
    .eq('status', 'published')
    .eq('is_lead_article', false)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching latest posts:', error);
    return [];
  }

  return (data || []).map(transformPost);
}

export async function getPostsByCategory(categoryId: string, limit: number = 4): Promise<BlogPostWithRelations[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('sws2026_blog_posts')
    .select(POST_SELECT)
    .eq('status', 'published')
    .eq('category_id', categoryId)
    .eq('is_lead_article', false)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching posts by category:', error);
    return [];
  }

  return (data || []).map(transformPost);
}

export async function getPostsByCategorySlug(slug: string, limit: number = 12, offset: number = 0): Promise<BlogPostWithRelations[]> {
  const supabase = await createClient();

  // First get the category
  const { data: category } = await supabase
    .from('sws2026_blog_categories')
    .select('id')
    .eq('slug', slug)
    .single();

  if (!category) return [];

  const { data, error } = await supabase
    .from('sws2026_blog_posts')
    .select(POST_SELECT)
    .eq('status', 'published')
    .eq('category_id', category.id)
    .eq('is_lead_article', false)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching posts by category slug:', error);
    return [];
  }

  return (data || []).map(transformPost);
}

export async function getPostsByTagSlug(slug: string, limit: number = 12, offset: number = 0): Promise<BlogPostWithRelations[]> {
  const supabase = await createClient();

  // First get the tag
  const { data: tag } = await supabase
    .from('sws2026_blog_tags')
    .select('id')
    .eq('slug', slug)
    .single();

  if (!tag) return [];

  // Get post IDs that have this tag
  const { data: postTags } = await supabase
    .from('sws2026_blog_post_tags')
    .select('post_id')
    .eq('tag_id', tag.id);

  if (!postTags || postTags.length === 0) return [];

  const postIds = postTags.map(pt => pt.post_id);

  const { data, error } = await supabase
    .from('sws2026_blog_posts')
    .select(POST_SELECT)
    .eq('status', 'published')
    .eq('is_lead_article', false)
    .in('id', postIds)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching posts by tag slug:', error);
    return [];
  }

  return (data || []).map(transformPost);
}

export async function getPostBySlug(slug: string): Promise<BlogPostWithRelations | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('sws2026_blog_posts')
    .select(POST_SELECT)
    .eq('slug', slug)
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .single();

  if (error) {
    console.error('Error fetching post:', error);
    return null;
  }

  return data ? transformPost(data) : null;
}

export async function getRelatedPosts(postId: string, limit: number = 3): Promise<BlogPostWithRelations[]> {
  const supabase = await createClient();

  // Get related post IDs
  const { data: relatedIds } = await supabase
    .from('sws2026_blog_related_posts')
    .select('related_post_id')
    .eq('post_id', postId)
    .order('relevance_score', { ascending: false })
    .limit(limit);

  if (!relatedIds || relatedIds.length === 0) return [];

  const ids = relatedIds.map(r => r.related_post_id);

  const { data, error } = await supabase
    .from('sws2026_blog_posts')
    .select(POST_SELECT)
    .eq('status', 'published')
    .eq('is_lead_article', false)
    .in('id', ids)
    .lte('published_at', new Date().toISOString());

  if (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }

  return (data || []).map(transformPost);
}

export async function getAllPostSlugs(): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('sws2026_blog_posts')
    .select('slug')
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString());

  if (error) {
    console.error('Error fetching post slugs:', error);
    return [];
  }

  return (data || []).map(p => p.slug);
}

export async function getPostsCount(): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from('sws2026_blog_posts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')
    .eq('is_lead_article', false)
    .lte('published_at', new Date().toISOString());

  if (error) {
    console.error('Error fetching posts count:', error);
    return 0;
  }

  return count || 0;
}
