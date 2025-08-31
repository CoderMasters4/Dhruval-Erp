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

  // Prepare real data for components
  const dashboardStats = dashboardData?.data?.overview || {}
  const recentActivities = dashboardData?.data?.recentActivity || []
  const systemAlerts = dashboardData?.data?.systemAlerts || []
  const companyAlerts = dashboardData?.data?.alerts || []
  const performanceMetrics = dashboardData?.data?.performanceMetrics || {}

  // Calculate total alerts
  const totalAlerts = (inventoryAlerts?.data?.length || 0) + 
                     (systemAlerts?.length || 0) + 
                     (companyAlerts?.length || 0)

  // Type-safe access to performance metrics
  const orderCompletion = (performanceMetrics as any)?.orderCompletion
  const customerSatisfaction = (performanceMetrics as any)?.customerSatisfaction
  const inventoryTurnover = (performanceMetrics as any)?.inventoryTurnover
  const productionEfficiency = (performanceMetrics as any)?.productionEfficiency

  // Format timestamp for better display
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      const now = new Date()
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      
      if (diffInMinutes < 1) return 'Just now'
      if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`
      return `${Math.floor(diffInMinutes / 1440)} days ago`
    } catch {
      return timestamp
    }
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-sky-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-300">
        <ResponsiveContainer className="space-y-6">
          {/* New Header */}
          <DashboardHeader
            title={getWelcomeMessage()}
            description={`Welcome back, ${user?.username || 'User'}! ${getRoleDescription()}`}
            icon={<BarChart3 className="h-6 w-6 text-white" />}
            showRefresh={true}
            onRefresh={() => window.location.reload()}
          />

          {/* Stats */}
          <RoleBasedStats stats={dashboardStats} loading={isLoading} />

          {/* Main Content Grid */}
          <ResponsiveGrid
            cols={{ default: 1, lg: 3 }}
            gap="lg"
          >
            {/* Quick Actions */}
            <ResponsiveCard className="lg:col-span-1">
              <RoleBasedQuickActions permissions={permissions} />
            </ResponsiveCard>

            {/* Recent Activity */}
            <ResponsiveCard className="lg:col-span-2">
              <RoleBasedActivity activities={recentActivities} loading={isLoading} permissions={permissions} />
            </ResponsiveCard>
          </ResponsiveGrid>

          {/* Additional Stats Grid */}
          <ResponsiveGrid
            cols={{ default: 1, md: 2, lg: 4 }}
            gap="lg"
          >
            {/* User Stats */}
            <ResponsiveCard className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Users</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {userStats?.data?.totalUsers || dashboardStats?.totalUsers || dashboardStats?.totalEmployees || 0}
                  </p>
                </div>
                <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </ResponsiveCard>

            {/* Order Stats */}
            <ResponsiveCard className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Orders</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {orderStats?.data?.totalOrders || dashboardStats?.totalOrders || 0}
                  </p>
                </div>
                <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                  <Truck className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </ResponsiveCard>

            {/* Inventory Stats */}
            <ResponsiveCard className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Inventory Items</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {inventoryStats?.data?.totalItems || dashboardStats?.totalInventory || 0}
                  </p>
                </div>
                <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
                  <Package className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </ResponsiveCard>

            {/* Alerts */}
            <ResponsiveCard className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">Total Alerts</p>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                    {totalAlerts}
                  </p>
                </div>
                <div className="p-2 bg-red-100 dark:bg-red-800 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </ResponsiveCard>
          </ResponsiveGrid>

          {/* System Health Section for Super Admin */}
          {isSuperAdmin && dashboardStats?.systemHealth !== undefined && (
            <ResponsiveCard className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border-indigo-200 dark:border-indigo-700">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-4">System Health Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                      {dashboardStats.systemHealth}%
                    </div>
                    <div className="text-sm text-indigo-600 dark:text-indigo-400">System Health</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                      {dashboardStats.systemUptime || '99.9%'}
                    </div>
                    <div className="text-sm text-indigo-600 dark:text-indigo-400">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                      {dashboardStats.totalCompanies || 0}
                    </div>
                    <div className="text-sm text-indigo-600 dark:text-indigo-400">Active Companies</div>
                  </div>
                </div>
              </div>
            </ResponsiveCard>
          )}

          {/* Error State */}
          {error && (
            <ResponsiveCard className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700">
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                  Error Loading Dashboard
                </h3>
                <p className="text-red-600 dark:text-red-300">
                  There was an error loading the dashboard data. Please try refreshing the page.
                </p>
              </div>
            </ResponsiveCard>
          )}

          {/* No Data State */}
          {!isLoading && !error && !dashboardData && (
            <ResponsiveCard className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700">
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-yellow-500 dark:text-yellow-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  No Dashboard Data Available
                </h3>
                <p className="text-yellow-600 dark:text-yellow-300">
                  Dashboard data is not available at the moment. This could be due to no data being present in the system.
                </p>
              </div>
            </ResponsiveCard>
          )}
        </ResponsiveContainer>
      </div>
    </AppLayout>
  )
}
