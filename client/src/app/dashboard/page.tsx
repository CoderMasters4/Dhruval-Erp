'use client'

import { useSelector } from 'react-redux'
import { selectCurrentUser, selectIsSuperAdmin } from '@/lib/features/auth/authSlice'
import { RoleBasedStats } from '@/components/dashboard/RoleBasedStats'
import { RoleBasedActivity } from '@/components/dashboard/RoleBasedActivity'
import { RoleBasedQuickActions } from '@/components/dashboard/RoleBasedQuickActions'
import { useDashboardPermissions } from '@/lib/hooks/useDashboardPermissions'
import { useGetDashboardDataQuery } from '@/lib/api/dashboardApi'
import { useGetUserStatsQuery } from '@/lib/api/usersApi'
import { useGetOrderStatsQuery } from '@/lib/api/ordersApi'
import { useGetInventoryStatsQuery, useGetInventoryAlertsQuery } from '@/lib/api/inventoryApi'
import { AppLayout } from '@/components/layout/AppLayout'
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer'
import { ResponsiveGrid } from '@/components/ui/ResponsiveGrid'
import { ResponsiveCard } from '@/components/ui/ResponsiveCard'
import { DashboardHeader } from '@/components/ui/PageHeader'
import { AlertTriangle, Package, TrendingUp, Truck, BarChart3 } from 'lucide-react'

export default function DashboardPage() {
  const user = useSelector(selectCurrentUser)
  const isSuperAdmin = useSelector(selectIsSuperAdmin)
  const permissions = useDashboardPermissions()

  // Fetch real dashboard data
  const { data: dashboardData, isLoading, error } = useGetDashboardDataQuery()

  // Fetch additional real data
  const { data: userStats } = useGetUserStatsQuery({})
  const { data: orderStats } = useGetOrderStatsQuery({})
  const { data: inventoryStats } = useGetInventoryStatsQuery({})
  const { data: inventoryAlerts } = useGetInventoryAlertsQuery({})

  const getWelcomeMessage = () => {
    if (isSuperAdmin) {
      return 'Super Admin Dashboard'
    }

    const role = user?.companyAccess?.[0]?.role
    switch (role) {
      case 'owner':
        return 'Company Owner Dashboard'
      case 'manager':
        return 'Manager Dashboard'
      case 'production_manager':
        return 'Production Manager Dashboard'
      case 'sales_executive':
        return 'Sales Executive Dashboard'
      case 'accountant':
        return 'Accountant Dashboard'
      case 'operator':
        return 'Operator Dashboard'
      case 'helper':
        return 'Helper Dashboard'
      default:
        return 'Dashboard'
    }
  }

  const getRoleDescription = () => {
    if (isSuperAdmin) {
      return 'System-wide overview and management'
    }

    const role = user?.companyAccess?.[0]?.role
    switch (role) {
      case 'owner':
        return 'Complete business overview and management'
      case 'production_manager':
        return 'Production operations and inventory management'
      case 'manager':
        return 'Department management and operations'
      case 'operator':
        return 'Daily tasks and production operations'
      default:
        return 'Your personalized workspace'
    }
  }



  return (
    <AppLayout>
      <ResponsiveContainer className="space-y-6">
        {/* New Header */}
        <DashboardHeader
          title={getWelcomeMessage()}
          description={`Welcome back, ${dashboardData?.data?.user?.name || user?.username || 'User'}! ${getRoleDescription()}`}
          icon={<BarChart3 className="h-6 w-6 text-white" />}
          showRefresh={true}
          onRefresh={() => window.location.reload()}
        />

        {/* Stats */}
        <RoleBasedStats stats={dashboardData?.data?.stats} loading={isLoading} />

        {/* Main Content Grid */}
        <ResponsiveGrid
          cols={{ default: 1, lg: 3 }}
          gap="lg"
          className="items-start"
        >
          {/* Activity Feed - Takes 2 columns on lg+ screens, full width on mobile */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <RoleBasedActivity activities={dashboardData?.data?.recentActivities} loading={isLoading} />
          </div>

          {/* Quick Actions - Takes 1 column on lg+ screens, full width on mobile */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <RoleBasedQuickActions loading={isLoading} />
          </div>
        </ResponsiveGrid>

        {/* Additional Role-based Content */}
        {permissions.canViewFinancials && dashboardData?.data?.stats && (
          <ResponsiveGrid cols={{ default: 1, lg: 2 }} gap="lg">
            <ResponsiveCard className="border-2 border-sky-500" padding="lg">
            <h3 className="text-base sm:text-lg font-semibold text-black mb-3 sm:mb-4">Financial Overview</h3>
            {isLoading ? (
              <div className="space-y-3">
                <div className="animate-pulse">
                  <div className="h-4 bg-sky-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-sky-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-sky-200 rounded w-2/3"></div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base text-black">Monthly Revenue</span>
                  <span className="font-semibold text-sky-600 text-sm sm:text-base">
                    ₹{dashboardData?.data?.stats?.monthlyRevenue?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base text-black">Outstanding Payments</span>
                  <span className="font-semibold text-black text-sm sm:text-base">
                    ₹{dashboardData?.data?.stats?.outstandingPayments?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base text-black">Profit Margin</span>
                  <span className="font-semibold text-sky-600 text-sm sm:text-base">
                    {dashboardData?.data?.stats?.profitMargin || '0'}%
                  </span>
                </div>
              </div>
            )}
            </ResponsiveCard>

            <ResponsiveCard className="border-2 border-sky-500" padding="lg">
            <h3 className="text-base sm:text-lg font-semibold text-black mb-3 sm:mb-4">Recent Orders</h3>
            {isLoading ? (
              <div className="space-y-3">
                <div className="animate-pulse">
                  <div className="h-4 bg-sky-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-sky-200 rounded w-3/4"></div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-black text-sm sm:text-base truncate">ORD-2024-001</p>
                    <p className="text-xs sm:text-sm text-black opacity-75 truncate">Reliance Industries</p>
                  </div>
                  <span className="px-2 py-1 bg-sky-100 text-sky-600 text-xs rounded-full ml-2 flex-shrink-0">Processing</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-black text-sm sm:text-base truncate">ORD-2024-002</p>
                    <p className="text-xs sm:text-sm text-black opacity-75 truncate">Tata Motors</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full ml-2 flex-shrink-0">Completed</span>
                </div>
              </div>
            )}
            </ResponsiveCard>
          </ResponsiveGrid>
        )}

      {/* Production Overview - For Production Managers */}
      {permissions.canViewProduction && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white rounded-xl border-2 border-sky-500 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-black mb-3 sm:mb-4">Production Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-black">Active Lines</span>
                <span className="font-semibold text-sky-600">3/5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-black">Today&apos;s Output</span>
                <span className="font-semibold text-black">1,250 units</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-black">Efficiency</span>
                <span className="font-semibold text-sky-600">94.5%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-sky-500 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-black mb-3 sm:mb-4">Quality Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-black">Pass Rate</span>
                <span className="font-semibold text-green-600">98.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-black">Pending QC</span>
                <span className="font-semibold text-orange-600">8 batches</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-black">Defect Rate</span>
                <span className="font-semibold text-red-600">1.8%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-sky-500 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-black mb-3 sm:mb-4">Resource Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-black">Raw Materials</span>
                <span className="font-semibold text-green-600">85% Stock</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-black">Machine Health</span>
                <span className="font-semibold text-sky-600">Good</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-black">Staff Present</span>
                <span className="font-semibold text-black">42/45</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Overview */}
      {permissions.canViewInventory && (
        <div className="bg-white rounded-xl border-2 border-sky-500 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-black">Inventory Status</h3>
            <button className="mt-2 sm:mt-0 px-3 py-1 bg-sky-500 text-white text-sm rounded-lg hover:bg-black transition-colors">
              View All
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 bg-sky-50 rounded-lg border border-sky-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-black opacity-75">Low Stock Items</p>
                  <p className="text-lg font-bold text-red-600">
                    {inventoryStats?.data?.lowStockItems || 0}
                  </p>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </div>
              </div>
            </div>

            <div className="p-3 bg-sky-50 rounded-lg border border-sky-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-black opacity-75">Total Items</p>
                  <p className="text-lg font-bold text-black">
                    {inventoryStats?.data?.totalItems?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="p-2 bg-sky-100 rounded-lg">
                  <Package className="h-4 w-4 text-sky-600" />
                </div>
              </div>
            </div>

            <div className="p-3 bg-sky-50 rounded-lg border border-sky-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-black opacity-75">Stock Value</p>
                  <p className="text-lg font-bold text-sky-600">
                    ₹{inventoryStats?.data?.totalValue ?
                      (inventoryStats.data.totalValue / 100000).toFixed(1) + 'L' : '0'}
                  </p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </div>

            <div className="p-3 bg-sky-50 rounded-lg border border-sky-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-black opacity-75">Recent Movements</p>
                  <p className="text-lg font-bold text-black">
                    {inventoryStats?.data?.recentMovements || 0}
                  </p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Truck className="h-4 w-4 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
        {error && (
          <ResponsiveCard className="border-2 border-red-500" padding="lg">
            <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Dashboard</h3>
            <p className="text-black opacity-75">
              Unable to load dashboard data. Please refresh the page or contact support.
            </p>
          </ResponsiveCard>
        )}
      </ResponsiveContainer>
    </AppLayout>
  )
}
