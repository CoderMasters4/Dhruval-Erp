'use client'

import { useState } from 'react'
import { useSelector } from 'react-redux'
import { 
  Warehouse, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit,
  Trash2,
  MapPin,
  Package,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageHeader } from '@/components/ui/PageHeader'
import { selectCurrentUser, selectIsSuperAdmin } from '@/lib/features/auth/authSlice'
import { useGetWarehousesQuery, useGetWarehouseStatsQuery } from '@/lib/api/warehousesApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import clsx from 'clsx'

export default function WarehousesPage() {
  const user = useSelector(selectCurrentUser)
  const isSuperAdmin = useSelector(selectIsSuperAdmin)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Fetch warehouses data
  const { data: warehousesData, isLoading, error } = useGetWarehousesQuery({
    page,
    limit: 10,
    search: searchTerm,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined
  })

  // Fetch warehouse statistics
  const { data: warehouseStats } = useGetWarehouseStatsQuery({})

  const warehouses = warehousesData?.data || []
  const pagination = warehousesData?.pagination

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }



  const getCapacityColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-600'
    if (utilization >= 75) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header with Theme Colors */}
        <PageHeader
          title="Warehouse Management"
          description={`Manage warehouse locations and inventory (${warehouses.length} warehouses)`}
          icon={<Warehouse className="h-6 w-6" />}
          variant="purple"
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
              onClick={() => setShowCreateModal(true)}
              className="bg-white text-purple-600 hover:bg-gray-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Warehouse
            </Button>
          </div>
        </PageHeader>

        {/* Stats Cards with Better Visibility */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-l-purple-500 bg-white shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Warehouses</CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Warehouse className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{warehouseStats?.data?.totalWarehouses || 0}</div>
              <p className="text-xs text-gray-600">
                Across all locations
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 bg-white shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Active Warehouses</CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{warehouseStats?.data?.activeWarehouses || 0}</div>
              <p className="text-xs text-gray-600">
                Currently operational
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 bg-white shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Capacity</CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{(warehouseStats?.data?.totalCapacity || 0).toLocaleString()}</div>
              <p className="text-xs text-gray-600">
                Square meters
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 bg-white shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Avg Utilization</CardTitle>
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{warehouseStats?.data?.averageUtilization || 0}%</div>
              <p className="text-xs text-gray-600">
                Capacity utilized
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Search & Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search warehouses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="all">All Types</option>
                  <option value="main">Main Warehouse</option>
                  <option value="distribution">Distribution Center</option>
                  <option value="storage">Storage Facility</option>
                  <option value="cold_storage">Cold Storage</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Warehouses Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="flex justify-between">
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="text-center">
            <CardContent className="pt-6">
              <Warehouse className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Warehouses</h3>
              <p className="text-red-600">Failed to load warehouses. Please try again.</p>
            </CardContent>
          </Card>
        ) : warehouses.length === 0 ? (
          <Card className="text-center">
            <CardContent className="pt-6">
              <Warehouse className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Warehouses Found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'No warehouses match your search criteria.'
                  : 'No warehouses have been added yet.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {warehouses.map((warehouse) => (
              <Card key={warehouse._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">
                        {warehouse.warehouseName}
                      </CardTitle>
                      <p className="text-sm text-purple-600 font-medium">
                        {warehouse.warehouseCode}
                      </p>
                    </div>
                    <Badge
                      variant={warehouse.status === 'active' ? 'success' : warehouse.status === 'inactive' ? 'destructive' : 'warning'}
                    >
                      {warehouse.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Location */}
                  <div className="flex items-center space-x-2 mb-4">
                    <MapPin className="h-4 w-4 text-purple-500" />
                    <div className="text-sm text-gray-600">
                      <p>{warehouse.address?.city}, {warehouse.address?.state}</p>
                      <p>{warehouse.address?.country}</p>
                    </div>
                  </div>

                  {/* Capacity Info */}
                  <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-purple-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{(warehouse.capacity?.totalCapacity || 0).toLocaleString()}</p>
                      <p className="text-xs text-gray-600">Total Capacity</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-lg font-bold ${getCapacityColor(warehouse.capacity?.utilizationPercentage || 0)}`}>
                        {warehouse.capacity?.utilizationPercentage || 0}%
                      </p>
                      <p className="text-xs text-gray-600">Utilization</p>
                    </div>
                  </div>

                  {/* Warehouse Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Type</span>
                      <span className="font-medium text-gray-900 capitalize">
                        {warehouse.warehouseType?.replace('_', ' ') || 'Standard'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Manager</span>
                      <span className="font-medium text-gray-900">
                        {warehouse.manager?.name || 'Not assigned'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Items</span>
                      <span className="font-medium text-gray-900">
                        {(warehouse.itemCount || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>
                        {warehouse.createdAt ? formatDate(warehouse.createdAt) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} warehouses
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page <= 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
