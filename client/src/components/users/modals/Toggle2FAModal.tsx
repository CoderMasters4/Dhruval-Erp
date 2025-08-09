import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import {
  Shield,
  Eye,
  EyeOff,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Smartphone
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal, ModalContent, ModalFooter } from '@/components/ui/Modal'
import {
  User as UserType,
  useToggle2FAMutation
} from '@/lib/features/users/usersApi'

interface Toggle2FAModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  user: UserType
}

export default function Toggle2FAModal({ isOpen, onClose, onSuccess, user }: Toggle2FAModalProps) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const [toggle2FA, { isLoading }] = useToggle2FAMutation()

  const isEnabling = !user.is2FAEnabled

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!password.trim()) {
      setError('Password is required to modify 2FA settings')
      return
    }

    try {
      await toggle2FA({
        id: user._id,
        data: {
          enable: isEnabling,
          password: password
        }
      }).unwrap()
      
      onSuccess()
    } catch (error: any) {
      setError(error?.data?.message || `Failed to ${isEnabling ? 'enable' : 'disable'} 2FA`)
    }
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    if (error) setError('')
  }

  const userName = user.personalInfo?.displayName ||
    (user.personalInfo?.firstName && user.personalInfo?.lastName
      ? `${user.personalInfo.firstName} ${user.personalInfo.lastName}`
      : user.name || user.username || 'User')

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${isEnabling ? 'Enable' : 'Disable'} Two-Factor Authentication`}
      subtitle={`${isEnabling ? 'Secure' : 'Remove security from'} ${userName}'s account`}
      size="md"
      headerClassName={`bg-gradient-to-r ${
        isEnabling
          ? 'from-purple-500 to-indigo-600'
          : 'from-orange-500 to-red-600'
      }`}
    >
      <ModalContent>
          {/* User Info */}
          <div className="bg-sky-50 rounded-xl p-4 border border-sky-200 mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-sky-400 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <p className="font-semibold text-black">{user.name || 'Unnamed User'}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                    user.is2FAEnabled 
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-gray-100 text-gray-800 border border-gray-200'
                  }`}>
                    <Shield className="w-3 h-3 mr-1" />
                    2FA {user.is2FAEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Information Section */}
          <div className={`rounded-xl p-4 border mb-6 ${
            isEnabling 
              ? 'bg-purple-50 border-purple-200' 
              : 'bg-orange-50 border-orange-200'
          }`}>
            <div className="flex items-start gap-3">
              {isEnabling ? (
                <Smartphone className="w-5 h-5 text-purple-600 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
              )}
              <div>
                <p className={`text-sm font-semibold mb-2 ${
                  isEnabling ? 'text-purple-800' : 'text-orange-800'
                }`}>
                  {isEnabling ? 'About Two-Factor Authentication' : 'Disabling Two-Factor Authentication'}
                </p>
                
                {isEnabling ? (
                  <div className="text-xs text-purple-700 space-y-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-purple-600" />
                      <span>Adds an extra layer of security to the account</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-purple-600" />
                      <span>Requires a mobile app like Google Authenticator</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-purple-600" />
                      <span>User will need to set up their authenticator app</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-orange-700 space-y-1">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3 text-orange-600" />
                      <span>This will reduce account security</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3 text-orange-600" />
                      <span>User will only need password to log in</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3 text-orange-600" />
                      <span>Consider the security implications carefully</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Password Confirmation */}
          <form id="toggle-2fa-form" onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Admin Password Confirmation *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 ${
                    error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                  }`}
                  placeholder="Enter your admin password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {error && (
                <p className="mt-1 text-sm text-red-600 font-medium">{error}</p>
              )}
              <p className="mt-1 text-xs text-gray-600">
                Your admin password is required to modify 2FA settings for security purposes.
              </p>
            </div>
        </form>
      </ModalContent>
      <ModalFooter>
        <Button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-colors"
        >
          Cancel
        </Button>

        <Button
          type="submit"
          form="toggle-2fa-form"
          disabled={isLoading}
          className={`px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-white ${
            isEnabling
              ? 'bg-purple-500 hover:bg-purple-600'
              : 'bg-orange-500 hover:bg-orange-600'
          }`}
        >
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isEnabling ? 'Enable 2FA' : 'Disable 2FA'}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
