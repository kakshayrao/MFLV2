"use client";

import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { useSession } from "next-auth/react";

type Pricing = {
  base_price: number;
  platform_fee: number;
  gst_percentage: number;
};

function PaymentContent() {
  const router = useRouter();
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const leagueId = searchParams.get("leagueId");
  const leagueName = searchParams.get("name") || "Your League";

  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [gatewayReady, setGatewayReady] = useState(false);

  useEffect(() => {
    // Fetch pricing
    const fetchPricing = async () => {
      try {
        const res = await fetch("/api/leagues/pricing");
        if (!res.ok) throw new Error("Failed to fetch pricing");
        const { pricing } = await res.json();
        setPricing(pricing);
      } catch (err: any) {
        setError(err.message || "Failed to load pricing");
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
  }, []);

  // Detect Razorpay script readiness
  useEffect(() => {
    const checkRazorpay = () => {
      if (typeof window !== "undefined" && (window as any).Razorpay) {
        setGatewayReady(true);
      }
    };
    const interval = setInterval(checkRazorpay, 300);
    checkRazorpay();
    return () => clearInterval(interval);
  }, []);

  const calculateTotal = () => {
    if (!pricing) return 0;
    const subtotal = pricing.base_price + pricing.platform_fee;
    const gst = subtotal * (pricing.gst_percentage / 100);
    return subtotal + gst;
  };

  const handlePayment = async () => {
    if (!leagueId || !pricing) {
      setError("Missing league information. Please go back and retry.");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Create order
      const orderRes = await fetch("/api/payments/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leagueId }),
      });

      if (!orderRes.ok) {
        const errorData = await orderRes.json();
        throw new Error(errorData.error || "Failed to create order");
      }

      const { orderId: newOrderId, amount, keyId } = await orderRes.json();

      // Open Razorpay
      if (typeof window !== "undefined" && (window as any).Razorpay) {
        const options = {
          key: keyId,
          amount: amount,
          currency: "INR",
          name: "My Fitness League",
          description: `Payment for ${leagueName}`,
          order_id: newOrderId,
          handler: async (response: any) => {
            try {
              // Verify payment
              const verifyRes = await fetch("/api/payments/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderId: newOrderId,
                  paymentId: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                }),
              });

              if (!verifyRes.ok) {
                throw new Error("Payment verification failed");
              }

              const verifyData = await verifyRes.json();
              
              // Redirect to set dates page after payment
              if (verifyData.redirectUrl) {
                router.push(verifyData.redirectUrl);
              } else {
                // Fallback to edit page
                router.push(`/leagues/${leagueId}/edit?success=true&payment=completed`);
              }
            } catch (err: any) {
              setError(err.message || "Payment verification failed");
              setProcessing(false);
            }
          },
          prefill: {
            email: session?.user?.email || "",
          },
          theme: {
            color: "#0B365F",
          },
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      } else {
        throw new Error("Payment gateway failed to load. Please refresh the page.");
      }
    } catch (err: any) {
      setError(err.message || "Payment setup failed");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border-4 border-gray-300 border-t-gray-900 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!pricing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Failed to load payment details"}</p>
          <Link href={`/leagues/create`}>
            <Button>Back to Create League</Button>
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = pricing.base_price + pricing.platform_fee;
  const gst = subtotal * (pricing.gst_percentage / 100);
  const total = calculateTotal();

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" onLoad={() => setGatewayReady(true)} onError={() => setError("Failed to load payment gateway script")}/>
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">Complete Payment</h1>
            <p className="text-gray-500 text-sm mt-1">
              Secure payment for {decodeURIComponent(leagueName)}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-6">
            {/* Payment Info */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
                <p className="text-gray-600 text-sm mb-6">
                  Click below to proceed to secure Razorpay payment gateway. You'll be able to pay using:
                </p>
                <ul className="space-y-2 text-sm text-gray-600 mb-6 ml-4">
                  <li>✓ Credit/Debit Cards (Visa, Mastercard, Amex)</li>
                  <li>✓ UPI (Google Pay, PhonePe, Paytm)</li>
                  <li>✓ Net Banking</li>
                  <li>✓ Wallets (Paytm, Amazon Pay)</li>
                </ul>

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> You will be redirected to Razorpay's secure payment gateway.
                  </p>
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={processing || !gatewayReady || !leagueId}
                  className="w-full bg-[#0B365F] text-white py-3 text-base font-medium rounded-lg hover:bg-[#082444] disabled:opacity-50"
                >
                  {processing ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Setting up payment...
                    </span>
                  ) : (
                    gatewayReady ? `Proceed to Payment - ₹${total.toFixed(2)}` : "Initializing payment gateway..."
                  )}
                </Button>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Link href={`/leagues`}>
                    <Button variant="outline" className="w-full">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
                <h2 className="text-sm font-medium text-gray-900 mb-4">Order Summary</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">League Creation Fee</span>
                    <span className="text-gray-900">₹{pricing.base_price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform Fee</span>
                    <span className="text-gray-900">₹{pricing.platform_fee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">GST ({pricing.gst_percentage}%)</span>
                    <span className="text-gray-900">₹{gst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-3 font-semibold">
                    <span className="text-gray-900">Total Amount</span>
                    <span className="text-[#E9573F] text-lg">₹{total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-2">
                    <strong>League:</strong>
                  </p>
                  <p className="text-xs font-medium text-gray-900 break-words">{decodeURIComponent(leagueName)}</p>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Secure Razorpay payment
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <PaymentContent />
    </Suspense>
  );
}
