'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated } from '@/lib/features/auth/authSlice'
import { Loader2, Building2, Sparkles, ArrowRight } from 'lucide-react'
import Image from 'next/image'

export default function Home() {
  const router = useRouter()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const [isLoading, setIsLoading] = useState(true)
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
                   <Image src={'/logo.png'} alt="Factory ERP" width={120} height={120} />
                  </div>

                  {/* Overlay Elements for ERP feel */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>

                  {/* Connection Lines */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-8 h-0.5 bg-white opacity-30 rotate-45"></div>
                    <div className="w-8 h-0.5 bg-white opacity-30 -rotate-45 -mt-0.5"></div>
                  </div>
                </div>
              </div>

              {/* Enhanced Sparkle Animation */}
              <div className="absolute -top-3 -right-3 text-yellow-400 animate-pulse">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="absolute -bottom-3 -left-3 text-sky-400 animate-bounce">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="absolute top-2 -left-4 text-green-400 animate-ping">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
              <div className="absolute -top-2 right-2 text-blue-300 animate-pulse">
                <div className="w-3 h-3 bg-blue-300 rounded-full"></div>
              </div>
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

          {/* Loading Animation */}
          <div className="flex items-center justify-center space-x-3 animate-fade-in-up animation-delay-400">
            <div className="relative">
              <Loader2 className="h-6 w-6 animate-spin text-sky-600" />
              <div className="absolute inset-0 h-6 w-6 animate-ping text-sky-400 opacity-20">
                <Loader2 className="h-6 w-6" />
              </div>
            </div>
            <p className="text-gray-700 font-medium">
              {isAuthenticated ? 'Taking you to Dashboard...' : 'Redirecting to Login...'}
            </p>
            <ArrowRight className="h-5 w-5 text-sky-600 animate-pulse" />
          </div>

          {/* Progress Bar */}
          <div className="mt-8 w-64 mx-auto">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-sky-500 to-blue-600 h-2 rounded-full animate-progress"></div>
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
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-black mb-2 text-lg">Smart Analytics</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Get real-time insights with advanced analytics, production tracking, and comprehensive reporting tools</p>
            </div>

            <div className="text-center p-6 bg-white bg-opacity-70 rounded-2xl backdrop-blur-sm border border-white border-opacity-30 hover:bg-opacity-80 transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <ArrowRight className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-black mb-2 text-lg">Seamless Integration</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Easy integration with existing systems and workflows for smooth business operations and data flow</p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
        }

        .animation-delay-600 {
          animation-delay: 0.6s;
          opacity: 0;
        }

        .animate-progress {
          animation: progress 2s ease-in-out;
        }
      `}</style>
    </div>
  )
}
