'use client'

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter, usePathname } from 'next/navigation'
import { initializeAuth, selectIsAuthenticated, selectCurrentUser, selectAuthLoading, selectAuthInitialized } from '@/lib/features/auth/authSlice'
import { defineAbilityFor } from '@/lib/casl/ability'
import { AbilityContext } from '@/lib/casl/Can'
import { selectPermissions } from '@/lib/features/auth/authSlice'
import { AppLoader } from '@/components/ui/LoadingSpinner'

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
  const isLoading = useSelector(selectAuthLoading)
  const isInitialized = useSelector(selectAuthInitialized)

  // Initialize auth from localStorage on app start
  useEffect(() => {
    dispatch(initializeAuth())
  }, [dispatch])

  // Handle authentication redirects with a small delay to allow initialization
  useEffect(() => {
    const timer = setTimeout(() => {
      const isPublicRoute = pathname ? publicRoutes.includes(pathname) : false

      if (!isAuthenticated && !isPublicRoute) {
        // Store the intended route before redirecting to login
        if (typeof window !== 'undefined' && pathname !== '/') {
          localStorage.setItem('intendedRoute', pathname)
        }
        router.push('/login')
      } else if (isAuthenticated) {
        // Check if there's an intended route to redirect to
        if (typeof window !== 'undefined') {
          const intendedRoute = localStorage.getItem('intendedRoute')
          if (intendedRoute && intendedRoute !== '/login' && intendedRoute !== pathname) {
            localStorage.removeItem('intendedRoute')
            router.push(intendedRoute)
            return
          }
        }

        // Only redirect from root page to dashboard if no intended route
        if (pathname === '/') {
          router.push('/dashboard')
        }
      }
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
  const isLoading = useSelector(selectAuthLoading)
  const isInitialized = useSelector(selectAuthInitialized)

  return {
    isAuthenticated,
    user,
    permissions,
    isLoading,
    isInitialized,
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
