// src/app/api/payments/order/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createOrder } from '@/lib/razorpay';
import { createPayment } from '@/lib/services/payments';
import { getPricing } from '@/lib/services/pricing';
import { getServerSession } from 'next-auth/next';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { leagueId } = await req.json();
    if (!leagueId) {
      return NextResponse.json({ error: 'League ID is required' }, { status: 400 });
    }

    // Get current pricing
    const pricing = await getPricing();
    if (!pricing) {
      return NextResponse.json({ error: 'Pricing not configured' }, { status: 500 });
    }

    // Calculate amount
    const subtotal = pricing.base_price + pricing.platform_fee;
    const gst = subtotal * (pricing.gst_percentage / 100);
    const total = subtotal + gst;

    // Create Razorpay order
    const order = await createOrder(total, leagueId);

    // Save payment record
    await createPayment(leagueId, order.id, total);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err: any) {
    console.error('Error creating order:', err);
    return NextResponse.json({ error: err.message || 'Failed to create order' }, { status: 500 });
  }
}
