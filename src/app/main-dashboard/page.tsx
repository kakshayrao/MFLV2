'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Trophy, Users, Plus, Sparkles } from 'lucide-react'
import { TopNav } from '@/components/layout/topnav'

// Types
type DashboardStats = {
  totalLeagues: number
}

type League = {
  league_id: string
  name: string
  description: string | null
  cover_image: string | null
  members?: number
  status?: string
}

type DashboardData = {
  stats: DashboardStats
  leagues: League[]
}

// Hooks
function useDashboardData() {
  const { data: session } = useSession()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        // Try API first
        const res = await fetch('/api/v1/leagues', { cache: 'no-store' })
        
        if (!res.ok) {
          throw new Error('API failed')
        }
        
        const json = await res.json()
        setData({
          stats: {
            totalLeagues: json.leagues?.length || 0,
          },
          leagues: json.leagues || []
        })
      } catch (err) {
        console.warn('API failed:', err)
        setError('Unable to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [session?.user])

  return { data, loading, error, refetch: () => {} }
}

// Components
// TopNav moved to dedicated component

function Hero({ userName, stats, loading }: { userName: string | null | undefined; stats: DashboardStats | null; loading: boolean }) {
  return (
    <section className="card-elevated p-8 mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex-1">
          <p className="flex items-center gap-2 text-sm font-semibold subtle mb-2">
            <Sparkles className="h-4 w-4" /> Personalized overview
          </p>
          <h1 className="headline text-3xl sm:text-4xl mb-4">
            Welcome back{userName ? `, ${userName}` : ''}!
          </h1>
          
          <div className="grid grid-cols-1 gap-4 sm:gap-6 mt-6">
            <div className="text-center">
              {loading ? (
                <div className="h-8 w-16 mx-auto rounded animate-pulse" style={{ background: '#E6E9EE' }} />
              ) : (
                <div className="text-2xl sm:text-3xl font-extrabold" style={{ color: '#0B365F' }}>{stats?.totalLeagues || 0}</div>
              )}
              <div className="text-xs sm:text-sm" style={{ color: '#6B7280' }}>Total Leagues</div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:w-64">
          <Link href="/leagues/join" className="flex-1">
            <Button className="btn-accent w-full" size="lg">
              <Users className="w-5 h-5 mr-2" /> Join a League
            </Button>
          </Link>
          <Link href="/leagues/create" className="flex-1">
            <Button variant="outline" className="btn-outline w-full" size="lg">
              <Plus className="w-5 h-5 mr-2" /> Start a League
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

function StatCard({ icon: Icon, label, value, loading }: { icon: React.ElementType; label: string; value: string | number; loading: boolean }) {
  return (
    <div className="card p-6 hover:shadow-lg transition-all" style={{ '--tw-shadow-colored': 'var(--shadow-md)' } as React.CSSProperties}>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-accent)', opacity: 0.1 }}>
          <Icon className="w-6 h-6" style={{ color: 'var(--color-accent)' }} />
        </div>
        <div>
          <div className="text-sm subtle">{label}</div>
          {loading ? (
            <div className="h-7 w-20 mt-1 rounded animate-pulse" style={{ background: 'var(--color-border)' }} />
          ) : (
            <div className="text-2xl font-bold headline mt-1">{value}</div>
          )}
        </div>
      </div>
    </div>
  )
}

function LeagueSkeleton() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="h-36" style={{ background: 'var(--color-border)' }} />
      <div className="p-4 space-y-3">
        <div className="h-4 rounded" style={{ background: 'var(--color-border)', width: '75%' }} />
        <div className="h-3 rounded" style={{ background: 'var(--color-border)', width: '90%' }} />
        <div className="h-9 rounded mt-4" style={{ background: 'var(--color-border)' }} />
      </div>
    </div>
  )
}

function LeagueCard({ league }: { league: League }) {
  return (
    <Link href={`/leagues/${league.league_id}`}>
      <div 
        className="card group overflow-hidden transition-all hover:-translate-y-1 focus-within:ring-2 focus-within:ring-offset-2"
        style={{ boxShadow: 'var(--shadow-md)', '--tw-ring-color': 'var(--color-primary)' } as React.CSSProperties}
        tabIndex={0}
      >
        <div className="relative h-36" style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)' }}>
          {league.cover_image && (
            <img
              src={league.cover_image}
              alt=""
              className="h-full w-full object-cover opacity-90"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <div className="text-xs uppercase tracking-wide text-white/80 font-medium">League</div>
            <div className="text-lg font-bold leading-tight mt-1">{league.name}</div>
          </div>
        </div>
        <div className="p-4">
          <p className="text-sm subtle line-clamp-2 min-h-[40px]">
            {league.description || 'No description available'}
          </p>
          {league.members && (
            <div className="flex items-center gap-1 mt-3 text-sm subtle">
              <Users className="w-4 h-4" />
              <span>{league.members} members</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

function EmptyLeagues() {
  return (
    <div className="card-elevated p-12 text-center">
      <div className="w-24 h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{ background: 'var(--color-background)' }}>
        <Trophy className="w-12 h-12" style={{ color: 'var(--color-muted)' }} />
      </div>
      <h3 className="text-xl font-bold headline mb-3">No leagues yet</h3>
      <p className="subtle mb-6 max-w-md mx-auto">
        You haven't joined any fitness leagues. Start your fitness journey by joining an existing league or creating your own!
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/leagues/join">
          <Button className="btn-accent" size="lg">
            <Users className="w-5 h-5 mr-2" /> Join a League
          </Button>
        </Link>
        <Link href="/leagues/create">
          <Button variant="outline" className="btn-outline" size="lg">
            <Plus className="w-5 h-5 mr-2" /> Create League
          </Button>
        </Link>
      </div>
    </div>
  )
}

// Premium teaser removed per requirements

function LeaguesList({ leagues, loading }: { leagues: League[]; loading: boolean }) {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold headline flex items-center gap-2">
          <Trophy className="w-6 h-6" style={{ color: 'var(--color-accent)' }} /> My Leagues
        </h2>
      </div>

      {loading ? (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <LeagueSkeleton />
          <LeagueSkeleton />
          <LeagueSkeleton />
        </div>
      ) : leagues.length === 0 ? (
        <EmptyLeagues />
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {leagues.map((league) => (
            <LeagueCard key={league.league_id} league={league} />
          ))}
        </div>
      )}
    </section>
  )
}

// Main Component
export default function DashboardPage() {
  const { data: session, status } = useSession()
  const { data, loading, error } = useDashboardData()

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-background)' }}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-4" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
          <p className="subtle">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
      <TopNav user={{ id: (session?.user?.id as string) || 'u', firstName: (session?.user?.name || 'User').split(' ')[0] }} onSignOut={() => signOut()} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Hero userName={session?.user?.name} stats={data?.stats || null} loading={loading} />

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-3 mb-8">
          <StatCard icon={Trophy} label="Total Leagues" value={data?.stats?.totalLeagues || 0} loading={loading} />
        </div>

        {error && (
          <div role="alert" aria-live="assertive" className="card p-4 mb-6 border" style={{ borderColor: '#E6E9EE', background: '#fff' }}>
            <p className="text-sm mb-3" style={{ color: '#E9573F' }}>{error}</p>
            <Link href="/main-dashboard" className="inline-block">
              <Button variant="outline" className="btn-outline">Retry</Button>
            </Link>
          </div>
        )}

        <LeaguesList leagues={data?.leagues || []} loading={loading} />
      </main>
    </div>
  )
}
