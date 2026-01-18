import { createClient } from '../server';
import type { HelpOption } from '@/types';

interface CreateHelpOptionInput {
  text: string;
  description?: string;
  post_id: string;
  display_order?: number;
  is_active?: boolean;
  icon?: string;
  color?: string;
}

interface UpdateHelpOptionInput {
  text?: string;
  description?: string | null;
  post_id?: string;
  display_order?: number;
  is_active?: boolean;
  icon?: string | null;
  color?: string | null;
}

/**
 * Create a new help option
 */
export async function createHelpOption(input: CreateHelpOptionInput): Promise<{ helpOption: HelpOption | null; error: string | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('sws2026_help_options')
    .insert({
      text: input.text,
      description: input.description || null,
      post_id: input.post_id,
      display_order: input.display_order ?? 0,
      is_active: input.is_active ?? true,
      icon: input.icon || null,
      color: input.color || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating help option:', error);
    return { helpOption: null, error: error.message };
  }

  return { helpOption: data as HelpOption, error: null };
}

/**
 * Update an existing help option
 */
export async function updateHelpOption(id: string, input: UpdateHelpOptionInput): Promise<{ helpOption: HelpOption | null; error: string | null }> {
  const supabase = await createClient();

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.text !== undefined) updateData.text = input.text;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.post_id !== undefined) updateData.post_id = input.post_id;
  if (input.display_order !== undefined) updateData.display_order = input.display_order;
  if (input.is_active !== undefined) updateData.is_active = input.is_active;
  if (input.icon !== undefined) updateData.icon = input.icon;
  if (input.color !== undefined) updateData.color = input.color;

  const { data, error } = await supabase
    .from('sws2026_help_options')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating help option:', error);
    return { helpOption: null, error: error.message };
  }

  return { helpOption: data as HelpOption, error: null };
}

/**
 * Delete a help option
 */
export async function deleteHelpOption(id: string): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('sws2026_help_options')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting help option:', error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

/**
 * Reorder help options by updating display_order
 */
export async function reorderHelpOptions(orderedIds: string[]): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  try {
    // Update display_order for each ID based on array position
    const updates = orderedIds.map((id, index) =>
      supabase
        .from('sws2026_help_options')
        .update({ display_order: index, updated_at: new Date().toISOString() })
        .eq('id', id)
    );

    await Promise.all(updates);
    return { success: true, error: null };
  } catch (error) {
    console.error('Error reordering help options:', error);
    return { success: false, error: 'Failed to reorder options' };
  }
}

/**
 * Toggle help option active status
 */
export async function toggleHelpOptionActive(id: string, isActive: boolean): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('sws2026_help_options')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error toggling help option status:', error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}
