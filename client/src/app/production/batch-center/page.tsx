'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { AppLayout } from '@/components/layout/AppLayout'
import { Badge } from '@/components/ui/badge'
import { 
  useGetBatchCentersQuery,
  useCreateBatchCenterMutation,
  useUpdateReceivedMeterMutation,
  useGetPartyNameByLotQuery,
  BatchCenter
} from '@/lib/api/productionModulesApi'
import { Plus, Edit, Calendar, Package, CheckCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CustomerSearchInput } from '@/components/production/CustomerSearchInput'

export default function BatchCenterPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState<BatchCenter | null>(null)
  const [receivedMeter, setReceivedMeter] = useState(0)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    lotNumber: '',
    partyName: '',
    customerId: '',
    quality: '',
    totalMeter: 0,
    receivedMeter: 0
  })

  const { data, isLoading, refetch } = useGetBatchCentersQuery({})
  const [createBatch] = useCreateBatchCenterMutation()
  const [updateReceivedMeter] = useUpdateReceivedMeterMutation()
  
  // Auto-fill party name when lot number changes
  const { data: partyNameData, refetch: refetchPartyName } = useGetPartyNameByLotQuery(
    formData.lotNumber,
    { skip: !formData.lotNumber }
  )

  const batches = data?.data || []

  useEffect(() => {
    if (formData.lotNumber && partyNameData?.data?.partyName) {
      setFormData(prev => ({ ...prev, partyName: partyNameData.data.partyName || '' }))
    }
  }, [formData.lotNumber, partyNameData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createBatch(formData).unwrap()
      toast.success('Batch entry created successfully')
      setShowCreateModal(false)
      setFormData({
        date: new Date().toISOString().split('T')[0],
        lotNumber: '',
        partyName: '',
        customerId: '',
        quality: '',
        totalMeter: 0,
        receivedMeter: 0
      })
      refetch()
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to create batch entry')
    }
  }

  const handleUpdateClick = (batch: BatchCenter) => {
    setSelectedBatch(batch)
    setReceivedMeter(batch.receivedMeter)
    setShowUpdateModal(true)
  }

  const handleUpdate = async () => {
    if (!selectedBatch || receivedMeter < 0) {
      toast.error('Please enter a valid received meter')
      return
    }
    if (receivedMeter > selectedBatch.totalMeter) {
      toast.error(`Received meter cannot exceed total meter (${selectedBatch.totalMeter})`)
      return
    }
    try {
      await updateReceivedMeter({
        id: selectedBatch._id!,
        data: { receivedMeter }
      }).unwrap()
      toast.success('Received meter updated successfully')
      setShowUpdateModal(false)
      setSelectedBatch(null)
      setReceivedMeter(0)
      refetch()
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update received meter')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'partial': return 'bg-yellow-100 text-yellow-800'
      case 'pending': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Batch Center</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage batch entries and received meters</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Batch Entry
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="grid gap-4">
            {batches.map((batch) => (
              <Card key={batch._id} className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Lot: {batch.lotNumber}</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Party: {batch.partyName} | Date: {new Date(batch.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(batch.status)}>
                        {batch.status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateClick(batch)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Update Received
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-400" />
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Quality:</span>
                        <span className="ml-2 font-medium">{batch.quality}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-blue-400" />
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Total Meter:</span>
                        <span className="ml-2 font-medium">{batch.totalMeter}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Received Meter:</span>
                        <span className="ml-2 font-medium text-green-600">{batch.receivedMeter}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-yellow-400" />
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Pending Meter:</span>
                        <span className="ml-2 font-medium text-yellow-600">{batch.pendingMeter}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Batch Entry</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date *</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Lot Number *</Label>
                  <Input
                    value={formData.lotNumber}
                    onChange={(e) => {
                      setFormData({ ...formData, lotNumber: e.target.value })
                    }}
                    required
                  />
                </div>
                <CustomerSearchInput
                  value={formData.partyName}
                  customerId={formData.customerId}
                  onChange={(partyName, customerId) => {
                    setFormData({ ...formData, partyName, customerId })
                  }}
                  label="Party Name * (Auto-filled from lot or search)"
                  required
                />
                <div>
                  <Label>Quality *</Label>
                  <Input
                    value={formData.quality}
                    onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Total Meter *</Label>
                  <Input
                    type="number"
                    value={formData.totalMeter}
                    onChange={(e) => setFormData({ ...formData, totalMeter: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div>
                  <Label>Received Meter</Label>
                  <Input
                    type="number"
                    value={formData.receivedMeter}
                    onChange={(e) => setFormData({ ...formData, receivedMeter: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Update Received Meter Modal */}
        <Dialog open={showUpdateModal} onOpenChange={setShowUpdateModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Received Meter</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedBatch && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Lot Number: <span className="font-medium">{selectedBatch.lotNumber}</span>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Total Meter: <span className="font-medium">{selectedBatch.totalMeter}</span>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Current Received: <span className="font-medium">{selectedBatch.receivedMeter}</span>
                  </p>
                </div>
              )}
              <div>
                <Label>Received Meter *</Label>
                <Input
                  type="number"
                  value={receivedMeter}
                  onChange={(e) => setReceivedMeter(parseFloat(e.target.value) || 0)}
                  max={selectedBatch?.totalMeter}
                  required
                />
                {selectedBatch && (
                  <p className="text-xs text-gray-500 mt-1">
                    Pending: {selectedBatch.totalMeter - receivedMeter} meters (auto-calculated)
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowUpdateModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdate}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Update
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}


