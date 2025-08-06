import React, { useState, useEffect } from 'react'
import { X, Building2, Save, Loader2, FileText, Phone, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { validateGSTIN, validatePAN, validateCIN, validateEmail, validatePincode, generateCompanyCode } from '../utils'

interface CompanyModalProps {
  isOpen: boolean
  onClose: () => void
  company?: any | null
  onSubmit: (data: any) => Promise<void>
  isLoading?: boolean
}

const CompanyFormModal: React.FC<CompanyModalProps> = ({
  isOpen,
  onClose,
  company,
  onSubmit,
  isLoading = false
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    companyCode: '',
    companyName: '',
    legalName: '',
    registrationDetails: {
      gstin: '',
      pan: '',
      cin: '',
      udyogAadhar: '',
      iecCode: '',
      registrationDate: ''
    },
    addresses: {
      registeredOffice: {
        street: '',
        area: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India'
      },
      factoryAddress: {
        street: '',
        area: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India'
      }
    },
    contactInfo: {
      phones: [{ number: '', type: 'primary', label: 'Primary', isPrimary: true }],
      emails: [{ email: '', type: 'primary', label: 'Primary', isPrimary: true }],
      website: ''
    },
    businessConfig: {
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      fiscalYearStart: 'April',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      workingHours: {
        start: '09:00',
        end: '18:00',
        breakStart: '13:00',
        breakEnd: '14:00'
      },
      gstRates: {
        defaultRate: 18,
        rawMaterialRate: 12,
        finishedGoodsRate: 18
      }
    }
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const steps = [
    { title: 'Basic Information', component: 'basic' },
    { title: 'Registration & GST Details', component: 'registration' },
    { title: 'Contact Information', component: 'contact' },
    { title: 'Address Information', component: 'address' },
    { title: 'Business Configuration', component: 'business' }
  ]

  // Initialize form data when company prop changes
  useEffect(() => {
    if (company) {
      setFormData({
        companyCode: company.companyCode || '',
        companyName: company.companyName || '',
        legalName: company.legalName || '',
        registrationDetails: {
          gstin: company.registrationDetails?.gstin || '',
          pan: company.registrationDetails?.pan || '',
          cin: company.registrationDetails?.cin || '',
          udyogAadhar: company.registrationDetails?.udyogAadhar || '',
          iecCode: company.registrationDetails?.iecCode || '',
          registrationDate: company.registrationDetails?.registrationDate || ''
        },
        addresses: {
          registeredOffice: {
            street: company.addresses?.registeredOffice?.street || '',
            area: company.addresses?.registeredOffice?.area || '',
            city: company.addresses?.registeredOffice?.city || '',
            state: company.addresses?.registeredOffice?.state || '',
            pincode: company.addresses?.registeredOffice?.pincode || '',
            country: company.addresses?.registeredOffice?.country || 'India'
          },
          factoryAddress: {
            street: company.addresses?.factoryAddress?.street || '',
            area: company.addresses?.factoryAddress?.area || '',
            city: company.addresses?.factoryAddress?.city || '',
            state: company.addresses?.factoryAddress?.state || '',
            pincode: company.addresses?.factoryAddress?.pincode || '',
            country: company.addresses?.factoryAddress?.country || 'India'
          }
        },
        contactInfo: {
          phones: company.contactInfo?.phones || [{ number: '', type: 'primary', label: 'Primary', isPrimary: true }],
          emails: company.contactInfo?.emails || [{ email: '', type: 'primary', label: 'Primary', isPrimary: true }],
          website: company.contactInfo?.website || ''
        },
        businessConfig: {
          currency: company.businessConfig?.currency || 'INR',
          timezone: company.businessConfig?.timezone || 'Asia/Kolkata',
          fiscalYearStart: company.businessConfig?.fiscalYearStart || 'April',
          workingDays: company.businessConfig?.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          workingHours: {
            start: company.businessConfig?.workingHours?.start || '09:00',
            end: company.businessConfig?.workingHours?.end || '18:00',
            breakStart: company.businessConfig?.workingHours?.breakStart || '13:00',
            breakEnd: company.businessConfig?.workingHours?.breakEnd || '14:00'
          },
          gstRates: {
            defaultRate: company.businessConfig?.gstRates?.defaultRate || 18,
            rawMaterialRate: company.businessConfig?.gstRates?.rawMaterialRate || 12,
            finishedGoodsRate: company.businessConfig?.gstRates?.finishedGoodsRate || 18
          }
        }
      })
    }
    setCurrentStep(0)
    setErrors({})
  }, [company, isOpen])

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {}

    switch (currentStep) {
      case 0: // Basic Information
        if (!formData.companyName.trim()) {
          newErrors.companyName = 'Company name is required'
        }
        if (!formData.legalName.trim()) {
          newErrors.legalName = 'Legal name is required'
        }
        if (!formData.companyCode.trim()) {
          newErrors.companyCode = 'Company code is required'
        }
        break

      case 1: // Registration Details
        if (!formData.registrationDetails.gstin.trim()) {
          newErrors.gstin = 'GSTIN is required'
        } else if (!validateGSTIN(formData.registrationDetails.gstin)) {
          newErrors.gstin = 'Invalid GSTIN format'
        }
        if (!formData.registrationDetails.pan.trim()) {
          newErrors.pan = 'PAN is required'
        } else if (!validatePAN(formData.registrationDetails.pan)) {
          newErrors.pan = 'Invalid PAN format'
        }
        if (formData.registrationDetails.cin && !validateCIN(formData.registrationDetails.cin)) {
          newErrors.cin = 'Invalid CIN format'
        }
        break

      case 2: // Contact Information
        if (!formData.contactInfo.emails[0]?.email.trim()) {
          newErrors.email = 'Primary email is required'
        } else if (!validateEmail(formData.contactInfo.emails[0].email)) {
          newErrors.email = 'Invalid email format'
        }
        if (!formData.contactInfo.phones[0]?.number.trim()) {
          newErrors.phone = 'Primary phone is required'
        }
        break

      case 3: // Address Information
        if (!formData.addresses.registeredOffice.street.trim()) {
          newErrors.street = 'Street address is required'
        }
        if (!formData.addresses.registeredOffice.city.trim()) {
          newErrors.city = 'City is required'
        }
        if (!formData.addresses.registeredOffice.state.trim()) {
          newErrors.state = 'State is required'
        }
        if (!formData.addresses.registeredOffice.pincode.trim()) {
          newErrors.pincode = 'Pincode is required'
        } else if (!validatePincode(formData.addresses.registeredOffice.pincode)) {
          newErrors.pincode = 'Invalid pincode format'
        }
        break

      case 4: // Business Configuration - optional validation
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (validateCurrentStep()) {
      await onSubmit(formData)
    }
  }

  const updateFormData = (updates: any) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleNext = async () => {
    if (validateCurrentStep()) {
      if (currentStep === steps.length - 1) {
        // Submit form
        try {
          await onSubmit(formData)
        } catch (error) {
          console.error('Form submission error:', error)
        }
      } else {
        setCurrentStep(prev => prev + 1)
      }
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(0, prev - 1))
  }

  if (!isOpen) return null

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Information
        return (
          <div className="space-y-6">
            <div className="bg-sky-50 rounded-xl p-4 sm:p-6 border border-sky-200">
              <h3 className="text-base sm:text-lg font-semibold text-black mb-4 flex items-center">
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-sky-600" />
                Basic Company Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-black mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => updateFormData({ companyName: e.target.value })}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 text-sm sm:text-base ${
                      errors.companyName ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                    placeholder="Enter the full company name"
                  />
                  {errors.companyName && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600 font-medium">{errors.companyName}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.legalName}
                    onChange={(e) => updateFormData({ legalName: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.legalName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter the legal name as per registration"
                  />
                  {errors.legalName && (
                    <p className="mt-1 text-sm text-red-600">{errors.legalName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyCode}
                    onChange={(e) => updateFormData({ companyCode: e.target.value.toUpperCase() })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors font-mono ${
                      errors.companyCode ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="COMP001"
                    maxLength={20}
                  />
                  {errors.companyCode && (
                    <p className="mt-1 text-sm text-red-600">{errors.companyCode}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={formData.businessConfig.currency}
                    onChange={(e) => updateFormData({
                      businessConfig: {
                        ...formData.businessConfig,
                        currency: e.target.value
                      }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="INR">Indian Rupee (₹)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="GBP">British Pound (£)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )

      case 1: // Registration Details
        return (
          <div className="space-y-6">
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-green-600" />
                Registration & Tax Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GSTIN *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.registrationDetails.gstin}
                    onChange={(e) => updateFormData({
                      registrationDetails: {
                        ...formData.registrationDetails,
                        gstin: e.target.value.toUpperCase()
                      }
                    })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors font-mono ${
                      errors.gstin ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="22AAAAA0000A1Z5"
                    maxLength={15}
                  />
                  {errors.gstin && (
                    <p className="mt-1 text-sm text-red-600">{errors.gstin}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PAN *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.registrationDetails.pan}
                    onChange={(e) => updateFormData({
                      registrationDetails: {
                        ...formData.registrationDetails,
                        pan: e.target.value.toUpperCase()
                      }
                    })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors font-mono ${
                      errors.pan ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="AAAAA0000A"
                    maxLength={10}
                  />
                  {errors.pan && (
                    <p className="mt-1 text-sm text-red-600">{errors.pan}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CIN (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.registrationDetails.cin}
                    onChange={(e) => updateFormData({
                      registrationDetails: {
                        ...formData.registrationDetails,
                        cin: e.target.value.toUpperCase()
                      }
                    })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors font-mono ${
                      errors.cin ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="L17110DL1995PLC069348"
                    maxLength={21}
                  />
                  {errors.cin && (
                    <p className="mt-1 text-sm text-red-600">{errors.cin}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Udyog Aadhar (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.registrationDetails.udyogAadhar}
                    onChange={(e) => updateFormData({
                      registrationDetails: {
                        ...formData.registrationDetails,
                        udyogAadhar: e.target.value
                      }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors font-mono"
                    placeholder="UDYAM-XX-00-0000000"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 2: // Contact Information
        return (
          <div className="space-y-6">
            <div className="bg-purple-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Phone className="w-5 h-5 mr-2 text-purple-600" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.contactInfo.emails[0]?.email || ''}
                    onChange={(e) => updateFormData({
                      contactInfo: {
                        ...formData.contactInfo,
                        emails: [{ email: e.target.value, type: 'primary', label: 'Primary', isPrimary: true }]
                      }
                    })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="company@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.contactInfo.phones[0]?.number || ''}
                    onChange={(e) => updateFormData({
                      contactInfo: {
                        ...formData.contactInfo,
                        phones: [{ number: e.target.value, type: 'primary', label: 'Primary', isPrimary: true }]
                      }
                    })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="+91 9876543210"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.contactInfo.website}
                    onChange={(e) => updateFormData({
                      contactInfo: {
                        ...formData.contactInfo,
                        website: e.target.value
                      }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="https://www.company.com"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 3: // Address Information
        return (
          <div className="space-y-6">
            <div className="bg-red-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-red-600" />
                Registered Office Address
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.addresses.registeredOffice.street}
                    onChange={(e) => updateFormData({
                      addresses: {
                        ...formData.addresses,
                        registeredOffice: {
                          ...formData.addresses.registeredOffice,
                          street: e.target.value
                        }
                      }
                    })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
                      errors.street ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter complete street address"
                  />
                  {errors.street && (
                    <p className="mt-1 text-sm text-red-600">{errors.street}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.addresses.registeredOffice.city}
                    onChange={(e) => updateFormData({
                      addresses: {
                        ...formData.addresses,
                        registeredOffice: {
                          ...formData.addresses.registeredOffice,
                          city: e.target.value
                        }
                      }
                    })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.city ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter city name"
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.addresses.registeredOffice.state}
                    onChange={(e) => updateFormData({
                      addresses: {
                        ...formData.addresses,
                        registeredOffice: {
                          ...formData.addresses.registeredOffice,
                          state: e.target.value
                        }
                      }
                    })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.state ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter state name"
                  />
                  {errors.state && (
                    <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.addresses.registeredOffice.pincode}
                    onChange={(e) => updateFormData({
                      addresses: {
                        ...formData.addresses,
                        registeredOffice: {
                          ...formData.addresses.registeredOffice,
                          pincode: e.target.value
                        }
                      }
                    })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors font-mono ${
                      errors.pincode ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="000000"
                    maxLength={6}
                  />
                  {errors.pincode && (
                    <p className="mt-1 text-sm text-red-600">{errors.pincode}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <select
                    value={formData.addresses.registeredOffice.country}
                    onChange={(e) => updateFormData({
                      addresses: {
                        ...formData.addresses,
                        registeredOffice: {
                          ...formData.addresses.registeredOffice,
                          country: e.target.value
                        }
                      }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="India">India</option>
                    <option value="USA">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )

      case 4: // Business Configuration
        return (
          <div className="space-y-6">
            <div className="bg-yellow-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-yellow-600" />
                Business Configuration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fiscal Year Start
                  </label>
                  <select
                    value={formData.businessConfig.fiscalYearStart}
                    onChange={(e) => updateFormData({
                      businessConfig: {
                        ...formData.businessConfig,
                        fiscalYearStart: e.target.value
                      }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="April">April</option>
                    <option value="January">January</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                    value={formData.businessConfig.timezone}
                    onChange={(e) => updateFormData({
                      businessConfig: {
                        ...formData.businessConfig,
                        timezone: e.target.value
                      }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="Asia/Kolkata">India Standard Time (IST)</option>
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">Greenwich Mean Time (GMT)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default GST Rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.businessConfig.gstRates.defaultRate}
                    onChange={(e) => updateFormData({
                      businessConfig: {
                        ...formData.businessConfig,
                        gstRates: {
                          ...formData.businessConfig.gstRates,
                          defaultRate: parseFloat(e.target.value) || 0
                        }
                      }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="18"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Raw Material GST Rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.businessConfig.gstRates.rawMaterialRate}
                    onChange={(e) => updateFormData({
                      businessConfig: {
                        ...formData.businessConfig,
                        gstRates: {
                          ...formData.businessConfig.gstRates,
                          rawMaterialRate: parseFloat(e.target.value) || 0
                        }
                      }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="12"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return <div>Step content not implemented yet</div>
    }
  }

  return (
    <div className="fixed inset-0 bg-white bg-opacity-30 backdrop-blur-md flex items-center justify-center z-[60] p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden border border-sky-200 relative mx-2 sm:mx-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-sky-200 bg-sky-500">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <div className="p-2 sm:p-3 bg-white bg-opacity-20 rounded-xl flex-shrink-0">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white truncate">
                {company ? 'Edit Company' : 'Create New Company'}
              </h2>
              <p className="text-sky-100 text-xs sm:text-sm font-medium">
                Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-sky-200 transition-colors p-2 hover:bg-white hover:bg-opacity-20 rounded-xl flex-shrink-0 ml-2"
            disabled={isLoading}
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-sky-50 border-b border-sky-200">
          {/* Mobile Progress */}
          <div className="block sm:hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-black">Progress</span>
              <span className="text-sm font-semibold text-sky-600">
                {Math.round(((currentStep + 1) / steps.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-sky-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
            </p>
          </div>

          {/* Desktop Progress */}
          <div className="hidden sm:flex items-center justify-between">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
              >
                <div
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${
                    index < currentStep
                      ? 'bg-green-500 text-white'
                      : index === currentStep
                      ? 'bg-sky-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {index < currentStep ? '✓' : index + 1}
                </div>
                <span
                  className={`ml-2 text-xs sm:text-sm font-semibold truncate ${
                    index <= currentStep ? 'text-black' : 'text-gray-500'
                  }`}
                >
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 sm:h-2 mx-2 sm:mx-4 rounded ${
                      index < currentStep ? 'bg-green-500' : index === currentStep ? 'bg-sky-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-4 sm:p-6">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-sky-200 bg-sky-50">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0 || isLoading}
          >
            Previous
          </Button>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleNext}
              disabled={isLoading}
              className="bg-sky-500 hover:bg-sky-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : currentStep === steps.length - 1 ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {company ? 'Update Company' : 'Create Company'}
                </>
              ) : (
                'Next'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompanyFormModal
