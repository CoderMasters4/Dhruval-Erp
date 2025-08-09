'use client'

import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '@/lib/features/auth/authSlice'
import { AppLayout } from '@/components/layout/AppLayout'
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer'
import { UserTwoFactorManagement } from '@/components/admin/UserTwoFactorManagement'
import { UserCrudModal } from '@/components/admin/UserCrudModal'
import { UserManagementHeader } from '@/components/ui/PageHeader'
import { Users, Shield, Settings, RefreshCw, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ResponsiveCard } from '@/components/ui/ResponsiveCard'
import { useGetUsers2FAStatusQuery } from '@/lib/api/adminApi'
import toast from 'react-hot-toast'

interface User {
  _id: string
  username: string
  email: string
  firstName: string
  lastName: string
  isActive: boolean
  isSuperAdmin: boolean
  twoFactorEnabled?: boolean
  lastLoginAt?: string
  createdAt?: string
}

interface UserStats {
  totalUsers: number
  twoFactorEnabled: number
  twoFactorDisabled: number
  adoptionRate: number
}

export default function AdminUsersPage() {
  const currentUser = useSelector(selectCurrentUser)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Use RTK Query instead of manual fetch
  const {
    data: usersResponse,
    isLoading: loading,
    isFetching: refreshing,
    error,
    refetch
  } = useGetUsers2FAStatusQuery()

  const users = usersResponse?.data?.users || []
  const stats = usersResponse?.data?.stats || {
    totalUsers: 0,
    twoFactorEnabled: 0,
    twoFactorDisabled: 0,
    adoptionRate: 0
  }

  // Handle error
  useEffect(() => {
    if (error) {
      console.error('Fetch users error:', error)
      toast.error('Failed to fetch users')
    }
  }, [error])

  // Check if user is super admin
  if (!currentUser?.isSuperAdmin) {
    return (
      <AppLayout>
        <ResponsiveContainer>
          <ResponsiveCard padding="lg" className="text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600">You need super admin privileges to access this page.</p>
          </ResponsiveCard>
        </ResponsiveContainer>
      </AppLayout>
    )
  }

  const handleRefresh = () => {
    refetch()
  }

  const handleCreateUser = () => {
    setSelectedUser(null)
    setModalMode('create')
    setModalOpen(true)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setModalMode('edit')
    setModalOpen(true)
  }

  const handleModalSuccess = () => {
    refetch()
  }

  // Check if user is super admin
  if (!currentUser?.isSuperAdmin) {
    return (
      <AppLayout>
        <ResponsiveContainer>
          <ResponsiveCard padding="lg" className="text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600">You need super admin privileges to access this page.</p>
          </ResponsiveCard>
        </ResponsiveContainer>
      </AppLayout>
    )
  }

  if (loading) {
    return (
      <AppLayout>
        <ResponsiveContainer>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
            <span className="ml-3 text-gray-600">Loading users...</span>
          </div>
        </ResponsiveContainer>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <ResponsiveContainer className="space-y-6">
        {/* New Header */}
        <UserManagementHeader
          title="User Management"
          description="Manage users and their two-factor authentication settings"
          icon={<Users className="h-6 w-6 text-white" />}
          showRefresh={true}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        >
          <Button onClick={handleCreateUser} className="bg-white text-emerald-600 hover:bg-emerald-50">
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </UserManagementHeader>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ResponsiveCard padding="md" className="bg-gradient-to-r from-sky-500 to-sky-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sky-100 text-sm">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-sky-200" />
            </div>
          </ResponsiveCard>

          <ResponsiveCard padding="md" className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">2FA Enabled</p>
                <p className="text-2xl font-bold">{stats.twoFactorEnabled}</p>
              </div>
              <Shield className="h-8 w-8 text-emerald-200" />
            </div>
          </ResponsiveCard>

          <ResponsiveCard padding="md" className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm">2FA Disabled</p>
                <p className="text-2xl font-bold">{stats.twoFactorDisabled}</p>
              </div>
              <Settings className="h-8 w-8 text-amber-200" />
            </div>
          </ResponsiveCard>

          <ResponsiveCard padding="md" className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Adoption Rate</p>
                <p className="text-2xl font-bold">{stats.adoptionRate}%</p>
              </div>
              <div className="text-purple-200 text-sm font-medium">
                {stats.adoptionRate >= 80 ? '🎉 Excellent' : 
                 stats.adoptionRate >= 60 ? '👍 Good' : 
                 stats.adoptionRate >= 40 ? '⚠️ Fair' : '🔴 Low'}
              </div>
            </div>
          </ResponsiveCard>
        </div>

        {/* 2FA Management */}
        <UserTwoFactorManagement
          users={users}
          onRefresh={handleRefresh}
          onEditUser={handleEditUser}
        />

        {/* Security Recommendations */}
        <ResponsiveCard padding="lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-sky-600" />
            Security Recommendations
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Best Practices</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-emerald-500 mr-2">✓</span>
                  Encourage all users to enable 2FA for enhanced security
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-500 mr-2">✓</span>
                  Regularly review and audit 2FA usage across the organization
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-500 mr-2">✓</span>
                  Provide training on proper 2FA setup and backup code storage
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-500 mr-2">✓</span>
                  Monitor failed 2FA attempts and account lockouts
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Admin Actions</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-sky-500 mr-2">•</span>
                  Force disable 2FA for users who lost access to their devices
                </li>
                <li className="flex items-start">
                  <span className="text-sky-500 mr-2">•</span>
                  Reset 2FA settings when users change their authenticator apps
                </li>
                <li className="flex items-start">
                  <span className="text-sky-500 mr-2">•</span>
                  Enable 2FA for users in high-security roles
                </li>
                <li className="flex items-start">
                  <span className="text-sky-500 mr-2">•</span>
                  Review audit logs for suspicious 2FA activities
                </li>
              </ul>
            </div>
          </div>
        </ResponsiveCard>

        {/* User CRUD Modal */}
        <UserCrudModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={handleModalSuccess}
          user={selectedUser}
          mode={modalMode}
        />
      </ResponsiveContainer>
    </AppLayout>
  )
}
