'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { DashboardHeader } from '@/components/ui/DashboardHeader'
import { ResponsiveContainer, ResponsiveGrid } from '@/components/ui/ResponsiveLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import {
  useGetSalesStatsQuery,
  useGetSalesOrdersQuery,
  useGetCustomerSalesReportQuery,
  useUpdatePaymentStatusMutation,
  useExportSalesDataMutation
} from '@/lib/api/salesApi'
import {
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Search,
  Filter,
  Download,
  Eye,
  Plus,
  CreditCard,
  AlertCircle,
  RefreshCw,
  Edit,
  Trash2
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function SalesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

  // RTK Query hooks
  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats
  } = useGetSalesStatsQuery()

  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders
  } = useGetSalesOrdersQuery({
    search: searchTerm,
    status: selectedFilter === 'all' ? undefined : selectedFilter,
    page: currentPage,
    limit: 10
  })

  const {
    data: customerReportData,
    isLoading: customerReportLoading
  } = useGetCustomerSalesReportQuery({})

  const [updatePaymentStatus] = useUpdatePaymentStatusMutation()
  const [exportSalesData] = useExportSalesDataMutation()

  // Handler functions
  const handlePaymentStatusUpdate = async (orderId: string, paymentStatus: 'pending' | 'paid' | 'overdue' | 'partial') => {
    try {
      await updatePaymentStatus({ id: orderId, paymentStatus }).unwrap()
      toast.success('Payment status updated successfully')
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update payment status')
    }
  }

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const result = await exportSalesData({
        format,
        filters: {
          search: searchTerm,
          status: selectedFilter === 'all' ? undefined : selectedFilter
        }
      }).unwrap()
      toast.success('Export started. Download will begin shortly.')
      // Handle download URL
      if (result.data.downloadUrl) {
        window.open(result.data.downloadUrl, '_blank')
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to export data')
    }
  }

  const handleRefresh = () => {
    refetchStats()
    refetchOrders()
    toast.success('Data refreshed')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'partial': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'partial': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Loading states
  if (statsLoading || ordersLoading) {
    return (
      <AppLayout>
        <ResponsiveContainer className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </ResponsiveContainer>
      </AppLayout>
    )
  }

  // Error states
  if (statsError || ordersError) {
    return (
      <AppLayout>
        <ResponsiveContainer className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
            <p className="text-gray-600 mb-4">Failed to load sales data. Please try again.</p>
            <Button onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </ResponsiveContainer>
      </AppLayout>
    )
  }

  const stats = statsData?.data
  const orders = ordersData?.data || []
  const customerReport = customerReportData?.data || []

  return (
    <AppLayout>
      <ResponsiveContainer className="space-y-6">
        {/* Header */}
        <DashboardHeader
          title="Sales Management"
          description="Track sales, customer payments, and revenue analytics"
          icon={<ShoppingBag className="h-6 w-6 text-white" />}
          actions={
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          }
        />

        {/* Stats Cards */}
        <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 4 }} gap="md">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Sales</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{stats ? (stats.totalSales / 100000).toFixed(1) : '0'}L
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Growth</p>
                  <p className="text-2xl font-bold text-green-600">
                    +{stats?.monthlyGrowth || 0}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Customers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.totalCustomers || 0}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                  <p className="text-2xl font-bold text-red-600">
                    ₹{stats ? (stats.pendingPayments / 100000).toFixed(1) : '0'}L
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </ResponsiveGrid>

        {/* Main Content */}
        <ResponsiveGrid cols={{ default: 1, lg: 3 }} gap="lg">
          {/* Recent Sales */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Sales</CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport('excel')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Excel
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport('csv')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      New Sale
                    </Button>
                  </div>
                </div>
                
                {/* Search and Filter */}
                <div className="flex space-x-2 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search sales..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No sales orders found</p>
                    </div>
                  ) : (
                    orders.map((order) => (
                      <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div>
                              <p className="font-medium text-gray-900">{order.orderId}</p>
                              <p className="text-sm text-gray-600">{order.customer.name}</p>
                              <p className="text-xs text-gray-500">
                                {order.items.length} item(s) • {new Date(order.orderDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">₹{order.totalAmount.toLocaleString()}</p>
                          <div className="flex space-x-1 mt-1">
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                            <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                              {order.paymentStatus}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {order.expectedDelivery ? `ETA: ${new Date(order.expectedDelivery).toLocaleDateString()}` : 'No ETA'}
                          </p>
                        </div>
                        <div className="ml-4 flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePaymentStatusUpdate(order._id, order.paymentStatus === 'paid' ? 'pending' : 'paid')}
                          >
                            <CreditCard className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer-wise Sales */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Top Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customerReportLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <LoadingSpinner />
                    </div>
                  ) : customerReport.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No customer data found</p>
                    </div>
                  ) : (
                    customerReport.slice(0, 5).map((customer, index) => (
                      <div key={customer.customerId} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div>
                          <p className="font-medium text-gray-900">{customer.customerName}</p>
                          <p className="text-sm text-gray-600">{customer.totalOrders} orders</p>
                          <p className="text-xs text-gray-500">
                            Last: {new Date(customer.lastOrderDate).toLocaleDateString()}
                          </p>
                          <Badge
                            className={
                              customer.paymentStatus === 'good'
                                ? 'bg-green-100 text-green-800'
                                : customer.paymentStatus === 'delayed'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }
                            size="sm"
                          >
                            {customer.paymentStatus}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            ₹{(customer.totalSales / 100000).toFixed(1)}L
                          </p>
                          <p className="text-xs text-gray-500">
                            Avg: ₹{(customer.averageOrderValue / 1000).toFixed(0)}K
                          </p>
                          {customer.outstandingAmount > 0 && (
                            <p className="text-xs text-red-600">
                              Outstanding: ₹{(customer.outstandingAmount / 1000).toFixed(0)}K
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </ResponsiveGrid>
      </ResponsiveContainer>
    </AppLayout>
  )
}
