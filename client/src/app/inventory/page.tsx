'use client'

import { useState } from 'react'
import { useSelector } from 'react-redux'
import {
  Package,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Warehouse,
  ShoppingCart,
  Tag,
  Calendar
} from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageHeader } from '@/components/ui/PageHeader'
import { selectCurrentUser, selectIsSuperAdmin } from '@/lib/features/auth/authSlice'
import {
  useGetInventoryItemsQuery,
  useGetInventoryStatsQuery,
  useGetInventoryAlertsQuery
} from '@/lib/api/inventoryApi'
import { ViewToggle, ViewMode } from '@/components/ui/ViewToggle'
import { DataView } from '@/components/ui/DataView'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import clsx from 'clsx'

export default function InventoryPage() {
  const user = useSelector(selectCurrentUser)
  const isSuperAdmin = useSelector(selectIsSuperAdmin)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [viewMode, setViewMode] = useState<ViewMode>('list')

  // Fetch inventory data
  const { data: inventoryData, isLoading, error } = useGetInventoryItemsQuery({
    page,
    limit: 10,
    search: searchTerm,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined
  })

  // Fetch inventory statistics
  const { data: inventoryStats } = useGetInventoryStatsQuery({})
  
  // Fetch inventory alerts
  const { data: inventoryAlerts } = useGetInventoryAlertsQuery({})

  const items = inventoryData?.data || []
  const pagination = inventoryData?.pagination
  const alerts = inventoryAlerts?.data || []

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full flex items-center"
    switch (status) {
      case 'low_stock':
        return `${baseClasses} bg-red-100 text-red-600`
      case 'overstock':
        return `${baseClasses} bg-orange-100 text-orange-600`
      case 'normal':
        return `${baseClasses} bg-green-100 text-green-600`
      default:
        return `${baseClasses} bg-gray-100 text-gray-600`
    }
  }

  const getStockIcon = (status: string) => {
    switch (status) {
      case 'low_stock':
        return <TrendingDown className="h-3 w-3 mr-1" />
      case 'overstock':
        return <TrendingUp className="h-3 w-3 mr-1" />
      case 'normal':
        return <BarChart3 className="h-3 w-3 mr-1" />
      default:
        return null
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header with Theme Colors */}
        <PageHeader
          title="Inventory Management"
          description={`Track stock levels and manage inventory (${items.length} items)`}
          icon={<Package className="h-6 w-6" />}
          variant="indigo"
        >
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              onClick={() => window.location.reload()}
            >
              <Search className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              className="bg-white text-indigo-600 hover:bg-gray-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </PageHeader>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border-2 border-sky-500 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">Total Items</p>
                <p className="text-2xl font-bold text-black">{inventoryStats?.data?.totalItems || 0}</p>
              </div>
              <Package className="h-8 w-8 text-sky-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl border-2 border-sky-500 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">Low Stock</p>
                <p className="text-2xl font-bold text-red-600">{inventoryStats?.data?.lowStockItems || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl border-2 border-sky-500 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">Total Value</p>
                <p className="text-2xl font-bold text-sky-600">
                  {inventoryStats?.data?.totalValue ? formatCurrency(inventoryStats.data.totalValue) : '₹0'}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-sky-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl border-2 border-sky-500 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">Movements</p>
                <p className="text-2xl font-bold text-green-600">{inventoryStats?.data?.recentMovements || 0}</p>
              </div>
              <Warehouse className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="bg-white rounded-xl border-2 border-red-500 p-4 sm:p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <h3 className="text-lg font-semibold text-black">Low Stock Alerts ({alerts.length})</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {alerts.slice(0, 6).map((alert) => (
                <div key={alert._id} className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-black text-sm">{alert.itemName}</h4>
                    <span className={clsx(
                      "px-2 py-1 text-xs rounded-full",
                      alert.urgency === 'critical' 
                        ? "bg-red-100 text-red-600" 
                        : "bg-orange-100 text-orange-600"
                    )}>
                      {alert.urgency}
                    </span>
                  </div>
                  <div className="text-xs text-black opacity-75">
                    <p>Current: {alert.currentStock} {alert.itemCode}</p>
                    <p>Minimum: {alert.minStock}</p>
                    <p>Shortage: {alert.shortage}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl border-2 border-sky-500 p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
              {/* Search */}
              <div className="lg:col-span-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sky-500" />
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-sky-200 rounded-lg focus:outline-none focus:border-sky-500 bg-white text-black"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-sky-200 rounded-lg focus:outline-none focus:border-sky-500 bg-white text-black"
                >
                  <option value="all">All Categories</option>
                  <option value="Raw Materials">Raw Materials</option>
                  <option value="Finished Goods">Finished Goods</option>
                  <option value="Work in Progress">Work in Progress</option>
                  <option value="Packaging">Packaging</option>
                  <option value="Tools & Equipment">Tools & Equipment</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-sky-200 rounded-lg focus:outline-none focus:border-sky-500 bg-white text-black"
                >
                  <option value="all">All Status</option>
                  <option value="normal">Normal Stock</option>
                  <option value="low_stock">Low Stock</option>
                  <option value="overstock">Overstock</option>
                </select>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center space-x-3">
              <ViewToggle
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            </div>
          </div>
        </div>

        {/* Inventory List */}
        <div className="bg-white rounded-xl border-2 border-sky-500 overflow-hidden">
          <DataView
            data={items || []}
            viewMode={viewMode}
            loading={isLoading}
            emptyMessage={
              searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                ? 'No items match your search criteria.'
                : 'No inventory items have been added yet.'
            }
            columns={[
              {
                key: 'itemName',
                label: 'Item',
                render: (itemName, item) => (
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-lg bg-sky-500 flex items-center justify-center">
                        <Package className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-black">{itemName}</div>
                      <div className="text-sm text-black opacity-60">{item.itemCode}</div>
                    </div>
                  </div>
                )
              },
              {
                key: 'category',
                label: 'Category',
                render: (category) => (
                  <div className="flex items-center">
                    <Tag className="w-4 h-4 text-sky-500 mr-2" />
                    <span className="text-sm text-black">{category}</span>
                  </div>
                )
              },
              {
                key: 'currentStock',
                label: 'Stock',
                render: (currentStock, item) => (
                  <div>
                    <div className="text-sm font-medium text-black">
                      {currentStock} {item.unit}
                    </div>
                    <div className="text-sm text-black opacity-60">
                      Min: {item.minStock} | Max: {item.maxStock}
                    </div>
                  </div>
                )
              },
              {
                key: 'status',
                label: 'Status',
                render: (status) => (
                  <span className={getStatusBadge(status)}>
                    {getStockIcon(status)}
                    {status.replace('_', ' ')}
                  </span>
                )
              },
              {
                key: 'totalValue',
                label: 'Value',
                render: (totalValue, item) => (
                  <div>
                    <div className="text-sm font-medium text-black">
                      {formatCurrency(totalValue)}
                    </div>
                    <div className="text-sm text-black opacity-60">
                      @ {formatCurrency(item.unitPrice)}/{item.unit}
                    </div>
                  </div>
                )
              },
              {
                key: 'location',
                label: 'Location',
                render: (location) => (
                  <div className="flex items-center">
                    <Warehouse className="w-4 h-4 text-sky-500 mr-2" />
                    <span className="text-sm text-black">{location}</span>
                  </div>
                )
              },
              {
                key: 'lastUpdated',
                label: 'Last Updated',
                render: (lastUpdated) => (
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-sky-500 mr-2" />
                    <span className="text-sm text-black">
                      {lastUpdated ? new Date(lastUpdated).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                )
              },
              {
                key: 'actions',
                label: 'Actions',
                render: (_, item) => (
                  <div className="flex items-center space-x-2">
                    <button className="text-sky-500 hover:text-black p-1 rounded hover:bg-sky-50">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="text-sky-500 hover:text-black p-1 rounded hover:bg-sky-50">
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                )
              }
            ]}
            renderGridCard={(item) => (
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 h-12 w-12">
                    <div className="h-12 w-12 rounded-lg bg-sky-500 flex items-center justify-center">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium text-black">
                      {item.itemName}
                    </h3>
                    <p className="text-sm text-black opacity-60">{item.itemCode}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-sky-500 hover:text-black p-1 rounded hover:bg-sky-50">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="text-sky-500 hover:text-black p-1 rounded hover:bg-sky-50">
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <Tag className="w-4 h-4 text-sky-500 mr-3" />
                    <span className="text-sm text-black">{item.category}</span>
                  </div>

                  <div className="flex items-center">
                    <Warehouse className="w-4 h-4 text-sky-500 mr-3" />
                    <span className="text-sm text-black">{item.location}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-sky-200">
                    <div>
                      <div className="text-xs text-black opacity-60 uppercase tracking-wider">Stock</div>
                      <div className="text-sm font-medium text-black">
                        {item.currentStock} {item.unit}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-black opacity-60 uppercase tracking-wider">Value</div>
                      <div className="text-sm font-medium text-black">
                        {formatCurrency(item.totalValue)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-sky-200">
                    <span className={getStatusBadge(item.status)}>
                      {getStockIcon(item.status)}
                      {item.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-black opacity-60">
                      @ {formatCurrency(item.unitPrice)}/{item.unit}
                    </span>
                  </div>
                </div>
              </div>
            )}
            tableClassName="min-w-full divide-y divide-sky-200"
            gridClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6"
          />

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="bg-indigo-50 px-6 py-4 flex items-center justify-between border-t border-indigo-200 rounded-b-xl">
              <div className="text-sm text-gray-700">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} items
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>

                <div className="flex items-center space-x-1">
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    const pageNum = i + 1
                    return (
                      <Button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        variant={page === pageNum ? "default" : "outline"}
                        size="sm"
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                  {pagination.pages > 5 && (
                    <>
                      <span className="text-gray-500">...</span>
                      <Button
                        onClick={() => setPage(pagination.pages)}
                        variant={page === pagination.pages ? "default" : "outline"}
                        size="sm"
                        className="w-8 h-8 p-0"
                      >
                        {pagination.pages}
                      </Button>
                    </>
                  )}
                </div>

                <Button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= pagination.pages}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
