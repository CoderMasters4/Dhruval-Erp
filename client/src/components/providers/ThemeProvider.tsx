'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectTheme, setTheme } from '@/lib/features/ui/uiSlice'

interface ThemeContextType {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch()
  const theme = useSelector(selectTheme)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Remove duplicate theme initialization - let uiSlice handle it
  }, [])

  useEffect(() => {
    if (mounted) {
      console.log('Theme changed to:', theme)
      console.log('Document element classes before:', document.documentElement.className)
      
      // Apply theme to document using Tailwind's class-based approach
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
        console.log('Added dark class')
      } else {
        document.documentElement.classList.remove('dark')
        console.log('Removed dark class')
      }
      
      console.log('Document element classes after:', document.documentElement.className)
      console.log('Has dark class:', document.documentElement.classList.contains('dark'))
      
      // Update meta theme-color for mobile browsers
      const metaThemeColor = document.querySelector('meta[name="theme-color"]')
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', theme === 'dark' ? '#0f172a' : '#ffffff')
      }
    }
  }, [theme, mounted])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    console.log('Toggling theme from', theme, 'to', newTheme)
    dispatch(setTheme(newTheme))
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
