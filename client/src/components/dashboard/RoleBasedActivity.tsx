import React from 'react'
import { 
  ShoppingCart, 
  Factory, 
  Package, 
  DollarSign, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Settings,
  UserPlus,
  Truck
} from 'lucide-react'
import { useDashboardPermissions } from '@/lib/hooks/useDashboardPermissions'
import { useSelector } from 'react-redux'
import { selectIsSuperAdmin } from '@/lib/features/auth/authSlice'
import { useGetRecentActivitiesQuery } from '@/lib/api/dashboardApi'

interface Activity {
  id: string
  type: 'order' | 'production' | 'inventory' | 'finance' | 'user' | 'quality' | 'system'
  title: string
  description: string
  timestamp: string
  user: string
  status: 'success' | 'warning' | 'error' | 'info'
}

const getActivityIcon = (type: string, status: string) => {
  const iconClass = `h-5 w-5 ${
    status === 'success' ? 'text-sky-500' : 
    status === 'warning' ? 'text-yellow-500' : 
    status === 'error' ? 'text-red-500' : 
    'text-black'
  }`

  switch (type) {
    case 'order': return <ShoppingCart className={iconClass} />
    case 'production': return <Factory className={iconClass} />
    case 'inventory': return <Package className={iconClass} />
    case 'finance': return <DollarSign className={iconClass} />
    case 'user': return <Users className={iconClass} />
    case 'quality': return <CheckCircle className={iconClass} />
    case 'system': return <Settings className={iconClass} />
    default: return <Clock className={iconClass} />
  }
}

const getStatusBadge = (status: string) => {
  const baseClass = "px-2 py-1 rounded-full text-xs font-medium"
  switch (status) {
    case 'success':
      return `${baseClass} bg-sky-100 text-sky-600 border border-sky-200`
    case 'warning':
      return `${baseClass} bg-yellow-100 text-yellow-600 border border-yellow-200`
    case 'error':
      return `${baseClass} bg-red-100 text-red-600 border border-red-200`
    default:
      return `${baseClass} bg-gray-100 text-gray-600 border border-gray-200`
  }
}

interface RoleBasedActivityProps {
  activities?: Activity[]
  loading?: boolean
  permissions?: any
}

export const RoleBasedActivity: React.FC<RoleBasedActivityProps> = ({ activities: propActivities, loading = false, permissions }) => {
  const dashboardPermissions = useDashboardPermissions()
  const isSuperAdmin = useSelector(selectIsSuperAdmin)

  // Use provided permissions or fallback to hook
  const actualPermissions = permissions || dashboardPermissions

  // Fetch real activities from API if not provided
  const { data: apiActivities, isLoading: apiLoading } = useGetRecentActivitiesQuery({ limit: 10 })

  // Use provided activities, then API activities, then empty array
  const activities = propActivities || apiActivities || []

  const isLoading = loading || apiLoading

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border-2 border-sky-500 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-black">Recent Activity</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start space-x-3 animate-pulse">
              <div className="w-10 h-10 bg-sky-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-sky-200 rounded w-3/4"></div>
                <div className="h-3 bg-sky-200 rounded w-1/2"></div>
                <div className="h-3 bg-sky-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Show empty state when no activities
  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white rounded-xl border-2 border-sky-500 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-black">Recent Activity</h3>
        </div>
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Activity</h3>
          <p className="text-gray-500">
            {isSuperAdmin 
              ? 'No system activities to display at the moment.'
              : 'No company activities to display at the moment.'
            }
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border-2 border-sky-500 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-black">Recent Activity</h3>
        <button className="text-xs sm:text-sm text-sky-500 hover:text-black font-medium">
          View All
        </button>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {activities.map((activity: Activity) => (
          <div key={activity.id} className="flex items-start space-x-3 p-2 sm:p-3 rounded-lg hover:bg-sky-50 transition-colors">
            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-white border-2 border-sky-500 rounded-full flex items-center justify-center">
              {getActivityIcon(activity.type, activity.status)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs sm:text-sm font-medium text-black">
                  {activity.title}
                </p>
                <span className={getStatusBadge(activity.status)}>
                  {activity.status}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-black opacity-75 mt-1 line-clamp-2">
                {activity.description}
              </p>
              <div className="flex items-center mt-1 sm:mt-2 text-xs text-black opacity-60">
                <span>{activity.timestamp}</span>
                <span className="mx-1 sm:mx-2">•</span>
                <span className="truncate">{activity.user}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
