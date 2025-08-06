'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Search, Filter, Download, Upload, Users, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AppLayout } from '@/components/layout/AppLayout'
import CustomerVisitList from '@/components/hospitality/CustomerVisitList'
import CustomerVisitFormModal from '@/components/hospitality/modals/CustomerVisitFormModal'
import HospitalityFilters from '@/components/hospitality/HospitalityFilters'
import HospitalityStats from '@/components/hospitality/HospitalityStats'
import { useGetAllCustomerVisitsQuery, useGetHospitalityStatsQuery } from '@/lib/features/hospitality/hospitalityApi'
import { toast } from 'react-hot-toast'

export default function HospitalityPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    purpose: '',
    travelType: '',
    approvalStatus: '',
    dateFrom: '',
    dateTo: ''
  })

  // RTK Query hooks with real-time data
  const {
    data: visitsResponse,
    isLoading: isLoadingVisits,
    error: visitsError,
    refetch: refetchVisits
  } = useGetAllCustomerVisitsQuery({
    page: currentPage,
    limit: 10,
    search: searchTerm,
    purpose: filters.purpose,
    travelType: filters.travelType,
    approvalStatus: filters.approvalStatus,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo
  }, {
    pollingInterval: 30000, // Poll every 30 seconds for real-time updates
    refetchOnFocus: true,
    refetchOnReconnect: true
  })

  const {
    data: statsData,
    isLoading: isLoadingStats
  } = useGetHospitalityStatsQuery({
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo
  }, {
    pollingInterval: 60000, // Poll every minute for stats
    refetchOnFocus: true
  })

  const visits = visitsResponse?.data || []
  const totalPages = visitsResponse?.totalPages || 1
  const totalVisits = visitsResponse?.total || 0

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filtering
  }

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false)
    refetchVisits()
    toast.success('Customer visit created successfully!')
  }

  const handleExport = () => {
    // TODO: Implement export functionality
    toast.success('Export functionality coming soon!')
  }

  const handleImport = () => {
    // TODO: Implement import functionality
    toast.success('Import functionality coming soon!')
  }

  // Handle errors in useEffect to avoid setState during render
  useEffect(() => {
    if (visitsError) {
      toast.error('Failed to load customer visits')
    }
  }, [visitsError])

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Users className="w-8 h-8 mr-3 text-blue-600" />
                Hospitality Management
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage customer visit expenses, hotel bookings, food expenses, and gifts tracking
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleImport}
                variant="outline"
                className="flex items-center"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              <Button
                onClick={handleExport}
                variant="outline"
                className="flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Customer Visit
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <HospitalityStats
          stats={statsData}
          isLoading={isLoadingStats}
        />
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by party name, contact person, or purpose..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filter Toggle */}
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="flex items-center"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {Object.values(filters).some(v => v) && (
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  Active
                </span>
              )}
            </Button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <HospitalityFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={() => {
                  setFilters({
                    purpose: '',
                    travelType: '',
                    approvalStatus: '',
                    dateFrom: '',
                    dateTo: ''
                  })
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Customer Visits List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <CustomerVisitList
          visits={visits}
          isLoading={isLoadingVisits}
          page={currentPage}
          totalPages={totalPages}
          totalVisits={totalVisits}
          onPageChange={setCurrentPage}
          onRefresh={refetchVisits}
        />
      </div>

      {/* Create Customer Visit Modal */}
      <CustomerVisitFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
    </AppLayout>
  )
}
