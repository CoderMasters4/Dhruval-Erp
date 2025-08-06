import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../store'

const baseQueryV2 = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL_V2 || 'http://localhost:4000/api/v2',
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

    return headers
  },
})

// Base API for V2 endpoints
export const baseApiV2 = createApi({
  reducerPath: 'apiV2',
  baseQuery: baseQueryV2,
  tagTypes: [
    // Core Business Entities
    'Company',
    'User',
    'Role',
    'Customer',
    'Supplier',
    'InventoryItem',
    'StockMovement',
    'ProductionOrder',
    'CustomerOrder',
    'PurchaseOrder',
    'Invoice',
    'Quotation',
    'FinancialTransaction',
    'Warehouse',
    'Visitor',
    'Vehicle',
    'SecurityLog',
    'AuditLog',
    'BusinessAnalytics',
    'BoilerMonitoring',
    'ElectricityMonitoring',
    'Hospitality',
    'Dispatch',
    'Report',
    'Spare',

    // Additional Tags
    'List',
    'Detail',
    'Stats',
    'Dashboard'
  ],
  endpoints: () => ({}),
})

export default baseApiV2