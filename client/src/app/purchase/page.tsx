'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { DashboardHeader } from '@/components/ui/DashboardHeader'
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer'
import { ResponsiveGrid } from '@/components/ui/ResponsiveGrid'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { CreatePurchaseOrderModal } from '@/components/purchase/CreatePurchaseOrderModal'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  useGetPurchaseStatsQuery,
  useGetPurchaseOrdersQuery,
  useGetSupplierPurchaseReportQuery,
  useGetCategoryWiseSpendQuery,
  useGetPurchaseAnalyticsQuery,
  useUpdatePurchasePaymentStatusMutation,
  useExportPurchaseDataMutation,
  useCreatePurchaseOrderMutation
} from '@/lib/api/purchaseApi'
import { useSelector } from 'react-redux'
import { selectCurrentUser, selectIsSuperAdmin } from '@/lib/features/auth/authSlice'
import {
  ShoppingCart,
  TrendingDown,
  Package,
  Truck,
  Search,
  Filter,
  Download,
  Eye,
  Plus,
  AlertTriangle,
  RefreshCw,
  Edit,
  CreditCard,
  Droplets,
  Palette,
  Box,
  BarChart3,
  TrendingUp,
  Calendar,
  DollarSign,
  Users,
  FileText
} from 'lucide-react'
import toast from 'react-hot-toast'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer as RechartsContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

// Component that uses useSearchParams
function PurchasePageContent() {
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month')
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('overview')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const user = useSelector(selectCurrentUser)
  const isSuperAdmin = useSelector(selectIsSuperAdmin)

  // Get user's company ID
  const userCompanyId = user?.companyAccess?.[0]?.companyId

  // Determine which company ID to use
  const targetCompanyId = isSuperAdmin && selectedCompanyId && selectedCompanyId !== 'all' ? selectedCompanyId : userCompanyId

  // RTK Query hooks
  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats
  } = useGetPurchaseStatsQuery({ companyId: targetCompanyId })

  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders
  } = useGetPurchaseOrdersQuery({
    search: searchTerm,
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    page: currentPage,
    limit: 10,
    companyId: targetCompanyId
  })

  const {
    data: supplierReportData,
    isLoading: supplierReportLoading
  } = useGetSupplierPurchaseReportQuery({ companyId: targetCompanyId })

  const {
    data: categorySpendData,
    isLoading: categorySpendLoading
  } = useGetCategoryWiseSpendQuery({ companyId: targetCompanyId })

  const {
    data: analyticsData,
    isLoading: analyticsLoading
  } = useGetPurchaseAnalyticsQuery({ 
    period: selectedPeriod, 
    companyId: targetCompanyId 
  })

  const [updatePaymentStatus] = useUpdatePurchasePaymentStatusMutation()
  const [exportPurchaseData] = useExportPurchaseDataMutation()
  const [createPurchaseOrder] = useCreatePurchaseOrderMutation()

  // Handle URL parameters
  useEffect(() => {
    const action = searchParams.get('action')
    const tab = searchParams.get('tab')
    
    if (action === 'create') {
      setShowCreateModal(true)
    }
    
    if (tab) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Handler functions
  const handlePaymentStatusUpdate = async (orderId: string, paymentStatus: 'pending' | 'paid' | 'overdue' | 'partial') => {
    try {
      await updatePaymentStatus({ id: orderId, paymentStatus }).unwrap()
      toast.success('Payment status updated successfully')
      refetchOrders()
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update payment status')
    }
  }

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const result = await exportPurchaseData({
        format,
        filters: {
          companyId: targetCompanyId,
          search: searchTerm,
          category: selectedCategory === 'all' ? undefined : selectedCategory
        }
      }).unwrap()
      toast.success('Data exported successfully')
      // Handle download
      window.open(result.data.downloadUrl, '_blank')
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to export data')
    }
  }

  const handleRefresh = () => {
    refetchStats()
    refetchOrders()
  }

  // Data extraction
  const stats = statsData?.data
  const orders = ordersData?.data || []
  const supplierReport = supplierReportData?.data || []
  const categorySpend = categorySpendData?.data || []
  const analytics = analyticsData?.data

  // Category icon mapping
  const getCategoryIcon = (category: string | null | undefined) => {
    if (!category) return <Package className="h-4 w-4 text-gray-600" />
    
    switch (category) {
      case 'chemicals':
        return <Droplets className="h-4 w-4 text-blue-600" />
      case 'grey_fabric':
        return <Package className="h-4 w-4 text-gray-600" />
      case 'colors':
        return <Palette className="h-4 w-4 text-purple-600" />
      case 'packing_material':
        return <Box className="h-4 w-4 text-orange-600" />
      default:
        return <Package className="h-4 w-4 text-gray-600" />
    }
  }

  // Status badge mapping
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      case 'confirmed':
        return <Badge variant="default">Confirmed</Badge>
      case 'shipped':
        return <Badge variant="outline">Shipped</Badge>
      case 'delivered':
        return <Badge variant="success">Delivered</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>
      case 'paid':
        return <Badge variant="success">Paid</Badge>
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>
      case 'partial':
        return <Badge variant="outline">Partial</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  return (
    <AppLayout>
      <ResponsiveContainer className="space-y-6">
        {/* Header */}
        <DashboardHeader
          title="Purchase Management"
          description="Track purchases, supplier payments, and material procurement with analytics"
          icon={<ShoppingCart className="h-6 w-6 text-white" />}
          actions={
            <div className="flex gap-2">
              {isSuperAdmin && (
                <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select Company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Companies</SelectItem>
                    {/* Add company options here */}
                  </SelectContent>
                </Select>
              )}
              <CreatePurchaseOrderModal 
                onSuccess={handleRefresh} 
                open={showCreateModal}
                onOpenChange={setShowCreateModal}
              />
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          }
        />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 4 }} gap="md">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Purchases</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats ? formatCurrency(stats.totalPurchases) : '₹0'}
                      </p>
                    </div>
                    <Package className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Monthly Spend</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {stats ? formatCurrency(stats.monthlySpend) : '₹0'}
                      </p>
                    </div>
                    <TrendingDown className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Suppliers</p>
                      <p className="text-2xl font-bold text-green-600">
                        {stats ? stats.totalSuppliers : 0}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                      <p className="text-2xl font-bold text-red-600">
                        {stats ? stats.pendingOrders : 0}
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </ResponsiveGrid>

            {/* Charts Grid */}
            <ResponsiveGrid cols={{ default: 1, lg: 2 }} gap="lg">
              {/* Category-wise Spend */}
              <Card>
                <CardHeader>
                  <CardTitle>Category-wise Spend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categorySpendLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <LoadingSpinner />
                      </div>
                    ) : categorySpend.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No category data found</p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          {categorySpend.map((category) => (
                            <div key={category.category} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-2">
                                  {getCategoryIcon(category.category)}
                                  <span className="text-sm font-medium">{category.category?.replace('_', ' ') || 'Unknown Category'}</span>
                                </div>
                                <span className="text-sm text-gray-600">
                                  {formatCurrency(category.amount)} ({category.percentage.toFixed(1)}%)
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${category.percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-6">
                          <RechartsContainer width="100%" height={200}>
                            <PieChart>
                              <Pie
                                data={categorySpend}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ category, percentage }) => `${category?.replace('_', ' ') || 'Unknown'} ${percentage.toFixed(1)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="amount"
                              >
                                {categorySpend.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                            </PieChart>
                          </RechartsContainer>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Top Suppliers */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Suppliers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {supplierReportLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <LoadingSpinner />
                      </div>
                    ) : supplierReport.length === 0 ? (
                      <div className="text-center py-8">
                        <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No supplier data found</p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-3">
                          {supplierReport.slice(0, 5).map((supplier) => (
                            <div key={supplier.supplierId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-100 rounded-full">
                                  <Truck className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{supplier.supplierName}</p>
                                  <p className="text-xs text-gray-500">{supplier.category}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-sm">{formatCurrency(supplier.totalPurchases)}</p>
                                <p className="text-xs text-gray-500">{supplier.totalOrders} orders</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-6">
                          <RechartsContainer width="100%" height={200}>
                            <BarChart data={supplierReport.slice(0, 5)}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="supplierName" />
                              <YAxis />
                              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                              <Bar dataKey="totalPurchases" fill="#0ea5e9" />
                            </BarChart>
                          </RechartsContainer>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </ResponsiveGrid>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Analytics Controls */}
            <div className="flex gap-4 items-center">
              <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="quarter">Quarter</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Analytics Charts */}
            <ResponsiveGrid cols={{ default: 1, lg: 2 }} gap="lg">
              {/* Purchase Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Purchase Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <LoadingSpinner />
                    </div>
                  ) : analytics?.dailyPurchases?.length === 0 ? (
                    <div className="text-center py-8">
                      <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No trend data available</p>
                    </div>
                  ) : (
                    <RechartsContainer width="100%" height={300}>
                      <LineChart data={analytics?.dailyPurchases || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Line type="monotone" dataKey="amount" stroke="#0ea5e9" strokeWidth={2} />
                      </LineChart>
                    </RechartsContainer>
                  )}
                </CardContent>
              </Card>

              {/* Monthly Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <LoadingSpinner />
                    </div>
                  ) : analytics?.monthlyPurchases?.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No monthly data available</p>
                    </div>
                  ) : (
                    <RechartsContainer width="100%" height={300}>
                      <BarChart data={analytics?.monthlyPurchases || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Bar dataKey="amount" fill="#10b981" />
                      </BarChart>
                    </RechartsContainer>
                  )}
                </CardContent>
              </Card>
            </ResponsiveGrid>

            {/* Purchase Trends Table */}
            <Card>
              <CardHeader>
                <CardTitle>Purchase Growth Trends</CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : analytics?.purchaseTrends?.length === 0 ? (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No trend data available</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Period</th>
                          <th className="text-left p-2">Amount</th>
                          <th className="text-left p-2">Growth</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics?.purchaseTrends?.map((trend, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2">{trend.period}</td>
                            <td className="p-2">{formatCurrency(trend.amount)}</td>
                            <td className="p-2">
                              <span className={`font-medium ${trend.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {trend.growth >= 0 ? '+' : ''}{trend.growth.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="chemicals">Chemicals</SelectItem>
                  <SelectItem value="grey_fabric">Grey Fabric</SelectItem>
                  <SelectItem value="colors">Colors</SelectItem>
                  <SelectItem value="packing_material">Packing Material</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => handleExport('csv')} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button onClick={() => handleExport('excel')} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
            </div>

            {/* Orders Table */}
            <Card>
              <CardHeader>
                <CardTitle>Purchase Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No purchase orders found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Order ID</th>
                          <th className="text-left p-2">Supplier</th>
                          <th className="text-left p-2">Amount</th>
                          <th className="text-left p-2">Status</th>
                          <th className="text-left p-2">Payment</th>
                          <th className="text-left p-2">Date</th>
                          <th className="text-left p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order._id} className="border-b hover:bg-gray-50">
                            <td className="p-2 font-medium">{order.purchaseOrderId}</td>
                            <td className="p-2">{order.supplier?.name || 'N/A'}</td>
                            <td className="p-2">{formatCurrency(order.totalAmount)}</td>
                            <td className="p-2">{getStatusBadge(order.status)}</td>
                            <td className="p-2">{getPaymentStatusBadge(order.paymentStatus)}</td>
                            <td className="p-2">{new Date(order.orderDate).toLocaleDateString()}</td>
                            <td className="p-2">
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handlePaymentStatusUpdate(order._id, 'paid')}
                                  variant="outline"
                                  size="sm"
                                >
                                  <CreditCard className="h-3 w-3 mr-1" />
                                  Mark Paid
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pagination */}
            {ordersData?.pagination && (
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, ordersData.pagination.total)} of {ordersData.pagination.total} results
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage >= ordersData.pagination.pages}
                    variant="outline"
                    size="sm"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </ResponsiveContainer>
    </AppLayout>
  )
}

// Loading fallback component
function PurchasePageLoading() {
  return (
    <AppLayout>
      <ResponsiveContainer className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </ResponsiveContainer>
    </AppLayout>
  )
}

// Main component with Suspense boundary
export default function PurchasePage() {
  return (
    <Suspense fallback={<PurchasePageLoading />}>
      <PurchasePageContent />
    </Suspense>
  )
}
