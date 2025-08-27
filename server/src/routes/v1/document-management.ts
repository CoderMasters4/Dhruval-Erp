import { Router } from 'express';
import { DocumentManagementController } from '../../controllers/DocumentManagementController';
import { authenticate } from '../../middleware/auth';

const router = Router();
const documentManagementController = new DocumentManagementController();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @route   GET /api/v1/document-management
 * @desc    Get documents by company
 * @access  Private
 */
router.get('/', documentManagementController.getDocumentsByCompany.bind(documentManagementController));

/**
 * @route   POST /api/v1/document-management
 * @desc    Create new document
 * @access  Private
 */
router.post('/', documentManagementController.createDocument.bind(documentManagementController));

/**
 * @route   GET /api/v1/document-management/:id
 * @desc    Get document by ID
 * @access  Private
 */
router.get('/:id', documentManagementController.getDocumentById.bind(documentManagementController));

/**
 * @route   PUT /api/v1/document-management/:id
 * @desc    Update document
 * @access  Private
 */
router.put('/:id', documentManagementController.updateDocument.bind(documentManagementController));

/**
 * @route   DELETE /api/v1/document-management/:id
 * @desc    Delete document (soft delete)
 * @access  Private
 */
router.delete('/:id', documentManagementController.deleteDocument.bind(documentManagementController));

/**
 * @route   GET /api/v1/document-management/type/:documentType
 * @desc    Get documents by type
 * @access  Private
 */
router.get('/type/:documentType', documentManagementController.getDocumentsByType.bind(documentManagementController));

/**
 * @route   GET /api/v1/document-management/category/:category
 * @desc    Get documents by category
 * @access  Private
 */
router.get('/category/:category', documentManagementController.getDocumentsByCategory.bind(documentManagementController));

/**
 * @route   GET /api/v1/document-management/pending-approval
 * @desc    Get documents pending approval
 * @access  Private
 */
router.get('/pending-approval', documentManagementController.getPendingApproval.bind(documentManagementController));

/**
 * @route   GET /api/v1/document-management/overdue-approvals
 * @desc    Get overdue approvals
 * @access  Private
 */
router.get('/overdue-approvals', documentManagementController.getOverdueApprovals.bind(documentManagementController));

/**
 * @route   POST /api/v1/document-management/:id/upload
 * @desc    Upload document file
 * @access  Private
 */
router.post('/:id/upload', documentManagementController.uploadDocument.bind(documentManagementController));

/**
 * @route   POST /api/v1/document-management/:id/version
 * @desc    Add new version to document
 * @access  Private
 */
router.post('/:id/version', documentManagementController.addVersion.bind(documentManagementController));

/**
 * @route   GET /api/v1/document-management/:id/versions
 * @desc    Get document versions
 * @access  Private
 */
router.get('/:id/versions', documentManagementController.getDocumentVersions.bind(documentManagementController));

/**
 * @route   POST /api/v1/document-management/:id/approval
 * @desc    Request document approval
 * @access  Private
 */
router.post('/:id/approval', documentManagementController.requestApproval.bind(documentManagementController));

/**
 * @route   PUT /api/v1/document-management/:id/approve
 * @desc    Approve document
 * @access  Private
 */
router.put('/:id/approve', documentManagementController.approveDocument.bind(documentManagementController));

/**
 * @route   PUT /api/v1/document-management/:id/reject
 * @desc    Reject document
 * @access  Private
 */
router.put('/:id/reject', documentManagementController.rejectDocument.bind(documentManagementController));

/**
 * @route   POST /api/v1/document-management/:id/access
 * @desc    Grant access to document
 * @access  Private
 */
router.post('/:id/access', documentManagementController.grantAccess.bind(documentManagementController));

/**
 * @route   DELETE /api/v1/document-management/:id/access/:userId
 * @desc    Revoke access to document
 * @access  Private
 */
router.delete('/:id/access/:userId', documentManagementController.revokeAccess.bind(documentManagementController));

/**
 * @route   GET /api/v1/document-management/:id/access
 * @desc    Get document access list
 * @access  Private
 */
router.get('/:id/access', documentManagementController.getDocumentAccess.bind(documentManagementController));

/**
 * @route   POST /api/v1/document-management/:id/view
 * @desc    Record document view
 * @access  Private
 */
router.post('/:id/view', documentManagementController.recordView.bind(documentManagementController));

/**
 * @route   POST /api/v1/document-management/:id/download
 * @desc    Record document download
 * @access  Private
 */
router.post('/:id/download', documentManagementController.recordDownload.bind(documentManagementController));

/**
 * @route   GET /api/v1/document-management/:id/analytics
 * @desc    Get document analytics
 * @access  Private
 */
router.get('/:id/analytics', documentManagementController.getDocumentAnalytics.bind(documentManagementController));

/**
 * @route   GET /api/v1/document-management/search
 * @desc    Search documents
 * @access  Private
 */
router.get('/search', documentManagementController.searchDocuments.bind(documentManagementController));

/**
 * @route   POST /api/v1/document-management/:id/process
 * @desc    Process document (OCR, auto-tagging, etc.)
 * @access  Private
 */
router.post('/:id/process', documentManagementController.processDocument.bind(documentManagementController));

/**
 * @route   GET /api/v1/document-management/:id/preview
 * @desc    Get document preview
 * @access  Private
 */
router.get('/:id/preview', documentManagementController.getDocumentPreview.bind(documentManagementController));

/**
 * @route   GET /api/v1/document-management/:id/thumbnail
 * @desc    Get document thumbnail
 * @access  Private
 */
router.get('/:id/thumbnail', documentManagementController.getDocumentThumbnail.bind(documentManagementController));

/**
 * @route   POST /api/v1/document-management/:id/share
 * @desc    Share document
 * @access  Private
 */
router.post('/:id/share', documentManagementController.shareDocument.bind(documentManagementController));

/**
 * @route   PUT /api/v1/document-management/:id/archive
 * @desc    Archive document
 * @access  Private
 */
router.put('/:id/archive', documentManagementController.archiveDocument.bind(documentManagementController));

/**
 * @route   PUT /api/v1/document-management/:id/restore
 * @desc    Restore archived document
 * @access  Private
 */
router.put('/:id/restore', documentManagementController.restoreDocument.bind(documentManagementController));

/**
 * @route   POST /api/v1/document-management/bulk-upload
 * @desc    Bulk upload documents
 * @access  Private
 */
router.post('/bulk-upload', documentManagementController.bulkUpload.bind(documentManagementController));

/**
 * @route   POST /api/v1/document-management/bulk-approve
 * @desc    Bulk approve documents
 * @access  Private
 */
router.post('/bulk-approve', documentManagementController.bulkApprove.bind(documentManagementController));

export default router;
