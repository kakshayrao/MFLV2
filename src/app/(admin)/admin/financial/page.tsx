'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DollarSign, TrendingUp, CreditCard, Download, Filter } from 'lucide-react'

interface FinancialStats {
  totalRevenue: number
  monthlyRevenue: number
  weeklyRevenue: number
  todayRevenue: number
  totalTransactions: number
  activeSubscriptions: number
  pendingPayouts: number
  refundRate: number
}

export default function FinancialPage() {
  const [stats, setStats] = useState<FinancialStats>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    weeklyRevenue: 0,
    todayRevenue: 0,
    totalTransactions: 0,
    activeSubscriptions: 0,
    pendingPayouts: 0,
    refundRate: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFinancialData()
  }, [])

  const fetchFinancialData = async () => {
    try {
      // TODO: Fetch from API
      setStats({
        totalRevenue: 45230.50,
        monthlyRevenue: 12450.00,
        weeklyRevenue: 2890.00,
        todayRevenue: 420.00,
        totalTransactions: 1248,
        activeSubscriptions: 89,
        pendingPayouts: 3,
        refundRate: 2.3,
      })
    } catch (error) {
      console.error('Error fetching financial data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-rfl-coral border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading financial data...</p>
        </div>
      </div>
    )
  }

  const revenueCards = [
    { label: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, change: '+12.5%', color: 'text-emerald-600' },
    { label: 'This Month', value: `$${stats.monthlyRevenue.toFixed(2)}`, change: '+8.2%', color: 'text-blue-600' },
    { label: 'This Week', value: `$${stats.weeklyRevenue.toFixed(2)}`, change: '+5.4%', color: 'text-purple-600' },
    { label: 'Today', value: `$${stats.todayRevenue.toFixed(2)}`, change: '-', color: 'text-teal-600' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-rfl-navy">Financial Dashboard</h1>
          <p className="text-gray-600 mt-2">Revenue and payment analytics</p>
        </div>
        <Button variant="outline" className="hidden sm:flex">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {revenueCards.map((card, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">{card.label}</span>
                <DollarSign className={`w-4 h-4 ${card.color}`} />
              </div>
              <div className="text-2xl font-bold text-rfl-navy">{card.value}</div>
              <p className="text-xs text-green-600 mt-1">{card.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-2">Total Transactions</div>
            <div className="text-2xl font-bold text-rfl-navy">{stats.totalTransactions}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-2">Active Subscriptions</div>
            <div className="text-2xl font-bold text-rfl-navy">{stats.activeSubscriptions}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-2">Pending Payouts</div>
            <div className="text-2xl font-bold text-rfl-navy">{stats.pendingPayouts}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-2">Refund Rate</div>
            <div className="text-2xl font-bold text-rfl-navy">{stats.refundRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">Transaction list coming soon...</p>
        </CardContent>
      </Card>
    </div>
  )
}
