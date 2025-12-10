'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { fetchUserLeagues, type LeagueInfo } from '@/lib/membership'
import { Trophy, Users, Plus, ExternalLink, Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [leagues, setLeagues] = useState<LeagueInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const pinnedLeagues = [
    {
      key: 'ffl',
      name: 'Family Fitness League',
      description: 'FFL dashboard — log workouts and view stats.',
      href: '/dashboard',
      logoText: 'FFL',
      cover_image: null as string | null,
    },
  ]

  useEffect(() => {
    const loadLeagues = async () => {
      if (!session?.user?.id) {
        setLoading(false)
        return
      }

      try {
        const userLeagues = await fetchUserLeagues(session.user.id)
        setLeagues(userLeagues)
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
  }, [session?.user?.id, status])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-rfl-coral mx-auto mb-4" />
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  const displayLeagues = [
    ...pinnedLeagues,
    ...leagues.map((league) => ({
      key: league.league_id,
      name: league.name,
      description: league.description || 'No description available',
      href: `/leagues/${league.league_id}`,
      cover_image: league.cover_image || null,
    })),
  ]
  const hasJoinedLeagues = leagues.length > 0
  const showEmptyState = status === 'authenticated' && !hasJoinedLeagues && !displayLeagues.some((l) => l.key === 'ffl')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Navbar with FFL Logo and Text */}
      <nav className="bg-rfl-navy text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-white">
                <img src="/img/PFL_Logo.jpeg" alt="FFL Logo" className="w-full h-full object-cover" />
              </div>
              <div className="whitespace-nowrap leading-tight">
                <h1 className="text-lg font-bold whitespace-nowrap">FFL</h1>
                <p className="text-xs text-gray-300 whitespace-nowrap">Family Fitness League</p>
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-rfl-navy">
            Welcome back{session?.user?.name ? `, ${session.user.name}` : ''}!
          </h1>
          <p className="mt-2 text-gray-600">
            Here's an overview of your fitness leagues and activities.
          </p>
        </div>

        <section className="mb-12">
          <h2 className="text-xl font-semibold text-rfl-navy mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-rfl-coral" />
            My Leagues
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {displayLeagues.map((league) => (
              <div
                key={league.key}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="h-32 bg-gradient-to-br from-rfl-navy to-rfl-light-blue relative">
                  {league.cover_image && (
                    <img
                      src={league.cover_image}
                      alt={league.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg text-rfl-navy mb-1">
                      {league.name}
                    </h3>
                  </div>
                  {/* <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {league.description}
                  </p> */}
                  <Link href={league.href}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-rfl-coral text-rfl-coral hover:bg-rfl-coral hover:text-white"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      {league.key === 'ffl' ? 'Open' : 'Open League'}
                    </Button>
                  </Link>
                </div>
              </div>
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
                className="bg-rfl-coral hover:bg-rfl-coral/90 text-white min-w-[200px]"
              >
                <Users className="w-5 h-5 mr-2" />
                Join a League
              </Button>
            </Link>
            <Link href="/leagues/create">
              <Button
                size="lg"
                variant="outline"
                className="border-rfl-navy text-rfl-navy hover:bg-rfl-navy hover:text-white min-w-[200px]"
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
