import { baseApi } from './baseApi'

// Types
export interface PurchaseStats {
  totalPurchases: number
  monthlySpend: number
  totalSuppliers: number
  pendingOrders: number
  averageOrderValue: number
  topCategories: Array<{
    category: string
    amount: number
    percentage: number
  }>
}

export interface PurchaseOrder {
  _id: string
  purchaseOrderId: string
  supplierId: string
  supplier: {
    _id: string
    name: string
    email: string
    phone: string
    category: string
  }
  items: Array<{
    itemId: string
    itemName: string
    category: 'chemicals' | 'grey_fabric' | 'colors' | 'packing_material' | 'other'
    quantity: number
    unit: string
    price: number
    total: number
  }>
  totalAmount: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'overdue' | 'partial'
  orderDate: string
  expectedDelivery?: string
  actualDelivery?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface SupplierPurchaseReport {
  supplierId: string
  supplierName: string
  category: string
  totalPurchases: number
  totalOrders: number
  averageOrderValue: number
  lastOrderDate: string
  paymentStatus: 'good' | 'delayed' | 'defaulter'
  outstandingAmount: number
}

export interface CategoryWiseSpend {
  category: string
  amount: number
  percentage: number
  orders: number
  topSuppliers: Array<{
    supplierId: string
    supplierName: string
    amount: number
  }>
}

export interface CreatePurchaseOrderRequest {
  supplierId: string
  items: Array<{
    itemId: string
    itemName: string
    category: 'chemicals' | 'grey_fabric' | 'colors' | 'packing_material' | 'other'
    quantity: number
    unit: string
    price: number
  }>
  notes?: string
  expectedDelivery?: string
}

export interface UpdatePurchaseOrderRequest {
  status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus?: 'pending' | 'paid' | 'overdue' | 'partial'
  notes?: string
  expectedDelivery?: string
  actualDelivery?: string
}

export interface PurchaseFilters {
  status?: string
  paymentStatus?: string
  supplierId?: string
  category?: string
  dateFrom?: string
  dateTo?: string
  search?: string
  page?: number
  limit?: number
}

// API Endpoints
export const purchaseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get Purchase Statistics
    getPurchaseStats: builder.query<{ success: boolean; data: PurchaseStats }, void>({
      query: () => '/purchase/stats',
      providesTags: ['PurchaseStats'],
    }),

    // Get All Purchase Orders
    getPurchaseOrders: builder.query<
      { success: boolean; data: PurchaseOrder[]; pagination: any },
      PurchaseFilters
    >({
      query: (filters) => ({
        url: '/purchase/orders',
        params: filters,
      }),
      providesTags: ['Purchase'],
    }),

    // Get Single Purchase Order
    getPurchaseOrder: builder.query<{ success: boolean; data: PurchaseOrder }, string>({
      query: (id) => `/purchase/orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Purchase', id }],
    }),

    // Create Purchase Order
    createPurchaseOrder: builder.mutation<
      { success: boolean; data: PurchaseOrder },
      CreatePurchaseOrderRequest
    >({
      query: (orderData) => ({
        url: '/purchase/orders',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Purchase', 'PurchaseStats'],
    }),

    // Update Purchase Order
    updatePurchaseOrder: builder.mutation<
      { success: boolean; data: PurchaseOrder },
      { id: string; data: UpdatePurchaseOrderRequest }
    >({
      query: ({ id, data }) => ({
        url: `/purchase/orders/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Purchase', id },
        'Purchase',
        'PurchaseStats',
      ],
    }),

    // Delete Purchase Order
    deletePurchaseOrder: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/purchase/orders/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Purchase', 'PurchaseStats'],
    }),

    // Get Supplier Purchase Report
    getSupplierPurchaseReport: builder.query<
      { success: boolean; data: SupplierPurchaseReport[] },
      { dateFrom?: string; dateTo?: string }
    >({
      query: (params) => ({
        url: '/purchase/supplier-report',
        params,
      }),
      providesTags: ['Purchase'],
    }),

    // Get Category-wise Spend
    getCategoryWiseSpend: builder.query<
      { success: boolean; data: CategoryWiseSpend[] },
      { dateFrom?: string; dateTo?: string }
    >({
      query: (params) => ({
        url: '/purchase/category-spend',
        params,
      }),
      providesTags: ['PurchaseStats'],
    }),

    // Get Purchase Analytics
    getPurchaseAnalytics: builder.query<
      {
        success: boolean
        data: {
          dailyPurchases: Array<{ date: string; amount: number; orders: number }>
          monthlyPurchases: Array<{ month: string; amount: number; orders: number }>
          topSuppliers: Array<{ supplier: string; amount: number; orders: number }>
          purchasesByCategory: Array<{ category: string; amount: number; percentage: number }>
        }
      },
      { period?: 'week' | 'month' | 'quarter' | 'year' }
    >({
      query: (params) => ({
        url: '/purchase/analytics',
        params,
      }),
      providesTags: ['PurchaseStats'],
    }),

    // Update Payment Status
    updatePurchasePaymentStatus: builder.mutation<
      { success: boolean; data: PurchaseOrder },
      { id: string; paymentStatus: 'pending' | 'paid' | 'overdue' | 'partial'; amount?: number }
    >({
      query: ({ id, paymentStatus, amount }) => ({
        url: `/purchase/orders/${id}/payment`,
        method: 'PUT',
        body: { paymentStatus, amount },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Purchase', id },
        'Purchase',
        'PurchaseStats',
      ],
    }),

    // Bulk Update Orders
    bulkUpdatePurchaseOrders: builder.mutation<
      { success: boolean; data: { updated: number } },
      { ids: string[]; updates: Partial<UpdatePurchaseOrderRequest> }
    >({
      query: ({ ids, updates }) => ({
        url: '/purchase/orders/bulk-update',
        method: 'PUT',
        body: { ids, updates },
      }),
      invalidatesTags: ['Purchase', 'PurchaseStats'],
    }),

    // Export Purchase Data
    exportPurchaseData: builder.mutation<
      { success: boolean; data: { downloadUrl: string } },
      { format: 'csv' | 'excel'; filters?: PurchaseFilters }
    >({
      query: ({ format, filters }) => ({
        url: '/purchase/export',
        method: 'POST',
        body: { format, filters },
      }),
    }),
  }),
})

export const {
  useGetPurchaseStatsQuery,
  useGetPurchaseOrdersQuery,
  useGetPurchaseOrderQuery,
  useCreatePurchaseOrderMutation,
  useUpdatePurchaseOrderMutation,
  useDeletePurchaseOrderMutation,
  useGetSupplierPurchaseReportQuery,
  useGetCategoryWiseSpendQuery,
  useGetPurchaseAnalyticsQuery,
  useUpdatePurchasePaymentStatusMutation,
  useBulkUpdatePurchaseOrdersMutation,
  useExportPurchaseDataMutation,
} = purchaseApi
