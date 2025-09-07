'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { DollarSign } from 'lucide-react'
import { PurchaseOrderFormData } from './PurchaseOrderForm'

interface ChargesSectionProps {
  formData: PurchaseOrderFormData
  updateFormData: (updates: Partial<PurchaseOrderFormData>) => void
}

export function ChargesSection({ formData, updateFormData }: ChargesSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Additional Charges
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Freight Charges (₹)</Label>
            <Input
              type="number"
              value={formData.freightCharges}
              onChange={(e) => updateFormData({ freightCharges: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <Label>Packing Charges (₹)</Label>
            <Input
              type="number"
              value={formData.packingCharges}
              onChange={(e) => updateFormData({ packingCharges: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <Label>Other Charges (₹)</Label>
            <Input
              type="number"
              value={formData.otherCharges}
              onChange={(e) => updateFormData({ otherCharges: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}



