'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Truck,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Phone,
  Mail,
  MapPin,
  Building,
  DollarSign,
  Package,
  Star,
  Clock,
  Grid3X3,
  List,
  RefreshCw,
  MoreVertical,
  X,
  ChevronDown,
  Zap,
  Shield,
  AlertCircle,
  CheckCircle,
  Loader2,
  Factory,
  Briefcase,
  Settings
} from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import { useGetSuppliersQuery } from '@/lib/api/suppliersApi'
import { useGetAllCompaniesQuery } from '@/lib/api/authApi'
import { SupplierFormModal } from '@/components/suppliers/modals/SupplierFormModal'
import { SupplierDetailsModal } from '@/components/suppliers/modals/SupplierDetailsModal'
import clsx from 'clsx'

interface SupplierFilters {
  search: string
  status: string
  category: string
  page: number
  limit: number
}

type ViewMode = 'grid' | 'list'

export default function SuppliersPage() {
  const router = useRouter()

  // State management
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null)
  const [showSupplierDetails, setShowSupplierDetails] = useState(false)
  const [showSupplierForm, setShowSupplierForm] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<any>(null)

  const [filters, setFilters] = useState<SupplierFilters>({
    search: '',
    status: 'all',
    category: 'all',
    page: 1,
    limit: 10
  })

  // API queries
  const {
    data: suppliersData,
    isLoading,
    error,
    refetch
  } = useGetSuppliersQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search || undefined,
    status: filters.status !== 'all' ? filters.status : undefined,
    category: filters.category !== 'all' ? filters.category : undefined
  })

  // Get companies data for displaying company names
  const { data: companiesData } = useGetAllCompaniesQuery(undefined, {
    skip: !suppliersData?.data?.data?.length
  })

  const companies = companiesData?.data || []

  // Handle different possible data structures
  const suppliers = (Array.isArray(suppliersData?.data?.data) 
    ? suppliersData.data.data 
    : Array.isArray(suppliersData?.data) 
    ? suppliersData.data 
    : []) as any[]
  const pagination = suppliersData?.data?.pagination

  // Helper functions
  const getCompanyName = (companyId: string | any) => {
    // If companyId is an object (populated), use it directly
    if (companyId && typeof companyId === 'object' && companyId.companyName) {
      return companyId.companyName
    }
    // Otherwise, find in companies array
    const company = companies.find(c => c._id === companyId)
    return company?.companyName || 'Unknown Company'
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    const colors = {
      'active': 'bg-green-100 text-green-800 border-green-200',
      'inactive': 'bg-red-100 text-red-800 border-red-200',
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'blacklisted': 'bg-red-100 text-red-800 border-red-200',
      'suspended': 'bg-orange-100 text-orange-800 border-orange-200'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      'raw_materials': 'bg-blue-100 text-blue-800',
      'packaging': 'bg-green-100 text-green-800',
      'machinery': 'bg-purple-100 text-purple-800',
      'services': 'bg-indigo-100 text-indigo-800',
      'utilities': 'bg-orange-100 text-orange-800'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getIndustryIcon = (industry: string) => {
    switch (industry?.toLowerCase()) {
      case 'automotive':
        return <Truck className="h-4 w-4 text-blue-600" />
      case 'manufacturing':
        return <Factory className="h-4 w-4 text-gray-600" />
      case 'electronics':
        return <Settings className="h-4 w-4 text-purple-600" />
      case 'food processing':
        return <Package className="h-4 w-4 text-green-600" />
      default:
        return <Building className="h-4 w-4 text-gray-600" />
    }
  }

  // Event handlers
  const handleFilterChange = (key: keyof SupplierFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value // Reset page when other filters change
    }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handleItemsPerPageChange = (limit: number) => {
    setFilters(prev => ({ ...prev, limit, page: 1 }))
  }

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      category: 'all',
      page: 1,
      limit: 10
    })
  }

  const handleViewSupplier = (supplier: any) => {
    router.push(`/suppliers/${supplier._id}`)
  }

  const handleEditSupplier = (supplier: any) => {
    setEditingSupplier(supplier)
    setShowSupplierForm(true)
  }

  const handleSupplierDetails = (supplier: any) => {
    setSelectedSupplier(supplier)
    setShowSupplierDetails(true)
  }

  const handleEditFromDetails = () => {
    setEditingSupplier(selectedSupplier)
    setShowSupplierDetails(false)
    setShowSupplierForm(true)
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-black">Supplier Management</h1>
                <p className="text-gray-600 mt-1">Manage supplier relationships and procurement</p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full shadow-sm border border-sky-200">
                    <Building className="h-4 w-4 text-sky-600" />
                    <span className="text-sm font-medium text-gray-700">{pagination?.total || suppliers.length} suppliers</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full shadow-sm border border-sky-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">{suppliers.filter(s => s.isActive).length} active</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* View Toggle */}
                <div className="flex items-center bg-white rounded-xl p-1 shadow-sm border border-sky-200">
                  <Button
                    onClick={() => setViewMode('list')}
                    className={clsx(
                      "p-2 rounded-lg transition-all duration-200",
                      viewMode === 'list'
                        ? "bg-sky-500 text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => setViewMode('grid')}
                    className={clsx(
                      "p-2 rounded-lg transition-all duration-200",
                      viewMode === 'grid'
                        ? "bg-sky-500 text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-white hover:bg-gray-50 text-gray-700 border border-sky-200 px-4 py-2 rounded-xl font-medium shadow-sm transition-all duration-200"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {(filters.search || filters.status !== 'all' || filters.category !== 'all') && (
                    <div className="ml-2 h-2 w-2 bg-sky-500 rounded-full"></div>
                  )}
                </Button>

                <Button
                  onClick={() => refetch()}
                  disabled={isLoading}
                  className="bg-white hover:bg-gray-50 text-gray-700 border border-sky-200 px-4 py-2 rounded-xl font-medium shadow-sm transition-all duration-200 disabled:opacity-50"
                >
                  <RefreshCw className={clsx("h-4 w-4 mr-2 transition-transform", isLoading && "animate-spin")} />
                  Refresh
                </Button>

                <Button
                  onClick={() => {
                    setEditingSupplier(null)
                    setShowSupplierForm(true)
                  }}
                  className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Supplier
                </Button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Suppliers Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-sky-200 p-6 hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">Total Suppliers</p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {pagination?.total || suppliers.length}
                  </p>
                  <p className="text-xs text-gray-500">+12% from last month</p>
                </div>
                <div className="p-3 bg-sky-100 rounded-xl">
                  <Truck className="h-8 w-8 text-sky-600" />
                </div>
              </div>
            </div>

            {/* Active Suppliers Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-sky-200 p-6 hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">Active Suppliers</p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {suppliers.filter(s => s.isActive).length}
                  </p>
                  <p className="text-xs text-gray-500">Excellent health</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>

            {/* Total Orders Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-sky-200 p-6 hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {suppliers.reduce((sum, s) => sum + (s.supplyHistory?.totalOrders || 0), 0)}
                  </p>
                  <p className="text-xs text-gray-500">+8% this quarter</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Package className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Total Spend Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-sky-200 p-6 hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">Total Spend</p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {formatCurrency(suppliers.reduce((sum, s) => sum + (s.supplyHistory?.totalOrderValue || 0), 0))}
                  </p>
                  <p className="text-xs text-gray-500">Within budget</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <DollarSign className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="bg-white rounded-2xl shadow-lg border border-sky-200 p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-sky-100 rounded-xl">
                    <Filter className="h-5 w-5 text-sky-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                    <p className="text-sm text-gray-600">Refine your supplier search</p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowFilters(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 bg-transparent border-0"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search Input */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Suppliers
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name, code, email..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200"
                    />
                    {filters.search && (
                      <button
                        onClick={() => handleFilterChange('search', '')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="relative">
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 appearance-none cursor-pointer"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 appearance-none cursor-pointer"
                    >
                      <option value="all">All Categories</option>
                      <option value="raw_materials">Raw Materials</option>
                      <option value="packaging">Packaging</option>
                      <option value="machinery">Machinery</option>
                      <option value="services">Services</option>
                      <option value="utilities">Utilities</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Active filters:</span>
                  <div className="flex items-center gap-2">
                    {filters.search && (
                      <span className="px-2 py-1 bg-sky-100 text-sky-700 rounded-full text-xs font-medium">
                        Search: "{filters.search}"
                      </span>
                    )}
                    {filters.status !== 'all' && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        Status: {filters.status}
                      </span>
                    )}
                    {filters.category !== 'all' && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        Category: {filters.category.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleClearFilters}
                    className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 font-medium"
                  >
                    Clear All
                  </Button>
                  <Button
                    onClick={() => setShowFilters(false)}
                    className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-all duration-200 font-medium shadow-sm"
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="bg-white rounded-2xl shadow-lg border border-sky-200 p-12">
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-sky-600 mb-4" />
                <p className="text-gray-600">Loading suppliers...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-6">
              <div className="flex items-center gap-3 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <p>Failed to load suppliers. Please try again.</p>
              </div>
            </div>
          )}

          {/* No Data State */}
          {!isLoading && !error && suppliers.length === 0 && (
            <div className="bg-white rounded-2xl shadow-lg border border-sky-200 p-12">
              <div className="flex flex-col items-center justify-center">
                <Truck className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Suppliers Found</h3>
                <p className="text-gray-600 text-center">
                  {filters.search || filters.status !== 'all' || filters.category !== 'all'
                    ? 'No suppliers match your search criteria. Try adjusting your filters.'
                    : 'No suppliers have been added yet. Click "Add Supplier" to get started.'}
                </p>
              </div>
            </div>
          )}

          {/* Suppliers Content */}
          {!isLoading && !error && suppliers.length > 0 && (
            <>
              {/* List View */}
              {viewMode === 'list' && (
                <div className="bg-white rounded-2xl shadow-lg border border-sky-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Suppliers Directory</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Showing {suppliers.length} of {pagination?.total || suppliers.length} suppliers
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-600 font-medium">Live Data</span>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Supplier
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contact
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Business
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Performance
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {suppliers.map((supplier: any) => (
                          <tr
                            key={supplier._id}
                            className="hover:bg-gray-50 transition-colors duration-200"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 bg-sky-100 rounded-full flex items-center justify-center">
                                  <span className="text-sky-600 font-semibold text-sm">
                                    {supplier.supplierName?.charAt(0)?.toUpperCase() || 'S'}
                                  </span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {supplier.supplierName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {supplier.supplierCode}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {getCompanyName(supplier.companyId)}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                                              <div className="text-sm text-gray-900">
                                  <div className="font-medium">{supplier.contactInfo?.primaryEmail || 'N/A'}</div>
                                  <div className="text-gray-500">{supplier.contactInfo?.primaryPhone || 'N/A'}</div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                                              <div className="text-sm text-gray-900">
                                  <div className="font-medium">{supplier.businessInfo?.industry || 'N/A'}</div>
                                  <div className="text-gray-500">{supplier.addresses?.[0]?.city || 'N/A'}, {supplier.addresses?.[0]?.state || 'N/A'}</div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                                              <div className="text-sm text-gray-900">
                                  <div className="font-medium">{supplier.supplyHistory?.totalOrders || 0} orders</div>
                                  <div className="text-gray-500">{formatCurrency(supplier.supplyHistory?.totalOrderValue || 0)}</div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col gap-1">
                                <span className={clsx(
                                  'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                                  getStatusColor(supplier.isActive ? 'active' : 'inactive')
                                )}>
                                  {supplier.isActive ? 'ACTIVE' : 'INACTIVE'}
                                </span>
                                <span className={clsx(
                                  'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                                  getCategoryColor(supplier.relationship?.supplierCategory)
                                )}>
                                  {supplier.relationship?.supplierCategory?.toUpperCase()}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center gap-1">
                                <Button
                                  onClick={() => handleViewSupplier(supplier)}
                                  className="p-2 text-sky-600 hover:text-sky-900 hover:bg-sky-50 rounded-lg transition-colors bg-transparent border-0"
                                  title="View Details"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => handleEditSupplier(supplier)}
                                  className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors bg-transparent border-0"
                                  title="Edit Supplier"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => handleSupplierDetails(supplier)}
                                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors bg-transparent border-0"
                                  title="Quick View"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Grid View */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {suppliers.map((supplier: any) => (
                    <div
                      key={supplier._id}
                      className="bg-white rounded-2xl shadow-lg border border-sky-200 p-6 hover:shadow-xl transition-shadow duration-200"
                    >
                    {/* Supplier Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                            <span className="text-white font-semibold">
                              {supplier.supplierName?.charAt(0)?.toUpperCase() || 'S'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {supplier.supplierName}
                            </h3>
                            <p className="text-sm text-blue-600 font-medium">
                              {supplier.supplierCode}
                            </p>
                            <p className="text-xs text-gray-500">
                              {getCompanyName(supplier.companyId)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className={clsx(
                          'px-2 py-1 rounded-full text-xs font-medium',
                          getStatusColor(supplier.isActive ? 'active' : 'inactive')
                        )}>
                          {supplier.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 mb-4">
                      {supplier.contactInfo?.primaryEmail && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="truncate">{supplier.contactInfo.primaryEmail}</span>
                        </div>
                      )}

                      {supplier.contactInfo?.primaryPhone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{supplier.contactInfo.primaryPhone}</span>
                        </div>
                      )}

                      {supplier.addresses?.[0] && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="truncate">{supplier.addresses[0].city}, {supplier.addresses[0].state}</span>
                        </div>
                      )}

                      {supplier.businessInfo?.industry && (
                        <div className="flex items-center text-sm text-gray-600">
                          {getIndustryIcon(supplier.businessInfo.industry)}
                          <span className="ml-2 truncate">{supplier.businessInfo.industry}</span>
                        </div>
                      )}
                    </div>

                    {/* Category Badge */}
                    <div className="mb-4">
                      <span className={clsx(
                        'px-3 py-1 rounded-full text-xs font-medium',
                        getCategoryColor(supplier.relationship?.supplierCategory)
                      )}>
                        {supplier.relationship?.supplierCategory?.toUpperCase()}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">{supplier.supplyHistory?.totalOrders || 0}</p>
                        <p className="text-xs text-gray-600">Orders</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-blue-600">
                          {formatCurrency(supplier.supplyHistory?.totalOrderValue || 0)}
                        </p>
                        <p className="text-xs text-gray-600">Total Spend</p>
                      </div>
                    </div>

                    {/* Performance Indicators */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">On-time Delivery</span>
                        <span className="font-medium text-green-600">{supplier.supplyHistory?.onTimeDeliveryRate || 0}%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Quality Score</span>
                        <span className="font-medium text-blue-600">{supplier.quality?.qualityRating || 0}%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Lead Time</span>
                        <span className="font-medium text-gray-900">{supplier.supplyHistory?.averageLeadTime || 0} days</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Payment Terms</span>
                        <span className="font-medium text-gray-900">
                          {supplier.financialInfo?.paymentTerms || 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => handleViewSupplier(supplier)}
                          className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors bg-transparent border-0"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleEditSupplier(supplier)}
                          className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors bg-transparent border-0"
                          title="Edit Supplier"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleSupplierDetails(supplier)}
                          className="p-2 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded-lg transition-colors bg-transparent border-0"
                          title="Quick View"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>
                          {supplier.supplyHistory?.lastOrderDate ? formatDate(supplier.supplyHistory.lastOrderDate) : 'No orders'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
                onPageChange={handlePageChange}
                                  onLimitChange={handleItemsPerPageChange}
                className="bg-white rounded-2xl shadow-lg border border-sky-200 p-6"
              />
            </div>
          )}



          {/* Supplier Form Modal */}
          {showSupplierForm && (
            <SupplierFormModal
              isOpen={showSupplierForm}
              onClose={() => {
                setShowSupplierForm(false)
                setEditingSupplier(null)
              }}
              onSuccess={() => {
                refetch()
                setShowSupplierForm(false)
                setEditingSupplier(null)
              }}
              supplier={editingSupplier}
            />
          )}

          {/* Supplier Details Modal */}
          {showSupplierDetails && selectedSupplier && (
            <SupplierDetailsModal
              isOpen={showSupplierDetails}
              onClose={() => {
                setShowSupplierDetails(false)
                setSelectedSupplier(null)
              }}
              supplier={selectedSupplier}
              onEdit={handleEditFromDetails}
            />
          )}
        </div>
      </div>
    </AppLayout>
  )
}