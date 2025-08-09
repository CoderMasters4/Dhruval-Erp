'use client'

import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import {
  Shield,
  AlertCircle,
  Plus
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { selectIsSuperAdmin } from '@/lib/features/auth/authSlice'
import {
  useGetAllCustomersQuery,
  Customer
} from '@/lib/features/customers/customersApi'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'

// Import components directly
import CustomerStats from '@/components/customers/CustomerStats'
import CustomerFilters from '@/components/customers/CustomerFilters'
import CustomerList from '@/components/customers/CustomerList'
import { useModals } from '@/hooks/useModals'

interface CustomerFilters {
  search: string
  customerType: string
  status: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

export default function CustomersPage() {
  const isSuperAdmin = useSelector(selectIsSuperAdmin)
  const { openCustomerForm, openCustomerDetails, openDeleteCustomer } = useModals()

  // State management
  const [filters, setFilters] = useState<CustomerFilters>({
    search: '',
    customerType: 'all',
    status: 'all',
    sortBy: 'name',
    sortOrder: 'asc'
  })

  // API query with proper parameters
  const {
    data: customersResponse,
    isLoading,
    error,
    refetch,
    isFetching
  } = useGetAllCustomersQuery({
    search: filters.search || undefined,
    customerType: filters.customerType !== 'all' ? filters.customerType : undefined,
    status: filters.status !== 'all' ? filters.status : undefined,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    page: 1,
    limit: 50
  })

  const customers = customersResponse?.data || []
  const totalCustomers = customersResponse?.total || 0

  // Event handlers
  const handleView = (customer: Customer) => {
    openCustomerDetails({ customer })
  }

  const handleEdit = (customer: Customer) => {
    openCustomerForm({
      customer,
      onSuccess: () => {
        refetch()
        toast.success('Customer updated successfully!')
      }
    })
  }

  const handleDelete = (customer: Customer) => {
    openDeleteCustomer({
      customer,
      onSuccess: () => {
        refetch()
        toast.success('Customer deleted successfully!')
      }
    })
  }

  const handleCreateNew = () => {
    openCustomerForm({
      onSuccess: () => {
        refetch()
        toast.success('Customer created successfully!')
      }
    })
  }

  const handleFilterChange = (newFilters: Partial<CustomerFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const handleReset = () => {
    setFilters({
      search: '',
      customerType: 'all',
      status: 'all',
      sortBy: 'name',
      sortOrder: 'asc'
    })
  }

  // Access control
  if (!isSuperAdmin) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-gray-600">You need Super Admin privileges to access this page.</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  // Error handling
  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Customers</h3>
            <p className="text-gray-600 mb-4">
              {error && 'data' in error
                ? (error.data as any)?.message || 'Failed to load customers'
                : 'An unexpected error occurred'
              }
            </p>
            <Button
              onClick={() => refetch()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Try Again
            </Button>
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
            <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Customers</h3>
            <p className="text-gray-600 mb-4">There was an error loading the customers data.</p>
            <Button onClick={() => refetch()} className="bg-sky-500 hover:bg-sky-600 text-white">
              Try Again
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-black">Customer Management</h1>
                <p className="text-gray-600 mt-1">Manage customer relationships and track business</p>
              </div>
              <Button
                onClick={handleCreateNew}
                className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Customer
              </Button>
            </div>
          </div>

          {/* Stats */}
          <CustomerStats customers={customers} totalCustomers={totalCustomers} isLoading={isLoading} />

          {/* Filters */}
          <CustomerFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleReset}
            onCreateNew={handleCreateNew}
            isLoading={isLoading}
          />

          {/* Customer List */}
          <CustomerList
            customers={customers}
            isLoading={isLoading}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {/* Modals are now handled by ModalManager */}
        </div>
      </div>
    </AppLayout>
  )
}

