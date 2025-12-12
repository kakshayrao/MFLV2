'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users, 
  Trophy, 
  FileCheck, 
  DollarSign, 
  TrendingUp,
  Activity,
  AlertCircle
} from 'lucide-react'

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalLeagues: number
  activeLeagues: number
  totalTeams: number
  pendingSubmissions: number
  totalRevenue: number
  monthlyRevenue: number
  approvalRate: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalLeagues: 0,
    activeLeagues: 0,
    totalTeams: 0,
    pendingSubmissions: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    approvalRate: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch real stats from API
    const fetchStats = async () => {
      try {
        // Placeholder data
        setStats({
          totalUsers: 156,
          activeUsers: 89,
          totalLeagues: 12,
          activeLeagues: 8,
          totalTeams: 45,
          pendingSubmissions: 23,
          totalRevenue: 12450.00,
          monthlyRevenue: 2890.00,
          approvalRate: 94.5,
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      subtitle: `${stats.activeUsers} active (7d)`,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Leagues',
      value: stats.totalLeagues,
      subtitle: `${stats.activeLeagues} active`,
      icon: Trophy,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Teams',
      value: stats.totalTeams,
      subtitle: 'Across all leagues',
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Pending Submissions',
      value: stats.pendingSubmissions,
      subtitle: 'Awaiting review',
      icon: FileCheck,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      subtitle: 'All time',
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Monthly Revenue',
      value: `$${stats.monthlyRevenue.toFixed(2)}`,
      subtitle: 'This month',
      icon: TrendingUp,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-rfl-coral border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-rfl-navy">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Platform overview and key metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-rfl-navy">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a
              href="/admin/submissions"
              className="block p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-rfl-navy">Review Submissions</p>
                  <p className="text-sm text-gray-600">{stats.pendingSubmissions} pending</p>
                </div>
                <FileCheck className="w-5 h-5 text-orange-600" />
              </div>
            </a>
            
            <a
              href="/admin/users"
              className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-rfl-navy">Manage Users</p>
                  <p className="text-sm text-gray-600">{stats.totalUsers} total users</p>
                </div>
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </a>
            
            <a
              href="/admin/financial"
              className="block p-4 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-rfl-navy">Financial Overview</p>
                  <p className="text-sm text-gray-600">${stats.monthlyRevenue.toFixed(2)} this month</p>
                </div>
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Approval Rate</span>
                <span className="text-sm font-medium text-rfl-navy">{stats.approvalRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${stats.approvalRate}%` }}
                />
              </div>
            </div>

            <div className="pt-4 border-t space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">API Status</span>
                <span className="flex items-center gap-2 text-green-600 font-medium">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Database</span>
                <span className="flex items-center gap-2 text-green-600 font-medium">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Connected
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">Activity feed coming soon...</p>
        </CardContent>
      </Card>
    </div>
  )
}
