'use client'

import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import { 
  useGetAllGatePassesQuery,
  useGetGatePassStatsQuery,
  useCreateGatePassMutation,
  useUpdateGatePassMutation,
  useDeleteGatePassMutation,
  useCompleteGatePassMutation,
  useCancelGatePassMutation,
  usePrintGatePassMutation,
  GatePass
} from '@/lib/features/gatepasses/gatepassesApi'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  Car, 
  Clock, 
  User, 
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Printer
} from 'lucide-react'
import { generateGatePassPDF, generateBulkGatePassPDF, GatePassPDFData } from '@/utils/gatePassPDFSimple'
import GatePassFormModal from '@/components/gatepasses/modals/GatePassFormModal'
import AdvancedFilters from '@/components/gatepasses/AdvancedFilters'
import GatePassStats from '@/components/gatepasses/GatePassStats'
import GatePassTable from '@/components/gatepasses/GatePassTable'
import { toast } from 'react-hot-toast'

export default function GatePassesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [purposeFilter, setPurposeFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedGatePass, setSelectedGatePass] = useState<GatePass | null>(null)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedGatePasses, setSelectedGatePasses] = useState<string[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)

  const currentUser = useSelector((state: RootState) => (state as any).auth?.user)
  const currentCompany = currentUser?.companyAccess?.[0]?.companyId

  // API calls
  const { data: gatePassesResponse, isLoading, refetch, error } = useGetAllGatePassesQuery({
    page: currentPage,
    limit: 20,
    search: searchTerm,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    purpose: purposeFilter !== 'all' ? purposeFilter : undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  // Debug API response
  console.log('GatePassesPage: API Response:', {
    gatePassesResponse,
    isLoading,
    error,
    currentPage,
    searchTerm,
    statusFilter,
    purposeFilter
  })

  const { data: statsResponse } = useGetGatePassStatsQuery({
    companyId: currentCompany
  })

  const [createGatePass, { isLoading: isCreating }] = useCreateGatePassMutation()
  const [updateGatePass, { isLoading: isUpdating }] = useUpdateGatePassMutation()
  const [deleteGatePass, { isLoading: isDeleting }] = useDeleteGatePassMutation()
  const [completeGatePass, { isLoading: isCompleting }] = useCompleteGatePassMutation()
  const [cancelGatePass, { isLoading: isCancelling }] = useCancelGatePassMutation()
  const [printGatePass, { isLoading: isPrinting }] = usePrintGatePassMutation()

  const gatePasses = gatePassesResponse?.data || []
  const totalPages = gatePassesResponse?.totalPages || 1

  // Debug logging
  console.log('GatePasses Response:', gatePassesResponse)
  console.log('GatePasses Data:', gatePasses)
  console.log('GatePasses Length:', gatePasses.length)
  const stats = statsResponse || {
    totalGatePasses: 0,
    activeGatePasses: 0,
    completedGatePasses: 0,
    expiredGatePasses: 0,
    cancelledGatePasses: 0,
    averageDuration: 0,
    todayGatePasses: 0,
    purposeBreakdown: {
      delivery: 0,
      pickup: 0,
      maintenance: 0,
      other: 0
    }
  }

  const handleCreateGatePass = () => {
    setSelectedGatePass(null)
    setIsFormModalOpen(true)
  }

  const handleEditGatePass = (gatePass: GatePass) => {
    setSelectedGatePass(gatePass)
    setIsFormModalOpen(true)
  }

  const handleViewGatePass = (gatePass: GatePass) => {
    setSelectedGatePass(gatePass)
    setIsViewModalOpen(true)
  }

  const handleDeleteGatePass = async (gatePassId: string) => {
    if (window.confirm('Are you sure you want to delete this gate pass?')) {
      try {
        await deleteGatePass(gatePassId).unwrap()
        toast.success('Gate pass deleted successfully')
        refetch()
      } catch (error) {
        toast.error('Failed to delete gate pass')
      }
    }
  }

  const handleCompleteGatePass = async (gatePassId: string) => {
    try {
      await completeGatePass(gatePassId).unwrap()
      toast.success('Gate pass completed successfully')
      refetch()
    } catch (error) {
      toast.error('Failed to complete gate pass')
    }
  }

  const handleCancelGatePass = async (gatePassId: string) => {
    if (window.confirm('Are you sure you want to cancel this gate pass?')) {
      try {
        await cancelGatePass(gatePassId).unwrap()
        toast.success('Gate pass cancelled successfully')
        refetch()
      } catch (error) {
        toast.error('Failed to cancel gate pass')
      }
    }
  }

  const handlePrintGatePass = async (gatePassId: string) => {
    try {
      // First call the API to mark as printed
      await printGatePass(gatePassId).unwrap()
      
      // Find the gate pass data for PDF generation
      const gatePass = gatePasses.find(gp => gp._id === gatePassId)
      if (gatePass) {
        // Generate and download PDF
        generateGatePassPDF(gatePass as GatePassPDFData, 'Dhruval Exim Pvt. Ltd.')
        toast.success('Gate pass printed and PDF downloaded successfully')
      } else {
        toast.success('Gate pass printed successfully')
      }
      
      refetch()
    } catch (error) {
      toast.error('Failed to print gate pass')
    }
  }

  const handleSelectGatePass = (gatePassId: string) => {
    setSelectedGatePasses(prev => 
      prev.includes(gatePassId) 
        ? prev.filter(id => id !== gatePassId)
        : [...prev, gatePassId]
    )
  }

  const handleSelectAllGatePasses = () => {
    if (selectedGatePasses.length === gatePasses.length) {
      setSelectedGatePasses([])
    } else {
      setSelectedGatePasses(gatePasses.map(gp => gp._id))
    }
  }

  const handleBulkComplete = async () => {
    if (selectedGatePasses.length === 0) return
    
    try {
      await Promise.all(selectedGatePasses.map(id => completeGatePass(id).unwrap()))
      toast.success(`${selectedGatePasses.length} gate passes completed successfully`)
      setSelectedGatePasses([])
      refetch()
    } catch (error) {
      toast.error('Failed to complete some gate passes')
    }
  }

  const handleBulkCancel = async () => {
    if (selectedGatePasses.length === 0) return
    
    if (window.confirm(`Are you sure you want to cancel ${selectedGatePasses.length} gate passes?`)) {
      try {
        await Promise.all(selectedGatePasses.map(id => cancelGatePass(id).unwrap()))
        toast.success(`${selectedGatePasses.length} gate passes cancelled successfully`)
        setSelectedGatePasses([])
        refetch()
      } catch (error) {
        toast.error('Failed to cancel some gate passes')
      }
    }
  }

  const handleBulkDelete = async () => {
    if (selectedGatePasses.length === 0) return
    
    if (window.confirm(`Are you sure you want to delete ${selectedGatePasses.length} gate passes?`)) {
      try {
        await Promise.all(selectedGatePasses.map(id => deleteGatePass(id).unwrap()))
        toast.success(`${selectedGatePasses.length} gate passes deleted successfully`)
        setSelectedGatePasses([])
        refetch()
      } catch (error) {
        toast.error('Failed to delete some gate passes')
      }
    }
  }

  const handleBulkPrint = async (gatePassIds?: string[]) => {
    const idsToPrint = gatePassIds || selectedGatePasses
    if (idsToPrint.length === 0) return
    
    try {
      // First call the API to mark as printed
      await Promise.all(idsToPrint.map(id => printGatePass(id).unwrap()))
      
      // Find the gate pass data for PDF generation
      const gatePassesToPrint = gatePasses.filter(gp => idsToPrint.includes(gp._id))
      if (gatePassesToPrint.length > 0) {
        // Generate and download PDF
        generateBulkGatePassPDF(gatePassesToPrint as GatePassPDFData[], 'Dhruval Exim Pvt. Ltd.')
        toast.success(`${idsToPrint.length} gate passes printed and PDF downloaded successfully`)
      } else {
        toast.success(`${idsToPrint.length} gate passes printed successfully`)
      }
      
      if (!gatePassIds) {
        setSelectedGatePasses([])
      }
      refetch()
    } catch (error) {
      toast.error('Failed to print some gate passes')
    }
  }

  const handlePrintAll = async () => {
    if (gatePasses.length === 0) {
      toast.error('No gate passes to print')
      return
    }
    if (window.confirm(`Print all ${gatePasses.length} gate passes?`)) {
      await handleBulkPrint(gatePasses.map(gp => gp._id))
    }
  }

  const handleFormSuccess = () => {
    setIsFormModalOpen(false)
    setSelectedGatePass(null)
    refetch()
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setPurposeFilter('all')
    setDateFrom('')
    setDateTo('')
    setCurrentPage(1)
  }

  const handleApplyFilters = () => {
    setCurrentPage(1)
    refetch()
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      completed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      expired: { color: 'bg-red-100 text-red-800', icon: XCircle },
      cancelled: { color: 'bg-gray-100 text-gray-800', icon: XCircle }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active
    const Icon = config.icon
    
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getPurposeBadge = (purpose: string) => {
    const purposeConfig = {
      delivery: { color: 'bg-blue-100 text-blue-800' },
      pickup: { color: 'bg-green-100 text-green-800' },
      maintenance: { color: 'bg-yellow-100 text-yellow-800' },
      other: { color: 'bg-gray-100 text-gray-800' }
    }
    
    const config = purposeConfig[purpose as keyof typeof purposeConfig] || purposeConfig.other
    
    return (
      <Badge className={config.color}>
        {purpose.charAt(0).toUpperCase() + purpose.slice(1)}
      </Badge>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gate Passes</h1>
            <p className="text-gray-600">Manage vehicle gate passes and access control</p>
          </div>
          <div className="flex items-center gap-2">
            {selectedGatePasses.length > 0 && (
              <div className="flex items-center gap-2 mr-4">
                <span className="text-sm text-gray-600">
                  {selectedGatePasses.length} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkComplete}
                  disabled={isCompleting}
                >
                  Complete All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkCancel}
                  disabled={isCancelling}
                >
                  Cancel All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkPrint()}
                  disabled={isPrinting}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Printer className="w-4 h-4 mr-1" />
                  Print Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete All
                </Button>
              </div>
            )}
            <Button
              variant="outline"
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button
              variant="outline"
              onClick={handlePrintAll}
              className="flex items-center gap-2"
              disabled={isPrinting || gatePasses.length === 0}
            >
              <Printer className="w-4 h-4" />
              Print All
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (gatePasses.length === 0) {
                  toast.error('No gate passes to download')
                  return
                }
                try {
                  generateBulkGatePassPDF(gatePasses as GatePassPDFData[], 'Dhruval Exim Pvt. Ltd.')
                  toast.success('PDF downloaded successfully')
                } catch (error) {
                  console.error('Error generating PDF:', error)
                  toast.error('Failed to generate PDF')
                }
              }}
              className="flex items-center gap-2"
              disabled={gatePasses.length === 0}
            >
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
            <Button onClick={handleCreateGatePass} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Gate Pass
            </Button>
          </div>
        </div>

        {/* Stats */}
        <GatePassStats stats={stats} isLoading={!statsResponse} />

        {/* Advanced Filters */}
        <AdvancedFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          purposeFilter={purposeFilter}
          setPurposeFilter={setPurposeFilter}
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
          onClearFilters={handleClearFilters}
          onApplyFilters={handleApplyFilters}
        />

        {/* Gate Passes Table */}
        <Card>
          <CardHeader>
            <CardTitle>Gate Passes</CardTitle>
            {error && (
              <div className="text-red-600 text-sm mt-2">
                Error loading gate passes: {
                  'message' in error 
                    ? error.message 
                    : 'status' in error 
                      ? `HTTP ${error.status}` 
                      : 'Unknown error'
                }
              </div>
            )}
          </CardHeader>
          <CardContent>
            <GatePassTable
              gatePasses={gatePasses}
              selectedGatePasses={selectedGatePasses}
              onSelectGatePass={handleSelectGatePass}
              onSelectAll={handleSelectAllGatePasses}
              onView={handleViewGatePass}
              onEdit={handleEditGatePass}
              onDelete={handleDeleteGatePass}
              onComplete={handleCompleteGatePass}
              onCancel={handleCancelGatePass}
              onPrint={handlePrintGatePass}
              isLoading={isLoading}
              isCompleting={isCompleting}
              isCancelling={isCancelling}
              isDeleting={isDeleting}
              isPrinting={isPrinting}
            />
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="px-4 py-2 text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <GatePassFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={handleFormSuccess}
        gatePass={selectedGatePass || undefined}
      />

      {/* View Modal - You can create this component if needed */}
      {isViewModalOpen && selectedGatePass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Gate Pass Details</h2>
              <Button
                variant="ghost"
                onClick={() => setIsViewModalOpen(false)}
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Gate Pass Number</label>
                  <p className="text-lg font-semibold">{selectedGatePass.gatePassNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedGatePass.status)}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Vehicle Number</label>
                  <p className="text-lg">{selectedGatePass.vehicleNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Purpose</label>
                  <div className="mt-1">{getPurposeBadge(selectedGatePass.purpose)}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Driver Name</label>
                  <p className="text-lg">{selectedGatePass.driverName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Driver Phone</label>
                  <p className="text-lg">{selectedGatePass.driverPhone}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Reason</label>
                <p className="text-lg">{selectedGatePass.reason}</p>
              </div>
              
              {selectedGatePass.personToMeet && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Person to Meet</label>
                  <p className="text-lg">{selectedGatePass.personToMeet}</p>
                </div>
              )}
              
              {selectedGatePass.department && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Department</label>
                  <p className="text-lg">{selectedGatePass.department}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Time In</label>
                  <p className="text-lg">{new Date(selectedGatePass.timeIn).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Time Out</label>
                  <p className="text-lg">
                    {selectedGatePass.timeOut ? new Date(selectedGatePass.timeOut).toLocaleString() : 'Not yet'}
                  </p>
                </div>
              </div>
              
              {selectedGatePass.items && selectedGatePass.items.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Items</label>
                  <div className="mt-2 space-y-2">
                    {selectedGatePass.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span>{item.description}</span>
                        <span className="font-medium">Qty: {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Export Gate Passes</h2>
              <Button
                variant="ghost"
                onClick={() => setIsExportModalOpen(false)}
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Export Format</label>
                <Select defaultValue="pdf">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Date Range</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <Input type="date" placeholder="From" />
                  <Input type="date" placeholder="To" />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Status Filter</label>
                <Select defaultValue="all">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsExportModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    toast.success('Export started. You will receive an email when ready.')
                    setIsExportModalOpen(false)
                  }}
                >
                  Export
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
