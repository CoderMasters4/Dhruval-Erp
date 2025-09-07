'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useGetSuppliersQuery } from '@/lib/api/suppliersApi'
import { Truck } from 'lucide-react'
import { PurchaseOrderFormData } from './PurchaseOrderForm'

interface SupplierSelectionProps {
  formData: PurchaseOrderFormData
  updateFormData: (updates: Partial<PurchaseOrderFormData>) => void
}

export function SupplierSelection({ formData, updateFormData }: SupplierSelectionProps) {
  const { data: suppliersData } = useGetSuppliersQuery({
    page: 1,
    limit: 100
  })

  const suppliers = suppliersData?.data?.data || []

  // Handle supplier selection
  useEffect(() => {
    if (formData.selectedSupplierId) {
      const supplier = suppliers.find(s => s._id === formData.selectedSupplierId)
      if (supplier && (!formData.selectedSupplier || formData.selectedSupplier._id !== supplier._id)) {
        updateFormData({ selectedSupplier: supplier })
      }
    } else if (formData.selectedSupplier) {
      updateFormData({ selectedSupplier: null })
    }
  }, [formData.selectedSupplierId, suppliers, formData.selectedSupplier, updateFormData])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Supplier Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Select Supplier *</Label>
            <Select value={formData.selectedSupplierId} onValueChange={(value) => updateFormData({ selectedSupplierId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier._id || ''} value={supplier._id || ''}>
                    {supplier.supplierName} ({supplier.supplierCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.selectedSupplier && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <Label className="text-sm font-medium text-gray-600">Supplier Code</Label>
                <p className="text-sm">{formData.selectedSupplier.supplierCode}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Contact Person</Label>
                <p className="text-sm">{formData.selectedSupplier.contactPerson || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Phone</Label>
                <p className="text-sm">{formData.selectedSupplier.phone || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Email</Label>
                <p className="text-sm">{formData.selectedSupplier.email || 'N/A'}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
