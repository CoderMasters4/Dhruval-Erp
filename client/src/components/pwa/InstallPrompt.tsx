'use client'

import { useState, useEffect } from 'react'
import { X, Download, Smartphone, Monitor, Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
      const isIOSStandalone = (window.navigator as any).standalone === true
      
      setIsStandalone(isStandaloneMode || isIOSStandalone)
      setIsInstalled(isStandaloneMode || isIOSStandalone)
    }

    // Check if iOS
    const checkIOS = () => {
      const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent)
      setIsIOS(isIOSDevice)
    }

    checkInstalled()
    checkIOS()

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Show prompt after a delay if not already installed
      if (!isInstalled) {
        setTimeout(() => {
          const dismissed = localStorage.getItem('pwa-install-dismissed')
          if (!dismissed) {
            setShowPrompt(true)
          }
        }, 5000) // Show after 5 seconds
      }
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
      localStorage.removeItem('pwa-install-dismissed')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [isInstalled])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt')
      } else {
        console.log('User dismissed the install prompt')
        localStorage.setItem('pwa-install-dismissed', 'true')
      }
      
      setDeferredPrompt(null)
      setShowPrompt(false)
    } catch (error) {
      console.error('Error during installation:', error)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  const handleIOSInstall = () => {
    setShowPrompt(false)
    // Show iOS installation instructions
    alert(`To install this app on your iOS device:
    
1. Tap the Share button in Safari
2. Scroll down and tap "Add to Home Screen"
3. Tap "Add" to confirm

The app will then appear on your home screen like a native app!`)
  }

  // Don't show if already installed or in standalone mode
  if (isInstalled || isStandalone || !showPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl p-6 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Download className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Install ERP App</h3>
              <p className="text-sm text-gray-600">Get the full app experience</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Benefits */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Zap className="h-4 w-4 text-green-600" />
            </div>
            <span className="text-gray-700">Faster loading and offline access</span>
          </div>
          
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              {isIOS ? (
                <Smartphone className="h-4 w-4 text-blue-600" />
              ) : (
                <Monitor className="h-4 w-4 text-blue-600" />
              )}
            </div>
            <span className="text-gray-700">
              {isIOS ? 'Add to home screen' : 'Desktop app experience'}
            </span>
          </div>
          
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
            </div>
            <span className="text-gray-700">Push notifications for updates</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          {isIOS ? (
            <Button
              onClick={handleIOSInstall}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Install
            </Button>
          ) : (
            <Button
              onClick={handleInstall}
              disabled={!deferredPrompt}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Install App
            </Button>
          )}
          
          <Button
            onClick={handleDismiss}
            variant="outline"
            className="flex-1"
          >
            Not Now
          </Button>
        </div>

        {/* Small print */}
        <p className="text-xs text-gray-500 mt-3 text-center">
          Free • No app store required • Uninstall anytime
        </p>
      </div>
    </div>
  )
}

// Hook to check PWA installation status
export function usePWAInstall() {
  const [isInstalled, setIsInstalled] = useState(false)
  const [canInstall, setCanInstall] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const checkInstallStatus = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
      const isIOSStandalone = (window.navigator as any).standalone === true
      setIsInstalled(isStandaloneMode || isIOSStandalone)
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setCanInstall(true)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setCanInstall(false)
      setDeferredPrompt(null)
    }

    checkInstallStatus()

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const install = async () => {
    if (!deferredPrompt) return false

    try {
      await deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      
      setDeferredPrompt(null)
      setCanInstall(false)
      
      return choiceResult.outcome === 'accepted'
    } catch (error) {
      console.error('Installation failed:', error)
      return false
    }
  }

  return {
    isInstalled,
    canInstall,
    install
  }
}
