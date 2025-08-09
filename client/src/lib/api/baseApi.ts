import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../store'

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    // Try to get token from state first, then fallback to localStorage
    const state = getState() as RootState
    let token = state.auth.token
    const currentCompanyId = state.auth.currentCompanyId
    const user = state.auth.user

    // Fallback to localStorage if token not in state
    if (!token && typeof window !== 'undefined') {
      token = localStorage.getItem('token')
    }

    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }

    // Add company ID header - super admin can switch companies, others use their company
    if (currentCompanyId) {
      headers.set('X-Company-ID', currentCompanyId)
    } else if (user?.companyAccess?.[0]?.companyId) {
      headers.set('X-Company-ID', user.companyAccess[0].companyId)
    } else if (user?.isSuperAdmin && state.auth.companies?.[0]?._id) {
      // For super admin, use first available company if no specific company selected
      headers.set('X-Company-ID', state.auth.companies[0]._id)
    }

    headers.set('Content-Type', 'application/json')
    return headers
  },
})

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions)
  
  if (result?.error?.status === 401) {
    // Try to get a new token
    const refreshResult = await baseQuery('/auth/refresh', api, extraOptions)
    
    if (refreshResult?.data) {
      // Store the new token
      api.dispatch({ type: 'auth/setCredentials', payload: refreshResult.data })
      
      // Retry the original query with new token
      result = await baseQuery(args, api, extraOptions)
    } else {
      // Refresh failed, logout user
      api.dispatch({ type: 'auth/logout' })
    }
  }
  
  return result
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    // Core Business Models
    'Company',
    'User',
    'Role',
    'Customer',
    'Supplier',
    'InventoryItem',
    'StockMovement',
    'Warehouse',
    'Batch',
    'ProductionOrder',
    'CustomerOrder',
    'PurchaseOrder',
    'PurchaseReport',
    'Order',
    'OrderStats',
    'Vehicle',
    'VehicleStats',
    'Invoice',
    'Quotation',
    'FinancialTransaction',

    // Security & Management Models
    'SuperAdmin',
    'Visitor',
    'Vehicle',
    'SecurityLog',
    'AuditLog',

    // Advanced Operational Models
    'BusinessAnalytics',
    'Analytics',
    'BoilerMonitoring',
    'Boiler',
    'ElectricityMonitoring',
    'ElectricalPanel',
    'Hospitality',
    'HospitalityService',
    'CustomerVisit',
    'HospitalityStats',
    'Dispatch',
    'Report',
    'Spare',

    // Additional Tags
    'Order',
    'Inventory',
    'Quotation',
    'ProductionOrder',
    'FinancialTransaction',
    'AuditLog',

    // Additional
    'Permission',
    'Dashboard',
    'File',
    'List',
    'Detail',
    'Stats',

    // Enhanced Features
    'Sales',
    'SalesStats',
    'Purchase',
    'PurchaseStats',
    'AdvancedInventory',
    'FentInventory',
    'ProcessTracking',
    'AgingStock',
    'EnhancedProduction',
    'ProductionTracking',
    'JobWork',
    'EnhancedDispatch',
    'PackingList',
    'RTOTracking',
    'TwoFactor'

  ],
  endpoints: () => ({}),
})

export default baseApi
