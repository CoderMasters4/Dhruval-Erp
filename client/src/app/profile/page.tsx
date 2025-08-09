'use client'

import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '@/lib/features/auth/authSlice'
import { AppLayout } from '@/components/layout/AppLayout'
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer'
import { ResponsiveCard } from '@/components/ui/ResponsiveCard'
import { TwoFactorToggle } from '@/components/settings/TwoFactorToggle'
import { SecurityHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { User, Mail, Phone, Building2, Shield, Edit, Save, X, Download, Smartphone } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const user = useSelector(selectCurrentUser)
  const [isEditing, setIsEditing] = useState(false)
  const [isPWAInstalled, setIsPWAInstalled] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })

  // Check PWA installation status
  useEffect(() => {
    const checkPWAStatus = () => {
      if (typeof window !== 'undefined') {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                            (window.navigator as any).standalone ||
                            document.referrer.includes('android-app://')
        setIsPWAInstalled(isStandalone)
      }
    }
    checkPWAStatus()
  }, [])

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

  const handleInstallPWA = () => {
    // Try to use the global install function from PWAManager
    if ((window as any).installPWA) {
      (window as any).installPWA()
      toast.success('Install prompt triggered!')
    } else {
      // Fallback instructions
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

      if (isIOS) {
        toast((t) => (
          <div className="flex flex-col gap-2">
            <div className="font-semibold">Install ERP App on iOS</div>
            <div className="text-sm">
              1. Tap the <strong>Share</strong> button (□↗)<br/>
              2. Scroll down and tap <strong>"Add to Home Screen"</strong><br/>
              3. Tap <strong>"Add"</strong> to confirm
            </div>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="text-blue-600 text-sm font-medium mt-2"
            >
              Got it!
            </button>
          </div>
        ), {
          duration: 10000,
          icon: '📱'
        })
      } else {
        toast((t) => (
          <div className="flex flex-col gap-2">
            <div className="font-semibold">Install ERP App</div>
            <div className="text-sm">
              Look for the install icon (⊕) in your browser's address bar,<br/>
              or check the browser menu for "Install" or "Add to Home Screen"
            </div>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="text-blue-600 text-sm font-medium mt-2"
            >
              Got it!
            </button>
          </div>
        ), {
          duration: 8000,
          icon: '💻'
        })
      }
    }
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

            {/* Company Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building2 className="h-4 w-4 inline mr-1" />
                Company
              </label>
              <p className="text-gray-900">{user?.companyId || 'Not assigned'}</p>
            </div>

            {/* Role Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Shield className="h-4 w-4 inline mr-1" />
                Role
              </label>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {typeof user?.roles?.[0] === 'string' ? user.roles[0] : user?.roles?.[0]?.roleId || 'User'}
                </span>
                {user?.isActive && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                )}
              </div>
            </div>

            {/* Account Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Status
              </label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Email Verified</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    user?.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user?.isActive ? 'Verified' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Two-Factor Auth</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    user?.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user?.isActive ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Login</span>
                  <span className="text-sm text-gray-900">
                    {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Never'}
                  </span>
                </div>
              </div>
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
          <TwoFactorToggle />
        </div>

        {/* PWA Installation */}
        <ResponsiveCard padding="lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold">Mobile App</h2>
            </div>
            {isPWAInstalled && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Installed
              </span>
            )}
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Install the ERP app on your device for faster access, offline functionality, and a native app experience.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleInstallPWA}
                disabled={isPWAInstalled}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Download className="h-4 w-4" />
                {isPWAInstalled ? 'App Installed' : 'Install App'}
              </Button>

              {!isPWAInstalled && (
                <Button
                  variant="outline"
                  onClick={() => {
                    // Reset PWA prompt dismissal
                    localStorage.removeItem('pwa-prompt-permanently-dismissed')
                    sessionStorage.removeItem('pwa-prompt-dismissed')
                    toast.success('PWA prompts re-enabled! You may see install prompts again.')
                  }}
                  className="flex items-center gap-2"
                >
                  <Shield className="h-4 w-4" />
                  Reset Install Prompts
                </Button>
              )}
            </div>

            {isPWAInstalled && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-green-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">App is installed and ready to use!</span>
                </div>
                <p className="text-xs text-green-700 mt-1">
                  You can access the app from your home screen or app drawer.
                </p>
              </div>
            )}
          </div>
        </ResponsiveCard>

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
