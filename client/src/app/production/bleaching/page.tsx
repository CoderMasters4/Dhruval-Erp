'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { AppLayout } from '@/components/layout/AppLayout'
import { Badge } from '@/components/ui/badge'
import { 
  useGetBleachingDashboardQuery,
  useCreateBleachingProcessMutation,
  useCompleteBleachingProcessMutation,
  BleachingProcess
} from '@/lib/api/productionModulesApi'
import { useGetCustomersQuery } from '@/lib/api/customersApi'
import { selectIsSuperAdmin, selectCurrentCompanyId } from '@/lib/features/auth/authSlice'
import { Plus, CheckCircle, Download, FileText, Truck, Search, X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function BleachingProcessPage() {
  const isSuperAdmin = useSelector(selectIsSuperAdmin)
  const currentCompanyId = useSelector(selectCurrentCompanyId)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [selectedProcess, setSelectedProcess] = useState<BleachingProcess | null>(null)
  const [updatedMeter, setUpdatedMeter] = useState('')
  const [customerSearch, setCustomerSearch] = useState('')
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [formData, setFormData] = useState({
    customerId: '',
    partyName: '',
    date: new Date().toISOString().split('T')[0],
    lotNumber: '',
    totalBale: '',
    totalMeter: '',
    transportName: '',
    mercerise: {
      degree: '',
      width: ''
    }
  })

  // Get company ID for customer search
  const companyId = isSuperAdmin ? undefined : (currentCompanyId || undefined)

  // Fetch customers for search
  const { data: customersData } = useGetCustomersQuery({
    companyId: companyId,
    status: 'active',
    limit: 1000
  }, {
    skip: false
  })

  const customers = customersData?.data || []

  // Filter customers based on search
  const filteredCustomers = customers.filter((customer: any) => {
    if (!customerSearch) return false
    const searchLower = customerSearch.toLowerCase()
    return (
      customer.customerName?.toLowerCase().includes(searchLower) ||
      customer.customerCode?.toLowerCase().includes(searchLower) ||
      customer.contactInfo?.primaryPhone?.toLowerCase().includes(searchLower) ||
      customer.contactInfo?.primaryEmail?.toLowerCase().includes(searchLower)
    )
  })

  // Ref for dropdown to handle click outside
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCustomerDropdown(false)
      }
    }

    if (showCustomerDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCustomerDropdown])

  const { data, isLoading, refetch } = useGetBleachingDashboardQuery(undefined, {
    // Ensure the query is always active
    refetchOnMountOrArgChange: true,
    refetchOnFocus: false,
    refetchOnReconnect: true
  })
  const [createProcess] = useCreateBleachingProcessMutation()
  const [completeProcess] = useCompleteBleachingProcessMutation()

  const processes = data?.data || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Convert string values to numbers, only if they have values
      const submitData = {
        ...formData,
        customerId: formData.customerId || undefined,
        totalBale: formData.totalBale ? parseFloat(formData.totalBale.toString()) : 0,
        totalMeter: formData.totalMeter ? parseFloat(formData.totalMeter.toString()) : 0,
        mercerise: {
          degree: formData.mercerise.degree ? parseFloat(formData.mercerise.degree.toString()) : undefined,
          width: formData.mercerise.width ? parseFloat(formData.mercerise.width.toString()) : undefined
        }
      }
      await createProcess(submitData).unwrap()
      toast.success('Bleaching process created successfully')
      setShowCreateModal(false)
      setFormData({
        customerId: '',
        partyName: '',
        date: new Date().toISOString().split('T')[0],
        lotNumber: '',
        totalBale: '',
        totalMeter: '',
        transportName: '',
        mercerise: {
          degree: '',
          width: ''
        }
      })
      setCustomerSearch('')
      // Refetch data to update the list
      try {
        await refetch().unwrap()
      } catch (err) {
        // Refetch failed, but mutation should have invalidated cache anyway
        console.log('Refetch after create failed:', err)
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to create bleaching process')
    }
  }

  const handleComplete = async () => {
    if (!selectedProcess || !updatedMeter || parseFloat(updatedMeter.toString()) <= 0) {
      toast.error('Please enter a valid updated meter')
      return
    }
    try {
      await completeProcess({
        id: selectedProcess._id!,
        data: { updatedMeter: parseFloat(updatedMeter.toString()) }
      }).unwrap()
      toast.success('Bleaching process completed successfully')
      setShowCompleteModal(false)
      setSelectedProcess(null)
      setUpdatedMeter('')
      // Refetch data to update the list
      try {
        await refetch().unwrap()
      } catch (err) {
        // Refetch failed, but mutation should have invalidated cache anyway
        console.log('Refetch after complete failed:', err)
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to complete bleaching process')
    }
  }

  const handleCompleteClick = (process: BleachingProcess) => {
    setSelectedProcess(process)
    setUpdatedMeter(process.totalMeter?.toString() || '')
    setShowCompleteModal(true)
  }

  const handleCustomerSelect = (customer: any) => {
    const customerName = customer.customerName || customer.displayName || ''
    setFormData({ 
      ...formData, 
      customerId: customer._id || '',
      partyName: customerName 
    })
    setCustomerSearch(customerName)
    setShowCustomerDropdown(false)
  }

  // Reset form when modal closes
  useEffect(() => {
    if (!showCreateModal) {
      setFormData({
        customerId: '',
        partyName: '',
        date: new Date().toISOString().split('T')[0],
        lotNumber: '',
        totalBale: '',
        totalMeter: '',
        transportName: '',
        mercerise: {
          degree: '',
          width: ''
        }
      })
      setCustomerSearch('')
      setShowCustomerDropdown(false)
    }
  }, [showCreateModal])

  const handleDownloadChallan = async (processId: string) => {
    try {
      toast.loading('Generating and downloading challan...', { id: 'download-challan' })
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'
      const response = await fetch(`${baseUrl}/production/bleaching/${processId}/challan/pdf`, {
        method: 'GET',
        credentials: 'include'
      })

      if (!response.ok) {
        console.error('Failed to download challan:', response.statusText)
        toast.error('Failed to download challan. Please try again.', { id: 'download-challan' })
        return
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // Get lot number from the process
      const processData = processes.find((p: BleachingProcess) => p._id === processId)
      const fileName = `Bleaching-Challan-${processData?.lotNumber || processId}.pdf`
      
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Challan downloaded successfully', { id: 'download-challan' })
      
      // Refresh the data to update challan status
      try {
        await refetch().unwrap()
      } catch (err) {
        // Refetch failed, but data should be updated anyway
        console.log('Refetch after download failed:', err)
      }
    } catch (error) {
      console.error('Error downloading challan:', error)
      toast.error('Error downloading challan. Please try again.', { id: 'download-challan' })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bleaching Process</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage bleaching process entries and completion</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Entry
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="grid gap-4">
            {processes.map((process) => (
              <Card key={process._id} className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Lot: {process.lotNumber}</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Party: {process.partyName} | Date: {new Date(process.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(process.status)}>
                        {process.status}
                      </Badge>
                    </div>
                  </div>
                  {/* Action Buttons Section */}
                  <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadChallan(process._id!)}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Challan
                    </Button>
                    {!process.isCompleted && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleCompleteClick(process)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Complete Process
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-gray-400" />
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Transport:</span>
                        <span className="ml-2 font-medium">{process.transportName || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Total Bale:</span>
                        <span className="ml-2 font-medium">{process.totalBale}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Total Meter:</span>
                        <span className="ml-2 font-medium">{process.totalMeter}</span>
                      </div>
                    </div>
                    {process.completedMeter && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Completed Meter:</span>
                          <span className="ml-2 font-medium">{process.completedMeter}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  {process.mercerise && (process.mercerise.degree || process.mercerise.width) && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium mb-2">Mercerise Details:</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Degree:</span>
                          <span className="ml-2 font-medium">{process.mercerise.degree || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Width:</span>
                          <span className="ml-2 font-medium">{process.mercerise.width || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Additional Actions Section */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Actions:</p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadChallan(process._id!)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Challan PDF
                        </Button>
                        {!process.isCompleted && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleCompleteClick(process)}
                            className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Complete Process
                          </Button>
                        )}
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Bleaching Process Entry</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="relative" ref={dropdownRef}>
                  <Label>Party Name *</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      value={customerSearch || formData.partyName}
                      onChange={(e) => {
                        setCustomerSearch(e.target.value)
                        setFormData({ 
                          ...formData, 
                          partyName: e.target.value,
                          customerId: '' // Clear customerId when manually typing
                        })
                        setShowCustomerDropdown(e.target.value.length > 0)
                      }}
                      onFocus={() => {
                        if (customerSearch || formData.partyName) {
                          setShowCustomerDropdown(true)
                        }
                      }}
                      placeholder="Search customer..."
                      className="pl-10"
                      required
                    />
                    {customerSearch && (
                      <button
                        type="button"
                        onClick={() => {
                          setCustomerSearch('')
                          setFormData({ ...formData, partyName: '', customerId: '' })
                          setShowCustomerDropdown(false)
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {showCustomerDropdown && filteredCustomers.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredCustomers.map((customer: any) => (
                        <div
                          key={customer._id}
                          onClick={() => handleCustomerSelect(customer)}
                          className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {customer.customerName || customer.displayName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {customer.customerCode && `Code: ${customer.customerCode}`}
                            {customer.contactInfo?.primaryPhone && ` | Phone: ${customer.contactInfo.primaryPhone}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                <div>
                  <Label>Lot Number *</Label>
                  <Input
                    value={formData.lotNumber}
                    onChange={(e) => setFormData({ ...formData, lotNumber: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Total Bale *</Label>
                  <Input
                    type="number"
                    value={formData.totalBale}
                    onChange={(e) => setFormData({ ...formData, totalBale: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Total Meter / Quantity *</Label>
                  <Input
                    type="number"
                    value={formData.totalMeter}
                    onChange={(e) => setFormData({ ...formData, totalMeter: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Transport Name</Label>
                  <Input
                    value={formData.transportName}
                    onChange={(e) => setFormData({ ...formData, transportName: e.target.value })}
                  />
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Mercerise Sub-Module</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Degree</Label>
                      <Input
                        type="number"
                        value={formData.mercerise.degree}
                        onChange={(e) => setFormData({
                          ...formData,
                          mercerise: { ...formData.mercerise, degree: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <Label>Width</Label>
                      <Input
                        type="number"
                        value={formData.mercerise.width}
                        onChange={(e) => setFormData({
                          ...formData,
                          mercerise: { ...formData.mercerise, width: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Complete Process Modal */}
        <Dialog open={showCompleteModal} onOpenChange={setShowCompleteModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Complete Bleaching Process</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedProcess && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Lot Number: <span className="font-medium">{selectedProcess.lotNumber}</span>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Original Total Meter: <span className="font-medium">{selectedProcess.totalMeter}</span>
                  </p>
                </div>
              )}
              <div>
                <Label>Updated Total Meter *</Label>
                <Input
                  type="number"
                  value={updatedMeter}
                  onChange={(e) => setUpdatedMeter(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will automatically update the After Bleaching stock
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCompleteModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleComplete}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Process
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}

