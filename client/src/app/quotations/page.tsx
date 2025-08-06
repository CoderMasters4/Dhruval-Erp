'use client'

import { useState } from 'react'
import { useSelector } from 'react-redux'
import {
  Quote,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Send,
  Copy,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User
} from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { SalesHeader } from '@/components/ui/PageHeader'
import { selectCurrentUser, selectIsSuperAdmin } from '@/lib/features/auth/authSlice'
import { useGetQuotationsQuery, useGetQuotationStatsQuery } from '@/lib/api/quotationsApi'
import clsx from 'clsx'

export default function QuotationsPage() {
  const user = useSelector(selectCurrentUser)
  const isSuperAdmin = useSelector(selectIsSuperAdmin)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [customerFilter, setCustomerFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Fetch quotations data
  const { data: quotationsData, isLoading, error } = useGetQuotationsQuery({
    page,
    limit: 10,
    search: searchTerm,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    customerId: customerFilter !== 'all' ? customerFilter : undefined
  })

  // Fetch quotation statistics
  const { data: quotationStats } = useGetQuotationStatsQuery({})

  const quotations = quotationsData?.data || []
  const pagination = quotationsData?.pagination

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
      case 'draft':
        return `${baseClasses} bg-gray-100 text-gray-600`
      case 'sent':
        return `${baseClasses} bg-blue-100 text-blue-600`
      case 'accepted':
        return `${baseClasses} bg-green-100 text-green-600`
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-600`
      case 'expired':
        return `${baseClasses} bg-yellow-100 text-yellow-600`
      case 'converted':
        return `${baseClasses} bg-sky-100 text-sky-600`
      default:
        return `${baseClasses} bg-gray-100 text-gray-600`
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Edit className="h-4 w-4" />
      case 'sent':
        return <Send className="h-4 w-4" />
      case 'accepted':
        return <CheckCircle className="h-4 w-4" />
      case 'rejected':
        return <XCircle className="h-4 w-4" />
      case 'expired':
        return <AlertTriangle className="h-4 w-4" />
      case 'converted':
        return <Copy className="h-4 w-4" />
      default:
        return <Quote className="h-4 w-4" />
    }
  }

  const getDaysUntilExpiry = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const today = new Date()
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <AppLayout>
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
        {/* New Header */}
        <SalesHeader
          title="Quotations"
          description={`Manage customer quotations and proposals (${quotations.length} quotations)`}
          icon={<Quote className="h-6 w-6 text-white" />}
          showRefresh={true}
          onRefresh={() => window.location.reload()}
        >
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-white text-emerald-600 rounded-lg hover:bg-emerald-50 border border-white transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Quotation
          </button>
        </SalesHeader>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border-2 border-sky-500 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">Total Quotations</p>
                <p className="text-2xl font-bold text-black">{quotationStats?.data?.totalQuotations || 0}</p>
              </div>
              <Quote className="h-8 w-8 text-sky-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl border-2 border-sky-500 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">Pending</p>
                <p className="text-2xl font-bold text-blue-600">{quotationStats?.data?.pendingQuotations || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl border-2 border-sky-500 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">Accepted</p>
                <p className="text-2xl font-bold text-green-600">{quotationStats?.data?.acceptedQuotations || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl border-2 border-sky-500 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">Total Value</p>
                <p className="text-2xl font-bold text-sky-600">
                  {formatCurrency(quotationStats?.data?.totalValue || 0)}
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
                  placeholder="Search quotations..."
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
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="expired">Expired</option>
                <option value="converted">Converted</option>
              </select>
            </div>

            {/* Customer Filter */}
            <div>
              <select
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
                className="w-full px-3 py-2 border-2 border-sky-200 rounded-lg focus:outline-none focus:border-sky-500 bg-white text-black"
              >
                <option value="all">All Customers</option>
                {/* Customer options will be populated from API */}
              </select>
            </div>
          </div>
        </div>

        {/* Quotations Grid */}
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
            <Quote className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-black mb-2">Error Loading Quotations</h3>
            <p className="text-red-600">Failed to load quotations. Please try again.</p>
          </div>
        ) : quotations.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-sky-500 p-6 text-center">
            <Quote className="h-12 w-12 text-sky-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-black mb-2">No Quotations Found</h3>
            <p className="text-black opacity-75">
              {searchTerm || statusFilter !== 'all' || customerFilter !== 'all'
                ? 'No quotations match your search criteria.'
                : 'No quotations have been created yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {quotations.map((quotation) => (
              <div key={quotation._id} className="bg-white rounded-xl border-2 border-sky-500 p-6 hover:border-black transition-colors">
                {/* Quotation Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-black truncate">
                      {quotation.quotationNumber}
                    </h3>
                    <p className="text-sm text-sky-600 font-medium">
                      {quotation.customer?.customerName || 'N/A'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(quotation.status)}
                    <span className={getStatusBadge(quotation.status)}>
                      {quotation.status}
                    </span>
                  </div>
                </div>

                {/* Quotation Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-black opacity-75">Amount</span>
                    <span className="font-bold text-black">
                      {formatCurrency(quotation.totalAmount)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-black opacity-75">Valid Until</span>
                    <span className="font-medium text-black">
                      {quotation.validUntil ? formatDate(quotation.validUntil) : 'N/A'}
                    </span>
                  </div>

                  {quotation.validUntil && quotation.status === 'sent' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-black opacity-75">Days Left</span>
                      <span className={clsx(
                        "font-medium",
                        getDaysUntilExpiry(quotation.validUntil) <= 3 ? "text-red-600" : "text-green-600"
                      )}>
                        {getDaysUntilExpiry(quotation.validUntil)} days
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-black opacity-75">Items</span>
                    <span className="font-medium text-black">
                      {quotation.items?.length || 0}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-sky-200">
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-sky-500 hover:text-black hover:bg-sky-50 rounded-lg transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                      <Send className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors">
                      <Copy className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-sky-500 hover:text-black hover:bg-sky-50 rounded-lg transition-colors">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center text-xs text-black opacity-60">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>
                      {formatDate(quotation.createdAt)}
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
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} quotations
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
