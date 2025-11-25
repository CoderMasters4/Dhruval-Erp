import { Router } from 'express';
import { DyeingController } from '../controllers/DyeingController';
import { PrintingController } from '../controllers/PrintingController';
import { FinishingController } from '../controllers/FinishingController';
import { CuttingPackingController } from '../controllers/CuttingPackingController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Initialize controllers
const dyeingController = new DyeingController();
const printingController = new PrintingController();
const finishingController = new FinishingController();
const cuttingPackingController = new CuttingPackingController();

// Apply authentication middleware to all routes
router.use(authenticate);

// =============================================
// DYEING ROUTES
// =============================================

/**
 * @route POST /api/production-stages/dyeing/:productionOrderId
 * @desc Create a new dyeing process
 * @access Private
 */
router.post(
  '/dyeing/:productionOrderId',
  dyeingController.createDyeingProcess.bind(dyeingController)
);

/**
 * @route GET /api/production-stages/dyeing/:dyeingId
 * @desc Get dyeing process by ID
 * @access Private
 */
router.get(
  '/dyeing/:dyeingId',
  dyeingController.getDyeingProcess.bind(dyeingController)
);

/**
 * @route GET /api/production-stages/dyeing/order/:productionOrderId
 * @desc Get all dyeing processes for a production order
 * @access Private
 */
router.get(
  '/dyeing/order/:productionOrderId',
  dyeingController.getDyeingProcessesByOrder.bind(dyeingController)
);

/**
 * @route PUT /api/production-stages/dyeing/:dyeingId
 * @desc Update dyeing process
 * @access Private
 */
router.put(
  '/dyeing/:dyeingId',
  dyeingController.updateDyeingProcess.bind(dyeingController)
);

/**
 * @route POST /api/production-stages/dyeing/:dyeingId/start
 * @desc Start dyeing process
 * @access Private
 */
router.post(
  '/dyeing/:dyeingId/start',
  dyeingController.startDyeingProcess.bind(dyeingController)
);

/**
 * @route POST /api/production-stages/dyeing/:dyeingId/complete
 * @desc Complete dyeing process
 * @access Private
 */
router.post(
  '/dyeing/:dyeingId/complete',
  dyeingController.completeDyeingProcess.bind(dyeingController)
);

/**
 * @route POST /api/production-stages/dyeing/:dyeingId/quality-check
 * @desc Add quality check to dyeing process
 * @access Private
 */
router.post(
  '/dyeing/:dyeingId/quality-check',
  dyeingController.addQualityCheck.bind(dyeingController)
);

/**
 * @route GET /api/production-stages/dyeing/analytics
 * @desc Get dyeing analytics
 * @access Private
 */
router.get(
  '/dyeing/analytics',
  dyeingController.getDyeingAnalytics.bind(dyeingController)
);

// =============================================
// PRINTING ROUTES
// =============================================

/**
 * @route POST /api/production-stages/printing/:productionOrderId
 * @desc Create a new printing process
 * @access Private
 */
router.post(
  '/printing/:productionOrderId',
  printingController.createPrintingProcess.bind(printingController)
);

/**
 * @route GET /api/production-stages/printing/:printingId
 * @desc Get printing process by ID
 * @access Private
 */
router.get(
  '/printing/:printingId',
  printingController.getPrintingProcess.bind(printingController)
);

/**
 * @route GET /api/production-stages/printing/order/:productionOrderId
 * @desc Get all printing processes for a production order
 * @access Private
 */
router.get(
  '/printing/order/:productionOrderId',
  printingController.getPrintingProcessesByOrder.bind(printingController)
);

/**
 * @route PUT /api/production-stages/printing/:printingId
 * @desc Update printing process
 * @access Private
 */
router.put(
  '/printing/:printingId',
  printingController.updatePrintingProcess.bind(printingController)
);

/**
 * @route POST /api/production-stages/printing/:printingId/start
 * @desc Start printing process
 * @access Private
 */
router.post(
  '/printing/:printingId/start',
  printingController.startPrintingProcess.bind(printingController)
);

/**
 * @route POST /api/production-stages/printing/:printingId/complete
 * @desc Complete printing process
 * @access Private
 */
router.post(
  '/printing/:printingId/complete',
  printingController.completePrintingProcess.bind(printingController)
);

/**
 * @route POST /api/production-stages/printing/:printingId/quality-check
 * @desc Add quality check to printing process
 * @access Private
 */
router.post(
  '/printing/:printingId/quality-check',
  printingController.addQualityCheck.bind(printingController)
);

/**
 * @route GET /api/production-stages/printing/analytics
 * @desc Get printing analytics
 * @access Private
 */
router.get(
  '/printing/analytics',
  printingController.getPrintingAnalytics.bind(printingController)
);

// =============================================
// FINISHING ROUTES
// =============================================

/**
 * @route POST /api/production-stages/finishing/:productionOrderId
 * @desc Create a new finishing process
 * @access Private
 */
router.post(
  '/finishing/:productionOrderId',
  finishingController.createFinishingProcess.bind(finishingController)
);

/**
 * @route GET /api/production-stages/finishing/:finishingId
 * @desc Get finishing process by ID
 * @access Private
 */
router.get(
  '/finishing/:finishingId',
  finishingController.getFinishingProcess.bind(finishingController)
);

/**
 * @route GET /api/production-stages/finishing/order/:productionOrderId
 * @desc Get all finishing processes for a production order
 * @access Private
 */
router.get(
  '/finishing/order/:productionOrderId',
  finishingController.getFinishingProcessesByOrder.bind(finishingController)
);

/**
 * @route PUT /api/production-stages/finishing/:finishingId
 * @desc Update finishing process
 * @access Private
 */
router.put(
  '/finishing/:finishingId',
  finishingController.updateFinishingProcess.bind(finishingController)
);

/**
 * @route POST /api/production-stages/finishing/:finishingId/start
 * @desc Start finishing process
 * @access Private
 */
router.post(
  '/finishing/:finishingId/start',
  finishingController.startFinishingProcess.bind(finishingController)
);

/**
 * @route POST /api/production-stages/finishing/:finishingId/complete
 * @desc Complete finishing process
 * @access Private
 */
router.post(
  '/finishing/:finishingId/complete',
  finishingController.completeFinishingProcess.bind(finishingController)
);

/**
 * @route POST /api/production-stages/finishing/:finishingId/quality-check
 * @desc Add quality check to finishing process
 * @access Private
 */
router.post(
  '/finishing/:finishingId/quality-check',
  finishingController.addQualityCheck.bind(finishingController)
);

/**
 * @route GET /api/production-stages/finishing/analytics
 * @desc Get finishing analytics
 * @access Private
 */
router.get(
  '/finishing/analytics',
  finishingController.getFinishingAnalytics.bind(finishingController)
);

// =============================================
// CUTTING & PACKING ROUTES
// =============================================

/**
 * @route POST /api/production-stages/cutting-packing/:productionOrderId
 * @desc Create a new cutting & packing process
 * @access Private
 */
router.post(
  '/cutting-packing/:productionOrderId',
  cuttingPackingController.createCuttingPackingProcess.bind(cuttingPackingController)
);

/**
 * @route GET /api/production-stages/cutting-packing/:cuttingPackingId
 * @desc Get cutting & packing process by ID
 * @access Private
 */
router.get(
  '/cutting-packing/:cuttingPackingId',
  cuttingPackingController.getCuttingPackingProcess.bind(cuttingPackingController)
);

/**
 * @route GET /api/production-stages/cutting-packing/order/:productionOrderId
 * @desc Get all cutting & packing processes for a production order
 * @access Private
 */
router.get(
  '/cutting-packing/order/:productionOrderId',
  cuttingPackingController.getCuttingPackingProcessesByOrder.bind(cuttingPackingController)
);

/**
 * @route PUT /api/production-stages/cutting-packing/:cuttingPackingId
 * @desc Update cutting & packing process
 * @access Private
 */
router.put(
  '/cutting-packing/:cuttingPackingId',
  cuttingPackingController.updateCuttingPackingProcess.bind(cuttingPackingController)
);

/**
 * @route POST /api/production-stages/cutting-packing/:cuttingPackingId/start
 * @desc Start cutting & packing process
 * @access Private
 */
router.post(
  '/cutting-packing/:cuttingPackingId/start',
  cuttingPackingController.startCuttingPackingProcess.bind(cuttingPackingController)
);

/**
 * @route POST /api/production-stages/cutting-packing/:cuttingPackingId/complete
 * @desc Complete cutting & packing process
 * @access Private
 */
router.post(
  '/cutting-packing/:cuttingPackingId/complete',
  cuttingPackingController.completeCuttingPackingProcess.bind(cuttingPackingController)
);

/**
 * @route POST /api/production-stages/cutting-packing/:cuttingPackingId/quality-check
 * @desc Add quality check to cutting & packing process
 * @access Private
 */
router.post(
  '/cutting-packing/:cuttingPackingId/quality-check',
  cuttingPackingController.addQualityCheck.bind(cuttingPackingController)
);

/**
 * @route GET /api/production-stages/cutting-packing/analytics
 * @desc Get cutting & packing analytics
 * @access Private
 */
router.get(
  '/cutting-packing/analytics',
  cuttingPackingController.getCuttingPackingAnalytics.bind(cuttingPackingController)
);

export default router;
