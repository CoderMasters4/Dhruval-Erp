'use client'

import React, { Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { selectIsSuperAdmin } from '@/lib/features/auth/authSlice'
import { useGetCompanyByIdQuery } from '@/lib/features/companies/companiesApi'
import { AppLayout } from '@/components/layout/AppLayout'
import { Shield, Loader2 } from 'lucide-react'

const CompanyDetailsPage = React.lazy(() => import('@/components/companies/CompanyDetailsPage'))

export default function CompanyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const isSuperAdmin = useSelector(selectIsSuperAdmin)
  const companyId = params.id as string

  const {
    data: company,
    isLoading,
    error
  } = useGetCompanyByIdQuery(companyId, {
    skip: !companyId || !isSuperAdmin
  })

  if (!isSuperAdmin) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-gray-600">You need Super Admin privileges to access this page.</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-sky-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="relative">
                  <Loader2 className="h-12 w-12 animate-spin text-sky-600 mx-auto mb-4" />
                  <div className="absolute inset-0 h-12 w-12 animate-ping text-sky-400 opacity-20 mx-auto">
                    <Loader2 className="h-12 w-12" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-black mb-2">Loading Company Details</h3>
                <p className="text-gray-600">Please wait while we fetch the company information...</p>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (error || !company) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-sky-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="p-6 bg-red-100 rounded-full w-24 h-24 mx-auto mb-6">
                  <Shield className="w-12 h-12 text-red-600 mx-auto" />
                </div>
                <h3 className="text-2xl font-bold text-black mb-3">Company Not Found</h3>
                <p className="text-gray-600 text-lg mb-6">
                  The company you're looking for doesn't exist or has been removed.
                </p>
                <button
                  onClick={() => router.push('/companies')}
                  className="bg-sky-500 hover:bg-sky-600 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
                >
                  Back to Companies
                </button>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <Suspense 
        fallback={
          <div className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-sky-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-sky-600 mx-auto mb-4" />
                  <p className="text-gray-600">Loading details...</p>
                </div>
              </div>
            </div>
          </div>
        }
      >
        <CompanyDetailsPage
          company={company}
          onBack={() => router.push('/companies')}
          onEdit={(company) => {
            // You can implement edit functionality here
            console.log('Edit company:', company)
          }}
          onDelete={(company) => {
            // You can implement delete functionality here
            console.log('Delete company:', company)
          }}
        />
      </Suspense>
    </AppLayout>
  )
}
