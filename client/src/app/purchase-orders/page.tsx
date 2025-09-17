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
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Truck
} from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { PurchaseHeader } from '@/components/ui/PageHeader'
import { selectCurrentUser, selectIsSuperAdmin } from '@/lib/features/auth/authSlice'
import { useGetPurchaseOrdersQuery, useGetPurchaseOrderStatsQuery } from '@/lib/api/purchaseOrdersApi'
import clsx from 'clsx'

export default function PurchaseOrdersPage() {
  const user = useSelector(selectCurrentUser)
  const isSuperAdmin = useSelector(selectIsSuperAdmin)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [supplierFilter, setSupplierFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Fetch purchase orders data
  const { data: ordersData, isLoading, error } = useGetPurchaseOrdersQuery({
    page,
    limit: 10,
    search: searchTerm,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    supplierId: supplierFilter !== 'all' ? supplierFilter : undefined
  })

  // Fetch purchase order statistics
  const { data: orderStats } = useGetPurchaseOrderStatsQuery({})

  // Ensure orders is always an array
  const orders = Array.isArray(ordersData?.data) ? ordersData.data : []
  const pagination = ordersData?.pagination

  // Debug logging in development
  if (process.env.NODE_ENV === 'development' && ordersData) {
    console.log('Purchase Orders API Response:', {
      ordersData,
      dataType: typeof ordersData?.data,
      isArray: Array.isArray(ordersData?.data),
      ordersLength: orders.length
    })
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

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full"
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-600`
      case 'approved':
        return `${baseClasses} bg-blue-100 text-blue-600`
      case 'ordered':
        return `${baseClasses} bg-purple-100 text-purple-600`
      case 'received':
        return `${baseClasses} bg-green-100 text-green-600`
      case 'cancelled':
        return `${baseClasses} bg-red-100 text-red-600`
      case 'partial':
        return `${baseClasses} bg-orange-100 text-orange-600`
      default:
        return `${baseClasses} bg-gray-100 text-gray-600`
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'approved':
        return <CheckCircle className="h-4 w-4" />
      case 'ordered':
        return <ShoppingCart className="h-4 w-4" />
      case 'received':
        return <Package className="h-4 w-4" />
      case 'cancelled':
        return <XCircle className="h-4 w-4" />
      case 'partial':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <AppLayout>
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
        {/* New Header */}
        <PurchaseHeader
          title="Purchase Orders"
          description={`Manage purchase orders and supplier transactions (${orders.length} orders)`}
          icon={<ShoppingCart className="h-6 w-6 text-white" />}
          showRefresh={true}
          onRefresh={() => window.location.reload()}
        >
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-white text-emerald-600 rounded-lg hover:bg-emerald-50 border border-white transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Purchase Order
          </button>
        </PurchaseHeader>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border-2 border-sky-500 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">Total Orders</p>
                <p className="text-2xl font-bold text-black">{orderStats?.data?.totalOrders || 0}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-sky-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl border-2 border-sky-500 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">Pending Orders</p>
                <p className="text-2xl font-bold text-yellow-600">{orderStats?.data?.pendingOrders || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl border-2 border-sky-500 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">Total Value</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(orderStats?.data?.totalValue || 0)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl border-2 border-sky-500 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">This Month</p>
                <p className="text-2xl font-bold text-blue-600">{orderStats?.data?.thisMonthOrders || 0}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border-2 border-sky-500 p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sky-500" />
                <input
                  type="text"
                  placeholder="Search purchase orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-sky-200 rounded-lg focus:outline-none focus:border-sky-500 bg-white text-black"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border-2 border-sky-200 rounded-lg focus:outline-none focus:border-sky-500 bg-white text-black"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="ordered">Ordered</option>
                <option value="received">Received</option>
                <option value="partial">Partial</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Supplier Filter */}
            <div>
              <select
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                className="w-full px-3 py-2 border-2 border-sky-200 rounded-lg focus:outline-none focus:border-sky-500 bg-white text-black"
              >
                <option value="all">All Suppliers</option>
                {/* Supplier options will be populated from API */}
              </select>
            </div>
          </div>
        </div>

        {/* Purchase Orders Table */}
        {isLoading ? (
          <div className="bg-white rounded-xl border-2 border-sky-500 p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="h-4 bg-sky-200 rounded w-1/4"></div>
                  <div className="h-4 bg-sky-200 rounded w-1/4"></div>
                  <div className="h-4 bg-sky-200 rounded w-1/4"></div>
                  <div className="h-4 bg-sky-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl border-2 border-red-500 p-6 text-center">
            <ShoppingCart className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-black mb-2">Error Loading Purchase Orders</h3>
            <p className="text-red-600">Failed to load purchase orders. Please try again.</p>
          </div>
        ) : !Array.isArray(orders) ? (
          <div className="bg-white rounded-xl border-2 border-red-500 p-6 text-center">
            <ShoppingCart className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-black mb-2">Invalid Data Format</h3>
            <p className="text-red-600">
              The API returned invalid data format. Expected an array of orders.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Data type: {typeof ordersData?.data}, Is Array: {Array.isArray(ordersData?.data) ? 'Yes' : 'No'}
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-sky-500 p-6 text-center">
            <ShoppingCart className="h-12 w-12 text-sky-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-black mb-2">No Purchase Orders Found</h3>
            <p className="text-black opacity-75">
              {searchTerm || statusFilter !== 'all' || supplierFilter !== 'all'
                ? 'No purchase orders match your search criteria.'
                : 'No purchase orders have been created yet.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border-2 border-sky-500 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-sky-200">
                <thead className="bg-sky-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Order Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Supplier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Expected Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-sky-200">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-sky-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-black">
                            {order.orderNumber}
                          </div>
                          <div className="text-sm text-sky-600">
                            {order.items?.length || 0} items
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-black">
                          {order.supplier?.supplierName || 'N/A'}
                        </div>
                        <div className="text-sm text-sky-600">
                          {order.supplier?.supplierCode || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(order.status)}
                          <span className={getStatusBadge(order.status)}>
                            {order.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-black">
                          {formatCurrency(order.totalAmount || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-black">
                          {order.expectedDeliveryDate ? formatDate(order.expectedDeliveryDate) : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-sky-500 hover:text-black p-1 rounded hover:bg-sky-50">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-sky-500 hover:text-black p-1 rounded hover:bg-sky-50">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="bg-white rounded-xl border-2 border-sky-500 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-black">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} orders
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  className="px-3 py-1 text-sm bg-white border border-sky-300 rounded hover:bg-sky-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-black">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= pagination.pages}
                  className="px-3 py-1 text-sm bg-white border border-sky-300 rounded hover:bg-sky-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
