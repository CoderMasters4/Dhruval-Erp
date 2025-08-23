'use client'

import { useState } from 'react'
import { X, Package, Save, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface CreateInventoryItemModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
}

export function CreateInventoryItemModal({ isOpen, onClose, onSubmit }: CreateInventoryItemModalProps) {
  const [formData, setFormData] = useState({
    itemCode: '',
    itemName: '',
    itemDescription: '',
    category: {
      primary: 'raw_material',
      secondary: '',
      tertiary: ''
    },
    productType: 'saree',
    specifications: {
      gsm: '',
      width: '',
      length: '',
      color: '',
      design: '',
      pattern: ''
    },
    stock: {
      currentStock: '',
      unit: 'meters',
      reorderLevel: '',
      minStockLevel: '',
      maxStockLevel: ''
    },
    pricing: {
      costPrice: '',
      sellingPrice: '',
      currency: 'INR'
    }
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await onSubmit(formData)
      onClose()
      setFormData({
        itemCode: '',
        itemName: '',
        itemDescription: '',
        category: {
          primary: 'raw_material',
          secondary: '',
          tertiary: ''
        },
        productType: 'saree',
        specifications: {
          gsm: '',
          width: '',
          length: '',
          color: '',
          design: '',
          pattern: ''
        },
        stock: {
          currentStock: '',
          unit: 'meters',
          reorderLevel: '',
          minStockLevel: '',
          maxStockLevel: ''
        },
        pricing: {
          costPrice: '',
          sellingPrice: '',
          currency: 'INR'
        }
      })
    } catch (error) {
      console.error('Error creating inventory item:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-sky-100 rounded-lg">
              <Package className="h-5 w-5 text-sky-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Create New Inventory Item</h2>
              <p className="text-sm text-gray-600">Add a new item to your textile inventory</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Code *
                  </label>
                  <Input
                    value={formData.itemCode}
                    onChange={(e) => handleInputChange('itemCode', e.target.value)}
                    placeholder="e.g., SAR001"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name *
                  </label>
                  <Input
                    value={formData.itemName}
                    onChange={(e) => handleInputChange('itemName', e.target.value)}
                    placeholder="e.g., Silk Saree - Red"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                  rows={3}
                  value={formData.itemDescription}
                  onChange={(e) => handleInputChange('itemDescription', e.target.value)}
                  placeholder="Detailed description of the item..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Category & Type */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Category & Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Category *
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={formData.category.primary}
                    onChange={(e) => handleInputChange('category.primary', e.target.value)}
                    required
                  >
                    <option value="raw_material">Raw Material</option>
                    <option value="semi_finished">Semi Finished</option>
                    <option value="finished_goods">Finished Goods</option>
                    <option value="consumables">Consumables</option>
                    <option value="spare_parts">Spare Parts</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Type *
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={formData.productType}
                    onChange={(e) => handleInputChange('productType', e.target.value)}
                    required
                  >
                    <option value="saree">Saree</option>
                    <option value="african">African Cotton</option>
                    <option value="garment">Garment Fabric</option>
                    <option value="digital_print">Digital Print</option>
                    <option value="custom">Custom</option>
                    <option value="chemical">Chemical</option>
                    <option value="dye">Dye</option>
                    <option value="machinery">Machinery</option>
                    <option value="yarn">Yarn</option>
                    <option value="thread">Thread</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GSM
                  </label>
                  <Input
                    type="number"
                    value={formData.specifications.gsm}
                    onChange={(e) => handleInputChange('specifications.gsm', e.target.value)}
                    placeholder="e.g., 120"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Width (cm)
                  </label>
                  <Input
                    type="number"
                    value={formData.specifications.width}
                    onChange={(e) => handleInputChange('specifications.width', e.target.value)}
                    placeholder="e.g., 110"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Length (m)
                  </label>
                  <Input
                    type="number"
                    value={formData.specifications.length}
                    onChange={(e) => handleInputChange('specifications.length', e.target.value)}
                    placeholder="e.g., 5.5"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <Input
                    value={formData.specifications.color}
                    onChange={(e) => handleInputChange('specifications.color', e.target.value)}
                    placeholder="e.g., Red"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Design
                  </label>
                  <Input
                    value={formData.specifications.design}
                    onChange={(e) => handleInputChange('specifications.design', e.target.value)}
                    placeholder="e.g., Floral"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pattern
                  </label>
                  <Input
                    value={formData.specifications.pattern}
                    onChange={(e) => handleInputChange('specifications.pattern', e.target.value)}
                    placeholder="e.g., Traditional"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stock Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Stock Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Stock *
                  </label>
                  <Input
                    type="number"
                    value={formData.stock.currentStock}
                    onChange={(e) => handleInputChange('stock.currentStock', e.target.value)}
                    placeholder="e.g., 100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit *
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={formData.stock.unit}
                    onChange={(e) => handleInputChange('stock.unit', e.target.value)}
                    required
                  >
                    <option value="meters">Meters</option>
                    <option value="pieces">Pieces</option>
                    <option value="kg">Kilograms</option>
                    <option value="liters">Liters</option>
                    <option value="yards">Yards</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reorder Level
                  </label>
                  <Input
                    type="number"
                    value={formData.stock.reorderLevel}
                    onChange={(e) => handleInputChange('stock.reorderLevel', e.target.value)}
                    placeholder="e.g., 20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Stock Level
                  </label>
                  <Input
                    type="number"
                    value={formData.stock.minStockLevel}
                    onChange={(e) => handleInputChange('stock.minStockLevel', e.target.value)}
                    placeholder="e.g., 10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Stock Level
                  </label>
                  <Input
                    type="number"
                    value={formData.stock.maxStockLevel}
                    onChange={(e) => handleInputChange('stock.maxStockLevel', e.target.value)}
                    placeholder="e.g., 500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cost Price
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.pricing.costPrice}
                    onChange={(e) => handleInputChange('pricing.costPrice', e.target.value)}
                    placeholder="e.g., 1500.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selling Price
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.pricing.sellingPrice}
                    onChange={(e) => handleInputChange('pricing.sellingPrice', e.target.value)}
                    placeholder="e.g., 2000.00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <AlertCircle className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Item
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
