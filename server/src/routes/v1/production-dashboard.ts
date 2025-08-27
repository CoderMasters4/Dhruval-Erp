import { Router } from 'express';
import { ProductionDashboardController } from '../../controllers/ProductionDashboardController';
import { authenticate } from '../../middleware/auth';

const router = Router();
const productionDashboardController = new ProductionDashboardController();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @route   GET /api/v1/production-dashboard
 * @desc    Get production dashboard by company
 * @access  Private
 */
router.get('/', productionDashboardController.getDashboardByCompany.bind(productionDashboardController));

/**
 * @route   POST /api/v1/production-dashboard
 * @desc    Create new production dashboard
 * @access  Private
 */
router.post('/', productionDashboardController.createDashboard.bind(productionDashboardController));

/**
 * @route   GET /api/v1/production-dashboard/machine/:machineId
 * @desc    Get machine status from dashboard
 * @access  Private
 */
router.get('/machine/:machineId', productionDashboardController.getMachineStatus.bind(productionDashboardController));

/**
 * @route   PUT /api/v1/production-dashboard/machine/:machineId
 * @desc    Update machine status in dashboard
 * @access  Private
 */
router.put('/machine/:machineId', productionDashboardController.updateMachineStatus.bind(productionDashboardController));

/**
 * @route   GET /api/v1/production-dashboard/daily-summary
 * @desc    Get daily production summary
 * @access  Private
 */
router.get('/daily-summary', productionDashboardController.getDailySummary.bind(productionDashboardController));

/**
 * @route   POST /api/v1/production-dashboard/daily-summary
 * @desc    Add daily production summary
 * @access  Private
 */
router.post('/daily-summary', productionDashboardController.addDailySummary.bind(productionDashboardController));

/**
 * @route   GET /api/v1/production-dashboard/printing-status
 * @desc    Get printing status for all machines
 * @access  Private
 */
router.get('/printing-status', productionDashboardController.getPrintingStatus.bind(productionDashboardController));

/**
 * @route   PUT /api/v1/production-dashboard/printing-status/:machineId
 * @desc    Update printing status for specific machine
 * @access  Private
 */
router.put('/printing-status/:machineId', productionDashboardController.updatePrintingStatus.bind(productionDashboardController));

/**
 * @route   GET /api/v1/production-dashboard/alerts
 * @desc    Get active alerts
 * @access  Private
 */
router.get('/alerts', productionDashboardController.getActiveAlerts.bind(productionDashboardController));

/**
 * @route   POST /api/v1/production-dashboard/alerts
 * @desc    Add new alert
 * @access  Private
 */
router.post('/alerts', productionDashboardController.addAlert.bind(productionDashboardController));

/**
 * @route   PUT /api/v1/production-dashboard/alerts/:alertIndex/acknowledge
 * @desc    Acknowledge alert
 * @access  Private
 */
router.put('/alerts/:alertIndex/acknowledge', productionDashboardController.acknowledgeAlert.bind(productionDashboardController));

/**
 * @route   PUT /api/v1/production-dashboard/alerts/:alertIndex/resolve
 * @desc    Resolve alert
 * @access  Private
 */
router.put('/alerts/:alertIndex/resolve', productionDashboardController.resolveAlert.bind(productionDashboardController));

/**
 * @route   GET /api/v1/production-dashboard/performance
 * @desc    Get performance metrics
 * @access  Private
 */
router.get('/performance', productionDashboardController.getPerformanceMetrics.bind(productionDashboardController));

/**
 * @route   PUT /api/v1/production-dashboard/performance
 * @desc    Update performance metrics
 * @access  Private
 */
router.put('/performance', productionDashboardController.updatePerformanceMetrics.bind(productionDashboardController));

/**
 * @route   GET /api/v1/production-dashboard/config
 * @desc    Get dashboard configuration
 * @access  Private
 */
router.get('/config', productionDashboardController.getDashboardConfig.bind(productionDashboardController));

/**
 * @route   PUT /api/v1/production-dashboard/config
 * @desc    Update dashboard configuration
 * @access  Private
 */
router.put('/config', productionDashboardController.updateDashboardConfig.bind(productionDashboardController));

export default router;
