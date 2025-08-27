import { Router } from 'express';
import { AdvancedReportController } from '../../controllers/AdvancedReportController';
import { authenticate } from '../../middleware/auth';

const router = Router();
const advancedReportController = new AdvancedReportController();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @route   GET /api/v1/advanced-reports
 * @desc    Get advanced reports by company
 * @access  Private
 */
router.get('/', advancedReportController.getReportsByCompany.bind(advancedReportController));

/**
 * @route   POST /api/v1/advanced-reports
 * @desc    Create new advanced report
 * @access  Private
 */
router.post('/', advancedReportController.createReport.bind(advancedReportController));

/**
 * @route   GET /api/v1/advanced-reports/:id
 * @desc    Get advanced report by ID
 * @access  Private
 */
router.get('/:id', advancedReportController.getReportById.bind(advancedReportController));

/**
 * @route   PUT /api/v1/advanced-reports/:id
 * @desc    Update advanced report
 * @access  Private
 */
router.put('/:id', advancedReportController.updateReport.bind(advancedReportController));

/**
 * @route   DELETE /api/v1/advanced-reports/:id
 * @desc    Delete advanced report
 * @access  Private
 */
router.delete('/:id', advancedReportController.deleteReport.bind(advancedReportController));

/**
 * @route   GET /api/v1/advanced-reports/category/:category
 * @desc    Get reports by category
 * @access  Private
 */
router.get('/category/:category', advancedReportController.getReportsByCategory.bind(advancedReportController));

/**
 * @route   GET /api/v1/advanced-reports/scheduled
 * @desc    Get scheduled reports
 * @access  Private
 */
router.get('/scheduled', advancedReportController.getScheduledReports.bind(advancedReportController));

/**
 * @route   GET /api/v1/advanced-reports/templates
 * @desc    Get report templates
 * @access  Private
 */
router.get('/templates', advancedReportController.getReportTemplates.bind(advancedReportController));

/**
 * @route   GET /api/v1/advanced-reports/public
 * @desc    Get public reports
 * @access  Private
 */
router.get('/public', advancedReportController.getPublicReports.bind(advancedReportController));

/**
 * @route   POST /api/v1/advanced-reports/:id/generate
 * @desc    Generate report
 * @access  Private
 */
router.post('/:id/generate', advancedReportController.generateReport.bind(advancedReportController));

/**
 * @route   POST /api/v1/advanced-reports/:id/export
 * @desc    Export report
 * @access  Private
 */
router.post('/:id/export', advancedReportController.exportReport.bind(advancedReportController));

/**
 * @route   POST /api/v1/advanced-reports/:id/clone
 * @desc    Clone report as template
 * @access  Private
 */
router.post('/:id/clone', advancedReportController.cloneReport.bind(advancedReportController));

/**
 * @route   GET /api/v1/advanced-reports/:id/status
 * @desc    Get report generation status
 * @access  Private
 */
router.get('/:id/status', advancedReportController.getReportStatus.bind(advancedReportController));

/**
 * @route   PUT /api/v1/advanced-reports/:id/schedule
 * @desc    Update report schedule
 * @access  Private
 */
router.put('/:id/schedule', advancedReportController.updateSchedule.bind(advancedReportController));

/**
 * @route   PUT /api/v1/advanced-reports/:id/distribution
 * @desc    Update report distribution
 * @access  Private
 */
router.put('/:id/distribution', advancedReportController.updateDistribution.bind(advancedReportController));

/**
 * @route   PUT /api/v1/advanced-reports/:id/access-control
 * @desc    Update report access control
 * @access  Private
 */
router.put('/:id/access-control', advancedReportController.updateAccessControl.bind(advancedReportController));

/**
 * @route   GET /api/v1/advanced-reports/:id/analytics
 * @desc    Get report analytics
 * @access  Private
 */
router.get('/:id/analytics', advancedReportController.getReportAnalytics.bind(advancedReportController));

/**
 * @route   POST /api/v1/advanced-reports/:id/access
 * @desc    Grant access to report
 * @access  Private
 */
router.post('/:id/access', advancedReportController.grantAccess.bind(advancedReportController));

/**
 * @route   DELETE /api/v1/advanced-reports/:id/access/:userId
 * @desc    Revoke access to report
 * @access  Private
 */
router.delete('/:id/access/:userId', advancedReportController.revokeAccess.bind(advancedReportController));

/**
 * @route   GET /api/v1/advanced-reports/search
 * @desc    Search reports
 * @access  Private
 */
router.get('/search', advancedReportController.searchReports.bind(advancedReportController));

export default router;
