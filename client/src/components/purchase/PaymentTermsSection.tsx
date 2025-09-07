'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CreditCard } from 'lucide-react'
import { PurchaseOrderFormData } from './PurchaseOrderForm'

interface PaymentTermsSectionProps {
  formData: PurchaseOrderFormData
  updateFormData: (updates: Partial<PurchaseOrderFormData>) => void
}

export function PaymentTermsSection({ formData, updateFormData }: PaymentTermsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Terms
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Payment Term</Label>
            <Select value={formData.paymentTermType} onValueChange={(value: any) => updateFormData({ paymentTermType: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="net">Net</SelectItem>
                <SelectItem value="advance">Advance</SelectItem>
                <SelectItem value="cod">Cash on Delivery</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
                <SelectItem value="milestone">Milestone</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Payment Days</Label>
            <Input
              type="number"
              value={formData.paymentDays}
              onChange={(e) => updateFormData({ paymentDays: parseInt(e.target.value) || 0 })}
              placeholder="30"
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label>Advance Percentage (%)</Label>
            <Input
              type="number"
              value={formData.advancePercentage}
              onChange={(e) => updateFormData({ advancePercentage: parseFloat(e.target.value) || 0 })}
              placeholder="0"
              min="0"
              max="100"
              step="0.01"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}



