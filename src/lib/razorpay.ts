// src/lib/razorpay.ts

const Razorpay = require('razorpay');

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET) {
  throw new Error('Razorpay keys not configured');
}

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

export type PaymentOrder = {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  created_at: number;
};

export async function createOrder(amount: number, leagueId: string): Promise<PaymentOrder> {
  const order = await razorpay.orders.create({
    amount: amount * 100, // Amount in paise
    currency: 'INR',
    receipt: `league_${leagueId}`,
    notes: {
      leagueId,
    },
  });
  return order;
}

export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET!);
  hmac.update(`${orderId}|${paymentId}`);
  const generated_signature = hmac.digest('hex');
  return generated_signature === signature;
}
