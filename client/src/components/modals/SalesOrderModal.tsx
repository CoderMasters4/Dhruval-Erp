'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/textarea'

import { useGetCustomersQuery } from '@/lib/api/customersApi'
import { useGetInventoryItemsQuery } from '@/lib/api/inventoryApi'
import { useGetAllCompaniesQuery } from '@/lib/features/companies/companiesApi'
import { useCreateSalesOrderMutation, useUpdateSalesOrderMutation } from '@/lib/api/salesApi'
import toast from 'react-hot-toast'
import { X, Plus, Trash2, Search, ChevronDown, Check, Phone, Mail } from 'lucide-react'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '@/lib/features/auth/authSlice'

interface SalesOrderModalProps {
  isOpen: boolean
  onClose: () => void
  order?: any
  mode: 'create' | 'edit'
}

// Simple Searchable Dropdown Component
function SearchableDropdown({ 
  options, 
  value, 
  onSelect, 
  placeholder, 
  searchPlaceholder = "Search...",
  displayKey = "name",
  valueKey = "id",
  showDetails = false
}: {
  options: any[]
  value: string
  onSelect: (value: string) => void
  placeholder: string
  searchPlaceholder?: string
  displayKey?: string
  valueKey?: string
  showDetails?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItem, setSelectedItem] = useState<any>(null)

  const filteredOptions = options.filter(option => {
    const displayValue = option[displayKey] || ''
    const codeValue = option.customerCode || option.itemCode || ''
    const phoneValue = option.contactInfo?.primaryPhone || ''
    const emailValue = option.contactInfo?.primaryEmail || ''
    
    const searchLower = searchTerm.toLowerCase()
    return (
      displayValue.toLowerCase().includes(searchLower) ||
      codeValue.toLowerCase().includes(searchLower) ||
      phoneValue.toLowerCase().includes(searchLower) ||
      emailValue.toLowerCase().includes(searchLower)
    )
  })

  const handleSelect = (option: any) => {
    console.log('Option selected:', option)
    console.log('Value being passed:', option[valueKey])
    setSelectedItem(option)
    onSelect(option[valueKey])
    setIsOpen(false)
    setSearchTerm('')
  }

  useEffect(() => {
    if (value && options.length > 0) {
      const found = options.find(option => option[valueKey] === value)
      if (found) setSelectedItem(found)
    }
  }, [value, options, valueKey])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && !(event.target as Element).closest('.searchable-dropdown')) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative searchable-dropdown">
      <div
        className="flex items-center justify-between w-full px-3 py-2 border border-gray-300 rounded-md bg-white cursor-pointer hover:border-gray-400"
        onClick={() => {
          console.log('Dropdown clicked, current state:', isOpen)
          setIsOpen(!isOpen)
        }}
      >
        <span className={selectedItem ? "text-gray-900" : "text-gray-500"}>
          {selectedItem ? selectedItem[displayKey] : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-2 text-sm"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option[valueKey]}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => handleSelect(option)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{option[displayKey]}</div>
                      {showDetails && (
                        <div className="text-xs text-gray-500 mt-1 space-y-1">
                          {option.customerCode && (
                            <div>Code: {option.customerCode}</div>
                          )}
                          {option.itemCode && (
                            <div>Code: {option.itemCode}</div>
                          )}
                          {option.contactInfo?.primaryPhone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <span>{option.contactInfo.primaryPhone}</span>
                            </div>
                          )}
                          {option.contactInfo?.primaryEmail && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <span>{option.contactInfo.primaryEmail}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {selectedItem?.[valueKey] === option[valueKey] && (
                      <Check className="h-4 w-4 text-blue-600 ml-2" />
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">No options found</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function SalesOrderModal({ isOpen, onClose, order, mode }: SalesOrderModalProps) {
  const currentUser = useSelector(selectCurrentUser)
  const [selectedCompanyId, setSelectedCompanyId] = useState('')
  const [formData, setFormData] = useState({
    customerId: '',
    orderItems: [{ itemId: '', itemName: '', quantity: 1, unitPrice: 0, category: '' }],
    orderSummary: {
      subtotal: 0,
      totalTax: 0,
      totalDiscount: 0,
      finalAmount: 0
    },
    payment: {
      paymentTerms: '',
      paymentMethod: 'cash',
      creditDays: 0,
      advancePercentage: 0,
      advanceAmount: 0
    },
    delivery: {
      deliveryType: 'delivery',
      expectedDeliveryDate: '',
      deliveryInstructions: ''
    },
    priority: 'medium',
    status: 'draft',
    specialInstructions: '',
    orderType: 'local', // Added orderType
    orderSource: 'direct' // Added orderSource
  })

  // Debug logging for dropdown values
  console.log('Form Data:', {
    paymentMethod: formData.payment.paymentMethod,
    deliveryType: formData.delivery.deliveryType,
    priority: formData.priority,
    status: formData.status
  })

  const [createSalesOrder] = useCreateSalesOrderMutation()
  const [updateSalesOrder] = useUpdateSalesOrderMutation()
  
  // Get companies for superadmin
  const { data: companiesData } = useGetAllCompaniesQuery()
  
  const companies = companiesData?.data || []
  
  // Check if user is superadmin (has access to multiple companies)
  const isSuperAdmin = companies.length > 1
  
  // Get customers based on selected company (or all if not superadmin)
  const { data: customersData } = useGetCustomersQuery(
    isSuperAdmin ? { companyId: selectedCompanyId } : {},
    { skip: isSuperAdmin && !selectedCompanyId }
  )
  
  // Get inventory items based on selected company (or all if not superadmin)
  const { data: inventoryData } = useGetInventoryItemsQuery(
    isSuperAdmin ? { companyId: selectedCompanyId } : {},
    { skip: isSuperAdmin && !selectedCompanyId }
  )

  const customers = customersData?.data || []
  const inventoryItems = inventoryData?.data?.data || []

  // Debug logging for data
  console.log('Companies:', companies)
  console.log('Customers:', customers)
  console.log('Inventory Items:', inventoryItems)
  console.log('Selected Company ID:', selectedCompanyId)

  useEffect(() => {
    if (order && mode === 'edit') {
      setFormData({
        customerId: order.customerId || '',
        orderItems: order.orderItems || [{ itemId: '', itemName: '', quantity: 1, unitPrice: 0, category: '' }],
        orderSummary: order.orderSummary || {
          subtotal: 0,
          totalTax: 0,
          totalDiscount: 0,
          finalAmount: 0
        },
        payment: order.payment || {
          paymentTerms: '',
          paymentMethod: 'cash',
          creditDays: 0,
          advancePercentage: 0,
          advanceAmount: 0
        },
        delivery: order.delivery || {
          deliveryType: 'delivery',
          expectedDeliveryDate: '',
          deliveryInstructions: ''
        },
        priority: order.priority || 'medium',
        status: order.status || 'draft',
        specialInstructions: order.specialInstructions || '',
        orderType: order.orderType || 'local', // Set orderType for edit mode
        orderSource: order.orderSource || 'direct' // Set orderSource for edit mode
      })
      
      // Set company ID for edit mode
      if (order.companyId) {
        setSelectedCompanyId(order.companyId)
      }
    }
  }, [order, mode])

  const calculateTotals = () => {
    const subtotal = formData.orderItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
    const tax = subtotal * 0.18 // 18% GST
    const discount = 0 // Can be made configurable
    const finalAmount = subtotal + tax - discount

    setFormData(prev => ({
      ...prev,
      orderSummary: {
        subtotal,
        totalTax: tax,
        totalDiscount: discount,
        finalAmount
      }
    }))
  }

  const addOrderItem = () => {
    setFormData(prev => ({
      ...prev,
      orderItems: [...prev.orderItems, { itemId: '', itemName: '', quantity: 1, unitPrice: 0, category: '' }]
    }))
  }

  const removeOrderItem = (index: number) => {
    if (formData.orderItems.length > 1) {
      setFormData(prev => ({
        ...prev,
        orderItems: prev.orderItems.filter((_, i) => i !== index)
      }))
    }
  }

  const updateOrderItem = (index: number, field: string, value: any) => {
    console.log('updateOrderItem called:', { index, field, value })
    
    setFormData(prev => ({
      ...prev,
      orderItems: prev.orderItems.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value }
          
          // If itemId is selected, auto-fill item details
          if (field === 'itemId' && value) {
            console.log('Item ID selected:', value)
            const selectedItem = inventoryItems.find(invItem => invItem._id === value)
            console.log('Selected item:', selectedItem)
            if (selectedItem) {
              updatedItem.itemName = selectedItem.itemName
              updatedItem.unitPrice = selectedItem.pricing.sellingPrice || 0
              updatedItem.category = selectedItem.category.primary || ''
              console.log('Updated item with details:', updatedItem)
            }
          }
          
          return updatedItem
        }
        return item
      })
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedCompanyId) {
      toast.error('Please select a company')
      return
    }
    
    if (!formData.customerId) {
      toast.error('Please select a customer')
      return
    }
    
    try {
      // Create data that matches the backend API requirements
      const backendOrderData = {
        companyId: selectedCompanyId, // Add companyId as it's required
        customerId: formData.customerId,
        orderSource: formData.orderSource, // Use formData.orderSource
        orderType: formData.orderType, // Use formData.orderType
        orderNumber: `SO-${Date.now()}`,
        createdBy: currentUser?._id || 'current-user-id', // Add createdBy field

        orderItems: formData.orderItems.map(item => ({
          itemName: item.itemName,
          quantity: item.quantity,
          rate: item.unitPrice, // Backend expects 'rate' not 'unitPrice'
          unit: 'pieces',
          productType: 'saree', // Valid enum: 'saree', 'african_cotton', 'garment_fabric', 'digital_print', 'custom'
          category: item.category
        })),
        orderSummary: formData.orderSummary,
        payment: formData.payment,
        delivery: {
          ...formData.delivery,
          expectedDeliveryDate: formData.delivery.expectedDeliveryDate ? new Date(formData.delivery.expectedDeliveryDate) : new Date()
        },
        priority: formData.priority,
        status: formData.status,
        specialInstructions: formData.specialInstructions
      }

      // Use the backend data structure for API calls
      const orderData = backendOrderData as any

      if (mode === 'create') {
        await createSalesOrder(orderData).unwrap()
        toast.success('Sales order created successfully!')
      } else {
        await updateSalesOrder({ id: order._id, data: orderData }).unwrap()
        toast.success('Sales order updated successfully!')
      }
      
      onClose()
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to save sales order')
    }
  }

  useEffect(() => {
    calculateTotals()
  }, [formData.orderItems])

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            {mode === 'create' ? 'Create New Sales Order' : 'Edit Sales Order'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Selection (for superadmin) */}
          {isSuperAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company *
              </label>
              <select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a company...</option>
                {companies.map((company: any) => (
                  <option key={company._id} value={company._id}>
                    {company.companyName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Order Type and Source */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Type *
              </label>
              <select
                value={formData.orderType || 'local'}
                onChange={(e) => setFormData(prev => ({ ...prev, orderType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="local">Local</option>
                <option value="export">Export</option>
                <option value="custom">Custom</option>
                <option value="sample">Sample</option>
                <option value="bulk">Bulk</option>
                <option value="repeat">Repeat</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Source *
              </label>
              <select
                value={formData.orderSource || 'direct'}
                onChange={(e) => setFormData(prev => ({ ...prev, orderSource: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="direct">Direct</option>
                <option value="meesho">Meesho</option>
                <option value="indiamart">IndiaMART</option>
                <option value="website">Website</option>
                <option value="phone">Phone</option>
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="exhibition">Exhibition</option>
              </select>
            </div>
          </div>

          {/* Customer Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer *
            </label>
            <SearchableDropdown
              options={customers.map(customer => ({
                ...customer,
                displayName: (customer as any).customerName || customer.name || customer.companyName || customer.customerCode
              }))}
              value={formData.customerId}
              onSelect={(value) => {
                console.log('Customer selected:', value)
                setFormData(prev => ({ ...prev, customerId: value }))
              }}
              placeholder="Select a customer..."
              searchPlaceholder="Search customers by name or code..."
              displayKey="displayName"
              valueKey="_id"
              showDetails={true}
            />
          </div>

          {/* Order Type and Source */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Type *
              </label>
              <select
                value={formData.orderType || 'local'}
                onChange={(e) => setFormData(prev => ({ ...prev, orderType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="local">Local</option>
                <option value="export">Export</option>
                <option value="custom">Custom</option>
                <option value="sample">Sample</option>
                <option value="bulk">Bulk</option>
                <option value="repeat">Repeat</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Source *
              </label>
              <select
                value={formData.orderSource || 'direct'}
                onChange={(e) => setFormData(prev => ({ ...prev, orderSource: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="direct">Direct</option>
                <option value="meesho">Meesho</option>
                <option value="indiamart">IndiaMART</option>
                <option value="website">Website</option>
                <option value="phone">Phone</option>
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="exhibition">Exhibition</option>
              </select>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Order Items *
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOrderItem}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {formData.orderItems.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Item Selection */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Item *
                      </label>
                      <SearchableDropdown
                        options={inventoryItems.map(item => ({
                          ...item,
                          displayName: `${item.itemName} (${item.itemCode})`
                        }))}
                        value={item.itemId}
                        onSelect={(value) => updateOrderItem(index, 'itemId', value)}
                        placeholder="Select an item..."
                        searchPlaceholder="Search items by name or code..."
                        displayKey="displayName"
                        valueKey="_id"
                        showDetails={true}
                      />
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity
                      </label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full"
                      />
                    </div>

                    {/* Unit Price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unit Price (₹)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateOrderItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Item Details */}
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Item Name
                      </label>
                      <Input
                        value={item.itemName}
                        onChange={(e) => updateOrderItem(index, 'itemName', e.target.value)}
                        placeholder="Item name"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <Input
                        value={item.category}
                        onChange={(e) => updateOrderItem(index, 'category', e.target.value)}
                        placeholder="Category"
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Remove Button */}
                  {formData.orderItems.length > 1 && (
                    <div className="mt-3 flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeOrderItem(index)}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Order Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtotal</label>
                <p className="text-lg font-semibold">₹{formData.orderSummary.subtotal.toFixed(2)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax (18%)</label>
                <p className="text-lg font-semibold">₹{formData.orderSummary.totalTax.toFixed(2)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
                <p className="text-lg font-semibold">₹{formData.orderSummary.totalDiscount.toFixed(2)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
                <p className="text-xl font-bold text-blue-600">₹{formData.orderSummary.finalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <select
                value={formData.payment.paymentMethod}
                onChange={(e) => {
                  console.log('Payment method changed to:', e.target.value)
                  setFormData(prev => ({
                    ...prev,
                    payment: { ...prev.payment, paymentMethod: e.target.value }
                  }))
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onClick={() => console.log('Payment method dropdown clicked')}
              >
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="upi">UPI</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms</label>
              <Input
                value={formData.payment.paymentTerms}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  payment: { ...prev.payment, paymentTerms: e.target.value }
                }))}
                placeholder="e.g., Net 30 days"
              />
            </div>
          </div>

          {/* Delivery Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Type</label>
              <select
                value={formData.delivery.deliveryType}
                onChange={(e) => {
                  console.log('Delivery type changed to:', e.target.value)
                  setFormData(prev => ({
                    ...prev,
                    delivery: { ...prev.delivery, deliveryType: e.target.value }
                  }))
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onClick={() => console.log('Delivery type dropdown clicked')}
              >
                <option value="delivery">Delivery</option>
                <option value="pickup">Pickup</option>
                <option value="shipping">Shipping</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expected Delivery Date</label>
              <Input
                type="date"
                value={formData.delivery.expectedDeliveryDate}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  delivery: { ...prev.delivery, expectedDeliveryDate: e.target.value }
                }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Instructions</label>
            <Textarea
              value={formData.delivery.deliveryInstructions}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                delivery: { ...prev.delivery, deliveryInstructions: e.target.value }
              }))}
              placeholder="Any special delivery instructions..."
              rows={3}
            />
          </div>

          {/* Priority and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => {
                  console.log('Priority changed to:', e.target.value)
                  setFormData(prev => ({ ...prev, priority: e.target.value }))
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onClick={() => console.log('Priority dropdown clicked')}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => {
                  console.log('Status changed to:', e.target.value)
                  setFormData(prev => ({ ...prev, status: e.target.value }))
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onClick={() => console.log('Status dropdown clicked')}
              >
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Special Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions</label>
            <Textarea
              value={formData.specialInstructions}
              onChange={(e) => setFormData(prev => ({ ...prev, specialInstructions: e.target.value }))}
              placeholder="Any special instructions or notes..."
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {mode === 'create' ? 'Create Order' : 'Update Order'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
