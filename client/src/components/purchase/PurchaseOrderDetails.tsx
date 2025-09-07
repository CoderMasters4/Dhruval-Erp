'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Package } from 'lucide-react'
import { PurchaseOrderFormData } from './PurchaseOrderForm'

interface PurchaseOrderDetailsProps {
  formData: PurchaseOrderFormData
  updateFormData: (updates: Partial<PurchaseOrderFormData>) => void
  isSuperAdmin: boolean
  companies: Array<{ _id: string; companyName: string; companyCode: string }>
}

export function PurchaseOrderDetails({ formData, updateFormData, isSuperAdmin, companies }: PurchaseOrderDetailsProps) {
  return (
    <>
      {/* Company Selection (Super Admin Only) */}
      {isSuperAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Company Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Select Company *</Label>
              <Select value={formData.selectedCompanyId} onValueChange={(value) => updateFormData({ selectedCompanyId: value })}>
                <SelectTrigger>
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
            </div>
          </CardContent>
        </Card>
      )}

      {/* Purchase Order Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Purchase Order Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>PO Number *</Label>
              <Input
                value={formData.poNumber}
                onChange={(e) => updateFormData({ poNumber: e.target.value })}
                placeholder="PO-2024-001"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>PO Date *</Label>
              <Input
                type="date"
                value={formData.poDate}
                onChange={(e) => updateFormData({ poDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Expected Delivery Date *</Label>
              <Input
                type="date"
                value={formData.expectedDeliveryDate}
                onChange={(e) => updateFormData({ expectedDeliveryDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Financial Year *</Label>
              <Input
                value={formData.financialYear}
                onChange={(e) => updateFormData({ financialYear: e.target.value })}
                placeholder="2024-2025"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>PO Type *</Label>
              <Select value={formData.poType} onValueChange={(value: any) => updateFormData({ poType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="blanket">Blanket</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="capital">Capital</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority *</Label>
              <Select value={formData.priority} onValueChange={(value: any) => updateFormData({ priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={formData.category} onValueChange={(value: any) => updateFormData({ category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="raw_material">Raw Material</SelectItem>
                  <SelectItem value="finished_goods">Finished Goods</SelectItem>
                  <SelectItem value="consumables">Consumables</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                  <SelectItem value="capital_goods">Capital Goods</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
