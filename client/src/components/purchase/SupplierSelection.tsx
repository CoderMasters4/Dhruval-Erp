'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useGetSuppliersQuery } from '@/lib/api/suppliersApi'
import { useSelector } from 'react-redux'
import { selectTheme } from '@/lib/features/ui/uiSlice'
import { Truck } from 'lucide-react'
import { PurchaseOrderFormData } from './PurchaseOrderForm'

interface SupplierSelectionProps {
  formData: PurchaseOrderFormData
  updateFormData: (updates: Partial<PurchaseOrderFormData>) => void
}

export function SupplierSelection({ formData, updateFormData }: SupplierSelectionProps) {
  const theme = useSelector(selectTheme)
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
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <Truck className="h-5 w-5" />
          Supplier Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-900 dark:text-white">Select Supplier *</Label>
            <Select value={formData.selectedSupplierId} onValueChange={(value) => updateFormData({ selectedSupplierId: value })}>
              <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                <SelectValue placeholder="Select a supplier" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg z-50">
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier._id || ''} value={supplier._id || ''} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white">
                    {supplier.supplierName} ({supplier.supplierCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.selectedSupplier && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Supplier Code</Label>
                <p className="text-sm text-gray-900 dark:text-white">{formData.selectedSupplier.supplierCode}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Contact Person</Label>
                <p className="text-sm text-gray-900 dark:text-white">{formData.selectedSupplier.contactPerson || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone</Label>
                <p className="text-sm text-gray-900 dark:text-white">{formData.selectedSupplier.phone || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</Label>
                <p className="text-sm text-gray-900 dark:text-white">{formData.selectedSupplier.email || 'N/A'}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
