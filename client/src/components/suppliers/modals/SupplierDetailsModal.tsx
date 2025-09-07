'use client'

import { useState } from 'react'
import {
  X,
  Phone,
  Mail,
  MapPin,
  Building,
  DollarSign,
  Package,
  Star,
  Clock,
  Shield,
  CheckCircle,
  Factory,
  Briefcase,
  Settings,
  Globe,
  Truck,
  Activity
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import clsx from 'clsx'

interface SupplierDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  supplier: any
  onEdit?: () => void
}

export function SupplierDetailsModal({ isOpen, onClose, supplier, onEdit }: SupplierDetailsModalProps) {
  if (!isOpen || !supplier) return null

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
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'blacklisted':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'approved':
        return 'bg-blue-100 text-blue-800'
      case 'preferred':
        return 'bg-purple-100 text-purple-800'
      case 'strategic':
        return 'bg-indigo-100 text-indigo-800'
      case 'conditional':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {supplier.supplierName?.charAt(0)?.toUpperCase() || 'S'}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{supplier.supplierName}</h2>
                  <p className="text-sky-100">{supplier.supplierCode}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {onEdit && (
                  <Button
                    onClick={onEdit}
                    className="bg-white/20 hover:bg-white/30 text-white border border-white/30 px-4 py-2 rounded-xl font-medium transition-all duration-200"
                  >
                    Edit
                  </Button>
                )}
                <Button
                  onClick={onClose}
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/30 p-2 rounded-xl transition-all duration-200"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Status & Category */}
                <div className="flex items-center gap-2">
                  <span className={clsx(
                    'px-3 py-1 rounded-full text-sm font-medium',
                    getStatusColor(supplier.isActive ? 'active' : 'inactive')
                  )}>
                    {supplier.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                  <span className={clsx(
                    'px-3 py-1 rounded-full text-sm font-medium',
                    getCategoryColor(supplier.relationship?.supplierCategory)
                  )}>
                    {supplier.relationship?.supplierCategory?.toUpperCase()}
                  </span>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Mail className="h-5 w-5 text-sky-600" />
                    Contact Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{supplier.contactInfo?.primaryEmail || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{supplier.contactInfo?.primaryPhone || 'N/A'}</span>
                    </div>
                    {supplier.addresses?.[0] && (
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {supplier.addresses[0].city}, {supplier.addresses[0].state}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Business Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Building className="h-5 w-5 text-sky-600" />
                    Business Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {getIndustryIcon(supplier.businessInfo?.industry)}
                      <span className="text-sm text-gray-600">{supplier.businessInfo?.industry || 'N/A'}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Type:</span> {supplier.businessInfo?.businessType || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">GSTIN:</span> {supplier.registrationDetails?.gstin || 'N/A'}
                    </div>
                    {supplier.businessInfo?.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <a 
                          href={supplier.businessInfo.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {supplier.businessInfo.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-sky-50 rounded-lg p-3 text-center">
                    <Package className="h-5 w-5 text-sky-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-gray-900">{supplier.supplyHistory?.totalOrders || 0}</p>
                    <p className="text-xs text-gray-600">Orders</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <DollarSign className="h-5 w-5 text-green-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(supplier.supplyHistory?.totalOrderValue || 0)}
                    </p>
                    <p className="text-xs text-gray-600">Total Spend</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <Clock className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-gray-900">{supplier.supplyHistory?.averageLeadTime || 0}</p>
                    <p className="text-xs text-gray-600">Lead Time</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3 text-center">
                    <Star className="h-5 w-5 text-orange-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-gray-900">{supplier.quality?.qualityRating || 0}%</p>
                    <p className="text-xs text-gray-600">Quality</p>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-sky-600" />
                    Performance
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">On-time Delivery</span>
                      <span className="font-medium text-green-600">{supplier.supplyHistory?.onTimeDeliveryRate || 0}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Quality Rating</span>
                      <span className="font-medium text-blue-600">{supplier.quality?.qualityRating || 0}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Rejection Rate</span>
                      <span className="font-medium text-red-600">{supplier.supplyHistory?.qualityRejectionRate || 0}%</span>
                    </div>
                  </div>
                </div>

                {/* Financial Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-sky-600" />
                    Financial
                  </h3>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Payment Terms:</span> {supplier.financialInfo?.paymentTerms || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Credit Days:</span> {supplier.financialInfo?.creditDays || 0} days
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Outstanding:</span> {formatCurrency(supplier.financialInfo?.outstandingPayable || 0)}
                    </div>
                  </div>
                </div>

                {/* Relationship Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-sky-600" />
                    Relationship
                  </h3>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Type:</span> {supplier.relationship?.supplierType || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Priority:</span> {supplier.relationship?.priority || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Since:</span> {formatDate(supplier.relationship?.supplierSince)}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Strategic:</span> {supplier.relationship?.strategicPartner ? 'Yes' : 'No'}
                    </div>
                  </div>
                </div>

                {/* Compliance */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-sky-600" />
                    Compliance
                  </h3>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Status:</span> {supplier.compliance?.vendorApprovalStatus || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Risk:</span> {supplier.compliance?.riskCategory || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Blacklisted:</span> {supplier.compliance?.blacklisted ? 'Yes' : 'No'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Last updated: {formatDate(supplier.updatedAt)}
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={onClose}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
