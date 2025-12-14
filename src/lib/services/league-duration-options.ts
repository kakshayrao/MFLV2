/**
 * League Duration Options Service
 * Handles admin-configurable league duration options
 */

import { getSupabase } from '@/lib/supabase/client';
import { createServerClient } from '@/lib/supabase/server';

export interface LeagueDurationOption {
  id: string;
  duration_days: number;
  display_name: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Get all active league duration options
 * @returns Array of active duration options
 */
export async function getActiveDurationOptions(): Promise<LeagueDurationOption[]> {
  try {
    const { data, error } = await getSupabase()
      .from('league_duration_options')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching duration options:', error);
      return [];
    }

    return data as LeagueDurationOption[];
  } catch (err) {
    console.error('Error in getActiveDurationOptions:', err);
    return [];
  }
}

/**
 * Get all league duration options (admin only)
 * @returns Array of all duration options
 */
export async function getAllDurationOptions(): Promise<LeagueDurationOption[]> {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('league_duration_options')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching all duration options:', error);
      return [];
    }

    return data as LeagueDurationOption[];
  } catch (err) {
    console.error('Error in getAllDurationOptions:', err);
    return [];
  }
}

/**
 * Create a new duration option (admin only)
 */
export async function createDurationOption(
  durationDays: number,
  displayName: string,
  displayOrder: number = 0
): Promise<LeagueDurationOption | null> {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('league_duration_options')
      .insert({
        duration_days: durationDays,
        display_name: displayName,
        is_active: true,
        display_order: displayOrder,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating duration option:', error);
      return null;
    }

    return data as LeagueDurationOption;
  } catch (err) {
    console.error('Error in createDurationOption:', err);
    return null;
  }
}

/**
 * Update a duration option (admin only)
 */
export async function updateDurationOption(
  id: string,
  updates: Partial<{
    duration_days: number;
    display_name: string;
    is_active: boolean;
    display_order: number;
  }>
): Promise<LeagueDurationOption | null> {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('league_duration_options')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating duration option:', error);
      return null;
    }

    return data as LeagueDurationOption;
  } catch (err) {
    console.error('Error in updateDurationOption:', err);
    return null;
  }
}

/**
 * Delete a duration option (admin only)
 */
export async function deleteDurationOption(id: string): Promise<boolean> {
  try {
    const supabase = createServerClient();
    const { error } = await supabase
      .from('league_duration_options')
      .delete()
      .eq('id', id);

    return !error;
  } catch (err) {
    console.error('Error in deleteDurationOption:', err);
    return false;
  }
}

