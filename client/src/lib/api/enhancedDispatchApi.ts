import { baseApi } from './baseApi'

export interface Dispatch {
  _id: string
  title: string
  description: string
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo: string | { _id: string; name: string; email: string }
  companyId: string | { _id: string; name: string }
  createdAt: string
  updatedAt: string
  dueDate: string
  location: string
  vehicleId?: string
  vehicleNumber?: string
}

export interface CreateDispatchRequest {
  title: string
  description: string
  status?: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo: string
  companyId?: string
  dueDate: string
  location: string
  vehicleId?: string
  vehicleNumber?: string
}

export interface UpdateDispatchRequest {
  id: string
  title?: string
  description?: string
  status?: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo?: string
  dueDate?: string
  location?: string
  vehicleId?: string
  vehicleNumber?: string
}

export interface Company {
  _id: string
  name: string
}

export interface User {
  _id: string
  name: string
  email: string
  role: string
}

export const enhancedDispatchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDispatches: builder.query<Dispatch[], { status?: string; priority?: string; companyId?: string; assignedTo?: string; search?: string }>({
      query: (params) => ({
        url: '/enhanced-dispatch',
        params,
      }),
      providesTags: ['Dispatch'],
    }),

    getDispatchById: builder.query<Dispatch, string>({
      query: (id) => `/enhanced-dispatch/${id}`,
      providesTags: (result, error, id) => [{ type: 'Dispatch', id }],
    }),

    createDispatch: builder.mutation<Dispatch, CreateDispatchRequest>({
      query: (dispatch) => ({
        url: '/enhanced-dispatch',
        method: 'POST',
        body: dispatch,
      }),
      invalidatesTags: ['Dispatch'],
    }),

    updateDispatch: builder.mutation<Dispatch, UpdateDispatchRequest>({
      query: ({ id, ...updateData }) => ({
        url: `/enhanced-dispatch/${id}`,
        method: 'PUT',
        body: updateData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Dispatch', id },
        'Dispatch',
      ],
    }),

    deleteDispatch: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/enhanced-dispatch/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Dispatch'],
    }),

    getCompanies: builder.query<Company[], void>({
      query: () => '/enhanced-dispatch/companies/list',
      providesTags: ['Company'],
    }),

    getUsers: builder.query<User[], void>({
      query: () => '/enhanced-dispatch/users/list',
      providesTags: ['User'],
    }),
  }),
})

export const {
  useGetDispatchesQuery,
  useGetDispatchByIdQuery,
  useCreateDispatchMutation,
  useUpdateDispatchMutation,
  useDeleteDispatchMutation,
  useGetCompaniesQuery,
  useGetUsersQuery,
} = enhancedDispatchApi
