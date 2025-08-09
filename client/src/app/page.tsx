'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated } from '@/lib/features/auth/authSlice'
import { Building2, Shield, BarChart3 } from 'lucide-react'
import { LoginLogo } from '@/components/ui/Logo'

export default function Home() {
  const router = useRouter()
  const isAuthenticated = useSelector(selectIsAuthenticated)

  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    // Show loading animation for a bit
    const timer = setTimeout(() => {
      setShowContent(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (showContent) {
      const redirectTimer = setTimeout(() => {
        if (isAuthenticated) {
          router.push('/dashboard')
        } else {
          router.push('/login')
        }
      }, 2000)

      return () => clearTimeout(redirectTimer)
    }
  }, [isAuthenticated, router, showContent])

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-100 flex items-center justify-center relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-sky-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 text-center">
        {/* Logo Container */}
        <div className={`transition-all duration-1000 ${showContent ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
          <div className="mx-auto mb-8 relative">
            {/* Modern ERP Logo */}
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 rounded-3xl shadow-2xl flex items-center justify-center transform rotate-2 hover:rotate-6 transition-all duration-500 hover:scale-105">
                {/* Custom ERP Logo Design */}
                <div className="relative">
                  {/* Main Building Icon */}
                  <div className="relative z-10">
                   <LoginLogo size="lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Loading Spinner */}
          <div className="mb-8 animate-fade-in-up animation-delay-400">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-sky-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-sky-500 rounded-full animate-spin"></div>
              <div className="absolute inset-2 border-4 border-transparent border-t-blue-500 rounded-full animate-spin animation-delay-150" style={{ animationDirection: 'reverse' }}></div>
            </div>

            <div className="flex items-center justify-center space-x-1 mb-4">
              <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce animation-delay-100"></div>
              <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce animation-delay-200"></div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-bold text-black mb-6 animate-fade-in-up">
            <span className="bg-gradient-to-r from-sky-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Enterprise ERP
            </span>
          </h1>

          <div className="mb-8 animate-fade-in-up animation-delay-200">
            <p className="text-xl md:text-2xl text-gray-700 font-medium mb-2">
              Complete Business Management Solution
            </p>
            <p className="text-base md:text-lg text-gray-500">
              Streamline operations • Boost productivity • Drive growth
            </p>
          </div>

          {/* Loading Message */}
          <div className="animate-fade-in-up animation-delay-400">
            <p className="text-lg font-medium text-gray-600 mb-2">
              {isAuthenticated ? 'Taking you to dashboard...' : 'Redirecting to login...'}
            </p>
            <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
              <div className="bg-gradient-to-r from-sky-500 to-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
            </div>
          </div>

          {/* Features Preview */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto animate-fade-in-up animation-delay-600">
            <div className="text-center p-6 bg-white bg-opacity-70 rounded-2xl backdrop-blur-sm border border-white border-opacity-30 hover:bg-opacity-80 transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-black mb-2 text-lg">Multi-Company Management</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Efficiently manage multiple companies from a single, unified dashboard with role-based access control</p>
            </div>

            <div className="text-center p-6 bg-white bg-opacity-70 rounded-2xl backdrop-blur-sm border border-white border-opacity-30 hover:bg-opacity-80 transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-black mb-2 text-lg">Advanced Security</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Enterprise-grade security with 2FA, audit trails, and comprehensive permission management</p>
            </div>

            <div className="text-center p-6 bg-white bg-opacity-70 rounded-2xl backdrop-blur-sm border border-white border-opacity-30 hover:bg-opacity-80 transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-black mb-2 text-lg">Real-time Analytics</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Comprehensive reporting and analytics to make data-driven decisions for your business</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}