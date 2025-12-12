// src/app/api/payments/verify/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { verifyPaymentSignature } from '@/lib/razorpay';
import { updatePaymentStatus, getPaymentByOrderId } from '@/lib/services/payments';

export async function POST(req: NextRequest) {
  try {
    const { orderId, paymentId, signature } = await req.json();

    // Verify signature
    if (!verifyPaymentSignature(orderId, paymentId, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Update payment status
    const payment = await updatePaymentStatus(orderId, paymentId, 'completed');

    // Mark league as launched/active if payment successful
    // This can be extended to auto-activate league on payment

    return NextResponse.json({ success: true, payment });
  } catch (err: any) {
    console.error('Payment verification error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
