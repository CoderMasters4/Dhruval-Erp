'use client'

import { useState } from 'react'
import { useSelector } from 'react-redux'
import { selectCurrentUser, selectIsSuperAdmin } from '@/lib/features/auth/authSlice'
import { AppLayout } from '@/components/layout/AppLayout'
import { ReportsHeader } from '@/components/ui/PageHeader'
import {
  useGetUserAnalyticsQuery,
  useGetCompanyPerformanceQuery,
  useGetSystemHealthQuery
} from '@/lib/api/reportsApi'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'
import { 
  Users, 
  Building2, 
  Activity, 
  Database,
  TrendingUp,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  BarChart3
} from 'lucide-react'

const COLORS = ['#0ea5e9', '#000000', '#87ceeb', '#0369a1', '#1e40af']

export default function ReportsPage() {
  const user = useSelector(selectCurrentUser)
  const isSuperAdmin = useSelector(selectIsSuperAdmin)
  const [activeTab, setActiveTab] = useState('user-analytics')
  const [dateRange, setDateRange] = useState('30d')

  // Fetch reports data
  const { data: userAnalytics, isLoading: userLoading, refetch: refetchUsers } = useGetUserAnalyticsQuery()
  const { data: companyPerformance, isLoading: companyLoading, refetch: refetchCompanies } = useGetCompanyPerformanceQuery(undefined, {
    skip: !isSuperAdmin
  })
  const { data: systemHealth, isLoading: systemLoading, refetch: refetchSystem } = useGetSystemHealthQuery(undefined, {
    skip: !isSuperAdmin
  })

  const tabs = [
    { id: 'user-analytics', name: 'User Analytics', icon: Users, available: true },
    { id: 'company-performance', name: 'Company Performance', icon: Building2, available: isSuperAdmin },
    { id: 'system-health', name: 'System Health', icon: Activity, available: isSuperAdmin },
  ].filter(tab => tab.available)

  const handleRefresh = () => {
    refetchUsers()
    if (isSuperAdmin) {
      refetchCompanies()
      refetchSystem()
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${minutes}m`
  }

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 space-y-6">
        {/* New Header */}
        <ReportsHeader
          title="Advanced Reports"
          description={`Comprehensive analytics and insights for ${isSuperAdmin ? 'system-wide' : 'company'} performance`}
          icon={<BarChart3 className="h-6 w-6 text-white" />}
          showRefresh={true}
          onRefresh={handleRefresh}
        >
          <div className="flex items-center space-x-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-white rounded-lg focus:outline-none bg-white text-emerald-600 text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button className="flex items-center px-3 py-2 bg-white text-emerald-600 rounded-lg hover:bg-emerald-50 border border-white text-sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </ReportsHeader>

        {/* Tabs */}
        <div className="bg-white rounded-xl border-2 border-sky-500 p-1">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-sky-500 text-white'
                    : 'text-black hover:bg-sky-50'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {activeTab === 'user-analytics' && (
          <div className="space-y-6">
            {/* User Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border-2 border-sky-500 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-black">Total Users</p>
                    <p className="text-2xl font-bold text-black">
                      {userLoading ? '...' : userAnalytics?.data?.totalUsers || 0}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-sky-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl border-2 border-sky-500 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-black">Active Users</p>
                    <p className="text-2xl font-bold text-black">
                      {userLoading ? '...' : userAnalytics?.data?.activeUsers || 0}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-black" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl border-2 border-sky-500 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-black">Inactive Users</p>
                    <p className="text-2xl font-bold text-black">
                      {userLoading ? '...' : userAnalytics?.data?.inactiveUsers || 0}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-sky-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl border-2 border-sky-500 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-black">Activity Rate</p>
                    <p className="text-2xl font-bold text-black">
                      {userLoading ? '...' : 
                        userAnalytics?.data?.totalUsers ? 
                          Math.round((userAnalytics.data.activeUsers / userAnalytics.data.totalUsers) * 100) + '%' : 
                          '0%'
                      }
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-black" />
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Trends Chart */}
              {userAnalytics?.data?.userTrends && (
                <div className="bg-white rounded-xl border-2 border-sky-500 p-6">
                  <h3 className="text-lg font-semibold text-black mb-4">User Registration Trends</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={userAnalytics.data.userTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#0ea5e9" />
                      <XAxis dataKey="month" stroke="#000000" />
                      <YAxis stroke="#000000" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '2px solid #0ea5e9',
                          borderRadius: '8px'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="users"
                        stroke="#0ea5e9"
                        fill="#0ea5e9"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Role Distribution */}
              {userAnalytics?.data?.roleDistribution && (
                <div className="bg-white rounded-xl border-2 border-sky-500 p-6">
                  <h3 className="text-lg font-semibold text-black mb-4">Role Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={Object.entries(userAnalytics.data.roleDistribution).map(([role, count]) => ({
                          name: role.replace('_', ' ').toUpperCase(),
                          value: count
                        }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {Object.entries(userAnalytics.data.roleDistribution).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Company Performance Tab */}
        {activeTab === 'company-performance' && isSuperAdmin && (
          <div className="space-y-6">
            {/* Company Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border-2 border-sky-500 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-black">Total Companies</p>
                    <p className="text-2xl font-bold text-black">
                      {companyLoading ? '...' : companyPerformance?.data?.totalCompanies || 0}
                    </p>
                  </div>
                  <Building2 className="h-8 w-8 text-sky-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl border-2 border-sky-500 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-black">Total Users</p>
                    <p className="text-2xl font-bold text-black">
                      {companyLoading ? '...' : companyPerformance?.data?.totalUsers || 0}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-black" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl border-2 border-sky-500 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-black">Avg Users/Company</p>
                    <p className="text-2xl font-bold text-black">
                      {companyLoading ? '...' : companyPerformance?.data?.averageUsersPerCompany || 0}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-sky-500" />
                </div>
              </div>
            </div>

            {/* Company Performance Table */}
            <div className="bg-white rounded-xl border-2 border-sky-500 p-6">
              <h3 className="text-lg font-semibold text-black mb-4">Company Performance</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-sky-500">
                      <th className="text-left p-3 font-semibold text-black">Company</th>
                      <th className="text-left p-3 font-semibold text-black">Industry</th>
                      <th className="text-left p-3 font-semibold text-black">Total Users</th>
                      <th className="text-left p-3 font-semibold text-black">Active Users</th>
                      <th className="text-left p-3 font-semibold text-black">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companyPerformance?.data?.companyPerformance?.map((company) => (
                      <tr key={company._id} className="border-b border-sky-200 hover:bg-sky-50">
                        <td className="p-3">
                          <div>
                            <div className="font-medium text-black">{company.companyName}</div>
                            <div className="text-xs text-black opacity-75">{company.companyCode}</div>
                          </div>
                        </td>
                        <td className="p-3 text-black">{company.industry || 'N/A'}</td>
                        <td className="p-3 text-black">{company.userCount}</td>
                        <td className="p-3 text-black">{company.activeUsers}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            company.status === 'active' 
                              ? 'bg-sky-100 text-sky-600' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {company.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* System Health Tab */}
        {activeTab === 'system-health' && isSuperAdmin && (
          <div className="space-y-6">
            {/* System Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border-2 border-sky-500 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-black">Database Status</p>
                    <p className="text-lg font-bold text-sky-500">
                      {systemLoading ? '...' : systemHealth?.data?.database?.status || 'Unknown'}
                    </p>
                  </div>
                  <Database className="h-8 w-8 text-sky-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl border-2 border-sky-500 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-black">System Uptime</p>
                    <p className="text-lg font-bold text-black">
                      {systemLoading ? '...' : formatUptime(systemHealth?.data?.system?.uptime || 0)}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-black" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl border-2 border-sky-500 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-black">Memory Usage</p>
                    <p className="text-lg font-bold text-black">
                      {systemLoading ? '...' : formatBytes(systemHealth?.data?.system?.memoryUsage?.heapUsed || 0)}
                    </p>
                  </div>
                  <Database className="h-8 w-8 text-sky-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl border-2 border-sky-500 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-black">Active Today</p>
                    <p className="text-lg font-bold text-black">
                      {systemLoading ? '...' : systemHealth?.data?.users?.activeToday || 0}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-black" />
                </div>
              </div>
            </div>

            {/* System Details */}
            <div className="bg-white rounded-xl border-2 border-sky-500 p-6">
              <h3 className="text-lg font-semibold text-black mb-4">System Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-black mb-3">Database</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-black">Collections:</span>
                      <span className="font-medium text-black">{systemHealth?.data?.database?.collections || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-black">Data Size:</span>
                      <span className="font-medium text-black">{systemHealth?.data?.database?.dataSize || 0} MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-black">Storage Size:</span>
                      <span className="font-medium text-black">{systemHealth?.data?.database?.storageSize || 0} MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-black">Indexes:</span>
                      <span className="font-medium text-black">{systemHealth?.data?.database?.indexes || 0}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-black mb-3">Runtime</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-black">Node Version:</span>
                      <span className="font-medium text-black">{systemHealth?.data?.system?.nodeVersion || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-black">Heap Total:</span>
                      <span className="font-medium text-black">
                        {formatBytes(systemHealth?.data?.system?.memoryUsage?.heapTotal || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-black">Heap Used:</span>
                      <span className="font-medium text-black">
                        {formatBytes(systemHealth?.data?.system?.memoryUsage?.heapUsed || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-black">External:</span>
                      <span className="font-medium text-black">
                        {formatBytes(systemHealth?.data?.system?.memoryUsage?.external || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
