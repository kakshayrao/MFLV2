"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Step = 1 | 2 | 3;

interface LeagueFormData {
  league_name: string;
  start_date: string;
  end_date: string;
  is_public: boolean;
  is_exclusive: boolean;
  num_teams: number;
  team_size: number;
  rest_days: number;
  description: string;
}

export default function CreateLeaguePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState<LeagueFormData>({
    league_name: "",
    start_date: "",
    end_date: "",
    is_public: true,
    is_exclusive: false,
    num_teams: 4,
    team_size: 10,
    rest_days: 2,
    description: "",
  });

  const numDays = formData.start_date && formData.end_date
    ? Math.max(1, Math.ceil((new Date(formData.end_date).getTime() - new Date(formData.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1)
    : 0;

  const updateField = (field: keyof LeagueFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const validateStep1 = () => {
    if (!formData.league_name.trim()) {
      setError("League name is required");
      return false;
    }
    if (!formData.start_date) {
      setError("Start date is required");
      return false;
    }
    if (!formData.end_date) {
      setError("End date is required");
      return false;
    }
    if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      setError("End date must be after start date");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (formData.num_teams < 2) {
      setError("You need at least 2 teams");
      return false;
    }
    if (formData.team_size < 1) {
      setError("Team size must be at least 1");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep((prev) => Math.min(prev + 1, 3) as Step);
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
          start_date: formData.start_date,
          end_date: formData.end_date,
          is_public: formData.is_public,
          is_exclusive: formData.is_exclusive,
          num_teams: formData.num_teams,
          team_size: formData.team_size,
          rest_days: formData.rest_days,
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

  // Calculate pricing
  const baseFee = 499;
  const serviceCharge = 99;
  const subtotal = baseFee + serviceCharge;
  const gst = subtotal * 0.18;
  const total = subtotal + gst;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3].map((s) => (
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
                {s < 3 && (
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
              {step === 1 && "Basic Information"}
              {step === 2 && "League Settings"}
              {step === 3 && "Review & Create"}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {step === 1 && "Enter your league name and duration"}
              {step === 2 && "Configure teams and rules"}
              {step === 3 && "Review your league details"}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-purple-100 p-8 shadow-xl shadow-purple-100/50">
            {/* Step 1: Basic Info */}
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all duration-200"
                      value={formData.start_date}
                      onChange={(e) => updateField("start_date", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all duration-200"
                      value={formData.end_date}
                      onChange={(e) => updateField("end_date", e.target.value)}
                    />
                  </div>
                </div>

                {numDays > 0 && (
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg border border-purple-100">
                    <span className="text-sm text-purple-600 font-medium">Duration</span>
                    <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{numDays} days</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none resize-none transition-all duration-200"
                    rows={3}
                    placeholder="Describe your league..."
                    value={formData.description}
                    onChange={(e) => updateField("description", e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Settings */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Teams
                    </label>
                    <input
                      type="number"
                      min="2"
                      max="20"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all duration-200"
                      value={formData.num_teams}
                      onChange={(e) => updateField("num_teams", parseInt(e.target.value) || 2)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Team Size
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all duration-200"
                      value={formData.team_size}
                      onChange={(e) => updateField("team_size", parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rest Days per Week
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all duration-200"
                    value={formData.rest_days}
                    onChange={(e) => updateField("rest_days", parseInt(e.target.value))}
                  >
                    <option value={0}>0 rest days</option>
                    <option value={1}>1 rest day</option>
                    <option value={2}>2 rest days</option>
                    <option value={3}>3 rest days</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_public}
                      onChange={(e) => updateField("is_public", e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Public League</p>
                      <p className="text-xs text-gray-500">Anyone can discover and request to join</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_exclusive}
                      onChange={(e) => updateField("is_exclusive", e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Exclusive League</p>
                      <p className="text-xs text-gray-500">Members need approval to join</p>
                    </div>
                  </label>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg border border-purple-100">
                  <p className="text-sm text-purple-600 font-medium">Total Participants</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {formData.num_teams * formData.team_size} members
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">League Details</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Name</p>
                      <p className="font-medium text-gray-900">{formData.league_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="font-medium text-gray-900">{numDays} days</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Start Date</p>
                      <p className="font-medium text-gray-900">{formData.start_date}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">End Date</p>
                      <p className="font-medium text-gray-900">{formData.end_date}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Teams</p>
                      <p className="font-medium text-gray-900">{formData.num_teams} teams × {formData.team_size} members</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Rest Days</p>
                      <p className="font-medium text-gray-900">{formData.rest_days} per week</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Visibility</p>
                      <p className="font-medium text-gray-900">{formData.is_public ? "Public" : "Private"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Exclusive</p>
                      <p className="font-medium text-gray-900">{formData.is_exclusive ? "Yes" : "No"}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Pricing</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">League Creation Fee</span>
                      <span className="text-gray-900">₹{baseFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service Charge</span>
                      <span className="text-gray-900">₹{serviceCharge.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">GST (18%)</span>
                      <span className="text-gray-900">₹{gst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-2 font-semibold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
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

              {step < 3 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create & Pay"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    
  );
}
