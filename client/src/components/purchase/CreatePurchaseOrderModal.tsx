'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useCreatePurchaseOrderMutation } from '@/lib/api/purchaseApi'
import { useSelector } from 'react-redux'
import { selectCurrentUser, selectIsSuperAdmin } from '@/lib/features/auth/authSlice'
import { Plus, X, Package, DollarSign, Calendar, Truck, User, MapPin, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'

interface CreatePurchaseOrderModalProps {
  onSuccess?: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface PurchaseItem {
  itemId: string
  itemCode: string
  itemName: string
  description: string
  specifications: string
  hsnCode: string
  quantity: number
  unit: string
  rate: number
  discount: {
    type: 'percentage' | 'amount'
    value: number
  }
  discountAmount: number
  taxableAmount: number
  taxBreakup: Array<{
    taxType: 'CGST' | 'SGST' | 'IGST' | 'CESS'
    rate: number
    amount: number
  }>
  totalTaxAmount: number
  lineTotal: number
  deliveryDate: string
  notes: string
}

interface CreatePurchaseOrderRequest {
  companyId?: string
  poNumber: string
  poDate: string
  expectedDeliveryDate: string
  financialYear: string
  poType: 'standard' | 'blanket' | 'contract' | 'planned' | 'emergency' | 'service' | 'capital'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'raw_material' | 'finished_goods' | 'consumables' | 'services' | 'capital_goods' | 'maintenance'
  supplier: {
    supplierId: string
    supplierCode: string
    supplierName: string
    gstin: string
    pan: string
    contactPerson: string
    phone: string
    email: string
    address: {
      addressLine1: string
      addressLine2: string
      city: string
      state: string
      pincode: string
      country: string
    }
  }
  deliveryInfo: {
    deliveryAddress: {
      addressLine1: string
      addressLine2: string
      city: string
      state: string
      pincode: string
      country: string
    }
    warehouseId: string
    warehouseName: string
    contactPerson: string
    contactPhone: string
    deliveryInstructions: string
    workingHours: string
    deliveryType: 'standard' | 'express' | 'scheduled'
  }
  items: PurchaseItem[]
  amounts: {
    subtotal: number
    totalDiscount: number
    taxableAmount: number
    totalTaxAmount: number
    freightCharges: number
    packingCharges: number
    otherCharges: number
    roundingAdjustment: number
    grandTotal: number
  }
  taxDetails: {
    placeOfSupply: string
    isReverseCharge: boolean
    taxBreakup: Array<{
      taxType: 'CGST' | 'SGST' | 'IGST' | 'CESS'
      rate: number
      taxableAmount: number
      taxAmount: number
    }>
    totalTaxAmount: number
  }
  paymentTerms: {
    termType: 'advance' | 'net' | 'cod' | 'credit' | 'milestone'
    days: number
    advancePercentage: number
  }
  terms: string
  notes: string
  specialInstructions: string
}

export function CreatePurchaseOrderModal({ onSuccess, open: controlledOpen, onOpenChange }: CreatePurchaseOrderModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen
  const [selectedCompanyId, setSelectedCompanyId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Basic PO Details
  const [poNumber, setPoNumber] = useState('')
  const [poDate, setPoDate] = useState('')
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('')
  const [financialYear, setFinancialYear] = useState('')
  const [poType, setPoType] = useState<'standard' | 'blanket' | 'contract' | 'planned' | 'emergency' | 'service' | 'capital'>('standard')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const [category, setCategory] = useState<'raw_material' | 'finished_goods' | 'consumables' | 'services' | 'capital_goods' | 'maintenance'>('raw_material')

  // Supplier Details
  const [supplierId, setSupplierId] = useState('')
  const [supplierCode, setSupplierCode] = useState('')
  const [supplierName, setSupplierName] = useState('')
  const [supplierGstin, setSupplierGstin] = useState('')
  const [supplierPan, setSupplierPan] = useState('')
  const [supplierContactPerson, setSupplierContactPerson] = useState('')
  const [supplierPhone, setSupplierPhone] = useState('')
  const [supplierEmail, setSupplierEmail] = useState('')
  const [supplierAddress, setSupplierAddress] = useState({
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  })

  // Delivery Info
  const [deliveryAddress, setDeliveryAddress] = useState({
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  })
  const [warehouseId, setWarehouseId] = useState('')
  const [warehouseName, setWarehouseName] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [deliveryInstructions, setDeliveryInstructions] = useState('')
  const [workingHours, setWorkingHours] = useState('')
  const [deliveryType, setDeliveryType] = useState<'standard' | 'express' | 'scheduled'>('standard')

  // Items
  const [items, setItems] = useState<PurchaseItem[]>([])

  // Charges
  const [freightCharges, setFreightCharges] = useState(0)
  const [packingCharges, setPackingCharges] = useState(0)
  const [otherCharges, setOtherCharges] = useState(0)

  // Tax Details
  const [placeOfSupply, setPlaceOfSupply] = useState('')
  const [isReverseCharge, setIsReverseCharge] = useState(false)

  // Payment Terms
  const [paymentTermType, setPaymentTermType] = useState<'advance' | 'net' | 'cod' | 'credit' | 'milestone'>('net')
  const [paymentDays, setPaymentDays] = useState(0)
  const [advancePercentage, setAdvancePercentage] = useState(0)

  // Notes
  const [terms, setTerms] = useState('')
  const [notes, setNotes] = useState('')
  const [specialInstructions, setSpecialInstructions] = useState('')

  const user = useSelector(selectCurrentUser)
  const isSuperAdmin = useSelector(selectIsSuperAdmin)
  const userCompanyId = user?.companyAccess?.[0]?.companyId

  const [createPurchaseOrder] = useCreatePurchaseOrderMutation()

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      // Set default values
      const currentDate = new Date().toISOString().split('T')[0]
      const currentYear = new Date().getFullYear()
      const nextYear = currentYear + 1
      
      setPoNumber(`PO-${currentYear}-${Date.now().toString().slice(-6)}`)
      setPoDate(currentDate)
      setFinancialYear(`${currentYear}-${nextYear}`)
      setSelectedCompanyId('')
      setSupplierId('')
      setItems([])
      setFreightCharges(0)
      setPackingCharges(0)
      setOtherCharges(0)
      setPlaceOfSupply('')
      setIsReverseCharge(false)
      setPaymentDays(0)
      setAdvancePercentage(0)
      setTerms('')
      setNotes('')
      setSpecialInstructions('')
    }
  }, [open])

  // Add new item
  const addItem = () => {
    const newItem: PurchaseItem = {
      itemId: `item-${Date.now()}`,
      itemCode: '',
      itemName: '',
      description: '',
      specifications: '',
      hsnCode: '',
      quantity: 0,
      unit: 'kg',
      rate: 0,
      discount: { type: 'percentage', value: 0 },
      discountAmount: 0,
      taxableAmount: 0,
      taxBreakup: [],
      totalTaxAmount: 0,
      lineTotal: 0,
      deliveryDate: '',
      notes: ''
    }
    setItems([...items, newItem])
  }

  // Remove item
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  // Update item
  const updateItem = (index: number, field: keyof PurchaseItem, value: any) => {
    const updatedItems = [...items]
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
    const cgstRate = 9
    const sgstRate = 9
    
    item.taxBreakup = [
      { taxType: 'CGST', rate: cgstRate, amount: (item.taxableAmount * cgstRate / 100) },
      { taxType: 'SGST', rate: sgstRate, amount: (item.taxableAmount * sgstRate / 100) }
    ]
    
    item.totalTaxAmount = item.taxBreakup.reduce((sum, tax) => sum + tax.amount, 0)
    item.lineTotal = item.taxableAmount + item.totalTaxAmount
    
    setItems(updatedItems)
  }

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0)
  const totalDiscount = items.reduce((sum, item) => sum + item.discountAmount, 0)
  const taxableAmount = items.reduce((sum, item) => sum + item.taxableAmount, 0)
  const totalTaxAmount = items.reduce((sum, item) => sum + item.totalTaxAmount, 0)
  const grandTotal = taxableAmount + totalTaxAmount + freightCharges + packingCharges + otherCharges

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!poNumber || !poDate || !expectedDeliveryDate) {
      toast.error('Please fill all required fields')
      return
    }

    if (items.length === 0) {
      toast.error('Please add at least one item')
      return
    }

    if (items.some(item => !item.itemName || item.quantity <= 0 || item.rate <= 0)) {
      toast.error('Please fill all item details correctly')
      return
    }

    // Determine company ID
    const targetCompanyId = isSuperAdmin && selectedCompanyId ? selectedCompanyId : userCompanyId

    if (!targetCompanyId) {
      toast.error('Company ID is required')
      return
    }

    setIsSubmitting(true)

    try {
      const orderData: CreatePurchaseOrderRequest = {
        companyId: targetCompanyId,
        poNumber,
        poDate,
        expectedDeliveryDate,
        financialYear,
        poType,
        priority,
        category,
        supplier: {
          supplierId,
          supplierCode,
          supplierName,
          gstin: supplierGstin,
          pan: supplierPan,
          contactPerson: supplierContactPerson,
          phone: supplierPhone,
          email: supplierEmail,
          address: supplierAddress
        },
        deliveryInfo: {
          deliveryAddress,
          warehouseId,
          warehouseName,
          contactPerson,
          contactPhone,
          deliveryInstructions,
          workingHours,
          deliveryType
        },
        items,
        amounts: {
          subtotal,
          totalDiscount,
          taxableAmount,
          totalTaxAmount,
          freightCharges,
          packingCharges,
          otherCharges,
          roundingAdjustment: 0,
          grandTotal
        },
                 taxDetails: {
           placeOfSupply,
           isReverseCharge,
           taxBreakup: items.flatMap(item => item.taxBreakup.map(tax => ({
             taxType: tax.taxType,
             rate: tax.rate,
             taxableAmount: item.taxableAmount,
             taxAmount: tax.amount
           }))),
           totalTaxAmount
         },
        paymentTerms: {
          termType: paymentTermType,
          days: paymentDays,
          advancePercentage
        },
        terms,
        notes,
        specialInstructions
      }

      await createPurchaseOrder(orderData).unwrap()
      toast.success('Purchase order created successfully')
      setOpen(false)
      onSuccess?.()
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to create purchase order')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Purchase Order
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Purchase Order</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Selection (Super Admin Only) */}
          {isSuperAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Company Selection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Company" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Select Company</SelectItem>
                      <SelectItem value="company1">Company 1</SelectItem>
                      <SelectItem value="company2">Company 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Basic PO Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Purchase Order Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>PO Number *</Label>
                  <Input
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    placeholder="PO-2024-001"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>PO Date *</Label>
                  <Input
                    type="date"
                    value={poDate}
                    onChange={(e) => setPoDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Expected Delivery Date *</Label>
                  <Input
                    type="date"
                    value={expectedDeliveryDate}
                    onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Financial Year *</Label>
                  <Input
                    value={financialYear}
                    onChange={(e) => setFinancialYear(e.target.value)}
                    placeholder="2024-2025"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>PO Type *</Label>
                  <Select value={poType} onValueChange={(value: any) => setPoType(value)}>
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
                  <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
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
                  <Select value={category} onValueChange={(value: any) => setCategory(value)}>
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

          {/* Supplier Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Supplier Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Supplier Code *</Label>
                  <Input
                    value={supplierCode}
                    onChange={(e) => setSupplierCode(e.target.value)}
                    placeholder="SUP001"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Supplier Name *</Label>
                  <Input
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    placeholder="Supplier Name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>GSTIN</Label>
                  <Input
                    value={supplierGstin}
                    onChange={(e) => setSupplierGstin(e.target.value)}
                    placeholder="22AAAAA0000A1Z5"
                  />
                </div>

                <div className="space-y-2">
                  <Label>PAN</Label>
                  <Input
                    value={supplierPan}
                    onChange={(e) => setSupplierPan(e.target.value)}
                    placeholder="ABCDE1234F"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Contact Person *</Label>
                  <Input
                    value={supplierContactPerson}
                    onChange={(e) => setSupplierContactPerson(e.target.value)}
                    placeholder="Contact Person"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Phone *</Label>
                  <Input
                    value={supplierPhone}
                    onChange={(e) => setSupplierPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={supplierEmail}
                    onChange={(e) => setSupplierEmail(e.target.value)}
                    placeholder="supplier@example.com"
                  />
                </div>
              </div>

              {/* Supplier Address */}
              <div className="mt-4">
                <Label className="text-sm font-medium">Supplier Address</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <Input
                    value={supplierAddress.addressLine1}
                    onChange={(e) => setSupplierAddress({...supplierAddress, addressLine1: e.target.value})}
                    placeholder="Address Line 1"
                    required
                  />
                  <Input
                    value={supplierAddress.addressLine2}
                    onChange={(e) => setSupplierAddress({...supplierAddress, addressLine2: e.target.value})}
                    placeholder="Address Line 2"
                  />
                  <Input
                    value={supplierAddress.city}
                    onChange={(e) => setSupplierAddress({...supplierAddress, city: e.target.value})}
                    placeholder="City"
                    required
                  />
                  <Input
                    value={supplierAddress.state}
                    onChange={(e) => setSupplierAddress({...supplierAddress, state: e.target.value})}
                    placeholder="State"
                    required
                  />
                  <Input
                    value={supplierAddress.pincode}
                    onChange={(e) => setSupplierAddress({...supplierAddress, pincode: e.target.value})}
                    placeholder="Pincode"
                    required
                  />
                  <Input
                    value={supplierAddress.country}
                    onChange={(e) => setSupplierAddress({...supplierAddress, country: e.target.value})}
                    placeholder="Country"
                    defaultValue="India"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Warehouse Name</Label>
                  <Input
                    value={warehouseName}
                    onChange={(e) => setWarehouseName(e.target.value)}
                    placeholder="Warehouse Name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Contact Person *</Label>
                  <Input
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="Delivery Contact Person"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Contact Phone *</Label>
                  <Input
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Working Hours</Label>
                  <Input
                    value={workingHours}
                    onChange={(e) => setWorkingHours(e.target.value)}
                    placeholder="9:00 AM - 6:00 PM"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Delivery Type</Label>
                  <Select value={deliveryType} onValueChange={(value: any) => setDeliveryType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="express">Express</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="mt-4">
                <Label className="text-sm font-medium">Delivery Address</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <Input
                    value={deliveryAddress.addressLine1}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, addressLine1: e.target.value})}
                    placeholder="Address Line 1"
                    required
                  />
                  <Input
                    value={deliveryAddress.addressLine2}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, addressLine2: e.target.value})}
                    placeholder="Address Line 2"
                  />
                  <Input
                    value={deliveryAddress.city}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, city: e.target.value})}
                    placeholder="City"
                    required
                  />
                  <Input
                    value={deliveryAddress.state}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, state: e.target.value})}
                    placeholder="State"
                    required
                  />
                  <Input
                    value={deliveryAddress.pincode}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, pincode: e.target.value})}
                    placeholder="Pincode"
                    required
                  />
                  <Input
                    value={deliveryAddress.country}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, country: e.target.value})}
                    placeholder="Country"
                    defaultValue="India"
                  />
                </div>
              </div>

              <div className="mt-4">
                <Label>Delivery Instructions</Label>
                <Textarea
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  placeholder="Special delivery instructions..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Items Section */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Items
                </CardTitle>
                <Button type="button" onClick={addItem} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No items added yet</p>
                  <Button type="button" onClick={addItem} variant="outline" className="mt-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Item
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={item.itemId} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-medium">Item {index + 1}</h4>
                        <Button
                          type="button"
                          onClick={() => removeItem(index)}
                          variant="outline"
                          size="sm"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>Item Code *</Label>
                          <Input
                            value={item.itemCode}
                            onChange={(e) => updateItem(index, 'itemCode', e.target.value)}
                            placeholder="ITEM001"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Item Name *</Label>
                          <Input
                            value={item.itemName}
                            onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                            placeholder="Item Name"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>HSN Code</Label>
                          <Input
                            value={item.hsnCode}
                            onChange={(e) => updateItem(index, 'hsnCode', e.target.value)}
                            placeholder="HSN Code"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Quantity *</Label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Unit *</Label>
                          <Select
                            value={item.unit}
                            onValueChange={(value) => updateItem(index, 'unit', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="kg">KG</SelectItem>
                              <SelectItem value="pcs">Pieces</SelectItem>
                              <SelectItem value="mtr">Meters</SelectItem>
                              <SelectItem value="ltr">Liters</SelectItem>
                              <SelectItem value="box">Box</SelectItem>
                              <SelectItem value="roll">Roll</SelectItem>
                              <SelectItem value="set">Set</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Rate *</Label>
                          <Input
                            type="number"
                            value={item.rate}
                            onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Discount Type</Label>
                          <Select
                            value={item.discount.type}
                            onValueChange={(value: any) => updateItem(index, 'discount', {...item.discount, type: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percentage">Percentage</SelectItem>
                              <SelectItem value="amount">Amount</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Discount Value</Label>
                          <Input
                            type="number"
                            value={item.discount.value}
                            onChange={(e) => updateItem(index, 'discount', {...item.discount, value: parseFloat(e.target.value) || 0})}
                            placeholder="0"
                            min="0"
                            step="0.01"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Delivery Date</Label>
                          <Input
                            type="date"
                            value={item.deliveryDate}
                            onChange={(e) => updateItem(index, 'deliveryDate', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            value={item.description}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                            placeholder="Item description..."
                            rows={2}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Specifications</Label>
                          <Textarea
                            value={item.specifications}
                            onChange={(e) => updateItem(index, 'specifications', e.target.value)}
                            placeholder="Technical specifications..."
                            rows={2}
                          />
                        </div>
                      </div>

                      {/* Item Totals */}
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Subtotal:</span>
                            <span className="ml-2">₹{(item.quantity * item.rate).toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="font-medium">Discount:</span>
                            <span className="ml-2">₹{item.discountAmount.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="font-medium">Taxable Amount:</span>
                            <span className="ml-2">₹{item.taxableAmount.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="font-medium">Total Tax:</span>
                            <span className="ml-2">₹{item.totalTaxAmount.toFixed(2)}</span>
                          </div>
                          <div className="col-span-2 md:col-span-4">
                            <span className="font-medium text-lg">Line Total:</span>
                            <span className="ml-2 text-lg font-bold">₹{item.lineTotal.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Charges & Tax Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Charges & Tax Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Freight Charges</Label>
                  <Input
                    type="number"
                    value={freightCharges}
                    onChange={(e) => setFreightCharges(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Packing Charges</Label>
                  <Input
                    type="number"
                    value={packingCharges}
                    onChange={(e) => setPackingCharges(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Other Charges</Label>
                  <Input
                    type="number"
                    value={otherCharges}
                    onChange={(e) => setOtherCharges(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Place of Supply *</Label>
                  <Input
                    value={placeOfSupply}
                    onChange={(e) => setPlaceOfSupply(e.target.value)}
                    placeholder="State Name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Reverse Charge</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={isReverseCharge}
                      onChange={(e) => setIsReverseCharge(e.target.checked)}
                      className="rounded"
                    />
                    <Label>Apply Reverse Charge</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Terms */}
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
                  <Label>Payment Term Type</Label>
                  <Select value={paymentTermType} onValueChange={(value: any) => setPaymentTermType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="advance">Advance</SelectItem>
                      <SelectItem value="net">Net</SelectItem>
                      <SelectItem value="cod">COD</SelectItem>
                      <SelectItem value="credit">Credit</SelectItem>
                      <SelectItem value="milestone">Milestone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Payment Days</Label>
                  <Input
                    type="number"
                    value={paymentDays}
                    onChange={(e) => setPaymentDays(parseInt(e.target.value) || 0)}
                    placeholder="30"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Advance Percentage</Label>
                  <Input
                    type="number"
                    value={advancePercentage}
                    onChange={(e) => setAdvancePercentage(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes & Terms */}
          <Card>
            <CardHeader>
              <CardTitle>Notes & Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Terms & Conditions</Label>
                  <Textarea
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                    placeholder="Payment terms, delivery terms, etc..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Special Instructions</Label>
                  <Textarea
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="Special instructions for supplier..."
                    rows={4}
                  />
                </div>
              </div>

              <div className="mt-4">
                <Label>Additional Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Subtotal</div>
                  <div className="text-lg font-bold">₹{subtotal.toFixed(2)}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Total Discount</div>
                  <div className="text-lg font-bold">₹{totalDiscount.toFixed(2)}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Total Tax</div>
                  <div className="text-lg font-bold">₹{totalTaxAmount.toFixed(2)}</div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-600">Grand Total</div>
                  <div className="text-xl font-bold text-blue-600">₹{grandTotal.toFixed(2)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              onClick={() => setOpen(false)}
              variant="outline"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoadingSpinner className="h-4 w-4 mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Purchase Order
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
