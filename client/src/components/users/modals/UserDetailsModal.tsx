import React from 'react'
import {
  User,
  Mail,
  Phone,
  Shield,
  Building2,
  Calendar,
  Clock,
  Edit,
  Key,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal, ModalContent, ModalFooter } from '@/components/ui/Modal'
import { User as UserType } from '@/lib/features/users/usersApi'
import clsx from 'clsx'

interface UserDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  user: UserType
  onEdit: () => void
  onChangePassword: () => void
  onToggle2FA: () => void
}

export default function UserDetailsModal({
  isOpen,
  onClose,
  user,
  onEdit,
  onChangePassword,
  onToggle2FA
}: UserDetailsModalProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatLastLogin = (dateString?: string) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours} hours ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} days ago`

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'manager':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const userName = user.personalInfo?.displayName ||
    (user.personalInfo?.firstName && user.personalInfo?.lastName
      ? `${user.personalInfo.firstName} ${user.personalInfo.lastName}`
      : user.name || user.username || 'Unnamed User')

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="User Details"
      subtitle="View and manage user information"
      size="lg"
    >
      <ModalContent>
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-sky-50 rounded-xl p-6 border border-sky-200">
              <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-sky-600" />
                Contact Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-sky-100">
                  <Mail className="w-5 h-5 text-sky-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Email</p>
                    <p className="text-black font-semibold">{user.email}</p>
                  </div>
                </div>
                
                {user.phone && (
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-sky-100">
                    <Phone className="w-5 h-5 text-sky-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Phone</p>
                      <p className="text-black font-semibold">{user.phone}</p>
                    </div>
                  </div>
                )}
                
                {user.department && (
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-sky-100">
                    <Building2 className="w-5 h-5 text-sky-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Department</p>
                      <p className="text-black font-semibold">{user.department}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Account Information */}
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-green-600" />
                Account Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-100">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Created</p>
                    <p className="text-black font-semibold">{formatDate(user.createdAt)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-100">
                  <Clock className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Last Login</p>
                    <p className="text-black font-semibold">{formatLastLogin(user.lastLogin)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-100">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Email Verified</p>
                    <p className={clsx(
                      'font-semibold',
                      user.isEmailVerified ? 'text-green-600' : 'text-red-600'
                    )}>
                      {user.isEmailVerified ? 'Verified' : 'Not Verified'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-100">
                  <Shield className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Two-Factor Auth</p>
                    <p className={clsx(
                      'font-semibold',
                      user.is2FAEnabled ? 'text-green-600' : 'text-gray-600'
                    )}>
                      {user.is2FAEnabled ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Alerts */}
            {(!user.isEmailVerified || user.loginAttempts && user.loginAttempts > 0) && (
              <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
                  Security Alerts
                </h3>
                
                <div className="space-y-3">
                  {!user.isEmailVerified && (
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-yellow-100">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Email not verified</p>
                        <p className="text-xs text-yellow-600">User should verify their email address</p>
                      </div>
                    </div>
                  )}
                  
                  {user.loginAttempts && user.loginAttempts > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-yellow-100">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Failed login attempts: {user.loginAttempts}</p>
                        <p className="text-xs text-yellow-600">Monitor for suspicious activity</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

      </ModalContent>

      <ModalFooter>
        <Button
          onClick={onChangePassword}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center"
        >
          <Key className="w-4 h-4 mr-2" />
          Change Password
        </Button>

        <Button
          onClick={onToggle2FA}
          className={clsx(
            'px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center',
            user.is2FAEnabled
              ? 'bg-orange-500 hover:bg-orange-600 text-white'
              : 'bg-purple-500 hover:bg-purple-600 text-white'
          )}
        >
          <Shield className="w-4 h-4 mr-2" />
          {user.is2FAEnabled ? 'Disable 2FA' : 'Enable 2FA'}
        </Button>

        <Button
          onClick={onEdit}
          className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit User
        </Button>
      </ModalFooter>
    </Modal>
  )
}
