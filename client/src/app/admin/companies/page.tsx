'use client'

import React, { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

// Lazy load the main companies page for better performance
const CompaniesPage = React.lazy(() => import('@/app/companies/page'))

export default function AdminCompaniesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading Companies Management...</p>
        </div>
      </div>
    }>
      <CompaniesPage />
    </Suspense>
  )
}
