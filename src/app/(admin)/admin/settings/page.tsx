'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings as SettingsIcon, Save } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-rfl-navy">Platform Settings</h1>
        <p className="text-gray-600 mt-2">Configure platform-wide settings</p>
      </div>

      {/* General Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Platform Name
            </label>
            <input
              type="text"
              defaultValue="Family Fitness League"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rfl-coral focus:border-transparent"
            />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 text-rfl-coral rounded focus:ring-rfl-coral"
              />
              <span className="text-sm text-gray-700">Enable user registration</span>
            </label>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 text-rfl-coral rounded focus:ring-rfl-coral"
              />
              <span className="text-sm text-gray-700">Maintenance mode</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* League Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>League Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max teams per league
            </label>
            <input
              type="number"
              defaultValue={20}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rfl-coral focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max members per team
            </label>
            <input
              type="number"
              defaultValue={15}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rfl-coral focus:border-transparent"
            />
          </div>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Email Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 text-rfl-coral rounded focus:ring-rfl-coral"
              />
              <span className="text-sm text-gray-700">Send welcome emails</span>
            </label>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 text-rfl-coral rounded focus:ring-rfl-coral"
              />
              <span className="text-sm text-gray-700">Send weekly digest emails</span>
            </label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button className="bg-rfl-coral hover:bg-rfl-coral/90 text-white">
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  )
}
