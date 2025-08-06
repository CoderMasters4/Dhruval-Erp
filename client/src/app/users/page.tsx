'use client'

import React, { useState, Suspense } from 'react'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import {
  Users,
  Shield,
  AlertCircle,
  Plus,
  Loader2
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { selectIsSuperAdmin } from '@/lib/features/auth/authSlice'
import { useGetAllUsersQuery } from '@/lib/features/users/usersApi'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'

// Lazy loaded components
const UserStats = React.lazy(() => import('@/components/users/UserStats'))
const UserFilters = React.lazy(() => import('@/components/users/UserFilters'))
const UserList = React.lazy(() => import('@/components/users/UserList'))
const UserFormModal = React.lazy(() => import('@/components/users/modals/UserFormModal'))
const UserDetailsModal = React.lazy(() => import('@/components/users/modals/UserDetailsModal'))
const PasswordModal = React.lazy(() => import('@/components/users/modals/PasswordModal'))
const Toggle2FAModal = React.lazy(() => import('@/components/users/modals/Toggle2FAModal'))
const DeleteUserModal = React.lazy(() => import('@/components/users/modals/DeleteUserModal'))

interface UserFilters {
  search: string
  role: string
  status: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

export default function UsersPage() {
  const router = useRouter()
  const isSuperAdmin = useSelector(selectIsSuperAdmin)

  // State management
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: 'all',
    status: 'all',
    sortBy: 'name',
    sortOrder: 'asc'
  })

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [show2FAModal, setShow2FAModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)

  // API query
  const {
    data: usersResponse,
    isLoading,
    error,
    refetch
  } = useGetAllUsersQuery({
    search: filters.search || undefined,
    role: filters.role !== 'all' ? filters.role : undefined,
    status: filters.status !== 'all' ? filters.status : undefined,
  })

  const users = usersResponse?.data || []
  const totalUsers = usersResponse?.total || 0

  // Event handlers
  const handleView = (user: any) => {
    setSelectedUser(user)
    setShowDetailsModal(true)
  }

  const handleEdit = (user: any) => {
    setSelectedUser(user)
    setShowEditModal(true)
  }

  const handleDelete = (user: any) => {
    setSelectedUser(user)
    setShowDeleteModal(true)
  }

  const handleChangePassword = (user: any) => {
    setSelectedUser(user)
    setShowPasswordModal(true)
  }

  const handleToggle2FA = (user: any) => {
    setSelectedUser(user)
    setShow2FAModal(true)
  }

  const handleCreateNew = () => {
    setShowCreateModal(true)
  }

  const handleFilterChange = (newFilters: Partial<UserFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const handleReset = () => {
    setFilters({
      search: '',
      role: 'all',
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
            <UserStats users={users} totalUsers={totalUsers} isLoading={isLoading} />
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

          {/* Modals */}
          {showCreateModal && (
            <Suspense fallback={<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><Loader2 className="w-8 h-8 animate-spin text-white" /></div>}>
              <UserFormModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => {
                  setShowCreateModal(false)
                  refetch()
                  toast.success('User created successfully!')
                }}
              />
            </Suspense>
          )}

          {showEditModal && selectedUser && (
            <Suspense fallback={<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><Loader2 className="w-8 h-8 animate-spin text-white" /></div>}>
              <UserFormModal
                isOpen={showEditModal}
                onClose={() => {
                  setShowEditModal(false)
                  setSelectedUser(null)
                }}
                onSuccess={() => {
                  setShowEditModal(false)
                  setSelectedUser(null)
                  refetch()
                  toast.success('User updated successfully!')
                }}
                user={selectedUser}
              />
            </Suspense>
          )}

          {showDetailsModal && selectedUser && (
            <Suspense fallback={<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><Loader2 className="w-8 h-8 animate-spin text-white" /></div>}>
              <UserDetailsModal
                isOpen={showDetailsModal}
                onClose={() => {
                  setShowDetailsModal(false)
                  setSelectedUser(null)
                }}
                user={selectedUser}
                onEdit={() => {
                  setShowDetailsModal(false)
                  setShowEditModal(true)
                }}
                onChangePassword={() => {
                  setShowDetailsModal(false)
                  setShowPasswordModal(true)
                }}
                onToggle2FA={() => {
                  setShowDetailsModal(false)
                  setShow2FAModal(true)
                }}
              />
            </Suspense>
          )}

          {showPasswordModal && selectedUser && (
            <Suspense fallback={<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><Loader2 className="w-8 h-8 animate-spin text-white" /></div>}>
              <PasswordModal
                isOpen={showPasswordModal}
                onClose={() => {
                  setShowPasswordModal(false)
                  setSelectedUser(null)
                }}
                onSuccess={() => {
                  setShowPasswordModal(false)
                  setSelectedUser(null)
                  toast.success('Password updated successfully!')
                }}
                user={selectedUser}
              />
            </Suspense>
          )}

          {show2FAModal && selectedUser && (
            <Suspense fallback={<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><Loader2 className="w-8 h-8 animate-spin text-white" /></div>}>
              <Toggle2FAModal
                isOpen={show2FAModal}
                onClose={() => {
                  setShow2FAModal(false)
                  setSelectedUser(null)
                }}
                onSuccess={() => {
                  setShow2FAModal(false)
                  setSelectedUser(null)
                  refetch()
                  toast.success('2FA settings updated successfully!')
                }}
                user={selectedUser}
              />
            </Suspense>
          )}

          {showDeleteModal && selectedUser && (
            <Suspense fallback={<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><Loader2 className="w-8 h-8 animate-spin text-white" /></div>}>
              <DeleteUserModal
                isOpen={showDeleteModal}
                onClose={() => {
                  setShowDeleteModal(false)
                  setSelectedUser(null)
                }}
                onSuccess={() => {
                  setShowDeleteModal(false)
                  setSelectedUser(null)
                  refetch()
                  toast.success('User deleted successfully!')
                }}
                user={selectedUser}
              />
            </Suspense>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
