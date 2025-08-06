import { baseApi } from './baseApi'

export interface TwoFactorSetup {
  secret: string
  qrCodeUrl: string
  backupCodes: string[]
}

export interface TwoFactorStatus {
  isEnabled: boolean
  backupCodesCount: number
  lastUsed?: string
}

export interface VerifyTwoFactorRequest {
  token: string
  backupCode?: string
}

export interface VerifyTwoFactorResponse {
  success: boolean
  message: string
}

export interface DisableTwoFactorRequest {
  password: string
  token?: string
}

export const twoFactorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get 2FA status
    getTwoFactorStatus: builder.query<
      { success: boolean; data: TwoFactorStatus },
      void
    >({
      query: () => ({
        url: '/auth/2fa/status',
        method: 'GET',
      }),
      providesTags: ['User'],
    }),

    // Setup 2FA - Generate secret and QR code
    setupTwoFactor: builder.mutation<
      { success: boolean; data: TwoFactorSetup; message: string },
      void
    >({
      query: () => ({
        url: '/auth/2fa/setup',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),

    // Enable 2FA - Verify setup token
    enableTwoFactor: builder.mutation<
      { success: boolean; data: { backupCodes: string[] }; message: string },
      { token: string }
    >({
      query: (body) => ({
        url: '/auth/2fa/enable',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    // Disable 2FA
    disableTwoFactor: builder.mutation<
      { success: boolean; message: string },
      DisableTwoFactorRequest
    >({
      query: (body) => ({
        url: '/auth/2fa/disable',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    // Verify 2FA token during login
    verifyTwoFactor: builder.mutation<
      VerifyTwoFactorResponse,
      VerifyTwoFactorRequest
    >({
      query: (body) => ({
        url: '/auth/2fa/verify',
        method: 'POST',
        body,
      }),
    }),

    // Generate new backup codes
    generateBackupCodes: builder.mutation<
      { success: boolean; data: { backupCodes: string[] }; message: string },
      { password: string }
    >({
      query: (body) => ({
        url: '/auth/2fa/backup-codes',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    // Test 2FA token (for setup verification)
    testTwoFactor: builder.mutation<
      { success: boolean; message: string },
      { secret: string; token: string }
    >({
      query: (body) => ({
        url: '/auth/2fa/test',
        method: 'POST',
        body,
      }),
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetTwoFactorStatusQuery,
  useSetupTwoFactorMutation,
  useEnableTwoFactorMutation,
  useDisableTwoFactorMutation,
  useVerifyTwoFactorMutation,
  useGenerateBackupCodesMutation,
  useTestTwoFactorMutation,
} = twoFactorApi
