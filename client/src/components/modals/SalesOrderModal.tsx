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
  onSuccess?: (orderData: any) => void
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

export default function SalesOrderModal({ isOpen, onClose, order, mode, onSuccess }: SalesOrderModalProps) {
  const currentUser = useSelector(selectCurrentUser)
  const [selectedCompanyId, setSelectedCompanyId] = useState('')
  const [isAddressAutoPopulated, setIsAddressAutoPopulated] = useState(false)

  // Function to handle delivery address field changes
  const handleDeliveryAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      delivery: {
        ...prev.delivery,
        deliveryAddress: {
          ...prev.delivery.deliveryAddress,
          [field]: value
        }
      }
    }))
    
    // If user manually edits, mark as not auto-populated
    if (isAddressAutoPopulated) {
      setIsAddressAutoPopulated(false)
    }
  }
  const [formData, setFormData] = useState({
    customerId: '',
    orderItems: [{ 
      itemId: '', 
      itemName: '', 
      quantity: 1, 
      rate: 0, // Changed from unitPrice to rate to match backend
      category: '', 
      stockInfo: null as any,
      productType: 'saree' // Added required productType
    }],
    orderSummary: {
      subtotal: 0,
      totalTax: 0,
      totalDiscount: 0,
      finalAmount: 0
    },
    payment: {
      paymentTerms: '',
      paymentMethod: 'bank_transfer', // Changed default to match backend
      creditDays: 0,
      advancePercentage: 0,
      advanceAmount: 0
    },
    delivery: {
      deliveryType: 'delivery',
      expectedDeliveryDate: '',
      deliveryInstructions: '',
      deliveryAddress: { // Added delivery address structure
        contactPerson: '',
        phone: '',
        email: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        landmark: ''
      }
    },
    priority: 'medium',
    status: 'draft',
    specialInstructions: '',
    orderType: 'local',
    orderSource: 'direct'
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
  
  // Set company ID for non-superadmin users
  useEffect(() => {
    if (!isSuperAdmin && currentUser?.companyId) {
      setSelectedCompanyId(currentUser.companyId)
    }
  }, [isSuperAdmin, currentUser?.companyId])
  
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
        orderItems: order.orderItems || [{ 
          itemId: '', 
          itemName: '', 
          quantity: 1, 
          rate: 0, // Changed from unitPrice to rate
          category: '', 
          stockInfo: null as any,
          productType: 'saree'
        }],
        orderSummary: order.orderSummary || {
          subtotal: 0,
          totalTax: 0,
          totalDiscount: 0,
          finalAmount: 0
        },
        payment: order.payment || {
          paymentTerms: '',
          paymentMethod: 'bank_transfer',
          creditDays: 0,
          advancePercentage: 0,
          advanceAmount: 0
        },
        delivery: order.delivery || {
          deliveryType: 'delivery',
          expectedDeliveryDate: '',
          deliveryInstructions: '',
          deliveryAddress: {
            contactPerson: '',
            phone: '',
            email: '',
            addressLine1: '',
            addressLine2: '',
            city: '',
            state: '',
            pincode: '',
            country: 'India',
            landmark: ''
          }
        },
        priority: order.priority || 'medium',
        status: order.status || 'draft',
        specialInstructions: order.specialInstructions || '',
        orderType: order.orderType || 'local',
        orderSource: order.orderSource || 'direct'
      })
      
      // Set company ID for edit mode
      if (order.companyId) {
        setSelectedCompanyId(order.companyId)
      }
    }
  }, [order, mode])

  const calculateTotals = () => {
    const subtotal = formData.orderItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0)
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
      orderItems: [...prev.orderItems, { 
        itemId: '', 
        itemName: '', 
        quantity: 1, 
        rate: 0, // Changed from unitPrice to rate
        category: '', 
        stockInfo: null as any,
        productType: 'saree'
      }]
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
              updatedItem.rate = selectedItem.pricing.sellingPrice || 0 // Changed from unitPrice to rate
              updatedItem.category = selectedItem.category.primary || ''
              
              // Add stock information
              const availableStock = selectedItem.stock?.availableStock || 0
              const currentStock = selectedItem.stock?.currentStock || 0
              const reservedStock = selectedItem.stock?.reservedStock || 0
              
              updatedItem.stockInfo = {
                available: availableStock,
                current: currentStock,
                reserved: reservedStock,
                unit: selectedItem.stock?.unit || 'pcs'
              }
              
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
    
    if (isSuperAdmin && !selectedCompanyId) {
      toast.error('Please select a company')
      return
    }
    
    if (!formData.customerId) {
      toast.error('Please select a customer')
      return
    }
    
    // Validate stock availability
    const insufficientStockItems = formData.orderItems.filter(item => 
      item.stockInfo && item.stockInfo.available < item.quantity
    )
    
    if (insufficientStockItems.length > 0) {
      const errorMessage = insufficientStockItems.map(item => 
        `${item.itemName}: Requested ${item.quantity}, Available ${item.stockInfo?.available}`
      ).join('; ')
      toast.error(`Insufficient stock for: ${errorMessage}`)
      return
    }
    
    try {
      // Create data that matches the backend API requirements
      const backendOrderData = {
        companyId: selectedCompanyId || currentUser?.companyId,
        customerId: formData.customerId,
        orderSource: formData.orderSource,
        orderType: formData.orderType,
        orderNumber: `SO-${Date.now()}`,

        orderItems: formData.orderItems.map(item => ({
          productId: item.itemId, // Send the selected item's _id as productId
          itemName: item.itemName,
          quantity: item.quantity,
          rate: item.rate, // Backend expects 'rate'
          unit: 'pieces',
          productType: item.productType || 'saree', // Required field
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

      // Debug: Log the order data being sent
      console.log('Sending order data:', {
        orderItems: orderData.orderItems.map((item: any) => ({
          productId: item.productId,
          itemName: item.itemName,
          quantity: item.quantity
        }))
      })

      if (onSuccess) {
        await onSuccess(orderData)
      } else {
        // Fallback to internal API calls if no onSuccess callback provided
        if (mode === 'create') {
          await createSalesOrder(orderData).unwrap()
          toast.success('Sales order created successfully!')
        } else {
          await updateSalesOrder({ id: order._id, data: orderData }).unwrap()
          toast.success('Sales order updated successfully!')
        }
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
                displayName: (customer as any).customerName || (customer as any).name || (customer as any).companyName || customer.customerCode
              }))}
              value={formData.customerId}
              onSelect={(value) => {
                console.log('Customer selected:', value)
                // Find the selected customer
                const selectedCustomer = customers?.find(customer => customer._id === value) || null
                
                if (selectedCustomer) {
                  // Auto-populate delivery address with customer's primary address
                  const primaryAddress = selectedCustomer.addresses?.find(addr => addr.isPrimary) || selectedCustomer.addresses?.[0]
                  const primaryContact = selectedCustomer.contactPersons?.find(cp => cp.isPrimary) || selectedCustomer.contactPersons?.[0]
                  
                  // Ensure we have safe access to customer properties
                  const customerName = selectedCustomer.customerName || ''
                  const contactInfo = selectedCustomer.contactInfo || {}
                  
                  setFormData(prev => ({
                    ...prev,
                    customerId: value,
                    delivery: {
                      ...prev.delivery,
                      deliveryAddress: {
                        contactPerson: primaryContact?.name || customerName || '',
                        phone: primaryContact?.phone || contactInfo.primaryPhone || '',
                        email: primaryContact?.email || contactInfo.primaryEmail || '',
                        addressLine1: primaryAddress?.addressLine1 || '',
                        addressLine2: primaryAddress?.addressLine2 || '',
                        city: primaryAddress?.city || '',
                        state: primaryAddress?.state || '',
                        pincode: primaryAddress?.pincode || '',
                        country: primaryAddress?.country || 'India',
                        landmark: primaryAddress?.landmark || ''
                      }
                    }
                  }))
                  
                  // Set flag to indicate address was auto-populated
                  setIsAddressAutoPopulated(true)
                  
                  console.log('Auto-populated delivery address:', {
                    customer: selectedCustomer.customerName,
                    address: primaryAddress,
                    contact: primaryContact
                  })
                } else {
                  setFormData(prev => ({ ...prev, customerId: value }))
                  setIsAddressAutoPopulated(false)
                }
              }}
              placeholder="Select a customer..."
              searchPlaceholder="Search customers by name or code..."
              displayKey="displayName"
              valueKey="_id"
              showDetails={true}
            />
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

                    {/* Rate */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rate (₹)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.rate}
                        onChange={(e) => updateOrderItem(index, 'rate', parseFloat(e.target.value) || 0)}
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

                  {/* Product Type */}
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Type
                    </label>
                    <select
                      value={item.productType}
                      onChange={(e) => updateOrderItem(index, 'productType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="saree">Saree</option>
                      <option value="african_cotton">African Cotton</option>
                      <option value="garment_fabric">Garment Fabric</option>
                      <option value="digital_print">Digital Print</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>

                  {/* Stock Information */}
                  {item.stockInfo && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Stock Information</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Available:</span>
                          <span className={`ml-1 font-medium ${item.stockInfo.available >= item.quantity ? 'text-green-600' : 'text-red-600'}`}>
                            {item.stockInfo.available} {item.stockInfo.unit}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Current:</span>
                          <span className="ml-1 font-medium text-gray-900">
                            {item.stockInfo.current} {item.stockInfo.unit}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Reserved:</span>
                          <span className="ml-1 font-medium text-gray-900">
                            {item.stockInfo.reserved} {item.stockInfo.unit}
                          </span>
                        </div>
                      </div>
                      {item.stockInfo.available < item.quantity && (
                        <div className="mt-2 p-2 bg-red-100 rounded text-red-700 text-sm">
                          ⚠️ Insufficient stock! Requested: {item.quantity}, Available: {item.stockInfo.available}
                        </div>
                      )}
                    </div>
                  )}

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
                <option value="card">Card</option>
                <option value="credit">Credit</option>
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
                <option value="pickup">Pickup</option>
                <option value="delivery">Delivery</option>
                <option value="courier">Courier</option>
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

          {/* Delivery Address */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Delivery Address</h3>
              {formData.customerId && (
                <div className={`flex items-center gap-2 text-sm px-3 py-1 rounded-full ${
                  isAddressAutoPopulated 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-green-600 bg-green-50'
                }`}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>
                    {isAddressAutoPopulated 
                      ? 'Auto-populated from customer • Editable' 
                      : 'Manually entered • Editable'
                    }
                  </span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person</label>
                <Input
                  value={formData.delivery.deliveryAddress.contactPerson}
                  onChange={(e) => handleDeliveryAddressChange('contactPerson', e.target.value)}
                  placeholder="Contact person name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <Input
                  value={formData.delivery.deliveryAddress.phone}
                  onChange={(e) => handleDeliveryAddressChange('phone', e.target.value)}
                  placeholder="Phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <Input
                  type="email"
                  value={formData.delivery.deliveryAddress.email}
                  onChange={(e) => handleDeliveryAddressChange('email', e.target.value)}
                  placeholder="Email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <Input
                  value={formData.delivery.deliveryAddress.country}
                  onChange={(e) => handleDeliveryAddressChange('country', e.target.value)}
                  placeholder="Country"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1</label>
                <Input
                  value={formData.delivery.deliveryAddress.addressLine1}
                  onChange={(e) => handleDeliveryAddressChange('addressLine1', e.target.value)}
                  placeholder="Street address"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
                <Input
                  value={formData.delivery.deliveryAddress.addressLine2}
                  onChange={(e) => handleDeliveryAddressChange('addressLine2', e.target.value)}
                  placeholder="Apartment, suite, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <Input
                  value={formData.delivery.deliveryAddress.city}
                  onChange={(e) => handleDeliveryAddressChange('city', e.target.value)}
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <Input
                  value={formData.delivery.deliveryAddress.state}
                  onChange={(e) => handleDeliveryAddressChange('state', e.target.value)}
                  placeholder="State"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                <Input
                  value={formData.delivery.deliveryAddress.pincode}
                  onChange={(e) => handleDeliveryAddressChange('pincode', e.target.value)}
                  placeholder="Pincode"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Landmark</label>
                <Input
                  value={formData.delivery.deliveryAddress.landmark}
                  onChange={(e) => handleDeliveryAddressChange('landmark', e.target.value)}
                  placeholder="Nearby landmark"
                />
              </div>
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
                <option value="rush">Rush</option>
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
                <option value="confirmed">Confirmed</option>
                <option value="in_production">In Production</option>
                <option value="ready_to_dispatch">Ready to Dispatch</option>
                <option value="dispatched">Dispatched</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="returned">Returned</option>
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
