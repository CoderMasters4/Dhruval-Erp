import { baseApi } from './baseApi'

export interface Warehouse {
  _id: string
  warehouseCode: string
  warehouseName: string
  warehouseType: 'main' | 'distribution' | 'storage' | 'cold_storage'
  status: 'active' | 'inactive' | 'maintenance'
  address: {
    addressLine1: string
    addressLine2?: string
    city: string
    state: string
    pincode: string
    country: string
    coordinates?: {
      latitude: number
      longitude: number
    }
  }
  capacity: {
    totalCapacity: number
    availableCapacity: number
    utilizationPercentage: number
    unit: string
  }
  manager?: {
    name: string
    email: string
    phone: string
  }
  operatingHours?: {
    openTime: string
    closeTime: string
    workingDays: string[]
  }
  facilities?: string[]
  itemCount?: number
  companyId: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface WarehouseStats {
  totalWarehouses: number
  activeWarehouses: number
  inactiveWarehouses: number
  maintenanceWarehouses: number
  totalCapacity: number
  totalUtilizedCapacity: number
  averageUtilization: number
  warehousesByType: {
    [type: string]: number
  }
  warehousesByStatus: {
    [status: string]: number
  }
  topWarehouses: Array<{
    _id: string
    warehouseName: string
    utilizationPercentage: number
    itemCount: number
  }>
}

export interface CreateWarehouseRequest {
  warehouseName: string
  warehouseType: 'main' | 'distribution' | 'storage' | 'cold_storage'
  address: {
    addressLine1: string
    addressLine2?: string
    city: string
    state: string
    pincode: string
    country: string
    coordinates?: {
      latitude: number
      longitude: number
    }
  }
  capacity: {
    totalCapacity: number
    unit: string
  }
  manager?: {
    name: string
    email: string
    phone: string
  }
  operatingHours?: {
    openTime: string
    closeTime: string
    workingDays: string[]
  }
  facilities?: string[]
}

export const warehousesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all warehouses with filtering and pagination
    getWarehouses: builder.query<
      {
        success: boolean
        data: Warehouse[]
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
        type?: string
        companyId?: string
      }
    >({
      query: (params = {}) => ({
        url: '/warehouses',
        method: 'GET',
        params,
      }),
      providesTags: ['Warehouse'],
    }),

    // Get warehouse statistics
    getWarehouseStats: builder.query<
      { success: boolean; data: WarehouseStats },
      { companyId?: string }
    >({
      query: (params = {}) => ({
        url: '/warehouses/stats',
        method: 'GET',
        params,
      }),
      providesTags: ['Warehouse'],
    }),

    // Get warehouse by ID
    getWarehouseById: builder.query<
      { success: boolean; data: Warehouse },
      string
    >({
      query: (warehouseId) => ({
        url: `/warehouses/${warehouseId}`,
        method: 'GET',
      }),
      providesTags: ['Warehouse'],
    }),

    // Create new warehouse
    createWarehouse: builder.mutation<
      { success: boolean; data: Warehouse; message: string },
      CreateWarehouseRequest
    >({
      query: (warehouseData) => ({
        url: '/warehouses',
        method: 'POST',
        body: warehouseData,
      }),
      invalidatesTags: ['Warehouse'],
    }),

    // Update warehouse
    updateWarehouse: builder.mutation<
      { success: boolean; data: Warehouse; message: string },
      { warehouseId: string; warehouseData: Partial<CreateWarehouseRequest> }
    >({
      query: ({ warehouseId, warehouseData }) => ({
        url: `/warehouses/${warehouseId}`,
        method: 'PUT',
        body: warehouseData,
      }),
      invalidatesTags: ['Warehouse'],
    }),

    // Delete warehouse
    deleteWarehouse: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (warehouseId) => ({
        url: `/warehouses/${warehouseId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Warehouse'],
    }),

    // Update warehouse status
    updateWarehouseStatus: builder.mutation<
      { success: boolean; data: Warehouse; message: string },
      { warehouseId: string; status: 'active' | 'inactive' | 'maintenance' }
    >({
      query: ({ warehouseId, status }) => ({
        url: `/warehouses/${warehouseId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Warehouse'],
    }),

    // Get warehouse inventory
    getWarehouseInventory: builder.query<
      {
        success: boolean
        data: any[]
        pagination: {
          page: number
          limit: number
          total: number
          pages: number
        }
      },
      {
        warehouseId: string
        page?: number
        limit?: number
        search?: string
      }
    >({
      query: ({ warehouseId, ...params }) => ({
        url: `/warehouses/${warehouseId}/inventory`,
        method: 'GET',
        params,
      }),
      providesTags: ['Warehouse', 'InventoryItem'],
    }),

    // Transfer inventory between warehouses
    transferInventory: builder.mutation<
      { success: boolean; message: string },
      {
        fromWarehouseId: string
        toWarehouseId: string
        items: Array<{
          itemId: string
          quantity: number
        }>
        notes?: string
      }
    >({
      query: (transferData) => ({
        url: '/warehouses/transfer',
        method: 'POST',
        body: transferData,
      }),
      invalidatesTags: ['Warehouse', 'InventoryItem', 'StockMovement'],
    }),
  }),
})

export const {
  useGetWarehousesQuery,
  useGetWarehouseStatsQuery,
  useGetWarehouseByIdQuery,
  useCreateWarehouseMutation,
  useUpdateWarehouseMutation,
  useDeleteWarehouseMutation,
  useUpdateWarehouseStatusMutation,
  useGetWarehouseInventoryQuery,
  useTransferInventoryMutation,
} = warehousesApi
