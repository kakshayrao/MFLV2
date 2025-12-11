"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";

interface League {
  league_id: string;
  league_name: string;
  start_date: string;
  end_date: string;
  status: "draft" | "launched" | "active" | "completed";
  num_teams?: number;
  team_size?: number;
}

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeagues();
  }, []);

  const fetchLeagues = async () => {
    try {
      const res = await fetch("/api/leagues");
      const data = await res.json();
      if (data.success && data.data) {
        setLeagues(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch leagues");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "launched":
        return "bg-blue-100 text-blue-800";
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <Navbar navLinks={[]} />
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">My Leagues</h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage and view all your fitness leagues
              </p>
            </div>
            <Link href="/leagues/create">
              <Button className="bg-black text-white">Create League</Button>
            </Link>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <p className="text-gray-500">Loading leagues...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && leagues.length === 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <div className="max-w-sm mx-auto">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No leagues yet</h3>
                <p className="text-gray-500 text-sm mb-6">
                  Create your first fitness league and start competing with your team.
                </p>
                <Link href="/leagues/create">
                  <Button className="bg-black text-white">Create Your First League</Button>
                </Link>
              </div>
            </div>
          )}

          {/* Leagues List */}
          {!loading && leagues.length > 0 && (
            <div className="space-y-4">
              {leagues.map((league) => (
                <div
                  key={league.league_id}
                  className="bg-white rounded-lg border border-gray-200 p-5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900">{league.league_name}</h3>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(
                            league.status
                          )}`}
                        >
                          {league.status.charAt(0).toUpperCase() + league.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {league.start_date} - {league.end_date}
                      </p>
                      {league.num_teams && league.team_size && (
                        <p className="text-sm text-gray-400 mt-1">
                          {league.num_teams} teams × {league.team_size} members
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/leagues/${league.league_id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                      <Link href={`/leagues/${league.league_id}/edit`}>
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

