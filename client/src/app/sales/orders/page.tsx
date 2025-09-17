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
  Truck,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  CheckCircle,
  AlertTriangle,
  Clock3,
  CheckSquare,
  XCircle,
  SortAsc,
  SortDesc
} from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import SalesOrderModal from '@/components/modals/SalesOrderModal'
import { DispatchCreateModal } from '@/components/dispatch/DispatchCreateModal'
import { useRouter } from 'next/navigation'

export default function SalesOrdersPage() {
  const user = useSelector(selectCurrentUser)
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDispatchModal, setShowDispatchModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [selectedOrderForDispatch, setSelectedOrderForDispatch] = useState<any>(null)
  
  // Enhanced filtering and sorting
  const [sortField, setSortField] = useState('createdAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [filters, setFilters] = useState({
    status: 'all',
    paymentStatus: 'all',
    dateRange: 'all',
    amountRange: 'all',
    customer: ''
  })
  const [searchField, setSearchField] = useState('all') // all, orderNumber, customerName, customerCode

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

  // Calculate stats
  const calculateStats = () => {
    const totalOrders = orders.length
    const totalAmount = orders.reduce((sum: number, order: any) => sum + (order.orderSummary?.finalAmount || 0), 0)
    const pendingOrders = orders.filter((order: any) => order.status === 'pending').length
    const confirmedOrders = orders.filter((order: any) => order.status === 'confirmed').length
    const dispatchedOrders = orders.filter((order: any) => order.status === 'dispatched').length
    const completedOrders = orders.filter((order: any) => order.status === 'completed').length
    const cancelledOrders = orders.filter((order: any) => order.status === 'cancelled').length
    
    const paidOrders = orders.filter((order: any) => order.payment?.paymentStatus === 'paid').length
    const pendingPayment = orders.filter((order: any) => order.payment?.paymentStatus === 'pending').length
    const overdueOrders = orders.filter((order: any) => order.payment?.paymentStatus === 'overdue').length
    
    const averageOrderValue = totalOrders > 0 ? totalAmount / totalOrders : 0
    
    return {
      totalOrders,
      totalAmount,
      pendingOrders,
      confirmedOrders,
      dispatchedOrders,
      completedOrders,
      cancelledOrders,
      paidOrders,
      pendingPayment,
      overdueOrders,
      averageOrderValue
    }
  }

  const stats = calculateStats()

  // Enhanced filtering and sorting functions
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      status: 'all',
      paymentStatus: 'all',
      dateRange: 'all',
      amountRange: 'all',
      customer: ''
    })
    setSearchTerm('')
    setSearchField('all')
  }

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

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
    // Set the selected order for dispatch and open modal
    setSelectedOrderForDispatch(order)
    setShowDispatchModal(true)
  }

  const handleRefresh = () => {
    refetchOrders()
    toast.success('Orders refreshed!')
  }

  const handleDispatchSuccess = (dispatch: any) => {
    setShowDispatchModal(false)
    setSelectedOrderForDispatch(null)
    refetchOrders() // Refresh orders to update status
    toast.success(`Dispatch ${dispatch.dispatchNumber} created and sales order updated successfully!`)
  }

  const handleDispatchClose = () => {
    setShowDispatchModal(false)
    setSelectedOrderForDispatch(null)
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
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Orders */}
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Orders</p>
                    <p className="text-2xl font-bold text-blue-900">{stats.totalOrders}</p>
                  </div>
                  <div className="p-3 bg-blue-200 rounded-full">
                    <ShoppingBag className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Amount */}
            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Total Amount</p>
                    <p className="text-2xl font-bold text-green-900">₹{formatNumber(stats.totalAmount)}</p>
                  </div>
                  <div className="p-3 bg-green-200 rounded-full">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Average Order Value */}
            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Avg Order Value</p>
                    <p className="text-2xl font-bold text-purple-900">₹{formatNumber(stats.averageOrderValue)}</p>
                  </div>
                  <div className="p-3 bg-purple-200 rounded-full">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pending Orders */}
            <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-600">Pending Orders</p>
                    <p className="text-2xl font-bold text-yellow-900">{stats.pendingOrders}</p>
                  </div>
                  <div className="p-3 bg-yellow-200 rounded-full">
                    <Clock3 className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* Order Status Breakdown */}
            <Card className="bg-white border-gray-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-1" />
                    <span className="text-sm font-medium text-gray-600">Completed</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{stats.completedOrders}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <CheckSquare className="h-5 w-5 text-blue-600 mr-1" />
                    <span className="text-sm font-medium text-gray-600">Confirmed</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{stats.confirmedOrders}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Truck className="h-5 w-5 text-indigo-600 mr-1" />
                    <span className="text-sm font-medium text-gray-600">Dispatched</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{stats.dispatchedOrders}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <XCircle className="h-5 w-5 text-red-600 mr-1" />
                    <span className="text-sm font-medium text-gray-600">Cancelled</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{stats.cancelledOrders}</p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Status */}
            <Card className="bg-white border-gray-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-1" />
                    <span className="text-sm font-medium text-gray-600">Paid</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{stats.paidOrders}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-1" />
                    <span className="text-sm font-medium text-gray-600">Overdue</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{stats.overdueOrders}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Filters and Search */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Search Section */}
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
                      value={searchField}
                      onChange={(e) => setSearchField(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="all">All Fields</option>
                      <option value="orderNumber">Order Number</option>
                      <option value="customerName">Customer Name</option>
                      <option value="customerCode">Customer Code</option>
                    </select>
                    <Button
                      onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Filter className="h-4 w-4" />
                      Advanced Filters
                    </Button>
                    <Button
                      onClick={clearFilters}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Clear
                    </Button>
                  </div>
                </div>

                {/* Advanced Filters */}
                {showAdvancedFilters && (
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Status Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Order Status</label>
                        <select
                          value={filters.status}
                          onChange={(e) => handleFilterChange('status', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="dispatched">Dispatched</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                      {/* Payment Status Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                        <select
                          value={filters.paymentStatus}
                          onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="all">All Payment</option>
                          <option value="paid">Paid</option>
                          <option value="pending">Pending</option>
                          <option value="overdue">Overdue</option>
                          <option value="partial">Partial</option>
                        </select>
                      </div>

                      {/* Date Range Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                        <select
                          value={filters.dateRange}
                          onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="all">All Time</option>
                          <option value="today">Today</option>
                          <option value="week">This Week</option>
                          <option value="month">This Month</option>
                          <option value="quarter">This Quarter</option>
                          <option value="year">This Year</option>
                        </select>
                      </div>

                      {/* Amount Range Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount Range</label>
                        <select
                          value={filters.amountRange}
                          onChange={(e) => handleFilterChange('amountRange', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="all">All Amounts</option>
                          <option value="0-1000">₹0 - ₹1,000</option>
                          <option value="1000-5000">₹1,000 - ₹5,000</option>
                          <option value="5000-10000">₹5,000 - ₹10,000</option>
                          <option value="10000-50000">₹10,000 - ₹50,000</option>
                          <option value="50000+">₹50,000+</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
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
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('orderNumber')}
                      >
                        <div className="flex items-center gap-2">
                        Order ID
                          {getSortIcon('orderNumber')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('customerName')}
                      >
                        <div className="flex items-center gap-2">
                        Customer
                          {getSortIcon('customerName')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center gap-2">
                        Status
                          {getSortIcon('status')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('paymentStatus')}
                      >
                        <div className="flex items-center gap-2">
                        Payment
                          {getSortIcon('paymentStatus')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('amount')}
                      >
                        <div className="flex items-center gap-2">
                        Amount
                          {getSortIcon('amount')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('createdAt')}
                      >
                        <div className="flex items-center gap-2">
                          Date
                          {getSortIcon('createdAt')}
                        </div>
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
                              <button
                                onClick={() => router.push(`/sales/orders/${order._id}`)}
                                className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                #{order.orderNumber}
                              </button>
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
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => router.push(`/sales/orders/${order._id}`)}
                              className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                              title="View Details"
                            >
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

          {/* Filter Summary */}
          {(searchTerm || filters.status !== 'all' || filters.paymentStatus !== 'all' || filters.dateRange !== 'all' || filters.amountRange !== 'all') && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-blue-800">Active Filters:</span>
                    <div className="flex flex-wrap gap-2">
                      {searchTerm && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Search: "{searchTerm}"
                          <button onClick={() => setSearchTerm('')} className="ml-1 hover:text-blue-600">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      )}
                      {filters.status !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Status: {filters.status}
                          <button onClick={() => handleFilterChange('status', 'all')} className="ml-1 hover:text-blue-600">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      )}
                      {filters.paymentStatus !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Payment: {filters.paymentStatus}
                          <button onClick={() => handleFilterChange('paymentStatus', 'all')} className="ml-1 hover:text-blue-600">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      )}
                      {filters.dateRange !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Date: {filters.dateRange}
                          <button onClick={() => handleFilterChange('dateRange', 'all')} className="ml-1 hover:text-blue-600">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      )}
                      {filters.amountRange !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Amount: {filters.amountRange}
                          <button onClick={() => handleFilterChange('amountRange', 'all')} className="ml-1 hover:text-blue-600">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      )}
                </div>
                  </div>
                  <Button onClick={clearFilters} variant="outline" size="sm" className="text-blue-600 border-blue-300 hover:bg-blue-100">
                    Clear All
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
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

        {/* Dispatch Create Modal */}
        <DispatchCreateModal
          isOpen={showDispatchModal}
          onClose={handleDispatchClose}
          onSuccess={handleDispatchSuccess}
          userCompanyId={user?.companyAccess?.[0]?.companyId}
          user={user}
          prefilledData={selectedOrderForDispatch ? {
            customerOrderId: selectedOrderForDispatch._id,
            companyId: selectedOrderForDispatch.companyId || user?.companyAccess?.[0]?.companyId,
            customerId: selectedOrderForDispatch.customerId,
            customerName: selectedOrderForDispatch.customerName,
            customerCode: selectedOrderForDispatch.customerCode,
            orderNumber: selectedOrderForDispatch.orderNumber,
            orderAmount: selectedOrderForDispatch.orderSummary?.finalAmount || 0,
            // Pre-fill additional fields that might be useful
            dispatchDate: new Date().toISOString().split('T')[0],
            status: 'pending',
            priority: 'normal',
            dispatchType: 'delivery'
          } : undefined}
        />
      </ResponsiveGrid>
    </AppLayout>
  )
}
