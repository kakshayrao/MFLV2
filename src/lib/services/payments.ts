// src/lib/services/payments.ts

import { createServerClient } from '@/lib/supabase/server';

export type Payment = {
  id: string;
  league_id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
};

export async function createPayment(leagueId: string, razorpayOrderId: string, amount: number) {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('payments')
    .insert({
      league_id: leagueId,
      razorpay_order_id: razorpayOrderId,
      amount,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    throw new Error('Failed to create payment record');
  }

  return data;
}

export async function updatePaymentStatus(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  status: 'completed' | 'failed'
) {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('payments')
    .update({
      razorpay_payment_id: razorpayPaymentId,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('razorpay_order_id', razorpayOrderId)
    .select()
    .single();

  if (error) {
    throw new Error('Failed to update payment');
  }

  return data;
}

export async function getPaymentByOrderId(orderId: string) {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('razorpay_order_id', orderId)
    .single();

  if (error) {
    console.error('Error fetching payment:', error);
    return null;
  }

  return data;
}
