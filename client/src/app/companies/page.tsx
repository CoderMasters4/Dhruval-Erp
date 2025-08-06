'use client'

import React, { useState, Suspense } from 'react'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import {
  Building2,
  Shield,
  AlertCircle,
  Plus
} from 'lucide-react'
import { useSelector } from 'react-redux'

import { AppLayout } from '@/components/layout/AppLayout'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'

import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { selectIsSuperAdmin } from '@/lib/features/auth/authSlice'
import { useGetAllCompaniesQuery } from '@/lib/api/authApi'
import {
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  useDeleteCompanyMutation
} from '@/lib/api/superAdminApi'

// Lazy load components for better performance
const CompanyStats = React.lazy(() => import('@/components/companies/CompanyStats'))
const CompanyFilters = React.lazy(() => import('@/components/companies/CompanyFilters'))
const CompanyList = React.lazy(() => import('@/components/companies/CompanyList'))
const CompanyFormModal = React.lazy(() => import('@/components/companies/modals/CompanyFormModal'))


export default function CompaniesPage() {
  const router = useRouter()
  const isSuperAdmin = useSelector(selectIsSuperAdmin)

  // State management
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    sortBy: 'name',
    sortOrder: 'asc' as 'asc' | 'desc',
    location: '',
    industry: ''
  })
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<any>(null)


  // API hooks
  const { data: companiesData, isLoading, error, refetch } = useGetAllCompaniesQuery(undefined, {
    skip: !isSuperAdmin
  })

  const [createCompany, { isLoading: createLoading }] = useCreateCompanyMutation()
  const [updateCompany, { isLoading: updateLoading }] = useUpdateCompanyMutation()
  const [deleteCompany, { isLoading: deleteLoading }] = useDeleteCompanyMutation()

  // Data processing
  const companies = companiesData?.data || []

  // Filter companies based on search and status
  const filteredCompanies = companies.filter((company: any) => {
    const matchesSearch = !filters.search ||
      company.companyName?.toLowerCase().includes(filters.search.toLowerCase()) ||
      company.companyCode?.toLowerCase().includes(filters.search.toLowerCase()) ||
      company.registrationDetails?.gstin?.toLowerCase().includes(filters.search.toLowerCase())

    const matchesStatus = filters.status === 'all' ||
                         (filters.status === 'active' && company.isActive) ||
                         (filters.status === 'inactive' && !company.isActive)

    const matchesLocation = !filters.location ||
      company.addresses?.registeredOffice?.city?.toLowerCase().includes(filters.location.toLowerCase()) ||
      company.addresses?.registeredOffice?.state?.toLowerCase().includes(filters.location.toLowerCase())

    return matchesSearch && matchesStatus && matchesLocation
  }).sort((a: any, b: any) => {
    const aValue = a[filters.sortBy] || ''
    const bValue = b[filters.sortBy] || ''

    if (filters.sortOrder === 'asc') {
      return aValue.toString().localeCompare(bValue.toString())
    } else {
      return bValue.toString().localeCompare(aValue.toString())
    }
  })

  // Stats calculation
  const stats = {
    totalCompanies: companies.length,
    activeCompanies: companies.filter((c: any) => c.isActive).length,
    inactiveCompanies: companies.filter((c: any) => !c.isActive).length,
    newThisMonth: companies.filter((c: any) =>
      c.createdAt && new Date(c.createdAt).getMonth() === new Date().getMonth()
    ).length
  }



  // Event handlers
  const handleCreateCompany = async (data: any) => {
    try {
      await createCompany(data).unwrap()
      toast.success('Company created successfully')
      setShowCreateModal(false)
      refetch()
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to create company')
    }
  }

  const handleView = (company: any) => {
    router.push(`/companies/${company._id}`)
  }

  const handleEditCompany = (company: any) => {
    setSelectedCompany(company)
    setShowEditModal(true)
  }

  const handleUpdateCompany = async (data: any) => {
    if (!selectedCompany) return
    try {
      await updateCompany({
        companyId: selectedCompany._id,
        companyData: data
      }).unwrap()
      toast.success('Company updated successfully')
      setShowEditModal(false)
      setSelectedCompany(null)
      refetch()
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update company')
    }
  }

  const handleDeleteClick = (company: any) => {
    setSelectedCompany(company)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedCompany) return
    try {
      await deleteCompany(selectedCompany._id).unwrap()
      toast.success('Company deleted successfully')
      setShowDeleteModal(false)
      setSelectedCompany(null)
      refetch()
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to delete company')
    }
  }

  // Access control
  if (!isSuperAdmin) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You need Super Admin privileges to access this page.</p>
          </div>
        </div>
      </AppLayout>
    )
  }



  // Error state
  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Companies</h2>
            <p className="text-gray-600 mb-4">There was an error loading the companies data.</p>
            <Button onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-sky-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg border border-sky-200 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-black mb-2">
                  Companies Management
                </h1>
                <p className="text-gray-600 text-lg">
                  Manage all companies in the system with comprehensive tools
                </p>
              </div>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-sky-500 hover:bg-sky-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 text-base font-semibold rounded-xl"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Company
              </Button>
            </div>
          </div>

        {/* Stats Cards */}
        <Suspense fallback={
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="h-8 w-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        }>
          <CompanyStats stats={stats} isLoading={isLoading} />
        </Suspense>

        {/* Search and Filters */}
        <Suspense fallback={
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="h-12 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="flex gap-3">
                <div className="h-12 w-32 bg-gray-200 rounded-lg"></div>
                <div className="h-12 w-32 bg-gray-200 rounded-lg"></div>
                <div className="h-12 w-32 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        }>
          <CompanyFilters
            filters={filters}
            onFiltersChange={setFilters}
            onReset={() => setFilters({
              search: '',
              status: 'all',
              sortBy: 'name',
              sortOrder: 'asc',
              location: '',
              industry: ''
            })}
            onCreateNew={() => setShowCreateModal(true)}
            isLoading={isLoading}
          />
        </Suspense>

        {/* Companies Grid */}
        {isLoading ? (
          <div className="space-y-6">
            {/* Loading Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                    </div>
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Loading Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 space-y-3">
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-8 w-8 bg-gray-200 rounded"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 animate-pulse"></div>
              <Building2 className="h-20 w-20 text-blue-500 mx-auto mb-6 relative z-10" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {filters.search || filters.status !== 'all' || filters.location || filters.industry ? 'No companies found' : 'Welcome to Companies Management'}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
              {filters.search || filters.status !== 'all' || filters.location || filters.industry
                ? 'Try adjusting your search criteria or filters to find the companies you\'re looking for.'
                : 'Start building your business network by adding your first company to the system.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {(filters.search || filters.status !== 'all' || filters.location || filters.industry) && (
                <Button
                  onClick={() => setFilters({
                    search: '',
                    status: 'all',
                    sortBy: 'name',
                    sortOrder: 'asc',
                    location: '',
                    industry: ''
                  })}
                  variant="outline"
                  className="border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  Clear Filters
                </Button>
              )}
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Your First Company
              </Button>
            </div>
          </div>
        ) : (
          <Suspense fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 space-y-3">
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-8 w-8 bg-gray-200 rounded"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          }>
            <CompanyList
              companies={filteredCompanies}
              isLoading={isLoading}
              onView={handleView}
              onEdit={handleEditCompany}
              onDelete={handleDeleteClick}
            />
          </Suspense>
        )}

        {/* Modals */}
        <Suspense fallback={null}>
          <CompanyFormModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateCompany}
            isLoading={createLoading}
          />
        </Suspense>

        <Suspense fallback={null}>
          <CompanyFormModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false)
              setSelectedCompany(null)
            }}
            company={selectedCompany}
            onSubmit={handleUpdateCompany}
            isLoading={updateLoading}
          />
        </Suspense>

        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false)
            setSelectedCompany(null)
          }}
          onConfirm={handleDeleteConfirm}
          title="Delete Company"
          message={`Are you sure you want to delete "${selectedCompany?.companyName}"? This action cannot be undone.`}
          confirmText="Delete Company"
          isLoading={deleteLoading}
          type="danger"
        />
        </div>
      </div>
    </AppLayout>
  )
}