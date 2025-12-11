'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'

interface ActivityType {
  id: string
  name: string
  category: 'cardio' | 'strength' | 'sport' | 'other'
  minDuration?: number
  requiresDistance?: boolean
  requiresSteps?: boolean
  requiresHoles?: boolean
  isActive: boolean
  createdAt: string
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<ActivityType[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newActivity, setNewActivity] = useState<Partial<ActivityType> | null>(null)

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      // TODO: Fetch from API
      // Placeholder data
      setActivities([
        {
          id: '1',
          name: 'Running',
          category: 'cardio',
          minDuration: 15,
          requiresDistance: true,
          requiresSteps: false,
          requiresHoles: false,
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Cycling',
          category: 'cardio',
          minDuration: 20,
          requiresDistance: true,
          requiresSteps: false,
          requiresHoles: false,
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Golf',
          category: 'sport',
          minDuration: 60,
          requiresDistance: false,
          requiresSteps: false,
          requiresHoles: true,
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: '4',
          name: 'Weight Training',
          category: 'strength',
          minDuration: 20,
          requiresDistance: false,
          requiresSteps: false,
          requiresHoles: false,
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      ])
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddNew = () => {
    setNewActivity({
      name: '',
      category: 'cardio',
      minDuration: 0,
      requiresDistance: false,
      requiresSteps: false,
      requiresHoles: false,
      isActive: true,
    })
  }

  const handleSaveNew = async () => {
    if (!newActivity?.name) return
    
    // TODO: Save to API
    const created: ActivityType = {
      id: Date.now().toString(),
      name: newActivity.name,
      category: newActivity.category || 'cardio',
      minDuration: newActivity.minDuration,
      requiresDistance: newActivity.requiresDistance || false,
      requiresSteps: newActivity.requiresSteps || false,
      requiresHoles: newActivity.requiresHoles || false,
      isActive: newActivity.isActive ?? true,
      createdAt: new Date().toISOString(),
    }
    
    setActivities([...activities, created])
    setNewActivity(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this activity type?')) return
    
    // TODO: Delete via API
    setActivities(activities.filter(a => a.id !== id))
  }

  const handleToggleActive = async (id: string) => {
    // TODO: Update via API
    setActivities(activities.map(a => 
      a.id === id ? { ...a, isActive: !a.isActive } : a
    ))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-rfl-coral border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading activities...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-rfl-navy">Activity Types</h1>
          <p className="text-gray-600 mt-2">Manage available workout and activity types</p>
        </div>
        <Button
          onClick={handleAddNew}
          className="bg-rfl-coral hover:bg-rfl-coral/90 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Activity
        </Button>
      </div>

      {/* New Activity Form */}
      {newActivity && (
        <Card className="mb-6 border-rfl-coral">
          <CardHeader>
            <CardTitle className="text-lg">New Activity Type</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activity Name *
                </label>
                <input
                  type="text"
                  value={newActivity.name || ''}
                  onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rfl-coral focus:border-transparent"
                  placeholder="e.g., Swimming"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={newActivity.category || 'cardio'}
                  onChange={(e) => setNewActivity({ ...newActivity, category: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rfl-coral focus:border-transparent"
                >
                  <option value="cardio">Cardio</option>
                  <option value="strength">Strength</option>
                  <option value="sport">Sport</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Duration (minutes)
                </label>
                <input
                  type="number"
                  value={newActivity.minDuration || ''}
                  onChange={(e) => setNewActivity({ ...newActivity, minDuration: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rfl-coral focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newActivity.requiresDistance || false}
                  onChange={(e) => setNewActivity({ ...newActivity, requiresDistance: e.target.checked })}
                  className="w-4 h-4 text-rfl-coral rounded focus:ring-rfl-coral"
                />
                <span className="text-sm text-gray-700">Requires Distance</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newActivity.requiresSteps || false}
                  onChange={(e) => setNewActivity({ ...newActivity, requiresSteps: e.target.checked })}
                  className="w-4 h-4 text-rfl-coral rounded focus:ring-rfl-coral"
                />
                <span className="text-sm text-gray-700">Requires Steps</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newActivity.requiresHoles || false}
                  onChange={(e) => setNewActivity({ ...newActivity, requiresHoles: e.target.checked })}
                  className="w-4 h-4 text-rfl-coral rounded focus:ring-rfl-coral"
                />
                <span className="text-sm text-gray-700">Requires Holes (for golf)</span>
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSaveNew}
                className="bg-rfl-coral hover:bg-rfl-coral/90 text-white"
                disabled={!newActivity.name}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Activity
              </Button>
              <Button
                onClick={() => setNewActivity(null)}
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

      {/* Activities List */}
      <div className="grid grid-cols-1 gap-4">
        {activities.map((activity) => (
          <Card key={activity.id} className={!activity.isActive ? 'opacity-60' : ''}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-rfl-navy">{activity.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      activity.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {activity.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full capitalize">
                      {activity.category}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    {activity.minDuration && (
                      <span>Min: {activity.minDuration} min</span>
                    )}
                    {activity.requiresDistance && (
                      <span className="text-purple-600">• Requires Distance</span>
                    )}
                    {activity.requiresSteps && (
                      <span className="text-purple-600">• Requires Steps</span>
                    )}
                    {activity.requiresHoles && (
                      <span className="text-purple-600">• Requires Holes</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleToggleActive(activity.id)}
                    variant="outline"
                    size="sm"
                    className="border-gray-300"
                  >
                    {activity.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    onClick={() => setEditingId(activity.id)}
                    variant="outline"
                    size="sm"
                    className="border-gray-300"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(activity.id)}
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

      {activities.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">No activity types yet. Add your first activity!</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
