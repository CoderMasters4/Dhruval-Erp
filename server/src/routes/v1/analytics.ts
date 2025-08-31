import { Router } from 'express';
import { AnalyticsController } from '../../controllers/AnalyticsController';
import { authenticate } from '../../middleware/auth';

const router = Router();
const analyticsController = new AnalyticsController();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @route   GET /api/v1/analytics/dashboard
 * @desc    Get comprehensive analytics dashboard data
 * @access  Private
 */
router.get('/dashboard', analyticsController.getAnalyticsDashboard.bind(analyticsController));

/**
 * @route   GET /api/v1/analytics/kpi
 * @desc    Get KPI data with comparison
 * @access  Private
 */
router.get('/kpi', analyticsController.getKPIData.bind(analyticsController));

/**
 * @route   GET /api/v1/analytics/reports/daily
 * @desc    Get daily reports
 * @access  Private
 */
router.get('/reports/daily', analyticsController.getDailyReports.bind(analyticsController));

/**
 * @route   GET /api/v1/analytics/reports/weekly
 * @desc    Get weekly reports
 * @access  Private
 */
router.get('/reports/weekly', analyticsController.getWeeklyReports.bind(analyticsController));

/**
 * @route   GET /api/v1/analytics/reports/monthly
 * @desc    Get monthly reports
 * @access  Private
 */
router.get('/reports/monthly', analyticsController.getMonthlyReports.bind(analyticsController));

/**
 * @route   GET /api/v1/analytics/reports/custom
 * @desc    Get custom filtered reports
 * @access  Private
 */
router.get('/reports/custom', analyticsController.getCustomReports.bind(analyticsController));

/**
 * @route   POST /api/v1/analytics/export
 * @desc    Export reports in various formats (PDF, Excel, CSV)
 * @access  Private
 */
router.post('/export', analyticsController.exportReport.bind(analyticsController));

/**
 * @route   GET /api/v1/analytics/filters
 * @desc    Get available filter options
 * @access  Private
 */
router.get('/filters', analyticsController.getFilterOptions.bind(analyticsController));

/**
 * @route   GET /api/v1/analytics/templates
 * @desc    Get report templates
 * @access  Private
 */
router.get('/templates', analyticsController.getReportTemplates.bind(analyticsController));

/**
 * @route   POST /api/v1/analytics/templates
 * @desc    Save custom report template
 * @access  Private
 */
router.post('/templates', analyticsController.saveReportTemplate.bind(analyticsController));

/**
 * @route   GET /api/v1/analytics/realtime
 * @desc    Get real-time analytics
 * @access  Private
 */
router.get('/realtime', analyticsController.getRealTimeAnalytics.bind(analyticsController));

export default router;
