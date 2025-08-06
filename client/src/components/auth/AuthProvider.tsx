'use client'

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter, usePathname } from 'next/navigation'
import { initializeAuth, selectIsAuthenticated, selectCurrentUser } from '@/lib/features/auth/authSlice'
import { defineAbilityFor } from '@/lib/casl/ability'
import { AbilityContext } from '@/lib/casl/Can'
import { selectPermissions } from '@/lib/features/auth/authSlice'

interface AuthProviderProps {
  children: React.ReactNode
}

const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password']

export function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useDispatch()
  const router = useRouter()
  const pathname = usePathname()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectCurrentUser)
  const permissions = useSelector(selectPermissions)

  // Initialize auth from localStorage on app start
  useEffect(() => {
    dispatch(initializeAuth())
  }, [dispatch])

  // Handle authentication redirects with a delay to allow initialization
  useEffect(() => {
    const timer = setTimeout(() => {
      const isPublicRoute = pathname ? publicRoutes.includes(pathname) : false

      if (!isAuthenticated && !isPublicRoute) {
        // Redirect to login if not authenticated and trying to access protected route
        router.push('/login')
      } else if (isAuthenticated && pathname === '/') {
        // Only redirect from root page to dashboard
        router.push('/dashboard')
      }
      // Don't redirect on other routes - let them stay where they are
    }, 100) // Small delay to allow auth initialization

    return () => clearTimeout(timer)
  }, [isAuthenticated, pathname, router])

  // Create CASL ability based on user permissions
  const ability = defineAbilityFor(user, permissions)

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  )
}

// Hook to check if user is authenticated
export function useAuth() {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectCurrentUser)
  const permissions = useSelector(selectPermissions)
  
  return {
    isAuthenticated,
    user,
    permissions,
    isLoading: false, // You can add loading state if needed
  }
}

// Hook to check permissions
export function usePermissions() {
  const permissions = useSelector(selectPermissions)
  
  const hasPermission = (module: string, action: string) => {
    const modulePermissions = permissions[module]
    return modulePermissions ? modulePermissions.includes(action) : false
  }
  
  const canAccess = (module: string) => {
    return !!permissions[module]
  }
  
  return {
    permissions,
    hasPermission,
    canAccess,
  }
}

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermission?: string
  fallback?: React.ReactNode
}

export function ProtectedRoute({ 
  children, 
  requiredPermission, 
  fallback = <div>Access Denied</div> 
}: ProtectedRouteProps) {
  const { hasPermission } = usePermissions()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  
  if (!isAuthenticated) {
    return null // AuthProvider will handle redirect
  }
  
  if (requiredPermission) {
    const [module, action] = requiredPermission.split(':')
    if (!hasPermission(module, action)) {
      return <>{fallback}</>
    }
  }
  
  return <>{children}</>
}
