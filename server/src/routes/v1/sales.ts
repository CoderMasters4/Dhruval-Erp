import { Router } from 'express';
import { SalesController } from '../../controllers/SalesController';
import { authenticate } from '../../middleware/auth';

const router = Router();
const salesController = new SalesController();

router.use(authenticate);

// =============================================
// SALES DASHBOARD (Overview + Analytics Combined)
// =============================================

/**
 * @route   GET /api/v1/sales/dashboard
 * @desc    Get comprehensive sales dashboard data (Overview + Analytics)
 * @access  Private
 */
router.get('/dashboard', salesController.getSalesDashboard.bind(salesController));

/**
 * @route   GET /api/v1/sales/stats
 * @desc    Get sales statistics
 * @access  Private
 */
router.get('/stats', salesController.getSalesStats.bind(salesController));

/**
 * @route   GET /api/v1/sales/analytics
 * @desc    Get sales analytics
 * @access  Private
 */
router.get('/analytics', salesController.getSalesAnalytics.bind(salesController));

// =============================================
// SALES ORDERS CRUD OPERATIONS
// =============================================

/**
 * @route   GET /api/v1/sales/orders
 * @desc    Get all sales orders with filtering
 * @access  Private
 */
router.get('/orders', salesController.getSalesOrders.bind(salesController));

/**
 * @route   POST /api/v1/sales/orders
 * @desc    Create a new sales order
 * @access  Private
 */
router.post('/orders', salesController.createSalesOrder.bind(salesController));

/**
 * @route   GET /api/v1/sales/orders/:id
 * @desc    Get sales order by ID
 * @access  Private
 */
router.get('/orders/:id', salesController.getSalesOrderById.bind(salesController));

/**
 * @route   PUT /api/v1/sales/orders/:id
 * @desc    Update sales order
 * @access  Private
 */
router.put('/orders/:id', salesController.updateSalesOrder.bind(salesController));

/**
 * @route   DELETE /api/v1/sales/orders/:id
 * @desc    Delete sales order
 * @access  Private
 */
router.delete('/orders/:id', salesController.deleteSalesOrder.bind(salesController));

/**
 * @route   PUT /api/v1/sales/orders/:id/payment
 * @desc    Update payment status
 * @access  Private
 */
router.put('/orders/:id/payment', salesController.updatePaymentStatus.bind(salesController));

/**
 * @route   PUT /api/v1/sales/orders/bulk-update
 * @desc    Bulk update orders
 * @access  Private
 */
router.put('/orders/bulk-update', salesController.bulkUpdateOrders.bind(salesController));

// =============================================
// SALES REPORTS & ANALYTICS
// =============================================

/**
 * @route   GET /api/v1/sales/reports/customer
 * @desc    Get customer sales report
 * @access  Private
 */
router.get('/reports/customer', salesController.getCustomerSalesReport.bind(salesController));

/**
 * @route   GET /api/v1/sales/reports/products
 * @desc    Get product sales performance
 * @access  Private
 */
router.get('/reports/products', salesController.getProductSalesPerformance.bind(salesController));

/**
 * @route   GET /api/v1/sales/trends
 * @desc    Get sales trends
 * @access  Private
 */
router.get('/trends', salesController.getSalesTrends.bind(salesController));

/**
 * @route   GET /api/v1/sales/team-performance
 * @desc    Get sales team performance
 * @access  Private
 */
router.get('/team-performance', salesController.getSalesTeamPerformance.bind(salesController));

// =============================================
// EXPORT FUNCTIONALITY
// =============================================

/**
 * @route   POST /api/v1/sales/export/:format
 * @desc    Export sales data
 * @access  Private
 */
router.post('/export/:format', salesController.exportSalesData.bind(salesController));

export default router;
