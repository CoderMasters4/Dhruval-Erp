'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AppLayout } from '@/components/layout/AppLayout'
import { Badge } from '@/components/ui/badge'
import { 
  useGetProgramDetailsQuery,
  useCreateProgramDetailsMutation,
  useUpdateProgramDetailsMutation,
  useDeleteProgramDetailsMutation,
  DesignRow,
  ProgramDetails
} from '@/lib/api/productionModulesApi'
import { useGetCustomersQuery } from '@/lib/api/customersApi'
import { Plus, X, Edit, Trash2, FileText, Save, Search } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function ProgramDetailsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingItem, setEditingItem] = useState<ProgramDetails | null>(null)
  const [formData, setFormData] = useState({
    partyName: '',
    customerId: '',
    orderNumber: '',
    fold: 0,
    designs: [] as DesignRow[],
    finishWidth: undefined as number | undefined,
    totalBale: undefined as number | undefined,
    yards: undefined as number | undefined,
    salvage: undefined as number | undefined,
    packingBardan: '',
    shippingMark: '',
    quality: ''
  })
  const [customerSearchQuery, setCustomerSearchQuery] = useState('')

  const { data, isLoading, refetch } = useGetProgramDetailsQuery({})
  const [createProgram] = useCreateProgramDetailsMutation()
  const [updateProgram] = useUpdateProgramDetailsMutation()
  const [deleteProgram] = useDeleteProgramDetailsMutation()
  
  // Fetch customers for search/select
  const { data: customersData } = useGetCustomersQuery({
    search: customerSearchQuery,
    limit: 50
  })
  const customers = customersData?.data || []

  const programs = data?.data || []

  const handleAddDesign = () => {
    setFormData({
      ...formData,
      designs: [...formData.designs, {
        designNumber: '',
        bale: 0,
        meter: 0,
        screen: '',
        instructions: ''
      }]
    })
  }

  const handleRemoveDesign = (index: number) => {
    const newDesigns = formData.designs.filter((_, i) => i !== index)
    setFormData({ ...formData, designs: newDesigns })
  }

  const handleDesignChange = (index: number, field: keyof DesignRow, value: any) => {
    const newDesigns = [...formData.designs]
    newDesigns[index] = { ...newDesigns[index], [field]: value }
    
    // Auto-calculate meter: Bale × 600 × Fold
    if (field === 'bale' || field === 'designNumber') {
      const bale = field === 'bale' ? value : newDesigns[index].bale
      if (bale && formData.fold) {
        newDesigns[index].meter = bale * 600 * formData.fold
      }
    }
    
    setFormData({ ...formData, designs: newDesigns })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Prepare data with customerId if selected
      const submitData = {
        ...formData,
        customerId: formData.customerId || undefined
      }
      
      if (editingItem) {
        await updateProgram({ id: editingItem._id!, data: submitData }).unwrap()
        toast.success('Program details updated successfully')
      } else {
        await createProgram(submitData).unwrap()
        toast.success('Program details created successfully')
      }
      setShowCreateModal(false)
      setEditingItem(null)
      setFormData({
        partyName: '',
        customerId: '',
        orderNumber: '',
        fold: 0,
        designs: [],
        finishWidth: undefined,
        totalBale: undefined,
        yards: undefined,
        salvage: undefined,
        packingBardan: '',
        shippingMark: '',
        quality: ''
      })
      setCustomerSearchQuery('')
      refetch()
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to save program details')
    }
  }

  const handleEdit = (program: ProgramDetails) => {
    setEditingItem(program)
    setFormData({
      partyName: program.partyName,
      customerId: program.customerId || '',
      orderNumber: program.orderNumber,
      fold: program.fold,
      designs: program.designs || [],
      finishWidth: program.finishWidth,
      totalBale: program.totalBale,
      yards: program.yards,
      salvage: program.salvage,
      packingBardan: program.packingBardan || '',
      shippingMark: program.shippingMark || '',
      quality: program.quality || ''
    })
    setShowCreateModal(true)
  }
  
  const handleCustomerSelect = (customer: any) => {
    setFormData({
      ...formData,
      customerId: customer._id,
      partyName: customer.customerName || customer.displayName || ''
    })
    setCustomerSearchQuery('')
  }
  
  const selectedCustomer = customers.find(c => c._id === formData.customerId)
  const filteredCustomers = customers.filter(customer => {
    if (!customerSearchQuery) return true
    const searchLower = customerSearchQuery.toLowerCase()
    return (
      customer.customerName?.toLowerCase().includes(searchLower) ||
      customer.displayName?.toLowerCase().includes(searchLower) ||
      customer.customerCode?.toLowerCase().includes(searchLower) ||
      customer.contactInfo?.primaryPhone?.toLowerCase().includes(searchLower) ||
      customer.contactInfo?.primaryEmail?.toLowerCase().includes(searchLower)
    )
  })

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this program details?')) return
    try {
      await deleteProgram(id).unwrap()
      toast.success('Program details deleted successfully')
      refetch()
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to delete program details')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'active': return 'bg-blue-100 text-blue-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Program Details</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage production program entries</p>
          </div>
          <Button onClick={() => {
            setEditingItem(null)
            setFormData({
              partyName: '',
              customerId: '',
              orderNumber: '',
              fold: 0,
              designs: [],
              finishWidth: undefined,
              totalBale: undefined,
              yards: undefined,
              salvage: undefined,
              packingBardan: '',
              shippingMark: '',
              quality: ''
            })
            setCustomerSearchQuery('')
            setShowCreateModal(true)
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Create Program
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="grid gap-4">
            {programs.map((program) => (
              <Card key={program._id} className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{program.orderNumber}</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Party: {program.partyName} | Fold: {program.fold}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(program.status)}>
                        {program.status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(program)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(program._id!)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Total Bale:</span>
                      <span className="ml-2 font-medium">{program.totalBale || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Designs:</span>
                      <span className="ml-2 font-medium">{program.designs?.length || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Quality:</span>
                      <span className="ml-2 font-medium">{program.quality || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Yards:</span>
                      <span className="ml-2 font-medium">{program.yards || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Program Details' : 'Create Program Details'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 relative">
                  <Label>Customer / Party Name *</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                    <Input
                      placeholder="Search customers by name, code, phone..."
                      value={customerSearchQuery}
                      onChange={(e) => setCustomerSearchQuery(e.target.value)}
                      className="pl-10"
                      onBlur={() => setTimeout(() => setCustomerSearchQuery(''), 200)}
                    />
                  </div>
                  {customerSearchQuery && filteredCustomers.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg">
                      {filteredCustomers.map((customer) => (
                        <div
                          key={customer._id}
                          onClick={() => handleCustomerSelect(customer)}
                          className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900 dark:text-white">
                            {customer.customerName || customer.displayName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {customer.customerCode}
                            {customer.contactInfo?.primaryPhone && ` • ${customer.contactInfo.primaryPhone}`}
                            {customer.contactInfo?.primaryEmail && ` • ${customer.contactInfo.primaryEmail}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {customerSearchQuery && filteredCustomers.length === 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg px-4 py-2 text-gray-500 dark:text-gray-400">
                      No customers found
                    </div>
                  )}
                  {selectedCustomer ? (
                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                      <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Selected: {selectedCustomer.customerName || selectedCustomer.displayName} ({selectedCustomer.customerCode})
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-1"
                        onClick={() => {
                          setFormData({ ...formData, customerId: '', partyName: '' })
                          setCustomerSearchQuery('')
                        }}
                      >
                        Clear Selection
                      </Button>
                    </div>
                  ) : (
                    <Input
                      placeholder="Or enter party name manually"
                      value={formData.partyName}
                      onChange={(e) => setFormData({ ...formData, partyName: e.target.value, customerId: '' })}
                      required
                    />
                  )}
                </div>
                <div>
                  <Label>Order Number *</Label>
                  <Input
                    value={formData.orderNumber}
                    onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Fold *</Label>
                  <Input
                    type="number"
                    value={formData.fold}
                    onChange={(e) => {
                      const fold = parseFloat(e.target.value) || 0
                      setFormData({ ...formData, fold })
                      // Recalculate meters for all designs
                      const updatedDesigns = formData.designs.map(design => ({
                        ...design,
                        meter: design.bale * 600 * fold
                      }))
                      setFormData(prev => ({ ...prev, designs: updatedDesigns }))
                    }}
                    required
                  />
                </div>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Design Mini Module</CardTitle>
                    <Button type="button" onClick={handleAddDesign} variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Design
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {formData.designs.map((design, index) => (
                      <div key={index} className="grid grid-cols-5 gap-4 p-4 border rounded-lg">
                        <div>
                          <Label>Design Number</Label>
                          <Input
                            value={design.designNumber}
                            onChange={(e) => handleDesignChange(index, 'designNumber', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label>Bale</Label>
                          <Input
                            type="number"
                            value={design.bale || ''}
                            onChange={(e) => handleDesignChange(index, 'bale', e.target.value ? parseFloat(e.target.value) : undefined)}
                            placeholder="0"
                            required
                          />
                        </div>
                        <div>
                          <Label>Meter (Auto)</Label>
                          <Input
                            type="number"
                            value={design.meter || 0}
                            disabled
                            className="bg-gray-100"
                          />
                        </div>
                        <div>
                          <Label>Screen</Label>
                          <Input
                            value={design.screen || ''}
                            onChange={(e) => handleDesignChange(index, 'screen', e.target.value)}
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveDesign(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="col-span-5">
                          <Label>Instructions</Label>
                          <Textarea
                            value={design.instructions || ''}
                            onChange={(e) => handleDesignChange(index, 'instructions', e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Finish Width</Label>
                  <Input
                    type="number"
                    value={formData.finishWidth ?? ''}
                    onChange={(e) => setFormData({ ...formData, finishWidth: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Total Bale</Label>
                  <Input
                    type="number"
                    value={formData.totalBale ?? ''}
                    onChange={(e) => setFormData({ ...formData, totalBale: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Yards</Label>
                  <Input
                    type="number"
                    value={formData.yards ?? ''}
                    onChange={(e) => setFormData({ ...formData, yards: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Salvage</Label>
                  <Input
                    type="number"
                    value={formData.salvage ?? ''}
                    onChange={(e) => setFormData({ ...formData, salvage: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Packing Bardan</Label>
                  <Input
                    value={formData.packingBardan}
                    onChange={(e) => setFormData({ ...formData, packingBardan: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Shipping Mark</Label>
                  <Input
                    value={formData.shippingMark}
                    onChange={(e) => setFormData({ ...formData, shippingMark: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Quality</Label>
                  <Input
                    value={formData.quality}
                    onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  {editingItem ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}

