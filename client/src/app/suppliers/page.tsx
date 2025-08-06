'use client'

import { useState } from 'react'
import { useSelector } from 'react-redux'
import { 
  Truck, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Building,
  Calendar,
  DollarSign,
  Package,
  TrendingUp,
  Star,
  Clock
} from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { PurchaseHeader } from '@/components/ui/PageHeader'
import { selectCurrentUser, selectIsSuperAdmin } from '@/lib/features/auth/authSlice'
import { useGetSuppliersQuery, useGetSupplierStatsQuery } from '@/lib/api/suppliersApi'
import clsx from 'clsx'

export default function SuppliersPage() {
  const user = useSelector(selectCurrentUser)
  const isSuperAdmin = useSelector(selectIsSuperAdmin)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Fetch suppliers data
  const { data: suppliersData, isLoading, error } = useGetSuppliersQuery({
    page,
    limit: 10,
    search: searchTerm,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined
  })

  // Fetch supplier statistics
  const { data: supplierStats } = useGetSupplierStatsQuery({})

  const suppliers = suppliersData?.data || []
  const pagination = suppliersData?.pagination

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
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full"
    switch (status) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-600`
      case 'inactive':
        return `${baseClasses} bg-red-100 text-red-600`
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-600`
      case 'blacklisted':
        return `${baseClasses} bg-red-100 text-red-600`
      default:
        return `${baseClasses} bg-gray-100 text-gray-600`
    }
  }

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={clsx(
          "h-3 w-3",
          index < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        )}
      />
    ))
  }

  return (
    <AppLayout>
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
        {/* New Header */}
        <PurchaseHeader
          title="Supplier Management"
          description={`Manage supplier relationships and procurement (${suppliers.length} suppliers)`}
          icon={<Truck className="h-6 w-6 text-white" />}
          showRefresh={true}
          onRefresh={() => window.location.reload()}
        >
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-white text-emerald-600 rounded-lg hover:bg-emerald-50 border border-white transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
          </button>
        </PurchaseHeader>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border-2 border-sky-500 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">Total Suppliers</p>
                <p className="text-2xl font-bold text-black">{supplierStats?.data?.totalSuppliers || 0}</p>
              </div>
              <Truck className="h-8 w-8 text-sky-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl border-2 border-sky-500 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">Active Suppliers</p>
                <p className="text-2xl font-bold text-green-600">{supplierStats?.data?.activeSuppliers || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl border-2 border-sky-500 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">Purchase Orders</p>
                <p className="text-2xl font-bold text-blue-600">{supplierStats?.data?.totalPurchaseOrders || 0}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl border-2 border-sky-500 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">Total Spend</p>
                <p className="text-2xl font-bold text-sky-600">
                  {supplierStats?.data?.totalSpend ? formatCurrency(supplierStats.data.totalSpend) : '₹0'}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-sky-500" />
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
                  placeholder="Search suppliers..."
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
                <option value="blacklisted">Blacklisted</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border-2 border-sky-200 rounded-lg focus:outline-none focus:border-sky-500 bg-white text-black"
              >
                <option value="all">All Categories</option>
                <option value="raw_materials">Raw Materials</option>
                <option value="packaging">Packaging</option>
                <option value="machinery">Machinery</option>
                <option value="services">Services</option>
                <option value="utilities">Utilities</option>
              </select>
            </div>
          </div>
        </div>

        {/* Suppliers Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl border-2 border-sky-500 p-6 animate-pulse">
                <div className="h-4 bg-sky-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-sky-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-sky-200 rounded w-2/3 mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-3 bg-sky-200 rounded w-1/4"></div>
                  <div className="h-3 bg-sky-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl border-2 border-red-500 p-6 text-center">
            <Truck className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-black mb-2">Error Loading Suppliers</h3>
            <p className="text-red-600">Failed to load suppliers. Please try again.</p>
          </div>
        ) : suppliers.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-sky-500 p-6 text-center">
            <Truck className="h-12 w-12 text-sky-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-black mb-2">No Suppliers Found</h3>
            <p className="text-black opacity-75">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'No suppliers match your search criteria.'
                : 'No suppliers have been added yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {suppliers.map((supplier) => (
              <div key={supplier._id} className="bg-white rounded-xl border-2 border-sky-500 p-6 hover:border-black transition-colors">
                {/* Supplier Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-black truncate">
                      {supplier.companyName}
                    </h3>
                    <p className="text-sm text-sky-600 font-medium">
                      {supplier.supplierCode}
                    </p>
                    <div className="flex items-center mt-1">
                      {getRatingStars(supplier.rating || 0)}
                      <span className="text-xs text-black opacity-60 ml-1">
                        ({supplier.rating || 0}/5)
                      </span>
                    </div>
                  </div>
                  <span className={getStatusBadge(supplier.status)}>
                    {supplier.status}
                  </span>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  {supplier.email && (
                    <div className="flex items-center text-sm text-black opacity-75">
                      <Mail className="h-4 w-4 mr-2 text-sky-500" />
                      <span className="truncate">{supplier.email}</span>
                    </div>
                  )}
                  
                  {supplier.phone && (
                    <div className="flex items-center text-sm text-black opacity-75">
                      <Phone className="h-4 w-4 mr-2 text-sky-500" />
                      <span>{supplier.phone}</span>
                    </div>
                  )}
                  
                  {supplier.address && (
                    <div className="flex items-center text-sm text-black opacity-75">
                      <MapPin className="h-4 w-4 mr-2 text-sky-500" />
                      <span className="truncate">{supplier.address.city}, {supplier.address.state}</span>
                    </div>
                  )}

                  <div className="flex items-center text-sm text-black opacity-75">
                    <Building className="h-4 w-4 mr-2 text-sky-500" />
                    <span className="truncate">{supplier.category}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-sky-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-lg font-bold text-black">{supplier.totalOrders || 0}</p>
                    <p className="text-xs text-black opacity-75">Orders</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-sky-600">
                      {supplier.totalSpend ? formatCurrency(supplier.totalSpend) : '₹0'}
                    </p>
                    <p className="text-xs text-black opacity-75">Total Spend</p>
                  </div>
                </div>

                {/* Performance Indicators */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-black opacity-75">On-time Delivery</span>
                    <span className="font-medium text-green-600">{supplier.onTimeDelivery || 0}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-black opacity-75">Quality Score</span>
                    <span className="font-medium text-blue-600">{supplier.qualityScore || 0}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-black opacity-75">Lead Time</span>
                    <span className="font-medium text-black">{supplier.leadTime || 0} days</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-sky-200">
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-sky-500 hover:text-black hover:bg-sky-50 rounded-lg transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-sky-500 hover:text-black hover:bg-sky-50 rounded-lg transition-colors">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center text-xs text-black opacity-60">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>
                      {supplier.lastOrderDate ? formatDate(supplier.lastOrderDate) : 'No orders'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="bg-white rounded-xl border-2 border-sky-500 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-black">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} suppliers
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
