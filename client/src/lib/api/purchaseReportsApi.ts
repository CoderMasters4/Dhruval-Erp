import { baseApi } from './baseApi'

// Purchase Report Types
export interface PurchaseReportSummary {
  totalPurchaseOrders: number
  totalPurchaseAmount: number
  totalTaxAmount: number
  avgOrderValue: number
  uniqueSuppliersCount: number
}

export interface SupplierWiseData {
  supplierId: string
  supplierName: string
  supplierCode: string
  contactInfo?: {
    primaryEmail?: string
    primaryPhone?: string
  }
  businessInfo?: {
    businessType?: string
    industry?: string
  }
  totalOrders: number
  totalAmount: number
  totalTaxAmount: number
  avgOrderValue: number
  orders: Array<{
    poNumber: string
    poDate: string
    status: string
    category: string
    priority: string
    expectedDeliveryDate: string
    grandTotal: number
    taxAmount: number
    itemCount: number
  }>
  performance: {
    onTimeDeliveryRate: number
    totalSpent: number
  }
}

export interface StatusBreakdown {
  _id: string
  count: number
  totalAmount: number
}

export interface CategoryBreakdown {
  _id: string
  count: number
  totalAmount: number
}

export interface SupplierWisePurchaseReport {
  summary: PurchaseReportSummary
  statusBreakdown: StatusBreakdown[]
  categoryBreakdown: CategoryBreakdown[]
  supplierWiseData: SupplierWiseData[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  filters: {
    supplierId?: string
    status?: string
    category?: string
  }
  dateRange: {
    start: string
    end: string
  }
  generatedAt: string
}

export interface PurchaseSummaryReport {
  summary: {
    totalPurchases: number
    totalOrders: number
    avgOrderValue: number
    totalTax: number
  }
  monthlyTrends: Array<{
    month: string
    totalAmount: number
    orderCount: number
  }>
  topSuppliers: Array<{
    _id: string
    supplierName: string
    totalAmount: number
    orderCount: number
  }>
  categoryBreakdown: CategoryBreakdown[]
  dateRange: {
    start: string
    end: string
  }
  generatedAt: string
}

export interface PurchaseReportFilters {
  startDate: string
  endDate: string
  supplierId?: string
  status?: string
  category?: string
  page?: number
  limit?: number
  format?: string
}

export const purchaseReportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get supplier-wise purchase report
    getSupplierWisePurchaseReport: builder.query<
      {
        success: boolean
        data: SupplierWisePurchaseReport
        message: string
      },
      PurchaseReportFilters
    >({
      query: (params) => ({
        url: '/reports/generate/purchase/supplier-wise',
        method: 'GET',
        params,
      }),
      providesTags: ['PurchaseReport'],
    }),

    // Get purchase summary report
    getPurchaseSummaryReport: builder.query<
      {
        success: boolean
        data: PurchaseSummaryReport
        message: string
      },
      {
        startDate: string
        endDate: string
        format?: string
      }
    >({
      query: (params) => ({
        url: '/reports/generate/purchase/summary',
        method: 'GET',
        params,
      }),
      providesTags: ['PurchaseReport'],
    }),

    // Export supplier-wise purchase report
    exportSupplierWisePurchaseReport: builder.mutation<
      Blob,
      PurchaseReportFilters & { format: 'pdf' | 'excel' | 'csv' }
    >({
      query: (params) => ({
        url: '/reports/generate/purchase/supplier-wise',
        method: 'GET',
        params,
        responseHandler: (response) => response.blob(),
      }),
    }),

    // Export purchase summary report
    exportPurchaseSummaryReport: builder.mutation<
      Blob,
      {
        startDate: string
        endDate: string
        format: 'pdf' | 'excel' | 'csv'
      }
    >({
      query: (params) => ({
        url: '/reports/generate/purchase/summary',
        method: 'GET',
        params,
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
})

export const {
  useGetSupplierWisePurchaseReportQuery,
  useGetPurchaseSummaryReportQuery,
  useExportSupplierWisePurchaseReportMutation,
  useExportPurchaseSummaryReportMutation,
} = purchaseReportsApi
