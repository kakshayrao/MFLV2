'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, Trophy, Users, Edit } from 'lucide-react'

interface League {
  id: string
  name: string
  description?: string
  hostId: string
  hostName: string
  memberCount: number
  teamCount: number
  isActive: boolean
  startDate?: string
  endDate?: string
  createdAt: string
}

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState<League[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchLeagues()
  }, [])

  const fetchLeagues = async () => {
    try {
      // TODO: Fetch from API
      setLeagues([])
    } catch (error) {
      console.error('Error fetching leagues:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLeagues = leagues.filter(league =>
    league.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-rfl-coral border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading leagues...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-rfl-navy">League Management</h1>
        <p className="text-gray-600 mt-2">Manage all fitness leagues</p>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search leagues..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rfl-coral focus:border-transparent"
        />
      </div>

      <div className="space-y-4">
        {filteredLeagues.map((league) => (
          <Card key={league.id}>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy className="w-5 h-5 text-rfl-coral" />
                    <h3 className="font-semibold text-rfl-navy">{league.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Host: {league.hostName}</p>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {league.memberCount} members
                    </span>
                    <span>{league.teamCount} teams</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLeagues.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">No leagues found.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
