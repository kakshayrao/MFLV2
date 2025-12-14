"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Step = 1 | 2;

interface LeagueFormData {
  league_name: string;
  duration_days: number | null;
}

interface DurationOption {
  id: string;
  duration_days: number;
  display_name: string;
  is_active: boolean;
  display_order: number;
}

export default function CreateLeaguePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [durationOptions, setDurationOptions] = useState<DurationOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  
  const [formData, setFormData] = useState<LeagueFormData>({
    league_name: "",
    duration_days: null,
  });

  useEffect(() => {
    // Fetch available duration options
    const fetchDurationOptions = async () => {
      try {
        const res = await fetch("/api/leagues/duration-options");
        if (!res.ok) throw new Error("Failed to fetch duration options");
        const { data } = await res.json();
        setDurationOptions(data || []);
      } catch (err: any) {
        setError(err.message || "Failed to load duration options");
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchDurationOptions();
  }, []);

  const updateField = (field: keyof LeagueFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const validateStep1 = () => {
    if (!formData.league_name.trim()) {
      setError("League name is required");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.duration_days) {
      setError("Please select a league duration");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) {
      return;
    }
    if (step === 2) {
      handleSubmit();
      return;
    }
    setStep((prev) => Math.min(prev + 1, 2) as Step);
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1) as Step);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/leagues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          league_name: formData.league_name,
          duration_days: formData.duration_days,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create league");
      }

      // Redirect to payment with league ID
      router.push(`/leagues/payment?leagueId=${data.data.league_id}&name=${encodeURIComponent(formData.league_name)}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-md transition-all duration-300 relative z-10 ${
                    step >= s 
                      ? "bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white scale-110" 
                      : "bg-white text-gray-500 border-2 border-gray-300 shadow-sm"
                  }`}
                >
                  {s}
                </div>
                {s < 2 && (
                  <div
                    className={`w-20 h-1 mx-3 rounded-full transition-all duration-300 z-0 ${
                      step > s ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              {step === 1 && "League Name"}
              {step === 2 && "Select Duration"}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {step === 1 && "Enter your league name"}
              {step === 2 && "Choose the duration for your league"}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-purple-100 p-8 shadow-xl shadow-purple-100/50">
            {/* Step 1: League Name */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    League Name
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all duration-200"
                    placeholder="Enter league name"
                    value={formData.league_name}
                    onChange={(e) => updateField("league_name", e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Duration Selection */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select League Duration
                  </label>
                  {loadingOptions ? (
                    <div className="text-center py-8 text-gray-500">Loading options...</div>
                  ) : durationOptions.length === 0 ? (
                    <div className="text-center py-8 text-red-500">No duration options available. Please contact support.</div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {durationOptions.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => updateField("duration_days", option.duration_days)}
                          className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                            formData.duration_days === option.duration_days
                              ? "border-purple-500 bg-purple-50 shadow-md"
                              : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/50"
                          }`}
                        >
                          <div className="font-semibold text-gray-900">{option.display_name}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {option.duration_days} days
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {formData.duration_days && (
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg border border-purple-100">
                    <span className="text-sm text-purple-600 font-medium">Selected Duration</span>
                    <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {formData.duration_days} days
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                >
                  Back
                </Button>
              ) : (
                <div />
              )}

              <Button
                type="button"
                onClick={handleNext}
                disabled={loading || (step === 2 && !formData.duration_days)}
                className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-50"
              >
                {loading ? "Creating..." : step === 1 ? "Continue" : "Proceed to Payment"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    
  );
}
