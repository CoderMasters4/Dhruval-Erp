'use client'

import { useSelector, useDispatch } from 'react-redux'
import { selectTheme, setTheme } from '@/lib/features/ui/uiSlice'

export function ThemeDebug() {
  const theme = useSelector(selectTheme)
  const dispatch = useDispatch()

  const testTheme = (newTheme: 'light' | 'dark') => {
    console.log('ThemeDebug: Testing theme switch to', newTheme)
    
    // Direct DOM manipulation
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    // Update Redux state
    dispatch(setTheme(newTheme))
    
    console.log('ThemeDebug: Theme switched to', newTheme)
    console.log('ThemeDebug: Document classes:', document.documentElement.className)
    console.log('ThemeDebug: Has dark class:', document.documentElement.classList.contains('dark'))
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 shadow-lg z-50 max-w-sm">
      <div className="text-sm space-y-2">
        <div className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-2">
          🎨 Theme Debug Panel
        </div>
        
        <div className="space-y-1">
          <div className="text-gray-600 dark:text-gray-300">
            <span className="font-medium">Redux State:</span> {theme}
          </div>
          <div className="text-gray-600 dark:text-gray-300">
            <span className="font-medium">HTML Class:</span> 
            <code className="ml-1 bg-gray-100 dark:bg-gray-700 px-1 rounded text-xs">
              {typeof document !== 'undefined' ? document.documentElement.className : 'N/A'}
            </code>
          </div>
          <div className="text-gray-600 dark:text-gray-300">
            <span className="font-medium">Has Dark Class:</span> 
            <span className={`ml-1 px-2 py-1 rounded text-xs ${typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') ? 'Yes' : 'No' : 'N/A'}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Manual Test:</div>
          <div className="flex gap-2">
            <button
              onClick={() => testTheme('light')}
              className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-colors"
            >
              Force Light
            </button>
            <button
              onClick={() => testTheme('dark')}
              className="px-2 py-1 bg-gray-800 hover:bg-gray-900 text-white text-xs rounded transition-colors"
            >
              Force Dark
            </button>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Current Styles:</div>
          <div className="text-xs space-y-1">
            <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
              <div className="text-gray-900 dark:text-white">This should change color</div>
              <div className="text-gray-600 dark:text-gray-300">Secondary text color</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
