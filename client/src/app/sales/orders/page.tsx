'use client'

import { useState } from 'react'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '@/lib/features/auth/authSlice'
import { AppLayout } from '@/components/layout/AppLayout'
import { DashboardHeader } from '@/components/ui/DashboardHeader'
import { ResponsiveGrid } from '@/components/ui/ResponsiveLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import {
  useGetSalesOrdersQuery,
  useUpdatePaymentStatusMutation,
  useCreateSalesOrderMutation,
  useUpdateSalesOrderMutation,
  useDeleteSalesOrderMutation
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
  Trash2,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Target,
  Award,
  Clock,
  Package,
  UserCheck,
  FileText,
  Truck
} from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import SalesOrderModal from '@/components/modals/SalesOrderModal'
import { useRouter } from 'next/navigation'

export default function SalesOrdersPage() {
  const user = useSelector(selectCurrentUser)
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  // RTK Query hooks
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

  // Mutations
  const [updatePaymentStatus] = useUpdatePaymentStatusMutation()
  const [createSalesOrder] = useCreateSalesOrderMutation()
  const [updateSalesOrder] = useUpdateSalesOrderMutation()
  const [deleteSalesOrder] = useDeleteSalesOrderMutation()

  // Extract data
  const orders = ordersData?.data?.orders || []
  const pagination = ordersData?.data?.pagination

  // Handler functions
  const handleQuickStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await updateSalesOrder({ id: orderId, data: { status: newStatus } }).unwrap()
      toast.success(`Order status updated to ${newStatus}!`)
      refetchOrders()
    } catch (error) {
      toast.error('Failed to update order status!')
    }
  }

  const handlePaymentStatusUpdate = async (orderId: string, paymentStatus: 'pending' | 'paid' | 'overdue' | 'partial') => {
    try {
      await updatePaymentStatus({ id: orderId, paymentStatus }).unwrap()
      toast.success('Payment status updated!')
      refetchOrders()
    } catch (error) {
      toast.error('Failed to update payment status!')
    }
  }

  const handleCreateOrder = async (orderData: any) => {
    try {
      const orderWithCompany = {
        ...orderData,
        companyId: user?.companyId || user?.companyAccess?.[0]?.companyId
      }
      await createSalesOrder(orderWithCompany).unwrap()
      toast.success('Sales order created successfully!')
      setShowCreateModal(false)
      refetchOrders()
    } catch (error) {
      toast.error('Failed to create sales order!')
    }
  }

  const handleEditOrder = (order: any) => {
    setSelectedOrder(order)
    setShowEditModal(true)
  }

  const handleUpdateOrder = async (orderData: any) => {
    try {
      const orderWithCompany = {
        ...orderData,
        companyId: user?.companyId || user?.companyAccess?.[0]?.companyId
      }
      await updateSalesOrder({ id: selectedOrder._id, data: orderWithCompany }).unwrap()
      toast.success('Sales order updated successfully!')
      setShowEditModal(false)
      setSelectedOrder(null)
      refetchOrders()
    } catch (error) {
      toast.error('Failed to update sales order!')
    }
  }

  const handleDeleteOrder = async (orderId: string) => {
    if (confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteSalesOrder(orderId).unwrap()
        toast.success('Sales order deleted successfully!')
        refetchOrders()
      } catch (error) {
        toast.error('Failed to delete sales order!')
      }
    }
  }

  const handleCreateDispatch = (order: any) => {
    // Navigate to dispatch page with query parameters
                    const params = new URLSearchParams({
                  customerOrderId: order._id,
                  companyId: order.companyId || '',
                  customerId: order.customerId || '',
                  customerName: order.customerName || '',
                  customerCode: order.customerCode || '',
                  orderNumber: order.orderNumber || '',
                  orderAmount: order.orderSummary?.finalAmount?.toString() || '0'
                })
    
    // Navigate to dispatch page with query parameters
    router.push(`/operations/dispatch/enhanced?${params.toString()}`)
  }

  const handleRefresh = () => {
    refetchOrders()
    toast.success('Orders refreshed!')
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      case 'partial':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (ordersLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <ResponsiveGrid>
        <DashboardHeader
          title="Sales Orders"
          description="Manage and track all sales orders"
          icon={<FileText className="h-6 w-6 text-white" />}
          actions={
            <div className="flex items-center gap-2">
              <Button onClick={() => setShowCreateModal(true)} variant="default" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Order
              </Button>
              <Button 
                onClick={() => {
                  // Find first pending order and create dispatch
                  const firstPendingOrder = orders.find((o: any) => o.status === 'pending' || o.status === 'confirmed');
                  if (firstPendingOrder) {
                    handleCreateDispatch(firstPendingOrder);
                  } else {
                    toast.error('No pending orders found to create dispatch');
                  }
                }} 
                variant="outline" 
                size="sm"
                className="text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                <Truck className="h-4 w-4 mr-2" />
                Quick Dispatch
              </Button>
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          }
        />

        <div className="space-y-6">
          {/* Filters and Search */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search orders..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Sales Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quick Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order: any) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="text-sm font-medium text-gray-900">#{order.orderNumber}</div>
                              <div className="text-sm text-gray-500">{order._id}</div>
                            </div>
                            {(order.status === 'pending' || order.status === 'confirmed') && (
                              <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                <Truck className="h-3 w-3" />
                                <span>Dispatch Ready</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.customerName}</div>
                          <div className="text-sm text-gray-500">{order.customerCode}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                            <select
                              value={order.status}
                              onChange={(e) => handleQuickStatusUpdate(order._id, e.target.value)}
                              className="text-xs border border-gray-300 rounded px-2 py-1 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              disabled={order.status === 'completed' || order.status === 'cancelled'}
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Badge className={getPaymentStatusColor(order.payment.paymentStatus)}>
                              {order.payment.paymentStatus}
                            </Badge>
                            <select
                              value={order.payment.paymentStatus}
                              onChange={(e) => handlePaymentStatusUpdate(order._id, e.target.value as any)}
                              className="text-xs border border-gray-300 rounded px-2 py-1 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="pending">Pending</option>
                              <option value="partial">Partial</option>
                              <option value="paid">Paid</option>
                              <option value="overdue">Overdue</option>
                            </select>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(order.orderSummary.finalAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-1">
                            {/* Quick Status Update */}
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleQuickStatusUpdate(order._id, 'processing')}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              title="Mark as Processing"
                              disabled={order.status === 'completed' || order.status === 'cancelled'}
                            >
                              <RefreshCw className="h-3 w-3" />
                            </Button>
                            
                            {/* Quick Payment Update */}
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handlePaymentStatusUpdate(order._id, 'paid')}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              title="Mark as Paid"
                              disabled={order.payment.paymentStatus === 'paid'}
                            >
                              <CreditCard className="h-3 w-3" />
                            </Button>
                            
                            {/* Create Dispatch */}
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleCreateDispatch(order)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              title="Create Dispatch"
                              disabled={order.status === 'completed' || order.status === 'cancelled'}
                            >
                              <Truck className="h-3 w-3" />
                            </Button>
                            
                            {/* View Details */}
                            <Button variant="ghost" size="sm" title="View Details">
                              <Eye className="h-3 w-3" />
                            </Button>
                            
                            {/* Edit Order */}
                            <Button variant="ghost" size="sm" onClick={() => handleEditOrder(order)} title="Edit Order">
                              <Edit className="h-3 w-3" />
                            </Button>
                            
                            {/* Delete Order */}
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteOrder(order._id)} title="Delete Order">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Pagination */}
          {pagination && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page === 1}
                      onClick={() => setCurrentPage(pagination.page - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page >= pagination.pages}
                      onClick={() => setCurrentPage(pagination.page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 4 }} gap="md">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(pagination?.total || 0)}
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {formatNumber(orders.filter((o: any) => o.status === 'pending').length)}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed Orders</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatNumber(orders.filter((o: any) => o.status === 'completed').length)}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(orders.reduce((sum: number, o: any) => sum + o.orderSummary.finalAmount, 0))}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </ResponsiveGrid>
        </div>

        {/* Modals */}
        <SalesOrderModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          mode="create"
          onSuccess={handleCreateOrder}
        />
        
        <SalesOrderModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setSelectedOrder(null)
          }}
          order={selectedOrder}
          mode="edit"
          onSuccess={handleUpdateOrder}
        />
      </ResponsiveGrid>
    </AppLayout>
  )
}
