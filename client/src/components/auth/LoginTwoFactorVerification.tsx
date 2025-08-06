'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { ResponsiveCard } from '@/components/ui/ResponsiveCard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Shield, Key, ArrowLeft, RefreshCw } from 'lucide-react'
import { setCredentials } from '@/lib/features/auth/authSlice'
import toast from 'react-hot-toast'

interface LoginTwoFactorVerificationProps {
  tempToken: string
  onCancel: () => void
  className?: string
}

export function LoginTwoFactorVerification({ 
  tempToken, 
  onCancel, 
  className 
}: LoginTwoFactorVerificationProps) {
  const [token, setToken] = useState('')
  const [backupCode, setBackupCode] = useState('')
  const [useBackupCode, setUseBackupCode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  
  const router = useRouter()
  const dispatch = useDispatch()

  const handleVerify = async () => {
    if (!token && !backupCode) {
      toast.error('Please enter a verification code')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/v1/auth/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: useBackupCode ? '' : token,
          backupCode: useBackupCode ? backupCode : undefined,
          tempToken: tempToken
        })
      })

      const result = await response.json()

      if (result.success) {
        // Handle successful 2FA verification
        const userData = result.data.user
        const tokens = result.data.tokens
        const companies = result.data.companies || []
        const currentCompany = result.data.currentCompany
        const permissions = result.data.permissions

        // Update user with current company info
        const userWithCompany = {
          ...userData,
          currentCompanyId: currentCompany?.id,
          isSuperAdmin: userData.isSuperAdmin || false
        }

        dispatch(setCredentials({
          user: userWithCompany,
          token: tokens?.accessToken || '',
          refreshToken: undefined,
          companies: companies.map((company: any) => ({
            _id: company._id,
            companyCode: company.companyCode,
            companyName: company.companyName,
            legalName: company.companyName,
            isActive: company.isActive || true
          })),
          permissions
        }))

        toast.success('Two-factor authentication successful!')
        router.push('/dashboard')
      } else {
        toast.error(result.message || 'Verification failed')
      }
    } catch (error: any) {
      console.error('2FA verification error:', error)
      toast.error('Verification failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset2FA = async () => {
    setIsResetting(true)
    try {
      const response = await fetch('/api/v1/auth/2fa/reset-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tempToken}`
        }
      })

      const result = await response.json()

      if (result.success) {
        toast.success('2FA reset request sent. Please check your email for instructions.')
        onCancel() // Go back to login form
      } else {
        toast.error(result.message || 'Failed to send reset request')
      }
    } catch (error: any) {
      console.error('2FA reset error:', error)
      toast.error('Failed to send reset request. Please try again.')
    } finally {
      setIsResetting(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify()
    }
  }

  return (
    <ResponsiveCard className={className} padding="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-sky-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Two-Factor Authentication
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            {useBackupCode 
              ? 'Enter one of your backup codes'
              : 'Enter the 6-digit code from your authenticator app'
            }
          </p>
        </div>

        {/* Input Field */}
        <div className="space-y-4">
          {useBackupCode ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Backup Code
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  value={backupCode}
                  onChange={(e) => setBackupCode(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter backup code"
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Shield className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyPress={handleKeyPress}
                  placeholder="123456"
                  className="pl-10 text-center text-lg tracking-widest"
                  maxLength={6}
                  disabled={isLoading}
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleVerify}
            disabled={(!token && !backupCode) || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Verifying...
              </>
            ) : (
              'Verify & Login'
            )}
          </Button>

          <div className="flex space-x-2">
            <Button
              onClick={() => setUseBackupCode(!useBackupCode)}
              variant="outline"
              size="sm"
              className="flex-1"
              disabled={isLoading}
            >
              {useBackupCode ? 'Use Authenticator' : 'Use Backup Code'}
            </Button>

            <Button
              onClick={handleReset2FA}
              variant="outline"
              size="sm"
              className="flex-1"
              disabled={isResetting}
            >
              {isResetting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Reset 2FA
                </>
              )}
            </Button>
          </div>

          <Button
            onClick={onCancel}
            variant="ghost"
            size="sm"
            className="w-full"
            disabled={isLoading}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Lost access to your authenticator? Use a backup code or reset your 2FA settings.
          </p>
        </div>
      </div>
    </ResponsiveCard>
  )
}
