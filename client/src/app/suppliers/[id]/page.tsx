'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft,
  Edit,
  Phone,
  Mail,
  MapPin,
  Building,
  DollarSign,
  Package,
  Star,
  Clock,
  Shield,
  AlertCircle,
  CheckCircle,
  Loader2,
  Factory,
  Briefcase,
  Settings,
  Calendar,
  TrendingUp,
  Users,
  FileText,
  Globe,
  Truck,
  Award,
  Activity,
  Eye,
  Zap,
  Target,
  BarChart3,
  CreditCard,
  Heart,
  Award as Trophy,
  Clock as TimeIcon,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Minus,
  Plus,
  ExternalLink,
  Download,
  Share2,
  Bookmark,
  MoreHorizontal
} from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { useGetSupplierByIdQuery } from '@/lib/api/suppliersApi'
import { SupplierFormModal } from '@/components/suppliers/modals/SupplierFormModal'
import clsx from 'clsx'

export default function SupplierDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const supplierId = params.id as string

  const [showSupplierForm, setShowSupplierForm] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('overview')

  const {
    data: supplierData,
    isLoading,
    error,
    refetch
  } = useGetSupplierByIdQuery(supplierId, {
    skip: !supplierId
  })

  const supplier = supplierData?.data

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
        return 'bg-gradient-to-r from-green-500 to-emerald-500'
      case 'inactive':
        return 'bg-gradient-to-r from-gray-500 to-slate-500'
      case 'blacklisted':
        return 'bg-gradient-to-r from-red-500 to-pink-500'
      case 'pending':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500'
      default:
        return 'bg-gradient-to-r from-gray-500 to-slate-500'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'approved':
        return 'bg-gradient-to-r from-blue-500 to-indigo-500'
      case 'preferred':
        return 'bg-gradient-to-r from-purple-500 to-violet-500'
      case 'strategic':
        return 'bg-gradient-to-r from-indigo-500 to-purple-500'
      case 'conditional':
        return 'bg-gradient-to-r from-orange-500 to-red-500'
      default:
        return 'bg-gradient-to-r from-gray-500 to-slate-500'
    }
  }

  const getIndustryIcon = (industry: string) => {
    switch (industry?.toLowerCase()) {
      case 'automotive':
        return <Truck className="h-6 w-6 text-blue-600" />
      case 'manufacturing':
        return <Factory className="h-6 w-6 text-gray-600" />
      case 'electronics':
        return <Settings className="h-6 w-6 text-purple-600" />
      case 'food processing':
        return <Package className="h-6 w-6 text-green-600" />
      default:
        return <Building className="h-6 w-6 text-gray-600" />
    }
  }

  const getPerformanceColor = (value: number, type: 'positive' | 'negative') => {
    if (type === 'positive') {
      if (value >= 80) return 'text-green-600'
      if (value >= 60) return 'text-yellow-600'
      return 'text-red-600'
    } else {
      if (value <= 20) return 'text-green-600'
      if (value <= 40) return 'text-yellow-600'
      return 'text-red-600'
    }
  }

  const handleEditSupplier = () => {
    setEditingSupplier(supplier)
    setShowSupplierForm(true)
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Eye },
    { id: 'performance', name: 'Performance', icon: BarChart3 },
    { id: 'financial', name: 'Financial', icon: DollarSign },
    { id: 'compliance', name: 'Compliance', icon: Shield },
    { id: 'activity', name: 'Activity', icon: Activity }
  ]

  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Building className="h-8 w-8 text-white" />
              </div>
              <div className="absolute inset-0 h-16 w-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-ping opacity-20"></div>
            </div>
            <p className="text-gray-600 text-lg font-medium">Loading supplier details...</p>
            <p className="text-gray-500 text-sm mt-2">Please wait while we fetch the information</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (error || !supplier) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="h-20 w-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Supplier Not Found</h3>
            <p className="text-gray-600 mb-6">
              The supplier you're looking for doesn't exist or has been removed.
            </p>
            <Button
              onClick={() => router.push('/suppliers')}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Suppliers
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Hero Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-black/10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          <div className="relative px-6 py-8">
            <div className="max-w-7xl mx-auto">
              {/* Navigation */}
              <div className="flex items-center justify-between mb-8">
                <Button
                  onClick={() => router.push('/suppliers')}
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/30 px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Suppliers
                </Button>
                
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleEditSupplier}
                    className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Supplier
                  </Button>
                  
                  <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 p-2 rounded-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Supplier Info */}
              <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/20 rounded-3xl blur-xl"></div>
                  <div className="relative h-24 w-24 bg-white/20 backdrop-blur-sm rounded-3xl border border-white/30 flex items-center justify-center">
                    <span className="text-white font-bold text-3xl">
                      {supplier.supplierName?.charAt(0)?.toUpperCase() || 'S'}
                    </span>
                  </div>
                </div>
                
                <div className="flex-1">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent drop-shadow-lg mb-2">
                    {supplier.supplierName}
                  </h1>
                  <p className="text-blue-100 text-xl font-medium mb-3">
                    {supplier.supplierCode} • {supplier.relationship?.supplierType || 'General'}
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <span className={clsx(
                      'px-4 py-2 rounded-full text-sm font-medium text-white shadow-lg',
                      getStatusColor(supplier.isActive ? 'active' : 'inactive')
                    )}>
                      {supplier.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                    <span className={clsx(
                      'px-4 py-2 rounded-full text-sm font-medium text-white shadow-lg',
                      getCategoryColor(supplier.relationship?.supplierCategory || '')
                    )}>
                      {supplier.relationship?.supplierCategory?.toUpperCase() || 'N/A'}
                    </span>
                    <div className="flex items-center gap-1 px-3 py-2 bg-white/20 rounded-full backdrop-blur-sm">
                      <Star className="h-4 w-4 text-yellow-300 fill-current" />
                      <span className="text-white font-medium">{supplier.quality?.qualityRating || 0}/5</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white/80 text-sm">Total Orders</p>
                      <p className="text-white text-xl font-bold">{supplier.supplyHistory?.totalOrders || 0}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white/80 text-sm">Total Spend</p>
                      <p className="text-white text-xl font-bold">
                        {formatCurrency(supplier.supplyHistory?.totalOrderValue || 0)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white/80 text-sm">Lead Time</p>
                      <p className="text-white text-xl font-bold">{supplier.supplyHistory?.averageLeadTime || 0} days</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white/80 text-sm">On-time Delivery</p>
                      <p className="text-white text-xl font-bold">{supplier.supplyHistory?.onTimeDeliveryRate || 0}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-2 mb-8">
            <div className="flex space-x-2 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    "flex items-center px-6 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 transform hover:scale-105",
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Contact Information */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Contact Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <Mail className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Primary Email</p>
                        <p className="font-medium text-gray-900">{supplier.contactInfo?.primaryEmail || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <Phone className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Primary Phone</p>
                        <p className="font-medium text-gray-900">{supplier.contactInfo?.primaryPhone || 'N/A'}</p>
                      </div>
                    </div>
                    {supplier.contactInfo?.alternateEmail && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <Mail className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-600">Alternate Email</p>
                          <p className="font-medium text-gray-900">{supplier.contactInfo.alternateEmail}</p>
                        </div>
                      </div>
                    )}
                    {supplier.contactInfo?.alternatePhone && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <Phone className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm text-gray-600">Alternate Phone</p>
                          <p className="font-medium text-gray-900">{supplier.contactInfo.alternatePhone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Business Information */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Building className="h-5 w-5 text-blue-600" />
                    Business Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      {getIndustryIcon(supplier.businessInfo?.industry || '')}
                      <div>
                        <p className="text-sm text-gray-600">Industry</p>
                        <p className="font-medium text-gray-900">{supplier.businessInfo?.industry || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-600">Business Type</p>
                      <p className="font-medium text-gray-900">{supplier.businessInfo?.businessType || 'N/A'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-600">GSTIN</p>
                      <p className="font-medium text-gray-900">{supplier.registrationDetails?.gstin || 'N/A'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-600">PAN</p>
                      <p className="font-medium text-gray-900">{supplier.registrationDetails?.pan || 'N/A'}</p>
                    </div>
                    {supplier.businessInfo?.website && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <Globe className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-600">Website</p>
                          <a 
                            href={supplier.businessInfo.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 hover:underline flex items-center gap-1"
                          >
                            {supplier.businessInfo.website}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Address Information */}
                {supplier.addresses && supplier.addresses.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      Address Information
                    </h2>
                    <div className="space-y-4">
                      {supplier.addresses.map((address: any, index: number) => (
                        <div key={index} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium text-gray-900">{address.type} Address</h3>
                            {address.isPrimary && (
                              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                                Primary
                              </span>
                            )}
                          </div>
                          <div className="space-y-1 text-gray-700">
                            <p>{address.addressLine1}</p>
                            {address.addressLine2 && <p>{address.addressLine2}</p>}
                            <p>{address.city}, {address.state} {address.pincode}</p>
                            <p>{address.country}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Performance Metrics */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Performance Metrics
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-600">On-time Delivery</span>
                      </div>
                      <span className={clsx("font-bold text-lg", getPerformanceColor(supplier.supplyHistory?.onTimeDeliveryRate || 0, 'positive'))}>
                        {supplier.supplyHistory?.onTimeDeliveryRate || 0}%
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-gray-600">Quality Rating</span>
                      </div>
                      <span className={clsx("font-bold text-lg", getPerformanceColor(supplier.quality?.qualityRating || 0, 'positive'))}>
                        {supplier.quality?.qualityRating || 0}%
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm text-gray-600">Rejection Rate</span>
                      </div>
                      <span className={clsx("font-bold text-lg", getPerformanceColor(supplier.supplyHistory?.qualityRejectionRate || 0, 'negative'))}>
                        {supplier.supplyHistory?.qualityRejectionRate || 0}%
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <TimeIcon className="h-4 w-4 text-purple-600" />
                        <span className="text-sm text-gray-600">Avg Lead Time</span>
                      </div>
                      <span className="font-bold text-lg text-purple-600">
                        {supplier.supplyHistory?.averageLeadTime || 0} days
                      </span>
                    </div>
                  </div>
                </div>

                {/* Financial Information */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    Financial Information
                  </h2>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm text-gray-600">Payment Terms</span>
                      <span className="font-medium text-gray-900">{supplier.financialInfo?.paymentTerms || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm text-gray-600">Credit Days</span>
                      <span className="font-medium text-gray-900">{supplier.financialInfo?.creditDays || 0} days</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm text-gray-600">Total Purchases</span>
                      <span className="font-medium text-gray-900">{formatCurrency(supplier.financialInfo?.totalPurchases || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm text-gray-600">Outstanding</span>
                      <span className="font-medium text-red-600">{formatCurrency(supplier.financialInfo?.outstandingPayable || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm text-gray-600">Currency</span>
                      <span className="font-medium text-gray-900">{supplier.financialInfo?.currency || 'INR'}</span>
                    </div>
                  </div>
                </div>

                {/* Relationship Details */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    Relationship Details
                  </h2>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm text-gray-600">Type</span>
                      <span className="font-medium text-gray-900">{supplier.relationship?.supplierType || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm text-gray-600">Category</span>
                      <span className="font-medium text-gray-900">{supplier.relationship?.supplierCategory || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm text-gray-600">Priority</span>
                      <span className={clsx(
                        'font-medium px-2 py-1 rounded-full text-xs',
                        supplier.relationship?.priority === 'high' ? 'bg-red-100 text-red-800' :
                        supplier.relationship?.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      )}>
                        {supplier.relationship?.priority || 'Low'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm text-gray-600">Since</span>
                      <span className="font-medium text-gray-900">{formatDate(supplier.relationship?.supplierSince || null)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm text-gray-600">Strategic Partner</span>
                      <span className="font-medium text-gray-900">{supplier.relationship?.strategicPartner ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm text-gray-600">Exclusive</span>
                      <span className="font-medium text-gray-900">{supplier.relationship?.exclusiveSupplier ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Performance Analytics</h2>
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Performance Analytics Coming Soon</h3>
                <p className="text-gray-600">Detailed performance charts and analytics will be available here.</p>
              </div>
            </div>
          )}

          {activeTab === 'financial' && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Financial Details</h2>
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Financial Reports Coming Soon</h3>
                <p className="text-gray-600">Detailed financial reports and analysis will be available here.</p>
              </div>
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Compliance & Risk</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-600">Approval Status</span>
                    <span className="font-medium text-gray-900">{supplier.compliance?.vendorApprovalStatus || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-600">Risk Category</span>
                    <span className="font-medium text-gray-900">{supplier.compliance?.riskCategory || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-600">Blacklisted</span>
                    <span className="font-medium text-gray-900">{supplier.compliance?.blacklisted ? 'Yes' : 'No'}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-600">Environmental</span>
                    <span className="font-medium text-gray-900">{supplier.compliance?.environmentalCompliance ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-600">Labor</span>
                    <span className="font-medium text-gray-900">{supplier.compliance?.laborCompliance ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-600">Safety</span>
                    <span className="font-medium text-gray-900">{supplier.compliance?.safetyCompliance ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">Last Order Date</span>
                  <span className="font-medium text-gray-900">{formatDate(supplier.supplyHistory?.lastOrderDate || null)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">First Order Date</span>
                  <span className="font-medium text-gray-900">{formatDate(supplier.supplyHistory?.firstOrderDate || null)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">Created</span>
                  <span className="font-medium text-gray-900">{formatDate(supplier.createdAt || null)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="font-medium text-gray-900">{formatDate(supplier.updatedAt || null)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Supplier Form Modal */}
      {showSupplierForm && (
        <SupplierFormModal
          isOpen={showSupplierForm}
          onClose={() => {
            setShowSupplierForm(false)
            setEditingSupplier(null)
          }}
          supplier={editingSupplier}
          onSuccess={() => {
            setShowSupplierForm(false)
            setEditingSupplier(null)
            refetch()
          }}
        />
      )}
    </AppLayout>
  )
}
