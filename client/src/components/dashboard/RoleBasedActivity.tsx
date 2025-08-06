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
}

export const RoleBasedActivity: React.FC<RoleBasedActivityProps> = ({ activities: propActivities, loading = false }) => {
  const permissions = useDashboardPermissions()
  const isSuperAdmin = useSelector(selectIsSuperAdmin)

  const getActivitiesForRole = (): Activity[] => {
    // If activities are provided as props, use them
    if (propActivities && propActivities.length > 0) {
      return propActivities
    }
    // Super Admin - System-wide activities
    if (isSuperAdmin) {
      return [
        {
          id: '1',
          type: 'system',
          title: 'System Backup Completed',
          description: 'Daily backup completed successfully for all companies',
          timestamp: '2 minutes ago',
          user: 'System',
          status: 'success'
        },
        {
          id: '2',
          type: 'user',
          title: 'New Company Registered',
          description: 'ABC Manufacturing Ltd. registered with 15 users',
          timestamp: '15 minutes ago',
          user: 'Admin',
          status: 'info'
        },
        {
          id: '3',
          type: 'system',
          title: 'Security Alert',
          description: 'Multiple failed login attempts detected',
          timestamp: '1 hour ago',
          user: 'Security System',
          status: 'warning'
        },
        {
          id: '4',
          type: 'finance',
          title: 'Monthly Revenue Report',
          description: 'Generated revenue report for all companies',
          timestamp: '2 hours ago',
          user: 'System',
          status: 'success'
        }
      ]
    }
    
    // Company Owner - Business activities
    if (permissions.canViewFinancials && permissions.canViewOrders) {
      return [
        {
          id: '1',
          type: 'order',
          title: 'New Order Received',
          description: 'Order #ORD-2024-001 from Reliance Industries - ₹2,50,000',
          timestamp: '5 minutes ago',
          user: 'Sales Team',
          status: 'success'
        },
        {
          id: '2',
          type: 'finance',
          title: 'Payment Received',
          description: 'Payment of ₹1,80,000 received from Tata Motors',
          timestamp: '30 minutes ago',
          user: 'Accounts',
          status: 'success'
        },
        {
          id: '3',
          type: 'production',
          title: 'Production Target Achieved',
          description: 'Monthly production target of 500 units completed',
          timestamp: '1 hour ago',
          user: 'Production Manager',
          status: 'success'
        },
        {
          id: '4',
          type: 'inventory',
          title: 'Low Stock Alert',
          description: 'Steel sheets inventory below minimum threshold',
          timestamp: '2 hours ago',
          user: 'Inventory System',
          status: 'warning'
        }
      ]
    }
    
    // Production Manager - Production focused
    if (permissions.canViewProduction) {
      return [
        {
          id: '1',
          type: 'production',
          title: 'Production Line Started',
          description: 'Line A started production of automotive parts',
          timestamp: '10 minutes ago',
          user: 'Operator 1',
          status: 'info'
        },
        {
          id: '2',
          type: 'quality',
          title: 'Quality Check Passed',
          description: 'Batch QC-2024-045 passed all quality parameters',
          timestamp: '25 minutes ago',
          user: 'Quality Inspector',
          status: 'success'
        },
        {
          id: '3',
          type: 'inventory',
          title: 'Raw Material Received',
          description: 'Steel sheets - 500 kg received from supplier',
          timestamp: '45 minutes ago',
          user: 'Store Keeper',
          status: 'success'
        },
        {
          id: '4',
          type: 'production',
          title: 'Machine Maintenance',
          description: 'CNC Machine 3 scheduled for maintenance',
          timestamp: '1 hour ago',
          user: 'Maintenance Team',
          status: 'warning'
        }
      ]
    }
    
    // Operator - Task focused
    return [
      {
        id: '1',
        type: 'production',
        title: 'Task Completed',
        description: 'Completed machining of 25 automotive parts',
        timestamp: '15 minutes ago',
        user: 'You',
        status: 'success'
      },
      {
        id: '2',
        type: 'quality',
        title: 'Quality Check Required',
        description: 'Batch ready for quality inspection',
        timestamp: '30 minutes ago',
        user: 'Production System',
        status: 'info'
      },
      {
        id: '3',
        type: 'production',
        title: 'New Task Assigned',
        description: 'Assembly of electronic components - 50 units',
        timestamp: '1 hour ago',
        user: 'Supervisor',
        status: 'info'
      },
      {
        id: '4',
        type: 'inventory',
        title: 'Material Request',
        description: 'Requested additional screws for assembly',
        timestamp: '2 hours ago',
        user: 'You',
        status: 'info'
      }
    ]
  }

  const activities = getActivitiesForRole()

  if (loading) {
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

  return (
    <div className="bg-white rounded-xl border-2 border-sky-500 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-black">Recent Activity</h3>
        <button className="text-xs sm:text-sm text-sky-500 hover:text-black font-medium">
          View All
        </button>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {activities.map((activity) => (
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
