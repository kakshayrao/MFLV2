// src/app/api/payments/verify/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { verifyPaymentSignature } from '@/lib/razorpay';
import { updatePaymentStatus, getPaymentByOrderId } from '@/lib/services/payments';
import { createServerClient } from '@/lib/supabase/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/config';

export async function POST(req: NextRequest) {
  try {
    const session = (await getServerSession(authOptions as any)) as import('next-auth').Session | null;
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, paymentId, signature } = await req.json();

    // Verify signature
    if (!verifyPaymentSignature(orderId, paymentId, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Update payment status
    const payment = await updatePaymentStatus(orderId, paymentId, 'completed');

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Ensure league membership exists (should already exist from creation, but verify)
    const supabase = createServerClient();
    const { data: existingMember } = await supabase
      .from('leaguemembers')
      .select('league_member_id')
      .eq('league_id', payment.league_id)
      .eq('user_id', session.user.id)
      .maybeSingle();

    // If membership doesn't exist, create it (shouldn't happen, but safety check)
    if (!existingMember) {
      await supabase
        .from('leaguemembers')
        .insert({
          user_id: session.user.id,
          league_id: payment.league_id,
          created_by: session.user.id,
        });
    }

    // League remains is_active=false after payment (as per requirements)
    // Redirect user to edit page where they can set dates and launch
    // Host can activate it later from the edit page

    return NextResponse.json({ 
      success: true, 
      payment,
      redirectUrl: `/leagues/${payment.league_id}/edit?payment=completed`
    });
  } catch (err: any) {
    console.error('Payment verification error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
