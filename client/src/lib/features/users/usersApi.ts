import { baseApi } from '@/lib/api/baseApi'

export interface CompanyAccess {
  companyId: string
  companyName?: string
  role: string
  permissions?: {
    [module: string]: {
      [action: string]: boolean
    }
  }
  isActive: boolean
  joinedAt: Date
  leftAt?: Date
  remarks?: string
}

export interface User {
  _id: string
  id?: string // For compatibility
  username: string
  email: string
  personalInfo: {
    firstName: string
    lastName: string
    middleName?: string
    displayName?: string
    phone: string
    alternatePhone?: string
    dateOfBirth?: string
    gender?: 'Male' | 'Female' | 'Other'
    bloodGroup?: string
    profilePhoto?: string
    signature?: string
  }
  addresses?: {
    current?: {
      street?: string
      area?: string
      city?: string
      state?: string
      pincode?: string
      country?: string
    }
    permanent?: {
      street?: string
      area?: string
      city?: string
      state?: string
      pincode?: string
      country?: string
    }
  }
  companyAccess: CompanyAccess[]
  isSuperAdmin: boolean
  primaryCompanyId?: string
  primaryCompany?: {
    _id: string
    companyCode: string
    companyName: string
  }
  security?: {
    isEmailVerified: boolean
    is2FAEnabled: boolean
    lastLogin?: string
    loginAttempts: number
    lockUntil?: string
    passwordChangedAt?: string
  }
  preferences?: {
    language: string
    theme: string
    notifications: {
      email: boolean
      sms: boolean
      whatsapp: boolean
      push: boolean
    }
    dashboard: {
      defaultCompany?: string
      widgets: string[]
    }
  }
  isActive: boolean
  createdBy?: string
  createdAt: string
  updatedAt?: string

  // Legacy fields for backward compatibility
  name?: string
  role?: 'super_admin' | 'admin' | 'manager' | 'user'
  designation?: string
  isEmailVerified?: boolean
  is2FAEnabled?: boolean
  lastLogin?: string
  avatar?: string
  phone?: string
  department?: string
  companyId?: string
  permissions?: string[]
  loginAttempts?: number
  lockUntil?: string
  passwordChangedAt?: string
  isOnline?: boolean
}

export interface UsersResponse {
  success: boolean
  data: User[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface CreateUserRequest {
  username: string
  email: string
  password: string
  personalInfo: {
    firstName: string
    lastName: string
    middleName?: string
    displayName?: string
    phone: string
    alternatePhone?: string
    dateOfBirth?: string
    gender?: 'Male' | 'Female' | 'Other'
  }
  primaryCompanyId?: string
  companyAccess?: {
    companyId: string
    role: string
    permissions?: {
      [module: string]: {
        [action: string]: boolean
      }
    }
  }[]
  isSuperAdmin?: boolean

  // Legacy fields for backward compatibility
  role?: string
  department?: string
  designation?: string
  companyId?: string
  permissions?: string[]
}

export interface UpdateUserRequest {
  username?: string
  email?: string
  personalInfo?: {
    firstName?: string
    lastName?: string
    phone?: string
  }
  role?: User['role']
  isActive?: boolean
  department?: string
  designation?: string
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
      query: (params = {}) => ({
        url: '/users',
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          ...params
        },
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
    resetPassword: builder.mutation<void, { userId: string; newPassword: string }>({
      query: ({ userId, newPassword }) => ({
        // Target v2 route even if baseUrl is /api/v1
        url: `/../api/v2/users/${userId}/reset-password`,
        method: 'POST',
        body: { newPassword },
      }),
    }),
    changeUserPassword: builder.mutation<void, { userId: string; newPassword: string }>({
      query: ({ userId, newPassword }) => ({
        url: `/users/${userId}/change-password`,
        method: 'POST',
        body: { newPassword },
      }),
    }),
    toggle2FA: builder.mutation<void, { userId: string; enable: boolean }>({
      query: ({ userId, enable }) => ({
        url: `/users/${userId}/toggle-2fa`,
        method: 'POST',
        body: { enable },
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
  useChangeUserPasswordMutation,
  useToggle2FAMutation,
  useToggleUserStatusMutation,
} = usersApi
