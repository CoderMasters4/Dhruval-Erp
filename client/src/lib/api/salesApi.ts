import { baseApi } from './baseApi'

// Types
export interface SalesStats {
  totalSales: number
  monthlyGrowth: number
  totalCustomers: number
  pendingPayments: number
  averageOrderValue: number
  topSellingProducts: Array<{
    product: string
    quantity: number
    revenue: number
  }>
}

export interface SalesOrder {
  _id: string
  orderId: string
  customerId: string
  customer: {
    _id: string
    name: string
    email: string
    phone: string
  }
  items: Array<{
    productId: string
    productName: string
    quantity: number
    price: number
    total: number
  }>
  totalAmount: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'overdue' | 'partial'
  orderDate: string
  expectedDelivery?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CustomerSalesReport {
  customerId: string
  customerName: string
  totalSales: number
  totalOrders: number
  averageOrderValue: number
  lastOrderDate: string
  paymentStatus: 'good' | 'delayed' | 'defaulter'
  outstandingAmount: number
}

export interface CreateSalesOrderRequest {
  customerId: string
  items: Array<{
    productId: string
    productName: string
    quantity: number
    price: number
  }>
  notes?: string
  expectedDelivery?: string
}

export interface UpdateSalesOrderRequest {
  status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus?: 'pending' | 'paid' | 'overdue' | 'partial'
  notes?: string
  expectedDelivery?: string
}

export interface SalesFilters {
  status?: string
  paymentStatus?: string
  customerId?: string
  dateFrom?: string
  dateTo?: string
  search?: string
  page?: number
  limit?: number
}

// API Endpoints
export const salesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get Sales Statistics
    getSalesStats: builder.query<{ success: boolean; data: SalesStats }, void>({
      query: () => '/sales/stats',
      providesTags: ['SalesStats'],
    }),

    // Get All Sales Orders
    getSalesOrders: builder.query<
      { success: boolean; data: SalesOrder[]; pagination: any },
      SalesFilters
    >({
      query: (filters) => ({
        url: '/sales/orders',
        params: filters,
      }),
      providesTags: ['Sales'],
    }),

    // Get Single Sales Order
    getSalesOrder: builder.query<{ success: boolean; data: SalesOrder }, string>({
      query: (id) => `/sales/orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Sales', id }],
    }),

    // Create Sales Order
    createSalesOrder: builder.mutation<
      { success: boolean; data: SalesOrder },
      CreateSalesOrderRequest
    >({
      query: (orderData) => ({
        url: '/sales/orders',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Sales', 'SalesStats'],
    }),

    // Update Sales Order
    updateSalesOrder: builder.mutation<
      { success: boolean; data: SalesOrder },
      { id: string; data: UpdateSalesOrderRequest }
    >({
      query: ({ id, data }) => ({
        url: `/sales/orders/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Sales', id },
        'Sales',
        'SalesStats',
      ],
    }),

    // Delete Sales Order
    deleteSalesOrder: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/sales/orders/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Sales', 'SalesStats'],
    }),

    // Get Customer Sales Report
    getCustomerSalesReport: builder.query<
      { success: boolean; data: CustomerSalesReport[] },
      { dateFrom?: string; dateTo?: string }
    >({
      query: (params) => ({
        url: '/sales/customer-report',
        params,
      }),
      providesTags: ['Sales'],
    }),

    // Get Sales Analytics
    getSalesAnalytics: builder.query<
      {
        success: boolean
        data: {
          dailySales: Array<{ date: string; amount: number; orders: number }>
          monthlySales: Array<{ month: string; amount: number; orders: number }>
          topProducts: Array<{ product: string; quantity: number; revenue: number }>
          salesByStatus: Array<{ status: string; count: number; amount: number }>
        }
      },
      { period?: 'week' | 'month' | 'quarter' | 'year' }
    >({
      query: (params) => ({
        url: '/sales/analytics',
        params,
      }),
      providesTags: ['SalesStats'],
    }),

    // Update Payment Status
    updatePaymentStatus: builder.mutation<
      { success: boolean; data: SalesOrder },
      { id: string; paymentStatus: 'pending' | 'paid' | 'overdue' | 'partial'; amount?: number }
    >({
      query: ({ id, paymentStatus, amount }) => ({
        url: `/sales/orders/${id}/payment`,
        method: 'PUT',
        body: { paymentStatus, amount },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Sales', id },
        'Sales',
        'SalesStats',
      ],
    }),

    // Bulk Update Orders
    bulkUpdateSalesOrders: builder.mutation<
      { success: boolean; data: { updated: number } },
      { ids: string[]; updates: Partial<UpdateSalesOrderRequest> }
    >({
      query: ({ ids, updates }) => ({
        url: '/sales/orders/bulk-update',
        method: 'PUT',
        body: { ids, updates },
      }),
      invalidatesTags: ['Sales', 'SalesStats'],
    }),

    // Export Sales Data
    exportSalesData: builder.mutation<
      { success: boolean; data: { downloadUrl: string } },
      { format: 'csv' | 'excel'; filters?: SalesFilters }
    >({
      query: ({ format, filters }) => ({
        url: '/sales/export',
        method: 'POST',
        body: { format, filters },
      }),
    }),
  }),
})

export const {
  useGetSalesStatsQuery,
  useGetSalesOrdersQuery,
  useGetSalesOrderQuery,
  useCreateSalesOrderMutation,
  useUpdateSalesOrderMutation,
  useDeleteSalesOrderMutation,
  useGetCustomerSalesReportQuery,
  useGetSalesAnalyticsQuery,
  useUpdatePaymentStatusMutation,
  useBulkUpdateSalesOrdersMutation,
  useExportSalesDataMutation,
} = salesApi
