import { createClient } from '../server';
import type { Survey } from '@/types';

export async function getAllSurveys(options?: {
  status?: 'active' | 'inactive';
  limit?: number;
  offset?: number;
}): Promise<{ surveys: Survey[]; total: number }> {
  const supabase = await createClient();

  let query = supabase
    .from('sws2026_surveys')
    .select('*', { count: 'exact' });

  if (options?.status) {
    query = query.eq('status', options.status);
  }

  query = query.order('created_at', { ascending: false });

  if (options?.limit) {
    const offset = options.offset || 0;
    query = query.range(offset, offset + options.limit - 1);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error('Error fetching surveys:', error);
    return { surveys: [], total: 0 };
  }

  return {
    surveys: data || [],
    total: count || 0,
  };
}

export async function getSurveyById(id: string): Promise<Survey | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('sws2026_surveys')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching survey:', error);
    return null;
  }

  return data;
}

export async function getSurveyBySlug(slug: string): Promise<Survey | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('sws2026_surveys')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching survey by slug:', error);
    return null;
  }

  return data;
}

export async function getActiveSurveys(): Promise<Survey[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('sws2026_surveys')
    .select('*')
    .eq('status', 'active')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching active surveys:', error);
    return [];
  }

  return data || [];
}

export async function getSurveyCounts(): Promise<{
  total: number;
  active: number;
  inactive: number;
}> {
  const supabase = await createClient();

  const { count: total } = await supabase
    .from('sws2026_surveys')
    .select('*', { count: 'exact', head: true });

  const { count: active } = await supabase
    .from('sws2026_surveys')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  return {
    total: total || 0,
    active: active || 0,
    inactive: (total || 0) - (active || 0),
  };
}
