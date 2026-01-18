import { createClient } from '../server';
import type { BlogSetting } from '@/types';

export async function getSetting(key: string): Promise<unknown | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('sws2026_blog_settings')
    .select('value')
    .eq('key', key)
    .single();

  if (error) {
    console.error('Error fetching setting:', error);
    return null;
  }

  return data?.value;
}

export async function getAllSettings(): Promise<Record<string, unknown>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('sws2026_blog_settings')
    .select('key, value');

  if (error) {
    console.error('Error fetching settings:', error);
    return {};
  }

  return (data || []).reduce((acc, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {} as Record<string, unknown>);
}
