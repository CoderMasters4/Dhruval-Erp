import React from 'react'
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  Clock,
  TrendingUp
} from 'lucide-react'
import { User } from '@/lib/features/users/usersApi'

interface UserStatsProps {
  users: User[]
  totalUsers?: number
  isLoading: boolean
}

export default function UserStats({ users, totalUsers, isLoading }: UserStatsProps) {
  // Calculate stats from users data
  const activeUsers = users.filter(user => user.isActive).length
  const inactiveUsers = users.filter(user => !user.isActive).length
  const adminUsers = users.filter(user => user.role === 'super_admin' || user.role === 'admin').length
  const users2FA = users.filter(user => user.is2FAEnabled).length
  const recentLogins = users.filter(user => {
    if (!user.lastLogin) return false
    const lastLogin = new Date(user.lastLogin)
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    return lastLogin > dayAgo
  }).length

  // Use provided totalUsers or calculate from users array
  const actualTotalUsers = totalUsers || users.length

  const stats = [
    {
      title: 'Total Users',
      value: actualTotalUsers,
      icon: Users,
      color: 'bg-sky-500',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-200',
      textColor: 'text-sky-600',
      change: '+12%',
      changeColor: 'text-green-600'
    },
    {
      title: 'Active Users',
      value: activeUsers,
      icon: UserCheck,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-600',
      change: '+8%',
      changeColor: 'text-green-600'
    },
    {
      title: 'Inactive Users',
      value: inactiveUsers,
      icon: UserX,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-600',
      change: '-3%',
      changeColor: 'text-red-600'
    },
    {
      title: 'Admin Users',
      value: adminUsers,
      icon: Shield,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-600',
      change: '+2%',
      changeColor: 'text-green-600'
    },
    {
      title: '2FA Enabled',
      value: users2FA,
      icon: Shield,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-600',
      change: '+15%',
      changeColor: 'text-green-600'
    },
    {
      title: 'Recent Logins',
      value: recentLogins,
      icon: Clock,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      textColor: 'text-indigo-600',
      change: '+5%',
      changeColor: 'text-green-600'
    }
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-lg border border-sky-200 p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
              <div className="w-8 h-4 bg-gray-200 rounded"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div
            key={index}
            className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg ${stat.borderColor} dark:border-gray-700 border p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 ${stat.bgColor} dark:bg-gray-700 rounded-xl`}>
                <Icon className={`w-6 h-6 ${stat.textColor} dark:text-gray-300`} />
              </div>
              <div className="flex items-center">
                <TrendingUp className={`w-4 h-4 ${stat.changeColor} mr-1`} />
                <span className={`text-sm font-semibold ${stat.changeColor}`}>
                  {stat.change}
                </span>
              </div>
            </div>
            
            <div className="mb-2">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </p>
            </div>
            
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {stat.title}
            </p>
          </div>
        )
      })}
    </div>
  )
}