import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp,
  Car,
  Package,
  Wrench,
  AlertTriangle
} from 'lucide-react'
import { GatePassStats as GatePassStatsType } from '@/lib/features/gatepasses/gatepassesApi'

interface GatePassStatsProps {
  stats?: GatePassStatsType
  isLoading?: boolean
}

export default function GatePassStats({ stats, isLoading }: GatePassStatsProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total',
      value: stats.totalGatePasses,
      icon: FileText,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      iconColor: 'text-gray-400'
    },
    {
      title: 'Active',
      value: stats.activeGatePasses,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-400'
    },
    {
      title: 'Completed',
      value: stats.completedGatePasses,
      icon: CheckCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-400'
    },
    {
      title: 'Expired',
      value: stats.expiredGatePasses,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      iconColor: 'text-red-400'
    },
    {
      title: 'Cancelled',
      value: stats.cancelledGatePasses,
      icon: XCircle,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      iconColor: 'text-gray-400'
    }
  ]

  const purposeIcons = {
    delivery: Package,
    pickup: Car,
    maintenance: Wrench,
    other: AlertTriangle
  }

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  <div className={`p-2 rounded-full ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Gate Passes</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.todayGatePasses}</p>
              </div>
              <div className="p-2 rounded-full bg-indigo-100">
                <Clock className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(stats.averageDuration)} min
                </p>
              </div>
              <div className="p-2 rounded-full bg-purple-100">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {stats.totalGatePasses > 0 
                    ? Math.round((stats.completedGatePasses / stats.totalGatePasses) * 100)
                    : 0}%
                </p>
              </div>
              <div className="p-2 rounded-full bg-emerald-100">
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Purpose Breakdown */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-4">Purpose Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.purposeBreakdown || {}).map(([purpose, count]) => {
              const Icon = purposeIcons[purpose as keyof typeof purposeIcons]
              const percentage = stats.totalGatePasses > 0 
                ? Math.round((count / stats.totalGatePasses) * 100)
                : 0
              
              return (
                <div key={purpose} className="text-center">
                  <div className="flex justify-center mb-2">
                    <div className="p-2 rounded-full bg-gray-100">
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-600 capitalize">{purpose}</p>
                  <p className="text-xl font-bold text-gray-900">{count}</p>
                  <p className="text-xs text-gray-500">{percentage}%</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
