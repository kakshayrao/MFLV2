"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";

interface League {
  league_id: string;
  league_name: string;
  start_date: string;
  end_date: string;
  is_public: boolean;
  is_exclusive: boolean;
  num_teams: number;
  team_size: number;
  rest_days: number;
  status: "draft" | "launched" | "active" | "completed";
  host_id: string;
}

export default function LeagueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [league, setLeague] = useState<League | null>(null);
  const [loading, setLoading] = useState(true);
  const [isHost, setIsHost] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let isMounted = true;
    
    const fetchLeague = async () => {
      try {
        const res = await fetch(`/api/leagues/${id}`);
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        
        if (isMounted) {
          if (data.success && data.data) {
            setLeague(data.data);
            // TODO: Check if current user is host
            setIsHost(true); // For now, assume user is host
          }
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load league:", err);
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchLeague();
    
    return () => {
      isMounted = false;
    };
  }, [id]);

  const getDaysRemaining = () => {
    if (!league || !mounted) return 0;
    const end = new Date(league.end_date);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  const getTotalDays = () => {
    if (!league || !mounted) return 0;
    const start = new Date(league.start_date);
    const end = new Date(league.end_date);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  if (loading) {
    return (
      <>
        <Navbar navLinks={[]} />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </>
    );
  }

  if (!league) {
    return (
      <>
        <Navbar navLinks={[]} />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-4">League not found</p>
            <Button onClick={() => router.push("/leagues")}>Back to Leagues</Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar navLinks={[]} />
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-semibold text-gray-900">{league.league_name}</h1>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    league.status === "draft"
                      ? "bg-yellow-100 text-yellow-800"
                      : league.status === "launched"
                      ? "bg-blue-100 text-blue-800"
                      : league.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {league?.status ? league.status.charAt(0).toUpperCase() + league.status.slice(1) : "Unknown"}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {league.start_date} - {league.end_date}
              </p>
            </div>
            {isHost && (
              <Link href={`/leagues/${id}/edit`}>
                <Button variant="outline">Manage League</Button>
              </Link>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500">Duration</p>
              <p className="text-2xl font-semibold text-gray-900">{getTotalDays()} days</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500">Days Remaining</p>
              <p className="text-2xl font-semibold text-gray-900">{getDaysRemaining()}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500">Teams</p>
              <p className="text-2xl font-semibold text-gray-900">{league.num_teams || 0}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500">Max Members</p>
              <p className="text-2xl font-semibold text-gray-900">
                {(league.num_teams || 0) * (league.team_size || 0)}
              </p>
            </div>
          </div>

          {/* League Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
              League Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Visibility</p>
                <p className="font-medium text-gray-900">
                  {league.is_public ? "Public" : "Private"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Join Type</p>
                <p className="font-medium text-gray-900">
                  {league.is_exclusive ? "Invite Only" : "Open"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Team Size</p>
                <p className="font-medium text-gray-900">{league.team_size || "Not set"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Rest Days</p>
                <p className="font-medium text-gray-900">{league.rest_days} per week</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
              Quick Actions
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link href={`/leagues/${id}/leaderboard`}>
                <Button variant="outline">View Leaderboard</Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/leagues/${id}/join`
                  );
                  alert("Invite link copied!");
                }}
              >
                Copy Invite Link
              </Button>
              {isHost && (
                <Link href={`/leagues/${id}/edit`}>
                  <Button className="bg-black text-white">Edit League</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

