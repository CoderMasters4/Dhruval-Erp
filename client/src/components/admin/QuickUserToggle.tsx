'use client'

import { useState } from 'react'
import { Shield, ShieldCheck, ShieldX, User, UserCheck, UserX } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface QuickUserToggleProps {
  userId: string
  userName: string
  isActive: boolean
  twoFactorEnabled: boolean
  onUpdate: () => void
  className?: string
}

export function QuickUserToggle({ 
  userId, 
  userName, 
  isActive, 
  twoFactorEnabled, 
  onUpdate,
  className 
}: QuickUserToggleProps) {
  const [loading, setLoading] = useState(false)

  const handleToggleStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}/toggle-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      if (result.success) {
        toast.success(`User ${isActive ? 'deactivated' : 'activated'} successfully`)
        onUpdate()
      } else {
        toast.error(result.message || 'Failed to update user status')
      }
    } catch (error) {
      toast.error('Failed to update user status')
    } finally {
      setLoading(false)
    }
  }

  const handleToggle2FA = async () => {
    setLoading(true)
    try {
      const endpoint = twoFactorEnabled 
        ? `/api/admin/users/${userId}/disable-2fa`
        : `/api/admin/users/${userId}/enable-2fa`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      if (result.success) {
        toast.success(`2FA ${twoFactorEnabled ? 'disabled' : 'enabled'} for ${userName}`)
        onUpdate()
      } else {
        toast.error(result.message || 'Failed to update 2FA status')
      }
    } catch (error) {
      toast.error('Failed to update 2FA status')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* User Status Toggle */}
      <Button
        onClick={handleToggleStatus}
        disabled={loading}
        variant="outline"
        size="sm"
        className={`${
          isActive 
            ? 'text-green-600 border-green-300 hover:bg-green-50' 
            : 'text-red-600 border-red-300 hover:bg-red-50'
        }`}
      >
        {loading ? (
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
        ) : isActive ? (
          <UserCheck className="h-3 w-3" />
        ) : (
          <UserX className="h-3 w-3" />
        )}
      </Button>

      {/* 2FA Toggle */}
      <Button
        onClick={handleToggle2FA}
        disabled={loading}
        variant="outline"
        size="sm"
        className={`${
          twoFactorEnabled 
            ? 'text-green-600 border-green-300 hover:bg-green-50' 
            : 'text-slate-600 border-slate-300 hover:bg-slate-50'
        }`}
      >
        {loading ? (
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
        ) : twoFactorEnabled ? (
          <ShieldCheck className="h-3 w-3" />
        ) : (
          <ShieldX className="h-3 w-3" />
        )}
      </Button>
    </div>
  )
}
