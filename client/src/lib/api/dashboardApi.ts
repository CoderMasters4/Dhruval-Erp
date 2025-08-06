import { baseApi } from './baseApi'

export interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  totalCustomers: number
  totalProducts: number
  totalProduction: number
  totalInventory: number
  totalEmployees: number
  totalSuppliers: number
  pendingOrders: number
  completedOrders: number
  lowStockItems: number
  activeProduction: number
}

export interface RecentActivity {
  id: string
  type: 'order' | 'production' | 'inventory' | 'finance' | 'user' | 'quality'
  title: string
  description: string
  timestamp: string
  user: string
  status: 'success' | 'warning' | 'error' | 'info'
  metadata?: Record<string, any>
}

export interface ChartData {
  salesData: Array<{
    month: string
    sales: number
    orders: number
    production: number
  }>
  productionData: Array<{
    name: string
    value: number
    color: string
  }>
  inventoryData: Array<{
    name: string
    value: number
    color: string
  }>
}

export interface RecentOrder {
  id: string
  orderNumber: string
  customer: string
  amount: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  date: string
  items: number
}

export interface LowStockItem {
  id: string
  name: string
  sku: string
  current: number
  minimum: number
  unit: string
  category: string
  supplier: string
}

export interface DashboardData {
  stats: DashboardStats
  recentActivities: RecentActivity[]
  chartData: ChartData
  recentOrders: RecentOrder[]
  lowStockItems: LowStockItem[]
  permissions: {
    canViewFinancials: boolean
    canViewProduction: boolean
    canViewInventory: boolean
    canViewOrders: boolean
    canViewUsers: boolean
    canViewReports: boolean
  }
}

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardData: builder.query<any, void>({
      query: () => ({
        url: '/dashboard',
        method: 'GET',
      }),
      providesTags: ['Dashboard'],
    }),
    
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => ({
        url: '/dashboard/stats',
        method: 'GET',
      }),
      providesTags: ['Dashboard'],
    }),
    
    getRecentActivities: builder.query<RecentActivity[], { limit?: number }>({
      query: ({ limit = 10 }) => ({
        url: `/dashboard/activities?limit=${limit}`,
        method: 'GET',
      }),
      providesTags: ['Dashboard'],
    }),
    
    getChartData: builder.query<ChartData, { period?: string }>({
      query: ({ period = '6months' }) => ({
        url: `/dashboard/charts?period=${period}`,
        method: 'GET',
      }),
      providesTags: ['Dashboard'],
    }),
    
    getRecentOrders: builder.query<RecentOrder[], { limit?: number }>({
      query: ({ limit = 5 }) => ({
        url: `/dashboard/orders/recent?limit=${limit}`,
        method: 'GET',
      }),
      providesTags: ['Dashboard', 'CustomerOrder'],
    }),
    
    getLowStockItems: builder.query<LowStockItem[], { limit?: number }>({
      query: ({ limit = 5 }) => ({
        url: `/dashboard/inventory/low-stock?limit=${limit}`,
        method: 'GET',
      }),
      providesTags: ['Dashboard', 'InventoryItem'],
    }),
  }),
})

export const {
  useGetDashboardDataQuery,
  useGetDashboardStatsQuery,
  useGetRecentActivitiesQuery,
  useGetChartDataQuery,
  useGetRecentOrdersQuery,
  useGetLowStockItemsQuery,
} = dashboardApi
