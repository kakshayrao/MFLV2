"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

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
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-rfl-navy">League Details</h1>
      <form className="space-y-6 bg-white p-6 rounded-lg shadow" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Number of Members/Participants</label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={numMembers}
            onChange={e => setNumMembers(e.target.value)}
            min={1}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Number of Teams</label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={numTeams}
            onChange={e => setNumTeams(e.target.value)}
            min={1}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Number of Rest Days</label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={numRestDays}
            onChange={e => setNumRestDays(e.target.value)}
            min={0}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Number of Special Challenges</label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={numSpecialChallenges}
            onChange={e => setNumSpecialChallenges(e.target.value)}
            min={0}
            required
          />
        </div>
        <Button type="submit" className="w-full bg-rfl-coral text-white hover:bg-rfl-coral/90">Submit Details</Button>
      </form>
    </div>
  );
}
