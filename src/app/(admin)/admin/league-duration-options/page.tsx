'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings as SettingsIcon, Plus, Edit, Trash2, Save, X } from 'lucide-react'

interface DurationOption {
  id: string
  duration_days: number
  display_name: string
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export default function LeagueDurationOptionsPage() {
  const [options, setOptions] = useState<DurationOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    duration_days: '',
    display_name: '',
    display_order: 0,
    is_active: true,
  })

  useEffect(() => {
    fetchOptions()
  }, [])

  const fetchOptions = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/league-duration-options')
      if (!res.ok) throw new Error('Failed to fetch options')
      const { data } = await res.json()
      setOptions(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    try {
      const res = await fetch('/api/admin/league-duration-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duration_days: parseInt(formData.duration_days),
          display_name: formData.display_name,
          display_order: formData.display_order,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to create option')
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      setShowAddForm(false)
      setFormData({ duration_days: '', display_name: '', display_order: 0, is_active: true })
      fetchOptions()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleUpdate = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/league-duration-options/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to update option')
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      setEditingId(null)
      setFormData({ duration_days: '', display_name: '', display_order: 0, is_active: true })
      fetchOptions()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this duration option?')) return

    try {
      const res = await fetch(`/api/admin/league-duration-options/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to delete option')
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      fetchOptions()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const startEdit = (option: DurationOption) => {
    setEditingId(option.id)
    setFormData({
      duration_days: option.duration_days.toString(),
      display_name: option.display_name,
      display_order: option.display_order,
      is_active: option.is_active,
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setShowAddForm(false)
    setFormData({ duration_days: '', display_name: '', display_order: 0, is_active: true })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-4 border-gray-900" />
          <p className="text-sm text-gray-600">Loading duration options...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-rfl-navy">League Duration Options</h1>
        <p className="text-gray-600 mt-2">Manage available league duration options for hosts</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          Operation completed successfully!
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Duration Options</CardTitle>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-rfl-coral hover:bg-rfl-coral/90 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Option
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h3 className="font-semibold mb-3">Add New Duration Option</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={formData.duration_days}
                    onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rfl-coral focus:border-transparent"
                    placeholder="e.g., 15"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rfl-coral focus:border-transparent"
                    placeholder="e.g., 15 Days"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rfl-coral focus:border-transparent"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Button
                    onClick={handleAdd}
                    className="bg-rfl-coral hover:bg-rfl-coral/90 text-white flex-1"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={cancelEdit}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {options.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No duration options configured</p>
            ) : (
              options.map((option) => (
                <div
                  key={option.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  {editingId === option.id ? (
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <input
                          type="number"
                          min="1"
                          max="365"
                          value={formData.duration_days}
                          onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rfl-coral focus:border-transparent"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={formData.display_name}
                          onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rfl-coral focus:border-transparent"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          min="0"
                          value={formData.display_order}
                          onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rfl-coral focus:border-transparent"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="w-4 h-4 text-rfl-coral rounded focus:ring-rfl-coral"
                          />
                          <span className="text-sm text-gray-700">Active</span>
                        </label>
                        <Button
                          onClick={() => handleUpdate(option.id)}
                          size="sm"
                          className="bg-rfl-coral hover:bg-rfl-coral/90 text-white"
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={cancelEdit}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <span className="font-semibold text-gray-900">{option.display_name}</span>
                          <span className="text-sm text-gray-500">({option.duration_days} days)</span>
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                            Order: {option.display_order}
                          </span>
                          {option.is_active ? (
                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                              Active
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(option)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(option.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

