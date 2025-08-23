'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import { 
  Menu, 
  Bell, 
  Search, 
  User, 
  Settings, 
  LogOut, 
  Moon, 
  Sun,
  ChevronDown,
  Building2,
  UserCircle
} from 'lucide-react'
import { selectCurrentUser, selectCurrentCompany, selectIsSuperAdmin } from '@/lib/features/auth/authSlice'
import { CompanySwitcher } from '@/components/ui/CompanySwitcher'
import { BrowserInstallButton } from '@/components/pwa/BrowserInstallButton'
import { 
  selectNotifications, 
  selectUnreadNotifications, 
  selectTheme,
  toggleSidebar, 
  setTheme,
  markAllNotificationsRead 
} from '@/lib/features/ui/uiSlice'
import { useLogoutMutation } from '@/lib/api/authApi'
import { logout } from '@/lib/features/auth/authSlice'
import { addNotification } from '@/lib/features/ui/uiSlice'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export function Header() {
  const router = useRouter()
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)
  const currentCompany = useSelector(selectCurrentCompany)
  const isSuperAdmin = useSelector(selectIsSuperAdmin)
  const notifications = useSelector(selectNotifications)
  const unreadNotifications = useSelector(selectUnreadNotifications)
  const theme = useSelector(selectTheme)
  
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  const userMenuRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)
  
  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation()

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap()
      dispatch(logout())
      toast.success('Logged out successfully')
      router.push('/login')
    } catch (error) {
      dispatch(logout()) // Force logout even if API call fails
      router.push('/login')
    }
  }

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    dispatch(setTheme(newTheme))
    toast.success(`${newTheme === 'dark' ? 'Dark' : 'Light'} theme enabled`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const formatNotificationTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <header className="bg-white dark:bg-gray-800 border-b-2 border-sky-500 h-16 flex items-center justify-between px-3 sm:px-4 lg:px-6 shadow-sm sticky top-0 z-30 transition-all duration-300 backdrop-blur-sm">
      {/* Left side */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Mobile menu button */}
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="p-2 rounded-lg hover:bg-sky-50 dark:hover:bg-gray-700 border border-sky-200 dark:border-gray-600 transition-all duration-200 lg:hidden group"
        >
          <Menu className="h-5 w-5 text-gray-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors" />
        </button>

        {/* Mobile Search Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-sky-50 dark:hover:bg-gray-700 border border-sky-200 dark:border-gray-600 transition-all duration-200 group"
          onClick={() => {/* TODO: Implement mobile search modal */}}
        >
          <Bell className="h-5 w-5 text-gray-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors" />
        </button>

        {/* Desktop Search */}
        <form onSubmit={handleSearch} className="hidden md:block">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400 group-focus-within:text-sky-500 transition-colors" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-48 lg:w-64 border-2 border-sky-500 dark:border-sky-400 rounded-lg focus:outline-none focus:border-sky-600 dark:focus:border-sky-300 focus:ring-2 focus:ring-sky-500/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 hover:border-sky-600 dark:hover:border-sky-300"
            />
          </div>
        </form>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
        {/* PWA Install Button */}
        <BrowserInstallButton />

        {/* Company Switcher */}
        <CompanySwitcher />

        {/* Super Admin Badge - Hidden on small screens */}
        {isSuperAdmin && (
          <div className="hidden md:block px-2 sm:px-3 py-1 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-medium rounded-full shadow-sm">
            <span className="hidden sm:inline">Super Admin</span>
            <span className="sm:hidden">SA</span>
          </div>
        )}

        {/* Theme toggle */}
        <button
          onClick={handleThemeToggle}
          className="p-2 rounded-lg hover:bg-sky-50 dark:hover:bg-gray-700 border border-sky-500 dark:border-sky-400 transition-all duration-300 hover:scale-105 active:scale-95 group shadow-sm"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
        >
          {theme === 'light' ? (
            <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-all duration-300" />
          ) : (
            <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-gray-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-all duration-300" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-sky-50 dark:hover:bg-gray-700 border border-sky-200 dark:border-gray-600 transition-all duration-200 group"
          >
            <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors" />
            {unreadNotifications.length > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center shadow-sm">
                {unreadNotifications.length > 9 ? '9+' : unreadNotifications.length}
              </span>
            )}
          </button>

          {/* Notifications dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg border-2 border-sky-500 dark:border-sky-400 z-50 transition-all duration-300 shadow-xl backdrop-blur-sm">
              <div className="p-4 border-b border-sky-200 dark:border-gray-600 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-gray-700 dark:to-gray-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
                  {unreadNotifications.length > 0 && (
                    <button
                      onClick={() => dispatch(markAllNotificationsRead())}
                      className="text-sm text-sky-500 hover:text-sky-600 dark:text-sky-400 dark:hover:text-sky-300 transition-colors duration-200"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    No notifications
                  </div>
                ) : (
                  notifications.slice(0, 10).map((notification) => (
                    <div
                      key={notification.id}
                      className={clsx(
                        'p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-all duration-200',
                        !notification.read && 'bg-blue-50 dark:bg-blue-900/20'
                      )}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={clsx(
                          'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                          notification.type === 'success' && 'bg-green-500',
                          notification.type === 'error' && 'bg-red-500',
                          notification.type === 'warning' && 'bg-yellow-500',
                          notification.type === 'info' && 'bg-blue-500'
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {formatNotificationTime(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {notifications.length > 10 && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                  <button
                    onClick={() => router.push('/notifications')}
                    className="w-full text-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                  >
                    View all notifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 sm:space-x-3 p-1 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-1 sm:space-x-2">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.firstName}
                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-600 group-hover:ring-sky-500 dark:group-hover:ring-sky-400 transition-all duration-200"
                />
              ) : (
                <div className="h-7 w-7 sm:h-8 sm:w-8 bg-gradient-to-r from-blue-500 to-sky-600 rounded-full flex items-center justify-center ring-2 ring-gray-200 dark:ring-gray-600 group-hover:ring-sky-500 dark:group-hover:ring-sky-400 transition-all duration-200">
                  <span className="text-white text-xs sm:text-sm font-medium">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
              )}
              <div className="hidden lg:block text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors duration-200">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {isSuperAdmin ? 'Super Admin' : user?.companyAccess?.[0]?.role || 'User'}
                </p>
              </div>
            </div>
            <ChevronDown className="hidden sm:block h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-sky-500 transition-colors duration-200" />
          </button>

          {/* User dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 z-50 transition-all duration-300 backdrop-blur-sm">
              <div className="p-4 border-b border-gray-200 dark:border-gray-600 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                <div className="flex items-center space-x-3">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.firstName}
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-600"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-sky-600 rounded-full flex items-center justify-center ring-2 ring-gray-200 dark:ring-gray-600">
                      <span className="text-white font-medium">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {isSuperAdmin ? 'Super Admin' : user?.companyAccess?.[0]?.role || 'User'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="py-2">
                <button
                  onClick={() => {
                    router.push('/profile')
                    setShowUserMenu(false)
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-all duration-200"
                >
                  <UserCircle className="h-4 w-4 mr-3" />
                  Profile
                </button>
                
                <button
                  onClick={() => {
                    router.push('/settings')
                    setShowUserMenu(false)
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-all duration-200"
                >
                  <Settings className="h-4 w-4 mr-3" />
                  Settings
                </button>
                
                <hr className="my-2 border-gray-200 dark:border-gray-600" />
                
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-all duration-200"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  {isLoggingOut ? 'Signing out...' : 'Sign out'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
