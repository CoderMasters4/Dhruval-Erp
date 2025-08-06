import { baseApi } from './baseApi'

export interface KPIData {
  totalRevenue: number
  revenueGrowth: number
  totalOrders: number
  ordersGrowth: number
  inventoryValue: number
  inventoryGrowth: number
  operationalEfficiency: number
  efficiencyGrowth: number
  energyConsumption: number
  energyGrowth: number
  safetyIncidents: number
  safetyGrowth: number
  visitorCount: number
  visitorGrowth: number
  maintenanceCompliance: number
  complianceGrowth: number
}

export interface RevenueData {
  month: string
  revenue: number
  orders: number
  efficiency: number
}

export interface DepartmentData {
  department: string
  efficiency: number
  cost: number
  revenue: number
}

export interface ResourceData {
  resource: string
  utilization: number
  cost: number
  target: number
}

export interface InventoryDistribution {
  category: string
  value: number
  percentage: number
}

export interface AnalyticsData {
  kpiData: KPIData
  revenueData: RevenueData[]
  departmentData: DepartmentData[]
  resourceData: ResourceData[]
  inventoryDistribution: InventoryDistribution[]
}

export const analyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get analytics dashboard data
    getAnalyticsDashboard: builder.query<
      { success: boolean; data: AnalyticsData },
      { 
        timeRange?: string
        companyId?: string
        departments?: string[]
        metrics?: string[]
      }
    >({
      query: (params = {}) => ({
        url: '/analytics/dashboard',
        method: 'GET',
        params,
      }),
      providesTags: ['Analytics'],
    }),

    // Get KPI data
    getKPIData: builder.query<
      { success: boolean; data: KPIData },
      { timeRange?: string; companyId?: string; comparisonPeriod?: string }
    >({
      query: (params = {}) => ({
        url: '/analytics/kpi',
        method: 'GET',
        params,
      }),
      providesTags: ['Analytics'],
    }),

    // Get revenue trends
    getRevenueTrends: builder.query<
      { success: boolean; data: RevenueData[] },
      { timeRange?: string; companyId?: string; granularity?: 'daily' | 'weekly' | 'monthly' }
    >({
      query: (params = {}) => ({
        url: '/analytics/revenue-trends',
        method: 'GET',
        params,
      }),
      providesTags: ['Analytics'],
    }),

    // Get department performance
    getDepartmentPerformance: builder.query<
      { success: boolean; data: DepartmentData[] },
      { timeRange?: string; companyId?: string; departments?: string[] }
    >({
      query: (params = {}) => ({
        url: '/analytics/department-performance',
        method: 'GET',
        params,
      }),
      providesTags: ['Analytics'],
    }),

    // Get resource utilization
    getResourceUtilization: builder.query<
      { success: boolean; data: ResourceData[] },
      { timeRange?: string; companyId?: string; resources?: string[] }
    >({
      query: (params = {}) => ({
        url: '/analytics/resource-utilization',
        method: 'GET',
        params,
      }),
      providesTags: ['Analytics'],
    }),

    // Get inventory distribution
    getInventoryDistribution: builder.query<
      { success: boolean; data: InventoryDistribution[] },
      { companyId?: string; categories?: string[] }
    >({
      query: (params = {}) => ({
        url: '/analytics/inventory-distribution',
        method: 'GET',
        params,
      }),
      providesTags: ['Analytics'],
    }),

    // Get operational metrics
    getOperationalMetrics: builder.query<
      {
        success: boolean
        data: {
          productivity: {
            current: number
            target: number
            trend: number
          }
          quality: {
            defectRate: number
            customerSatisfaction: number
            returnRate: number
          }
          efficiency: {
            overallEquipmentEffectiveness: number
            energyEfficiency: number
            laborEfficiency: number
          }
          safety: {
            incidentRate: number
            nearMissReports: number
            complianceScore: number
          }
        }
      },
      { timeRange?: string; companyId?: string }
    >({
      query: (params = {}) => ({
        url: '/analytics/operational-metrics',
        method: 'GET',
        params,
      }),
      providesTags: ['Analytics'],
    }),

    // Get financial analysis
    getFinancialAnalysis: builder.query<
      {
        success: boolean
        data: {
          profitability: {
            grossMargin: number
            netMargin: number
            roi: number
          }
          cashFlow: {
            operating: number
            investing: number
            financing: number
          }
          costs: {
            totalCosts: number
            costBreakdown: Array<{
              category: string
              amount: number
              percentage: number
            }>
          }
        }
      },
      { timeRange?: string; companyId?: string }
    >({
      query: (params = {}) => ({
        url: '/analytics/financial-analysis',
        method: 'GET',
        params,
      }),
      providesTags: ['Analytics'],
    }),

    // Export analytics report
    exportAnalyticsReport: builder.mutation<
      { success: boolean; data: { downloadUrl: string }; message: string },
      {
        reportType: 'dashboard' | 'kpi' | 'financial' | 'operational'
        format: 'pdf' | 'excel' | 'csv'
        timeRange: string
        companyId?: string
        includeCharts?: boolean
      }
    >({
      query: (params) => ({
        url: '/analytics/export',
        method: 'POST',
        body: params,
      }),
      invalidatesTags: ['Analytics'],
    }),
  }),
})

export const {
  useGetAnalyticsDashboardQuery,
  useGetKPIDataQuery,
  useGetRevenueTrendsQuery,
  useGetDepartmentPerformanceQuery,
  useGetResourceUtilizationQuery,
  useGetInventoryDistributionQuery,
  useGetOperationalMetricsQuery,
  useGetFinancialAnalysisQuery,
  useExportAnalyticsReportMutation,
} = analyticsApi
