"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Trophy, Users, Plus, Sparkles } from "lucide-react";
import { TopNav } from "@/components/layout/topnav";

/* ---------------------------
   Types
   --------------------------- */
type DashboardStats = {
  totalLeagues: number;
};

type League = {
  league_id: string;
  name: string;
  description: string | null;
  cover_image: string | null;
  members?: number;
  status?: string;
};

type DashboardData = {
  stats: DashboardStats;
  leagues: League[];
};

/* ---------------------------
   Hook: useDashboardData
   returns data, loading, error, refetch
   --------------------------- */
function useDashboardData() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = React.useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    if (!session?.user) {
      setLoading(false);
      setData(null);
      setError(null);
      return;
    }

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/v1/leagues", {
        cache: "no-store",
        signal: controller.signal,
      });

      if (!res.ok) {
        let message = `API error (${res.status})`;
        try {
          const body = await res.json();
          if (body?.message) message = body.message;
        } catch {
          // ignore parse error
        }
        throw new Error(message);
      }

      const json = await res.json();
      const leagues = Array.isArray(json.leagues) ? json.leagues : [];

      setData({
        stats: {
          totalLeagues: leagues.length,
        },
        leagues,
      });
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      console.warn("Dashboard fetch failed:", err);
      setError(err?.message || "Unable to load dashboard data");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [session?.user]);

  useEffect(() => {
    fetchData();
    return () => {
      controllerRef.current?.abort();
    };
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}

/* ---------------------------
  UI Subcomponents
   --------------------------- */

function Hero({
  userName,
  stats,
  loading,
  onRefetch,
}: {
  userName?: string | null;
  stats: DashboardStats | null;
  loading: boolean;
  onRefetch: () => void;
}) {
  return (
    <section className="rounded-2xl bg-white shadow-sm p-6 md:p-8 mb-6">
      <div className="flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between">
        <div className="flex-1">

          <h1 className="text-2xl md:text-3xl font-extrabold leading-tight mb-2">
            Welcome back{userName ? `, ${userName.split(" ")[0]}` : ""}!
          </h1>

          <p className="text-sm text-gray-600 mb-4">
            Quick summary of your leagues and actions you can take today — join, create, or manage.
          </p>

          <div className="flex gap-3 flex-wrap items-center">
            <Link href="/leagues/join" className="inline-block">
              <Button className="bg-gradient-to-r from-amber-400 to-rose-500 text-white px-4 py-2">
                <Users className="w-4 h-4 mr-2 inline" /> Join a League
              </Button>
            </Link>

            <Link href="/leagues/create" className="inline-block w-full sm:w-auto">
              <Button variant="outline" className="px-4 py-2 border-gray-200">
                <Plus className="w-4 h-4 mr-2 inline" /> Start a League
              </Button>
            </Link>
          </div>
        </div>

        <div className="w-full sm:w-64 lg:w-72">
          <div className="rounded-lg overflow-hidden bg-gradient-to-br from-sky-50 to-indigo-50 p-4 border border-sky-100">
            <div className="text-xs text-sky-600 font-medium">Total Leagues</div>
            <div className="mt-2">
              {loading ? (
                <div className="h-10 w-20 rounded-md bg-sky-200 animate-pulse" />
              ) : (
                <div className="text-3xl font-extrabold text-sky-700">{stats?.totalLeagues ?? 0}</div>
              )}
            </div>
            <div className="text-sm text-sky-600 mt-1">Leagues you're a member of</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  loading: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-indigo-100 to-sky-100 flex items-center justify-center">
          <Icon className="w-5 h-5 text-indigo-600" />
        </div>

        <div className="flex-1">
          <div className="text-xs text-gray-500">{label}</div>
          {loading ? (
            <div className="h-6 w-16 mt-1 rounded bg-gray-200 animate-pulse" />
          ) : (
            <div className="text-lg font-bold mt-1">{value}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function LeagueSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm animate-pulse">
      <div className="h-36 bg-gradient-to-br from-gray-200 to-gray-300" />
      <div className="p-4 space-y-2">
        <div className="h-4 w-3/4 rounded bg-gray-200" />
        <div className="h-3 w-5/6 rounded bg-gray-200" />
        <div className="h-8 w-full rounded bg-gray-200" />
      </div>
    </div>
  );
}

function LeagueCard({ league }: { league: League }) {
  return (
    <Link href={`/leagues/${league.league_id}`} className="block">
      <article className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all group">
        <div className="relative h-36 bg-gradient-to-br from-indigo-400 to-pink-500">
          {league.cover_image ? (
            <img
              src={league.cover_image}
              alt={league.name}
              className="object-cover w-full h-full opacity-90"
              onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <div className="text-xs uppercase tracking-wide text-white/80 font-medium">League</div>
            <h3 className="text-lg font-bold mt-1 line-clamp-2">{league.name}</h3>
          </div>
        </div>

        <div className="p-4">
          <p className="text-sm text-gray-600 line-clamp-2">{league.description ?? "No description"}</p>
          {typeof league.members === "number" && (
            <div className="mt-3 text-sm text-gray-500 flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" /> <span>{league.members} members</span>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}

function EmptyLeagues({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
      <div className="mx-auto w-24 h-24 rounded-lg mb-6 bg-sky-50 flex items-center justify-center">
        <Trophy className="w-10 h-10 text-sky-400" />
      </div>
      <h3 className="text-xl font-bold mb-2">No leagues yet</h3>
      <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
        You haven't joined any leagues yet. Join an existing league or start your own to get moving with your team.
      </p>

      <div className="flex gap-3 justify-center flex-wrap">
        <Link href="/leagues/join" className="inline-block">
          <Button className="px-4 py-2 bg-gradient-to-r from-amber-400 to-rose-500 text-white">
            <Users className="w-4 h-4 mr-2 inline" /> Join a League
          </Button>
        </Link>
        <Button variant="outline" onClick={onCreate} className="px-4 py-2">
          <Plus className="w-4 h-4 mr-2 inline" /> Create League
        </Button>
      </div>
    </div>
  );
}

/* ---------------------------
   Leagues List component
   --------------------------- */
function LeaguesList({ leagues, loading }: { leagues: League[]; loading: boolean }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold inline-flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" /> My Leagues
        </h2>
      </div>

      {loading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <LeagueSkeleton />
          <LeagueSkeleton />
          <LeagueSkeleton />
        </div>
      ) : leagues.length === 0 ? (
        <EmptyLeagues onCreate={() => (window.location.href = "/leagues/create")} />
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {leagues.map((l) => (
            <LeagueCard key={l.league_id} league={l} />
          ))}
        </div>
      )}
    </section>
  );
}

/* ---------------------------
   Main Page
   --------------------------- */
export default function DashboardPage() {
  const { data: session, status } = useSession();
  const { data, loading, error, refetch } = useDashboardData();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-background)" }}>
        <div className="text-center">
          <div
            className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-4"
            style={{ borderColor: "var(--color-primary)", borderTopColor: "transparent" }}
          />
          <p className="text-sm text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const userFirstName = (session?.user?.name as string | undefined)?.split(" ")[0] ?? "User";
  const userId = (session?.user?.id as string) || "u";

  return (
    <div className="min-h-screen" style={{ background: "var(--color-background)" }}>
      <TopNav user={{ id: userId, firstName: userFirstName }} onSignOut={() => signOut({ callbackUrl: '/' })} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* HERO */}
        <Hero userName={session?.user?.name} stats={data?.stats ?? null} loading={loading} onRefetch={refetch} />

        {error && (
          <div role="alert" aria-live="assertive" className="rounded-lg p-4 mb-6 bg-white border border-red-100">
            <div className="text-sm font-medium text-red-700 mb-2">Error loading dashboard</div>
            <div className="text-xs text-gray-600 mb-3">{error}</div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
              <Link href="/support" className="inline-block">
                <Button variant="ghost">Contact support</Button>
              </Link>
            </div>
          </div>
        )}

        <LeaguesList leagues={data?.leagues ?? []} loading={loading} />
      </main>
    </div>
  );
}
