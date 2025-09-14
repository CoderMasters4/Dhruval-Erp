import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';
import GreyFabricInward from '../models/GreyFabricInward';
import ProductionOrder from '../models/ProductionOrder';
import { Supplier } from '../models/Supplier';
import InventoryItem from '../models/InventoryItem';
import { InventoryService } from '../services/InventoryService';

export class GreyFabricInwardController {
  private inventoryService: InventoryService;

  constructor() {
    this.inventoryService = new InventoryService();
  }

  private handleError(res: Response, error: any): void {
    logger.error('GreyFabricInwardController Error:', error);
    
    // Log more detailed error information
    if (error?.message) {
      logger.error('Error message:', error.message);
    }
    if (error?.stack) {
      logger.error('Error stack:', error.stack);
    }
    
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
        details: error.details
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  /**
   * Create inventory item from GRN data
   */
  private async createInventoryItemFromGRN(grn: any, companyId: string, userId: string): Promise<any> {
    try {
      // Generate unique item code for fabric
      const fabricCode = `FAB-${grn.fabricType.toUpperCase()}-${grn.fabricColor.toUpperCase()}-${Date.now()}`;
      
      // Create inventory item data
      const inventoryItemData = {
        itemCode: fabricCode,
        companyItemCode: `${grn.grnNumber}-FAB`,
        itemName: `${grn.fabricType} Fabric - ${grn.fabricColor}`,
        description: `Grey fabric received via GRN ${grn.grnNumber}`,
        category: {
          primary: 'raw_material' as const,
          secondary: 'fabric',
          tertiary: grn.fabricType
        },
        itemType: 'raw_material',
        unit: grn.unit,
        companyId: new mongoose.Types.ObjectId(companyId),
        
        // Stock information
        stock: {
          currentStock: grn.quantity,
          availableStock: grn.quantity,
          reservedStock: 0,
          inTransitStock: 0,
          damagedStock: 0,
          unit: grn.unit,
          reorderLevel: 0,
          minStockLevel: 0,
          maxStockLevel: grn.quantity * 2,
          valuationMethod: 'FIFO' as const,
          averageCost: grn.costBreakdown?.fabricCost || 0,
          totalValue: grn.quantity * (grn.costBreakdown?.fabricCost || 0)
        },
        
        // Pricing information
        pricing: {
          costPrice: grn.costBreakdown?.fabricCost || 0,
          sellingPrice: (grn.costBreakdown?.fabricCost || 0) * 1.2, // 20% markup
          currency: 'INR'
        },
        
        // Quality information
        quality: {
          qualityGrade: grn.quality,
          defectPercentage: 0,
          qualityCheckRequired: true,
          qualityParameters: ['Color', 'Weight', 'Width', 'Strength'],
          lastQualityCheck: new Date(),
          qualityNotes: `Quality checked during GRN ${grn.grnNumber}`,
          certifications: []
        },
        
        // Physical properties
        physicalProperties: {
          weight: grn.fabricWeight,
          dimensions: {
            length: grn.quantity,
            width: grn.fabricWidth,
            height: 0.1 // Default fabric thickness
          },
          color: grn.fabricColor,
          material: grn.fabricType
        },
        
        // Supplier information
        suppliers: [{
          supplierId: grn.supplierId,
          supplierName: grn.supplierName,
          supplierItemCode: `${grn.supplierId}-${fabricCode}`,
          isPrimary: true,
          isActive: true,
          lastPurchaseDate: new Date(),
          lastPurchasePrice: grn.costBreakdown?.fabricCost || 0
        }],
        
        // Location information
        locations: [{
          warehouseId: new mongoose.Types.ObjectId(), // Default warehouse
          warehouseName: 'Main Warehouse',
          quantity: grn.quantity,
          lastUpdated: new Date(),
          isActive: true
        }],
        
        // Manufacturing information
        manufacturing: {
          batchSize: grn.quantity,
          shelfLife: 365, // 1 year for fabric
          manufacturingCost: grn.costBreakdown?.fabricCost || 0
        },
        
        // Tracking information
        tracking: {
          createdBy: userId,
          lastModifiedBy: new mongoose.Types.ObjectId(userId),
          lastStockUpdate: new Date(),
          lastMovementDate: new Date(),
          totalInward: grn.quantity,
          totalOutward: 0,
          totalAdjustments: 0
        },
        
        // GRN reference
        grnReference: grn._id,
        grnNumber: grn.grnNumber,
        
        // Status
        status: {
          isActive: true,
          isDiscontinued: false,
          isFastMoving: false,
          isSlowMoving: false,
          isObsolete: false,
          requiresApproval: false
        },
        isActive: true
      };

      // Create inventory item
      const inventoryItem = await this.inventoryService.createInventoryItem(inventoryItemData, userId);
      
      logger.info('Inventory item created from GRN', {
        grnId: grn._id,
        grnNumber: grn.grnNumber,
        inventoryItemId: inventoryItem._id,
        itemCode: inventoryItem.itemCode,
        quantity: grn.quantity
      });

      return inventoryItem;
    } catch (error) {
      logger.error('Error creating inventory item from GRN', {
        error,
        grnId: grn._id,
        grnNumber: grn.grnNumber
      });
      throw error;
    }
  }

  // Get all grey fabric inward entries with filters
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        quality,
        fabricType,
        supplierId,
        dateFrom,
        dateTo,
        search
      } = req.query;

      const companyId = req.user?.companyId;
      if (!companyId) {
        throw new AppError('Company ID is required', 400);
      }

      // Build filter object
      const filter: any = { companyId };

      if (status) filter.status = status;
      if (quality) filter['inspection.qualityGrade'] = quality;
      if (fabricType) filter['fabricDetails.fabricType'] = fabricType;
      if (supplierId) filter.supplierId = supplierId;

      // Date range filter
      if (dateFrom || dateTo) {
        filter.createdAt = {};
        if (dateFrom) filter.createdAt.$gte = new Date(dateFrom as string);
        if (dateTo) filter.createdAt.$lte = new Date(dateTo as string);
      }

      // Search filter
      if (search) {
        filter.$or = [
          { grnNumber: new RegExp(search as string, 'i') },
          { purchaseOrderNumber: new RegExp(search as string, 'i') },
          { customerName: new RegExp(search as string, 'i') },
          { supplierName: new RegExp(search as string, 'i') },
          { 'fabricDetails.fabricType': new RegExp(search as string, 'i') },
          { 'fabricDetails.color': new RegExp(search as string, 'i') }
        ];
      }

      const skip = (Number(page) - 1) * Number(limit);

      const [grns, total] = await Promise.all([
        GreyFabricInward.find(filter)
          .populate('supplierId', 'supplierName contactPersons')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean(),
        GreyFabricInward.countDocuments(filter)
      ]);

      // Transform data to include populated fields
      const transformedGrns = grns.map(grn => ({
        ...grn,
        supplierName: (grn.supplierId as any)?.supplierName || grn.supplierName
      }));

      res.json({
        success: true,
        data: transformedGrns,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // Get single grey fabric inward entry
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const companyId = req.user?.companyId;

      if (!companyId) {
        throw new AppError('Company ID is required', 400);
      }

      const grn = await GreyFabricInward.findOne({ _id: id, companyId })
        .populate('supplierId', 'supplierName contactPersons')
        .lean();

      if (!grn) {
        throw new AppError('GRN entry not found', 404);
      }

      // Transform data
      const transformedGrn = {
        ...grn,
        supplierName: (grn.supplierId as any)?.supplierName || grn.supplierName
      };

      res.json({
        success: true,
        data: transformedGrn
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // Create new grey fabric inward entry
  async create(req: Request, res: Response): Promise<void> {
    try {
      // For testing - use default values if user is not authenticated
      const companyId = req.user?.companyId || new mongoose.Types.ObjectId();
      const userId = req.user?.id || new mongoose.Types.ObjectId();

      // Log for debugging
      logger.info('Creating GRN with:', { companyId, userId, body: req.body });

      const {
        productionOrderId,
        purchaseOrderId, // Required - GRN must be linked to PO
        fabricType,
        fabricColor,
        fabricWeight,
        fabricWidth,
        quantity,
        unit,
        quality,
        expectedAt,
        remarks,
        images,
        costBreakdown
      } = req.body;

      // Validate required fields
      if (!purchaseOrderId || !fabricType || !fabricColor || !quantity || !unit || !quality) {
        throw new AppError('Missing required fields: purchaseOrderId, fabricType, fabricColor, quantity, unit, quality', 400);
      }

      // Get Purchase Order details to populate supplier info
      const PurchaseOrder = mongoose.model('PurchaseOrder');
      const purchaseOrder = await PurchaseOrder.findById(purchaseOrderId);
      
      if (!purchaseOrder) {
        throw new AppError('Purchase Order not found', 404);
      }

      // Generate GRN number
      const grnCount = await GreyFabricInward.countDocuments({ companyId });
      const grnNumber = `GRN-${String(grnCount + 1).padStart(4, '0')}`;

      // Calculate total cost
      const totalCost = (costBreakdown?.fabricCost || 0) + 
                       (costBreakdown?.transportationCost || 0) + 
                       (costBreakdown?.inspectionCost || 0);

      const grnData = {
        grnNumber,
        purchaseOrderId: new mongoose.Types.ObjectId(purchaseOrderId),
        purchaseOrderNumber: purchaseOrder.poNumber,
        
        // Supplier info populated from Purchase Order
        supplierId: purchaseOrder.supplier.supplierId,
        supplierName: purchaseOrder.supplier.supplierName,
        
        customerName: 'Customer', // This should come from production order or be passed in request
        
        // Fabric Details
        fabricDetails: {
          fabricType: fabricType as 'cotton' | 'polyester' | 'viscose' | 'blend' | 'other',
          fabricGrade: quality as 'A' | 'B' | 'C' | 'D',
          gsm: Number(fabricWeight),
          width: Number(fabricWidth),
          color: fabricColor,
          design: '',
          pattern: '',
          finish: ''
        },
        
        // Quantity Information
        quantity: {
          receivedQuantity: Number(quantity),
          unit: unit as 'meters' | 'yards' | 'pieces',
          acceptedQuantity: Number(quantity),
          rejectedQuantity: 0,
          shortQuantity: 0,
          excessQuantity: 0
        },
        
        // Quality Parameters
        qualityParameters: {
          weight: Number(fabricWeight),
          width: Number(fabricWidth),
          gsm: Number(fabricWeight),
          colorFastness: 'good' as 'excellent' | 'good' | 'fair' | 'poor',
          shrinkage: 0,
          pilling: 'none' as 'none' | 'slight' | 'moderate' | 'severe',
          defects: {
            holes: 0,
            stains: 0,
            colorVariation: 0,
            other: ''
          }
        },
        
        // Physical Condition
        physicalCondition: {
          isDamaged: false,
          damageDescription: '',
          isWet: false,
          isContaminated: false,
          contaminationType: '',
          storageCondition: 'good' as 'good' | 'fair' | 'poor'
        },
        
        // Documentation
        documents: {
          supplierInvoice: [],
          qualityCertificate: [],
          testReports: [],
          photos: images || [],
          other: []
        },
        
        // Status and Approval
        status: 'pending' as 'pending' | 'approved' | 'rejected' | 'partially_approved',
        inspectionStatus: 'pending' as 'pending' | 'in_progress' | 'completed',
        qualityStatus: 'passed' as 'passed' | 'failed' | 'conditional',
        
        // Location and Storage
        storageLocation: {
          warehouseId: new mongoose.Types.ObjectId(), // This should be passed or default warehouse
          warehouseName: 'Main Warehouse',
          rackNumber: '',
          shelfNumber: '',
          binNumber: ''
        },
        
        // Financial Information
        financial: {
          unitPrice: costBreakdown?.fabricCost || 0,
          totalValue: totalCost,
          currency: 'INR',
          gstRate: 18,
          gstAmount: totalCost * 0.18,
          totalAmount: totalCost * 1.18
        },
        
        // Inspection Details
        inspection: {
          inspectedBy: new mongoose.Types.ObjectId(userId),
          inspectedByName: req.user?.name || 'Inspector',
          inspectionDate: new Date(),
          inspectionNotes: remarks || '',
          qualityGrade: quality as 'A' | 'B' | 'C' | 'D',
          recommendedAction: 'accept' as 'accept' | 'reject' | 'conditional_accept' | 'return_to_supplier'
        },
        
        // Cost Breakdown
        costBreakdown: {
          fabricCost: costBreakdown?.fabricCost || 0,
          transportationCost: costBreakdown?.transportationCost || 0,
          inspectionCost: costBreakdown?.inspectionCost || 0,
          totalCost: totalCost
        },
        
        // Additional fields
        expectedDeliveryDate: expectedAt ? new Date(expectedAt) : undefined,
        actualDeliveryDate: undefined,
        remarks: remarks || '',
        
        companyId,
        createdBy: userId,
        updatedBy: userId
      };

      const grn = await GreyFabricInward.create(grnData);

      // Automatically create inventory item when GRN is created
      try {
        const inventoryItem = await this.createInventoryItemFromGRN(grn, companyId.toString(), userId.toString());
        
        // Update GRN with inventory item reference
        await GreyFabricInward.findByIdAndUpdate(grn._id, {
          inventoryItemId: inventoryItem._id,
          inventoryItemCode: inventoryItem.itemCode
        });

        logger.info('GRN created with inventory item and supplier info from PO', {
          grnId: grn._id,
          grnNumber: grn.grnNumber,
          purchaseOrderId: purchaseOrderId,
          purchaseOrderNumber: purchaseOrder.poNumber,
          supplierName: purchaseOrder.supplier.supplierName,
          inventoryItemId: inventoryItem._id,
          itemCode: inventoryItem.itemCode
        });
      } catch (inventoryError) {
        // Log error but don't fail GRN creation
        logger.error('Failed to create inventory item for GRN', {
          grnId: grn._id,
          grnNumber: grn.grnNumber,
          error: inventoryError
        });
      }

      res.status(201).json({
        success: true,
        message: 'GRN entry created successfully with supplier info from Purchase Order',
        data: grn
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // Update grey fabric inward entry
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const companyId = req.user?.companyId;
      const userId = req.user?.id;

      if (!companyId || !userId) {
        throw new AppError('Company ID and User ID are required', 400);
      }

      // Calculate total cost if costBreakdown is being updated
      let updateData = { ...req.body, updatedBy: userId };
      
      if (req.body.costBreakdown) {
        const totalCost = (req.body.costBreakdown.fabricCost || 0) + 
                         (req.body.costBreakdown.transportationCost || 0) + 
                         (req.body.costBreakdown.inspectionCost || 0);
        
        updateData.costBreakdown = {
          ...req.body.costBreakdown,
          totalCost: totalCost
        };
      }

      const grn = await GreyFabricInward.findOneAndUpdate(
        { _id: id, companyId },
        updateData,
        { new: true, runValidators: true }
      );

      if (!grn) {
        throw new AppError('GRN entry not found', 404);
      }

      // If status is being updated to 'received', update inventory stock
      if (req.body.status === 'received' && grn.inventoryItemId) {
        try {
          await this.updateInventoryStock(grn, 'received');
          logger.info('Inventory stock updated for received GRN', {
            grnId: grn._id,
            grnNumber: grn.grnNumber,
            inventoryItemId: grn.inventoryItemId
          });
        } catch (inventoryError) {
          logger.error('Failed to update inventory stock for GRN', {
            grnId: grn._id,
            grnNumber: grn.grnNumber,
            error: inventoryError
          });
        }
      }

      res.json({
        success: true,
        message: 'GRN entry updated successfully',
        data: grn
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * Update inventory stock based on GRN status
   */
  private async updateInventoryStock(grn: any, status: string): Promise<void> {
    if (!grn.inventoryItemId) return;

    try {
      const inventoryItem = await InventoryItem.findById(grn.inventoryItemId);
      if (!inventoryItem) return;

      if (status === 'received') {
        // Update stock levels when fabric is received
        await this.inventoryService.updateStock(
          grn.inventoryItemId.toString(),
          inventoryItem.locations[0]?.warehouseId?.toString() || new mongoose.Types.ObjectId().toString(),
          grn.quantity.acceptedQuantity || grn.quantity.receivedQuantity,
          'in',
          `GRN-${grn.grnNumber}`,
          `Fabric received via GRN ${grn.grnNumber}`,
          grn.updatedBy
        );
      } else if (status === 'rejected') {
        // Reduce stock if fabric is rejected
        await this.inventoryService.updateStock(
          grn.inventoryItemId.toString(),
          inventoryItem.locations[0]?.warehouseId?.toString() || new mongoose.Types.ObjectId().toString(),
          -(grn.quantity.rejectedQuantity || 0),
          'out',
          `GRN-${grn.grnNumber}`,
          `Fabric rejected via GRN ${grn.grnNumber}`,
          grn.updatedBy
        );
      }
    } catch (error) {
      logger.error('Error updating inventory stock', {
        grnId: grn._id,
        grnNumber: grn.grnNumber,
        status,
        inventoryItemId: grn.inventoryItemId,
        error: error?.message || error,
        stack: error?.stack
      });
      throw error;
    }
  }

  /**
   * Update Purchase Order received quantities when GRN is approved
   */
  private async updatePurchaseOrderReceivedQuantity(grn: any): Promise<void> {
    if (!grn.purchaseOrderId) return;

    try {
      const PurchaseOrder = mongoose.model('PurchaseOrder');
      const acceptedQuantity = grn.quantity.acceptedQuantity || grn.quantity.receivedQuantity;
      
      // Update the specific item in the purchase order
      await PurchaseOrder.findOneAndUpdate(
        { 
          _id: grn.purchaseOrderId,
          'items.itemId': grn.itemId // Assuming GRN has itemId reference
        },
        {
          $inc: {
            'items.$.receivedQuantity': acceptedQuantity,
            'items.$.rejectedQuantity': grn.quantity.rejectedQuantity || 0
          },
          lastReceivedDate: new Date()
        }
      );

      logger.info('Purchase Order received quantities updated', {
        purchaseOrderId: grn.purchaseOrderId,
        grnId: grn._id,
        acceptedQuantity,
        rejectedQuantity: grn.quantity.rejectedQuantity || 0
      });
    } catch (error) {
      logger.error('Error updating Purchase Order received quantities', {
        grnId: grn._id,
        grnNumber: grn.grnNumber,
        purchaseOrderId: grn.purchaseOrderId,
        error
      });
      throw error;
    }
  }

  // Delete grey fabric inward entry
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const companyId = req.user?.companyId;

      if (!companyId) {
        throw new AppError('Company ID is required', 400);
      }

      const grn = await GreyFabricInward.findOneAndDelete({ _id: id, companyId });

      if (!grn) {
        throw new AppError('GRN entry not found', 404);
      }

      res.json({
        success: true,
        message: 'GRN entry deleted successfully'
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // Mark as received
  async markAsReceived(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { receivedAt, qualityChecks, acceptedQuantity, rejectedQuantity } = req.body;
      const companyId = req.user?.companyId;
      const userId = req.user?.userId || req.user?._id || req.user?.id;

      if (!companyId || !userId) {
        logger.error('Missing authentication data in markAsReceived', {
          hasUser: !!req.user,
          userId: req.user?.userId || req.user?._id || req.user?.id,
          companyId: req.user?.companyId,
          userKeys: req.user ? Object.keys(req.user) : []
        });
        throw new AppError('Company ID and User ID are required', 400);
      }

      // Get GRN details for validation
      const grn = await GreyFabricInward.findById(id);
      if (!grn) {
        throw new AppError('GRN entry not found', 404);
      }

      // Validate quantities if provided
      if (acceptedQuantity !== undefined || rejectedQuantity !== undefined) {
        const totalQuantity = (acceptedQuantity || 0) + (rejectedQuantity || 0);
        if (totalQuantity > grn.quantity.receivedQuantity) {
          throw new AppError('Accepted + Rejected quantity cannot exceed received quantity', 400);
        }
      }

      const updateData: any = {
        status: 'approved',
        actualDeliveryDate: receivedAt ? new Date(receivedAt) : new Date(),
        inspectionStatus: 'completed',
        updatedBy: userId
      };

      // Update quantities if provided
      if (acceptedQuantity !== undefined) {
        updateData['quantity.acceptedQuantity'] = acceptedQuantity;
      }
      if (rejectedQuantity !== undefined) {
        updateData['quantity.rejectedQuantity'] = rejectedQuantity;
      }

      const updatedGRN = await GreyFabricInward.findOneAndUpdate(
        { _id: id, companyId },
        updateData,
        { new: true, runValidators: true }
      );

      if (!updatedGRN) {
        throw new AppError('GRN entry not found', 404);
      }

      // Update inventory stock when GRN is marked as received
      if (updatedGRN.inventoryItemId) {
        try {
          await this.updateInventoryStock(updatedGRN, 'received');
          logger.info('Inventory stock updated for received GRN', {
            grnId: updatedGRN._id,
            grnNumber: updatedGRN.grnNumber,
            acceptedQuantity: acceptedQuantity,
            rejectedQuantity: rejectedQuantity,
            inventoryItemId: updatedGRN.inventoryItemId
          });
        } catch (stockError) {
          logger.error('Failed to update inventory stock for GRN', {
            grnId: updatedGRN._id,
            grnNumber: updatedGRN.grnNumber,
            error: stockError
          });
          // Don't fail the request, just log the error
        }
      }

      // Update Purchase Order received quantities if linked
      if (updatedGRN.purchaseOrderId) {
        try {
          await this.updatePurchaseOrderReceivedQuantity(updatedGRN);
          logger.info('Purchase Order updated with GRN received quantity', {
            grnId: updatedGRN._id,
            grnNumber: updatedGRN.grnNumber,
            purchaseOrderId: updatedGRN.purchaseOrderId
          });
        } catch (poError) {
          logger.error('Failed to update Purchase Order for GRN', {
            grnId: updatedGRN._id,
            grnNumber: updatedGRN.grnNumber,
            purchaseOrderId: updatedGRN.purchaseOrderId,
            error: poError
          });
          // Don't fail the request, just log the error
        }
      }

      res.json({
        success: true,
        message: 'GRN marked as received and stock updated with confirmed quantities',
        data: updatedGRN
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // Add quality check
  async addQualityCheck(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const qualityCheck = req.body;
      const companyId = req.user?.companyId;
      const userId = req.user?.id;

      if (!companyId || !userId) {
        throw new AppError('Company ID and User ID are required', 400);
      }

      // Update inspection details
      const updateData = {
        'inspection.inspectedBy': userId,
        'inspection.inspectedByName': req.user?.name || 'Inspector',
        'inspection.inspectionDate': new Date(),
        'inspection.inspectionNotes': qualityCheck.notes || '',
        'inspection.qualityGrade': qualityCheck.qualityGrade || 'B',
        'inspection.recommendedAction': qualityCheck.recommendedAction || 'accept',
        updatedBy: userId
      };

      const grn = await GreyFabricInward.findOneAndUpdate(
        { _id: id, companyId },
        updateData,
        { new: true, runValidators: true }
      );

      if (!grn) {
        throw new AppError('GRN entry not found', 404);
      }

      res.json({
        success: true,
        message: 'Quality check added successfully',
        data: grn
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // Get analytics
  async getAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { period = '30d', startDate, endDate } = req.query;
      const companyId = req.user?.companyId;

      if (!companyId) {
        throw new AppError('Company ID is required', 400);
      }

      // Calculate date range
      let dateFilter: any = { companyId };
      const now = new Date();
      
      if (startDate && endDate) {
        dateFilter.createdAt = {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string)
        };
      } else {
        const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
        const start = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
        dateFilter.createdAt = { $gte: start };
      }

      // Get basic stats
      const [totalGrns, receivedGrns, pendingGrns, rejectedGrns] = await Promise.all([
        GreyFabricInward.countDocuments(dateFilter),
        GreyFabricInward.countDocuments({ ...dateFilter, status: 'approved' }),
        GreyFabricInward.countDocuments({ ...dateFilter, status: 'pending' }),
        GreyFabricInward.countDocuments({ ...dateFilter, status: 'rejected' })
      ]);

      // Get total fabric quantity
      const fabricData = await GreyFabricInward.aggregate([
        { $match: dateFilter },
        { $group: { _id: null, totalQuantity: { $sum: '$quantity.receivedQuantity' } } }
      ]);
      const totalFabricQuantity = fabricData[0]?.totalQuantity || 0;

      // Get quality distribution
      const qualityDistribution = await GreyFabricInward.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$inspection.qualityGrade', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      // Get total value
      const valueData = await GreyFabricInward.aggregate([
        { $match: dateFilter },
        { $group: { _id: null, totalValue: { $sum: '$financial.totalValue' } } }
      ]);
      const totalValue = valueData[0]?.totalValue || 0;

      // Get top suppliers
      const topSuppliers = await GreyFabricInward.aggregate([
        { $match: dateFilter },
        { $group: { 
          _id: '$supplierName', 
          count: { $sum: 1 },
          totalValue: { $sum: '$financial.totalValue' }
        }},
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);

      // Get monthly trends
      const monthlyTrends = await GreyFabricInward.aggregate([
        { $match: dateFilter },
        { $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          value: { $sum: '$financial.totalValue' }
        }},
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]);

      // Calculate average quality
      const qualityScores = { 'A': 4, 'B': 3, 'C': 2, 'D': 1 };
      let totalScore = 0;
      let totalCount = 0;
      
      qualityDistribution.forEach(item => {
        const score = qualityScores[item._id as keyof typeof qualityScores] || 0;
        totalScore += score * item.count;
        totalCount += item.count;
      });
      
      const averageQuality = totalCount > 0 ? 
        Object.keys(qualityScores)[Math.round(totalScore / totalCount)] : 'N/A';

      // Format quality distribution with percentages
      const formattedQualityDistribution = qualityDistribution.map(item => ({
        quality: item._id,
        count: item.count,
        percentage: totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0
      }));

      // Format monthly trends
      const formattedMonthlyTrends = monthlyTrends.map(item => ({
        month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
        count: item.count,
        value: item.value
      }));

      res.json({
        success: true,
        data: {
          totalGrns,
          receivedGrns,
          pendingGrns,
          rejectedGrns,
          totalFabricQuantity,
          averageQuality,
          totalValue,
          topSuppliers,
          qualityDistribution: formattedQualityDistribution,
          monthlyTrends: formattedMonthlyTrends
        }
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }
}