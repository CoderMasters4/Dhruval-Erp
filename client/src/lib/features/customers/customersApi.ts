import { baseApi } from '@/lib/api/baseApi'

export interface Customer {
  _id: string
  customerCode: string
  name: string
  email: string
  phone: string
  company?: string
  contactPerson?: string
  isActive: boolean
  customerType: 'individual' | 'business'
  creditLimit?: number
  paymentTerms?: string
  taxId?: string
  website?: string
  address: {
    street?: string
    city?: string
    state?: string
    country?: string
    zipCode?: string
  }
  billingAddress?: {
    street?: string
    city?: string
    state?: string
    country?: string
    zipCode?: string
  }
  notes?: string
  tags?: string[]
  createdAt: string
  updatedAt?: string
  lastOrderDate?: string
  totalOrders?: number
  totalSpent?: number
  averageOrderValue?: number
}

export interface CustomersResponse {
  success: boolean
  data: Customer[]
  total: number
  page?: number
  limit?: number
}

export interface CreateCustomerRequest {
  name: string
  email: string
  phone: string
  company?: string
  contactPerson?: string
  customerType: Customer['customerType']
  creditLimit?: number
  paymentTerms?: string
  taxId?: string
  website?: string
  address: {
    street?: string
    city?: string
    state?: string
    country?: string
    zipCode?: string
  }
  billingAddress?: {
    street?: string
    city?: string
    state?: string
    country?: string
    zipCode?: string
  }
  notes?: string
  tags?: string[]
}

export interface UpdateCustomerRequest {
  name?: string
  email?: string
  phone?: string
  company?: string
  contactPerson?: string
  customerType?: Customer['customerType']
  creditLimit?: number
  paymentTerms?: string
  taxId?: string
  website?: string
  address?: {
    street?: string
    city?: string
    state?: string
    country?: string
    zipCode?: string
  }
  billingAddress?: {
    street?: string
    city?: string
    state?: string
    country?: string
    zipCode?: string
  }
  notes?: string
  tags?: string[]
  isActive?: boolean
}

export const customersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllCustomers: builder.query<CustomersResponse, { 
      page?: number
      limit?: number
      search?: string
      customerType?: string
      status?: string
      sortBy?: string
      sortOrder?: 'asc' | 'desc'
    }>({
      query: (params) => ({
        url: '/customers',
        params,
      }),
      providesTags: ['Customer'],
    }),
    getCustomerById: builder.query<Customer, string>({
      query: (id) => `/customers/${id}`,
      providesTags: (result, error, id) => [{ type: 'Customer', id }],
    }),
    createCustomer: builder.mutation<Customer, CreateCustomerRequest>({
      query: (customer) => ({
        url: '/customers',
        method: 'POST',
        body: customer,
      }),
      invalidatesTags: ['Customer'],
    }),
    updateCustomer: builder.mutation<Customer, { id: string; customer: UpdateCustomerRequest }>({
      query: ({ id, customer }) => ({
        url: `/customers/${id}`,
        method: 'PUT',
        body: customer,
      }),
      invalidatesTags: ['Customer'],
    }),
    deleteCustomer: builder.mutation<void, string>({
      query: (id) => ({
        url: `/customers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Customer'],
    }),
    toggleCustomerStatus: builder.mutation<Customer, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `/customers/${id}/toggle-status`,
        method: 'POST',
        body: { isActive },
      }),
      invalidatesTags: ['Customer'],
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetAllCustomersQuery,
  useGetCustomerByIdQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useToggleCustomerStatusMutation,
} = customersApi
