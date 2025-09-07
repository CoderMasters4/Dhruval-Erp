import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import {
  X,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  Save,
  Loader2,
  FileText
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

interface SimpleFormData {
  companyId: string
  supplierName: string
  supplierCode: string
  contactPerson: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
  gstin: string
  pan: string
  status: 'active' | 'inactive' | 'pending'
  notes: string
}

const initialFormData: SimpleFormData = {
  companyId: '',
  supplierName: '',
  supplierCode: '',
  contactPerson: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  gstin: '',
  pan: '',
  status: 'active',
  notes: ''
}

export function SupplierFormModal({ isOpen, onClose, onSuccess, supplier }: SupplierFormModalProps) {
  const [formData, setFormData] = useState<SimpleFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<SimpleFormData>>({})

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
          contactPerson: supplier.contactPerson || '',
          email: supplier.email || '',
          phone: supplier.phone || '',
          address: supplier.address || '',
          city: supplier.addresses?.[0]?.city || '',
          state: supplier.addresses?.[0]?.state || '',
          pincode: supplier.addresses?.[0]?.pincode || '',
          gstin: supplier.registrationDetails?.gstin || '',
          pan: supplier.registrationDetails?.pan || '',
          status: (supplier.status === 'blacklisted' ? 'inactive' : supplier.status) || 'active',
          notes: supplier.notes || ''
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
    }
  }, [isOpen, supplier, isSuperAdmin, userCompanyId])

  const handleInputChange = (field: keyof SimpleFormData, value: string) => {
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

  const validateForm = (): boolean => {
    const newErrors: Partial<SimpleFormData> = {}

    if (!formData.companyId) {
      newErrors.companyId = 'Company is required'
    }
    if (!formData.supplierName.trim()) {
      newErrors.supplierName = 'Supplier name is required'
    }
    if (!formData.supplierCode.trim()) {
      newErrors.supplierCode = 'Supplier code is required'
    }
    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = 'Contact person is required'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
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

    setIsSubmitting(true)

    try {
            const supplierData = {
        companyId: formData.companyId,
        supplierId: formData.supplierCode,
        supplierName: formData.supplierName,
        supplierCode: formData.supplierCode,
        partNumber: formData.supplierCode,
        isPrimary: false,
        leadTime: 0,
        minOrderQuantity: 1,
        qualityRating: 3,
        contactPerson: formData.contactPerson,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        isActive: formData.status === 'active',
        status: formData.status,
        contactInfo: {
          primaryEmail: formData.email,
          primaryPhone: formData.phone
        },
        addresses: [{
          addressLine1: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: 'India'
        }],
        registrationDetails: {
          gstin: formData.gstin,
          pan: formData.pan
        },
        relationship: {
          supplierType: 'manufacturer',
          supplierCategory: 'approved',
          priority: 'medium' as 'medium'
        },
        performanceMetrics: {
          onTimeDeliveryRate: 0,
          qualityRejectionRate: 0,
          averageLeadTime: 0,
          totalOrders: 0,
          totalOrderValue: 0,
          averageOrderValue: 0
        },
        pricingHistory: []
      }

      if (isEditing && supplier?._id) {
        await updateSupplier({ id: supplier._id, data: supplierData }).unwrap()
        toast.success('Supplier updated successfully!')
      } else {
        await createSupplier(supplierData).unwrap()
        toast.success('Supplier created successfully!')
      }

      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to save supplier')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Edit Supplier' : 'Create New Supplier'}
          </h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Company Selection (Super Admin Only) */}
          {isSuperAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5" />
                  Company Selection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Select Company *</Label>
                  <Select value={formData.companyId} onValueChange={(value) => handleInputChange('companyId', value)}>
                    <SelectTrigger className={errors.companyId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select a company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company._id} value={company._id}>
                          {company.companyName} ({company.companyCode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.companyId && (
                    <p className="text-sm text-red-600">{errors.companyId}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Supplier Name *</Label>
                  <Input
                    value={formData.supplierName}
                    onChange={(e) => handleInputChange('supplierName', e.target.value)}
                    placeholder="Enter supplier name"
                    className={errors.supplierName ? 'border-red-500' : ''}
                  />
                  {errors.supplierName && (
                    <p className="text-sm text-red-600">{errors.supplierName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Supplier Code *</Label>
                  <Input
                    value={formData.supplierCode}
                    onChange={(e) => handleInputChange('supplierCode', e.target.value)}
                    placeholder="Enter supplier code"
                    className={errors.supplierCode ? 'border-red-500' : ''}
                  />
                  {errors.supplierCode && (
                    <p className="text-sm text-red-600">{errors.supplierCode}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Contact Person *</Label>
                  <Input
                    value={formData.contactPerson}
                    onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                    placeholder="Enter contact person name"
                    className={errors.contactPerson ? 'border-red-500' : ''}
                  />
                  {errors.contactPerson && (
                    <p className="text-sm text-red-600">{errors.contactPerson}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mail className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Phone *</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter phone number"
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter complete address"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Enter city"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>State</Label>
                    <Input
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="Enter state"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Pincode</Label>
                    <Input
                      value={formData.pincode}
                      onChange={(e) => handleInputChange('pincode', e.target.value)}
                      placeholder="Enter pincode"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Registration Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5" />
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
                    placeholder="Enter GSTIN number"
                  />
                </div>

                <div className="space-y-2">
                  <Label>PAN</Label>
                  <Input
                    value={formData.pan}
                    onChange={(e) => handleInputChange('pan', e.target.value)}
                    placeholder="Enter PAN number"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any additional notes or comments..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? 'Update' : 'Create'} Supplier
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
