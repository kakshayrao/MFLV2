"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Users, Target, Coffee, Zap, Settings } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";

export default function LeagueDetailsPage() {
  const [numMembers, setNumMembers] = useState("");
  const [numTeams, setNumTeams] = useState("");
  const [numRestDays, setNumRestDays] = useState("");
  const [numSpecialChallenges, setNumSpecialChallenges] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`League Details Submitted!\nMembers: ${numMembers}\nTeams: ${numTeams}\nRest Days: ${numRestDays}\nSpecial Challenges: ${numSpecialChallenges}`);
  };

  return (
    <>
      <Navbar navLinks={[]} />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mb-4 shadow-lg">
            <Settings className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{ 
            background: 'linear-gradient(90deg, #2563eb 0%, #06b6d4 50%, #14b8a6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>Configure League Details</h1>
          <p className="text-gray-600">Customize your league settings for maximum engagement</p>
        </div>
        <form className="space-y-6 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="transform transition-all duration-200 hover:scale-[1.02]">
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <Users className="w-4 h-4 mr-2 text-blue-500" />
              Members/Participants
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className="w-full border-2 border-gray-400 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none bg-white"
              placeholder="e.g., 50"
              value={numMembers}
              onChange={e => setNumMembers(e.target.value)}
              required
            />
          </div>
          <div className="transform transition-all duration-200 hover:scale-[1.02]">
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <Target className="w-4 h-4 mr-2 text-orange-500" />
              Number of Teams
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className="w-full border-2 border-gray-400 rounded-xl px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none bg-white"
              placeholder="e.g., 5"
              value={numTeams}
              onChange={e => setNumTeams(e.target.value)}
              required
            />
          </div>
          <div className="transform transition-all duration-200 hover:scale-[1.02]">
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <Coffee className="w-4 h-4 mr-2 text-amber-600" />
              Rest Days in a Week
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className="w-full border-2 border-gray-400 rounded-xl px-4 py-3 focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 transition-all outline-none bg-white"
              placeholder="e.g., 2"
              value={numRestDays}
              onChange={e => setNumRestDays(e.target.value)}
              required
            />
          </div>
          <div className="transform transition-all duration-200 hover:scale-[1.02]">
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <Zap className="w-4 h-4 mr-2 text-yellow-500" />
              Special Challenges
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className="w-full border-2 border-gray-400 rounded-xl px-4 py-3 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all outline-none bg-white"
              placeholder="e.g., 3"
              value={numSpecialChallenges}
              onChange={e => setNumSpecialChallenges(e.target.value)}
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full text-white py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]" style={{ background: 'linear-gradient(90deg, #2563eb 0%, #06b6d4 100%)' }}>Create League →</Button>
      </form>
      </div>
    </div>
    </>
  );
}
