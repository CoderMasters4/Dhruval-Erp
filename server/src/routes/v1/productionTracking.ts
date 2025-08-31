import { Router } from 'express';
import { ProductionTrackingController } from '../../controllers/ProductionTrackingController';
import { authenticate } from '../../middleware/auth';

const router = Router();
const productionTrackingController = new ProductionTrackingController();

router.use(authenticate);

// Production Tracking Data
router.get('/tracking', productionTrackingController.getProductionTrackingData.bind(productionTrackingController));

// Printing Status
router.get('/printing-status', productionTrackingController.getPrintingStatus.bind(productionTrackingController));

// Job Work Tracking
router.get('/job-work-tracking', productionTrackingController.getJobWorkTracking.bind(productionTrackingController));

// Process Tracking
router.get('/process-tracking', productionTrackingController.getProcessTracking.bind(productionTrackingController));

// Production Summaries
router.get('/daily-summary', productionTrackingController.getDailyProductionSummary.bind(productionTrackingController));
router.get('/machine-summary', productionTrackingController.getMachineWiseSummary.bind(productionTrackingController));

// Production Management
router.patch('/update-status', productionTrackingController.updateProductionStatus.bind(productionTrackingController));
router.post('/start-stage', productionTrackingController.startProductionStage.bind(productionTrackingController));
router.post('/complete-stage', productionTrackingController.completeProductionStage.bind(productionTrackingController));

// Quality Management
router.post('/quality-check', productionTrackingController.addQualityCheck.bind(productionTrackingController));

// Monitoring and Alerts
router.get('/alerts', productionTrackingController.getProductionAlerts.bind(productionTrackingController));
router.get('/efficiency', productionTrackingController.getProductionEfficiency.bind(productionTrackingController));

// Real-time Dashboard
router.get('/realtime-dashboard', productionTrackingController.getRealTimeProductionDashboard.bind(productionTrackingController));

export default router;
