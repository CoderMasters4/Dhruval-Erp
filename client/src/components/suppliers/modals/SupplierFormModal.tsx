import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import {
  X,
  Building2,
  User,
  Phone,
  MapPin,
  Save,
  Loader2,
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Supplier, 
  useCreateSupplierMutation, 
  useUpdateGeneralSupplierMutation 
} from '@/lib/api/suppliersApi'
import { useGetAllCompaniesQuery } from '@/lib/api/authApi'
import { useSelector } from 'react-redux'
import { selectCurrentUser, selectIsSuperAdmin } from '@/lib/features/auth/authSlice'

interface SupplierFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  supplier?: Supplier | null
}

interface FormData {
  companyId: string
  supplierName: string
  supplierCode: string
  legalName: string
  displayName: string
  
  // Business Info (simplified)
  website: string
  
  // Contact Info
  primaryPhone: string
  alternatePhone: string
  primaryEmail: string
  alternateEmail: string
  whatsapp: string
  fax: string
  tollFree: string
  
  // Address
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  pincode: string
  country: string
  
  // Registration Details
  gstin: string
  pan: string
  cin: string
  udyogAadhar: string
  iecCode: string
  registrationNumber: string
  vatNumber: string
  cstNumber: string
  msmeNumber: string
  factoryLicense: string
  
  // Financial Info (simplified)
  preferredPaymentMethod: string
  currency: string
  
  // Banking Details (simplified)
  bankName: string
  ifscCode: string
  accountNumber: string
  
  // Relationship (simplified)
  supplierType: string
  supplierCategory: string
  
  // Additional
  notes: string
  tags: string[]
  isActive: boolean
}

const initialFormData: FormData = {
  companyId: '',
  supplierName: '',
  supplierCode: '',
  legalName: '',
  displayName: '',
  
  // Business Info (simplified)
  website: '',
  
  // Contact Info
  primaryPhone: '',
  alternatePhone: '',
  primaryEmail: '',
  alternateEmail: '',
  whatsapp: '',
  fax: '',
  tollFree: '',
  
  // Address
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
  
  // Registration Details
  gstin: '',
  pan: '',
  cin: '',
  udyogAadhar: '',
  iecCode: '',
  registrationNumber: '',
  vatNumber: '',
  cstNumber: '',
  msmeNumber: '',
  factoryLicense: '',
  
  // Financial Info (simplified)
  preferredPaymentMethod: 'bank_transfer',
  currency: 'INR',
  
  // Banking Details (simplified)
  bankName: '',
  ifscCode: '',
  accountNumber: '',
  
  // Relationship (simplified)
  supplierType: 'manufacturer',
  supplierCategory: 'approved',
  
  // Additional
  notes: '',
  tags: [],
  isActive: true
}


export function SupplierFormModal({ isOpen, onClose, onSuccess, supplier }: SupplierFormModalProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [activeTab, setActiveTab] = useState('basic')
  const [skippedTabs, setSkippedTabs] = useState<Set<string>>(new Set())

  // User and company info
  const user = useSelector(selectCurrentUser)
  const isSuperAdmin = useSelector(selectIsSuperAdmin)
  const userCompanyId = user?.companyAccess?.[0]?.companyId

  // API hooks
  const [createSupplier] = useCreateSupplierMutation()
  const [updateSupplier] = useUpdateGeneralSupplierMutation()
  const { data: companiesData } = useGetAllCompaniesQuery(undefined, {
    skip: !isSuperAdmin
  })

  const companies = companiesData?.data || []
  const isEditing = !!supplier

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (supplier) {
        // Edit mode - populate with existing data
        setFormData({
          companyId: userCompanyId || '',
          supplierName: supplier.supplierName || '',
          supplierCode: supplier.supplierCode || '',
          legalName: supplier.legalName || '',
          displayName: supplier.displayName || '',
          
          // Business Info (simplified)
          website: supplier.businessInfo?.website || '',
          
          // Contact Info
          primaryPhone: supplier.contactInfo?.primaryPhone || '',
          alternatePhone: supplier.contactInfo?.alternatePhone || '',
          primaryEmail: supplier.contactInfo?.primaryEmail || '',
          alternateEmail: supplier.contactInfo?.alternateEmail || '',
          whatsapp: supplier.contactInfo?.whatsapp || '',
          fax: supplier.contactInfo?.fax || '',
          tollFree: supplier.contactInfo?.tollFree || '',
          
          // Address
          addressLine1: supplier.addresses?.[0]?.addressLine1 || '',
          addressLine2: supplier.addresses?.[0]?.addressLine2 || '',
          city: supplier.addresses?.[0]?.city || '',
          state: supplier.addresses?.[0]?.state || '',
          pincode: supplier.addresses?.[0]?.pincode || '',
          country: supplier.addresses?.[0]?.country || 'India',
          
          // Registration Details
          gstin: supplier.registrationDetails?.gstin || '',
          pan: supplier.registrationDetails?.pan || '',
          cin: supplier.registrationDetails?.cin || '',
          udyogAadhar: supplier.registrationDetails?.udyogAadhar || '',
          iecCode: supplier.registrationDetails?.iecCode || '',
          registrationNumber: supplier.registrationDetails?.registrationNumber || '',
          vatNumber: supplier.registrationDetails?.vatNumber || '',
          cstNumber: supplier.registrationDetails?.cstNumber || '',
          msmeNumber: supplier.registrationDetails?.msmeNumber || '',
          factoryLicense: supplier.registrationDetails?.factoryLicense || '',
          
          // Financial Info (simplified)
          preferredPaymentMethod: supplier.financialInfo?.preferredPaymentMethod || 'bank_transfer',
          currency: supplier.financialInfo?.currency || 'INR',
          
          // Banking Details (simplified)
          bankName: supplier.bankingDetails?.bankName || '',
          ifscCode: supplier.bankingDetails?.ifscCode || '',
          accountNumber: supplier.bankingDetails?.accountNumber || '',
          
          // Relationship (simplified)
          supplierType: supplier.relationship?.supplierType || 'manufacturer',
          supplierCategory: supplier.relationship?.supplierCategory || 'approved',
          
          // Additional
          notes: supplier.notes || '',
          tags: supplier.tags || [],
          isActive: supplier.isActive !== false
        })
      } else {
        // Create mode - set defaults
        setFormData({
          ...initialFormData,
          companyId: isSuperAdmin ? '' : userCompanyId || '',
          supplierCode: `SUPP${Date.now().toString().slice(-6)}`
        })
      }
      setErrors({})
      setActiveTab('basic')
    }
  }, [isOpen, supplier, isSuperAdmin, userCompanyId])

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  // Auto-save functionality
  useEffect(() => {
    if (!isEditing || !supplier) return

    const autoSaveTimeout = setTimeout(() => {
      // Only auto-save if form has been modified and has no errors
      const hasChanges = Object.keys(formData).some(key => {
        const formValue = formData[key as keyof FormData]
        const originalValue = supplier[key as keyof Supplier]
        return formValue !== originalValue
      })

      if (hasChanges && Object.keys(errors).length === 0) {
        // Auto-save logic could be implemented here
        console.log('Auto-save triggered')
      }
    }, 3000) // Auto-save after 3 seconds of inactivity

    return () => clearTimeout(autoSaveTimeout)
  }, [formData, errors, isEditing, supplier])

  // Real-time validation
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      validateForm()
    }, 500) // Debounce validation

    return () => clearTimeout(timeoutId)
  }, [formData])

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    // Required fields validation
    if (!formData.companyId && isSuperAdmin) {
      newErrors.companyId = 'Company is required'
    }
    if (!formData.supplierName.trim()) {
      newErrors.supplierName = 'Supplier name is required'
    }
    if (!formData.supplierCode.trim()) {
      newErrors.supplierCode = 'Supplier code is required'
    }
    if (!formData.primaryPhone.trim()) {
      newErrors.primaryPhone = 'Primary phone is required'
    }
    if (!formData.primaryEmail.trim()) {
      newErrors.primaryEmail = 'Primary email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.primaryEmail)) {
      newErrors.primaryEmail = 'Invalid email format'
    }

    // Address validation - all address fields are required
    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address line 1 is required'
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required'
    }
    if (!formData.state.trim()) {
      newErrors.state = 'State is required'
    }
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required'
    }

    // GSTIN validation (if provided)
    if (formData.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstin)) {
      newErrors.gstin = 'Invalid GSTIN format'
    }

    // PAN validation (if provided)
    if (formData.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan)) {
      newErrors.pan = 'Invalid PAN format'
    }

    // Phone validation
    if (formData.primaryPhone && !/^[6-9]\d{9}$/.test(formData.primaryPhone.replace(/\D/g, ''))) {
      newErrors.primaryPhone = 'Invalid phone number format'
    }

    // Website validation (if provided)
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Website must start with http:// or https://'
    }

    // IFSC Code validation (if provided)
    if (formData.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode)) {
      newErrors.ifscCode = 'Invalid IFSC code format'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the validation errors')
      return
    }

    setIsSubmitting(true)

    try {
            const supplierData: Supplier = {
        supplierId: formData.supplierCode.trim(),
        supplierName: formData.supplierName.trim(),
        supplierCode: formData.supplierCode.trim(),
        partNumber: '', // Default empty value
        isPrimary: false, // Default value
        leadTime: 0, // Default value
        minOrderQuantity: 0, // Default value
        qualityRating: 0, // Default value
        status: 'pending', // Default status
        companyId: formData.companyId,
        legalName: formData.legalName.trim(),
        displayName: formData.displayName.trim(),
        
        // Business Info (simplified)
        businessInfo: {
          website: formData.website.trim()
        },
        
        // Contact Info
        contactInfo: {
          primaryPhone: formData.primaryPhone.trim(),
          alternatePhone: formData.alternatePhone.trim(),
          primaryEmail: formData.primaryEmail.trim(),
          alternateEmail: formData.alternateEmail.trim(),
          whatsapp: formData.whatsapp.trim(),
          fax: formData.fax.trim(),
          tollFree: formData.tollFree.trim()
        },
        
        // Address - all fields are required
        addresses: [{
          addressLine1: formData.addressLine1.trim(),
          addressLine2: formData.addressLine2.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
          country: formData.country.trim()
        }],
        
        // Registration Details
        registrationDetails: {
          gstin: formData.gstin.trim(),
          pan: formData.pan.trim(),
          cin: formData.cin.trim(),
          udyogAadhar: formData.udyogAadhar.trim(),
          iecCode: formData.iecCode.trim(),
          registrationNumber: formData.registrationNumber.trim(),
          vatNumber: formData.vatNumber.trim(),
          cstNumber: formData.cstNumber.trim(),
          msmeNumber: formData.msmeNumber.trim(),
          factoryLicense: formData.factoryLicense.trim()
        },
        
        // Financial Info (simplified)
        financialInfo: {
          preferredPaymentMethod: formData.preferredPaymentMethod,
          currency: formData.currency
        },
        
        // Banking Details (simplified)
        bankingDetails: {
          bankName: formData.bankName.trim(),
          ifscCode: formData.ifscCode.trim(),
          accountNumber: formData.accountNumber.trim()
        },
        
        // Relationship (simplified)
        relationship: {
          supplierType: formData.supplierType,
          supplierCategory: formData.supplierCategory
        },
        
        // Compliance (simplified)
        compliance: {
          vendorApprovalStatus: 'pending' as 'approved' | 'pending' | 'rejected',
          riskCategory: 'medium',
          blacklisted: false,
          blacklistReason: '',
          complianceNotes: '',
          environmentalCompliance: false,
          laborCompliance: false,
          safetyCompliance: false
        },
        
        // Performance Metrics (required)
        performanceMetrics: {
          onTimeDeliveryRate: 0,
          qualityRejectionRate: 0,
          averageLeadTime: 0,
          totalOrders: 0,
          totalOrderValue: 0,
          averageOrderValue: 0
        },
        
        // Pricing History (required)
        pricingHistory: [],
        
        // Additional
        notes: formData.notes.trim(),
        tags: formData.tags,
        isActive: formData.isActive
      }

      if (isEditing && supplier && supplier._id) {
        await updateSupplier({
          id: supplier._id,
          data: supplierData
        }).unwrap()
        toast.success('Supplier updated successfully!')
      } else {
        await createSupplier(supplierData).unwrap()
        toast.success('Supplier created successfully!')
      }

      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Error saving supplier:', error)
      toast.error(error?.data?.message || 'Failed to save supplier')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  const tabs = [
    { id: 'basic', label: 'Basic Info', shortLabel: 'Basic', icon: User, required: true },
    { id: 'contact', label: 'Contact', shortLabel: 'Contact', icon: Phone, required: true },
    { id: 'address', label: 'Address', shortLabel: 'Address', icon: MapPin, required: true },
    { id: 'registration', label: 'Registration', shortLabel: 'Reg', icon: FileText, required: false }
  ]

  // Helper functions for tab management
  const handleSkipTab = (tabId: string) => {
    setSkippedTabs(prev => new Set([...prev, tabId]))
    // Move to next non-skipped tab
    const currentIndex = tabs.findIndex(tab => tab.id === tabId)
    const nextTab = tabs.slice(currentIndex + 1).find(tab => !skippedTabs.has(tab.id))
    if (nextTab) {
      setActiveTab(nextTab.id)
    }
  }

  const handleUnskipTab = (tabId: string) => {
    setSkippedTabs(prev => {
      const newSet = new Set(prev)
      newSet.delete(tabId)
      return newSet
    })
  }

  const getTabStatus = (tabId: string) => {
    if (skippedTabs.has(tabId)) return 'skipped'
    if (tabId === activeTab) return 'active'
    return 'inactive'
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 dark:bg-black/70 flex items-center justify-center p-1 sm:p-2 md:p-4 transition-theme">
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl md:rounded-2xl shadow-xl max-w-xs sm:max-w-2xl md:max-w-4xl lg:max-w-6xl w-full max-h-[85vh] sm:max-h-[80vh] md:max-h-[75vh] overflow-hidden transition-theme flex flex-col">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between p-2 sm:p-3 md:p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 rounded-lg sm:rounded-xl flex items-center justify-center">
              <Building2 className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Supplier' : 'Create New Supplier'}
          </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
                {isEditing ? 'Update supplier information' : 'Add a new supplier to your system'}
              </p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            <X className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="px-1 sm:px-2 md:px-4">
            <nav className="flex space-x-0.5 sm:space-x-1 md:space-x-2 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const status = getTabStatus(tab.id)
                const isSkipped = skippedTabs.has(tab.id)
                
                return (
                  <div key={tab.id} className="relative flex items-center">
                  <button
                    onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1 sm:gap-2 py-2 sm:py-3 px-1 sm:px-2 md:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-all duration-200 ${
                        status === 'active'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                          : status === 'skipped'
                          ? 'border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.shortLabel}</span>
                      {!tab.required && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">*</span>
                      )}
                  </button>
                    
                    {/* Skip/Unskip button for non-required tabs */}
                    {!tab.required && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (isSkipped) {
                            handleUnskipTab(tab.id)
                          } else {
                            handleSkipTab(tab.id)
                          }
                        }}
                        className={`ml-1 p-1 rounded-full transition-colors ${
                          isSkipped 
                            ? 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20' 
                            : 'text-gray-400 dark:text-gray-500 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                        }`}
                        title={isSkipped ? 'Unskip this tab' : 'Skip this tab'}
                      >
                        {isSkipped ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                      </button>
                    )}
                  </div>
                )
              })}
            </nav>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6">
            {/* Progress Indicator */}
            <div className="mb-3 sm:mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Form Progress</span>
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {Object.keys(formData).filter(key => formData[key as keyof FormData]).length} / {Object.keys(formData).length} fields
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2">
                <div 
                  className="bg-blue-600 dark:bg-blue-500 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(Object.keys(formData).filter(key => formData[key as keyof FormData]).length / Object.keys(formData).length) * 100}%` 
                  }}
                ></div>
              </div>
              
              {/* Skipped tabs indicator */}
              {skippedTabs.size > 0 && (
                <div className="mt-2 flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400">
                  <AlertCircle className="h-3 w-3" />
                  <span>{skippedTabs.size} tab(s) skipped</span>
                </div>
              )}
            </div>
            {/* Basic Information Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-3 sm:space-y-4">
          {/* Company Selection (Super Admin Only) */}
          {isSuperAdmin && (
                  <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <CardHeader className="pb-2 sm:pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm sm:text-base md:text-lg text-gray-900 dark:text-white">
                        <Building2 className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400" />
                  Company Selection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                        <Label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Select Company *</Label>
                  <Select value={formData.companyId} onValueChange={(value) => handleInputChange('companyId', value)}>
                          <SelectTrigger className={`w-full ${errors.companyId ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}>
                      <SelectValue placeholder="Select a company" />
                    </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg z-50 max-h-60">
                      {companies.map((company) => (
                              <SelectItem 
                                key={company._id} 
                                value={company._id} 
                                className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium text-sm">{company.companyName}</span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">{company.companyCode}</span>
                                </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.companyId && (
                          <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.companyId}
                          </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Basic Information */}
                <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm sm:text-base md:text-lg text-gray-900 dark:text-white">
                      <User className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                        <Label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                          Supplier Name *
                        </Label>
                  <Input
                    value={formData.supplierName}
                    onChange={(e) => handleInputChange('supplierName', e.target.value)}
                    placeholder="Enter supplier name"
                          className={`w-full text-sm ${errors.supplierName ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                  />
                  {errors.supplierName && (
                          <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.supplierName}
                          </p>
                  )}
                </div>

                <div className="space-y-2">
                        <Label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                          Supplier Code *
                        </Label>
                  <Input
                    value={formData.supplierCode}
                    onChange={(e) => handleInputChange('supplierCode', e.target.value)}
                    placeholder="Enter supplier code"
                          className={`w-full text-sm ${errors.supplierCode ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                  />
                  {errors.supplierCode && (
                          <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.supplierCode}
                          </p>
                  )}
                </div>

                <div className="space-y-2">
                        <Label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                          Legal Name
                        </Label>
                  <Input
                          value={formData.legalName}
                          onChange={(e) => handleInputChange('legalName', e.target.value)}
                          placeholder="Enter legal name"
                          className="w-full text-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                          Display Name
                        </Label>
                        <Input
                          value={formData.displayName}
                          onChange={(e) => handleInputChange('displayName', e.target.value)}
                          placeholder="Enter display name"
                          className="w-full text-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}


            {/* Contact Information Tab */}
            {activeTab === 'contact' && (
              <div className="space-y-3 sm:space-y-4">
          <Card>
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base md:text-lg text-gray-900 dark:text-white">
                      <Phone className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                        <Label>Primary Phone *</Label>
                  <Input
                          value={formData.primaryPhone}
                          onChange={(e) => handleInputChange('primaryPhone', e.target.value)}
                          placeholder="Enter primary phone"
                          className={errors.primaryPhone ? 'border-red-500' : ''}
                        />
                        {errors.primaryPhone && (
                          <p className="text-sm text-red-600 dark:text-red-400">{errors.primaryPhone}</p>
                  )}
                </div>

                <div className="space-y-2">
                        <Label>Alternate Phone</Label>
                  <Input
                          value={formData.alternatePhone}
                          onChange={(e) => handleInputChange('alternatePhone', e.target.value)}
                          placeholder="Enter alternate phone"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Primary Email *</Label>
                        <Input
                          type="email"
                          value={formData.primaryEmail}
                          onChange={(e) => handleInputChange('primaryEmail', e.target.value)}
                          placeholder="Enter primary email"
                          className={errors.primaryEmail ? 'border-red-500' : ''}
                        />
                        {errors.primaryEmail && (
                          <p className="text-sm text-red-600 dark:text-red-400">{errors.primaryEmail}</p>
                  )}
                </div>

                      <div className="space-y-2">
                        <Label>Alternate Email</Label>
                        <Input
                          type="email"
                          value={formData.alternateEmail}
                          onChange={(e) => handleInputChange('alternateEmail', e.target.value)}
                          placeholder="Enter alternate email"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>WhatsApp</Label>
                        <Input
                          value={formData.whatsapp}
                          onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                          placeholder="Enter WhatsApp number"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Fax</Label>
                        <Input
                          value={formData.fax}
                          onChange={(e) => handleInputChange('fax', e.target.value)}
                          placeholder="Enter fax number"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Toll Free</Label>
                        <Input
                          value={formData.tollFree}
                          onChange={(e) => handleInputChange('tollFree', e.target.value)}
                          placeholder="Enter toll free number"
                        />
                </div>
              </div>
            </CardContent>
          </Card>
              </div>
            )}

            {/* Address Information Tab */}
            {activeTab === 'address' && (
              <div className="space-y-3 sm:space-y-4">
          <Card>
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base md:text-lg text-gray-900 dark:text-white">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400" />
                Address Information *
              </CardTitle>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                All address fields are required.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                        <Label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Address Line 1 *</Label>
                        <Input
                          value={formData.addressLine1}
                          onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                          placeholder="Enter address line 1"
                          className={`w-full text-sm ${errors.addressLine1 ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                        />
                        {errors.addressLine1 && (
                          <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.addressLine1}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Address Line 2</Label>
                        <Input
                          value={formData.addressLine2}
                          onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                          placeholder="Enter address line 2"
                          className="w-full text-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        />
                      </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">City *</Label>
                    <Input
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Enter city"
                      className={`w-full text-sm ${errors.city ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                    />
                    {errors.city && (
                      <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.city}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">State *</Label>
                    <Input
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="Enter state"
                      className={`w-full text-sm ${errors.state ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                    />
                    {errors.state && (
                      <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.state}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Pincode *</Label>
                    <Input
                      value={formData.pincode}
                      onChange={(e) => handleInputChange('pincode', e.target.value)}
                      placeholder="Enter pincode"
                      className={`w-full text-sm ${errors.pincode ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                    />
                    {errors.pincode && (
                      <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.pincode}
                      </p>
                    )}
                  </div>
                </div>

                      <div className="space-y-2">
                        <Label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Country</Label>
                        <Input
                          value={formData.country}
                          onChange={(e) => handleInputChange('country', e.target.value)}
                          placeholder="Enter country"
                          className="w-full text-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        />
                      </div>
              </div>
            </CardContent>
          </Card>
              </div>
            )}

            {/* Registration Details Tab */}
            {activeTab === 'registration' && (
              <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="h-5 w-5" />
                Registration Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>GSTIN</Label>
                  <Input
                    value={formData.gstin}
                    onChange={(e) => handleInputChange('gstin', e.target.value)}
                          placeholder="Enter GSTIN"
                          className={errors.gstin ? 'border-red-500' : ''}
                  />
                        {errors.gstin && (
                          <p className="text-sm text-red-600 dark:text-red-400">{errors.gstin}</p>
                        )}
                </div>

                <div className="space-y-2">
                  <Label>PAN</Label>
                  <Input
                    value={formData.pan}
                    onChange={(e) => handleInputChange('pan', e.target.value)}
                          placeholder="Enter PAN"
                          className={errors.pan ? 'border-red-500' : ''}
                        />
                        {errors.pan && (
                          <p className="text-sm text-red-600 dark:text-red-400">{errors.pan}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>CIN</Label>
                        <Input
                          value={formData.cin}
                          onChange={(e) => handleInputChange('cin', e.target.value)}
                          placeholder="Enter CIN"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Udyog Aadhar</Label>
                        <Input
                          value={formData.udyogAadhar}
                          onChange={(e) => handleInputChange('udyogAadhar', e.target.value)}
                          placeholder="Enter Udyog Aadhar"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>IEC Code</Label>
                        <Input
                          value={formData.iecCode}
                          onChange={(e) => handleInputChange('iecCode', e.target.value)}
                          placeholder="Enter IEC Code"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Registration Number</Label>
                        <Input
                          value={formData.registrationNumber}
                          onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                          placeholder="Enter registration number"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>VAT Number</Label>
                        <Input
                          value={formData.vatNumber}
                          onChange={(e) => handleInputChange('vatNumber', e.target.value)}
                          placeholder="Enter VAT number"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>CST Number</Label>
                        <Input
                          value={formData.cstNumber}
                          onChange={(e) => handleInputChange('cstNumber', e.target.value)}
                          placeholder="Enter CST number"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>MSME Number</Label>
                        <Input
                          value={formData.msmeNumber}
                          onChange={(e) => handleInputChange('msmeNumber', e.target.value)}
                          placeholder="Enter MSME number"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Factory License</Label>
                        <Input
                          value={formData.factoryLicense}
                          onChange={(e) => handleInputChange('factoryLicense', e.target.value)}
                          placeholder="Enter factory license"
                        />
                </div>
              </div>
            </CardContent>
          </Card>
              </div>
            )}

          {/* Additional Notes */}
          <Card>
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base md:text-lg text-gray-900 dark:text-white">
                <FileText className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any additional notes or comments..."
                  rows={3}
                  className="w-full text-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </CardContent>
          </Card>





          </div>
          
          {/* Navigation and Form Actions - Fixed Footer */}
          <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 sm:p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              {/* Navigation Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const currentIndex = tabs.findIndex(tab => tab.id === activeTab)
                    const prevTab = tabs[currentIndex - 1]
                    if (prevTab) {
                      setActiveTab(prevTab.id)
                    }
                  }}
                  disabled={tabs.findIndex(tab => tab.id === activeTab) === 0}
                  className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const currentIndex = tabs.findIndex(tab => tab.id === activeTab)
                    const nextTab = tabs[currentIndex + 1]
                    if (nextTab) {
                      setActiveTab(nextTab.id)
                    }
                  }}
                  disabled={tabs.findIndex(tab => tab.id === activeTab) === tabs.length - 1}
                  className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Next
                </Button>
              </div>

              {/* Form Status */}
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <div className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full ${Object.keys(errors).length === 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span>{Object.keys(errors).length === 0 ? 'Form is valid' : `${Object.keys(errors).length} errors found`}</span>
                </div>
                {isSubmitting && (
                  <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="text-xs sm:text-sm">Saving...</span>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
                  className="w-full sm:w-auto text-sm text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
                  disabled={isSubmitting || Object.keys(errors).length > 0}
                  className="w-full sm:w-auto min-w-[100px] sm:min-w-[120px] text-sm bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                      <span className="hidden sm:inline">Saving...</span>
                      <span className="sm:hidden">Save</span>
                </>
              ) : (
                <>
                      <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">{isEditing ? 'Update' : 'Create'} Supplier</span>
                      <span className="sm:hidden">{isEditing ? 'Update' : 'Create'}</span>
                </>
              )}
            </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
