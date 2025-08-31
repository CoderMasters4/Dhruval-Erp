'use client'

import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Filter, 
  Download,
  Calendar,
  DollarSign,
  Users,
  Package,
  Activity,
  ShoppingCart,
  FileText,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Search,
  RefreshCw
} from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { selectCurrentUser, selectIsSuperAdmin } from '@/lib/features/auth/authSlice'
import {
  useGetCustomerSalesAnalyticsQuery,
  useGetCustomerSalesReportQuery,
  useExportCustomerSalesReportMutation
} from '@/lib/api/salesAnalyticsApi'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ComposedChart
} from 'recharts'
import clsx from 'clsx'

export default function CustomerSalesAnalyticsPage() {
  const user = useSelector(selectCurrentUser)
  const isSuperAdmin = useSelector(selectIsSuperAdmin)
  
  // State management
  const [timeRange, setTimeRange] = useState('30d')
  const [selectedCustomer, setSelectedCustomer] = useState('all')
  const [selectedProduct, setSelectedProduct] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [groupBy, setGroupBy] = useState('customer')
  const [sortBy, setSortBy] = useState('revenue')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showFilters, setShowFilters] = useState(false)
  const [includeDetails, setIncludeDetails] = useState(false)

  // API queries
  const { data: analyticsData, isLoading: analyticsLoading, error: analyticsError, refetch: refetchAnalytics } = useGetCustomerSalesAnalyticsQuery({
    timeRange,
    companyId: user?.companyId,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    customerId: selectedCustomer !== 'all' ? selectedCustomer : undefined,
    productId: selectedProduct !== 'all' ? selectedProduct : undefined,
    status: selectedStatus !== 'all' ? selectedStatus : undefined,
    groupBy,
    sortBy,
    sortOrder,
  })

  const { data: detailedReport, isLoading: reportLoading, error: reportError, refetch: refetchReport } = useGetCustomerSalesReportQuery({
    timeRange,
    companyId: user?.companyId,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    customerId: selectedCustomer !== 'all' ? selectedCustomer : undefined,
    productId: selectedProduct !== 'all' ? selectedProduct : undefined,
    status: selectedStatus !== 'all' ? selectedStatus : undefined,
    groupBy,
    sortBy,
    sortOrder,
    includeDetails,
  })

  // Export mutation
  const [exportReport, { isLoading: exportLoading }] = useExportCustomerSalesReportMutation()

  // Data processing
  const salesData = analyticsData?.data?.salesData || []
  const customerData = analyticsData?.data?.customerData || []
  const productData = analyticsData?.data?.productData || []
  const revenueTrends = analyticsData?.data?.revenueTrends || []
  const topCustomers = analyticsData?.data?.topCustomers || []
  const topProducts = analyticsData?.data?.topProducts || []

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

  // Utility functions
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

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="h-4 w-4" />
    if (growth < 0) return <TrendingDown className="h-4 w-4" />
    return <Activity className="h-4 w-4" />
  }

  const handleExportReport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      const result = await exportReport({
        format,
        timeRange,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        companyId: user?.companyId,
        customerId: selectedCustomer !== 'all' ? selectedCustomer : undefined,
        productId: selectedProduct !== 'all' ? selectedProduct : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        groupBy,
        sortBy,
        sortOrder,
        includeDetails,
      }).unwrap()

      // Open download URL
      window.open(result.data.downloadUrl, '_blank')
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const handleRefresh = () => {
    refetchAnalytics()
    refetchReport()
  }

  const isLoading = analyticsLoading || reportLoading
  const hasError = analyticsError || reportError

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gradient-to-br from-blue-50 via-white to-indigo-50 min-h-screen">
          <div className="bg-white rounded-xl border border-blue-200 shadow-lg p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-blue-200 rounded-xl"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-blue-200 rounded w-3/4"></div>
                    <div className="h-3 bg-blue-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (hasError) {
    return (
      <AppLayout>
        <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gradient-to-br from-blue-50 via-white to-indigo-50 min-h-screen">
          <div className="bg-white rounded-xl border border-red-500 shadow-lg p-6 text-center">
            <BarChart3 className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-black mb-2">Error Loading Sales Analytics</h3>
            <p className="text-red-600">Failed to load sales data. Please try again.</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gradient-to-br from-blue-50 via-white to-indigo-50 min-h-screen">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-blue-200 shadow-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Customer Sales Analytics
                </h1>
                <p className="text-gray-600 mt-1">
                  Comprehensive customer-wise sales analysis and reporting
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleRefresh}
                className="flex items-center px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl border border-blue-200 shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Group By</label>
                <select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="customer">Customer</option>
                  <option value="product">Product</option>
                  <option value="date">Date</option>
                  <option value="status">Status</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="revenue">Revenue</option>
                  <option value="orders">Orders</option>
                  <option value="quantity">Quantity</option>
                  <option value="date">Date</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeDetails}
                    onChange={(e) => setIncludeDetails(e.target.checked)}
                    className="mr-2"
                  />
                  Include Detailed Data
                </label>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'} Sort Order
                </button>
              </div>
            </div>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-xl border border-blue-200 shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(analyticsData?.data?.summary?.totalRevenue || 0)}
                </p>
                <div className={clsx("flex items-center text-sm mt-1", getGrowthColor(analyticsData?.data?.summary?.revenueGrowth || 0))}>
                  {getGrowthIcon(analyticsData?.data?.summary?.revenueGrowth || 0)}
                  <span className="ml-1">{Math.abs(analyticsData?.data?.summary?.revenueGrowth || 0)}%</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-blue-200 shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-blue-600">
                  {formatNumber(analyticsData?.data?.summary?.totalOrders || 0)}
                </p>
                <div className={clsx("flex items-center text-sm mt-1", getGrowthColor(analyticsData?.data?.summary?.ordersGrowth || 0))}>
                  {getGrowthIcon(analyticsData?.data?.summary?.ordersGrowth || 0)}
                  <span className="ml-1">{Math.abs(analyticsData?.data?.summary?.ordersGrowth || 0)}%</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-blue-200 shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Customers</p>
                <p className="text-3xl font-bold text-purple-600">
                  {formatNumber(analyticsData?.data?.summary?.activeCustomers || 0)}
                </p>
                <div className={clsx("flex items-center text-sm mt-1", getGrowthColor(analyticsData?.data?.summary?.customersGrowth || 0))}>
                  {getGrowthIcon(analyticsData?.data?.summary?.customersGrowth || 0)}
                  <span className="ml-1">{Math.abs(analyticsData?.data?.summary?.customersGrowth || 0)}%</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-blue-200 shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-3xl font-bold text-orange-600">
                  {formatCurrency(analyticsData?.data?.summary?.averageOrderValue || 0)}
                </p>
                <div className={clsx("flex items-center text-sm mt-1", getGrowthColor(analyticsData?.data?.summary?.aovGrowth || 0))}>
                  {getGrowthIcon(analyticsData?.data?.summary?.aovGrowth || 0)}
                  <span className="ml-1">{Math.abs(analyticsData?.data?.summary?.aovGrowth || 0)}%</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trends */}
          <div className="bg-white rounded-xl border border-blue-200 shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Trends</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Revenue</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Orders</span>
                </div>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={revenueTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis yAxisId="revenue" orientation="left" />
                  <YAxis yAxisId="orders" orientation="right" />
                  <Tooltip />
                  <Area yAxisId="revenue" type="monotone" dataKey="revenue" fill="#3b82f6" fillOpacity={0.3} stroke="#3b82f6" />
                  <Line yAxisId="orders" type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Customers */}
          <div className="bg-white rounded-xl border border-blue-200 shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Top Customers</h3>
              <div className="text-sm text-gray-600">
                Total: {formatCurrency(topCustomers.reduce((sum, customer) => sum + customer.revenue, 0))}
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topCustomers.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="customerName" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Bar dataKey="revenue" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Customer Performance Table */}
        <div className="bg-white rounded-xl border border-blue-200 shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Customer Performance Analysis</h3>
            <div className="flex space-x-3">
              <button
                onClick={() => handleExportReport('pdf')}
                className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </button>
              <button
                onClick={() => handleExportReport('excel')}
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </button>
              <button
                onClick={() => handleExportReport('csv')}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </button>
            </div>
          </div>
          
          {customerData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Order Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customerData.map((customer, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{customer.customerName}</div>
                            <div className="text-sm text-gray-500">{customer.customerEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatNumber(customer.totalOrders)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(customer.totalRevenue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(customer.averageOrderValue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={clsx(
                          "inline-flex px-2 py-1 text-xs font-semibold rounded-full",
                          customer.status === 'active' ? "bg-green-100 text-green-800" :
                          customer.status === 'inactive' ? "bg-red-100 text-red-800" :
                          "bg-gray-100 text-gray-800"
                        )}>
                          {customer.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">No customer data available for selected filters</div>
          )}
        </div>

        {/* Product Performance */}
        <div className="bg-white rounded-xl border border-blue-200 shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Product Performance</h3>
          </div>
          
          {productData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {productData.map((product, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{product.productName}</h4>
                    <span className="text-sm text-gray-500">{product.category}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Orders:</span>
                      <span className="font-medium">{formatNumber(product.totalOrders)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Revenue:</span>
                      <span className="font-medium text-green-600">{formatCurrency(product.totalRevenue)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Quantity:</span>
                      <span className="font-medium">{formatNumber(product.totalQuantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">No product data available for selected filters</div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
