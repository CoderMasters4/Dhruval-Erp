'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useGetWarehousesQuery } from '@/lib/api/warehousesApi'
import { Package } from 'lucide-react'
import { PurchaseOrderFormData } from './PurchaseOrderForm'

interface WarehouseSelectionProps {
  formData: PurchaseOrderFormData
  updateFormData: (updates: Partial<PurchaseOrderFormData>) => void
}

export function WarehouseSelection({ formData, updateFormData }: WarehouseSelectionProps) {
  const { data: warehousesData } = useGetWarehousesQuery({
    companyId: formData.selectedCompanyId,
    page: 1,
    limit: 100
  }, {
    skip: !formData.selectedCompanyId
  })

  const warehouses = warehousesData?.data || []

  // Handle warehouse selection
  useEffect(() => {
    if (formData.selectedWarehouseId) {
      const warehouse = warehouses.find(w => w._id === formData.selectedWarehouseId)
      if (warehouse && (!formData.selectedWarehouse || formData.selectedWarehouse._id !== warehouse._id)) {
        updateFormData({ selectedWarehouse: warehouse })
      }
    } else if (formData.selectedWarehouse) {
      updateFormData({ selectedWarehouse: null })
    }
  }, [formData.selectedWarehouseId, warehouses, formData.selectedWarehouse, updateFormData])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Warehouse Selection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Select Warehouse *</Label>
            <Select value={formData.selectedWarehouseId} onValueChange={(value) => updateFormData({ selectedWarehouseId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a warehouse" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                {warehouses.map((warehouse) => (
                  <SelectItem key={warehouse._id || ''} value={warehouse._id || ''} className="bg-white hover:bg-gray-50">
                    {warehouse.warehouseName} ({warehouse.warehouseCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.selectedWarehouse && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <Label className="text-sm font-medium text-gray-600">Warehouse Code</Label>
                <p className="text-sm">{formData.selectedWarehouse.warehouseCode}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Type</Label>
                <p className="text-sm">{formData.selectedWarehouse.warehouseType}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Phone</Label>
                <p className="text-sm">{formData.selectedWarehouse.contactInfo?.primaryPhone || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Email</Label>
                <p className="text-sm">{formData.selectedWarehouse.contactInfo?.email || 'N/A'}</p>
              </div>
              <div className="md:col-span-2">
                <Label className="text-sm font-medium text-gray-600">Address</Label>
                <p className="text-sm">
                  {formData.selectedWarehouse.address?.addressLine1}, {formData.selectedWarehouse.address?.city}, {formData.selectedWarehouse.address?.state} - {formData.selectedWarehouse.address?.pincode}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
