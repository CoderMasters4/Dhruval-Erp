'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { DashboardHeader } from '@/components/ui/DashboardHeader'
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer'
import { ResponsiveGrid } from '@/components/ui/ResponsiveGrid'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import {
  useGetPurchaseStatsQuery,
  useGetPurchaseOrdersQuery,
  useGetSupplierPurchaseReportQuery,
  useGetCategoryWiseSpendQuery,
  useUpdatePurchasePaymentStatusMutation,
  useExportPurchaseDataMutation
} from '@/lib/api/purchaseApi'
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
  Box
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function PurchasePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory] = useState('all')
  const [currentPage] = useState(1)

  // RTK Query hooks
  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats
  } = useGetPurchaseStatsQuery()

  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders
  } = useGetPurchaseOrdersQuery({
    search: searchTerm,
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    page: currentPage,
    limit: 10
  })

  const {
    data: supplierReportData,
    isLoading: supplierReportLoading
  } = useGetSupplierPurchaseReportQuery({})

  const {
    data: categorySpendData,
    isLoading: categorySpendLoading
  } = useGetCategoryWiseSpendQuery({})

  const [updatePaymentStatus] = useUpdatePurchasePaymentStatusMutation()
  const [exportPurchaseData] = useExportPurchaseDataMutation()

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
      const result = await exportPurchaseData({
        format,
        filters: {
          search: searchTerm,
          category: selectedCategory === 'all' ? undefined : selectedCategory
        }
      }).unwrap()

      toast.success('Export started. Download will begin shortly.')

      if (result.data.downloadUrl) {
        try {
          // Import download utility dynamically
          const { downloadWithFallback } = await import('@/utils/downloadUtils')

          const downloadResult = await downloadWithFallback(
            result.data.downloadUrl,
            `purchase-export-${new Date().toISOString().split('T')[0]}.${format}`
          )

          if (downloadResult.success) {
            if (downloadResult.method === 'clipboard') {
              toast('Download URL copied to clipboard. Paste in new tab to download.', {
                icon: 'ℹ️',
                duration: 5000
              })
            }
          } else {
            // Final fallback
            window.open(result.data.downloadUrl, '_blank')
          }
        } catch (importError) {
          // Fallback to original method
          window.open(result.data.downloadUrl, '_blank')
        }
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
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'in_transit': return 'bg-blue-100 text-blue-800'
      case 'shipped': return 'bg-cyan-100 text-cyan-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'chemicals': return 'bg-purple-100 text-purple-800'
      case 'grey_fabric': return 'bg-blue-100 text-blue-800'
      case 'colors': return 'bg-green-100 text-green-800'
      case 'packing_material': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'chemicals': return <Droplets className="h-4 w-4" />
      case 'grey_fabric': return <Package className="h-4 w-4" />
      case 'colors': return <Palette className="h-4 w-4" />
      case 'packing_material': return <Box className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
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
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
            <p className="text-gray-600 mb-4">Failed to load purchase data. Please try again.</p>
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
  const supplierReport = supplierReportData?.data || []
  const categorySpend = categorySpendData?.data || []

  return (
    <AppLayout>
      <ResponsiveContainer className="space-y-6">
        {/* Header */}
        <DashboardHeader
          title="Purchase Management"
          description="Track purchases, supplier payments, and material procurement"
          icon={<ShoppingCart className="h-6 w-6 text-white" />}
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
                  <p className="text-sm font-medium text-gray-600">Total Purchases</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{stats ? (stats.totalPurchases / 100000).toFixed(1) : '0'}L
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
                    ₹{stats ? (stats.monthlySpend / 100000).toFixed(1) : '0'}L
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
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.totalSuppliers || 0}
                  </p>
                </div>
                <Truck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats?.pendingOrders || 0}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </ResponsiveGrid>

        {/* Main Content */}
        <ResponsiveGrid cols={{ default: 1, lg: 3 }} gap="lg">
          {/* Recent Purchases */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Purchases</CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      New Purchase
                    </Button>
                  </div>
                </div>
                
                {/* Search and Filter */}
                <div className="flex space-x-2 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search purchases..."
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
                      <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No purchase orders found</p>
                    </div>
                  ) : (
                    orders.map((order) => (
                      <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div>
                              <p className="font-medium text-gray-900">{order.purchaseOrderId}</p>
                              <p className="text-sm text-gray-600">{order.supplier?.name || 'Unknown Supplier'}</p>
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

          {/* Supplier-wise Purchases & Category Spend */}
          <div className="space-y-6">
            {/* Top Suppliers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Suppliers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
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
                    supplierReport.slice(0, 5).map((supplier) => (
                      <div key={supplier.supplierId} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div>
                          <p className="font-medium text-gray-900">{supplier.supplierName}</p>
                          <p className="text-sm text-gray-600">{supplier.totalOrders} orders</p>
                          <p className="text-xs text-gray-500">
                            Last: {new Date(supplier.lastOrderDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            ₹{(supplier.totalPurchases / 100000).toFixed(1)}L
                          </p>
                          <p className="text-xs text-gray-500">
                            Avg: ₹{(supplier.averageOrderValue / 1000).toFixed(0)}K
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

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
                    categorySpend.map((category) => (
                      <div key={category.category} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            {getCategoryIcon(category.category)}
                            <span className="text-sm font-medium">{category.category.replace('_', ' ')}</span>
                          </div>
                          <span className="text-sm text-gray-600">
                            ₹{(category.amount / 100000).toFixed(1)}L ({category.percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${category.percentage}%` }}
                          ></div>
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
