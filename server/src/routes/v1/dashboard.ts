import { Router, Request, Response } from 'express'
import { Types } from 'mongoose'
import { authenticate, requireCompany } from '../../middleware/auth'
import User from '../../models/User'
import Company from '../../models/Company'
import CustomerOrder from '../../models/CustomerOrder'
import ProductionOrder from '../../models/ProductionOrder'
import InventoryItem from '../../models/InventoryItem'
import Customer from '../../models/Customer'
import Supplier from '../../models/Supplier'
import Invoice from '../../models/Invoice'
import Quotation from '../../models/Quotation'
import Attendance from '../../models/Attendance'
import Visitor from '../../models/Visitor'

// Use the existing Express namespace extension from auth middleware
type AuthenticatedRequest = Request

// Dashboard data interfaces
interface DashboardOverview {
  totalCompanies?: number
  totalUsers?: number
  activeCompanies?: number
  systemHealth?: number
  systemUptime?: string
  totalOrders: number
  totalRevenue: number
  totalCustomers: number
  totalInventory: number
  totalProduction: number
  totalEmployees?: number
  activeProduction?: number
  pendingOrders?: number
  completedOrders?: number
  lowStockItems?: number
  totalQuotations?: number
  totalInvoices?: number
  totalSuppliers?: number
  todayAttendance?: number
  todayVisitors?: number
}

interface PerformanceMetrics {
  cpuUsage?: number
  memoryUsage?: number
  diskUsage?: number
  networkLatency?: number
  orderCompletion: number
  customerSatisfaction: number
  inventoryTurnover: number
  productionEfficiency: number
  attendanceRate?: number
}

interface DashboardData {
  overview: DashboardOverview
  recentActivity: any[]
  alerts: any[]
  systemAlerts?: any[]
  performanceMetrics: PerformanceMetrics
  trends?: {
    orders: { date: string; count: number; revenue: number }[]
    production: { date: string; completed: number; efficiency: number }[]
    inventory: { date: string; stockLevel: number; turnover: number }[]
  }
  insights?: {
    topProducts: Array<{ name: string; sales: number; revenue: number }>
    topCustomers: Array<{ name: string; orders: number; totalSpent: number }>
    lowStockAlerts: Array<{ name: string; currentStock: number; reorderLevel: number }>
  }
}

const router = Router()

// Middlewares
router.use(authenticate)
router.use(requireCompany)

/**
 * Helper: start of today as Date
 */
const startOfToday = (): Date => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Helper: start of week as Date
 */
const startOfWeek = (): Date => {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Helper: start of month as Date
 */
const startOfMonth = (): Date => {
  const d = new Date()
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Helper: safely extract revenue from aggregation
 */
const extractRevenue = (agg: any[]): number => agg?.[0]?.total ?? 0

/**
 * Helper: safely extract count from aggregation
 */
const extractCount = (agg: any[]): number => agg?.[0]?.count ?? 0

/**
 * Helper: calculate percentage with safe division
 */
const calculatePercentage = (numerator: number, denominator: number): number => {
  if (denominator === 0) return 0
  return Math.round((numerator / denominator) * 100)
}

/**
 * Helper: generate trend data for the last 7 days
 */
const generateTrendData = async (companyId: string, model: any, matchField: string, dateField: string) => {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const pipeline = [
    { $match: { [matchField]: companyId, [dateField]: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: `$${dateField}` }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id': 1 } }
  ]
  
  return await model.aggregate(pipeline)
}

// =============================================
// MAIN DASHBOARD ENDPOINT
// =============================================
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { companyId, isSuperAdmin } = req.user
    let dashboardData: DashboardData

    if (isSuperAdmin) {
      // Super Admin Dashboard - System-wide overview
      const [
        totalCompanies,
        totalUsers,
        activeCompanies,
        totalOrders,
        totalRevenueAgg,
        totalCustomers,
        totalInventory,
        totalProduction,
        systemMetrics
      ] = await Promise.all([
        Company.countDocuments({ isActive: true }),
        User.countDocuments({ isActive: true }),
        Company.countDocuments({ isActive: true, status: 'active' }),
        CustomerOrder.countDocuments(),
        CustomerOrder.aggregate([
          { $match: { status: { $in: ['delivered', 'dispatched'] } } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]),
        Customer.countDocuments(),
        InventoryItem.countDocuments(),
        ProductionOrder.countDocuments(),
        // Mock system metrics (in real app, these would come from system monitoring)
        Promise.resolve({
          cpuUsage: Math.floor(Math.random() * 30) + 30, // 30-60%
          memoryUsage: Math.floor(Math.random() * 40) + 40, // 40-80%
          diskUsage: Math.floor(Math.random() * 30) + 20, // 20-50%
          networkLatency: Math.floor(Math.random() * 20) + 5 // 5-25ms
        })
      ])

              dashboardData = {
          overview: {
            totalCompanies,
            totalUsers,
            activeCompanies,
            systemHealth: 98,
            systemUptime: '99.9%',
            totalOrders,
            totalRevenue: extractRevenue(totalRevenueAgg),
            totalCustomers,
            totalInventory,
            totalProduction
          },
          recentActivity: [],
          alerts: [],
          systemAlerts: [],
          performanceMetrics: {
            cpuUsage: systemMetrics.cpuUsage,
            memoryUsage: systemMetrics.memoryUsage,
            diskUsage: systemMetrics.diskUsage,
            networkLatency: systemMetrics.networkLatency,
            orderCompletion: 85,
            customerSatisfaction: 92,
            inventoryTurnover: 4.2,
            productionEfficiency: 78
          }
        }
    } else if (companyId) {
      // Company-specific Dashboard
      const [
        companyUsers,
        totalOrders,
        totalRevenueAgg,
        totalCustomers,
        totalInventory,
        totalProduction,
        pendingOrders,
        completedOrders,
        lowStockItems,
        activeProduction,
        totalQuotations,
        totalInvoices,
        totalSuppliers,
        todayAttendance,
        todayVisitors,
        weekOrders,
        weekProduction,
        weekInventory
      ] = await Promise.all([
        User.countDocuments({
          'companyAccess.companyId': companyId,
          'companyAccess.isActive': true,
          isActive: true
        }),
        CustomerOrder.countDocuments({ companyId }),
        CustomerOrder.aggregate([
          { $match: { companyId, status: { $in: ['delivered', 'dispatched'] } } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]),
        Customer.countDocuments({ companyId }),
        InventoryItem.countDocuments({ companyId }),
        ProductionOrder.countDocuments({ companyId }),
        CustomerOrder.countDocuments({ companyId, status: 'pending' }),
        CustomerOrder.countDocuments({ companyId, status: 'delivered' }),
        InventoryItem.countDocuments({
          companyId,
          $expr: { $lte: ['$stock.currentStock', '$stock.reorderLevel'] }
        }),
        ProductionOrder.countDocuments({ companyId, status: 'in_production' }),
        Quotation.countDocuments({ companyId }),
        Invoice.countDocuments({ companyId }),
        Supplier.countDocuments({ companyId }),
        Attendance.countDocuments({
          companyId,
          date: { $gte: startOfToday() }
        }),
        Visitor.countDocuments({
          companyId,
          checkInTime: { $gte: startOfToday() }
        }),
        generateTrendData(companyId.toString(), CustomerOrder, 'companyId', 'createdAt'),
        generateTrendData(companyId.toString(), ProductionOrder, 'companyId', 'createdAt'),
        generateTrendData(companyId.toString(), InventoryItem, 'companyId', 'updatedAt')
      ])

      // Calculate performance metrics
      const orderCompletionRate = calculatePercentage(completedOrders, totalOrders)
      const attendanceRate = calculatePercentage(todayAttendance, companyUsers)

      // Generate insights
      const topProducts = await CustomerOrder.aggregate([
        { $match: { companyId: companyId, status: 'delivered' } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.productId',
            name: { $first: '$items.productName' },
            sales: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.quantity', '$items.unitPrice'] } }
          }
        },
        { $sort: { revenue: -1 } },
        { $limit: 5 }
      ])

      const topCustomers = await CustomerOrder.aggregate([
        { $match: { companyId: companyId, status: 'delivered' } },
        {
          $group: {
            _id: '$customerId',
            name: { $first: '$customerName' },
            orders: { $sum: 1 },
            totalSpent: { $sum: '$totalAmount' }
          }
        },
        { $sort: { totalSpent: -1 } },
        { $limit: 5 }
      ])

      const lowStockAlerts = await InventoryItem.aggregate([
        {
          $match: {
            companyId: companyId,
            $expr: { $lte: ['$stock.currentStock', '$stock.reorderLevel'] }
          }
        },
        {
          $project: {
            name: 1,
            currentStock: '$stock.currentStock',
            reorderLevel: '$stock.reorderLevel'
          }
        },
        { $limit: 10 }
      ])

      dashboardData = {
        overview: {
          totalEmployees: companyUsers,
          totalOrders,
          totalRevenue: extractRevenue(totalRevenueAgg),
          totalCustomers,
          totalInventory,
          totalProduction,
          activeProduction,
          pendingOrders,
          completedOrders,
          lowStockItems,
          totalQuotations,
          totalInvoices,
          totalSuppliers,
          todayAttendance,
          todayVisitors
        },
        recentActivity: [],
        alerts: [],
        performanceMetrics: {
          orderCompletion: orderCompletionRate,
          customerSatisfaction: 92,
          inventoryTurnover: 4.2,
          productionEfficiency: 78,
          attendanceRate
        },
        trends: {
          orders: weekOrders.map((item: any) => ({
            date: item._id,
            count: item.count,
            revenue: 0 // Would need additional aggregation for revenue
          })),
          production: weekProduction.map((item: any) => ({
            date: item._id,
            completed: item.count,
            efficiency: 0 // Would need additional calculation
          })),
          inventory: weekInventory.map((item: any) => ({
            date: item._id,
            stockLevel: item.count,
            turnover: 0 // Would need additional calculation
          }))
        },
        insights: {
          topProducts,
          topCustomers,
          lowStockAlerts
        }
      }
    } else {
      return res.status(400).json({
        success: false,
        error: 'Company context required',
        message: 'User must be associated with a company'
      })
    }

    res.json({ 
      success: true, 
      data: dashboardData,
      timestamp: new Date().toISOString(),
      user: {
        id: req.user._id,
        username: req.user.username,
        companyId: req.user.companyId,
        isSuperAdmin: req.user.isSuperAdmin
      }
    })
  } catch (error: any) {
    console.error('Dashboard error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data',
      message: 'An error occurred while fetching dashboard information',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

/**
 * Get dashboard trends for charts
 */
router.get('/trends', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { companyId } = req.user
    const { period = 'week', metric = 'orders' } = req.query

    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: 'Company context required'
      })
    }

    let startDate: Date
    let dateFormat: string

    switch (period) {
      case 'week':
        startDate = startOfWeek()
        dateFormat = '%Y-%m-%d'
        break
      case 'month':
        startDate = startOfMonth()
        dateFormat = '%Y-%m'
        break
      default:
        startDate = startOfWeek()
        dateFormat = '%Y-%m-%d'
    }

    let pipeline: any[] = []
    let model: any

    switch (metric) {
      case 'orders':
        model = CustomerOrder
        pipeline = [
          { $match: { companyId: new Types.ObjectId(companyId), createdAt: { $gte: startDate } } },
          {
            $group: {
              _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
              count: { $sum: 1 },
              revenue: { $sum: '$totalAmount' }
            }
          },
          { $sort: { '_id': 1 } }
        ]
        break
      case 'production':
        model = ProductionOrder
        pipeline = [
          { $match: { companyId: new Types.ObjectId(companyId), createdAt: { $gte: startDate } } },
          {
            $group: {
              _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
              count: { $sum: 1 },
              completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
            }
          },
          { $sort: { '_id': 1 } }
        ]
        break
      case 'inventory':
        model = InventoryItem
        pipeline = [
          { $match: { companyId: new Types.ObjectId(companyId), updatedAt: { $gte: startDate } } },
          {
            $group: {
              _id: { $dateToString: { format: dateFormat, date: '$updatedAt' } },
              count: { $sum: 1 },
              totalValue: { $sum: { $multiply: ['$stock.currentStock', '$unitPrice'] } }
            }
          },
          { $sort: { '_id': 1 } }
        ]
        break
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid metric specified'
        })
    }

    const trends = await model.aggregate(pipeline)

    res.json({
      success: true,
      data: {
        period,
        metric,
        trends,
        startDate: startDate.toISOString()
      }
    })
  } catch (error: any) {
    console.error('Dashboard trends error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trends data'
    })
  }
})

/**
 * Get real-time dashboard updates
 */
router.get('/realtime', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { companyId } = req.user

    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: 'Company context required'
      })
    }

    // Get real-time counts
    const [pendingOrders, activeProduction, lowStockItems, todayRevenue] = await Promise.all([
      CustomerOrder.countDocuments({ 
        companyId: new Types.ObjectId(companyId), 
        status: 'pending' 
      }),
      ProductionOrder.countDocuments({ 
        companyId: new Types.ObjectId(companyId), 
        status: 'in_production' 
      }),
      InventoryItem.countDocuments({
        companyId: new Types.ObjectId(companyId),
        $expr: { $lte: ['$stock.currentStock', '$stock.reorderLevel'] }
      }),
      CustomerOrder.aggregate([
        { 
          $match: { 
            companyId: new Types.ObjectId(companyId), 
            status: 'delivered',
            createdAt: { $gte: startOfToday() }
          } 
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
    ])

    res.json({
      success: true,
      data: {
        pendingOrders,
        activeProduction,
        lowStockItems,
        todayRevenue: extractRevenue(todayRevenue),
        lastUpdated: new Date().toISOString()
      }
    })
  } catch (error: any) {
    console.error('Real-time dashboard error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch real-time data'
    })
  }
})

export default router
