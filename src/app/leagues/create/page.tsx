"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Trophy, Calendar, Sparkles } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";

export default function CreateLeaguePage() {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const router = useRouter();

  // Calculate number of days
  const numDays = startDate && endDate
    ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1)
    : "";

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/leagues/payment");
  };

  return (
    <>
      <Navbar navLinks={[]} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 shadow-lg" style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)' }}>
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{ 
            background: 'linear-gradient(90deg, #1e3a8a 0%, #FF6B6B 50%, #9333ea 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>Create Your League</h1>
          <p className="text-gray-600">Launch an epic fitness challenge and inspire your community</p>
        </div>
        <form className="space-y-6 p-8 rounded-2xl shadow-2xl border-2" style={{ 
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(249,250,251,0.95) 100%)',
          borderColor: 'rgba(147,51,234,0.2)'
        }} onSubmit={handlePayment}>
        <div className="transform transition-all duration-200 hover:scale-[1.02]">
          <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
            <Sparkles className="w-4 h-4 mr-2" style={{ color: '#FF6B6B' }} />
            League Name
          </label>
          <input
            type="text"
            className="w-full border-2 border-gray-400 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none bg-white"
            placeholder="Enter your amazing league name..."
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="transform transition-all duration-200 hover:scale-[1.02]">
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <Calendar className="w-4 h-4 mr-2 text-green-500" />
              Start Date
            </label>
            <input
              type="date"
              className="w-full border-2 border-gray-400 rounded-xl px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none bg-white"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              required
            />
          </div>
          <div className="transform transition-all duration-200 hover:scale-[1.02]">
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <Calendar className="w-4 h-4 mr-2 text-red-500" />
              End Date
            </label>
            <input
              type="date"
              className="w-full border-2 border-gray-400 rounded-xl px-4 py-3 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all outline-none bg-white"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-xl border-2 border-purple-200">
          <label className="block text-sm font-semibold text-purple-900 mb-2">Duration</label>
          <div className="text-3xl font-bold" style={{ 
            background: 'linear-gradient(90deg, #9333ea 0%, #3b82f6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {numDays || "0"} Days
          </div>
        </div>
        <Button type="submit" className="w-full text-white hover:opacity-90 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]" style={{ background: 'linear-gradient(90deg, #FF6B6B 0%, #FF8E53 100%)' }}>Proceed to Payment →</Button>
      </form>
      </div>
    </div>
    </>
  );
}
