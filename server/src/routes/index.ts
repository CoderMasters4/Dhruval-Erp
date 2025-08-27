import { Router } from 'express';
import { authenticate, requireCompany } from '@/middleware/auth';

// Import V1 routes only (clean structure)
import v1AuthRoutes from './v1/auth';
import v1CompaniesRoutes from './v1/companies';
import v1UsersRoutes from './v1/users';
import v1QuotationsRoutes from './v1/quotations';
import v1ManpowerRoutes from './v1/manpower';
import v1StickerRoutes from './v1/stickers';
import v1CustomersRoutes from './v1/customers';
import v1SuppliersRoutes from './v1/suppliers';
import v1InventoryRoutes from './v1/inventory';
import v1ProductionRoutes from './v1/production';
import v1CustomerOrdersRoutes from './v1/customer-orders';
import v1PurchaseOrdersRoutes from './v1/purchase-orders';
import v1InvoicesRoutes from './v1/invoices';
import v1WarehousesRoutes from './v1/warehouses';
import v1StockMovementsRoutes from './v1/stock-movements';
import v1FinancialTransactionsRoutes from './v1/financial-transactions';
import v1VisitorsRoutes from './v1/visitors';
import v1VehiclesRoutes from './v1/vehicles';
import v1SecurityLogsRoutes from './v1/security-logs';
import v1AuditLogsRoutes from './v1/audit-logs';
import v1BusinessAnalyticsRoutes from './v1/business-analytics';
import v1BoilerMonitoringRoutes from './v1/boiler-monitoring';
import v1ElectricityMonitoringRoutes from './v1/electricity-monitoring';
import v1HospitalityRoutes from './v1/hospitality';
import v1DispatchRoutes from './v1/dispatch';
import v1ReportsRoutes from './v1/reports';
import v1SparesRoutes from './v1/spares';
import v1AttendanceRoutes from './v1/attendance';
import v1BatchesRoutes from './v1/batches';
import v1EmployeesRoutes from './v1/employees';
import v1ShiftsRoutes from './v1/shifts';
import v1ProductionDashboardRoutes from './v1/production-dashboard';
import v1AdvancedReportsRoutes from './v1/advanced-reports';
import v1DocumentManagementRoutes from './v1/document-management';

const router = Router();

// =============================================
// PUBLIC ROUTES (No Authentication Required)
// =============================================

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '2.0.0'
  });
});

// Cookie debug endpoint
router.get('/debug/cookies', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Cookie debug info',
    cookies: {
      received: req.cookies,
      headers: req.headers.cookie,
      origin: req.headers.origin,
      userAgent: req.headers['user-agent']
    }
  });
});

// Public info endpoint
router.get('/info', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Dhruval Exim ERP API v1 - Complete Business Management System',
    version: '2.0.0',
    description: 'Complete Factory ERP Management System with 24 Business Models',
    availableEndpoints: [
      'GET /api/v1/info - API information (public)',
      'GET /api/v1/companies - Company management (auth required)',
      'GET /api/v1/users - User management (auth required)',
      'GET /api/v1/customers - Customer management (auth required)',
      'GET /api/v1/suppliers - Supplier management (auth required)',
      'GET /api/v1/inventory - Inventory management (auth required)',
      'GET /api/v1/production - Production management (auth required)',
      'GET /api/v1/customer-orders - Customer orders (auth required)',
      'GET /api/v1/purchase-orders - Purchase orders (auth required)',
      'GET /api/v1/invoices - Invoice management (auth required)',
      'GET /api/v1/quotations - Quotation management (auth required)',
      'GET /api/v1/warehouses - Warehouse management (auth required)',
      'GET /api/v1/stock-movements - Stock tracking (auth required)',
      'GET /api/v1/financial-transactions - Financial management (auth required)',
      'GET /api/v1/visitors - Visitor management (auth required)',
      'GET /api/v1/vehicles - Vehicle management (auth required)',
      'GET /api/v1/security-logs - Security logging (auth required)',
      'GET /api/v1/audit-logs - Audit trail (auth required)',
      'GET /api/v1/business-analytics - Business analytics (auth required)',
      'GET /api/v1/boiler-monitoring - Boiler monitoring (auth required)',
      'GET /api/v1/electricity-monitoring - Electricity monitoring (auth required)',
      'GET /api/v1/hospitality - Hospitality management (auth required)',
      'GET /api/v1/dispatch - Dispatch management (auth required)',
      'GET /api/v1/reports - Report generation (auth required)',
      'GET /api/v1/spares - Spare parts management (auth required)',
      'GET /api/v1/manpower - Manpower management (auth required)',
      'GET /api/v1/stickers - Sticker & label system (auth required)',
      'GET /api/v1/attendance - Employee attendance (auth required)',
      'GET /api/v1/batches - Production batches (auth required)',
      'GET /api/v1/production-dashboard - Real-time production dashboard (auth required)',
      'GET /api/v1/advanced-reports - Advanced reporting system (auth required)',
      'GET /api/v1/document-management - Document management system (auth required)'
    ],
    authentication: {
      required: 'Most endpoints require authentication',
      loginEndpoint: '/api/v1/auth/login',
      tokenType: 'Bearer token in Authorization header'
    },
    timestamp: new Date().toISOString()
  });
});

// =============================================
// V1 API ROUTES (Complete Business Management System)
// =============================================

// Auth routes (no authentication required)
router.use('/auth', v1AuthRoutes);

// Apply authentication middleware to all other v1 routes
router.use('/', authenticate);

// Core business management
router.use('/companies', v1CompaniesRoutes);
router.use('/users', v1UsersRoutes);
router.use('/customers', v1CustomersRoutes);
router.use('/suppliers', v1SuppliersRoutes);

// Inventory and production
router.use('/inventory', v1InventoryRoutes);
router.use('/production', v1ProductionRoutes);
router.use('/warehouses', v1WarehousesRoutes);
router.use('/stock-movements', v1StockMovementsRoutes);
router.use('/spares', v1SparesRoutes);
router.use('/batches', v1BatchesRoutes);

// Orders and financial
router.use('/customer-orders', v1CustomerOrdersRoutes);
router.use('/purchase-orders', v1PurchaseOrdersRoutes);
router.use('/invoices', v1InvoicesRoutes);
router.use('/quotations', v1QuotationsRoutes);
router.use('/financial-transactions', v1FinancialTransactionsRoutes);

// Operations and management
router.use('/manpower', v1ManpowerRoutes);
router.use('/stickers', v1StickerRoutes);
router.use('/visitors', v1VisitorsRoutes);
router.use('/vehicles', v1VehiclesRoutes);
router.use('/attendance', v1AttendanceRoutes);
router.use('/employees', v1EmployeesRoutes);
router.use('/shifts', v1ShiftsRoutes);

// Monitoring and analytics
router.use('/boiler-monitoring', v1BoilerMonitoringRoutes);
router.use('/electricity-monitoring', v1ElectricityMonitoringRoutes);
router.use('/business-analytics', v1BusinessAnalyticsRoutes);
router.use('/security-logs', v1SecurityLogsRoutes);
router.use('/audit-logs', v1AuditLogsRoutes);

// Specialized services
router.use('/hospitality', v1HospitalityRoutes);
router.use('/dispatch', v1DispatchRoutes);
router.use('/reports', v1ReportsRoutes);

// Advanced features
router.use('/production-dashboard', v1ProductionDashboardRoutes);
router.use('/advanced-reports', v1AdvancedReportsRoutes);
router.use('/document-management', v1DocumentManagementRoutes);

export default router;
