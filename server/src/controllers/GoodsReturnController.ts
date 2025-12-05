import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { GoodsReturnService } from '../services/GoodsReturnService';
import { IGoodsReturn } from '@/types/models';
import { AppError } from '../utils/errors';
import { logger } from '@/utils/logger';

export class GoodsReturnController extends BaseController<IGoodsReturn> {
  private goodsReturnService: GoodsReturnService;

  constructor() {
    const goodsReturnService = new GoodsReturnService();
    super(goodsReturnService, 'GoodsReturn');
    this.goodsReturnService = goodsReturnService;
  }

  /**
   * Create goods return
   * POST /api/v1/goods-returns
   */
  createGoodsReturn = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?._id;
      const companyId = (req as any).company?._id || (req as any).user?.primaryCompanyId;

      if (!userId) {
        this.sendError(res, new AppError('User ID is required', 400), 'User ID is required');
        return;
      }

      if (!companyId) {
        this.sendError(res, new AppError('Company ID is required', 400), 'Company ID is required');
        return;
      }

      const { inventoryItemId, returnData } = req.body;

      if (!inventoryItemId) {
        this.sendError(res, new AppError('Inventory item ID is required', 400), 'Validation error');
        return;
      }

      if (!returnData) {
        this.sendError(res, new AppError('Return data is required', 400), 'Validation error');
        return;
      }

      const goodsReturn = await this.goodsReturnService.createGoodsReturn(
        inventoryItemId,
        returnData,
        userId.toString(),
        companyId.toString()
      );

      this.sendSuccess(res, goodsReturn, 'Goods return created successfully', 201);
    } catch (error: any) {
      logger.error('Error creating goods return', { error, body: req.body });
      this.sendError(res, error, 'Failed to create goods return');
    }
  };

  /**
   * Get goods returns by challan number
   * GET /api/v1/goods-returns/challan/:challanNumber
   */
  getReturnsByChallan = async (req: Request, res: Response): Promise<void> => {
    try {
      const companyId = (req as any).company?._id || (req as any).user?.primaryCompanyId;
      const { challanNumber } = req.params;

      if (!companyId) {
        this.sendError(res, new AppError('Company ID is required', 400), 'Company ID is required');
        return;
      }

      if (!challanNumber) {
        this.sendError(res, new AppError('Challan number is required', 400), 'Validation error');
        return;
      }

      const returns = await this.goodsReturnService.getReturnsByChallan(companyId.toString(), challanNumber);

      this.sendSuccess(res, returns, 'Returns fetched successfully');
    } catch (error: any) {
      logger.error('Error fetching returns by challan', { error, challanNumber: req.params.challanNumber });
      this.sendError(res, error, 'Failed to fetch returns by challan');
    }
  };

  /**
   * Get challan return summary
   * GET /api/v1/goods-returns/challan/:challanNumber/summary
   */
  getChallanReturnSummary = async (req: Request, res: Response): Promise<void> => {
    try {
      const companyId = (req as any).company?._id || (req as any).user?.primaryCompanyId;
      const { challanNumber } = req.params;

      if (!companyId) {
        this.sendError(res, new AppError('Company ID is required', 400), 'Company ID is required');
        return;
      }

      if (!challanNumber) {
        this.sendError(res, new AppError('Challan number is required', 400), 'Validation error');
        return;
      }

      const summary = await this.goodsReturnService.getChallanReturnSummary(companyId.toString(), challanNumber);

      this.sendSuccess(res, summary, 'Challan return summary fetched successfully');
    } catch (error: any) {
      logger.error('Error fetching challan return summary', { error, challanNumber: req.params.challanNumber });
      this.sendError(res, error, 'Failed to fetch challan return summary');
    }
  };

  /**
   * Get all goods returns with filtering and pagination
   * GET /api/v1/goods-returns
   */
  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const companyId = (req as any).company?._id || (req as any).user?.primaryCompanyId;

      if (!companyId) {
        this.sendError(res, new AppError('Company ID is required', 400), 'Company ID is required');
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const sortBy = (req.query.sortBy as string) || 'returnDate';
      const sortOrder = (req.query.sortOrder as string) === 'asc' ? 1 : -1;
      const sort: any = { [sortBy]: sortOrder };

      // Build filter
      const filter: any = {
        companyId: new (await import('mongoose')).Types.ObjectId(companyId.toString()),
      };

      // Status filter
      if (req.query.status && req.query.status !== 'all') {
        filter.status = req.query.status;
      }

      // Return status filter
      if (req.query.returnStatus && req.query.returnStatus !== 'all') {
        filter.returnStatus = req.query.returnStatus;
      }

      // Return reason filter
      if (req.query.returnReason && req.query.returnReason !== 'all') {
        filter.returnReason = req.query.returnReason;
      }

      // Challan number filter
      if (req.query.challanNumber) {
        filter.originalChallanNumber = { $regex: req.query.challanNumber, $options: 'i' };
      }

      // Inventory item filter
      if (req.query.inventoryItemId) {
        filter.inventoryItemId = new (await import('mongoose')).Types.ObjectId(req.query.inventoryItemId as string);
      }

      // Date range filter
      if (req.query.dateFrom || req.query.dateTo) {
        filter.returnDate = {};
        if (req.query.dateFrom) {
          filter.returnDate.$gte = new Date(req.query.dateFrom as string);
        }
        if (req.query.dateTo) {
          const endDate = new Date(req.query.dateTo as string);
          endDate.setHours(23, 59, 59, 999);
          filter.returnDate.$lte = endDate;
        }
      }

      // Search filter
      if (req.query.search) {
        const searchTerm = req.query.search as string;
        filter.$or = [
          { itemName: { $regex: searchTerm, $options: 'i' } },
          { itemCode: { $regex: searchTerm, $options: 'i' } },
          { returnNumber: { $regex: searchTerm, $options: 'i' } },
          { originalChallanNumber: { $regex: searchTerm, $options: 'i' } },
        ];
      }

      logger.info('Getting goods returns with filter', { page, limit, filter });

      const result = await this.goodsReturnService.paginate(filter, page, limit, sort, [
        'inventoryItemId',
        'warehouseId',
        'supplierId',
        'createdBy',
      ]);

      this.sendPaginatedResponse(res, result, 'Goods returns retrieved successfully');
    } catch (error: any) {
      logger.error('Error getting goods returns', { error, query: req.query });
      this.sendError(res, error, 'Failed to get goods returns');
    }
  };
}

