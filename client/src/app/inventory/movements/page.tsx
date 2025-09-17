'use client'

import { useState, useEffect } from 'react'
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
  TrendingDown,
  Edit,
  Trash2,
  Loader2
} from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { selectCurrentUser, selectIsSuperAdmin } from '@/lib/features/auth/authSlice'
import { 
  useGetInventoryMovementsQuery, 
  useGetInventoryStatsQuery,
  useCreateStockMovementMutation,
  useUpdateStockMovementMutation,
  useDeleteStockMovementMutation
} from '@/lib/api/inventoryApi'
import clsx from 'clsx'
import { toast } from 'sonner'
import { StockMovementForm } from '@/components/inventory/StockMovementForm'
import { StockMovementDetails } from '@/components/inventory/StockMovementDetails'

// Define TypeScript interface for movement data
interface StockMovement {
  _id: string
  movementNumber: string
  movementType: 'inward' | 'outward' | 'transfer' | 'adjustment' | 'adjustment_note'
  itemId?: string | { 
    _id: string
    itemName: string
    itemCode: string
    category?: { primary?: string; secondary?: string; tertiary?: string }
    stock?: { unit: string }
    pricing?: { costPrice: number; sellingPrice: number }
  }
  itemName?: string
  companyItemCode?: string
  itemCode?: string
  quantity: number
  stock?: { unit: string }
  unit?: string
  fromLocation?: string | { warehouseName: string; isExternal?: boolean }
  toLocation?: string | { warehouseName: string; isExternal?: boolean }
  performedBy?: string
  createdBy?: string | { personalInfo: { firstName?: string; lastName?: string }; username?: string; _id: string }
  status?: 'completed' | 'pending' | 'cancelled'
  timestamp?: string
  movementDate?: string
  createdAt: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export default function InventoryMovementsPage() {
  const user = useSelector(selectCurrentUser)
  const isSuperAdmin = useSelector(selectIsSuperAdmin)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedMovement, setSelectedMovement] = useState<StockMovement | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Reset pagination when filters change
  const resetPagination = () => {
    setPage(1)
  }

  // Handle search change with pagination reset
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    resetPagination()
  }

  // Handle filter changes with pagination reset
  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value)
    resetPagination()
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    resetPagination()
  }

  // Fetch inventory movements data from API
  const { data: movementsData, isLoading, error } = useGetInventoryMovementsQuery({
    page,
    limit: pageSize,
    search: searchTerm,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined
  })

  // Fetch inventory statistics
  const { data: inventoryStats } = useGetInventoryStatsQuery({})

  // Stock Movement CRUD mutations
  const [createStockMovement, { isLoading: createLoading }] = useCreateStockMovementMutation()
  const [updateStockMovement, { isLoading: updateLoading }] = useUpdateStockMovementMutation()
  const [deleteStockMovement, { isLoading: deleteLoading }] = useDeleteStockMovementMutation()

  const movements = ((movementsData?.data as any)?.spares || []) as any[]
  const rawPagination = movementsData?.data as any
  
  // Convert pagination structure to match expected format
  const pagination: Pagination | undefined = rawPagination ? {
    page: rawPagination.page,
    limit: rawPagination.limit,
    total: rawPagination.total,
    pages: rawPagination.totalPages
  } : undefined
  
  // Debug logging
  console.log('Movements Data:', movementsData)
  console.log('Processed Movements:', movements)
  console.log('Raw Pagination:', rawPagination)
  console.log('Current Page:', page)
  console.log('Processed Pagination:', pagination)

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
      case 'inward':
        return <ArrowDown className="h-4 w-4 text-green-500" />
      case 'outward':
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
      case 'inward':
        return `${baseClasses} bg-green-100 text-green-600`
      case 'outward':
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
    if (type === 'adjustment' || type === 'adjustment_note') {
      return quantity > 0 ? 'text-green-600' : 'text-red-600'
    }
    switch (type) {
      case 'inward':
        return 'text-green-600'
      case 'outward':
        return 'text-red-600'
      case 'transfer':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  // CRUD Handlers
  const handleCreateMovement = async (formData: any) => {
    try {
      await createStockMovement(formData).unwrap()
      toast.success('Stock movement created successfully!')
      setShowCreateModal(false)
      // Refresh the data
      window.location.reload()
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to create stock movement')
      console.error('Create movement error:', error)
    }
  }

  const handleEditMovement = async (formData: any) => {
    try {
      if (!selectedMovement) throw new Error('No movement selected')
      await updateStockMovement({ id: selectedMovement._id, data: formData }).unwrap()
      toast.success('Stock movement updated successfully!')
      setShowEditModal(false)
      setSelectedMovement(null)
      // Refresh the data
      window.location.reload()
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update stock movement')
      console.error('Update movement error:', error)
    }
  }

  const handleDeleteMovement = async () => {
    if (!selectedMovement) return
    
    try {
      await deleteStockMovement(selectedMovement._id).unwrap()
      toast.success('Stock movement deleted successfully!')
      setShowDeleteConfirm(false)
      setSelectedMovement(null)
      // Refresh the data
      window.location.reload()
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to delete stock movement')
      console.error('Delete movement error:', error)
    }
  }

  const openCreateModal = () => {
    setShowCreateModal(true)
  }

  const openEditModal = (movement: StockMovement) => {
    setSelectedMovement(movement)
    setShowEditModal(true)
  }

  const openDetailsModal = (movement: StockMovement) => {
    setSelectedMovement(movement)
    setShowDetailsModal(true)
  }

  const openDeleteConfirm = (movement: StockMovement) => {
    setSelectedMovement(movement)
    setShowDeleteConfirm(true)
  }

  const closeModals = () => {
    setShowCreateModal(false)
    setShowEditModal(false)
    setShowDetailsModal(false)
    setShowDeleteConfirm(false)
    setSelectedMovement(null)
  }

  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <AppLayout>
      {!isClient ? (
        // Show loading state during SSR to prevent hydration mismatch
        <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gradient-to-br from-sky-50 via-white to-blue-50 min-h-screen">
          <div className="bg-white rounded-2xl border border-sky-200 shadow-lg p-4 sm:p-6">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <ArrowUpDown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                  Inventory Movements
                </h1>
                <p className="text-gray-600 mt-1">Loading...</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-sky-200 shadow-lg p-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-sky-500 mx-auto mb-4" />
              <p className="text-gray-600">Loading movements...</p>
            </div>
          </div>
        </div>
      ) : (
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
              <Button 
                onClick={openCreateModal}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl hover:from-sky-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <Plus className="h-5 w-5 mr-2" />
                New Movement
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white rounded-xl border border-sky-200 shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Movements</p>
                  <p className="text-3xl font-bold text-gray-900">{movements.length || 0}</p>
                  <p className="text-sm text-green-600 mt-1">+{movements.filter((m) => {
                    const today = new Date().toDateString()
                    const movementDate = new Date(m.movementDate || m.timestamp || m.createdAt).toDateString()
                    return today === movementDate
                  }).length || 0} today</p>
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
                  <p className="text-3xl font-bold text-green-600">{movements.filter((m) => m.movementType === 'inward').length || 0}</p>
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
                  <p className="text-3xl font-bold text-red-600">{movements.filter((m) => m.movementType === 'outward').length || 0}</p>
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
                  <p className="text-3xl font-bold text-yellow-600">{movements.filter((m) => m.status === 'pending').length || 0}</p>
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
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-gray-50 text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <select
                  value={typeFilter}
                  onChange={(e) => handleTypeFilterChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-gray-50 text-gray-900"
                >
                  <option value="all">All Types</option>
                  <option value="inward">Inward</option>
                  <option value="outward">Outward</option>
                  <option value="transfer">Transfer</option>
                  <option value="adjustment_note">Adjustment</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => handleStatusFilterChange(e.target.value)}
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

          {/* Movements Table */}
          {isLoading ? (
            <div className="bg-white rounded-xl border border-sky-200 shadow-lg p-8">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-sky-500 mx-auto mb-4" />
                <p className="text-gray-600">Loading movements...</p>
              </div>
            </div>
          ) : movements.length === 0 ? (
            <div className="bg-white rounded-xl border border-sky-200 shadow-lg p-8">
              <div className="text-center">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No stock movements found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || typeFilter !== 'all' || statusFilter !== 'all' 
                    ? 'Try adjusting your filters or search terms.'
                    : 'Get started by creating your first stock movement.'
                  }
                </p>
                {!searchTerm && typeFilter === 'all' && statusFilter === 'all' && (
                  <Button onClick={openCreateModal} className="bg-sky-600 hover:bg-sky-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Movement
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-sky-200 shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
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
                    {movements.map((movement) => (
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
                            <div className="text-sm font-medium text-gray-900">
                              {movement.itemId?.itemName || movement.itemName || 'Unknown Item'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {movement.itemId?.itemCode || movement.companyItemCode || movement.itemCode || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-400 capitalize">
                              {movement.itemId?.category?.primary || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={clsx("text-sm font-bold", getQuantityColor(movement.movementType, movement.quantity))}>
                            {movement.movementType === 'outward' ? '-' : movement.quantity > 0 ? '+' : ''}{Math.abs(movement.quantity)} {movement.itemId?.stock?.unit || movement.stock?.unit || movement.unit || 'PCS'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center space-x-1 mb-1">
                              <MapPin className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">From:</span>
                              <span className="text-xs">
                                {typeof movement.fromLocation === 'string' 
                                  ? movement.fromLocation 
                                  : movement.fromLocation?.warehouseName || 'N/A'
                                }
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">To:</span>
                              <span className="text-xs">
                                {typeof movement.toLocation === 'string' 
                                  ? movement.toLocation 
                                  : movement.toLocation?.warehouseName || 'N/A'
                                }
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {movement.performedBy || 
                               (typeof movement.createdBy === 'object' && movement.createdBy?.personalInfo 
                                 ? `${movement.createdBy.personalInfo.firstName || ''} ${movement.createdBy.personalInfo.lastName || ''}`.trim() || movement.createdBy.username
                                 : movement.createdBy) || 'System'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={getStatusBadge(movement.status || 'completed')}>
                            {movement.status || 'completed'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(movement.timestamp || movement.movementDate || movement.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => openDetailsModal(movement)}
                              className="text-sky-600 hover:text-sky-900 p-1 rounded hover:bg-sky-50 transition-colors"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => openEditModal(movement)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                              title="Edit Movement"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => openDeleteConfirm(movement)}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                              title="Delete Movement"
                            >
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
            <div className="bg-white rounded-xl border border-sky-200 shadow-lg p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="text-sm text-gray-600">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} movements
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Show:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        const newSize = Number(e.target.value)
                        setPageSize(newSize)
                        setPage(1) // Reset to first page when changing page size
                      }}
                      className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span className="text-sm text-gray-600">per page</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage(1)}
                    disabled={page <= 1}
                    className="px-3 py-2 text-sm bg-white border border-sky-300 rounded-lg hover:bg-sky-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="First Page"
                  >
                    «
                  </button>
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
                  <button
                    onClick={() => setPage(pagination.pages)}
                    disabled={page >= pagination.pages}
                    className="px-3 py-2 text-sm bg-white border border-sky-300 rounded-lg hover:bg-sky-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Last Page"
                  >
                    »
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modals */}
          {/* Create Movement Modal */}
          {showCreateModal && (
            <StockMovementForm
              onClose={closeModals}
              onSubmit={handleCreateMovement}
              isLoading={createLoading}
            />
          )}

          {/* Edit Movement Modal */}
          {showEditModal && selectedMovement && (
            <StockMovementForm
              movement={selectedMovement}
              onClose={closeModals}
              onSubmit={handleEditMovement}
              isLoading={updateLoading}
            />
          )}

          {/* Movement Details Modal */}
          {showDetailsModal && selectedMovement && (
            <StockMovementDetails
              movement={selectedMovement}
              onClose={closeModals}
              onEdit={() => {
                setShowDetailsModal(false)
                setShowEditModal(true)
              }}
              onDelete={() => {
                setShowDetailsModal(false)
                openDeleteConfirm(selectedMovement)
              }}
              canEdit={true}
              canDelete={true}
            />
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && selectedMovement && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Stock Movement</h3>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to delete movement #{selectedMovement.movementNumber}? 
                    This action cannot be undone.
                  </p>
                  <div className="flex items-center justify-center space-x-3">
                    <Button
                      onClick={closeModals}
                      variant="outline"
                      disabled={deleteLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleDeleteMovement}
                      disabled={deleteLoading}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {deleteLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Movement
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  )
}