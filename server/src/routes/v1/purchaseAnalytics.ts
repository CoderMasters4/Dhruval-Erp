import { Router } from 'express';
import { PurchaseAnalyticsController } from '../../controllers/PurchaseAnalyticsController';
import { authenticate } from '../../middleware/auth';

const router = Router();
const purchaseAnalyticsController = new PurchaseAnalyticsController();

router.use(authenticate);

// Supplier Purchase Analytics
router.get('/analytics', purchaseAnalyticsController.getSupplierPurchaseAnalytics.bind(purchaseAnalyticsController));
router.get('/reports/supplier', purchaseAnalyticsController.getSupplierPurchaseReport.bind(purchaseAnalyticsController));
router.post('/export/supplier', purchaseAnalyticsController.exportSupplierPurchaseReport.bind(purchaseAnalyticsController));

// Category Performance
router.get('/analytics/categories', purchaseAnalyticsController.getCategoryPurchasePerformance.bind(purchaseAnalyticsController));

// Material Tracking
router.get('/analytics/chemicals', purchaseAnalyticsController.getChemicalsPurchaseTracking.bind(purchaseAnalyticsController));
router.get('/analytics/fabrics', purchaseAnalyticsController.getGreyFabricPurchaseTracking.bind(purchaseAnalyticsController));
router.get('/analytics/packing', purchaseAnalyticsController.getPackingMaterialPurchaseTracking.bind(purchaseAnalyticsController));

// Trends and Analysis
router.get('/analytics/trends', purchaseAnalyticsController.getPurchaseTrends.bind(purchaseAnalyticsController));
router.get('/analytics/supplier-performance', purchaseAnalyticsController.getSupplierPerformanceAnalysis.bind(purchaseAnalyticsController));
router.get('/analytics/cost-analysis', purchaseAnalyticsController.getPurchaseCostAnalysis.bind(purchaseAnalyticsController));

export default router;
