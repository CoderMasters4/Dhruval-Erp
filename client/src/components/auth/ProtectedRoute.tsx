'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated, selectCurrentUser } from '@/lib/features/auth/authSlice'
import { usePermissions } from '@/lib/hooks/usePermissions'
import { Actions, Subjects } from '@/lib/casl/ability'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  requiredPermission?: {
    action: Actions
    subject: Subjects
  }
  requiredRole?: string
  requiredRoles?: string[]
  fallback?: React.ReactNode
  redirectTo?: string
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requiredPermission,
  requiredRole,
  requiredRoles,
  fallback,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const router = useRouter()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectCurrentUser)
  const permissions = usePermissions()

  useEffect(() => {
    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo)
      return
    }

    if (isAuthenticated && user) {
      // Check role requirements
      if (requiredRole && !permissions.hasRole(requiredRole)) {
        router.push('/unauthorized')
        return
      }

      if (requiredRoles && !permissions.hasAnyRole(requiredRoles)) {
        router.push('/unauthorized')
        return
      }

      // Check permission requirements
      if (requiredPermission && !permissions.can(requiredPermission.action, requiredPermission.subject)) {
        router.push('/unauthorized')
        return
      }
    }
  }, [
    isAuthenticated,
    user,
    requireAuth,
    requiredPermission,
    requiredRole,
    requiredRoles,
    router,
    redirectTo,
    permissions
  ])

  // Show loading while checking authentication
  if (requireAuth && !isAuthenticated) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Check permissions after authentication
  if (isAuthenticated && user) {
    if (requiredRole && !permissions.hasRole(requiredRole)) {
      return fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600">You don't have the required role to access this page.</p>
          </div>
        </div>
      )
    }

    if (requiredRoles && !permissions.hasAnyRole(requiredRoles)) {
      return fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600">You don't have the required role to access this page.</p>
          </div>
        </div>
      )
    }

    if (requiredPermission && !permissions.can(requiredPermission.action, requiredPermission.subject)) {
      return fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}

// Higher-order component version
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<ProtectedRouteProps, 'children'>
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}

// Hook for checking if user can access a route
export function useRouteAccess(options: Omit<ProtectedRouteProps, 'children'>) {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectCurrentUser)
  const permissions = usePermissions()

  if (options.requireAuth !== false && !isAuthenticated) {
    return { canAccess: false, reason: 'not_authenticated' }
  }

  if (isAuthenticated && user) {
    if (options.requiredRole && !permissions.hasRole(options.requiredRole)) {
      return { canAccess: false, reason: 'insufficient_role' }
    }

    if (options.requiredRoles && !permissions.hasAnyRole(options.requiredRoles)) {
      return { canAccess: false, reason: 'insufficient_role' }
    }

    if (options.requiredPermission && !permissions.can(options.requiredPermission.action, options.requiredPermission.subject)) {
      return { canAccess: false, reason: 'insufficient_permission' }
    }
  }

  return { canAccess: true, reason: null }
}
