import { baseApi } from '@/lib/api/baseApi'

export interface User {
  _id: string
  name: string
  email: string
  role: 'super_admin' | 'admin' | 'manager' | 'user'
  isActive: boolean
  isEmailVerified: boolean
  is2FAEnabled: boolean
  lastLogin?: string
  createdAt: string
  updatedAt?: string
  avatar?: string
  phone?: string
  department?: string
  companyId?: string
  permissions?: string[]
  loginAttempts?: number
  lockUntil?: string
  passwordChangedAt?: string
}

export interface UsersResponse {
  success: boolean
  data: User[]
  total: number
  page?: number
  limit?: number
}

export interface CreateUserRequest {
  name: string
  email: string
  password: string
  role: User['role']
  phone?: string
  department?: string
  companyId?: string
  permissions?: string[]
}

export interface UpdateUserRequest {
  name?: string
  email?: string
  role?: User['role']
  isActive?: boolean
  phone?: string
  department?: string
  permissions?: string[]
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ResetPasswordRequest {
  newPassword: string
  confirmPassword: string
}

export interface Toggle2FARequest {
  enable: boolean
  password: string
}

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllUsers: builder.query<UsersResponse, { page?: number; limit?: number; search?: string; role?: string; status?: string }>({
      query: (params) => ({
        url: '/users',
        params,
      }),
      providesTags: ['User'],
    }),
    getUserById: builder.query<User, string>({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),
    createUser: builder.mutation<User, CreateUserRequest>({
      query: (user) => ({
        url: '/users',
        method: 'POST',
        body: user,
      }),
      invalidatesTags: ['User'],
    }),
    updateUser: builder.mutation<User, { id: string; user: UpdateUserRequest }>({
      query: ({ id, user }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: user,
      }),
      invalidatesTags: ['User'],
    }),
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
    changePassword: builder.mutation<void, { id: string; passwords: ChangePasswordRequest }>({
      query: ({ id, passwords }) => ({
        url: `/users/${id}/change-password`,
        method: 'POST',
        body: passwords,
      }),
    }),
    resetPassword: builder.mutation<void, { id: string; passwords: ResetPasswordRequest }>({
      query: ({ id, passwords }) => ({
        url: `/users/${id}/reset-password`,
        method: 'POST',
        body: passwords,
      }),
    }),
    toggle2FA: builder.mutation<void, { id: string; data: Toggle2FARequest }>({
      query: ({ id, data }) => ({
        url: `/users/${id}/toggle-2fa`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    toggleUserStatus: builder.mutation<User, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `/users/${id}/toggle-status`,
        method: 'POST',
        body: { isActive },
      }),
      invalidatesTags: ['User'],
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useChangePasswordMutation,
  useResetPasswordMutation,
  useToggle2FAMutation,
  useToggleUserStatusMutation,
} = usersApi
