'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign } from 'lucide-react'

interface OrderSummaryProps {
  items: Array<{
    quantity: number
    rate: number
    discountAmount: number
    taxableAmount: number
    totalTaxAmount: number
    lineTotal: number
  }>
  freightCharges: number
  packingCharges: number
  otherCharges: number
}

export function OrderSummary({ items, freightCharges, packingCharges, otherCharges }: OrderSummaryProps) {
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0)
  const totalDiscount = items.reduce((sum, item) => sum + item.discountAmount, 0)
  const taxableAmount = items.reduce((sum, item) => sum + item.taxableAmount, 0)
  const totalTaxAmount = items.reduce((sum, item) => sum + item.totalTaxAmount, 0)
  const grandTotal = taxableAmount + totalTaxAmount + freightCharges + packingCharges + otherCharges

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Discount:</span>
            <span className="text-green-600">-{formatCurrency(totalDiscount)}</span>
          </div>
          <div className="flex justify-between">
            <span>Taxable Amount:</span>
            <span>{formatCurrency(taxableAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Tax:</span>
            <span>{formatCurrency(totalTaxAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span>Freight Charges:</span>
            <span>{formatCurrency(freightCharges)}</span>
          </div>
          <div className="flex justify-between">
            <span>Packing Charges:</span>
            <span>{formatCurrency(packingCharges)}</span>
          </div>
          <div className="flex justify-between">
            <span>Other Charges:</span>
            <span>{formatCurrency(otherCharges)}</span>
          </div>
          <div className="border-t pt-3 flex justify-between font-bold text-lg">
            <span>Grand Total:</span>
            <span className="text-blue-600">{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}



