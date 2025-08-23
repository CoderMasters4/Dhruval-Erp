import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  theme: 'light' | 'dark'
  loading: boolean
  notifications: Notification[]
  modals: {
    [key: string]: boolean
  }
}

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: number
  read: boolean
}

const initialState: UIState = {
  sidebarOpen: true,
  sidebarCollapsed: false,
  theme: 'light',
  loading: false,
  notifications: [],
  modals: {},
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },
    
    toggleSidebarCollapsed: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload
      
      // Store in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('sidebarCollapsed', JSON.stringify(action.payload))
      }
    },
    
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      console.log('UI Slice: Setting theme to', action.payload)
      state.theme = action.payload
      
      // Store in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', action.payload)
        console.log('UI Slice: Saved theme to localStorage:', action.payload)
        
        // Apply theme to document using Tailwind's class-based approach
        if (action.payload === 'dark') {
          document.documentElement.classList.add('dark')
          console.log('UI Slice: Added dark class to document')
        } else {
          document.documentElement.classList.remove('dark')
          console.log('UI Slice: Removed dark class from document')
        }
        
        console.log('UI Slice: Document classes after update:', document.documentElement.className)
        
        // Update meta theme-color for mobile browsers
        const metaThemeColor = document.querySelector('meta[name="theme-color"]')
        if (metaThemeColor) {
          metaThemeColor.setAttribute('content', action.payload === 'dark' ? '#0f172a' : '#ffffff')
        }
      }
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp' | 'read'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now(),
        read: false,
      }
      state.notifications.unshift(notification)
      
      // Keep only last 50 notifications
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50)
      }
    },
    
    markNotificationRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload)
      if (notification) {
        notification.read = true
      }
    },
    
    markAllNotificationsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true
      })
    },
    
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload)
    },
    
    clearNotifications: (state) => {
      state.notifications = []
    },
    
    openModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = true
    },
    
    closeModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = false
    },
    
    toggleModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = !state.modals[action.payload]
    },
    
    initializeUI: (state) => {
      if (typeof window !== 'undefined') {
        // Initialize theme
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
        if (savedTheme) {
          state.theme = savedTheme
          // Apply the saved theme to document
          if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
        } else {
          // Check system preference
          const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          state.theme = systemPrefersDark ? 'dark' : 'light'
          // Apply the system preference to document
          if (systemPrefersDark) {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
        }
        
        // Initialize sidebar collapsed state
        const sidebarCollapsed = localStorage.getItem('sidebarCollapsed')
        if (sidebarCollapsed) {
          state.sidebarCollapsed = JSON.parse(sidebarCollapsed)
        }
      }
    },
  },
})

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleSidebarCollapsed,
  setSidebarCollapsed,
  setTheme,
  setLoading,
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
  toggleModal,
  initializeUI,
} = uiSlice.actions

export default uiSlice.reducer

// Selectors
export const selectSidebarOpen = (state: { ui: UIState }) => state.ui.sidebarOpen
export const selectSidebarCollapsed = (state: { ui: UIState }) => state.ui.sidebarCollapsed
export const selectTheme = (state: { ui: UIState }) => state.ui.theme
export const selectUILoading = (state: { ui: UIState }) => state.ui.loading
export const selectNotifications = (state: { ui: UIState }) => state.ui.notifications
export const selectUnreadNotifications = (state: { ui: UIState }) => 
  state.ui.notifications.filter(n => !n.read)
export const selectModalState = (modalName: string) => (state: { ui: UIState }) => 
  state.ui.modals[modalName] || false
