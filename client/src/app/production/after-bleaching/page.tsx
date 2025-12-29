'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { AppLayout } from '@/components/layout/AppLayout'
import { Badge } from '@/components/ui/badge'
import { 
  useGetAfterBleachingStocksQuery,
  useSendToPrintingMutation,
  useGetLongationStockQuery,
  AfterBleaching
} from '@/lib/api/productionModulesApi'
import { Send, Package, TrendingUp, TrendingDown } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function AfterBleachingPage() {
  const [showSendModal, setShowSendModal] = useState(false)
  const [selectedStock, setSelectedStock] = useState<AfterBleaching | null>(null)
  const [meterToSend, setMeterToSend] = useState(0)

  const { data, isLoading, refetch } = useGetAfterBleachingStocksQuery({})
  const { data: longationData, refetch: refetchLongation } = useGetLongationStockQuery()
  const [sendToPrinting] = useSendToPrintingMutation()

  const stocks = data?.data || []
  const totalLongation = longationData?.data?.totalLongation || 0

  const handleSendClick = (stock: AfterBleaching) => {
    setSelectedStock(stock)
    setMeterToSend(0)
    setShowSendModal(true)
  }

  const handleSend = async () => {
    if (!selectedStock || meterToSend <= 0) {
      toast.error('Please enter a valid meter amount')
      return
    }
    if (meterToSend > selectedStock.availableMeter) {
      toast.error(`Cannot send more than available meter (${selectedStock.availableMeter})`)
      return
    }
    try {
      await sendToPrinting({
        id: selectedStock._id!,
        data: { meter: meterToSend }
      }).unwrap()
      toast.success('Meter sent to printing successfully')
      setShowSendModal(false)
      setSelectedStock(null)
      setMeterToSend(0)
      // Safely refetch if queries are active
      if (refetch && typeof refetch === 'function') {
        try {
          refetch()
        } catch (err) {
          // Query might not be started yet, mutation will invalidate tags anyway
          console.log('Refetch skipped:', err)
        }
      }
      if (refetchLongation && typeof refetchLongation === 'function') {
        try {
          refetchLongation()
        } catch (err) {
          console.log('Longation refetch skipped:', err)
        }
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to send to printing')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fully_allocated': return 'bg-green-100 text-green-800'
      case 'partially_allocated': return 'bg-yellow-100 text-yellow-800'
      case 'available': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">After Bleaching Stock</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage stock after bleaching process</p>
          </div>
        </div>

        {/* Longation Stock Summary */}
        {totalLongation > 0 && (
          <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Longation Stock</p>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {totalLongation} meters
                    </p>
                  </div>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  Extra/Shrinkage Meter
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="grid gap-4">
            {stocks.map((stock) => (
              <Card key={stock._id} className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Lot: {stock.lotNumber}</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Party: {stock.partyName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(stock.status)}>
                        {stock.status.replace('_', ' ')}
                      </Badge>
                      {stock.availableMeter > 0 && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleSendClick(stock)}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Send to Printing
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-400" />
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Total Meter:</span>
                        <span className="ml-2 font-medium">{stock.totalMeter}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-blue-400" />
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Available Meter:</span>
                        <span className="ml-2 font-medium text-blue-600">{stock.availableMeter}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Send className="h-4 w-4 text-green-400" />
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Sent to Printing:</span>
                        <span className="ml-2 font-medium text-green-600">{stock.sentToPrinting}</span>
                      </div>
                    </div>
                    {stock.longationStock > 0 && (
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-yellow-400" />
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Longation:</span>
                          <span className="ml-2 font-medium text-yellow-600">{stock.longationStock}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  {stock.printingEntries && stock.printingEntries.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium mb-2">Printing Entries:</p>
                      <div className="space-y-1">
                        {stock.printingEntries.map((entry, index) => (
                          <div key={index} className="text-xs text-gray-600 dark:text-gray-400">
                            {new Date(entry.date).toLocaleDateString()} - {entry.meter} meters
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Send to Printing Modal */}
        <Dialog open={showSendModal} onOpenChange={setShowSendModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send to Printing</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedStock && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Lot Number: <span className="font-medium">{selectedStock.lotNumber}</span>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Available Meter: <span className="font-medium">{selectedStock.availableMeter}</span>
                  </p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mb-4">
                    Remaining meter will be automatically added to Longation Stock
                  </p>
                </div>
              )}
              <div>
                <Label>Meter to Send *</Label>
                <Input
                  type="number"
                  value={meterToSend}
                  onChange={(e) => setMeterToSend(parseFloat(e.target.value) || 0)}
                  max={selectedStock?.availableMeter}
                  required
                />
                {selectedStock && (
                  <p className="text-xs text-gray-500 mt-1">
                    Remaining: {selectedStock.totalMeter - (selectedStock.sentToPrinting + meterToSend)} meters
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowSendModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSend}>
                  <Send className="h-4 w-4 mr-2" />
                  Send to Printing
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}


