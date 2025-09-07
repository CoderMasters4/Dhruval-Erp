'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CustomerSelector } from './CustomerSelector'
import { ImageUploader } from './ImageUploader'
import { useGetAllCompaniesQuery } from '@/lib/features/companies/companiesApi'
import { useGetWarehousesQuery } from '@/lib/api/warehousesApi'
import { useGetCustomersQuery } from '@/lib/api/customersApi'
import { useUpdateDispatchMutation, useGetUploadUrlMutation, useUploadToS3Mutation } from '@/lib/api/enhancedDispatchApi'
import { useUpdateSalesOrderMutation } from '@/lib/api/salesApi'
import { Dispatch, UpdateDispatchRequest } from '@/lib/api/enhancedDispatchApi'
import { Customer } from '@/lib/api/customersApi'
import toast from 'react-hot-toast'
import { compressImage, validateImageFile } from '@/utils/imageCompression'

interface DispatchEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (dispatch: Dispatch) => void
  dispatch: Dispatch | null
  userCompanyId?: string
}

export const DispatchEditModal = ({
  isOpen,
  onClose,
  onSuccess,
  dispatch,
  userCompanyId
}: DispatchEditModalProps) => {
  const [formData, setFormData] = useState<UpdateDispatchRequest>({
    id: '',
    dispatchNumber: '',
    dispatchDate: '',
    dispatchType: '',
    priority: 'medium',
    sourceWarehouseId: '',
    customerOrderId: '',
    vehicleNumber: '',
    deliveryPersonName: '',
    deliveryPersonNumber: '',
    status: 'pending',
    notes: ''
  })

  // Image upload states
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [uploadProgress, setUploadProgress] = useState<{ [fileName: string]: number }>({})
  const [uploadStatus, setUploadStatus] = useState<{ [fileName: string]: 'uploading' | 'success' | 'error' }>({})

  // RTK Query hooks
  const { data: companies = [] } = useGetAllCompaniesQuery()
  const { data: warehousesData } = useGetWarehousesQuery({ 
    companyId: userCompanyId,
    limit: 100 
  })
  const warehouses = warehousesData?.data || []
  
  const { data: customersData } = useGetCustomersQuery({ 
    companyId: userCompanyId,
    limit: 100 
  })
  const customers = customersData?.data || []

  // Mutations
  const [updateDispatch, { isLoading: updating }] = useUpdateDispatchMutation()
  const [getUploadUrl] = useGetUploadUrlMutation()
  const [uploadToS3] = useUploadToS3Mutation()
  const [updateSalesOrder] = useUpdateSalesOrderMutation()

  // Initialize form data when dispatch changes
  useEffect(() => {
    if (dispatch && isOpen) {
      setFormData({
        id: dispatch._id,
        dispatchNumber: dispatch.dispatchNumber || '',
        dispatchDate: dispatch.dispatchDate ? new Date(dispatch.dispatchDate).toISOString().split('T')[0] : '',
        dispatchType: dispatch.dispatchType || '',
        priority: dispatch.priority || 'medium',
        sourceWarehouseId: dispatch.sourceWarehouseId?._id || '',
        customerOrderId: dispatch.customerOrderId?._id || '',
        vehicleNumber: dispatch.vehicleNumber || '',
        deliveryPersonName: dispatch.deliveryPersonName || '',
        deliveryPersonNumber: dispatch.deliveryPersonNumber || '',
        status: dispatch.status || 'pending',
        notes: dispatch.notes || ''
      })
    }
  }, [dispatch, isOpen])

  // Image handling functions
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
    setImagePreviews(prev => [...prev, ...newPreviews])
  }

  const removeSelectedImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => {
      const newPreviews = prev.filter((_, i) => i !== index)
      // Revoke the URL to free memory
      URL.revokeObjectURL(prev[index])
      return newPreviews
    })
  }

  const uploadImages = async (): Promise<string[]> => {
    if (selectedImages.length === 0) return []

    const uploadedKeys: string[] = []

    for (const file of selectedImages) {
      try {
        setUploadStatus(prev => ({ ...prev, [file.name]: 'uploading' }))

        // Validate file
        if (!validateImageFile(file)) {
          throw new Error('Invalid file type or size too large')
        }

        // Compress image before upload
        const compressedFile = await compressImage(file, 1200, 0.8)
        
        // Get presigned URL
        const response = await getUploadUrl({
          fileName: compressedFile.name,
          contentType: compressedFile.type,
          fileType: 'dispatch-photos',
        }).unwrap()

        // Use the upload URL directly from the response
        const actualUploadUrl = response.uploadUrl
        const publicUrl = response.publicUrl
        const key = response.key

        if (!actualUploadUrl) {
          throw new Error('No upload URL received')
        }

        // Upload to S3
        await uploadToS3({
          uploadUrl: actualUploadUrl,
          file: compressedFile,
          onProgress: (progress: number) => {
            setUploadProgress(prev => ({ ...prev, [file.name]: progress }))
          },
        }).unwrap()

        uploadedKeys.push(publicUrl)
        setUploadStatus(prev => ({ ...prev, [file.name]: 'success' }))
        toast.success(`${file.name} uploaded successfully`)
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error)
        setUploadStatus(prev => ({ ...prev, [file.name]: 'error' }))
        toast.error(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return uploadedKeys
  }



  const handleUpdate = async () => {
    if (!dispatch) return

    try {
      // Upload new images first
      const uploadedKeys = await uploadImages()
      
      // Get existing photos and add new ones
      const existingPhotos = dispatch.documents?.photos || []
      const allPhotos = [...existingPhotos, ...uploadedKeys]
      
      // Update dispatch
      const dispatchData = {
        ...formData,
        documents: {
          photos: allPhotos
        }
      }

      const result = await updateDispatch(dispatchData).unwrap()
      
      // Update sales order status based on dispatch status
      if (formData.status === 'delivered') {
        // Find related sales order and update its status
        // This would need to be implemented based on your business logic
        // For now, we'll just show a success message
        toast.success(`Dispatch ${result.dispatchNumber} updated and marked as delivered!`)
      } else {
        toast.success(`Dispatch ${result.dispatchNumber} updated successfully!`)
      }
      
      if (onSuccess) {
        onSuccess(result)
      }
      
      onClose()
    } catch (error) {
      console.error('Failed to update dispatch:', error)
      toast.error('Failed to update dispatch')
    }
  }

  if (!dispatch) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Dispatch - ${dispatch.dispatchNumber}`}
      size="xl"
    >
      <div className="max-h-[90vh] overflow-y-auto space-y-6">
        {/* Basic Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dispatch Number</label>
              <Input
                value={formData.dispatchNumber}
                onChange={(e) => setFormData({ ...formData, dispatchNumber: e.target.value })}
                placeholder="Enter dispatch number"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dispatch Type</label>
              <select
                value={formData.dispatchType}
                onChange={(e) => setFormData({ ...formData, dispatchType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select dispatch type</option>
                <option value="delivery">Delivery</option>
                <option value="pickup">Pickup</option>
                <option value="transfer">Transfer</option>
                <option value="return">Return</option>
                <option value="replacement">Replacement</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Dispatch['priority'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Dispatch['status'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dispatch Date</label>
              <Input
                type="date"
                value={formData.dispatchDate}
                onChange={(e) => setFormData({ ...formData, dispatchDate: e.target.value })}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Source Warehouse */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Source Warehouse</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Source Warehouse</label>
            <select
              value={formData.sourceWarehouseId}
              onChange={(e) => setFormData({ ...formData, sourceWarehouseId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select warehouse</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse._id} value={warehouse._id}>
                  {warehouse.warehouseName} - {warehouse.warehouseCode}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Delivery Information */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
              <Input
                value={formData.vehicleNumber}
                onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                placeholder="Enter vehicle number"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Person Name</label>
              <Input
                value={formData.deliveryPersonName}
                onChange={(e) => setFormData({ ...formData, deliveryPersonName: e.target.value })}
                placeholder="Enter delivery person name"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Person Number</label>
              <Input
                value={formData.deliveryPersonNumber}
                onChange={(e) => setFormData({ ...formData, deliveryPersonNumber: e.target.value })}
                placeholder="Enter delivery person number"
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Enter any additional notes"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
        </div>


        {/* Image Upload */}
        <ImageUploader
          selectedImages={selectedImages}
          imagePreviews={imagePreviews}
          uploadProgress={uploadProgress}
          uploadStatus={uploadStatus}
          onImageSelect={handleImageSelect}
          onRemoveImage={removeSelectedImage}
        />

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="px-6 py-2"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpdate}
            disabled={updating}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700"
          >
            {updating ? 'Updating...' : 'Update Dispatch'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
