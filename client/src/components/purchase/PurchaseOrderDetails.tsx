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
                <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                  {companies.map((company) => (
                    <SelectItem key={company._id} value={company._id} className="bg-white hover:bg-gray-50">
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
                <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                  <SelectItem value="standard" className="bg-white hover:bg-gray-50">Standard</SelectItem>
                  <SelectItem value="blanket" className="bg-white hover:bg-gray-50">Blanket</SelectItem>
                  <SelectItem value="contract" className="bg-white hover:bg-gray-50">Contract</SelectItem>
                  <SelectItem value="planned" className="bg-white hover:bg-gray-50">Planned</SelectItem>
                  <SelectItem value="emergency" className="bg-white hover:bg-gray-50">Emergency</SelectItem>
                  <SelectItem value="service" className="bg-white hover:bg-gray-50">Service</SelectItem>
                  <SelectItem value="capital" className="bg-white hover:bg-gray-50">Capital</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority *</Label>
              <Select value={formData.priority} onValueChange={(value: any) => updateFormData({ priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                  <SelectItem value="low" className="bg-white hover:bg-gray-50">Low</SelectItem>
                  <SelectItem value="medium" className="bg-white hover:bg-gray-50">Medium</SelectItem>
                  <SelectItem value="high" className="bg-white hover:bg-gray-50">High</SelectItem>
                  <SelectItem value="urgent" className="bg-white hover:bg-gray-50">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={formData.category} onValueChange={(value: any) => updateFormData({ category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                  <SelectItem value="raw_material" className="bg-white hover:bg-gray-50">Raw Material</SelectItem>
                  <SelectItem value="finished_goods" className="bg-white hover:bg-gray-50">Finished Goods</SelectItem>
                  <SelectItem value="consumables" className="bg-white hover:bg-gray-50">Consumables</SelectItem>
                  <SelectItem value="services" className="bg-white hover:bg-gray-50">Services</SelectItem>
                  <SelectItem value="capital_goods" className="bg-white hover:bg-gray-50">Capital Goods</SelectItem>
                  <SelectItem value="maintenance" className="bg-white hover:bg-gray-50">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
