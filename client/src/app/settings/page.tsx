'use client'

import { useState } from 'react'
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Database,
  Save,
  Moon,
  Sun
} from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { SecurityHeader } from '@/components/ui/PageHeader'
import { useSelector, useDispatch } from 'react-redux'
import { selectTheme, setTheme } from '@/lib/features/ui/uiSlice'
import { selectCurrentUser } from '@/lib/features/auth/authSlice'
import { Can } from '@/lib/casl/Can'
import { TwoFactorToggle } from '@/components/settings/TwoFactorToggle'

export default function SettingsPage() {
  const dispatch = useDispatch()
  const theme = useSelector(selectTheme)
  const user = useSelector(selectCurrentUser)
  
  const [activeTab, setActiveTab] = useState('profile')
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    marketing: true
  })

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'system', name: 'System', icon: Database, permission: 'read:Settings' },
  ]

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    dispatch(setTheme(newTheme))
  }

  const handleNotificationChange = (type: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [type]: value
    }))
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* New Header */}
        <SecurityHeader
          title="Settings"
          description="Manage your account settings and preferences"
          icon={<Settings className="h-6 w-6 text-white" />}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  
                  if (tab.permission) {
                    return (
                      <Can key={tab.id} I="read" a="Settings">
                        <button
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            activeTab === tab.id
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <Icon className="h-4 w-4 mr-3" />
                          {tab.name}
                        </button>
                      </Can>
                    )
                  }
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {tab.name}
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
                    
                    <div className="flex items-center space-x-6 mb-6">
                      <div className="h-20 w-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">
                          {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </span>
                      </div>
                      <div>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          Change Avatar
                        </button>
                        <p className="text-sm text-gray-500 mt-1">JPG, GIF or PNG. 1MB max.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          defaultValue={user?.firstName}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          defaultValue={user?.lastName}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          defaultValue={user?.email}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          defaultValue={user?.phone}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">Email Notifications</h4>
                          <p className="text-sm text-gray-500">Receive notifications via email</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications.email}
                            onChange={(e) => handleNotificationChange('email', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">Push Notifications</h4>
                          <p className="text-sm text-gray-500">Receive push notifications in browser</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications.push}
                            onChange={(e) => handleNotificationChange('push', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">SMS Notifications</h4>
                          <p className="text-sm text-gray-500">Receive important updates via SMS</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications.sms}
                            onChange={(e) => handleNotificationChange('sms', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Appearance Settings</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Theme</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            onClick={() => handleThemeChange('light')}
                            className={`p-4 border-2 rounded-lg flex items-center space-x-3 transition-colors ${
                              theme === 'light' 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Sun className="h-5 w-5" />
                            <span>Light Mode</span>
                          </button>
                          
                          <button
                            onClick={() => handleThemeChange('dark')}
                            className={`p-4 border-2 rounded-lg flex items-center space-x-3 transition-colors ${
                              theme === 'dark' 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Moon className="h-5 w-5" />
                            <span>Dark Mode</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Change Password</h4>
                        <p className="text-sm text-gray-500 mb-4">Update your password to keep your account secure</p>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          Change Password
                        </button>
                      </div>

                      <TwoFactorToggle />
                    </div>
                  </div>
                </div>
              )}

              {/* System Tab */}
              {activeTab === 'system' && (
                <Can I="read" a="Settings">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">System Settings</h3>
                      
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2">Database Backup</h4>
                          <p className="text-sm text-gray-500 mb-4">Create a backup of your system data</p>
                          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                            Create Backup
                          </button>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2">System Logs</h4>
                          <p className="text-sm text-gray-500 mb-4">View system activity and error logs</p>
                          <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                            View Logs
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Can>
              )}

              {/* Save Button */}
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
