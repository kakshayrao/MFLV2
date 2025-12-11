'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/layout/navbar'
import { Trophy, Users, Plus, ExternalLink, Loader2, Sparkles } from 'lucide-react'

type LeagueInfo = {
  league_id: string
  name: string
  description: string | null
  cover_image: string | null
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [leagues, setLeagues] = useState<LeagueInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadLeagues = async () => {
      if (!session?.user) {
        setLoading(false)
        return
      }

      try {
        setError(null)
        const res = await fetch('/api/dashboard/leagues', { cache: 'no-store' })
        if (!res.ok) {
          throw new Error(`Failed to fetch leagues: ${res.status}`)
        }
        const json = (await res.json()) as { leagues?: LeagueInfo[]; error?: string }
        setLeagues(json.leagues || [])
      } catch (err) {
        console.error('Error loading leagues:', err)
        setError('Failed to load your leagues. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated') {
      loadLeagues()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [session?.user, status])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center" role="status" aria-live="polite">
            <Loader2 className="w-8 h-8 animate-spin text-rfl-coral mx-auto mb-4" />
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  const displayLeagues = leagues.map((league) => ({
    key: league.league_id,
    name: league.name,
    description: league.description || 'No description available',
    href: `/leagues/${league.league_id}`,
    cover_image: league.cover_image || null,
  }))
  const hasJoinedLeagues = leagues.length > 0
  const showEmptyState = status === 'authenticated' && !hasJoinedLeagues

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7f9fb] via-white to-[#eef2f7]">
      <Navbar navLinks={[]} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-rfl-coral"><Sparkles className="h-4 w-4" /> Personalized overview</p>
              <h1 className="text-3xl font-bold text-rfl-navy leading-tight">
                Welcome back{session?.user?.name ? `, ${session.user.name}` : ''}!
              </h1>
              <p className="mt-2 text-gray-600">Your leagues, progress, and quick actions in one place.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/leagues/join">
                <Button variant="outline" className="border-rfl-navy text-rfl-navy hover:bg-rfl-navy hover:text-white">
                  <Users className="w-4 h-4 mr-2" /> Join a League
                </Button>
              </Link>
              <Link href="/leagues/create">
                <Button className="bg-rfl-coral hover:bg-rfl-coral/90 text-white">
                  <Plus className="w-4 h-4 mr-2" /> Start a League
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Your leagues and quick actions at a glance.
          </div>
        </div>

        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-rfl-navy flex items-center gap-2">
              <Trophy className="w-5 h-5 text-rfl-coral" /> My Leagues
            </h2>
            {loading && <span className="text-sm text-gray-500">Refreshing...</span>}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {displayLeagues.map((league) => (
              <LeagueCard key={league.key} league={league} />
            ))}
          </div>

          {showEmptyState && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center mt-6">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">You are not in any leagues yet</h3>
              <p className="text-gray-600 mb-4">
                You haven't joined any fitness leagues. Get started by joining a league or creating your own!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/leagues/join">
                  <Button className="bg-rfl-coral hover:bg-rfl-coral/90 text-white">
                    Join a League
                  </Button>
                </Link>
                <Link href="/leagues/create">
                  <Button variant="outline" className="border-rfl-navy text-rfl-navy hover:bg-rfl-navy hover:text-white">
                    Start a League
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </section>

        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-rfl-navy mb-6 text-center">
            Quick Actions
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/leagues/join">
              <Button
                size="lg"
                className="bg-rfl-coral hover:bg-rfl-coral/90 text-white w-full sm:w-auto sm:min-w-[200px]"
              >
                <Users className="w-5 h-5 mr-2" />
                Join a League
              </Button>
            </Link>
            <Link href="/leagues/create">
              <Button
                size="lg"
                variant="outline"
                className="border-rfl-navy text-rfl-navy hover:bg-rfl-navy hover:text-white w-full sm:w-auto sm:min-w-[200px]"
              >
                <Plus className="w-5 h-5 mr-2" />
                Start a League
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}

type LeagueCardProps = {
  league: {
    key: string
    name: string
    description: string | null
    href: string
    cover_image: string | null
  }
}

function LeagueCard({ league }: LeagueCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative h-36 bg-gradient-to-br from-rfl-navy to-rfl-light-blue">
        {league.cover_image && (
          <img
            src={league.cover_image}
            alt={league.name}
            className="h-full w-full object-cover opacity-90"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4 text-white">
          <div className="text-xs uppercase tracking-wide text-white/80">League</div>
          <div className="text-lg font-semibold leading-tight">{league.name}</div>
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px]">
          {league.description || 'No description available'}
        </p>
        <Link href={league.href} className="block mt-4">
          <Button
            variant="outline"
            size="sm"
            className="w-full border-rfl-coral text-rfl-coral hover:bg-rfl-coral hover:text-white"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            Open League
          </Button>
        </Link>
      </div>
    </div>
  )
}
