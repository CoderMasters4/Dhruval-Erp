import React from 'react'
import { 
  Plus, 
  Users, 
  Package, 
  ShoppingCart, 
  Factory, 
  FileText,
  Settings,
  BarChart3,
  UserPlus,
  Building2,
  Shield,
  Wrench,
  ClipboardCheck
} from 'lucide-react'
import { useDashboardPermissions } from '@/lib/hooks/useDashboardPermissions'
import { useSelector } from 'react-redux'
import { selectIsSuperAdmin } from '@/lib/features/auth/authSlice'
import { useRouter } from 'next/navigation'

interface QuickAction {
  title: string
  description: string
  icon: React.ElementType
  color: 'sky' | 'black'
  href: string
}

interface RoleBasedQuickActionsProps {
  loading?: boolean
  permissions?: any
}

export const RoleBasedQuickActions: React.FC<RoleBasedQuickActionsProps> = ({ loading = false, permissions }) => {
  const dashboardPermissions = useDashboardPermissions()
  const isSuperAdmin = useSelector(selectIsSuperAdmin)
  const router = useRouter()

  // Use provided permissions or fallback to hook
  const actualPermissions = permissions || dashboardPermissions

  const getActionsForRole = (): QuickAction[] => {
    // Super Admin - System management actions
    if (isSuperAdmin) {
      return [
        {
          title: 'Add Company',
          description: 'Register new company',
          icon: Building2,
          color: 'sky',
          href: '/admin/companies/new'
        },
        {
          title: 'Manage Users',
          description: 'System user management',
          icon: Users,
          color: 'black',
          href: '/admin/users'
        },
        {
          title: 'System Settings',
          description: 'Configure system',
          icon: Settings,
          color: 'sky',
          href: '/admin/settings'
        },
        {
          title: 'Security Logs',
          description: 'View security events',
          icon: Shield,
          color: 'black',
          href: '/admin/security'
        }
      ]
    }
    
    // Company Owner - Business management actions
    if (actualPermissions.canViewFinancials && actualPermissions.canViewOrders) {
      return [
        {
          title: 'New Order',
          description: 'Create customer order',
          icon: ShoppingCart,
          color: 'sky',
          href: '/orders/new'
        },
        {
          title: 'Add Customer',
          description: 'Register new customer',
          icon: UserPlus,
          color: 'black',
          href: '/customers/new'
        },
        {
          title: 'View Reports',
          description: 'Business analytics',
          icon: BarChart3,
          color: 'sky',
          href: '/reports'
        },
        {
          title: 'Manage Users',
          description: 'Company user management',
          icon: Users,
          color: 'black',
          href: '/users'
        }
      ]
    }
    
    // Production Manager - Production focused actions
    if (actualPermissions.canViewProduction) {
      return [
        {
          title: 'Start Production',
          description: 'Begin production run',
          icon: Factory,
          color: 'sky',
          href: '/production/new'
        },
        {
          title: 'Quality Check',
          description: 'Perform quality inspection',
          icon: ClipboardCheck,
          color: 'black',
          href: '/quality/check'
        },
        {
          title: 'Inventory Update',
          description: 'Update stock levels',
          icon: Package,
          color: 'sky',
          href: '/inventory/update'
        },
        {
          title: 'Maintenance',
          description: 'Schedule maintenance',
          icon: Wrench,
          color: 'black',
          href: '/maintenance/schedule'
        }
      ]
    }
    
    // Operator - Task focused actions
    return [
      {
        title: 'Start Task',
        description: 'Begin assigned work',
        icon: Plus,
        color: 'sky',
        href: '/tasks/start'
      },
      {
        title: 'Report Issue',
        description: 'Report equipment issue',
        icon: FileText,
        color: 'black',
        href: '/issues/report'
      },
      {
        title: 'Check Inventory',
        description: 'View material status',
        icon: Package,
        color: 'sky',
        href: '/inventory/view'
      },
      {
        title: 'My Tasks',
        description: 'View assigned tasks',
        icon: ClipboardCheck,
        color: 'black',
        href: '/tasks/my'
      }
    ]
  }

  const actions = getActionsForRole()

  const handleActionClick = (href: string) => {
    router.push(href)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border-2 border-sky-500 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-black">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 border-2 border-sky-200 rounded-lg animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-sky-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-sky-200 rounded w-3/4"></div>
                  <div className="h-3 bg-sky-200 rounded w-1/2"></div>
                </div>
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
        <h3 className="text-base sm:text-lg font-semibold text-black">Quick Actions</h3>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => handleActionClick(action.href)}
            className="p-3 sm:p-4 border-2 border-sky-200 rounded-lg hover:border-sky-500 hover:bg-sky-50 transition-all text-left group"
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg flex-shrink-0 ${action.color === 'sky' ? 'bg-sky-500 group-hover:bg-black' : 'bg-black group-hover:bg-sky-500'} transition-colors`}>
                <action.icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm sm:text-base font-medium text-black group-hover:text-sky-600 truncate">
                  {action.title}
                </h4>
                <p className="text-xs sm:text-sm text-black opacity-75 truncate">
                  {action.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
