'use client'

import { useState } from 'react'
import { useSelector } from 'react-redux'
import { 
  ArrowUpDown, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Package,
  Calendar,
  User,
  MapPin,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { selectCurrentUser, selectIsSuperAdmin } from '@/lib/features/auth/authSlice'
import { useGetInventoryMovementsQuery, useGetInventoryStatsQuery } from '@/lib/api/inventoryApi'
import clsx from 'clsx'

export default function InventoryMovementsPage() {
  const user = useSelector(selectCurrentUser)
  const isSuperAdmin = useSelector(selectIsSuperAdmin)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Fetch inventory movements data from API
  const { data: movementsData, isLoading, error } = useGetInventoryMovementsQuery({
    page,
    limit: 20,
    search: searchTerm,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined
  })

  // Fetch inventory statistics
  const { data: inventoryStats } = useGetInventoryStatsQuery({})

  const movements = movementsData?.data || []
  const pagination = movementsData?.pagination

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'inbound':
        return <ArrowDown className="h-4 w-4 text-green-500" />
      case 'outbound':
        return <ArrowUp className="h-4 w-4 text-red-500" />
      case 'transfer':
        return <RefreshCw className="h-4 w-4 text-blue-500" />
      case 'adjustment':
        return <ArrowUpDown className="h-4 w-4 text-purple-500" />
      default:
        return <Package className="h-4 w-4 text-gray-500" />
    }
  }

  const getMovementBadge = (type: string) => {
    const baseClasses = "px-3 py-1 text-xs font-medium rounded-full flex items-center space-x-1"
    switch (type) {
      case 'inbound':
        return `${baseClasses} bg-green-100 text-green-600`
      case 'outbound':
        return `${baseClasses} bg-red-100 text-red-600`
      case 'transfer':
        return `${baseClasses} bg-blue-100 text-blue-600`
      case 'adjustment':
        return `${baseClasses} bg-purple-100 text-purple-600`
      default:
        return `${baseClasses} bg-gray-100 text-gray-600`
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full"
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-green-100 text-green-600`
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-600`
      case 'cancelled':
        return `${baseClasses} bg-red-100 text-red-600`
      default:
        return `${baseClasses} bg-gray-100 text-gray-600`
    }
  }

  const getQuantityColor = (type: string, quantity: number) => {
    if (type === 'adjustment') {
      return quantity > 0 ? 'text-green-600' : 'text-red-600'
    }
    switch (type) {
      case 'inbound':
        return 'text-green-600'
      case 'outbound':
        return 'text-red-600'
      case 'transfer':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <AppLayout>
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gradient-to-br from-sky-50 via-white to-blue-50 min-h-screen">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-sky-200 shadow-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <ArrowUpDown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                  Inventory Movements
                </h1>
                <p className="text-gray-600 mt-1">
                  Track all stock movements and transfers ({movements.length} movements)
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl hover:from-sky-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Movement
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-xl border border-sky-200 shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Movements</p>
                <p className="text-3xl font-bold text-gray-900">{inventoryStats?.data?.totalMovements || 0}</p>
                <p className="text-sm text-green-600 mt-1">+{inventoryStats?.data?.todayMovements || 0} today</p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-br from-sky-100 to-blue-100 rounded-xl flex items-center justify-center">
                <ArrowUpDown className="h-6 w-6 text-sky-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-sky-200 shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inbound</p>
                <p className="text-3xl font-bold text-green-600">{inventoryStats?.data?.inboundMovements || 0}</p>
                <p className="text-sm text-gray-500 mt-1">Stock received</p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                <ArrowDown className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-sky-200 shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Outbound</p>
                <p className="text-3xl font-bold text-red-600">{inventoryStats?.data?.outboundMovements || 0}</p>
                <p className="text-sm text-gray-500 mt-1">Stock issued</p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl flex items-center justify-center">
                <ArrowUp className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-sky-200 shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{inventoryStats?.data?.pendingMovements || 0}</p>
                <p className="text-sm text-yellow-600 mt-1">Need approval</p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-sky-200 shadow-lg p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search movements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-gray-50 text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-gray-50 text-gray-900"
              >
                <option value="all">All Types</option>
                <option value="inbound">Inbound</option>
                <option value="outbound">Outbound</option>
                <option value="transfer">Transfer</option>
                <option value="adjustment">Adjustment</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-gray-50 text-gray-900"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Movements List */}
        {isLoading ? (
          <div className="bg-white rounded-xl border border-sky-200 shadow-lg p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="h-4 bg-sky-200 rounded w-1/8"></div>
                  <div className="h-4 bg-sky-200 rounded w-1/6"></div>
                  <div className="h-4 bg-sky-200 rounded w-1/6"></div>
                  <div className="h-4 bg-sky-200 rounded w-1/4"></div>
                  <div className="h-4 bg-sky-200 rounded w-1/6"></div>
                  <div className="h-4 bg-sky-200 rounded w-1/8"></div>
                  <div className="h-4 bg-sky-200 rounded w-1/6"></div>
                  <div className="h-4 bg-sky-200 rounded w-1/8"></div>
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl border border-red-500 shadow-lg p-6 text-center">
            <ArrowUpDown className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-black mb-2">Error Loading Movements</h3>
            <p className="text-red-600">Failed to load inventory movements. Please try again.</p>
          </div>
        ) : movements.length === 0 ? (
          <div className="bg-white rounded-xl border border-sky-200 shadow-lg p-6 text-center">
            <ArrowUpDown className="h-12 w-12 text-sky-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-black mb-2">No Movements Found</h3>
            <p className="text-gray-600">
              {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                ? 'No movements match your search criteria.'
                : 'No inventory movements have been recorded yet.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-sky-200 shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Movement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    From/To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performed By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {movements.map((movement: any) => (
                  <tr key={movement._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <span className={getMovementBadge(movement.movementType)}>
                          {getMovementIcon(movement.movementType)}
                          <span className="capitalize">{movement.movementType}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{movement.itemName}</div>
                        <div className="text-sm text-gray-500">{movement.itemCode}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={clsx("text-sm font-bold", getQuantityColor(movement.movementType, movement.quantity))}>
                        {movement.movementType === 'outbound' ? '-' : movement.quantity > 0 ? '+' : ''}{Math.abs(movement.quantity)} {movement.unit}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center space-x-1 mb-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">From:</span>
                          <span className="text-xs">{movement.fromLocation}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">To:</span>
                          <span className="text-xs">{movement.toLocation}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{movement.performedBy}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(movement.status)}>
                        {movement.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(movement.timestamp)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-sky-600 hover:text-sky-900 p-1 rounded hover:bg-sky-50">
                        <Eye className="h-4 w-4" />
                      </button>
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
          <div className="bg-white rounded-xl border border-sky-200 shadow-lg p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              <div className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} movements
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  className="px-4 py-2 text-sm bg-white border border-sky-300 rounded-lg hover:bg-sky-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600 px-4">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= pagination.pages}
                  className="px-4 py-2 text-sm bg-white border border-sky-300 rounded-lg hover:bg-sky-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
