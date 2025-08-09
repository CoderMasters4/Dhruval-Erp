'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  Building,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  Package,
  TrendingUp,
  Star,
  Clock,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  MoreVertical,
  X,
  ChevronDown,
  Users,
  Award,
  Target,
  Zap,
  FileText,
  CreditCard,
  Globe,
  Shield,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Factory,
  Briefcase,
  Settings,
  BarChart3,
  Eye,
  Plus,
  Filter
} from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import { useGetSupplierByIdQuery, useGetSupplierOrdersQuery } from '@/lib/api/suppliersApi'
import { toast } from 'react-hot-toast'
import clsx from 'clsx'

export default function SupplierDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const supplierId = params.id as string

  // State management
  const [activeTab, setActiveTab] = useState('overview')
  const [ordersPage, setOrdersPage] = useState(1)
  const [ordersLimit, setOrdersLimit] = useState(10)

  // API queries
  const {
    data: supplierData,
    isLoading: supplierLoading,
    error: supplierError,
    refetch: refetchSupplier
  } = useGetSupplierByIdQuery(supplierId)

  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders
  } = useGetSupplierOrdersQuery({
    supplierId,
    page: ordersPage,
    limit: ordersLimit
  })

  const supplier = supplierData?.data
  const orders = ordersData?.data || []
  const ordersPagination = ordersData?.pagination

  // Helper functions
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
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
      maximumFractionDigits: 0
    }).format(amount)
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

  const getOrderStatusColor = (status: string) => {
    const colors = {
      'draft': 'bg-gray-100 text-gray-800',
      'pending_approval': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-blue-100 text-blue-800',
      'sent': 'bg-purple-100 text-purple-800',
      'acknowledged': 'bg-indigo-100 text-indigo-800',
      'in_progress': 'bg-orange-100 text-orange-800',
      'partially_received': 'bg-amber-100 text-amber-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'closed': 'bg-gray-100 text-gray-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={clsx(
          "h-4 w-4",
          index < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        )}
      />
    ))
  }

  const getIndustryIcon = (industry: string) => {
    const icons = {
      'Manufacturing': Factory,
      'Electronics': Zap,
      'Food Processing': Package,
      'Pharmaceuticals': Shield,
      'Textiles': Briefcase,
      'Automotive': Settings
    }
    const IconComponent = icons[industry as keyof typeof icons] || Building
    return <IconComponent className="h-5 w-5" />
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Building },
    { id: 'orders', name: 'Purchase Orders', icon: Package },
    { id: 'performance', name: 'Performance', icon: BarChart3 },
    { id: 'documents', name: 'Documents', icon: FileText }
  ]

  if (supplierLoading) {
    return (
      <AppLayout>
        <div className="p-4 sm:p-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-600">Loading supplier details...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (supplierError || !supplier) {
    return (
      <AppLayout>
        <div className="p-4 sm:p-6">
          <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-12">
            <div className="flex flex-col items-center justify-center">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Supplier Not Found</h3>
              <p className="text-red-600 text-center mb-4">
                The supplier you're looking for doesn't exist or has been removed.
              </p>
              <Button
                onClick={() => router.push('/suppliers')}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Back to Suppliers
              </Button>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 space-y-6">
        {/* Enhanced Header with Glassmorphism */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-3xl shadow-2xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-white bg-opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          <div className="relative p-8 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-6">
                <Button
                  onClick={() => router.push('/suppliers')}
                  className="p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-2xl transition-all duration-300 transform hover:scale-110 backdrop-blur-sm border border-white border-opacity-30"
                >
                  <ArrowLeft className="h-6 w-6" />
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 bg-white bg-opacity-20 rounded-2xl blur-xl"></div>
                  <div className="relative p-4 bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl border border-white border-opacity-30">
                    <Building className="h-10 w-10 text-white drop-shadow-lg" />
                  </div>
                </div>

                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent drop-shadow-lg">
                    {supplier.supplierName || supplier.displayName}
                  </h1>
                  <p className="text-blue-100 mt-2 text-lg font-medium">
                    {supplier.supplierCode} • {supplier.relationship?.supplierCategory || 'General'}
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-2 px-3 py-1 bg-white bg-opacity-20 rounded-full backdrop-blur-sm">
                      <span className={clsx(
                        'h-2 w-2 rounded-full',
                        supplier.isActive ? 'bg-green-400' : 'bg-red-400'
                      )}></span>
                      <span className="text-sm font-medium">{supplier.isActive ? 'ACTIVE' : 'INACTIVE'}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-white bg-opacity-20 rounded-full backdrop-blur-sm">
                      <span className="text-sm font-medium">{supplier.relationship?.supplierType?.toUpperCase() || 'TRADER'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => refetchSupplier()}
                  disabled={supplierLoading}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border border-white border-opacity-30 px-5 py-3 rounded-2xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm font-medium disabled:opacity-50"
                >
                  <RefreshCw className={clsx("h-5 w-5 mr-2 transition-transform", supplierLoading && "animate-spin")} />
                  Refresh
                </Button>

                <Button
                  onClick={() => router.push(`/suppliers/${supplierId}/edit`)}
                  className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-2xl transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg hover:shadow-xl"
                >
                  <Edit className="h-5 w-5 mr-2" />
                  Edit Supplier
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Orders Card */}
          <div className="group relative overflow-hidden bg-white rounded-3xl shadow-lg hover:shadow-2xl border border-gray-100 p-6 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {supplier.supplyHistory?.totalOrders || 0}
                </p>
                <div className="flex items-center text-xs text-gray-500">
                  <div className="h-1 w-8 bg-blue-200 rounded-full mr-2">
                    <div className="h-1 bg-blue-500 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <span>Active orders</span>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                <div className="relative p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-500">
                  <Package className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Total Spend Card */}
          <div className="group relative overflow-hidden bg-white rounded-3xl shadow-lg hover:shadow-2xl border border-gray-100 p-6 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">Total Spend</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {formatCurrency(supplier.supplyHistory?.totalOrderValue || 0)}
                </p>
                <div className="flex items-center text-xs text-gray-500">
                  <div className="h-1 w-8 bg-green-200 rounded-full mr-2">
                    <div className="h-1 bg-green-500 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                  <span>This year</span>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-green-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                <div className="relative p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-500">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* On-time Delivery Card */}
          <div className="group relative overflow-hidden bg-white rounded-3xl shadow-lg hover:shadow-2xl border border-gray-100 p-6 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-violet-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">On-time Delivery</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {supplier.supplyHistory?.onTimeDeliveryRate || 0}%
                </p>
                <div className="flex items-center text-xs text-gray-500">
                  <div className="h-1 w-8 bg-purple-200 rounded-full mr-2">
                    <div className="h-1 bg-purple-500 rounded-full" style={{ width: `${supplier.supplyHistory?.onTimeDeliveryRate || 0}%` }}></div>
                  </div>
                  <span>Performance</span>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                <div className="relative p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-500">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Quality Score Card */}
          <div className="group relative overflow-hidden bg-white rounded-3xl shadow-lg hover:shadow-2xl border border-gray-100 p-6 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">Quality Score</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {100 - (supplier.quality?.defectRate || 0)}%
                </p>
                <div className="flex items-center text-xs text-gray-500">
                  <div className="h-1 w-8 bg-orange-200 rounded-full mr-2">
                    <div className="h-1 bg-orange-500 rounded-full" style={{ width: `${100 - (supplier.quality?.defectRate || 0)}%` }}></div>
                  </div>
                  <span>Rating</span>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-orange-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                <div className="relative p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-500">
                  <Award className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-2 overflow-hidden">
          <div className="flex space-x-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  "flex items-center px-6 py-4 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all duration-300 transform hover:scale-105",
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <tab.icon className={clsx(
                  "h-5 w-5 mr-3 transition-all duration-300",
                  activeTab === tab.id ? "text-white" : "text-gray-500"
                )} />
                {tab.name}
                {activeTab === tab.id && (
                  <div className="ml-2 h-2 w-2 bg-white rounded-full animate-pulse"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Phone className="h-5 w-5 mr-2 text-blue-600" />
                Contact Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Primary Email</p>
                    <p className="text-gray-900 font-medium">{supplier.contactInfo?.primaryEmail || 'N/A'}</p>
                  </div>
                </div>
                {supplier.contactInfo?.alternateEmail && (
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-3 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Alternate Email</p>
                      <p className="text-gray-900 font-medium">{supplier.contactInfo.alternateEmail}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Primary Phone</p>
                    <p className="text-gray-900 font-medium">{supplier.contactInfo?.primaryPhone || 'N/A'}</p>
                  </div>
                </div>
                {supplier.contactInfo?.alternatePhone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-3 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Alternate Phone</p>
                      <p className="text-gray-900 font-medium">{supplier.contactInfo.alternatePhone}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-3 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    {supplier.addresses?.[0] ? (
                      <div className="text-gray-900 font-medium">
                        <div>{supplier.addresses[0].addressLine1}</div>
                        {supplier.addresses[0].addressLine2 && <div>{supplier.addresses[0].addressLine2}</div>}
                        <div>{supplier.addresses[0].city}, {supplier.addresses[0].state}</div>
                        <div>{supplier.addresses[0].pincode}, {supplier.addresses[0].country}</div>
                      </div>
                    ) : (
                      <p className="text-gray-900 font-medium">N/A</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Business Details */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building className="h-5 w-5 mr-2 text-blue-600" />
                Business Details
              </h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  {getIndustryIcon(supplier.businessInfo?.industry || '')}
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Industry</p>
                    <p className="text-gray-900 font-medium">{supplier.businessInfo?.industry || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Business Type</p>
                    <p className="text-gray-900 font-medium">{supplier.businessInfo?.businessType || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">PAN Number</p>
                    <p className="text-gray-900 font-medium">{supplier.registrationDetails?.pan || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Payment Terms</p>
                    <p className="text-gray-900 font-medium">{supplier.financialInfo?.paymentTerms || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Credit Days</p>
                    <p className="text-gray-900 font-medium">{supplier.financialInfo?.creditDays || 0} days</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Target className="h-4 w-4 mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Supplier Category</p>
                    <p className="text-gray-900 font-medium">{supplier.relationship?.supplierCategory || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Purchase Orders</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    All purchase orders from this supplier
                  </p>
                </div>
                <Button
                  onClick={() => refetchOrders()}
                  disabled={ordersLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <RefreshCw className={clsx("h-4 w-4 mr-2", ordersLoading && "animate-spin")} />
                  Refresh
                </Button>
              </div>
            </div>

            {ordersLoading ? (
              <div className="p-12">
                <div className="flex flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
                  <p className="text-gray-600">Loading orders...</p>
                </div>
              </div>
            ) : ordersError ? (
              <div className="p-6">
                <div className="flex items-center gap-3 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <p>Failed to load orders. Please try again.</p>
                </div>
              </div>
            ) : orders.length === 0 ? (
              <div className="p-12">
                <div className="flex flex-col items-center justify-center">
                  <Package className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Found</h3>
                  <p className="text-gray-600 text-center">
                    No purchase orders have been placed with this supplier yet.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order Details
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dates
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order: any) => (
                        <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {order.orderNumber}
                              </div>
                              <div className="text-sm text-gray-500">
                                {order.items?.length || 0} items
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(order.totalAmount || 0)}
                            </div>
                            <div className="text-sm text-gray-500">
                              Tax: {formatCurrency(order.taxAmount || 0)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={clsx(
                              'px-2 py-1 rounded-full text-xs font-medium',
                              getOrderStatusColor(order.status)
                            )}>
                              {order.status?.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>Order: {formatDate(order.orderDate)}</div>
                            <div className="text-gray-500">
                              Expected: {formatDate(order.expectedDeliveryDate)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Button
                              onClick={() => router.push(`/purchase-orders/${order._id}`)}
                              className="text-blue-600 hover:text-blue-900 bg-transparent border-0 p-2"
                              title="View Order"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Orders Pagination */}
                {ordersPagination && ordersPagination.pages > 1 && (
                  <div className="p-6 border-t border-gray-200">
                    <Pagination
                      currentPage={ordersPagination.page}
                      totalPages={ordersPagination.pages}
                      totalItems={ordersPagination.total}
                      itemsPerPage={ordersPagination.limit}
                      onPageChange={setOrdersPage}
                      onItemsPerPageChange={setOrdersLimit}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-6 bg-green-50 rounded-xl">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {supplier.supplyHistory?.onTimeDeliveryRate || 0}%
                  </div>
                  <div className="text-sm text-green-600 font-medium">On-time Delivery Rate</div>
                  <div className="text-xs text-gray-600 mt-1">Last 12 months</div>
                </div>
                <div className="text-center p-6 bg-blue-50 rounded-xl">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {100 - (supplier.quality?.defectRate || 0)}%
                  </div>
                  <div className="text-sm text-blue-600 font-medium">Quality Score</div>
                  <div className="text-xs text-gray-600 mt-1">Based on defect rate</div>
                </div>
                <div className="text-center p-6 bg-purple-50 rounded-xl">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {supplier.supplyHistory?.averageLeadTime || 0}
                  </div>
                  <div className="text-sm text-purple-600 font-medium">Average Lead Time</div>
                  <div className="text-xs text-gray-600 mt-1">Days</div>
                </div>
                <div className="text-center p-6 bg-orange-50 rounded-xl">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {supplier.quality?.returnRate || 0}%
                  </div>
                  <div className="text-sm text-orange-600 font-medium">Return Rate</div>
                  <div className="text-xs text-gray-600 mt-1">Quality issues</div>
                </div>
              </div>
            </div>

            {/* Additional Performance Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Supply History</h4>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Orders</span>
                    <span className="text-sm font-medium text-gray-900">{supplier.supplyHistory?.totalOrders || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Order Value</span>
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(supplier.supplyHistory?.totalOrderValue || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Average Order Value</span>
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(supplier.supplyHistory?.averageOrderValue || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Quality Rejection Rate</span>
                    <span className="text-sm font-medium text-red-600">{supplier.supplyHistory?.qualityRejectionRate || 0}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Relationship Details</h4>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Supplier Since</span>
                    <span className="text-sm font-medium text-gray-900">{formatDate(supplier.relationship?.supplierSince)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Supplier Type</span>
                    <span className="text-sm font-medium text-gray-900">{supplier.relationship?.supplierType || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Priority</span>
                    <span className={clsx(
                      'text-sm font-medium px-2 py-1 rounded-full',
                      supplier.relationship?.priority === 'high' ? 'bg-red-100 text-red-800' :
                      supplier.relationship?.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    )}>
                      {supplier.relationship?.priority || 'Low'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Strategic Partner</span>
                    <span className="text-sm font-medium text-gray-900">
                      {supplier.relationship?.strategicPartner ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Compliance Status</span>
                    <span className={clsx(
                      'text-sm font-medium px-2 py-1 rounded-full',
                      supplier.compliance?.vendorApprovalStatus === 'approved' ? 'bg-green-100 text-green-800' :
                      supplier.compliance?.vendorApprovalStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    )}>
                      {supplier.compliance?.vendorApprovalStatus?.toUpperCase() || 'PENDING'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents & Certificates</h3>
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Available</h3>
              <p className="text-gray-600">
                Document management feature will be available soon.
              </p>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
