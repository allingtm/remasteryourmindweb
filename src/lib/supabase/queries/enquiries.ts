import { createClient } from '../server';
import type { Enquiry, EnquiryWithRelations } from '@/types';

const ENQUIRY_SELECT = `
  *,
  survey:sws2026_surveys(*),
  post:sws2026_blog_posts(id, title, slug)
`;

export async function getAllEnquiries(options?: {
  surveyId?: string;
  postId?: string;
  status?: 'new' | 'read' | 'archived';
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}): Promise<{ enquiries: EnquiryWithRelations[]; total: number }> {
  const supabase = await createClient();

  let query = supabase
    .from('sws2026_enquiries')
    .select(ENQUIRY_SELECT, { count: 'exact' });

  if (options?.surveyId) {
    query = query.eq('survey_id', options.surveyId);
  }

  if (options?.postId) {
    query = query.eq('post_id', options.postId);
  }

  if (options?.status) {
    query = query.eq('status', options.status);
  }

  if (options?.dateFrom) {
    query = query.gte('created_at', options.dateFrom);
  }

  if (options?.dateTo) {
    query = query.lte('created_at', options.dateTo);
  }

  query = query.order('created_at', { ascending: false });

  if (options?.limit) {
    const offset = options.offset || 0;
    query = query.range(offset, offset + options.limit - 1);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error('Error fetching enquiries:', error);
    return { enquiries: [], total: 0 };
  }

  return {
    enquiries: (data || []) as EnquiryWithRelations[],
    total: count || 0,
  };
}

export async function getEnquiryById(id: string): Promise<EnquiryWithRelations | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('sws2026_enquiries')
    .select(ENQUIRY_SELECT)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching enquiry:', error);
    return null;
  }

  return data as EnquiryWithRelations;
}

export async function getEnquiryCounts(): Promise<{
  total: number;
  new: number;
  read: number;
  archived: number;
}> {
  const supabase = await createClient();

  const { count: total } = await supabase
    .from('sws2026_enquiries')
    .select('*', { count: 'exact', head: true });

  const { count: newCount } = await supabase
    .from('sws2026_enquiries')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'new');

  const { count: readCount } = await supabase
    .from('sws2026_enquiries')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'read');

  const { count: archivedCount } = await supabase
    .from('sws2026_enquiries')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'archived');

  return {
    total: total || 0,
    new: newCount || 0,
    read: readCount || 0,
    archived: archivedCount || 0,
  };
}

export async function getRecentEnquiries(limit: number = 5): Promise<EnquiryWithRelations[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('sws2026_enquiries')
    .select(ENQUIRY_SELECT)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent enquiries:', error);
    return [];
  }

  return (data || []) as EnquiryWithRelations[];
}
