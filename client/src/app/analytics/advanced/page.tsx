'use client'

import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectCurrentUser, selectCurrentCompany } from '@/lib/features/auth/authSlice'
import { AppLayout } from '@/components/layout/AppLayout'
import { ReportsHeader } from '@/components/ui/PageHeader'
import {
  useGetAnalyticsDashboardQuery,
  useGetDailyReportsQuery,
  useGetWeeklyReportsQuery,
  useGetMonthlyReportsQuery,
  useGetCustomReportsQuery,
  useGetFilterOptionsQuery
} from '@/lib/api/analyticsApi'
import { 
  BarChart3, 
  Calendar,
  Download,
  FileText,
  Filter,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Settings,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16']

interface FilterState {
  dateRange: string
  startDate: string
  endDate: string
  departments: string[]
  products: string[]
  statuses: string[]
  metrics: string[]
  groupBy: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

interface KPIData {
  totalOrders: number
  totalRevenue: number
  productionOrders: number
  completedProduction: number
  totalInventory: number
  totalEmployees: number
  totalCustomers: number
  totalSuppliers: number
  totalVisitors: number
}

interface RevenueData {
  time: string
  revenue: number
  orders: number
}

interface DepartmentData {
  department: string
  count: number
  production: number
  revenue: number
}

interface InventoryDistribution {
  category: string
  value: number
  percentage: number
}

interface AnalyticsData {
  kpiData: KPIData
  revenueData: {
    total: number
    breakdown: RevenueData[]
  }
  departmentData: DepartmentData[]
  resourceData: any
  inventoryDistribution: InventoryDistribution[]
}

export default function AdvancedAnalyticsPage() {
  const user = useSelector(selectCurrentUser)
  const currentCompany = useSelector(selectCurrentCompany)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showFilters, setShowFilters] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    dateRange: '30d',
    startDate: '',
    endDate: '',
    departments: [],
    products: [],
    statuses: [],
    metrics: ['all'],
    groupBy: 'date',
    sortBy: 'revenue',
    sortOrder: 'desc'
  })

  // Calculate date range based on selection
  useEffect(() => {
    const now = new Date()
    const endDate = now.toISOString().split('T')[0]
    
    let startDate: Date
    switch (filters.dateRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }
    
    setFilters(prev => ({
      ...prev,
      startDate: startDate.toISOString().split('T')[0],
      endDate
    }))
  }, [filters.dateRange])

  // Helper function to clean parameters
  const cleanParams = (params: any) => {
    const cleaned: any = {}
    Object.keys(params).forEach(key => {
      const value = params[key]
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value) && value.length > 0) {
          cleaned[key] = value
        } else if (!Array.isArray(value)) {
          cleaned[key] = value
        }
      }
    })
    return cleaned
  }

  // API Queries
  const { data: dashboardData, isLoading: dashboardLoading, refetch: refetchDashboard } = useGetAnalyticsDashboardQuery(
    cleanParams({
      timeRange: filters.dateRange,
      startDate: filters.startDate,
      endDate: filters.endDate,
      departments: filters.departments,
      metrics: filters.metrics
    })
  )

  const { data: dailyData, isLoading: dailyLoading, refetch: refetchDaily } = useGetDailyReportsQuery(
    cleanParams({
      date: filters.startDate,
      departments: filters.departments,
      metrics: filters.metrics,
      includeDetails: true
    })
  )

  const { data: weeklyData, isLoading: weeklyLoading, refetch: refetchWeekly } = useGetWeeklyReportsQuery(
    cleanParams({
      weekStart: filters.startDate,
      weekEnd: filters.endDate,
      departments: filters.departments,
      metrics: filters.metrics,
      includeDetails: true
    })
  )

  const { data: monthlyData, isLoading: monthlyLoading, refetch: refetchMonthly } = useGetMonthlyReportsQuery(
    cleanParams({
      year: filters.startDate ? new Date(filters.startDate).getFullYear() : new Date().getFullYear(),
      month: filters.startDate ? new Date(filters.startDate).getMonth() + 1 : new Date().getMonth() + 1,
      departments: filters.departments,
      metrics: filters.metrics,
      includeDetails: true
    })
  )

  const { data: customData, isLoading: customLoading, refetch: refetchCustom } = useGetCustomReportsQuery(
    cleanParams({
      startDate: filters.startDate,
      endDate: filters.endDate,
      companyId: currentCompany?._id,
      departments: filters.departments,
      products: filters.products,
      statuses: filters.statuses,
      metrics: filters.metrics,
      groupBy: filters.groupBy,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder
    })
  )

  const { data: filterOptions, isLoading: filterLoading } = useGetFilterOptionsQuery({
    companyId: currentCompany?._id
  })

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'daily', name: 'Daily Reports', icon: Calendar },
    { id: 'weekly', name: 'Weekly Reports', icon: Clock },
    { id: 'monthly', name: 'Monthly Reports', icon: TrendingUp },
    { id: 'custom', name: 'Custom Reports', icon: Filter }
  ]

  const handleRefresh = () => {
    refetchDashboard()
    refetchDaily()
    refetchWeekly()
    refetchMonthly()
    refetchCustom()
    toast.success('Analytics refreshed!')
  }

  const handleExport = async (format: 'excel' | 'pdf') => {
    if (!currentCompany?._id) return

    setIsExporting(true)
    try {
      if (format === 'excel') {
        await exportToExcel()
      } else {
        await exportToPDF()
      }
      
      toast.success(`${format.toUpperCase()} report exported successfully!`)
    } catch (error) {
      toast.error(`Failed to export ${format.toUpperCase()} report`)
      console.error('Export error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const exportToExcel = async () => {
    const workbook = XLSX.utils.book_new()
    
    // Add different sheets based on active tab
    if (activeTab === 'dashboard' && dashboardData?.data) {
      const ws1 = XLSX.utils.json_to_sheet([dashboardData.data.kpiData || {}])
      XLSX.utils.book_append_sheet(workbook, ws1, 'KPIs')
      
      if (dashboardData.data.revenueData && Array.isArray(dashboardData.data.revenueData)) {
        const ws2 = XLSX.utils.json_to_sheet(dashboardData.data.revenueData)
        XLSX.utils.book_append_sheet(workbook, ws2, 'Revenue Data')
      }
    }
    
    XLSX.writeFile(workbook, `analytics-report-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const exportToPDF = async () => {
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(20)
    doc.text('Analytics Report', 20, 20)
    
    // Add date range
    doc.setFontSize(12)
    doc.text(`Date Range: ${filters.startDate} to ${filters.endDate}`, 20, 35)
    
    // Add company info
    if (currentCompany) {
      doc.text(`Company: ${currentCompany.companyName || 'N/A'}`, 20, 45)
    }
    
    // Add KPI data if available
    if (dashboardData?.data?.kpiData) {
      doc.setFontSize(14)
      doc.text('Key Performance Indicators', 20, 60)
      
      const kpiData = dashboardData.data.kpiData
      const tableData = [
        ['Metric', 'Value'],
        ['Total Orders', (kpiData as any).totalOrders?.toString() || '0'],
        ['Total Revenue', `₹${(kpiData as any).totalRevenue?.toLocaleString() || '0'}`],
        ['Production Orders', (kpiData as any).productionOrders?.toString() || '0'],
        ['Completed Production', (kpiData as any).completedProduction?.toString() || '0'],
        ['Total Inventory', (kpiData as any).totalInventory?.toString() || '0'],
        ['Total Employees', (kpiData as any).totalEmployees?.toString() || '0'],
        ['Total Customers', (kpiData as any).totalCustomers?.toString() || '0']
      ]
      
      // @ts-ignore
      doc.autoTable({
        head: [tableData[0]],
        body: tableData.slice(1),
        startY: 70,
        theme: 'grid'
      })
    }
    
    doc.save(`analytics-report-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num)
  }

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600'
    if (growth < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const renderDashboard = () => {
    if (dashboardLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )
    }

    const data = dashboardData?.data as any
    if (!data) return <div className="flex items-center justify-center h-64 text-gray-500">No data available</div>

    return (
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold">
                  {formatCurrency(data.kpiData?.totalRevenue || 0)}
                </p>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <DollarSign className="h-8 w-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Orders</p>
                <p className="text-3xl font-bold">
                  {formatNumber(data.kpiData?.totalOrders || 0)}
                </p>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <FileText className="h-8 w-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Production Orders</p>
                <p className="text-3xl font-bold">
                  {formatNumber(data.kpiData?.productionOrders || 0)}
                </p>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <Package className="h-8 w-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Employees</p>
                <p className="text-3xl font-bold">
                  {formatNumber(data.kpiData?.totalEmployees || 0)}
                </p>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <Users className="h-8 w-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.revenueData?.breakdown || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    formatter={(value) => formatCurrency(Number(value))} 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Department Distribution</h3>
              <PieChartIcon className="h-5 w-5 text-blue-500" />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.departmentData || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ department, count }) => `${department}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {(data.departmentData || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Inventory Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Inventory Distribution</h3>
            <BarChartIcon className="h-5 w-5 text-orange-500" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.inventoryDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="category" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  formatter={(value) => formatCurrency(Number(value))} 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    )
  }

  const renderReports = (data: any, loading: boolean, type: string) => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )
    }

    if (!data?.data) return <div className="flex items-center justify-center h-64 text-gray-500">No data available</div>

    const reportData = data.data
    const summary = reportData.summary || reportData

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Orders</p>
                <p className="text-3xl font-bold">
                  {formatNumber(summary.totalOrders || 0)}
                </p>
              </div>
              <FileText className="h-8 w-8" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold">
                  {formatCurrency(summary.totalRevenue || 0)}
                </p>
              </div>
              <DollarSign className="h-8 w-8" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Production Orders</p>
                <p className="text-3xl font-bold">
                  {formatNumber(summary.productionOrders || 0)}
                </p>
              </div>
              <Package className="h-8 w-8" />
            </div>
          </div>
        </div>

        {/* Detailed Data Table */}
        {reportData.data && reportData.data.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">Detailed Data</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.data.slice(0, 10).map((item: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(item.createdAt || item.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.orderNumber || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(item.totalAmount || item.revenue || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          item.status === 'completed' ? 'bg-green-100 text-green-800' :
                          item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          item.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status || 'Unknown'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 space-y-6">
        <ReportsHeader
          title="Advanced Analytics & Reports"
          description="Comprehensive analytics dashboard with daily, weekly, monthly, and custom reports"
          icon={<BarChart3 className="h-6 w-6" />}
        />

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Filters & Settings</h3>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                    <option value="1y">Last year</option>
                  </select>
                </div>

                {/* Departments */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Departments</label>
                  <select
                    multiple
                    value={filters.departments}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      departments: Array.from(e.target.selectedOptions, option => option.value)
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {filterOptions?.data?.departments?.map((dept: any) => (
                      <option key={dept.value} value={dept.value}>{dept.label}</option>
                    ))}
                  </select>
                </div>

                {/* Products */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Products</label>
                  <select
                    multiple
                    value={filters.products}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      products: Array.from(e.target.selectedOptions, option => option.value)
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {filterOptions?.data?.products?.map((product: any) => (
                      <option key={product.value} value={product.value}>{product.label}</option>
                    ))}
                  </select>
                </div>

                {/* Statuses */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Statuses</label>
                  <select
                    multiple
                    value={filters.statuses}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      statuses: Array.from(e.target.selectedOptions, option => option.value)
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {filterOptions?.data?.statuses?.map((status: any) => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setFilters({
                    dateRange: '30d',
                    startDate: '',
                    endDate: '',
                    departments: [],
                    products: [],
                    statuses: [],
                    metrics: ['all'],
                    groupBy: 'date',
                    sortBy: 'revenue',
                    sortOrder: 'desc'
                  })}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Reset Filters
                </button>
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {tab.icon && React.createElement(tab.icon, { className: "h-4 w-4" })}
                    <span>{tab.name}</span>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Action Buttons */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex space-x-3">
                <button
                  onClick={handleRefresh}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh</span>
                </button>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleExport('excel')}
                  disabled={isExporting}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  <span>{isExporting ? 'Exporting...' : 'Export Excel'}</span>
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  disabled={isExporting}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  <span>{isExporting ? 'Exporting...' : 'Export PDF'}</span>
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'daily' && renderReports(dailyData, dailyLoading, 'daily')}
            {activeTab === 'weekly' && renderReports(weeklyData, weeklyLoading, 'weekly')}
            {activeTab === 'monthly' && renderReports(monthlyData, monthlyLoading, 'monthly')}
            {activeTab === 'custom' && renderReports(customData, customLoading, 'custom')}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}