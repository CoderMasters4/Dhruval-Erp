import { Router } from 'express';
import { CustomerVisitController } from '../../controllers/CustomerVisitController';
import { authenticate, requireCompany } from '../../middleware/auth';

const router = Router();
const customerVisitController = new CustomerVisitController();

// Apply authentication middleware to all routes
router.use(authenticate);
router.use(requireCompany);

/**
 * @route   POST /api/v1/customer-visits
 * @desc    Create a new customer visit
 * @access  Private
 */
router.post('/', customerVisitController.createCustomerVisit.bind(customerVisitController));

/**
 * @route   GET /api/v1/customer-visits
 * @desc    Get all customer visits with pagination and filters
 * @access  Private
 */
router.get('/', customerVisitController.getAllCustomerVisits.bind(customerVisitController));

/**
 * @route   GET /api/v1/customer-visits/stats
 * @desc    Get customer visits statistics
 * @access  Private
 */
router.get('/stats', customerVisitController.getExpenseStats.bind(customerVisitController));

/**
 * @route   GET /api/v1/customer-visits/pending-approvals
 * @desc    Get pending approvals
 * @access  Private
 */
router.get('/pending-approvals', customerVisitController.getPendingApprovals.bind(customerVisitController));

/**
 * @route   GET /api/v1/customer-visits/:id
 * @desc    Get customer visit by ID
 * @access  Private
 */
router.get('/:id', customerVisitController.getCustomerVisitById.bind(customerVisitController));

/**
 * @route   PUT /api/v1/customer-visits/:id
 * @desc    Update customer visit
 * @access  Private
 */
router.put('/:id', customerVisitController.updateCustomerVisit.bind(customerVisitController));

/**
 * @route   DELETE /api/v1/customer-visits/:id
 * @desc    Delete customer visit
 * @access  Private
 */
router.delete('/:id', customerVisitController.deleteCustomerVisit.bind(customerVisitController));

/**
 * @route   PUT /api/v1/customer-visits/:id/approve
 * @desc    Approve customer visit
 * @access  Private
 */
router.put('/:id/approve', customerVisitController.approveVisit.bind(customerVisitController));

/**
 * @route   PUT /api/v1/customer-visits/:id/reject
 * @desc    Reject customer visit
 * @access  Private
 */
router.put('/:id/reject', customerVisitController.rejectVisit.bind(customerVisitController));

/**
 * @route   PUT /api/v1/customer-visits/:id/reimburse
 * @desc    Process reimbursement for customer visit
 * @access  Private
 */
router.put('/:id/reimburse', customerVisitController.markAsReimbursed.bind(customerVisitController));

/**
 * @route   POST /api/v1/customer-visits/:id/food-expense
 * @desc    Add food expense to customer visit
 * @access  Private
 */
router.post('/:id/food-expense', customerVisitController.addFoodExpense.bind(customerVisitController));

/**
 * @route   POST /api/v1/customer-visits/:id/gift
 * @desc    Add gift to customer visit
 * @access  Private
 */
router.post('/:id/gift', customerVisitController.addGift.bind(customerVisitController));

export default router;
