'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package } from 'lucide-react'

interface InventoryImpactSummaryProps {
  items: Array<{
    itemType?: 'new' | 'existing'
  }>
}

export function InventoryImpactSummary({ items }: InventoryImpactSummaryProps) {
  const newItemsCount = items.filter(item => item.itemType === 'new').length
  const existingItemsCount = items.filter(item => item.itemType === 'existing').length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Inventory Impact Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-2">This purchase order will:</p>
            <ul className="list-disc list-inside space-y-1">
              {newItemsCount > 0 && (
                <li>Create {newItemsCount} new inventory item(s)</li>
              )}
              {existingItemsCount > 0 && (
                <li>Update stock for {existingItemsCount} existing item(s)</li>
              )}
              <li>Record stock movements for all items</li>
              <li>Update warehouse inventory levels</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}



