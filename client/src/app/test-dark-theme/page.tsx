'use client'

import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { ThemeDebug } from '@/components/ui/ThemeDebug'
import { useSelector, useDispatch } from 'react-redux'
import { selectTheme, setTheme } from '@/lib/features/ui/uiSlice'

export default function TestDarkThemePage() {
  const theme = useSelector(selectTheme)
  const dispatch = useDispatch()

  const manualToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    console.log('Manual toggle: Current theme:', theme)
    console.log('Manual toggle: Switching to:', newTheme)
    console.log('Manual toggle: Document classes before:', document.documentElement.className)
    dispatch(setTheme(newTheme))
    setTimeout(() => {
      console.log('Manual toggle: Document classes after dispatch:', document.documentElement.className)
      console.log('Manual toggle: Has dark class:', document.documentElement.classList.contains('dark'))
      console.log('Manual toggle: Redux state theme:', newTheme)
    }, 100)
  }

  const forceLight = () => {
    console.log('Force light: Current theme:', theme)
    console.log('Force light: Document classes before:', document.documentElement.className)
    dispatch(setTheme('light'))
    setTimeout(() => {
      console.log('Force light: Document classes after dispatch:', document.documentElement.className)
      console.log('Force light: Has dark class:', document.documentElement.classList.contains('dark'))
    }, 100)
  }

  const forceDark = () => {
    console.log('Force dark: Current theme:', theme)
    console.log('Force dark: Document classes before:', document.documentElement.className)
    dispatch(setTheme('dark'))
    setTimeout(() => {
      console.log('Force dark: Document classes after dispatch:', document.documentElement.className)
      console.log('Force dark: Has dark class:', document.documentElement.classList.contains('dark'))
    }, 100)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Dark Theme Test Page
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Current theme: <span className="font-semibold text-sky-600 dark:text-sky-400">{theme}</span>
          </p>
          
          <div className="flex gap-4 mb-4">
            <ThemeToggle showLabel={true} />
            <button onClick={manualToggle} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
              Manual Toggle (Debug)
            </button>
            <button onClick={forceLight} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
              Force Light
            </button>
            <button onClick={forceDark} className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition-colors">
              Force Dark
            </button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Debug Info:</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Document classes: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                {typeof document !== 'undefined' ? document.documentElement.className : 'N/A'}
              </code>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Has dark class: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                {typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') ? 'Yes' : 'No' : 'N/A'}
              </code>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Cards */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Card Title</h3>
            <p className="text-gray-600 dark:text-gray-300">
              This is a sample card to test dark theme styling.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Another Card</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Cards should have proper dark theme backgrounds and text colors.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Form Elements</h3>
            <input
              type="text"
              placeholder="Test input"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-8 space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Button Tests</h2>
          <div className="flex flex-wrap gap-4">
            <button className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors">
              Primary Button
            </button>
            <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors">
              Secondary Button
            </button>
            <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
              Success Button
            </button>
            <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
              Danger Button
            </button>
          </div>
        </div>

        {/* Tables */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Table Test</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    John Doe
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    Admin
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                      Active
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    Jane Smith
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    User
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                      Pending
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts */}
        <div className="mt-8 space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Alert Tests</h2>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 px-4 py-3 rounded">
            This is an info alert with dark theme support.
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded">
            This is a success alert with dark theme support.
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 px-4 py-3 rounded">
            This is a warning alert with dark theme support.
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded">
            This is an error alert with dark theme support.
          </div>
        </div>

        {/* Navigation Test */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Navigation Test</h2>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <nav className="space-y-2">
              <a href="#" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors">
                Dashboard
              </a>
              <a href="#" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors">
                Users
              </a>
              <a href="#" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors">
                Settings
              </a>
            </nav>
          </div>
        </div>
      </div>
      
      {/* Debug Component */}
      <ThemeDebug />
    </div>
  )
}
