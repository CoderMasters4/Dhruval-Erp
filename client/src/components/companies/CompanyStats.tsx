'use client'

import React from 'react'
import { 
  Building2, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Users, 
  DollarSign,
  Calendar,
  Activity
} from 'lucide-react'
import clsx from 'clsx'

interface CompanyStatsProps {
  stats: {
    totalCompanies: number
    activeCompanies: number
    inactiveCompanies: number
    newThisMonth: number
    totalUsers?: number
    totalRevenue?: number
    averageOrderValue?: number
    topPerformingCompany?: {
      name: string
      revenue: number
    }
  }
  isLoading?: boolean
}

const CompanyStats: React.FC<CompanyStatsProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Companies',
      value: stats.totalCompanies,
      icon: Building2,
      bgColor: 'bg-sky-500',
      iconBg: 'bg-sky-400',
      textColor: 'text-sky-100',
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      title: 'Active Companies',
      value: stats.activeCompanies,
      icon: CheckCircle,
      bgColor: 'bg-green-500',
      iconBg: 'bg-green-400',
      textColor: 'text-green-100',
      change: '+8%',
      changeType: 'positive' as const
    },
    {
      title: 'Inactive Companies',
      value: stats.inactiveCompanies,
      icon: XCircle,
      bgColor: 'bg-gray-500',
      iconBg: 'bg-gray-400',
      textColor: 'text-gray-100',
      change: '-3%',
      changeType: 'negative' as const
    },
    {
      title: 'New This Month',
      value: stats.newThisMonth,
      icon: TrendingUp,
      bgColor: 'bg-yellow-500',
      iconBg: 'bg-yellow-400',
      textColor: 'text-yellow-100',
      change: '+25%',
      changeType: 'positive' as const
    }
  ]

  return (
    <div className="space-y-8">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={clsx(
              'relative overflow-hidden rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1',
              card.bgColor
            )}
          >
            {/* Background Pattern */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full"></div>
            <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-white/10 rounded-full"></div>

            <div className="relative z-10 flex items-center justify-between">
              <div className="flex-1">
                <p className={clsx('text-sm font-semibold mb-3', card.textColor)}>
                  {card.title}
                </p>
                <p className="text-3xl font-bold mb-3 text-white">
                  {card.value.toLocaleString()}
                </p>
                <div className="flex items-center text-white">
                  <Activity className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">
                    {card.change} from last month
                  </span>
                </div>
              </div>
              <div className="ml-4">
                <div className={clsx('p-3 rounded-xl', card.iconBg)}>
                  <card.icon className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Stats */}
      {(stats.totalUsers || stats.totalRevenue) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.totalUsers && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.totalUsers.toLocaleString()}
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </div>
          )}

          {stats.totalRevenue && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    ₹{stats.totalRevenue.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </div>
          )}

          {stats.topPerformingCompany && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Top Performer</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    {stats.topPerformingCompany.name}
                  </p>
                  <p className="text-sm text-green-600 font-medium">
                    ₹{stats.topPerformingCompany.revenue.toLocaleString()}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CompanyStats
