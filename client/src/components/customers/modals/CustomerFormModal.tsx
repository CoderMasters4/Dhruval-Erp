import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import {
  X,
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Globe,
  FileText,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { 
  Customer, 
  useCreateCustomerMutation, 
  useUpdateCustomerMutation 
} from '@/lib/features/customers/customersApi'

interface CustomerFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  customer?: Customer
}

interface FormData {
  name: string
  email: string
  phone: string
  company: string
  contactPerson: string
  customerType: 'individual' | 'business'
  creditLimit: string
  paymentTerms: string
  taxId: string
  website: string
  address: {
    street: string
    city: string
    state: string
    country: string
    zipCode: string
  }
  billingAddress: {
    street: string
    city: string
    state: string
    country: string
    zipCode: string
  }
  notes: string
  tags: string
}

export default function CustomerFormModal({ isOpen, onClose, onSuccess, customer }: CustomerFormModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    contactPerson: '',
    customerType: 'individual',
    creditLimit: '',
    paymentTerms: '',
    taxId: '',
    website: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: 'India',
      zipCode: ''
    },
    billingAddress: {
      street: '',
      city: '',
      state: '',
      country: 'India',
      zipCode: ''
    },
    notes: '',
    tags: ''
  })

  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [sameBillingAddress, setSameBillingAddress] = useState(true)

  const [createCustomer, { isLoading: isCreating }] = useCreateCustomerMutation()
  const [updateCustomer, { isLoading: isUpdating }] = useUpdateCustomerMutation()

  const isEditing = !!customer
  const isLoading = isCreating || isUpdating

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        company: customer.company || '',
        contactPerson: customer.contactPerson || '',
        customerType: customer.customerType || 'individual',
        creditLimit: customer.creditLimit?.toString() || '',
        paymentTerms: customer.paymentTerms || '',
        taxId: customer.taxId || '',
        website: customer.website || '',
        address: {
          street: customer.address?.street || '',
          city: customer.address?.city || '',
          state: customer.address?.state || '',
          country: customer.address?.country || 'India',
          zipCode: customer.address?.zipCode || ''
        },
        billingAddress: {
          street: customer.billingAddress?.street || customer.address?.street || '',
          city: customer.billingAddress?.city || customer.address?.city || '',
          state: customer.billingAddress?.state || customer.address?.state || '',
          country: customer.billingAddress?.country || customer.address?.country || 'India',
          zipCode: customer.billingAddress?.zipCode || customer.address?.zipCode || ''
        },
        notes: customer.notes || '',
        tags: customer.tags?.join(', ') || ''
      })
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        contactPerson: '',
        customerType: 'individual',
        creditLimit: '',
        paymentTerms: '',
        taxId: '',
        website: '',
        address: {
          street: '',
          city: '',
          state: '',
          country: 'India',
          zipCode: ''
        },
        billingAddress: {
          street: '',
          city: '',
          state: '',
          country: 'India',
          zipCode: ''
        },
        notes: '',
        tags: ''
      })
    }
    setErrors({})
  }, [customer, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      const customerData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company || undefined,
        contactPerson: formData.contactPerson || undefined,
        customerType: formData.customerType,
        creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : undefined,
        paymentTerms: formData.paymentTerms || undefined,
        taxId: formData.taxId || undefined,
        website: formData.website || undefined,
        address: {
          street: formData.address.street || undefined,
          city: formData.address.city || undefined,
          state: formData.address.state || undefined,
          country: formData.address.country || undefined,
          zipCode: formData.address.zipCode || undefined
        },
        billingAddress: sameBillingAddress ? undefined : {
          street: formData.billingAddress.street || undefined,
          city: formData.billingAddress.city || undefined,
          state: formData.billingAddress.state || undefined,
          country: formData.billingAddress.country || undefined,
          zipCode: formData.billingAddress.zipCode || undefined
        },
        notes: formData.notes || undefined,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : undefined
      }

      if (isEditing && customer) {
        await updateCustomer({
          id: customer._id,
          customer: customerData
        }).unwrap()
      } else {
        await createCustomer(customerData).unwrap()
      }
      
      onSuccess()
    } catch (error: any) {
      toast.error(error?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} customer`)
    }
  }

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
    // Clear related errors
    const newErrors = { ...errors }
    Object.keys(updates).forEach(key => {
      delete newErrors[key as keyof FormData]
    })
    setErrors(newErrors)
  }

  const updateAddressField = (field: keyof FormData['address'], value: string) => {
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
    }))
    
    // Copy to billing address if same address is checked
    if (sameBillingAddress) {
      setFormData(prev => ({
        ...prev,
        billingAddress: { ...prev.billingAddress, [field]: value }
      }))
    }
  }

  const updateBillingAddressField = (field: keyof FormData['billingAddress'], value: string) => {
    setFormData(prev => ({
      ...prev,
      billingAddress: { ...prev.billingAddress, [field]: value }
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-blue-500 p-6 relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/20 rounded-full"></div>
          <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-white/10 rounded-full"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {isEditing ? 'Edit Customer' : 'Create New Customer'}
                </h2>
                <p className="text-blue-100">
                  {isEditing ? 'Update customer information' : 'Add a new customer to the system'}
                </p>
              </div>
            </div>
            
            <Button
              onClick={onClose}
              className="p-2 text-white hover:bg-white/20 rounded-xl transition-colors bg-transparent border-0"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => updateFormData({ name: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                    placeholder="Enter customer name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 font-medium">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => updateFormData({ email: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                      }`}
                      placeholder="Enter email address"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 font-medium">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => updateFormData({ phone: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                      }`}
                      placeholder="Enter phone number"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600 font-medium">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Customer Type *
                  </label>
                  <select
                    required
                    value={formData.customerType}
                    onChange={(e) => updateFormData({ customerType: e.target.value as 'individual' | 'business' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                  >
                    <option value="individual">Individual</option>
                    <option value="business">Business</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Business Information (if business type) */}
            {formData.customerType === 'business' && (
              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                  <Building2 className="w-5 h-5 mr-2 text-green-600" />
                  Business Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => updateFormData({ company: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                      placeholder="Enter company name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      value={formData.contactPerson}
                      onChange={(e) => updateFormData({ contactPerson: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                      placeholder="Enter contact person name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Tax ID
                    </label>
                    <input
                      type="text"
                      value={formData.taxId}
                      onChange={(e) => updateFormData({ taxId: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                      placeholder="Enter tax ID"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Website
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => updateFormData({ website: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                        placeholder="Enter website URL"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Address Information */}
            <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
              <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-yellow-600" />
                Address Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-black mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={formData.address.street}
                    onChange={(e) => updateAddressField('street', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                    placeholder="Enter street address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.address.city}
                    onChange={(e) => updateAddressField('city', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                    placeholder="Enter city"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.address.state}
                    onChange={(e) => updateAddressField('state', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                    placeholder="Enter state"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={formData.address.zipCode}
                    onChange={(e) => updateAddressField('zipCode', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                    placeholder="Enter ZIP code"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.address.country}
                    onChange={(e) => updateAddressField('country', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                    placeholder="Enter country"
                  />
                </div>
              </div>

              {/* Same as billing address checkbox */}
              <div className="mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={sameBillingAddress}
                    onChange={(e) => {
                      setSameBillingAddress(e.target.checked)
                      if (e.target.checked) {
                        setFormData(prev => ({
                          ...prev,
                          billingAddress: { ...prev.address }
                        }))
                      }
                    }}
                    className="mr-2 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Billing address is same as above
                  </span>
                </label>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-gray-600" />
                Additional Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => updateFormData({ notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 font-medium placeholder:text-gray-500"
                    placeholder="Enter any additional notes"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => updateFormData({ tags: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                    placeholder="e.g. VIP, Regular, Wholesale"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
            <Button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-colors"
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? 'Update Customer' : 'Create Customer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
