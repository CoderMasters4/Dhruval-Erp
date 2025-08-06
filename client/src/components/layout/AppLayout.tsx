'use client'

import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { selectSidebarCollapsed, selectSidebarOpen, setSidebarOpen } from '@/lib/features/ui/uiSlice'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { NotificationSystem } from '../notifications/NotificationSystem'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import clsx from 'clsx'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const dispatch = useDispatch()
  const isCollapsed = useSelector(selectSidebarCollapsed)
  const isOpen = useSelector(selectSidebarOpen)

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // On desktop, ensure sidebar is open
        dispatch(setSidebarOpen(true))
      } else {
        // On mobile, close sidebar by default
        dispatch(setSidebarOpen(false))
      }
    }

    // Set initial state
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [dispatch])

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 relative">
        {/* Mobile overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => dispatch(setSidebarOpen(false))}
          />
        )}

        <Sidebar />

        <div className={clsx(
          'transition-all duration-300 ease-in-out min-h-screen',
          // Desktop margins
          'lg:ml-0',
          isCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        )}>
          <Header />

          <main className="p-3 sm:p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}

// Layout wrapper for pages that need the full app layout
export function withAppLayout<P extends object>(
  Component: React.ComponentType<P>
) {
  return function LayoutWrappedComponent(props: P) {
    return (
      <AppLayout>
        <Component {...props} />
      </AppLayout>
    )
  }
}
