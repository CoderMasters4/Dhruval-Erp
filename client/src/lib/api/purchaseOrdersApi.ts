import { baseApi } from './baseApi'

export interface PurchaseOrder {
  _id: string
  orderNumber: string
  supplierId: string
  supplier?: {
    supplierName: string
    supplierCode: string
    contactInfo?: {
      email: string
      phone: string
    }
  }
  status: 'pending' | 'approved' | 'ordered' | 'received' | 'partial' | 'cancelled'
  orderDate: string
  expectedDeliveryDate?: string
  actualDeliveryDate?: string
  items: Array<{
    itemId: string
    itemName: string
    itemCode: string
    quantity: number
    unitPrice: number
    totalPrice: number
    receivedQuantity?: number
    specifications?: string
  }>
  subtotal: number
  taxAmount: number
  discountAmount?: number
  totalAmount: number
  paymentTerms?: string
  deliveryAddress?: {
    addressLine1: string
    addressLine2?: string
    city: string
    state: string
    pincode: string
    country: string
  }
  notes?: string
  attachments?: Array<{
    fileName: string
    fileUrl: string
    uploadedAt: string
  }>
  approvedBy?: string
  approvedAt?: string
  receivedBy?: string
  receivedAt?: string
  companyId: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface PurchaseOrderStats {
  totalOrders: number
  pendingOrders: number
  approvedOrders: number
  receivedOrders: number
  cancelledOrders: number
  totalValue: number
  thisMonthOrders: number
  thisMonthValue: number
  ordersByStatus: {
    [status: string]: number
  }
  ordersBySupplier: Array<{
    supplierId: string
    supplierName: string
    orderCount: number
    totalValue: number
  }>
  recentOrders: PurchaseOrder[]
  topSuppliers: Array<{
    supplierId: string
    supplierName: string
    orderCount: number
    totalValue: number
  }>
}

export interface CreatePurchaseOrderRequest {
  supplierId: string
  expectedDeliveryDate?: string
  items: Array<{
    itemId: string
    quantity: number
    unitPrice: number
    specifications?: string
  }>
  paymentTerms?: string
  deliveryAddress?: {
    addressLine1: string
    addressLine2?: string
    city: string
    state: string
    pincode: string
    country: string
  }
  notes?: string
}

export const purchaseOrdersApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // Get all purchase orders with filtering and pagination
    getPurchaseOrders: builder.query<
      {
        success: boolean
        data: PurchaseOrder[]
        pagination: {
          page: number
          limit: number
          total: number
          pages: number
        }
      },
      {
        page?: number
        limit?: number
        search?: string
        status?: string
        supplierId?: string
        companyId?: string
      }
    >({
      query: (params = {}) => ({
        url: '/purchase-orders',
        method: 'GET',
        params,
      }),
      providesTags: ['PurchaseOrder'],
    }),

    // Get purchase order statistics
    getPurchaseOrderStats: builder.query<
      { success: boolean; data: PurchaseOrderStats },
      { companyId?: string }
    >({
      query: (params = {}) => ({
        url: '/purchase-orders/stats',
        method: 'GET',
        params,
      }),
      providesTags: ['PurchaseOrder'],
    }),

    // Get purchase order by ID
    getPurchaseOrderById: builder.query<
      { success: boolean; data: PurchaseOrder },
      string
    >({
      query: (orderId) => ({
        url: `/purchase-orders/${orderId}`,
        method: 'GET',
      }),
      providesTags: ['PurchaseOrder'],
    }),

    // Create new purchase order
    createPurchaseOrder: builder.mutation<
      { success: boolean; data: PurchaseOrder; message: string },
      CreatePurchaseOrderRequest
    >({
      query: (orderData) => ({
        url: '/purchase-orders',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['PurchaseOrder'],
    }),

    // Update purchase order
    updatePurchaseOrder: builder.mutation<
      { success: boolean; data: PurchaseOrder; message: string },
      { orderId: string; orderData: Partial<CreatePurchaseOrderRequest & { status?: string }> }
    >({
      query: ({ orderId, orderData }) => ({
        url: `/purchase-orders/${orderId}`,
        method: 'PUT',
        body: orderData,
      }),
      invalidatesTags: ['PurchaseOrder'],
    }),

    // Delete purchase order
    deletePurchaseOrder: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (orderId) => ({
        url: `/purchase-orders/${orderId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PurchaseOrder'],
    }),

    // Approve purchase order
    approvePurchaseOrder: builder.mutation<
      { success: boolean; data: PurchaseOrder; message: string },
      { orderId: string; notes?: string }
    >({
      query: ({ orderId, notes }) => ({
        url: `/purchase-orders/${orderId}/approve`,
        method: 'POST',
        body: { notes },
      }),
      invalidatesTags: ['PurchaseOrder'],
    }),

    // Receive purchase order items
    receivePurchaseOrder: builder.mutation<
      { success: boolean; data: PurchaseOrder; message: string },
      {
        orderId: string
        receivedItems: Array<{
          itemId: string
          receivedQuantity: number
          notes?: string
        }>
        notes?: string
      }
    >({
      query: ({ orderId, receivedItems, notes }) => ({
        url: `/purchase-orders/${orderId}/receive`,
        method: 'POST',
        body: { receivedItems, notes },
      }),
      invalidatesTags: ['PurchaseOrder', 'InventoryItem', 'StockMovement'],
    }),

    // Cancel purchase order
    cancelPurchaseOrder: builder.mutation<
      { success: boolean; data: PurchaseOrder; message: string },
      { orderId: string; reason?: string }
    >({
      query: ({ orderId, reason }) => ({
        url: `/purchase-orders/${orderId}/cancel`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['PurchaseOrder'],
    }),

    // Get purchase orders by supplier
    getPurchaseOrdersBySupplier: builder.query<
      {
        success: boolean
        data: PurchaseOrder[]
        pagination: {
          page: number
          limit: number
          total: number
          pages: number
        }
      },
      {
        supplierId: string
        page?: number
        limit?: number
        status?: string
      }
    >({
      query: ({ supplierId, ...params }) => ({
        url: `/purchase-orders/supplier/${supplierId}`,
        method: 'GET',
        params,
      }),
      providesTags: ['PurchaseOrder'],
    }),
  }),
})

export const {
  useGetPurchaseOrdersQuery,
  useGetPurchaseOrderStatsQuery,
  useGetPurchaseOrderByIdQuery,
  useCreatePurchaseOrderMutation,
  useUpdatePurchaseOrderMutation,
  useDeletePurchaseOrderMutation,
  useApprovePurchaseOrderMutation,
  useReceivePurchaseOrderMutation,
  useCancelPurchaseOrderMutation,
  useGetPurchaseOrdersBySupplierQuery,
} = purchaseOrdersApi
