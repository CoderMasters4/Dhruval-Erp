import { Request, Response } from 'express';
import { DocumentManagement } from '../models';
import { BaseController } from './BaseController';

export class DocumentManagementController extends BaseController<any> {
  constructor() {
    super(null as any, 'DocumentManagement');
  }
  /**
   * Get documents by company
   */
  async getDocumentsByCompany(req: Request, res: Response) {
    try {
      const { companyId } = req.user!;
      const { page = 1, limit = 10, category, status } = req.query;
      
      const filter: any = { companyId };
      if (category) filter.category = category;
      if (status) filter.status = status;
      
      const documents = await DocumentManagement.find(filter)
        .sort({ createdAt: -1 })
        .limit(Number(limit) * 1)
        .skip((Number(page) - 1) * Number(limit))
        .populate('uploadedBy', 'name email')
        .populate('updatedBy', 'name email');
      
      const total = await DocumentManagement.countDocuments(filter);

      const result = {
        documents,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      };

      this.sendPaginatedResponse(res, result, 'Documents retrieved successfully');
    } catch (error) {
      console.error('Error getting documents:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while retrieving documents'
      });
    }
  }

  /**
   * Create new document
   */
  async createDocument(req: Request, res: Response) {
    try {
      const { companyId, userId } = req.user!;
      
      const documentData = {
        ...req.body,
        companyId,
        uploadedBy: userId,
        updatedBy: userId
      };
      
      const document = new DocumentManagement(documentData);
      await document.save();

      this.sendSuccess(res, document, 'Document created successfully', 201);
    } catch (error) {
      console.error('Error creating document:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while creating document'
      });
    }
  }

  /**
   * Get document by ID
   */
  async getDocumentById(req: Request, res: Response) {
    try {
      const { companyId } = req.user!;
      const { id } = req.params;
      
      const document = await DocumentManagement.findOne({ _id: id, companyId })
        .populate('uploadedBy', 'name email')
        .populate('updatedBy', 'name email');
      
      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Document not found'
        });
      }
      
      this.sendSuccess(res, document, 'Document retrieved successfully');
    } catch (error) {
      console.error('Error getting document:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while retrieving document'
      });
    }
  }

  /**
   * Update document
   */
  async updateDocument(req: Request, res: Response) {
    try {
      const { companyId, userId } = req.user!;
      const { id } = req.params;
      
      const document = await DocumentManagement.findOneAndUpdate(
        { _id: id, companyId },
        { ...req.body, updatedBy: userId, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      
      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Document not found'
        });
      }
      
      this.sendSuccess(res, document, 'Document updated successfully');
    } catch (error) {
      console.error('Error updating document:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating document'
      });
    }
  }

  /**
   * Delete document
   */
  async deleteDocument(req: Request, res: Response) {
    try {
      const { companyId } = req.user!;
      const { id } = req.params;
      
      const document = await DocumentManagement.findOneAndDelete({ _id: id, companyId });
      
      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Document not found'
        });
      }
      
      this.sendSuccess(res, document, 'Document deleted successfully');
    } catch (error) {
      console.error('Error deleting document:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while deleting document'
      });
    }
  }

  /**
   * Upload document file
   */
  async uploadFile(req: Request, res: Response) {
    try {
      const { companyId, userId } = req.user!;
      
      // This would contain the actual file upload logic
      // For now, returning a placeholder response
      const uploadData = {
        fileName: req.body.fileName || 'document.pdf',
        fileSize: req.body.fileSize || 1024,
        fileType: req.body.fileType || 'application/pdf',
        uploadedBy: userId,
        uploadedAt: new Date(),
        fileUrl: `/uploads/documents/${Date.now()}_${req.body.fileName || 'document.pdf'}`
      };
      
      this.sendSuccess(res, uploadData, 'File uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while uploading file'
      });
    }
  }

  /**
   * Download document
   */
  async downloadDocument(req: Request, res: Response) {
    try {
      const { companyId } = req.user!;
      const { id } = req.params;
      
      const document = await DocumentManagement.findOne({ _id: id, companyId });
      
      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Document not found'
        });
      }
      
      // This would contain the actual download logic
      // For now, returning a placeholder response
      const downloadData = {
        documentId: id,
        fileName: (document as any).metadata?.fileName || 'document.pdf',
        downloadUrl: (document as any).storage?.filePath || '/downloads/document.pdf',
        downloadedAt: new Date()
      };

      this.sendSuccess(res, downloadData, 'Document download initiated');
    } catch (error) {
      console.error('Error downloading document:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while downloading document'
      });
    }
  }

  /**
   * Search documents
   */
  async searchDocuments(req: Request, res: Response) {
    try {
      const { companyId } = req.user!;
      const { query, category, dateFrom, dateTo } = req.query;
      
      const filter: any = { companyId };
      
      if (query) {
        filter.$or = [
          { fileName: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query as string, 'i')] } }
        ];
      }
      
      if (category) filter.category = category;
      
      if (dateFrom || dateTo) {
        filter.createdAt = {};
        if (dateFrom) filter.createdAt.$gte = new Date(dateFrom as string);
        if (dateTo) filter.createdAt.$lte = new Date(dateTo as string);
      }
      
      const documents = await DocumentManagement.find(filter)
        .sort({ createdAt: -1 })
        .populate('uploadedBy', 'name email');
      
      this.sendSuccess(res, documents, 'Document search completed');
    } catch (error) {
      console.error('Error searching documents:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while searching documents'
      });
    }
  }
}
