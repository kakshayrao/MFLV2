'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, Save, X, Calendar } from 'lucide-react'

interface ChallengeTemplate {
  id: string
  name: string
  description: string
  category: 'team' | 'individual' | 'mixed'
  scoringType: 'points' | 'time' | 'distance' | 'count'
  defaultDuration: number // days
  isActive: boolean
  rulesPdfUrl?: string
  createdAt: string
}

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<ChallengeTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [newChallenge, setNewChallenge] = useState<Partial<ChallengeTemplate> | null>(null)

  useEffect(() => {
    fetchChallenges()
  }, [])

  const fetchChallenges = async () => {
    try {
      // TODO: Fetch from API
      // Placeholder data
      setChallenges([
        {
          id: '1',
          name: 'Step Challenge',
          description: 'Most steps in a week wins',
          category: 'team',
          scoringType: 'count',
          defaultDuration: 7,
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Distance Marathon',
          description: 'First team to reach combined 42km',
          category: 'team',
          scoringType: 'distance',
          defaultDuration: 30,
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Individual Sprint',
          description: 'Fastest 5K time',
          category: 'individual',
          scoringType: 'time',
          defaultDuration: 14,
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      ])
    } catch (error) {
      console.error('Error fetching challenges:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddNew = () => {
    setNewChallenge({
      name: '',
      description: '',
      category: 'team',
      scoringType: 'points',
      defaultDuration: 7,
      isActive: true,
    })
  }

  const handleSaveNew = async () => {
    if (!newChallenge?.name || !newChallenge?.description) return
    
    // TODO: Save to API
    const created: ChallengeTemplate = {
      id: Date.now().toString(),
      name: newChallenge.name,
      description: newChallenge.description,
      category: newChallenge.category || 'team',
      scoringType: newChallenge.scoringType || 'points',
      defaultDuration: newChallenge.defaultDuration || 7,
      isActive: newChallenge.isActive ?? true,
      rulesPdfUrl: newChallenge.rulesPdfUrl,
      createdAt: new Date().toISOString(),
    }
    
    setChallenges([...challenges, created])
    setNewChallenge(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this challenge template?')) return
    
    // TODO: Delete via API
    setChallenges(challenges.filter(c => c.id !== id))
  }

  const handleToggleActive = async (id: string) => {
    // TODO: Update via API
    setChallenges(challenges.map(c => 
      c.id === id ? { ...c, isActive: !c.isActive } : c
    ))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-rfl-coral border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading challenges...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-rfl-navy">Challenge Templates</h1>
          <p className="text-gray-600 mt-2">Manage challenge templates that hosts can configure</p>
        </div>
        <Button
          onClick={handleAddNew}
          className="bg-rfl-coral hover:bg-rfl-coral/90 text-white w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Challenge
        </Button>
      </div>

      {/* New Challenge Form */}
      {newChallenge && (
        <Card className="mb-6 border-rfl-coral">
          <CardHeader>
            <CardTitle className="text-lg">New Challenge Template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Challenge Name *
                </label>
                <input
                  type="text"
                  value={newChallenge.name || ''}
                  onChange={(e) => setNewChallenge({ ...newChallenge, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rfl-coral focus:border-transparent"
                  placeholder="e.g., Monthly Step Challenge"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={newChallenge.description || ''}
                  onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rfl-coral focus:border-transparent"
                  placeholder="Describe the challenge objective..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={newChallenge.category || 'team'}
                    onChange={(e) => setNewChallenge({ ...newChallenge, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rfl-coral focus:border-transparent"
                  >
                    <option value="team">Team</option>
                    <option value="individual">Individual</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scoring Type *
                  </label>
                  <select
                    value={newChallenge.scoringType || 'points'}
                    onChange={(e) => setNewChallenge({ ...newChallenge, scoringType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rfl-coral focus:border-transparent"
                  >
                    <option value="points">Points</option>
                    <option value="time">Time</option>
                    <option value="distance">Distance</option>
                    <option value="count">Count</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Duration (days)
                  </label>
                  <input
                    type="number"
                    value={newChallenge.defaultDuration || 7}
                    onChange={(e) => setNewChallenge({ ...newChallenge, defaultDuration: parseInt(e.target.value) || 7 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rfl-coral focus:border-transparent"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rules PDF URL (optional)
                </label>
                <input
                  type="url"
                  value={newChallenge.rulesPdfUrl || ''}
                  onChange={(e) => setNewChallenge({ ...newChallenge, rulesPdfUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rfl-coral focus:border-transparent"
                  placeholder="https://example.com/rules.pdf"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSaveNew}
                className="bg-rfl-coral hover:bg-rfl-coral/90 text-white"
                disabled={!newChallenge.name || !newChallenge.description}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Challenge
              </Button>
              <Button
                onClick={() => setNewChallenge(null)}
                variant="outline"
                className="border-gray-300"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Challenges List */}
      <div className="grid grid-cols-1 gap-4">
        {challenges.map((challenge) => (
          <Card key={challenge.id} className={!challenge.isActive ? 'opacity-60' : ''}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-rfl-navy">{challenge.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      challenge.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {challenge.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full capitalize">
                      {challenge.category}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full capitalize">
                      {challenge.scoringType}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{challenge.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {challenge.defaultDuration} days
                    </span>
                    {challenge.rulesPdfUrl && (
                      <a
                        href={challenge.rulesPdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-rfl-coral hover:underline"
                      >
                        View Rules PDF
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleToggleActive(challenge.id)}
                    variant="outline"
                    size="sm"
                    className="border-gray-300"
                  >
                    {challenge.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-300"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(challenge.id)}
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {challenges.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">No challenge templates yet. Add your first challenge!</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
