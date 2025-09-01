'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useGetCustomersQuery } from '@/lib/api/customersApi'
import { useCreateSalesOrderMutation, useUpdateSalesOrderMutation } from '@/lib/api/salesApi'
import toast from 'react-hot-toast'
import { X, Plus, Trash2 } from 'lucide-react'

interface SalesOrderModalProps {
  isOpen: boolean
  onClose: () => void
  order?: any
  mode: 'create' | 'edit'
}

export function SalesOrderModal({ isOpen, onClose, order, mode }: SalesOrderModalProps) {
  const [formData, setFormData] = useState({
    customerId: '',
    orderItems: [{ itemName: '', quantity: 1, unitPrice: 0, category: '' }],
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
    specialInstructions: ''
  })

  const [createSalesOrder] = useCreateSalesOrderMutation()
  const [updateSalesOrder] = useUpdateSalesOrderMutation()
  const { data: customersData } = useGetCustomersQuery({})

  useEffect(() => {
    if (order && mode === 'edit') {
      setFormData({
        customerId: order.customerId || '',
        orderItems: order.orderItems || [{ itemName: '', quantity: 1, unitPrice: 0, category: '' }],
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
        specialInstructions: order.specialInstructions || ''
      })
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
      orderItems: [...prev.orderItems, { itemName: '', quantity: 1, unitPrice: 0, category: '' }]
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
    setFormData(prev => ({
      ...prev,
      orderItems: prev.orderItems.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      calculateTotals()
      
      // Convert date string to Date object
      const formDataWithDate = {
        ...formData,
        delivery: {
          ...formData.delivery,
          expectedDeliveryDate: formData.delivery.expectedDeliveryDate ? new Date(formData.delivery.expectedDeliveryDate) : new Date()
        }
      }

      if (mode === 'create') {
        await createSalesOrder(formDataWithDate).unwrap()
        toast.success('Sales order created successfully')
      } else {
        await updateSalesOrder({ id: order._id, data: formDataWithDate }).unwrap()
        toast.success('Sales order updated successfully')
      }
      
      onClose()
    } catch (error: any) {
      toast.error(error?.data?.message || `Failed to ${mode} sales order`)
    }
  }

  const customers = customersData?.data || []

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
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
          {/* Customer Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer *
            </label>
            <Select
              value={formData.customerId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, customerId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer: any) => (
                  <SelectItem key={customer._id} value={customer._id}>
                    {customer.customerName} ({customer.customerCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Order Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Order Items *
              </label>
              <Button type="button" onClick={addOrderItem} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
            
            <div className="space-y-4">
              {formData.orderItems.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <Input
                      placeholder="Item Name"
                      value={item.itemName}
                      onChange={(e) => updateOrderItem(index, 'itemName', e.target.value)}
                      required
                    />
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value))}
                      min="1"
                      required
                    />
                  </div>
                  <div className="w-32">
                    <Input
                      type="number"
                      placeholder="Unit Price"
                      value={item.unitPrice}
                      onChange={(e) => updateOrderItem(index, 'unitPrice', parseFloat(e.target.value))}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="w-32">
                    <Input
                      placeholder="Category"
                      value={item.category}
                      onChange={(e) => updateOrderItem(index, 'category', e.target.value)}
                    />
                  </div>
                  <div className="w-8">
                    <Button
                      type="button"
                      onClick={() => removeOrderItem(index)}
                      variant="ghost"
                      size="sm"
                      disabled={formData.orderItems.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtotal
              </label>
              <Input
                type="number"
                value={formData.orderSummary.subtotal}
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax (18%)
              </label>
              <Input
                type="number"
                value={formData.orderSummary.totalTax}
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount
              </label>
              <Input
                type="number"
                value={formData.orderSummary.totalDiscount}
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Final Amount
              </label>
              <Input
                type="number"
                value={formData.orderSummary.finalAmount}
                readOnly
                className="bg-gray-50 font-semibold"
              />
            </div>
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <Select
                value={formData.payment.paymentMethod}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  payment: { ...prev.payment, paymentMethod: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Credit Days
              </label>
              <Input
                type="number"
                value={formData.payment.creditDays}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  payment: { ...prev.payment, creditDays: parseInt(e.target.value) }
                }))}
                min="0"
              />
            </div>
          </div>

          {/* Delivery Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Type
              </label>
              <Select
                value={formData.delivery.deliveryType}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  delivery: { ...prev.delivery, deliveryType: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pickup">Pickup</SelectItem>
                  <SelectItem value="delivery">Delivery</SelectItem>
                  <SelectItem value="courier">Courier</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Delivery Date
              </label>
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

          {/* Order Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="rush">Rush</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="in_production">In Production</SelectItem>
                  <SelectItem value="ready_to_dispatch">Ready to Dispatch</SelectItem>
                  <SelectItem value="dispatched">Dispatched</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Instructions
            </label>
            <Textarea
              value={formData.specialInstructions}
              onChange={(e) => setFormData(prev => ({ ...prev, specialInstructions: e.target.value }))}
              placeholder="Any special instructions for this order..."
              rows={3}
            />
          </div>

          {/* Delivery Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Instructions
            </label>
            <Textarea
              value={formData.delivery.deliveryInstructions}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                delivery: { ...prev.delivery, deliveryInstructions: e.target.value }
              }))}
              placeholder="Delivery instructions..."
              rows={2}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'Create Order' : 'Update Order'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
