import { Router } from 'express';
import { authenticate, requirePermission } from '@/middleware/auth';
import { VisitorController } from '@/controllers/VisitorController';
import { uploadVisitorFiles, uploadSingle, validateUploadedFiles } from '@/middleware/upload';

const router = Router();
const visitorController = new VisitorController();

// =============================================
// VISITOR CRUD OPERATIONS
// =============================================

// Get all visitors with pagination and filtering
router.get('/',
  authenticate,
  requirePermission('security', 'visitorManagement'),
  visitorController.getAll.bind(visitorController)
);

// Get visitor by ID
router.get('/:id',
  authenticate,
  requirePermission('security', 'visitorManagement'),
  visitorController.getById.bind(visitorController)
);

// Create new visitor
router.post('/',
  authenticate,
  requirePermission('security', 'visitorManagement'),
  visitorController.create.bind(visitorController)
);

// Update visitor
router.put('/:id',
  authenticate,
  requirePermission('security', 'visitorManagement'),
  visitorController.update.bind(visitorController)
);

// Delete visitor (soft delete)
router.delete('/:id',
  authenticate,
  requirePermission('security', 'visitorManagement'),
  visitorController.delete.bind(visitorController)
);

// =============================================
// VISITOR ENTRY/EXIT OPERATIONS
// =============================================

// Check-in visitor
router.post('/:id/checkin',
  authenticate,
  requirePermission('security', 'gateManagement'),
  visitorController.checkIn.bind(visitorController)
);

// Check-out visitor
router.post('/:id/checkout',
  authenticate,
  requirePermission('security', 'gateManagement'),
  visitorController.checkOut.bind(visitorController)
);

// =============================================
// VISITOR APPROVAL OPERATIONS
// =============================================

// Approve visitor
router.post('/:id/approve',
  authenticate,
  requirePermission('security', 'visitorApproval'),
  visitorController.approve.bind(visitorController)
);

// Reject visitor
router.post('/:id/reject',
  authenticate,
  requirePermission('security', 'visitorApproval'),
  visitorController.reject.bind(visitorController)
);

// =============================================
// VISITOR REPORTS & ANALYTICS
// =============================================

// Get visitors currently inside
router.get('/reports/currently-inside',
  authenticate,
  requirePermission('security', 'securityReports'),
  visitorController.getCurrentlyInside.bind(visitorController)
);

// Get scheduled visitors for today
router.get('/reports/scheduled-today',
  authenticate,
  requirePermission('security', 'visitorManagement'),
  visitorController.getScheduledToday.bind(visitorController)
);

// Get overstaying visitors
router.get('/reports/overstaying',
  authenticate,
  requirePermission('security', 'securityReports'),
  visitorController.getOverstaying.bind(visitorController)
);

// Get visitor statistics
router.get('/reports/stats',
  authenticate,
  requirePermission('security', 'securityReports'),
  visitorController.getStats.bind(visitorController)
);

// Get visitor dashboard data
router.get('/dashboard',
  authenticate,
  requirePermission('security', 'visitorManagement'),
  visitorController.getDashboard.bind(visitorController)
);

// =============================================
// VISITOR SEARCH
// =============================================

// Search visitors
router.get('/search',
  authenticate,
  requirePermission('security', 'visitorManagement'),
  visitorController.search.bind(visitorController)
);

// =============================================
// FILE UPLOAD ROUTES WITH S3
// =============================================

// Create visitor with file uploads (S3)
router.post('/with-files',
  authenticate,
  requirePermission('security', 'visitorManagement'),
  uploadVisitorFiles,
  validateUploadedFiles,
  visitorController.create.bind(visitorController)
);

// Upload entry photo (S3)
router.post('/:id/entry-photo',
  authenticate,
  requirePermission('security', 'gateManagement'),
  uploadSingle('entryPhoto', 'visitors/entry'),
  validateUploadedFiles,
  visitorController.uploadEntryPhoto.bind(visitorController)
);

// Upload exit photo (S3)
router.post('/:id/exit-photo',
  authenticate,
  requirePermission('security', 'gateManagement'),
  uploadSingle('exitPhoto', 'visitors/exit'),
  validateUploadedFiles,
  visitorController.uploadExitPhoto.bind(visitorController)
);

// Upload visitor documents (S3)
router.post('/:id/documents',
  authenticate,
  requirePermission('security', 'visitorManagement'),
  uploadSingle('document', 'visitors/documents'),
  validateUploadedFiles,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { userId, companyId } = req.user!;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Document file is required'
        });
      }

      const documentUrl = (req.file as any).location;
      const { documentType, documentNumber, notes } = req.body;

      // Update visitor with new document using the base service
      const updatedVisitor = await (visitorController as any).service.update(id, {
        $push: {
          documents: {
            documentType: documentType || 'other',
            documentNumber: documentNumber || `DOC-${Date.now()}`,
            documentUrl,
            isVerified: false,
            notes
          }
        }
      }, userId);

      res.json({
        success: true,
        message: 'Document uploaded successfully',
        data: { documentUrl, visitor: updatedVisitor }
      });
    } catch (error) {
      next(error);
    }
  }
);

// =============================================
// S3 PRESIGNED URL ROUTES
// =============================================

// Get presigned URL for file upload
router.post('/upload-url',
  authenticate,
  requirePermission('security', 'visitorManagement'),
  visitorController.getUploadUrl.bind(visitorController)
);

// Get presigned URL for file download
router.get('/download/:key',
  authenticate,
  requirePermission('security', 'visitorManagement'),
  visitorController.getDownloadUrl.bind(visitorController)
);

// =============================================
// BULK OPERATIONS
// =============================================

// Bulk check-in visitors
router.post('/bulk-checkin',
  authenticate,
  requirePermission('security', 'gateManagement'),
  async (req, res, next) => {
    try {
      const { visitorIds, entryData } = req.body;
      const { userId } = req.user!;

      if (!visitorIds || !Array.isArray(visitorIds) || visitorIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Visitor IDs array is required'
        });
      }

      const results = [];
      const errors = [];

      for (const visitorId of visitorIds) {
        try {
          const visitor = await (visitorController as any).service.checkInVisitor(
            visitorId,
            entryData,
            userId
          );
          results.push({ visitorId, success: true, visitor });
        } catch (error) {
          errors.push({ visitorId, success: false, error: error.message });
        }
      }

      res.json({
        success: true,
        message: 'Bulk check-in completed',
        data: { results, errors, total: visitorIds.length, successful: results.length, failed: errors.length }
      });
    } catch (error) {
      next(error);
    }
  }
);

// Bulk check-out visitors
router.post('/bulk-checkout',
  authenticate,
  requirePermission('security', 'gateManagement'),
  async (req, res, next) => {
    try {
      const { visitorIds, exitData } = req.body;
      const { userId } = req.user!;

      if (!visitorIds || !Array.isArray(visitorIds) || visitorIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Visitor IDs array is required'
        });
      }

      const results = [];
      const errors = [];

      for (const visitorId of visitorIds) {
        try {
          const visitor = await (visitorController as any).service.checkOutVisitor(
            visitorId,
            exitData,
            userId
          );
          results.push({ visitorId, success: true, visitor });
        } catch (error) {
          errors.push({ visitorId, success: false, error: error.message });
        }
      }

      res.json({
        success: true,
        message: 'Bulk check-out completed',
        data: { results, errors, total: visitorIds.length, successful: results.length, failed: errors.length }
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;


