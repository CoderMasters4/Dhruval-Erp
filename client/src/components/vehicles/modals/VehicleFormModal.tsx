import React, { useState, useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast'
import {
  X,
  Car,
  Upload,
  Image as ImageIcon,
  Trash2,
  Loader2,
  Phone
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  Vehicle,
  CreateVehicleRequest,
  useCreateVehicleMutation,
  useUpdateVehicleMutation,
  useUploadVehicleImagesMutation,
  useDeleteVehicleImageMutation
} from '@/lib/features/vehicles/vehiclesApi'
import { useGetAllCompaniesQuery } from '@/lib/features/companies/companiesApi'


interface VehicleFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  vehicle?: Vehicle
}

interface FormData {
  vehicleNumber: string
  driverName: string
  driverPhone: string
  purpose: Vehicle['purpose']
  reason: string
  gatePassNumber: string
  companyId: string
}

const getInitialFormData = (): FormData => ({
  vehicleNumber: '',
  driverName: '',
  driverPhone: '',
  purpose: 'delivery',
  reason: '',
  gatePassNumber: '',
  companyId: ''
})

export default function VehicleFormModal({ isOpen, onClose, onSuccess, vehicle }: VehicleFormModalProps) {
  const [formData, setFormData] = useState<FormData>(getInitialFormData())

  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [previewImages, setPreviewImages] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [createVehicle, { isLoading: isCreating }] = useCreateVehicleMutation()
  const [updateVehicle, { isLoading: isUpdating }] = useUpdateVehicleMutation()
  const [uploadImages, { isLoading: isUploading }] = useUploadVehicleImagesMutation()
  const [deleteImage] = useDeleteVehicleImageMutation()

  const { data: companiesResponse } = useGetAllCompaniesQuery()
  const companies = companiesResponse?.data || []

  const isEditing = !!vehicle
  const isLoading = isCreating || isUpdating || isUploading

  useEffect(() => {
    if (vehicle) {
      setFormData({
        vehicleNumber: vehicle.vehicleNumber || '',
        driverName: vehicle.driverName || '',
        driverPhone: vehicle.driverPhone || '',
        purpose: vehicle.purpose || 'delivery',
        reason: vehicle.reason || '',
        gatePassNumber: vehicle.gatePassNumber || '',
        companyId: vehicle.companyId || ''
      })
      setExistingImages(vehicle.images || [])
    } else {
      // Reset form for new vehicle
      setFormData(getInitialFormData())
      setExistingImages([])
    }
    setErrors({})
    setSelectedImages([])
    setPreviewImages([])
  }, [vehicle, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.vehicleNumber.trim()) {
      newErrors.vehicleNumber = 'Vehicle number is required'
    }

    if (!formData.driverName.trim()) {
      newErrors.driverName = 'Driver name is required'
    }

    if (!formData.driverPhone.trim()) {
      newErrors.driverPhone = 'Driver phone is required'
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason is required'
    }

    if (!formData.companyId) {
      newErrors.companyId = 'Company is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`)
        return false
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error(`${file.name} is too large. Maximum size is 5MB`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    setSelectedImages(prev => [...prev, ...validFiles])

    // Create preview URLs
    const newPreviews = validFiles.map(file => URL.createObjectURL(file))
    setPreviewImages(prev => [...prev, ...newPreviews])
  }

  const removeSelectedImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
    setPreviewImages(prev => {
      const newPreviews = prev.filter((_, i) => i !== index)
      // Revoke the URL to free memory
      URL.revokeObjectURL(prev[index])
      return newPreviews
    })
  }

  const removeExistingImage = async (imageUrl: string) => {
    if (!vehicle) return
    
    try {
      await deleteImage({ vehicleId: vehicle._id, imageUrl }).unwrap()
      setExistingImages(prev => prev.filter(url => url !== imageUrl))
      toast.success('Image deleted successfully')
    } catch (error: any) {
      toast.error('Failed to delete image')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      const vehicleData: CreateVehicleRequest = {
        vehicleNumber: formData.vehicleNumber,
        driverName: formData.driverName,
        driverPhone: formData.driverPhone,
        purpose: formData.purpose,
        reason: formData.reason,
        gatePassNumber: formData.gatePassNumber,
        companyId: formData.companyId
      }

      let savedVehicle: Vehicle
      if (isEditing && vehicle) {
        savedVehicle = await updateVehicle({
          id: vehicle._id,
          vehicle: vehicleData
        }).unwrap()
      } else {
        savedVehicle = await createVehicle(vehicleData).unwrap()
      }

      // Upload images if any are selected
      if (selectedImages.length > 0) {
        await uploadImages({
          vehicleId: savedVehicle._id,
          images: selectedImages
        }).unwrap()
      }
      
      onSuccess()
    } catch (error: any) {
      toast.error(error?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} vehicle`)
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

  // Remove unused function

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-blue-500 p-6 relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/20 rounded-full"></div>
          <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-white/10 rounded-full"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {isEditing ? 'Edit Vehicle' : 'Add New Vehicle'}
                </h2>
                <p className="text-blue-100">
                  {isEditing ? 'Update vehicle information' : 'Add a new vehicle to the fleet'}
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
            {/* Vehicle Gate Pass Information */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                <Car className="w-5 h-5 mr-2 text-blue-600" />
                Vehicle Gate Pass Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Vehicle Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.vehicleNumber}
                    onChange={(e) => updateFormData({ vehicleNumber: e.target.value.toUpperCase() })}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      errors.vehicleNumber ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                    placeholder="e.g., MH01AB1234"
                  />
                  {errors.vehicleNumber && (
                    <p className="mt-1 text-sm text-red-600 font-medium">{errors.vehicleNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Gate Pass Number
                  </label>
                  <input
                    type="text"
                    value={formData.gatePassNumber}
                    onChange={(e) => updateFormData({ gatePassNumber: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                    placeholder="e.g., GP001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Driver Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.driverName}
                    onChange={(e) => updateFormData({ driverName: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      errors.driverName ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                    placeholder="Driver full name"
                  />
                  {errors.driverName && (
                    <p className="mt-1 text-sm text-red-600 font-medium">{errors.driverName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Driver Mobile Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      required
                      value={formData.driverPhone}
                      onChange={(e) => updateFormData({ driverPhone: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        errors.driverPhone ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                      }`}
                      placeholder="Driver phone number"
                    />
                  </div>
                  {errors.driverPhone && (
                    <p className="mt-1 text-sm text-red-600 font-medium">{errors.driverPhone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Purpose of Visit *
                  </label>
                  <select
                    required
                    value={formData.purpose}
                    onChange={(e) => updateFormData({ purpose: e.target.value as Vehicle['purpose'] })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                  >
                    <option value="delivery">Delivery</option>
                    <option value="pickup">Pickup</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Company *
                  </label>
                  <select
                    required
                    value={formData.companyId}
                    onChange={(e) => updateFormData({ companyId: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      errors.companyId ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                  >
                    <option value="">Select Company</option>
                    {companies.map((company) => (
                      <option key={company._id} value={company._id}>
                        {company.companyName}
                      </option>
                    ))}
                  </select>
                  {errors.companyId && (
                    <p className="mt-1 text-sm text-red-600 font-medium">{errors.companyId}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-black mb-2">
                    Reason for Visit *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.reason}
                    onChange={(e) => updateFormData({ reason: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none ${
                      errors.reason ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                    placeholder="Please provide detailed reason for the visit..."
                  />
                  {errors.reason && (
                    <p className="mt-1 text-sm text-red-600 font-medium">{errors.reason}</p>
                  )}
                </div>
              </div>
            </div>



            {/* Vehicle Images */}
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                <ImageIcon className="w-5 h-5 mr-2 text-green-600" />
                Vehicle Images
              </h3>
              
              <div className="space-y-4">
                {/* Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Click to upload vehicle images</p>
                  <p className="text-sm text-gray-500 mb-4">PNG, JPG, GIF up to 5MB each</p>
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Images
                  </Button>
                </div>

                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-black mb-2">Current Images</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {existingImages.map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={imageUrl}
                            alt={`Vehicle ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(imageUrl)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Selected Images Preview */}
                {previewImages.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-black mb-2">New Images to Upload</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {previewImages.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeSelectedImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
              {isEditing ? 'Update Vehicle' : 'Add Vehicle'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
