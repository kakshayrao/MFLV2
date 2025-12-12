// src/lib/services/pricing.ts

import { createServerClient } from '@/lib/supabase/server';

export type Pricing = {
  id: string;
  base_price: number;
  platform_fee: number;
  gst_percentage: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export async function getPricing(): Promise<Pricing | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('pricing')
    .select('*')
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error fetching pricing:', error);
    return null;
  }

  return data;
}

export async function updatePricing(userId: string, pricing: Partial<Pricing>) {
  const supabase = createServerClient();

  // Verify user is admin
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  if (userError || user?.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase
    .from('pricing')
    .update({
      ...pricing,
      updated_at: new Date().toISOString(),
    })
    .eq('is_active', true)
    .select()
    .single();

  if (error) {
    throw new Error('Failed to update pricing');
  }

  return data;
}

export async function calculateTotal(basePrice: number, platformFee: number, gstPercentage: number) {
  const subtotal = basePrice + platformFee;
  const gst = subtotal * (gstPercentage / 100);
  const total = subtotal + gst;
  return { subtotal, gst, total };
}
