"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

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
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-rfl-navy">Create a League</h1>
      <form className="space-y-6 bg-white p-6 rounded-lg shadow" onSubmit={handlePayment}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">League Name</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="date"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Number of Days</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
            value={numDays}
            readOnly
          />
        </div>
        <Button type="submit" className="w-full bg-rfl-coral text-white hover:bg-rfl-coral/90">Proceed to Payment</Button>
      </form>
    </div>
  );
}
