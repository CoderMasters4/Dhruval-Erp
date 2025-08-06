import { baseApi } from '@/lib/api/baseApi'

export interface Company {
  _id: string
  companyCode: string
  companyName: string
  legalName: string
  contactInfo: {
    phones: Array<{
      type: string
      label: string
    }>
    emails: Array<{
      type: string
      label: string
    }>
    website?: string
    socialMedia?: {
      linkedin?: string
    }
  }
  isActive: boolean
  createdAt: string
  updatedAt?: string
  userCount: number
  activeUsers: number
  registrationDetails?: {
    gstin?: string
    pan?: string
    cin?: string
    udyogAadhar?: string
  }
  addresses?: {
    registeredOffice?: {
      street?: string
      area?: string
      city?: string
      state?: string
      pincode?: string
      country?: string
    }
    factoryAddress?: {
      street?: string
      area?: string
      city?: string
      state?: string
      pincode?: string
      country?: string
    }
  }
  stats?: {
    totalUsers?: number
    totalProducts?: number
    totalOrders?: number
    monthlyRevenue?: number
    totalProduction?: number
    activeProjects?: number
    completedOrders?: number
    pendingOrders?: number
    totalRevenue?: number
    monthlyGrowth?: number
  }
}

export interface CompaniesResponse {
  success: boolean
  data: Company[]
  total: number
}

export const companiesApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAllCompanies: builder.query<CompaniesResponse, void>({
      query: () => '/companies',
      providesTags: ['Company'],
    }),
    getCompanyById: builder.query<Company, string>({
      query: (id) => `/companies/${id}`,
      providesTags: (result, error, id) => [{ type: 'Company', id }],
    }),
    createCompany: builder.mutation<Company, Partial<Company>>({
      query: (company) => ({
        url: '/companies',
        method: 'POST',
        body: company,
      }),
      invalidatesTags: ['Company'],
    }),
    updateCompany: builder.mutation<Company, { id: string; company: Partial<Company> }>({
      query: ({ id, company }) => ({
        url: `/companies/${id}`,
        method: 'PUT',
        body: company,
      }),
      invalidatesTags: ['Company'],
    }),
    deleteCompany: builder.mutation<void, string>({
      query: (id) => ({
        url: `/companies/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Company'],
    }),
  }),
})

export const {
  useGetAllCompaniesQuery,
  useGetCompanyByIdQuery,
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  useDeleteCompanyMutation,
} = companiesApi
