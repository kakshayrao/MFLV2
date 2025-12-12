"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

type Pricing = {
  id: string;
  base_price: number;
  platform_fee: number;
  gst_percentage: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export default function PricingManagementPage() {
  const { data: session } = useSession();
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    base_price: 0,
    platform_fee: 0,
    gst_percentage: 18,
  });

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const res = await fetch("/api/leagues/pricing");
        if (!res.ok) throw new Error("Failed to fetch pricing");
        const { pricing } = await res.json();
        setPricing(pricing);
        setFormData({
          base_price: pricing.base_price,
          platform_fee: pricing.platform_fee,
          gst_percentage: pricing.gst_percentage,
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) fetchPricing();
  }, [session?.user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/leagues/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update pricing");
      }

      const { pricing: updated } = await res.json();
      setPricing(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const calculateTotal = () => {
    const subtotal = formData.base_price + formData.platform_fee;
    const gst = subtotal * (formData.gst_percentage / 100);
    return subtotal + gst;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pricing Management</h1>
          <p className="text-gray-600 mt-2">Manage league creation pricing and fees</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            Pricing updated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          {/* Base Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              League Creation Fee (₹)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.base_price}
              onChange={(e) => setFormData({ ...formData, base_price: parseFloat(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">Base fee for creating a league</p>
          </div>

          {/* Platform Fee */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Platform Fee (₹)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.platform_fee}
              onChange={(e) => setFormData({ ...formData, platform_fee: parseFloat(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">Platform processing fee</p>
          </div>

          {/* GST */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GST Percentage (%)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={formData.gst_percentage}
              onChange={(e) => setFormData({ ...formData, gst_percentage: parseFloat(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">GST tax percentage</p>
          </div>

          {/* Price Summary */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <h3 className="font-medium text-gray-900 mb-3">Price Summary</h3>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">League Fee</span>
              <span className="text-gray-900">₹{formData.base_price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Platform Fee</span>
              <span className="text-gray-900">₹{formData.platform_fee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm pb-2 border-b border-gray-200">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">₹{(formData.base_price + formData.platform_fee).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">GST ({formData.gst_percentage}%)</span>
              <span className="text-gray-900">
                ₹{((formData.base_price + formData.platform_fee) * (formData.gst_percentage / 100)).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between font-semibold pt-2 border-t border-gray-200">
              <span className="text-gray-900">Total</span>
              <span className="text-lg text-blue-600">₹{calculateTotal().toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Pricing"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 border border-gray-300 py-2 rounded-lg"
              onClick={() => {
                if (pricing) {
                  setFormData({
                    base_price: pricing.base_price,
                    platform_fee: pricing.platform_fee,
                    gst_percentage: pricing.gst_percentage,
                  });
                }
              }}
            >
              Reset
            </Button>
          </div>
        </form>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Changes to pricing will apply to all new league creations. Existing payments are not affected.
          </p>
        </div>
      </div>
    </div>
  );
}
