'use client'

import { useEffect } from 'react'
import { Provider } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import { store } from '@/lib/store'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { ModalProvider } from '@/components/providers/ModalProvider'

import { initializeUI } from '@/lib/features/ui/uiSlice'

function AppInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize UI state from localStorage
    store.dispatch(initializeUI())
  }, [])

  return <>{children}</>
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AppInitializer>
        <AuthProvider>
          <ModalProvider>
            {children}
          </ModalProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
                borderRadius: '8px',
                fontSize: '14px',
              },
              success: {
                style: {
                  background: '#10b981',
                },
                iconTheme: {
                  primary: '#fff',
                  secondary: '#10b981',
                },
              },
              error: {
                style: {
                  background: '#ef4444',
                },
                iconTheme: {
                  primary: '#fff',
                  secondary: '#ef4444',
                },
              },
              loading: {
                style: {
                  background: '#3b82f6',
                },
              },
            }}
          />
        </AuthProvider>
      </AppInitializer>
    </Provider>
  )
}
