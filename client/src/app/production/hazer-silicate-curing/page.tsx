'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { AppLayout } from '@/components/layout/AppLayout'
import { Badge } from '@/components/ui/badge'
import { 
  useGetHazerSilicateCuringQuery,
  useGetHazerSilicateCuringWIPQuery,
  useCreateHazerSilicateCuringMutation,
  useUpdateHazerSilicateCuringOutputMutation,
  HazerSilicateCuring
} from '@/lib/api/productionModulesApi'
import { Plus, Zap, Clock } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CustomerSearchInput } from '@/components/production/CustomerSearchInput'
import { useGetLotDetailsQuery, useGetAvailableInputMeterQuery } from '@/lib/api/productionModulesApi'

export default function HazerSilicateCuringPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showOutputModal, setShowOutputModal] = useState(false)
  const [selectedProcess, setSelectedProcess] = useState<HazerSilicateCuring | null>(null)
  const [formData, setFormData] = useState({
    lotNumber: '',
    partyName: '',
    customerId: '',
    quality: '',
    inputMeter: 0,
    printingId: '',
    processType: 'hazer' as 'hazer' | 'silicate' | 'curing',
    chemicalUsed: '',
    temperature: 0,
    time: 0,
    operatorName: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [outputData, setOutputData] = useState({
    processedMeter: 0,
    lossMeter: 0
  })

  const { data, isLoading, refetch } = useGetHazerSilicateCuringQuery({})
  const { data: wipData } = useGetHazerSilicateCuringWIPQuery()
  const [createProcess] = useCreateHazerSilicateCuringMutation()
  const [updateOutput] = useUpdateHazerSilicateCuringOutputMutation()

  // Auto-fill from lot number
  const { data: lotDetailsData, refetch: refetchLotDetails } = useGetLotDetailsQuery(
    formData.lotNumber,
    { skip: !formData.lotNumber || formData.lotNumber.length < 3 }
  )
  const { data: availableMeterData } = useGetAvailableInputMeterQuery(
    { lotNumber: formData.lotNumber, targetModule: 'hazer' },
    { skip: !formData.lotNumber || formData.lotNumber.length < 3 }
  )

  const processes = data?.data || []
  const wip = wipData?.data || []

  // Auto-fill party name, quality, and customerId when lot number changes
  useEffect(() => {
    if (lotDetailsData?.data?.lotDetails && formData.lotNumber) {
      const lotDetails = lotDetailsData.data.lotDetails
      setFormData(prev => ({
        ...prev,
        partyName: lotDetails.partyName || prev.partyName,
        customerId: lotDetails.customerId || prev.customerId,
        quality: lotDetails.quality || prev.quality
      }))
    }
  }, [lotDetailsData, formData.lotNumber])

  // Auto-fill input meter from Printing module
  useEffect(() => {
    if (availableMeterData?.data?.availableMeter && availableMeterData.data.availableMeter > 0) {
      setFormData(prev => ({
        ...prev,
        inputMeter: availableMeterData.data.availableMeter
      }))
    }
  }, [availableMeterData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createProcess(formData).unwrap()
      toast.success('Process entry created successfully')
      setShowCreateModal(false)
      resetForm()
      refetch()
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to create process entry')
    }
  }

  const handleUpdateOutput = async () => {
    if (!selectedProcess) return
    if (outputData.processedMeter + outputData.lossMeter > selectedProcess.inputMeter) {
      toast.error('Processed + Loss meter cannot exceed input meter')
      return
    }
    try {
      await updateOutput({
        id: selectedProcess._id!,
        data: outputData
      }).unwrap()
      toast.success('Process output updated successfully')
      setShowOutputModal(false)
      setSelectedProcess(null)
      setOutputData({ processedMeter: 0, lossMeter: 0 })
      refetch()
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update process output')
    }
  }

  const resetForm = () => {
    setFormData({
      lotNumber: '',
      partyName: '',
      customerId: '',
      quality: '',
      inputMeter: 0,
      printingId: '',
      processType: 'hazer',
      chemicalUsed: '',
      temperature: 0,
      time: 0,
      operatorName: '',
      date: new Date().toISOString().split('T')[0]
    })
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'outline',
      in_progress: 'default',
      completed: 'secondary'
    }
    return <Badge variant={variants[status] || 'default'}>{status.replace('_', ' ')}</Badge>
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Hazer / Silicate / Curing</h1>
            <p className="text-muted-foreground">Manage chemical fixation, curing & coating processes</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Process Entry
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
                {wip.map((process) => (
                  <div key={process._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">{process.partyName} - Lot: {process.lotNumber}</div>
                        <div className="text-sm text-muted-foreground">
                          Type: {process.processType} | Quality: {process.quality}
                        </div>
                        <div className="text-sm mt-2">
                          Input: {process.inputMeter}m | 
                          Processed: {process.processedMeter}m | 
                          Loss: {process.lossMeter}m | 
                          Pending: {process.pendingMeter}m
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {getStatusBadge(process.status)}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedProcess(process)
                            setOutputData({
                              processedMeter: process.processedMeter,
                              lossMeter: process.lossMeter
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

        {/* All Processes */}
        <Card>
          <CardHeader>
            <CardTitle>All Process Entries</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div>Loading...</div>
            ) : processes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No process entries found</div>
            ) : (
              <div className="space-y-4">
                {processes.map((process) => (
                  <div key={process._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-semibold">{process.partyName} - Lot: {process.lotNumber}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Type: {process.processType} | Quality: {process.quality}
                        </div>
                        {process.operatorName && (
                          <div className="text-sm text-muted-foreground">
                            Operator: {process.operatorName}
                          </div>
                        )}
                        <div className="mt-2 grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Input:</span> {process.inputMeter}m
                          </div>
                          <div>
                            <span className="text-muted-foreground">Processed:</span> {process.processedMeter}m
                          </div>
                          <div>
                            <span className="text-muted-foreground">Loss:</span> {process.lossMeter}m
                          </div>
                          <div>
                            <span className="text-muted-foreground">Pending:</span> {process.pendingMeter}m
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {getStatusBadge(process.status)}
                        {process.pendingMeter > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedProcess(process)
                              setOutputData({
                                processedMeter: process.processedMeter,
                                lossMeter: process.lossMeter
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
              <DialogTitle>Create New Process Entry</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                  <Label>Quality *</Label>
                  <Input
                    value={formData.quality}
                    onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Input Meter *</Label>
                  <Input
                    type="number"
                    value={formData.inputMeter}
                    onChange={(e) => setFormData({ ...formData, inputMeter: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label>Process Type *</Label>
                  <Select
                    value={formData.processType}
                    onValueChange={(value: 'hazer' | 'silicate' | 'curing') => 
                      setFormData({ ...formData, processType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hazer">Hazer</SelectItem>
                      <SelectItem value="silicate">Silicate</SelectItem>
                      <SelectItem value="curing">Curing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Chemical Used</Label>
                  <Input
                    value={formData.chemicalUsed}
                    onChange={(e) => setFormData({ ...formData, chemicalUsed: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Temperature</Label>
                  <Input
                    type="number"
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Time (minutes)</Label>
                  <Input
                    type="number"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: Number(e.target.value) })}
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
                  <Label>Date *</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
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

        {/* Update Output Modal */}
        <Dialog open={showOutputModal} onOpenChange={setShowOutputModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Process Output</DialogTitle>
            </DialogHeader>
            {selectedProcess && (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Total Input: {selectedProcess.inputMeter}m
                </div>
                <div>
                  <Label>Processed Meter *</Label>
                  <Input
                    type="number"
                    value={outputData.processedMeter}
                    onChange={(e) => setOutputData({ ...outputData, processedMeter: Number(e.target.value) })}
                    max={selectedProcess.inputMeter}
                    required
                  />
                </div>
                <div>
                  <Label>Loss Meter *</Label>
                  <Input
                    type="number"
                    value={outputData.lossMeter}
                    onChange={(e) => setOutputData({ ...outputData, lossMeter: Number(e.target.value) })}
                    max={selectedProcess.inputMeter - outputData.processedMeter}
                    required
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  Pending: {selectedProcess.inputMeter - outputData.processedMeter - outputData.lossMeter}m
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


