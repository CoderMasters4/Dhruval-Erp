'use client'

import { useState } from 'react'
import { useSelector } from 'react-redux'
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit,
  Trash2,
  Calendar,
  User,
  DollarSign,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp
} from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { selectCurrentUser, selectIsSuperAdmin } from '@/lib/features/auth/authSlice'
import {
  useGetOrdersQuery,
  useGetOrderStatsQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useDeleteOrderMutation
} from '@/lib/api/ordersApi'
import { DataTable } from '@/components/ui/DataTable'
import { StatsCards } from '@/components/ui/StatsCards'
import { DetailViewModal } from '@/components/modals/DetailViewModal'
import { CreateEditModal } from '@/components/modals/CreateEditModal'
import { LoadingSpinner, ErrorState } from '@/components/ui/LoadingSpinner'
import clsx from 'clsx'

export default function SalesOrdersPage() {
  const user = useSelector(selectCurrentUser)
  const isSuperAdmin = useSelector(selectIsSuperAdmin)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [orderToEdit, setOrderToEdit] = useState<any>(null)

  // Fetch orders data from API
  const { data: ordersData, isLoading, error } = useGetOrdersQuery({
    page,
    limit: 20,
    search: searchTerm,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    priority: priorityFilter !== 'all' ? priorityFilter : undefined
  })

  // Fetch order statistics
  const { data: orderStats } = useGetOrderStatsQuery({})

  // Mutations
  const [createOrder] = useCreateOrderMutation()
  const [updateOrder] = useUpdateOrderMutation()
  const [deleteOrder] = useDeleteOrderMutation()

  const orders = ordersData?.data || []
  const pagination = ordersData?.pagination

  // Form fields for create/edit
  const orderFields = [
    { name: 'orderNumber', label: 'Order Number', type: 'text' as const, required: true },
    { name: 'customerName', label: 'Customer Name', type: 'text' as const, required: true },
    { name: 'customerEmail', label: 'Customer Email', type: 'email' as const, required: true },
    { name: 'customerPhone', label: 'Customer Phone', type: 'tel' as const, required: true },
    { name: 'customerAddress', label: 'Customer Address', type: 'textarea' as const, required: true },
    {
      name: 'priority',
      label: 'Priority',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
        { value: 'urgent', label: 'Urgent' }
      ]
    },
    { name: 'orderDate', label: 'Order Date', type: 'date' as const, required: true },
    { name: 'deliveryDate', label: 'Expected Delivery', type: 'date' as const, required: true },
    { name: 'totalAmount', label: 'Total Amount', type: 'number' as const, required: true },
    { name: 'notes', label: 'Notes', type: 'textarea' as const }
  ]

  // CRUD Handlers
  const handleView = (order: any) => {
    setSelectedOrder(order)
    setShowDetailModal(true)
  }

  const handleEdit = (order: any) => {
    setOrderToEdit(order)
    setShowEditModal(true)
  }

  const handleDelete = async (order: any) => {
    if (window.confirm(`Are you sure you want to delete order ${order.orderNumber}?`)) {
      try {
        await deleteOrder(order._id).unwrap()
      } catch (error) {
        console.error('Failed to delete order:', error)
      }
    }
  }

  const handleCreate = async (data: any) => {
    try {
      await createOrder({
        ...data,
        companyId: user?.companyId,
      }).unwrap()
    } catch (error) {
      console.error('Failed to create order:', error)
      throw error
    }
  }

  const handleUpdate = async (data: any) => {
    try {
      await updateOrder({
        orderId: orderToEdit._id,
        orderData: data,
      }).unwrap()
    } catch (error) {
      console.error('Failed to update order:', error)
      throw error
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Stats cards data
  const statsCards = [
    {
      title: 'Total Orders',
      value: orderStats?.data?.totalOrders || 0,
      change: {
        value: orderStats?.data?.ordersGrowth || 0,
        type: (orderStats?.data?.ordersGrowth || 0) >= 0 ? 'increase' as const : 'decrease' as const,
        label: 'vs last month'
      },
      icon: <ShoppingCart className="h-6 w-6" />,
      color: 'blue' as const
    },
    {
      title: 'Pending Orders',
      value: orderStats?.data?.pendingOrders || 0,
      change: {
        value: orderStats?.data?.pendingChange || 0,
        type: (orderStats?.data?.pendingChange || 0) <= 0 ? 'increase' as const : 'decrease' as const,
        label: 'need attention'
      },
      icon: <Clock className="h-6 w-6" />,
      color: 'yellow' as const
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(orderStats?.data?.totalRevenue || 0),
      change: {
        value: orderStats?.data?.revenueGrowth || 0,
        type: (orderStats?.data?.revenueGrowth || 0) >= 0 ? 'increase' as const : 'decrease' as const,
        label: 'revenue growth'
      },
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'green' as const
    },
    {
      title: 'Completed',
      value: orderStats?.data?.completedOrders || 0,
      change: {
        value: orderStats?.data?.completionRate || 0,
        type: 'increase' as const,
        label: 'completion rate'
      },
      icon: <CheckCircle className="h-6 w-6" />,
      color: 'purple' as const
    }
  ]

  // Table columns
  const columns = [
    {
      key: 'orderNumber',
      label: 'Order #',
      sortable: true,
      render: (value: string, row: any) => (
        <div className="font-medium text-gray-900">{value}</div>
      )
    },
    {
      key: 'customerName',
      label: 'Customer',
      sortable: true,
      render: (value: string, row: any) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.customerEmail}</div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => (
        <span className={clsx(
          'px-2 py-1 text-xs font-medium rounded-full',
          value === 'completed' && 'bg-green-100 text-green-600',
          value === 'pending' && 'bg-yellow-100 text-yellow-600',
          value === 'processing' && 'bg-blue-100 text-blue-600',
          value === 'cancelled' && 'bg-red-100 text-red-600'
        )}>
          {value.toUpperCase()}
        </span>
      )
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      render: (value: string) => (
        <span className={clsx(
          'px-2 py-1 text-xs font-medium rounded-full',
          value === 'urgent' && 'bg-red-100 text-red-600',
          value === 'high' && 'bg-orange-100 text-orange-600',
          value === 'medium' && 'bg-yellow-100 text-yellow-600',
          value === 'low' && 'bg-green-100 text-green-600'
        )}>
          {value.toUpperCase()}
        </span>
      )
    },
    {
      key: 'totalAmount',
      label: 'Amount',
      sortable: true,
      render: (value: number) => formatCurrency(value)
    },
    {
      key: 'orderDate',
      label: 'Order Date',
      sortable: true,
      render: (value: string) => formatDate(value)
    },
    {
      key: 'deliveryDate',
      label: 'Delivery Date',
      sortable: true,
      render: (value: string) => formatDate(value)
    }
  ]

  // Detail view sections
  const getDetailSections = (order: any) => [
    {
      title: 'Order Information',
      fields: [
        { label: 'Order Number', value: order?.orderNumber, type: 'text' as const },
        { label: 'Status', value: order?.status, type: 'badge' as const },
        { label: 'Priority', value: order?.priority, type: 'badge' as const },
        { label: 'Order Date', value: order?.orderDate, type: 'date' as const },
        { label: 'Expected Delivery', value: order?.deliveryDate, type: 'date' as const },
        { label: 'Actual Delivery', value: order?.actualDeliveryDate, type: 'date' as const }
      ]
    },
    {
      title: 'Customer Information',
      fields: [
        { label: 'Customer Name', value: order?.customerName, type: 'text' as const },
        { label: 'Email', value: order?.customerEmail, type: 'text' as const },
        { label: 'Phone', value: order?.customerPhone, type: 'text' as const },
        { label: 'Address', value: order?.customerAddress, type: 'text' as const }
      ]
    },
    {
      title: 'Financial Information',
      fields: [
        { label: 'Subtotal', value: order?.subtotal, type: 'currency' as const },
        { label: 'Tax Amount', value: order?.taxAmount, type: 'currency' as const },
        { label: 'Discount', value: order?.discount, type: 'currency' as const },
        { label: 'Total Amount', value: order?.totalAmount, type: 'currency' as const },
        { label: 'Payment Status', value: order?.paymentStatus, type: 'badge' as const }
      ]
    },
    {
      title: 'Order Items',
      fields: [
        {
          label: 'Items',
          value: order?.items,
          type: 'list' as const,
          render: (items: any[]) => (
            <div className="space-y-2">
              {items?.map((item, index) => (
                <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                  <span>{item.itemName} x {item.quantity}</span>
                  <span>{formatCurrency(item.unitPrice * item.quantity)}</span>
                </div>
              )) || 'No items'}
            </div>
          )
        }
      ]
    }
  ]

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 text-xs font-medium rounded-full flex items-center space-x-1"
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-600`
      case 'confirmed':
        return `${baseClasses} bg-blue-100 text-blue-600`
      case 'processing':
        return `${baseClasses} bg-purple-100 text-purple-600`
      case 'shipped':
        return `${baseClasses} bg-green-100 text-green-600`
      case 'delivered':
        return `${baseClasses} bg-emerald-100 text-emerald-600`
      case 'cancelled':
        return `${baseClasses} bg-red-100 text-red-600`
      default:
        return `${baseClasses} bg-gray-100 text-gray-600`
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-3 w-3" />
      case 'confirmed':
        return <CheckCircle className="h-3 w-3" />
      case 'processing':
        return <Package className="h-3 w-3" />
      case 'shipped':
        return <TrendingUp className="h-3 w-3" />
      case 'delivered':
        return <CheckCircle className="h-3 w-3" />
      case 'cancelled':
        return <XCircle className="h-3 w-3" />
      default:
        return <AlertTriangle className="h-3 w-3" />
    }
  }

  const getPriorityBadge = (priority: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full"
    switch (priority) {
      case 'high':
        return `${baseClasses} bg-red-100 text-red-600`
      case 'medium':
        return `${baseClasses} bg-yellow-100 text-yellow-600`
      case 'low':
        return `${baseClasses} bg-green-100 text-green-600`
      default:
        return `${baseClasses} bg-gray-100 text-gray-600`
    }
  }

  const getDaysUntilDelivery = (deliveryDate: string) => {
    const today = new Date()
    const delivery = new Date(deliveryDate)
    const diffTime = delivery.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gradient-to-br from-sky-50 via-white to-blue-50 min-h-screen">
          <LoadingSpinner size="lg" text="Loading sales orders..." />
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gradient-to-br from-emerald-50 via-white to-green-50 min-h-screen">
          <ErrorState
            title="Error Loading Orders"
            message="Failed to load sales orders. Please try again."
            icon={<ShoppingCart className="h-12 w-12 text-red-500" />}
          />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gradient-to-br from-emerald-50 via-white to-green-50 min-h-screen">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-sky-200 shadow-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                  Sales Orders
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage and track all sales orders ({orders.length} orders)
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl hover:from-sky-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Order
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards cards={statsCards} />

        {/* Data Table */}
        <DataTable
          data={orders}
          columns={columns}
          loading={isLoading}
          error={error ? 'Failed to load sales orders' : undefined}
          searchable={true}
          filterable={false}
          pagination={pagination}
          onPageChange={setPage}
          onSearch={setSearchTerm}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          actions={true}
        />

        {/* Modals */}
        <DetailViewModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title={`Order ${selectedOrder?.orderNumber || ''} Details`}
          sections={getDetailSections(selectedOrder)}
          actions={{
            onEdit: () => {
              setShowDetailModal(false)
              handleEdit(selectedOrder)
            },
            onDelete: () => {
              setShowDetailModal(false)
              handleDelete(selectedOrder)
            }
          }}
        />

        <CreateEditModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreate}
          title="Create New Order"
          fields={orderFields}
          submitText="Create Order"
        />

        <CreateEditModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setOrderToEdit(null)
          }}
          onSubmit={handleUpdate}
          title="Edit Order"
          fields={orderFields}
          initialData={orderToEdit}
          submitText="Update Order"
        />
      </div>
    </AppLayout>
  )
}
