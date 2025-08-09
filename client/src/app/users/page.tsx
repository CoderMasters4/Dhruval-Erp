'use client'

import React, { useState, Suspense } from 'react'
import { toast } from 'react-hot-toast'
import {
  Shield,
  AlertCircle,
  Plus
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { selectIsSuperAdmin } from '@/lib/features/auth/authSlice'
import { useGetAllUsersQuery } from '@/lib/features/users/usersApi'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'

// Lazy loaded components
const UserStats = React.lazy(() => import('@/components/users/UserStats'))
const UserFilters = React.lazy(() => import('@/components/users/UserFilters'))
const UserList = React.lazy(() => import('@/components/users/UserList'))

// Import modal hook
import { useModals } from '@/hooks/useModals'

interface UserFilters {
  search: string
  role: string
  status: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

interface PaginationState {
  page: number
  limit: number
}

export default function UsersPage() {
  const isSuperAdmin = useSelector(selectIsSuperAdmin)
  const {
    openUserForm,
    openUserDetails,
    openDeleteUser,
    openPasswordModal,
    openToggle2FA
  } = useModals()

  // State management
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: 'all',
    status: 'all',
    sortBy: 'name',
    sortOrder: 'asc'
  })

  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10
  })

  // API query
  const {
    data: usersResponse,
    isLoading,
    error,
    refetch
  } = useGetAllUsersQuery({
    page: pagination.page,
    limit: pagination.limit,
    search: filters.search || undefined,
    role: filters.role !== 'all' ? filters.role : undefined,
    status: filters.status !== 'all' ? filters.status : undefined,
  })

  const users = usersResponse?.data || []
  const paginationInfo = usersResponse?.pagination || { page: 1, limit: 10, total: 0, pages: 1 }

  // Event handlers
  const handleView = (user: any) => {
    openUserDetails({
      user,
      onEdit: () => {
        openUserForm({
          user,
          onSuccess: () => {
            refetch()
            toast.success('User updated successfully!')
          }
        })
      },
      onChangePassword: () => {
        openPasswordModal({
          user,
          onSuccess: () => {
            refetch()
            toast.success('Password updated successfully!')
          }
        })
      },
      onToggle2FA: () => {
        openToggle2FA({
          user,
          onSuccess: () => {
            refetch()
            toast.success(`2FA ${user.is2FAEnabled ? 'disabled' : 'enabled'} successfully!`)
          }
        })
      }
    })
  }

  const handleEdit = (user: any) => {
    openUserForm({
      user,
      onSuccess: () => {
        refetch()
        toast.success('User updated successfully!')
      }
    })
  }

  const handleDelete = (user: any) => {
    openDeleteUser({
      user,
      onSuccess: () => {
        refetch()
        toast.success('User deleted successfully!')
      }
    })
  }

  const handleChangePassword = (user: any) => {
    openPasswordModal({
      user,
      onSuccess: () => {
        refetch()
        toast.success('Password updated successfully!')
      }
    })
  }

  const handleToggle2FA = (user: any) => {
    openToggle2FA({
      user,
      onSuccess: () => {
        refetch()
        toast.success(`2FA ${user.is2FAEnabled ? 'disabled' : 'enabled'} successfully!`)
      }
    })
  }

  const handleCreateNew = () => {
    openUserForm({
      onSuccess: () => {
        refetch()
        toast.success('User created successfully!')
      }
    })
  }

  const handleFilterChange = (newFilters: Partial<UserFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleReset = () => {
    setFilters({
      search: '',
      role: 'all',
      status: 'all',
      sortBy: 'name',
      sortOrder: 'asc'
    })
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }

  const handleItemsPerPageChange = (limit: number) => {
    setPagination({ page: 1, limit })
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

  // Error state
  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Users</h3>
            <p className="text-gray-600 mb-4">There was an error loading the users data.</p>
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
                <h1 className="text-3xl font-bold text-black">User Management</h1>
                <p className="text-gray-600 mt-1">Manage users, roles, and permissions</p>
              </div>
              <Button
                onClick={handleCreateNew}
                className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add User
              </Button>
            </div>
          </div>

          {/* Stats */}
          <Suspense fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg border border-sky-200 p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          }>
            <UserStats users={users} totalUsers={paginationInfo.total} isLoading={isLoading} />
          </Suspense>

          {/* Filters */}
          <Suspense fallback={
            <div className="bg-white rounded-2xl shadow-lg border border-sky-200 p-6 mb-8 animate-pulse">
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          }>
            <UserFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleReset}
              onCreateNew={handleCreateNew}
              isLoading={isLoading}
            />
          </Suspense>

          {/* User List */}
          <Suspense fallback={
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg border border-sky-200 p-6 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          }>
            <UserList
              users={users}
              isLoading={isLoading}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onChangePassword={handleChangePassword}
              onToggle2FA={handleToggle2FA}
            />
          </Suspense>

          {/* Pagination */}
          {paginationInfo.pages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={paginationInfo.page}
                totalPages={paginationInfo.pages}
                totalItems={paginationInfo.total}
                itemsPerPage={paginationInfo.limit}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                className="bg-white rounded-2xl shadow-lg border border-sky-200 p-6"
              />
            </div>
          )}

          {/* Modals are now handled by ModalManager */}
        </div>
      </div>
    </AppLayout>
  )
}
