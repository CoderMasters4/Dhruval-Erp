'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { AppLayout } from '@/components/layout/AppLayout'
import { Badge } from '@/components/ui/badge'
import {
  useGetPrintingsQuery,
  useGetPrintingWIPQuery,
  useCreatePrintingMutation,
  useUpdatePrintingMutation,
  useUpdatePrintingOutputMutation,
  Printing
} from '@/lib/api/productionModulesApi'
import { Plus, Edit, Printer, CheckCircle, XCircle, Clock } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { CustomerSearchInput } from '@/components/production/CustomerSearchInput'
import { useGetLotDetailsQuery, useGetAvailableInputMeterQuery } from '@/lib/api/productionModulesApi'

export default function PrintingPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showOutputModal, setShowOutputModal] = useState(false)
  const [selectedPrinting, setSelectedPrinting] = useState<Printing | null>(null)
  const [formData, setFormData] = useState({
    partyName: '',
    customerId: '',
    orderNumber: '',
    lotNumber: '',
    designNumber: '',
    quality: '',
    totalMeterReceived: 0,
    source: 'after_bleaching' as 'after_bleaching' | 'batch_center',
    sourceId: '',
    screenNo: '',
    designScreen: '',
    printingType: 'reactive' as 'reactive' | 'pigment' | 'digital' | 'kitenge',
    operatorName: '',
    machineName: '',
    date: new Date().toISOString().split('T')[0],
    remarks: '',
    instructions: ''
  })
  const [outputData, setOutputData] = useState({
    printedMeter: 0,
    rejectedMeter: 0
  })

  const { data, isLoading, refetch } = useGetPrintingsQuery({})
  const { data: wipData } = useGetPrintingWIPQuery()
  const [createPrinting] = useCreatePrintingMutation()
  const [updatePrinting] = useUpdatePrintingMutation()
  const [updateOutput] = useUpdatePrintingOutputMutation()

  // Auto-fill from lot number
  const { data: lotDetailsData, refetch: refetchLotDetails } = useGetLotDetailsQuery(
    formData.lotNumber,
    { skip: !formData.lotNumber || formData.lotNumber.length < 3 }
  )
  const { data: availableMeterData } = useGetAvailableInputMeterQuery(
    { lotNumber: formData.lotNumber, targetModule: 'printing' },
    { skip: !formData.lotNumber || formData.lotNumber.length < 3 }
  )

  const printings = data?.data || []
  const wip = wipData?.data || []

  // Auto-fill party name, quality, and customerId when lot number changes
  useEffect(() => {
    if (lotDetailsData?.data?.lotDetails && formData.lotNumber) {
      const lotDetails = lotDetailsData.data.lotDetails
      setFormData(prev => ({
        ...prev,
        partyName: lotDetails.partyName || prev.partyName,
        customerId: lotDetails.customerId || prev.customerId || '', // Keep customerId from lot
        quality: lotDetails.quality || prev.quality
      }))
    }
  }, [lotDetailsData, formData.lotNumber])

  // Auto-fill input meter from previous module
  useEffect(() => {
    if (availableMeterData?.data?.availableMeter && availableMeterData.data.availableMeter > 0) {
      setFormData(prev => ({
        ...prev,
        totalMeterReceived: availableMeterData.data.availableMeter
      }))
    }
  }, [availableMeterData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Clean up empty strings - convert to undefined for optional fields
      // IMPORTANT: Keep customerId if it exists (from lot auto-fill or manual selection)
      const cleanedData = {
        ...formData,
        customerId: formData.customerId && formData.customerId.trim() !== '' ? formData.customerId.trim() : undefined,
        sourceId: formData.sourceId && formData.sourceId.trim() !== '' ? formData.sourceId.trim() : undefined,
        orderNumber: formData.orderNumber && formData.orderNumber.trim() !== '' ? formData.orderNumber : undefined,
        screenNo: formData.screenNo && formData.screenNo.trim() !== '' ? formData.screenNo : undefined,
        designScreen: formData.designScreen && formData.designScreen.trim() !== '' ? formData.designScreen : undefined,
        operatorName: formData.operatorName && formData.operatorName.trim() !== '' ? formData.operatorName : undefined,
        machineName: formData.machineName && formData.machineName.trim() !== '' ? formData.machineName : undefined,
        remarks: formData.remarks && formData.remarks.trim() !== '' ? formData.remarks : undefined,
        instructions: formData.instructions && formData.instructions.trim() !== '' ? formData.instructions : undefined
      }

      await createPrinting(cleanedData).unwrap()
      toast.success('Printing entry created successfully')
      setShowCreateModal(false)
      resetForm()
      refetch()
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to create printing entry')
    }
  }

  const handleUpdateOutput = async () => {
    if (!selectedPrinting) return
    if (outputData.printedMeter + outputData.rejectedMeter > selectedPrinting.totalMeterReceived) {
      toast.error('Printed + Rejected meter cannot exceed received meter')
      return
    }
    try {
      await updateOutput({
        id: selectedPrinting._id!,
        data: outputData
      }).unwrap()
      toast.success('Printing output updated successfully')
      setShowOutputModal(false)
      setSelectedPrinting(null)
      setOutputData({ printedMeter: 0, rejectedMeter: 0 })
      refetch()
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update printing output')
    }
  }

  const resetForm = () => {
    setFormData({
      partyName: '',
      customerId: '',
      orderNumber: '',
      lotNumber: '',
      designNumber: '',
      quality: '',
      totalMeterReceived: 0,
      source: 'after_bleaching',
      sourceId: '',
      screenNo: '',
      designScreen: '',
      printingType: 'reactive',
      operatorName: '',
      machineName: '',
      date: new Date().toISOString().split('T')[0],
      remarks: '',
      instructions: ''
    })
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'outline',
      in_progress: 'default',
      completed: 'secondary',
      on_hold: 'destructive'
    }
    return <Badge variant={variants[status] || 'default'}>{status.replace('_', ' ')}</Badge>
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Printing Module</h1>
            <p className="text-muted-foreground">Manage printing processes</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Printing Entry
          </Button>
        </div>

        {/* WIP Section */}
        {wip.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Work In Progress ({wip.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {wip.map((printing) => (
                  <div key={printing._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">{printing.partyName} - Lot: {printing.lotNumber}</div>
                        <div className="text-sm text-muted-foreground">
                          Design: {printing.designNumber} | Type: {printing.printingType}
                        </div>
                        <div className="text-sm mt-2">
                          Received: {printing.totalMeterReceived}m |
                          Printed: {printing.printedMeter}m |
                          Rejected: {printing.rejectedMeter}m |
                          Pending: {printing.pendingMeter}m
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {getStatusBadge(printing.status)}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedPrinting(printing)
                            setOutputData({
                              printedMeter: printing.printedMeter,
                              rejectedMeter: printing.rejectedMeter
                            })
                            setShowOutputModal(true)
                          }}
                        >
                          Update Output
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Printings */}
        <Card>
          <CardHeader>
            <CardTitle>All Printing Entries</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div>Loading...</div>
            ) : printings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No printing entries found</div>
            ) : (
              <div className="space-y-4">
                {printings.map((printing) => (
                  <div key={printing._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-semibold">{printing.partyName} - Lot: {printing.lotNumber}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Order: {printing.orderNumber || 'N/A'} | Design: {printing.designNumber} | Quality: {printing.quality}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Type: {printing.printingType} | Screen: {printing.screenNo || 'N/A'} | Operator: {printing.operatorName || 'N/A'}
                        </div>
                        <div className="mt-2 grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Received:</span> {printing.totalMeterReceived}m
                          </div>
                          <div>
                            <span className="text-muted-foreground">Printed:</span> {printing.printedMeter}m
                          </div>
                          <div>
                            <span className="text-muted-foreground">Rejected:</span> {printing.rejectedMeter}m
                          </div>
                          <div>
                            <span className="text-muted-foreground">Pending:</span> {printing.pendingMeter}m
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {getStatusBadge(printing.status)}
                        {printing.pendingMeter > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedPrinting(printing)
                              setOutputData({
                                printedMeter: printing.printedMeter,
                                rejectedMeter: printing.rejectedMeter
                              })
                              setShowOutputModal(true)
                            }}
                          >
                            Update Output
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Printing Entry</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <CustomerSearchInput
                  value={formData.partyName}
                  customerId={formData.customerId}
                  onChange={(partyName, customerId) => {
                    setFormData({ ...formData, partyName, customerId })
                  }}
                  label="Party Name"
                  required
                />
                <div>
                  <Label>Order Number</Label>
                  <Input
                    value={formData.orderNumber}
                    onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Lot Number *</Label>
                  <Input
                    value={formData.lotNumber}
                    onChange={(e) => {
                      setFormData({ ...formData, lotNumber: e.target.value })
                      if (e.target.value.length >= 3) {
                        refetchLotDetails()
                      }
                    }}
                    placeholder="Enter lot number to auto-fill details"
                    required
                  />
                  {lotDetailsData?.data?.lotDetails && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Auto-filled from {lotDetailsData.data.lotDetails.sourceModule}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Design Number *</Label>
                  <Input
                    value={formData.designNumber}
                    onChange={(e) => setFormData({ ...formData, designNumber: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Quality *</Label>
                  <Input
                    value={formData.quality}
                    onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Total Meter Received *</Label>
                  <Input
                    type="number"
                    value={formData.totalMeterReceived}
                    onChange={(e) => setFormData({ ...formData, totalMeterReceived: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label>Source *</Label>
                  <Select
                    value={formData.source}
                    onValueChange={(value: 'after_bleaching' | 'batch_center') =>
                      setFormData({ ...formData, source: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="after_bleaching">After Bleaching</SelectItem>
                      <SelectItem value="batch_center">Batch Center</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Printing Type *</Label>
                  <Select
                    value={formData.printingType}
                    onValueChange={(value: 'reactive' | 'pigment' | 'digital' | 'kitenge') =>
                      setFormData({ ...formData, printingType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reactive">Reactive</SelectItem>
                      <SelectItem value="pigment">Pigment</SelectItem>
                      <SelectItem value="digital">Digital</SelectItem>
                      <SelectItem value="kitenge">Kitenge</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Screen No</Label>
                  <Input
                    value={formData.screenNo}
                    onChange={(e) => setFormData({ ...formData, screenNo: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Design Screen</Label>
                  <Input
                    value={formData.designScreen}
                    onChange={(e) => setFormData({ ...formData, designScreen: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Operator Name</Label>
                  <Input
                    value={formData.operatorName}
                    onChange={(e) => setFormData({ ...formData, operatorName: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Machine Name</Label>
                  <Input
                    value={formData.machineName}
                    onChange={(e) => setFormData({ ...formData, machineName: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Date *</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label>Remarks</Label>
                <Textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                />
              </div>
              <div>
                <Label>Instructions</Label>
                <Textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                />
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

        {/* Update Output Modal */}
        <Dialog open={showOutputModal} onOpenChange={setShowOutputModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Printing Output</DialogTitle>
            </DialogHeader>
            {selectedPrinting && (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Total Received: {selectedPrinting.totalMeterReceived}m
                </div>
                <div>
                  <Label>Printed Meter *</Label>
                  <Input
                    type="number"
                    value={outputData.printedMeter}
                    onChange={(e) => setOutputData({ ...outputData, printedMeter: Number(e.target.value) })}
                    max={selectedPrinting.totalMeterReceived}
                    required
                  />
                </div>
                <div>
                  <Label>Rejected Meter *</Label>
                  <Input
                    type="number"
                    value={outputData.rejectedMeter}
                    onChange={(e) => setOutputData({ ...outputData, rejectedMeter: Number(e.target.value) })}
                    max={selectedPrinting.totalMeterReceived - outputData.printedMeter}
                    required
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  Pending: {selectedPrinting.totalMeterReceived - outputData.printedMeter - outputData.rejectedMeter}m
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowOutputModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateOutput}>Update</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
