'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useGetInventoryItemsQuery } from '@/lib/api/inventoryApi'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '@/lib/features/auth/authSlice'
import { selectTheme } from '@/lib/features/ui/uiSlice'
import { Plus, X, Package } from 'lucide-react'
import { PurchaseOrderFormData } from './PurchaseOrderForm'

interface ItemsSectionProps {
  formData: PurchaseOrderFormData
  updateFormData: (updates: Partial<PurchaseOrderFormData>) => void
}

export function ItemsSection({ formData, updateFormData }: ItemsSectionProps) {
  const user = useSelector(selectCurrentUser)
  const theme = useSelector(selectTheme)
  const userCompanyId = user?.companyAccess?.[0]?.companyId

  // Get inventory items for the selected company
  const { data: inventoryData, isLoading: inventoryLoading, error: inventoryError } = useGetInventoryItemsQuery(
    { 
      companyId: formData.selectedCompanyId || userCompanyId,
      limit: 100 // Increase limit to get more items
    },
    { skip: !formData.selectedCompanyId && !userCompanyId }
  )
  const inventoryItems = inventoryData?.data?.data || []

  // Add new item
  const addItem = useCallback(() => {
    const newItem = {
      itemCode: '',
      itemName: '',
      description: '',
      specifications: '',
      hsnCode: '',
      quantity: 0,
      unit: 'pcs',
      rate: 0,
      itemType: 'new' as const,
      category: 'raw_material' as const,
      discount: { type: 'percentage' as const, value: 0 },
      discountAmount: 0,
      taxableAmount: 0,
      taxBreakup: [
        { taxType: 'CGST' as const, rate: 9, amount: 0 },
        { taxType: 'SGST' as const, rate: 9, amount: 0 }
      ],
      totalTaxAmount: 0,
      lineTotal: 0,
      deliveryDate: '',
      notes: ''
    }
    updateFormData({ items: [...formData.items, newItem] })
  }, [formData.items, updateFormData])

  // Remove item
  const removeItem = useCallback((index: number) => {
    updateFormData({ items: formData.items.filter((_, i) => i !== index) })
  }, [formData.items, updateFormData])

  // Update item
  const updateItem = useCallback((index: number, field: string, value: any) => {
    const updatedItems = [...formData.items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    
    // Recalculate item totals
    const item = updatedItems[index]
    const discountAmount = item.discount.type === 'percentage' 
      ? (item.quantity * item.rate * item.discount.value / 100)
      : item.discount.value
    
    item.discountAmount = discountAmount
    item.taxableAmount = (item.quantity * item.rate) - discountAmount
    
    // Calculate tax (assuming 18% GST for now)
    const taxRate = 18
    item.totalTaxAmount = item.taxableAmount * taxRate / 100
    
    // Update tax breakup
    item.taxBreakup = [
      { taxType: 'CGST' as const, rate: 9, amount: item.totalTaxAmount / 2 },
      { taxType: 'SGST' as const, rate: 9, amount: item.totalTaxAmount / 2 }
    ]
    
    item.lineTotal = item.taxableAmount + item.totalTaxAmount
    
    updateFormData({ items: updatedItems })
  }, [formData.items, updateFormData])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-gray-900 dark:text-white">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Items
          </div>
          <Button 
            type="button" 
            onClick={addItem} 
            variant="outline" 
            size="sm"
            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {formData.items.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-500" />
            <p>No items added yet. Click "Add Item" to start.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={`item-${index}-${item.itemCode || item.itemName || Date.now()}`} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4 bg-gray-50 dark:bg-gray-700">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 dark:text-white">Item {index + 1}</h4>
                  <Button
                    type="button"
                    onClick={() => removeItem(index)}
                    variant="outline"
                    size="sm"
                    className="border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-800"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Item Selection Type */}
                  <div className="space-y-2">
                    <Label className="text-gray-900 dark:text-white">Item Type</Label>
                    <Select 
                      value={item.itemType || 'new'} 
                      onValueChange={(value) => updateItem(index, 'itemType', value)}
                    >
                      <SelectTrigger className="bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg z-50">
                        <SelectItem value="new" className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white">New Item</SelectItem>
                        <SelectItem value="existing" className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white">Existing Item</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Existing Item Selection */}
                  {item.itemType === 'existing' && (
                    <div className="space-y-2">
                      <Label className="text-gray-900 dark:text-white">Select Existing Item</Label>
                      <Select 
                        value={item.selectedInventoryItemId || ''} 
                        onValueChange={(value) => {
                          const selectedItem = inventoryItems.find(inv => inv._id === value);
                          if (selectedItem) {
                            // Update all item fields with selected inventory item data in a single update
                            const updatedItems = [...formData.items];
                            const currentItem = updatedItems[index];
                            
                            // Update all fields at once
                            updatedItems[index] = {
                              ...currentItem,
                              selectedInventoryItemId: value,
                              itemId: value,
                              itemCode: selectedItem.itemCode || '',
                              itemName: selectedItem.itemName || '',
                              description: selectedItem.itemDescription || '',
                              unit: selectedItem.stock?.unit || 'pcs',
                              currentStock: selectedItem.stock?.currentStock || 0,
                              availableStock: selectedItem.stock?.availableStock || 0,
                              rate: selectedItem.pricing?.costPrice || 0,
                              hsnCode: '', // HSN code not available in inventory
                              specifications: `${selectedItem.specifications?.color || ''} ${selectedItem.specifications?.design || ''}`.trim(),
                              quantity: currentItem.quantity <= 0 ? 1 : currentItem.quantity
                            };
                            
                            // Recalculate totals for the updated item
                            const item = updatedItems[index];
                            const discountAmount = item.discount.type === 'percentage' 
                              ? (item.quantity * item.rate * item.discount.value / 100)
                              : item.discount.value;
                            
                            item.discountAmount = discountAmount;
                            item.taxableAmount = (item.quantity * item.rate) - discountAmount;
                            
                            // Calculate tax (assuming 18% GST for now)
                            const taxRate = 18;
                            item.totalTaxAmount = item.taxableAmount * taxRate / 100;
                            
                            // Update tax breakup
                            item.taxBreakup = [
                              { taxType: 'CGST' as const, rate: 9, amount: item.totalTaxAmount / 2 },
                              { taxType: 'SGST' as const, rate: 9, amount: item.totalTaxAmount / 2 }
                            ];
                            
                            item.lineTotal = item.taxableAmount + item.totalTaxAmount;
                            
                            // Update the form data with all changes at once
                            updateFormData({ items: updatedItems });
                          }
                        }}
                      >
                        <SelectTrigger className="z-50 bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white">
                          <SelectValue placeholder="Select existing item" />
                        </SelectTrigger>
                        <SelectContent className="z-50 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          {inventoryLoading ? (
                            <div className="px-2 py-1.5 text-sm text-gray-500 dark:text-gray-400">
                              Loading inventory items...
                            </div>
                          ) : inventoryError ? (
                            <div className="px-2 py-1.5 text-sm text-red-500 dark:text-red-400">
                              Error loading inventory items
                            </div>
                          ) : inventoryItems.length === 0 ? (
                            <div className="px-2 py-1.5 text-sm text-gray-500 dark:text-gray-400">
                              No inventory items available for this company
                            </div>
                          ) : (
                            inventoryItems.map((invItem) => (
                              <SelectItem key={invItem._id} value={invItem._id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white">
                                {invItem.itemName} ({invItem.itemCode}) - Stock: {invItem.stock?.currentStock || 0} {invItem.stock?.unit || 'pcs'} - ₹{invItem.pricing?.costPrice || 0}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {item.selectedInventoryItemId && (
                        <div className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900 p-2 rounded">
                          ✓ Item selected: {item.itemName} ({item.itemCode})
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-gray-900 dark:text-white">Item Code *</Label>
                    <Input
                      value={item.itemCode}
                      onChange={(e) => updateItem(index, 'itemCode', e.target.value)}
                      placeholder="Item code"
                      required
                      disabled={item.itemType === 'existing'}
                      className={`bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${item.itemType === 'existing' && item.itemCode ? 'bg-green-50 dark:bg-green-900 border-green-300 dark:border-green-600' : ''}`}
                    />
                    {item.itemType === 'existing' && item.itemCode && (
                      <p className="text-xs text-green-600 dark:text-green-400">✓ Auto-filled from inventory</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-900 dark:text-white">Item Name *</Label>
                    <Input
                      value={item.itemName}
                      onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                      placeholder="Item name"
                      required
                      disabled={item.itemType === 'existing'}
                      className={`bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${item.itemType === 'existing' && item.itemName ? 'bg-green-50 dark:bg-green-900 border-green-300 dark:border-green-600' : ''}`}
                    />
                    {item.itemType === 'existing' && item.itemName && (
                      <p className="text-xs text-green-600 dark:text-green-400">✓ Auto-filled from inventory</p>
                    )}
                  </div>

                  {/* Category Selection - Only for new items */}
                  {item.itemType === 'new' && (
                    <div className="space-y-2 col-span-full">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <span className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full"></span>
                        Category *
                      </Label>
                      <Select 
                        value={item.category || 'raw_material'} 
                        onValueChange={(value) => updateItem(index, 'category', value)}
                      >
                        <SelectTrigger className="bg-purple-50 dark:bg-purple-900 border-purple-200 dark:border-purple-600 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-purple-500 dark:focus:ring-purple-400 w-full h-10 text-gray-900 dark:text-white">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg z-50">
                          <SelectItem value="raw_material" className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white">Raw Material</SelectItem>
                          <SelectItem value="finished_goods" className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white">Finished Goods</SelectItem>
                          <SelectItem value="consumables" className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white">Consumables</SelectItem>
                          <SelectItem value="services" className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white">Services</SelectItem>
                          <SelectItem value="capital_goods" className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white">Capital Goods</SelectItem>
                          <SelectItem value="maintenance" className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white">Maintenance</SelectItem>
                          <SelectItem value="spare_parts" className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white">Spare Parts</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-gray-900 dark:text-white">HSN Code</Label>
                    <Input
                      value={item.hsnCode}
                      onChange={(e) => updateItem(index, 'hsnCode', e.target.value)}
                      placeholder="HSN code"
                      className="bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-900 dark:text-white">Specifications</Label>
                    <Input
                      value={item.specifications}
                      onChange={(e) => updateItem(index, 'specifications', e.target.value)}
                      placeholder="Specifications"
                      className="bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-900 dark:text-white">Quantity *</Label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      required
                      className="bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-900 dark:text-white">Unit</Label>
                    <Select value={item.unit} onValueChange={(value) => updateItem(index, 'unit', value)}>
                      <SelectTrigger className="bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg z-50">
                        <SelectItem value="pcs" className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white">Pieces</SelectItem>
                        <SelectItem value="kg" className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white">Kilograms</SelectItem>
                        <SelectItem value="meters" className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white">Meters</SelectItem>
                        <SelectItem value="liters" className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white">Liters</SelectItem>
                        <SelectItem value="boxes" className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white">Boxes</SelectItem>
                        <SelectItem value="sets" className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white">Sets</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Stock Information for Existing Items */}
                  {item.itemType === 'existing' && item.currentStock !== undefined && (
                    <div className="col-span-full p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Stock Information</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Current Stock:</span>
                          <span className="ml-1 font-medium text-gray-900 dark:text-white">
                            {item.currentStock} {item.unit}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Available Stock:</span>
                          <span className="ml-1 font-medium text-gray-900 dark:text-white">
                            {item.availableStock} {item.unit}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Cost Price:</span>
                          <span className="ml-1 font-medium text-gray-900 dark:text-white">
                            ₹{item.rate}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Item Code:</span>
                          <span className="ml-1 font-medium text-gray-900 dark:text-white">
                            {item.itemCode}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-gray-900 dark:text-white">Rate (₹) *</Label>
                    <Input
                      type="number"
                      value={item.rate}
                      onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                      className={`bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${item.itemType === 'existing' && item.rate > 0 ? 'bg-green-50 dark:bg-green-900 border-green-300 dark:border-green-600' : ''}`}
                    />
                    {item.itemType === 'existing' && item.rate > 0 && (
                      <p className="text-xs text-green-600 dark:text-green-400">✓ Auto-filled from inventory</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-900 dark:text-white">Discount Type</Label>
                    <Select value={item.discount.type} onValueChange={(value: any) => updateItem(index, 'discount', { ...item.discount, type: value })}>
                      <SelectTrigger className="bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg z-50">
                        <SelectItem value="percentage" className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white">Percentage (%)</SelectItem>
                        <SelectItem value="amount" className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white">Amount (₹)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-900 dark:text-white">Discount Value</Label>
                    <Input
                      type="number"
                      value={item.discount.value}
                      onChange={(e) => updateItem(index, 'discount', { ...item.discount, value: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      className="bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-900 dark:text-white">Delivery Date</Label>
                    <Input
                      type="date"
                      value={item.deliveryDate}
                      onChange={(e) => updateItem(index, 'deliveryDate', e.target.value)}
                      className="bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-900 dark:text-white">Description</Label>
                  <Textarea
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    placeholder="Item description..."
                    rows={2}
                    className="bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>

                {/* Item Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Subtotal</Label>
                    <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(item.quantity * item.rate)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Discount</Label>
                    <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(item.discountAmount)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Tax</Label>
                    <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(item.totalTaxAmount)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</Label>
                    <p className="font-medium text-blue-600 dark:text-blue-400">{formatCurrency(item.lineTotal)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
