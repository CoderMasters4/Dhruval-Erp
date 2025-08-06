'use client'

import { useState } from 'react'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '@/lib/features/auth/authSlice'
import { AppLayout } from '@/components/layout/AppLayout'
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer'
import { ResponsiveCard } from '@/components/ui/ResponsiveCard'
import { TwoFactorSetup } from '@/components/auth/TwoFactorSetup'
import { SecurityHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { User, Mail, Phone, Building2, Shield, Edit, Save, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const user = useSelector(selectCurrentUser)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })

  const handleSave = async () => {
    try {
      // TODO: Implement profile update API call
      toast.success('Profile updated successfully')
      setIsEditing(false)
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
    })
    setIsEditing(false)
  }

  return (
    <AppLayout>
      <ResponsiveContainer className="space-y-6">
        {/* Header */}
        {/* New Header */}
        <SecurityHeader
          title="Profile Settings"
          description="Manage your account settings and preferences"
          icon={<User className="h-6 w-6 text-white" />}
        />

        {/* Profile Information */}
        <ResponsiveCard padding="lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center">
              <User className="h-5 w-5 mr-2" />
              Personal Information
            </h2>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleSave} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button onClick={handleCancel} variant="outline" size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              {isEditing ? (
                <Input
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Enter first name"
                />
              ) : (
                <p className="text-gray-900">{user?.firstName || 'Not set'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              {isEditing ? (
                <Input
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Enter last name"
                />
              ) : (
                <p className="text-gray-900">{user?.lastName || 'Not set'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="h-4 w-4 inline mr-1" />
                Email
              </label>
              {isEditing ? (
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email"
                />
              ) : (
                <p className="text-gray-900">{user?.email || 'Not set'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="h-4 w-4 inline mr-1" />
                Phone
              </label>
              {isEditing ? (
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              ) : (
                <p className="text-gray-900">{user?.phone || 'Not set'}</p>
              )}
            </div>
          </div>

          {/* Company Information */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-md font-semibold flex items-center mb-4">
              <Building2 className="h-5 w-5 mr-2" />
              Company Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <p className="text-gray-900">{user?.username}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <p className="text-gray-900">
                  {user?.companyAccess?.[0]?.role?.replace('_', ' ').toUpperCase() || 'User'}
                </p>
              </div>
              {user?.isSuperAdmin && (
                <div className="md:col-span-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-sky-100 text-sky-800">
                    Super Administrator
                  </span>
                </div>
              )}
            </div>
          </div>
        </ResponsiveCard>

        {/* Two-Factor Authentication */}
        <div>
          <h2 className="text-lg font-semibold flex items-center mb-4">
            <Shield className="h-5 w-5 mr-2 text-sky-600" />
            Security Settings
          </h2>
          <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-sky-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-sky-900">Two-Factor Authentication</h3>
                <p className="text-sm text-sky-700 mt-1">
                  Add an extra layer of security to your account by enabling 2FA.
                  You'll need your phone or authenticator app to sign in.
                </p>
              </div>
            </div>
          </div>
          <TwoFactorSetup />
        </div>

        {/* Account Activity */}
        <ResponsiveCard padding="lg">
          <h2 className="text-lg font-semibold mb-4">Account Activity</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Last Login</span>
              <span className="text-sm text-gray-900">
                {user?.lastLoginAt 
                  ? new Date(user.lastLoginAt).toLocaleString()
                  : 'Never'
                }
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Account Created</span>
              <span className="text-sm text-gray-900">
                {user?.createdAt 
                  ? new Date(user.createdAt).toLocaleDateString()
                  : 'Unknown'
                }
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Account Status</span>
              <span className={`text-sm font-medium ${
                user?.isActive ? 'text-green-600' : 'text-red-600'
              }`}>
                {user?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </ResponsiveCard>
      </ResponsiveContainer>
    </AppLayout>
  )
}
