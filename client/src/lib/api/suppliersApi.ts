import { baseApi } from './baseApi'

export interface Supplier {
  _id: string
  supplierCode: string
  companyName: string
  category: 'raw_materials' | 'packaging' | 'machinery' | 'services' | 'utilities'
  status: 'active' | 'inactive' | 'pending' | 'blacklisted'
  email?: string
  phone?: string
  website?: string
  address?: {
    street?: string
    city?: string
    state?: string
    pincode?: string
    country?: string
  }
  contactPerson?: {
    name: string
    designation?: string
    email?: string
    phone?: string
  }
  businessDetails?: {
    gstin?: string
    pan?: string
    registrationNumber?: string
    taxId?: string
  }
  bankDetails?: {
    accountName?: string
    accountNumber?: string
    bankName?: string
    ifscCode?: string
    swiftCode?: string
  }
  rating?: number
  totalOrders?: number
  totalSpend?: number
  lastOrderDate?: string
  onTimeDelivery?: number
  qualityScore?: number
  leadTime?: number
  paymentTerms?: string
  creditLimit?: number
  companyId: string
  createdAt: string
  updatedAt: string
}

export interface SupplierStats {
  totalSuppliers: number
  activeSuppliers: number
  inactiveSuppliers: number
  pendingSuppliers: number
  blacklistedSuppliers: number
  totalPurchaseOrders: number
  totalSpend: number
  averageOrderValue: number
  averageRating: number
  onTimeDeliveryRate: number
  newSuppliersThisMonth: number
  topSuppliers: Array<{
    _id: string
    companyName: string
    totalSpend: number
    totalOrders: number
    rating: number
  }>
  categoryDistribution: {
    [key: string]: number
  }
}

export interface CreateSupplierRequest {
  companyName: string
  category: 'raw_materials' | 'packaging' | 'machinery' | 'services' | 'utilities'
  email?: string
  phone?: string
  website?: string
  address?: {
    street?: string
    city?: string
    state?: string
    pincode?: string
    country?: string
  }
  contactPerson?: {
    name: string
    designation?: string
    email?: string
    phone?: string
  }
  businessDetails?: {
    gstin?: string
    pan?: string
    registrationNumber?: string
    taxId?: string
  }
  bankDetails?: {
    accountName?: string
    accountNumber?: string
    bankName?: string
    ifscCode?: string
    swiftCode?: string
  }
  paymentTerms?: string
  creditLimit?: number
}

export const suppliersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all suppliers with filtering and pagination
    getSuppliers: builder.query<
      {
        success: boolean
        data: Supplier[]
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
        category?: string
        companyId?: string
      }
    >({
      query: (params = {}) => ({
        url: '/suppliers',
        method: 'GET',
        params,
      }),
      providesTags: ['Supplier'],
    }),

    // Get supplier statistics
    getSupplierStats: builder.query<
      { success: boolean; data: SupplierStats },
      { companyId?: string }
    >({
      query: (params = {}) => ({
        url: '/suppliers/stats',
        method: 'GET',
        params,
      }),
      providesTags: ['Supplier'],
    }),

    // Get supplier by ID
    getSupplierById: builder.query<
      { success: boolean; data: Supplier },
      string
    >({
      query: (supplierId) => ({
        url: `/suppliers/${supplierId}`,
        method: 'GET',
      }),
      providesTags: ['Supplier'],
    }),

    // Create new supplier
    createSupplier: builder.mutation<
      { success: boolean; data: Supplier; message: string },
      CreateSupplierRequest
    >({
      query: (supplierData) => ({
        url: '/suppliers',
        method: 'POST',
        body: supplierData,
      }),
      invalidatesTags: ['Supplier'],
    }),

    // Update supplier
    updateSupplier: builder.mutation<
      { success: boolean; data: Supplier; message: string },
      { supplierId: string; supplierData: Partial<CreateSupplierRequest> }
    >({
      query: ({ supplierId, supplierData }) => ({
        url: `/suppliers/${supplierId}`,
        method: 'PUT',
        body: supplierData,
      }),
      invalidatesTags: ['Supplier'],
    }),

    // Delete supplier
    deleteSupplier: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (supplierId) => ({
        url: `/suppliers/${supplierId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Supplier'],
    }),

    // Get supplier purchase orders
    getSupplierOrders: builder.query<
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
        supplierId: string
        page?: number
        limit?: number
      }
    >({
      query: ({ supplierId, ...params }) => ({
        url: `/suppliers/${supplierId}/orders`,
        method: 'GET',
        params,
      }),
      providesTags: ['Supplier', 'Order'],
    }),

    // Update supplier status
    updateSupplierStatus: builder.mutation<
      { success: boolean; data: Supplier; message: string },
      { supplierId: string; status: 'active' | 'inactive' | 'pending' | 'blacklisted' }
    >({
      query: ({ supplierId, status }) => ({
        url: `/suppliers/${supplierId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Supplier'],
    }),

    // Update supplier rating
    updateSupplierRating: builder.mutation<
      { success: boolean; data: Supplier; message: string },
      { supplierId: string; rating: number; review?: string }
    >({
      query: ({ supplierId, rating, review }) => ({
        url: `/suppliers/${supplierId}/rating`,
        method: 'PATCH',
        body: { rating, review },
      }),
      invalidatesTags: ['Supplier'],
    }),
  }),
})

export const {
  useGetSuppliersQuery,
  useGetSupplierStatsQuery,
  useGetSupplierByIdQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
  useGetSupplierOrdersQuery,
  useUpdateSupplierStatusMutation,
  useUpdateSupplierRatingMutation,
} = suppliersApi
