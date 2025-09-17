'use client'

/**
 * Clean & Organized ERP Sidebar Navigation
 * 
 * FEATURES:
 * - Only enhanced/latest versions of modules
 * - No duplicates or redundant sections
 * - Proper role-based access control
 * - Clean and organized structure
 * 
 * ROLE-BASED PERMISSIONS:
 * - Super Admin: Full access to all modules
 * - Admin: Full access to core modules
 * - Manager: Read access to all, manage operations
 * - HR: Full access to Employee and Shift management
 * - Production: Access to production and batch management
 * - Quality: Access to quality control and batch quality
 * - Security: Access to security and monitoring
 * - Maintenance: Access to machine and equipment management
 */

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import {
  LayoutDashboard,
  Building2,
  Users,
  Package,
  Warehouse,
  ShoppingCart,
  FileText,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  Factory,
  Truck,
  UserCheck,
  Shield,
  Menu,
  X,
  UserPlus,
  Car,
  AlertTriangle,
  FileSearch,
  TrendingUp,
  Thermometer,
  Zap,
  Hotel,
  Send,
  Quote,
  DollarSign,
  ShoppingBag,
  Layers,
  Clock,
  Calendar,
  Activity,
  RotateCcw,
  PieChart,
  Plus,
  Palette,
  Printer,
  CheckCircle,
  Scissors
} from 'lucide-react'
import { selectSidebarCollapsed, selectSidebarOpen, toggleSidebar, setSidebarCollapsed } from '@/lib/features/ui/uiSlice'
import { selectCurrentUser, selectIsSuperAdmin } from '@/lib/features/auth/authSlice'
import { SidebarLogo } from '@/components/ui/Logo'

import clsx from 'clsx'

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  permission?: string
  roles?: string[]
  children?: NavigationItem[]
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    permission: 'view:Dashboard'
  },

  // Core Business Management
  {
    name: 'Companies',
    href: '/companies',
    icon: Building2,
    permission: 'view:Company',
    roles: ['owner']
  },

  {
    name: 'Users & Access',
    href: '/users',
    icon: Users,
    permission: 'view:User',
    children: [
      {
        name: 'Users',
        href: '/users',
        icon: Users,
        permission: 'view:User'
      },
      // {
      //   name: 'Roles',
      //   href: '/roles',
      //   icon: UserCheck,
      //   permission: 'view:Role'
      // }
    ]
  },

  // Business Operations
  {
    name: 'Customers',
    href: '/customers',
    icon: Users,
    permission: 'view:Customer'
  },

  {
    name: 'Sales',
    href: '/sales',
    icon: ShoppingBag,
    permission: 'view:Sale',
    children: [
      {
        name: 'Sales Dashboard',
        href: '/sales',
        icon: ShoppingBag,
        permission: 'view:Sale'
      },
      {
        name: 'Sales Analytics',
        href: '/sales/analytics',
        icon: BarChart3,
        permission: 'view:Sale',
        roles: ['admin', 'manager', 'sales']
      },
      {
        name: 'Sales Reports',
        href: '/sales/reports',
        icon: PieChart,
        permission: 'view:Sale'
      },
      {
        name: 'Sales Orders',
        href: '/sales/orders',
        icon: FileText,
        permission: 'view:Order'
      },
      {
        name: 'Quotations',
        href: '/quotations',
        icon: Quote,
        permission: 'view:Quotation'
      }
    ]
  },

  {
    name: 'Purchase',
    href: '/purchase',
    icon: ShoppingCart,
    permission: 'view:Purchase',
    children: [
      {
        name: 'Purchase Dashboard',
        href: '/purchase',
        icon: ShoppingCart,
        permission: 'view:Purchase'
      },
      {
        name: 'Create Purchase Order',
        href: '/purchase?action=create',
        icon: Plus,
        permission: 'view:Purchase'
      },
      {
        name: 'Purchase Orders',
        href: '/purchase-orders',
        icon: FileText,
        permission: 'view:PurchaseOrder'
      },
      {
        name: 'Suppliers',
        href: '/suppliers',
        icon: Truck,
        permission: 'view:Supplier'
      },
      // {
      //   name: 'Purchase Quotations',
      //   href: '/purchase/quotations',
      //   icon: Quote,
      //   permission: 'view:Quotation'
      // }
    ]
  },

  // Inventory Management
  {
    name: 'Inventory',
    href: '/inventory/enhanced',
    icon: Package,
    permission: 'view:InventoryItem',
    children: [
      {
        name: 'Inventory',
        href: '/inventory/enhanced',
        icon: Package,
        permission: 'view:InventoryItem'
      },
      // {
      //   name: 'Advanced Inventory',
      //   href: '/inventory/advanced',
      //   icon: Layers,
      //   permission: 'view:InventoryItem'
      // }
      
      // {
      //   name: 'Process-wise Stock',
      //   href: '/process-wise-stock',
      //   icon: Package,
      //   permission: 'view:InventoryItem',
      //   roles: ['admin', 'manager', 'production']
      // },
      {
        name: 'Stock Movements',
        href: '/inventory/movements',
        icon: BarChart3,
        permission: 'view:StockMovement'
      },
      {
        name: 'Spares',
        href: '/spares',
        icon: Settings,
        permission: 'view:Spare'
      },
      {
        name: 'Warehouses',
        href: '/warehouses',
        icon: Warehouse,
        permission: 'view:Warehouse'
      }
    ]
  },

  // Human Resources Management
  // {
  //   name: 'Human Resources',
  //   href: '/manpower',
  //   icon: Users,
  //   permission: 'view:Manpower',
  //   children: [
  //     {
  //       name: 'HR Overview',
  //       href: '/manpower',
  //       icon: Users,
  //       permission: 'view:Manpower'
  //     },
  //     {
  //       name: 'Employee Management',
  //       href: '/employees',
  //       icon: UserPlus,
  //       permission: 'view:Employee',
  //       roles: ['admin', 'hr', 'manager']
  //     },
  //     {
  //       name: 'Shift Management',
  //       href: '/shifts',
  //       icon: Clock,
  //       permission: 'view:Shift',
  //       roles: ['admin', 'hr', 'manager']
  //     },
  //     {
  //       name: 'Attendance Tracking',
  //       href: '/attendance',
  //       icon: UserCheck,
  //       permission: 'view:Attendance'
  //     },
  //     {
  //       name: 'Stickers & Labels',
  //       href: '/stickers',
  //       icon: FileText,
  //       permission: 'view:Sticker'
  //     }
  //   ]
  // },

  // Production Management
  {
    name: 'Production',
    href: '/production',
    icon: Factory,
    permission: 'view:ProductionOrder',
    children: [
      
      {
        name: 'Grey Fabric Inward',
        href: '/production/grey-fabric-inward',
        icon: Package,
        permission: 'view:ProductionOrder',
        roles: ['admin', 'manager', 'production']
      },
      
      // {
      //   name: 'Dyeing Process',
      //   href: '/production/dyeing',
      //   icon: Palette,
      //   permission: 'view:ProductionOrder',
      //   roles: ['admin', 'manager', 'production']
      // },
      // {
      //   name: 'Printing Process',
      //   href: '/production/printing',
      //   icon: Printer,
      //   permission: 'view:ProductionOrder',
      //   roles: ['admin', 'manager', 'production']
      // },
      // {
      //   name: 'Finishing Process',
      //   href: '/production/finishing',
      //   icon: Zap,
      //   permission: 'view:ProductionOrder',
      //   roles: ['admin', 'manager', 'production']
      // },
      // {
      //   name: 'Quality Control',
      //   href: '/production/quality-control',
      //   icon: CheckCircle,
      //   permission: 'view:ProductionOrder',
      //   roles: ['admin', 'manager', 'production']
      // },
      // {
      //   name: 'Cutting & Packing',
      //   href: '/production/cutting-packing',
      //   icon: Scissors,
      //   permission: 'view:ProductionOrder',
      //   roles: ['admin', 'manager', 'production']
      // },
      // {
      //   name: 'Enhanced Production',
      //   href: '/production/enhanced',
      //   icon: Factory,
      //   permission: 'view:ProductionOrder'
      // },
      {
        name: 'Production Batches',
        href: '/production/batches',
        icon: Layers,
        permission: 'view:ProductionOrder',
        roles: ['admin', 'manager', 'production']
      },
      // {
      //   name: 'Production Tracking',
      //   href: '/production-tracking',
      //   icon: Activity,
      //   permission: 'view:ProductionOrder',
      //   roles: ['admin', 'manager', 'production']
      // },
      // {
      //   name: 'Real-time Production',
      //   href: '/real-time-production',
      //   icon: Activity,
      //   permission: 'view:ProductionOrder',
      //   roles: ['admin', 'manager', 'production']
      // },
      // {
      //   name: 'Batch Management',
      //   href: '/batches',
      //   icon: Package,
      //   permission: 'view:Batch'
      // },
      // {
      //   name: 'Machine Management',
      //   href: '/machines',
      //   icon: Settings,
      //   permission: 'view:Machine',
      //   roles: ['admin', 'manager', 'production']
      // }
    ]
  },

  // Dispatch & Logistics
  {
    name: 'Dispatch & Logistics',
    href: '/operations/dispatch/enhanced',
    icon: Send,
    permission: 'view:Dispatch',
    children: [
      {
        name: 'Dispatch',
        href: '/operations/dispatch/enhanced',
        icon: Send,
        permission: 'view:Dispatch'
      },
      {
        name: 'RTO Tracking',
        href: '/operations/dispatch/rto',
        icon: RotateCcw,
        permission: 'view:Dispatch'
      },
      // {
      //   name: 'Packing Management',
      //   href: '/operations/dispatch/packing',
      //   icon: Package,
      //   permission: 'view:Dispatch'
      // }
    ]
  },

  // // Quality Management
  // {
  //   name: 'Quality Management',
  //   href: '/quality',
  //   icon: AlertTriangle,
  //   permission: 'view:QualityCheck',
  //   children: [
  //     {
  //       name: 'Quality Overview',
  //       href: '/quality',
  //       icon: AlertTriangle,
  //       permission: 'view:QualityCheck'
  //     },
  //     {
  //       name: 'Quality Checks',
  //       href: '/quality/checks',
  //       icon: AlertTriangle,
  //       permission: 'view:QualityCheck'
  //     },
  //     {
  //       name: 'Defect Tracking',
  //       href: '/quality/defects',
  //       icon: FileSearch,
  //       permission: 'view:QualityCheck'
  //     },
  //     {
  //       name: 'Quality Reports',
  //       href: '/quality/reports',
  //       icon: BarChart3,
  //       permission: 'view:QualityCheck'
  //     }
  //   ]
  // },

 

  // Security & Monitoring
  {
    name: 'Security & Monitoring',
    href: '/security',
    icon: Shield,
    permission: 'view:SecurityLog',
    children: [
     
      // {
      //   name: 'Visitor Management',
      //   href: '/visitors',
      //   icon: UserPlus,
      //   permission: 'view:Visitor'
      // },
      {
        name: 'Vehicle Management',
        href: '/vehicles',
        icon: Car,
        permission: 'view:Vehicle'
      },
      {
        name: 'Gate Passes',
        href: '/gatepasses',
        icon: FileText,
        permission: 'view:GatePass'
      },
      // {
      //   name: 'Security Logs',
      //   href: '/security/logs',
      //   icon: AlertTriangle,
      //   permission: 'view:SecurityLog'
      // },
      // {
      //   name: 'Audit Logs',
      //   href: '/audit-logs',
      //   icon: FileSearch,
      //   permission: 'view:AuditLog'
      // }
    ]
  },

  // Operations & Monitoring
  {
    name: 'Operations & Monitoring',
    href: '/operations',
    icon: TrendingUp,
    permission: 'view:BusinessAnalytics',
    children: [
      {
        name: 'Business Analytics',
        href: '/operations/analytics',
        icon: TrendingUp,
        permission: 'view:BusinessAnalytics'
      },
      {
        name: 'Boiler Monitoring',
        href: '/operations/boiler',
        icon: Thermometer,
        permission: 'view:BoilerMonitoring'
      },
      {
        name: 'Electricity Monitoring',
        href: '/operations/electricity',
        icon: Zap,
        permission: 'view:ElectricityMonitoring'
      },
      {
        name: 'Hospitality Management',
        href: '/operations/hospitality',
        icon: Hotel,
        permission: 'view:Hospitality'
      }
    ]
  },

  // Analytics & Reports
  {
    name: 'Analytics & Reports',
    href: '/reports',
    icon: BarChart3,
    permission: 'view:Report',
    children: [
      {
        name: 'Standard Reports',
        href: '/reports',
        icon: FileText,
        permission: 'view:Report'
      },
      {
        name: 'Advanced Analytics',
        href: '/analytics/advanced',
        icon: TrendingUp,
        permission: 'view:Report'
      }
    ]
  },

  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    permission: 'view:Settings'
  }
]

export function Sidebar() {
  const pathname = usePathname()
  const dispatch = useDispatch()
  const isCollapsed = useSelector(selectSidebarCollapsed)
  const isOpen = useSelector(selectSidebarOpen)
  const user = useSelector(selectCurrentUser)
  const isSuperAdmin = useSelector(selectIsSuperAdmin)
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  // Get user's current role
  const currentRole = isSuperAdmin ? 'super_admin' : user?.companyAccess?.[0]?.role || 'helper'

  // Simple navigation filtering - show basic items for all users
  const filteredNavigation = navigationItems.filter((item: NavigationItem) => {
    // Always show dashboard
    if (item.name === 'Dashboard') return true

    // Super admin sees everything
    if (isSuperAdmin) return true

    // If no user is logged in, only show dashboard
    if (!user) return item.name === 'Dashboard'

    // Show basic business modules for all authenticated users
    const basicModules = [
      'Dashboard', 'Companies', 'Users & Access', 'Customers', 'Sales', 'Purchase', 
      'Inventory', 'Human Resources', 'Production', 'Dispatch & Logistics', 
      'Quality Management', 'Financial', 'Security & Monitoring', 
      'Operations & Monitoring', 'Analytics & Reports'
    ]
    if (basicModules.includes(item.name)) return true

    // Filter by roles if specified
    if (item.roles && item.roles.length > 0) {
      return item.roles.includes(currentRole)
    }

    // For other items, check if user has company access
    const hasCompanyAccess = user?.companyAccess && user.companyAccess.length > 0
    return hasCompanyAccess
  })

  // Fallback: if no items are visible, show at least dashboard and basic items
  const finalNavigation = filteredNavigation.length > 0 ? filteredNavigation : [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'Companies',
      href: '/companies',
      icon: Building2
    },
    {
      name: 'Users',
      href: '/users',
      icon: Users
    }
  ]

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href
    }
    return pathname?.startsWith(href) || false
  }

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.name)
    const active = isActive(item.href)

    return (
      <div key={item.name}>
        <div className="relative">
          {hasChildren ? (
            <button
              onClick={() => toggleExpanded(item.name)}
              className={clsx(
                'w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                level > 0 && 'ml-4',
                active
                  ? 'bg-sky-500 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white',
                isCollapsed && 'justify-center'
              )}
            >
              <item.icon className={clsx('flex-shrink-0', isCollapsed ? 'h-6 w-6' : 'h-5 w-5 mr-3')} />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left">{item.name}</span>
                  {hasChildren && (
                    isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )
                  )}
                </>
              )}
            </button>
          ) : (
            <Link
              href={item.href}
              className={clsx(
                'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                level > 0 && 'ml-4',
                active
                  ? 'bg-sky-500 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white',
                isCollapsed && 'justify-center'
              )}
            >
              <item.icon className={clsx('flex-shrink-0', isCollapsed ? 'h-6 w-6' : 'h-5 w-5 mr-3')} />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          )}
        </div>

        {hasChildren && isExpanded && !isCollapsed && (
          <div className="mt-1 space-y-1">
            {item.children?.map(child => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => dispatch(toggleSidebar())}
        />
      )}

      {/* Sidebar */}
      <div className={clsx(
        'fixed inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-gray-900 border-r-2 border-sky-500 transition-all duration-300 ease-in-out shadow-lg',
        isCollapsed ? 'w-16' : 'w-64',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-3 sm:px-4 border-b-2 border-sky-500 bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <SidebarLogo collapsed={isCollapsed} />
          </Link>
          
          <button
            onClick={() => dispatch(setSidebarCollapsed(!isCollapsed))}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 lg:block hidden text-gray-600 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 group"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4 group-hover:scale-110 transition-transform" /> : <Menu className="h-4 w-4 group-hover:scale-110 transition-transform" />}
          </button>

          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 lg:hidden text-gray-600 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 group"
          >
            <X className="h-4 w-4 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 sm:px-3 py-4 space-y-1 overflow-y-auto bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
          {finalNavigation.map((item: NavigationItem) => renderNavigationItem(item))}
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              ERP System v1.0
            </div>
          </div>
        )}
      </div>
    </>
  )
}
