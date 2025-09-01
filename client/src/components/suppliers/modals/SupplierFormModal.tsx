import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import {
  X,
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  Package,
  Clock,
  Star,
  Shield,
  FileText,
  Loader2,
  Plus,
  Trash2,
  Briefcase,
  DollarSign
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  Supplier, 
  useCreateSupplierMutation, 
  useUpdateGeneralSupplierMutation 
} from '@/lib/api/suppliersApi'
import { useAuth } from '@/components/auth/AuthProvider'
import { clsx } from 'clsx'

interface SupplierFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  supplier?: Supplier | null
  spareId?: string
}

interface FormData {
  supplierName: string
  displayName: string
  supplierCode: string
  partNumber: string
  isPrimary: boolean
  leadTime: number
  minOrderQuantity: number
  qualityRating: number
  warrantyPeriod: number
  contactPerson: string
  email: string
  phone: string
  website: string
  address: string
  status: 'active' | 'inactive' | 'blacklisted' | 'pending'
  
  // Contact Information
  contactInfo: {
    primaryEmail: string
    alternateEmail: string
    primaryPhone: string
    alternatePhone: string
  }
  
  // Business Information
  businessInfo: {
    industry: string
    businessType: string
  }
  
  // Registration Details
  registrationDetails: {
    pan: string
    gstin: string
  }
  
  // Financial Information
  financialInfo: {
    paymentTerms: string
    creditDays: number
  }
  
  // Relationship Information
  relationship: {
    supplierCategory: string
    supplierType: string
    supplierSince: string
    priority: 'low' | 'medium' | 'high'
    strategicPartner: boolean
  }
  
  notes: string
}

const initialFormData: FormData = {
  supplierName: '',
  displayName: '',
  supplierCode: '',
  partNumber: '',
  isPrimary: false,
  leadTime: 0,
  minOrderQuantity: 1,
  qualityRating: 3,
  warrantyPeriod: 12,
  contactPerson: '',
  email: '',
  phone: '',
  website: '',
  address: '',
  status: 'active',
  
  contactInfo: {
    primaryEmail: '',
    alternateEmail: '',
    primaryPhone: '',
    alternatePhone: ''
  },
  
  businessInfo: {
    industry: '',
    businessType: ''
  },
  
  registrationDetails: {
    pan: '',
    gstin: ''
  },
  
  financialInfo: {
    paymentTerms: '',
    creditDays: 30
  },
  
  relationship: {
    supplierCategory: '',
    supplierType: 'trader',
    supplierSince: new Date().toISOString().split('T')[0],
    priority: 'medium',
    strategicPartner: false
  },
  
  notes: ''
}

export const SupplierFormModal: React.FC<SupplierFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  supplier,
  spareId
}) => {
  const { user } = useAuth()
  const isEditing = !!supplier
  
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState('basic')
  
  const [createSupplier, { isLoading: isCreating }] = useCreateSupplierMutation()
  const [updateSupplier, { isLoading: isUpdating }] = useUpdateGeneralSupplierMutation()
  
  const isLoading = isCreating || isUpdating

  // Auto-generate supplier code
  const generateSupplierCode = () => {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.random().toString(36).substring(2, 5).toUpperCase()
    return `SUP-${timestamp}-${random}`
  }

  // Auto-generate supplier ID
  const generateSupplierId = () => {
    const timestamp = Date.now().toString().slice(-8)
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `SUPPLIER-${timestamp}-${random}`
  }

  // Auto-generate part number
  const generatePartNumber = () => {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.random().toString(36).substring(2, 4).toUpperCase()
    return `PART-${timestamp}-${random}`
  }

  // Initialize form data when editing
  useEffect(() => {
    if (supplier && isEditing) {
      setFormData({
        supplierName: supplier.supplierName || '',
        displayName: supplier.displayName || '',
        supplierCode: supplier.supplierCode || '',
        partNumber: supplier.partNumber || '',
        isPrimary: supplier.isPrimary || false,
        leadTime: supplier.leadTime || 0,
        minOrderQuantity: supplier.minOrderQuantity || 1,
        qualityRating: supplier.qualityRating || 3,
        warrantyPeriod: supplier.warrantyPeriod || 12,
        contactPerson: supplier.contactPerson || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        website: supplier.website || '',
        address: supplier.address || '',
        status: supplier.status || 'active',
        
        contactInfo: {
          primaryEmail: supplier.contactInfo?.primaryEmail || '',
          alternateEmail: supplier.contactInfo?.alternateEmail || '',
          primaryPhone: supplier.contactInfo?.primaryPhone || '',
          alternatePhone: supplier.contactInfo?.alternatePhone || ''
        },
        
        businessInfo: {
          industry: supplier.businessInfo?.industry || '',
          businessType: supplier.businessInfo?.businessType || ''
        },
        
        registrationDetails: {
          pan: supplier.registrationDetails?.pan || '',
          gstin: supplier.registrationDetails?.gstin || ''
        },
        
        financialInfo: {
          paymentTerms: supplier.financialInfo?.paymentTerms || '',
          creditDays: supplier.financialInfo?.creditDays || 30
        },
        
        relationship: {
          supplierCategory: supplier.relationship?.supplierCategory || '',
          supplierType: supplier.relationship?.supplierType || 'trader',
          supplierSince: supplier.relationship?.supplierSince ? 
            new Date(supplier.relationship.supplierSince).toISOString().split('T')[0] : 
            new Date().toISOString().split('T')[0],
          priority: supplier.relationship?.priority || 'medium',
          strategicPartner: supplier.relationship?.strategicPartner || false
        },
        
        notes: supplier.notes || ''
      })
    } else {
      setFormData(initialFormData)
    }
  }, [supplier, isEditing])

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
    // Clear errors for updated fields
    setErrors(prev => {
      const newErrors = { ...prev }
      Object.keys(updates).forEach(key => {
        delete newErrors[key]
      })
      return newErrors
    })
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.supplierName.trim()) {
      newErrors.supplierName = 'Supplier name is required'
    }

    if (!formData.supplierCode.trim()) {
      newErrors.supplierCode = 'Supplier code is required'
    }

    if (!formData.partNumber.trim()) {
      newErrors.partNumber = 'Part number is required'
    }

    if (formData.leadTime < 0) {
      newErrors.leadTime = 'Lead time must be positive'
    }

    if (formData.minOrderQuantity < 1) {
      newErrors.minOrderQuantity = 'Minimum order quantity must be at least 1'
    }

    if (formData.qualityRating < 1 || formData.qualityRating > 5) {
      newErrors.qualityRating = 'Quality rating must be between 1 and 5'
    }

    if (formData.contactInfo.primaryEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactInfo.primaryEmail)) {
      newErrors.primaryEmail = 'Invalid email format'
    }

    if (formData.contactInfo.primaryPhone && !/^[\d\s\-\+\(\)]+$/.test(formData.contactInfo.primaryPhone)) {
      newErrors.primaryPhone = 'Invalid phone format'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    try {
      const supplierData = {
        supplierId: generateSupplierId(),
        supplierName: formData.supplierName,
        displayName: formData.displayName,
        supplierCode: formData.supplierCode || generateSupplierCode(),
        partNumber: formData.partNumber || generatePartNumber(),
        isPrimary: formData.isPrimary,
        leadTime: formData.leadTime,
        minOrderQuantity: formData.minOrderQuantity,
        qualityRating: formData.qualityRating,
        warrantyPeriod: formData.warrantyPeriod,
        contactPerson: formData.contactPerson,
        email: formData.contactInfo.primaryEmail,
        phone: formData.contactInfo.primaryPhone,
        website: formData.website,
        address: formData.address,
        status: formData.status,
        
        contactInfo: formData.contactInfo,
        businessInfo: formData.businessInfo,
        registrationDetails: formData.registrationDetails,
        financialInfo: formData.financialInfo,
        relationship: formData.relationship,
        
        notes: formData.notes,
        
        // Performance metrics initialization
        performanceMetrics: {
          onTimeDeliveryRate: 0,
          qualityRejectionRate: 0,
          averageLeadTime: formData.leadTime,
          totalOrders: 0,
          totalOrderValue: 0,
          averageOrderValue: 0
        },
        
        // Initialize pricing history
        pricingHistory: []
      }

      if (isEditing && supplier?._id) {
        await updateSupplier({ id: supplier._id, data: supplierData }).unwrap()
        toast.success('Supplier updated successfully')
      } else {
        await createSupplier(supplierData).unwrap()
        toast.success('Supplier created successfully')
      }

      onSuccess()
      onClose()
      setFormData(initialFormData)
      setErrors({})
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to save supplier')
    }
  }

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Building2 },
    { id: 'contact', label: 'Contact', icon: User },
    { id: 'business', label: 'Business', icon: Briefcase },
    { id: 'financial', label: 'Financial', icon: DollarSign },
    { id: 'relationship', label: 'Relationship', icon: Shield }
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Edit Supplier' : 'Add New Supplier'}
            </h2>
            <p className="text-gray-600">
              {isEditing ? 'Update supplier information' : 'Create a new supplier record'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-1 p-4">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    'flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Supplier Name *
                  </label>
                  <Input
                    value={formData.supplierName}
                    onChange={(e) => updateFormData({ supplierName: e.target.value })}
                    placeholder="Enter supplier name"
                    className={errors.supplierName ? 'border-red-300 bg-red-50' : ''}
                  />
                  {errors.supplierName && (
                    <p className="text-red-500 text-sm mt-1">{errors.supplierName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Display Name
                  </label>
                  <Input
                    value={formData.displayName}
                    onChange={(e) => updateFormData({ displayName: e.target.value })}
                    placeholder="Enter display name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Supplier Code *
                  </label>
                  <Input
                    value={formData.supplierCode}
                    onChange={(e) => updateFormData({ supplierCode: e.target.value })}
                    placeholder="Enter supplier code"
                    className={errors.supplierCode ? 'border-red-300 bg-red-50' : ''}
                  />
                  {errors.supplierCode && (
                    <p className="text-red-500 text-sm mt-1">{errors.supplierCode}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Part Number *
                  </label>
                  <Input
                    value={formData.partNumber}
                    onChange={(e) => updateFormData({ partNumber: e.target.value })}
                    placeholder="Enter part number"
                    className={errors.partNumber ? 'border-red-300 bg-red-50' : ''}
                  />
                  {errors.partNumber && (
                    <p className="text-red-500 text-sm mt-1">{errors.partNumber}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Lead Time (days) *
                  </label>
                  <Input
                    type="number"
                    value={formData.leadTime}
                    onChange={(e) => updateFormData({ leadTime: parseInt(e.target.value) || 0 })}
                    placeholder="Enter lead time"
                    className={errors.leadTime ? 'border-red-300 bg-red-50' : ''}
                  />
                  {errors.leadTime && (
                    <p className="text-red-500 text-sm mt-1">{errors.leadTime}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Min Order Quantity *
                  </label>
                  <Input
                    type="number"
                    value={formData.minOrderQuantity}
                    onChange={(e) => updateFormData({ minOrderQuantity: parseInt(e.target.value) || 1 })}
                    placeholder="Enter min order qty"
                    className={errors.minOrderQuantity ? 'border-red-300 bg-red-50' : ''}
                  />
                  {errors.minOrderQuantity && (
                    <p className="text-red-500 text-sm mt-1">{errors.minOrderQuantity}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Quality Rating *
                  </label>
                  <select
                    value={formData.qualityRating}
                    onChange={(e) => updateFormData({ qualityRating: parseInt(e.target.value) })}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      errors.qualityRating ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                  >
                    <option value={1}>1 Star</option>
                    <option value={2}>2 Stars</option>
                    <option value={3}>3 Stars</option>
                    <option value={4}>4 Stars</option>
                    <option value={5}>5 Stars</option>
                  </select>
                  {errors.qualityRating && (
                    <p className="text-red-500 text-sm mt-1">{errors.qualityRating}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Warranty Period (months)
                  </label>
                  <Input
                    type="number"
                    value={formData.warrantyPeriod}
                    onChange={(e) => updateFormData({ warrantyPeriod: parseInt(e.target.value) || 0 })}
                    placeholder="Enter warranty period"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => updateFormData({ status: e.target.value as any })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                    <option value="blacklisted">Blacklisted</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={formData.isPrimary}
                  onChange={(e) => updateFormData({ isPrimary: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isPrimary" className="ml-2 text-sm text-gray-700">
                  This is the primary supplier
                </label>
              </div>
            </div>
          )}

          {/* Contact Information Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Primary Email
                  </label>
                  <Input
                    type="email"
                    value={formData.contactInfo.primaryEmail}
                    onChange={(e) => updateFormData({ 
                      contactInfo: { ...formData.contactInfo, primaryEmail: e.target.value }
                    })}
                    placeholder="Enter primary email"
                    className={errors.primaryEmail ? 'border-red-300 bg-red-50' : ''}
                  />
                  {errors.primaryEmail && (
                    <p className="text-red-500 text-sm mt-1">{errors.primaryEmail}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Alternate Email
                  </label>
                  <Input
                    type="email"
                    value={formData.contactInfo.alternateEmail}
                    onChange={(e) => updateFormData({ 
                      contactInfo: { ...formData.contactInfo, alternateEmail: e.target.value }
                    })}
                    placeholder="Enter alternate email"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Primary Phone
                  </label>
                  <Input
                    value={formData.contactInfo.primaryPhone}
                    onChange={(e) => updateFormData({ 
                      contactInfo: { ...formData.contactInfo, primaryPhone: e.target.value }
                    })}
                    placeholder="Enter primary phone"
                    className={errors.primaryPhone ? 'border-red-300 bg-red-50' : ''}
                  />
                  {errors.primaryPhone && (
                    <p className="text-red-500 text-sm mt-1">{errors.primaryPhone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Alternate Phone
                  </label>
                  <Input
                    value={formData.contactInfo.alternatePhone}
                    onChange={(e) => updateFormData({ 
                      contactInfo: { ...formData.contactInfo, alternatePhone: e.target.value }
                    })}
                    placeholder="Enter alternate phone"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Website
                </label>
                <Input
                  value={formData.website}
                  onChange={(e) => updateFormData({ website: e.target.value })}
                  placeholder="Enter website URL"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => updateFormData({ address: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                  placeholder="Enter complete address"
                />
              </div>
            </div>
          )}

          {/* Business Information Tab */}
          {activeTab === 'business' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Industry
                  </label>
                  <Input
                    value={formData.businessInfo.industry}
                    onChange={(e) => updateFormData({ 
                      businessInfo: { ...formData.businessInfo, industry: e.target.value }
                    })}
                    placeholder="Enter industry"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Business Type
                  </label>
                  <Input
                    value={formData.businessInfo.businessType}
                    onChange={(e) => updateFormData({ 
                      businessInfo: { ...formData.businessInfo, businessType: e.target.value }
                    })}
                    placeholder="Enter business type"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    PAN Number
                  </label>
                  <Input
                    value={formData.registrationDetails.pan}
                    onChange={(e) => updateFormData({ 
                      registrationDetails: { ...formData.registrationDetails, pan: e.target.value }
                    })}
                    placeholder="Enter PAN number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    GSTIN
                  </label>
                  <Input
                    value={formData.registrationDetails.gstin}
                    onChange={(e) => updateFormData({ 
                      registrationDetails: { ...formData.registrationDetails, gstin: e.target.value }
                    })}
                    placeholder="Enter GSTIN"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Financial Information Tab */}
          {activeTab === 'financial' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Payment Terms
                  </label>
                  <Input
                    value={formData.financialInfo.paymentTerms}
                    onChange={(e) => updateFormData({ 
                      financialInfo: { ...formData.financialInfo, paymentTerms: e.target.value }
                    })}
                    placeholder="e.g., Net 30 days"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Credit Days
                  </label>
                  <Input
                    type="number"
                    value={formData.financialInfo.creditDays}
                    onChange={(e) => updateFormData({ 
                      financialInfo: { ...formData.financialInfo, creditDays: parseInt(e.target.value) || 0 }
                    })}
                    placeholder="Enter credit days"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Relationship Information Tab */}
          {activeTab === 'relationship' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Supplier Category
                  </label>
                  <Input
                    value={formData.relationship.supplierCategory}
                    onChange={(e) => updateFormData({ 
                      relationship: { ...formData.relationship, supplierCategory: e.target.value }
                    })}
                    placeholder="Enter supplier category"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Supplier Type
                  </label>
                  <select
                    value={formData.relationship.supplierType}
                    onChange={(e) => updateFormData({ 
                      relationship: { ...formData.relationship, supplierType: e.target.value }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                  >
                    <option value="trader">Trader</option>
                    <option value="manufacturer">Manufacturer</option>
                    <option value="distributor">Distributor</option>
                    <option value="wholesaler">Wholesaler</option>
                    <option value="retailer">Retailer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Supplier Since
                  </label>
                  <Input
                    type="date"
                    value={formData.relationship.supplierSince}
                    onChange={(e) => updateFormData({ 
                      relationship: { ...formData.relationship, supplierSince: e.target.value }
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.relationship.priority}
                    onChange={(e) => updateFormData({ 
                      relationship: { ...formData.relationship, priority: e.target.value as any }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="strategicPartner"
                  checked={formData.relationship.strategicPartner}
                  onChange={(e) => updateFormData({ 
                    relationship: { ...formData.relationship, strategicPartner: e.target.checked }
                  })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="strategicPartner" className="ml-2 text-sm text-gray-700">
                  Strategic Partner
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => updateFormData({ notes: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                  placeholder="Enter additional notes about the supplier"
                />
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEditing ? 'Update Supplier' : 'Create Supplier'}
          </Button>
        </div>
      </div>
    </div>
  )
}
