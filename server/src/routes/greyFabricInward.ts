import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { GreyFabricInwardController } from '../controllers/GreyFabricInwardController';

const router = Router();
const controller = new GreyFabricInwardController();

// Apply authentication middleware to all routes
router.use(authenticate);

// Validation middleware
const validateCreate = [
  body('productionOrderId').isMongoId().withMessage('Valid production order ID is required'),
  body('supplierId').isMongoId().withMessage('Valid supplier ID is required'),
  body('fabricType').notEmpty().withMessage('Fabric type is required'),
  body('fabricColor').notEmpty().withMessage('Fabric color is required'),
  body('fabricWeight').isFloat({ min: 0 }).withMessage('Fabric weight must be a positive number'),
  body('fabricWidth').isFloat({ min: 0 }).withMessage('Fabric width must be a positive number'),
  body('quantity').isFloat({ min: 0 }).withMessage('Quantity must be a positive number'),
  body('unit').isIn(['meters', 'yards', 'pieces']).withMessage('Unit must be meters, yards, or pieces'),
  body('quality').isIn(['A+', 'A', 'B+', 'B', 'C', 'D']).withMessage('Quality must be A+, A, B+, B, C, or D'),
  body('expectedAt').optional().isISO8601().withMessage('Expected date must be a valid ISO date'),
  body('remarks').optional().isString().withMessage('Remarks must be a string'),
  body('images').optional().isArray().withMessage('Images must be an array'),
  body('costBreakdown.fabricCost').optional().isFloat({ min: 0 }).withMessage('Fabric cost must be a positive number'),
  body('costBreakdown.transportationCost').optional().isFloat({ min: 0 }).withMessage('Transportation cost must be a positive number'),
  body('costBreakdown.inspectionCost').optional().isFloat({ min: 0 }).withMessage('Inspection cost must be a positive number')
];

const validateUpdate = [
  param('id').isMongoId().withMessage('Valid GRN ID is required'),
  body('fabricType').optional().notEmpty().withMessage('Fabric type cannot be empty'),
  body('fabricColor').optional().notEmpty().withMessage('Fabric color cannot be empty'),
  body('fabricWeight').optional().isFloat({ min: 0 }).withMessage('Fabric weight must be a positive number'),
  body('fabricWidth').optional().isFloat({ min: 0 }).withMessage('Fabric width must be a positive number'),
  body('quantity').optional().isFloat({ min: 0 }).withMessage('Quantity must be a positive number'),
  body('unit').optional().isIn(['meters', 'yards', 'pieces']).withMessage('Unit must be meters, yards, or pieces'),
  body('quality').optional().isIn(['A+', 'A', 'B+', 'B', 'C', 'D']).withMessage('Quality must be A+, A, B+, B, C, or D'),
  body('status').optional().isIn(['pending', 'in_transit', 'received', 'rejected']).withMessage('Status must be pending, in_transit, received, or rejected'),
  body('receivedAt').optional().isISO8601().withMessage('Received date must be a valid ISO date'),
  body('expectedAt').optional().isISO8601().withMessage('Expected date must be a valid ISO date'),
  body('remarks').optional().isString().withMessage('Remarks must be a string'),
  body('images').optional().isArray().withMessage('Images must be an array'),
  body('costBreakdown.fabricCost').optional().isFloat({ min: 0 }).withMessage('Fabric cost must be a positive number'),
  body('costBreakdown.transportationCost').optional().isFloat({ min: 0 }).withMessage('Transportation cost must be a positive number'),
  body('costBreakdown.inspectionCost').optional().isFloat({ min: 0 }).withMessage('Inspection cost must be a positive number')
];

const validateMarkAsReceived = [
  param('id').isMongoId().withMessage('Valid GRN ID is required'),
  body('receivedAt').optional().isISO8601().withMessage('Received date must be a valid ISO date'),
  body('qualityChecks').optional().isArray().withMessage('Quality checks must be an array')
];

const validateQualityCheck = [
  param('id').isMongoId().withMessage('Valid GRN ID is required'),
  body('parameters.colorFastness').isFloat({ min: 0, max: 5 }).withMessage('Color fastness must be between 0 and 5'),
  body('parameters.tensileStrength').isFloat({ min: 0 }).withMessage('Tensile strength must be a positive number'),
  body('parameters.tearStrength').isFloat({ min: 0 }).withMessage('Tear strength must be a positive number'),
  body('parameters.shrinkage').isFloat({ min: 0, max: 100 }).withMessage('Shrinkage must be between 0 and 100'),
  body('defects').optional().isArray().withMessage('Defects must be an array'),
  body('notes').optional().isString().withMessage('Notes must be a string')
];

const validateQuery = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['pending', 'in_transit', 'received', 'rejected']).withMessage('Invalid status'),
  query('quality').optional().isIn(['A+', 'A', 'B+', 'B', 'C', 'D']).withMessage('Invalid quality'),
  query('fabricType').optional().isString().withMessage('Fabric type must be a string'),
  query('supplierId').optional().isMongoId().withMessage('Invalid supplier ID'),
  query('dateFrom').optional().isISO8601().withMessage('Date from must be a valid ISO date'),
  query('dateTo').optional().isISO8601().withMessage('Date to must be a valid ISO date'),
  query('search').optional().isString().withMessage('Search must be a string')
];

const validateAnalytics = [
  query('period').optional().isIn(['7d', '30d', '90d']).withMessage('Period must be 7d, 30d, or 90d'),
  query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
  query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO date')
];

// Routes
router.get('/', validateQuery, controller.getAll.bind(controller));
router.get('/analytics', validateAnalytics, controller.getAnalytics.bind(controller));
router.get('/:id', param('id').isMongoId().withMessage('Valid GRN ID is required'), controller.getById.bind(controller));
router.post('/', validateCreate, controller.create.bind(controller));
router.put('/:id', validateUpdate, controller.update.bind(controller));
router.delete('/:id', param('id').isMongoId().withMessage('Valid GRN ID is required'), controller.delete.bind(controller));
router.post('/:id/receive', validateMarkAsReceived, controller.markAsReceived.bind(controller));
router.post('/:id/quality-check', validateQualityCheck, controller.addQualityCheck.bind(controller));

export default router;
