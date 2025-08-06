'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import Image from 'next/image'
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
  List,
  Thermometer,
  Zap,
  Hotel,
  Send,
  Quote,
  DollarSign,
  ShoppingBag
} from 'lucide-react'
import { selectSidebarCollapsed, selectSidebarOpen, toggleSidebar, setSidebarCollapsed } from '@/lib/features/ui/uiSlice'
import { selectCurrentUser, selectIsSuperAdmin } from '@/lib/features/auth/authSlice'

import clsx from 'clsx'

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  permission?: string
  role?: string
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

  // Super Admin Only
  // {
  //   name: 'Super Admin',
  //   href: '/super-admin',
  //   icon: Shield,
  //   permission: 'admin:systemSettings',
  //   roles: ['super_admin']
  // },
  // {
  //   name: 'System Admin',
  //   href: '/admin',
  //   icon: Shield,
  //   permission: 'admin:systemSettings',
  //   roles: ['super_admin'],
  //   children: [
  //     {
  //       name: 'Companies',
  //       href: '/admin/companies',
  //       icon: Building2,
  //       permission: 'admin:systemSettings'
  //     },
  //     {
  //       name: 'System Users',
  //       href: '/admin/users',
  //       icon: Users,
  //       permission: 'admin:systemSettings'
  //     },
  //     {
  //       name: 'System Settings',
  //       href: '/admin/settings',
  //       icon: Settings,
  //       permission: 'admin:systemSettings'
  //     },
  //     {
  //       name: 'Security Logs',
  //       href: '/admin/security',
  //       icon: Shield,
  //       permission: 'admin:systemSettings'
  //     }
  //   ]
  // },

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
      {
        name: 'Roles',
        href: '/roles',
        icon: UserCheck,
        permission: 'view:Role'
      }
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
    name: 'Suppliers',
    href: '/suppliers',
    icon: Truck,
    permission: 'view:Supplier'
  },

  // Inventory Management
  {
    name: 'Inventory',
    href: '/inventory/enhanced',
    icon: Package,
    permission: 'view:InventoryItem',
    children: [
      {
        name: 'Items',
        href: '/inventory/enhanced',
        icon: Package,
        permission: 'view:InventoryItem'
      },
      {
        name: 'Basic View',
        href: '/inventory',
        icon: List,
        permission: 'view:InventoryItem'
      },
      {
        name: 'Spares',
        href: '/spares',
        icon: Settings,
        permission: 'view:Spare'
      },
      {
        name: 'Stock Movements',
        href: '/inventory/movements',
        icon: BarChart3,
        permission: 'view:StockMovement'
      },
      {
        name: 'Warehouses',
        href: '/warehouses',
        icon: Warehouse,
        permission: 'view:Warehouse'
      }
    ]
  },

  // Production & Orders
  {
    name: 'Production',
    href: '/production',
    icon: Factory,
    permission: 'view:ProductionOrder'
  },
  {
    name: 'Sales & Orders',
    href: '/sales',
    icon: ShoppingCart,
    permission: 'view:CustomerOrder',
    children: [
      {
        name: 'Customer Orders',
        href: '/sales/orders',
        icon: ShoppingCart,
        permission: 'view:CustomerOrder'
      },
      {
        name: 'Quotations',
        href: '/quotations',
        icon: Quote,
        permission: 'view:Quotation'
      },
      {
        name: 'Invoices',
        href: '/invoices',
        icon: FileText,
        permission: 'view:Invoice'
      }
    ]
  },
  {
    name: 'Purchase',
    href: '/purchase',
    icon: ShoppingBag,
    permission: 'view:PurchaseOrder',
    children: [
      {
        name: 'Purchase Orders',
        href: '/purchase-orders',
        icon: ShoppingBag,
        permission: 'view:PurchaseOrder'
      },
      {
        name: 'Quotations',
        href: '/purchase/quotations',
        icon: Quote,
        permission: 'view:Quotation'
      }
    ]
  },

  // Financial Management
  {
    name: 'Financial',
    href: '/financial',
    icon: DollarSign,
    permission: 'view:FinancialTransaction',
    children: [
      {
        name: 'Transactions',
        href: '/financial',
        icon: DollarSign,
        permission: 'view:FinancialTransaction'
      },
      {
        name: 'Invoices',
        href: '/invoices',
        icon: FileText,
        permission: 'view:Invoice'
      }
    ]
  },

  // Security & Management
  {
    name: 'Security',
    href: '/security',
    icon: Shield,
    permission: 'view:SecurityLog',
    children: [
      {
        name: 'Visitors',
        href: '/security/visitors',
        icon: UserPlus,
        permission: 'view:Visitor'
      },
      {
        name: 'Vehicles',
        href: '/security/vehicles',
        icon: Car,
        permission: 'view:Vehicle'
      },
      {
        name: 'Security Logs',
        href: '/security/logs',
        icon: AlertTriangle,
        permission: 'view:SecurityLog'
      },
      {
        name: 'Audit Logs',
        href: '/audit-logs',
        icon: FileSearch,
        permission: 'view:AuditLog'
      }
    ]
  },

  // Advanced Operations
  {
    name: 'Operations',
    href: '/operations',
    icon: TrendingUp,
    permission: 'view:BusinessAnalytics',
    children: [
      {
        name: 'Analytics',
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
        name: 'Electricity',
        href: '/operations/electricity',
        icon: Zap,
        permission: 'view:ElectricityMonitoring'
      },
      {
        name: 'Hospitality',
        href: '/operations/hospitality',
        icon: Hotel,
        permission: 'view:Hospitality'
      },
      {
        name: 'Dispatch',
        href: '/operations/dispatch',
        icon: Send,
        permission: 'view:Dispatch'
      }
    ]
  },

  // Advanced Reports & Analytics
  {
    name: 'Advanced Reports',
    href: '/reports',
    icon: BarChart3,
    permission: 'view:Report',
    roles: ['super_admin', 'owner', 'manager', 'production_manager']
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
  const currentRole = isSuperAdmin ? 'super_admin' : user?.companyAccess?.[0]?.role || 'operator'

  // Debug logging
  console.log('Sidebar Debug:', { user, isSuperAdmin, currentRole, navigationItemsCount: navigationItems.length })

  // Simple navigation filtering - show basic items for all users
  const filteredNavigation = navigationItems.filter((item: NavigationItem) => {
    // Always show dashboard
    if (item.name === 'Dashboard') return true

    // Super admin sees everything
    if (isSuperAdmin) return true

    // If no user is logged in, only show dashboard
    if (!user) return item.name === 'Dashboard'

    // Show basic business modules for all authenticated users
    const basicModules = ['Dashboard', 'Companies', 'Users', 'Customers', 'Suppliers', 'Inventory', 'Production', 'Orders', 'Advanced Reports']
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
                  ? 'bg-sky-500 text-white'
                  : 'text-black hover:bg-sky-50 hover:text-black',
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
                  ? 'bg-sky-500 text-white'
                  : 'text-black hover:bg-sky-50 hover:text-black',
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
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => dispatch(toggleSidebar())}
        />
      )}

      {/* Sidebar */}
      <div className={clsx(
        'fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r-2 border-sky-500 transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-16' : 'w-64',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-3 sm:px-4 border-b-2 border-sky-500">
          <Link href="/dashboard" className="flex items-center space-x-2">
            {isCollapsed ? (
              <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm border-2 border-sky-500">
                <Image
                  src="/logo.png"
                  alt="Factory ERP"
                  width={24}
                  height={24}
                  className="rounded"
                />
              </div>
            ) : (
              <>
                <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm border-2 border-sky-500">
                  <Image
                    src="/logo.png"
                    alt="Factory ERP"
                    width={24}
                    height={24}
                    className="rounded"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-black">
                    Factory ERP
                  </span>
                  <span className="text-xs text-sky-600 font-medium">
                    Manufacturing Suite
                  </span>
                </div>
              </>
            )}
          </Link>
          
          <button
            onClick={() => dispatch(setSidebarCollapsed(!isCollapsed))}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors lg:block hidden"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 sm:px-3 py-4 space-y-1 overflow-y-auto">
          {finalNavigation.map((item: NavigationItem) => renderNavigationItem(item))}
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              ERP System v1.0
            </div>
          </div>
        )}
      </div>
    </>
  )
}
