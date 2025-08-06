import { useSelector } from 'react-redux'
import { selectCurrentUser, selectIsSuperAdmin } from '@/lib/features/auth/authSlice'

export interface DashboardPermissions {
  canViewFinancials: boolean
  canViewProduction: boolean
  canViewInventory: boolean
  canViewOrders: boolean
  canViewCustomers: boolean
  canViewSuppliers: boolean
  canViewUsers: boolean
  canViewReports: boolean
  canViewAnalytics: boolean
  canViewQuality: boolean
  canViewMaintenance: boolean
  canViewSecurity: boolean
  canViewHR: boolean
  canManageSystem: boolean
}

export const useDashboardPermissions = (): DashboardPermissions => {
  const user = useSelector(selectCurrentUser)
  const isSuperAdmin = useSelector(selectIsSuperAdmin)

  if (!user) {
    return {
      canViewFinancials: false,
      canViewProduction: false,
      canViewInventory: false,
      canViewOrders: false,
      canViewCustomers: false,
      canViewSuppliers: false,
      canViewUsers: false,
      canViewReports: false,
      canViewAnalytics: false,
      canViewQuality: false,
      canViewMaintenance: false,
      canViewSecurity: false,
      canViewHR: false,
      canManageSystem: false,
    }
  }

  // Super Admin has all permissions
  if (isSuperAdmin) {
    return {
      canViewFinancials: true,
      canViewProduction: true,
      canViewInventory: true,
      canViewOrders: true,
      canViewCustomers: true,
      canViewSuppliers: true,
      canViewUsers: true,
      canViewReports: true,
      canViewAnalytics: true,
      canViewQuality: true,
      canViewMaintenance: true,
      canViewSecurity: true,
      canViewHR: true,
      canManageSystem: true,
    }
  }

  // Get current company access
  const currentCompanyAccess = user.companyAccess?.find(access => access.isActive)
  const permissions = currentCompanyAccess?.permissions as Record<string, any> | undefined

  if (!permissions) {
    return {
      canViewFinancials: false,
      canViewProduction: false,
      canViewInventory: false,
      canViewOrders: false,
      canViewCustomers: false,
      canViewSuppliers: false,
      canViewUsers: false,
      canViewReports: false,
      canViewAnalytics: false,
      canViewQuality: false,
      canViewMaintenance: false,
      canViewSecurity: false,
      canViewHR: false,
      canManageSystem: false,
    }
  }

  return {
    canViewFinancials: permissions.financial?.view || false,
    canViewProduction: permissions.production?.view || false,
    canViewInventory: permissions.inventory?.view || false,
    canViewOrders: permissions.orders?.view || false,
    canViewCustomers: permissions.customers?.view || false,
    canViewSuppliers: permissions.suppliers?.view || false,
    canViewUsers: permissions.users?.view || false,
    canViewReports: permissions.financial?.viewReports || permissions.production?.viewReports || permissions.inventory?.viewReports || false,
    canViewAnalytics: permissions.analytics?.businessAnalytics || false,
    canViewQuality: permissions.quality?.qualityControl || false,
    canViewMaintenance: permissions.maintenance?.equipmentManagement || false,
    canViewSecurity: permissions.security?.gateManagement || false,
    canViewHR: permissions.hr?.viewEmployees || false,
    canManageSystem: permissions.admin?.systemSettings || false,
  }
}
