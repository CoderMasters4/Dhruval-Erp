import { baseApi } from './baseApi'

export interface InventoryItem {
  _id: string
  itemCode: string
  itemName: string
  category: string
  description: string
  currentStock: number
  minStock: number
  maxStock: number
  unit: string
  unitPrice: number
  totalValue: number
  supplier: string
  location: string
  lastUpdated: string
  status: 'low_stock' | 'overstock' | 'normal'
  companyId: string
  createdAt: string
}

export interface InventoryStats {
  totalItems: number
  totalValue: number
  lowStockItems: number
  overstockItems: number
  normalStockItems: number
  categories: {
    [key: string]: number
  }
  totalCategories: number
  averageValue: number
  recentMovements: number
  turnoverRate: string
  itemsGrowth: number
  lowStockChange: number
  valueGrowth: number
  totalMovements: number
  todayMovements: number
  inboundMovements: number
  outboundMovements: number
  pendingMovements: number
}

export interface InventoryAlert {
  _id: string
  itemCode: string
  itemName: string
  currentStock: number
  minStock: number
  shortage: number
  category: string
  supplier: string
  urgency: 'critical' | 'warning'
  lastUpdated: string
}

export interface StockMovement {
  _id: string
  itemId: string
  type: 'in' | 'out' | 'adjustment'
  quantity: number
  reference: string
  notes: string
  date: string
  recordedBy: string
}

export interface CreateInventoryItemRequest {
  itemCode: string
  itemName: string
  category: string
  description: string
  minStock: number
  maxStock: number
  unit: string
  unitPrice: number
  supplier: string
  location: string
}

export const inventoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all inventory items with filtering and pagination
    getInventoryItems: builder.query<
      {
        success: boolean
        data: InventoryItem[]
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
        category?: string
        status?: string
        sortBy?: string
        sortOrder?: string
        companyId?: string
      }
    >({
      query: (params = {}) => ({
        url: '/inventory',
        method: 'GET',
        params,
      }),
      providesTags: ['Inventory'],
    }),

    // Get inventory statistics
    getInventoryStats: builder.query<
      { success: boolean; data: InventoryStats },
      { companyId?: string }
    >({
      query: (params = {}) => ({
        url: '/inventory/stats',
        method: 'GET',
        params,
      }),
      providesTags: ['Inventory'],
    }),

    // Get low stock alerts
    getInventoryAlerts: builder.query<
      { success: boolean; data: InventoryAlert[]; total: number },
      { companyId?: string }
    >({
      query: (params = {}) => ({
        url: '/inventory/alerts',
        method: 'GET',
        params,
      }),
      providesTags: ['Inventory'],
    }),

    // Get inventory item by ID
    getInventoryItemById: builder.query<
      { success: boolean; data: InventoryItem },
      string
    >({
      query: (itemId) => ({
        url: `/inventory/${itemId}`,
        method: 'GET',
      }),
      providesTags: ['Inventory'],
    }),

    // Create new inventory item
    createInventoryItem: builder.mutation<
      { success: boolean; data: InventoryItem; message: string },
      CreateInventoryItemRequest
    >({
      query: (itemData) => ({
        url: '/inventory',
        method: 'POST',
        body: itemData,
      }),
      invalidatesTags: ['Inventory'],
    }),

    // Update inventory item
    updateInventoryItem: builder.mutation<
      { success: boolean; data: InventoryItem; message: string },
      { itemId: string; itemData: Partial<CreateInventoryItemRequest> }
    >({
      query: ({ itemId, itemData }) => ({
        url: `/inventory/${itemId}`,
        method: 'PUT',
        body: itemData,
      }),
      invalidatesTags: ['Inventory'],
    }),

    // Get inventory movements
    getInventoryMovements: builder.query<
      {
        success: boolean
        data: StockMovement[]
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
        type?: string
        status?: string
        itemId?: string
        startDate?: string
        endDate?: string
        companyId?: string
      }
    >({
      query: (params = {}) => ({
        url: '/inventory/movements',
        method: 'GET',
        params,
      }),
      providesTags: ['Inventory'],
    }),

    // Record stock movement
    recordStockMovement: builder.mutation<
      { success: boolean; data: StockMovement; message: string },
      {
        itemId: string
        type: 'in' | 'out' | 'adjustment'
        quantity: number
        reference: string
        notes?: string
      }
    >({
      query: ({ itemId, ...movementData }) => ({
        url: `/inventory/${itemId}/movement`,
        method: 'POST',
        body: movementData,
      }),
      invalidatesTags: ['Inventory'],
    }),

    // Delete inventory item
    deleteInventoryItem: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (itemId) => ({
        url: `/inventory/${itemId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Inventory'],
    }),
  }),
})

export const {
  useGetInventoryItemsQuery,
  useGetInventoryStatsQuery,
  useGetInventoryAlertsQuery,
  useGetInventoryItemByIdQuery,
  useGetInventoryMovementsQuery,
  useCreateInventoryItemMutation,
  useUpdateInventoryItemMutation,
  useRecordStockMovementMutation,
  useDeleteInventoryItemMutation,
} = inventoryApi
