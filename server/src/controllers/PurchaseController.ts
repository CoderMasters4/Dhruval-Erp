import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { PurchaseService } from '../services/PurchaseService';
import { IPurchaseOrder } from '../types/models';

export class PurchaseController extends BaseController<IPurchaseOrder> {
  private purchaseService: PurchaseService;

  constructor() {
    const purchaseService = new PurchaseService();
    super(purchaseService, 'Purchase');
    this.purchaseService = purchaseService;
  }

  /**
   * Get purchase statistics with company ID support
   */
  async getPurchaseStats(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.query;
      const user = req.user;

      // For super admin, allow filtering by companyId
      // For regular users, use their companyId
      const targetCompanyId = user?.isSuperAdmin && companyId 
        ? companyId.toString() 
        : user?.companyId?.toString();

      if (!targetCompanyId) {
        this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
        return;
      }

      const stats = await this.purchaseService.getPurchaseStats(targetCompanyId);
      this.sendSuccess(res, stats, 'Purchase statistics retrieved successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to get purchase statistics');
    }
  }

  /**
   * Get purchase analytics (combined overview + analytics)
   */
  async getPurchaseAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { period = 'month', companyId } = req.query;
      const user = req.user;

      // For super admin, allow filtering by companyId
      // For regular users, use their companyId
      const targetCompanyId = user?.isSuperAdmin && companyId 
        ? companyId.toString() 
        : user?.companyId?.toString();

      if (!targetCompanyId) {
        this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
        return;
      }

      const analytics = await this.purchaseService.getPurchaseAnalytics(
        targetCompanyId, 
        period.toString()
      );
      this.sendSuccess(res, analytics, 'Purchase analytics retrieved successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to get purchase analytics');
    }
  }

  /**
   * Get purchase orders with company ID filtering
   */
  async getPurchaseOrders(req: Request, res: Response): Promise<void> {
    try {
      const { 
        companyId, 
        status, 
        paymentStatus, 
        supplierId, 
        category, 
        dateFrom, 
        dateTo, 
        search, 
        page = 1, 
        limit = 10 
      } = req.query;
      const user = req.user;

      // For super admin, allow filtering by companyId
      // For regular users, use their companyId
      const targetCompanyId = user?.isSuperAdmin && companyId 
        ? companyId.toString() 
        : user?.companyId?.toString();

      if (!targetCompanyId) {
        this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
        return;
      }

      const filters = {
        companyId: targetCompanyId,
        status: status?.toString(),
        paymentStatus: paymentStatus?.toString(),
        supplierId: supplierId?.toString(),
        category: category?.toString(),
        dateFrom: dateFrom?.toString(),
        dateTo: dateTo?.toString(),
        search: search?.toString(),
        page: parseInt(page.toString()),
        limit: parseInt(limit.toString())
      };

      const orders = await this.purchaseService.getPurchaseOrders(filters);
      this.sendSuccess(res, orders, 'Purchase orders retrieved successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to get purchase orders');
    }
  }

  /**
   * Create a new purchase order with company ID handling
   */
  async createPurchaseOrder(req: Request, res: Response): Promise<void> {
    try {
      const orderData = req.body;
      const user = req.user;

      // For super admin, use provided companyId or default
      // For regular users, use their companyId
      const targetCompanyId = user?.isSuperAdmin && orderData.companyId 
        ? orderData.companyId 
        : user?.companyId?.toString();

      if (!targetCompanyId) {
        this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
        return;
      }

      const order = await this.purchaseService.createPurchaseOrder(
        { ...orderData, companyId: targetCompanyId }, 
        user?.id
      );
      this.sendSuccess(res, order, 'Purchase order created successfully', 201);
    } catch (error) {
      this.sendError(res, error, 'Failed to create purchase order');
    }
  }

  /**
   * Get purchase order by ID
   */
  async getPurchaseOrderById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user;

      const order = await this.purchaseService.getPurchaseOrderById(id, user?.companyId?.toString());
      this.sendSuccess(res, order, 'Purchase order retrieved successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to get purchase order');
    }
  }

  /**
   * Update purchase order
   */
  async updatePurchaseOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const user = req.user;

      const order = await this.purchaseService.updatePurchaseOrder(
        id, 
        updateData, 
        user?.id, 
        user?.companyId?.toString()
      );
      this.sendSuccess(res, order, 'Purchase order updated successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to update purchase order');
    }
  }

  /**
   * Delete purchase order
   */
  async deletePurchaseOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user;

      await this.purchaseService.deletePurchaseOrder(id, user?.companyId?.toString());
      this.sendSuccess(res, null, 'Purchase order deleted successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to delete purchase order');
    }
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { paymentStatus, amount } = req.body;
      const user = req.user;

      const order = await this.purchaseService.updatePaymentStatus(
        id, 
        paymentStatus, 
        amount, 
        user?.id, 
        user?.companyId?.toString()
      );
      this.sendSuccess(res, order, 'Payment status updated successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to update payment status');
    }
  }

  /**
   * Bulk update orders
   */
  async bulkUpdateOrders(req: Request, res: Response): Promise<void> {
    try {
      const { orderIds, updates } = req.body;
      const user = req.user;

      const orders = await this.purchaseService.bulkUpdateOrders(
        orderIds, 
        updates, 
        user?.id, 
        user?.companyId?.toString()
      );
      this.sendSuccess(res, orders, 'Orders updated successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to update orders');
    }
  }

  /**
   * Get orders by status
   */
  async getOrdersByStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.params;
      const { companyId, page = 1, limit = 10 } = req.query;
      const user = req.user;

      // For super admin, allow filtering by companyId
      // For regular users, use their companyId
      const targetCompanyId = user?.isSuperAdmin && companyId 
        ? companyId.toString() 
        : user?.companyId?.toString();

      if (!targetCompanyId) {
        this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
        return;
      }

      const orders = await this.purchaseService.getOrdersByStatus(
        status, 
        targetCompanyId, 
        parseInt(page.toString()), 
        parseInt(limit.toString())
      );
      this.sendSuccess(res, orders, 'Orders retrieved successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to get orders');
    }
  }

  /**
   * Get orders by supplier
   */
  async getOrdersBySupplier(req: Request, res: Response): Promise<void> {
    try {
      const { supplierId } = req.params;
      const { companyId, page = 1, limit = 10 } = req.query;
      const user = req.user;

      // For super admin, allow filtering by companyId
      // For regular users, use their companyId
      const targetCompanyId = user?.isSuperAdmin && companyId 
        ? companyId.toString() 
        : user?.companyId?.toString();

      if (!targetCompanyId) {
        this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
        return;
      }

      const orders = await this.purchaseService.getOrdersBySupplier(
        supplierId, 
        targetCompanyId, 
        parseInt(page.toString()), 
        parseInt(limit.toString())
      );
      this.sendSuccess(res, orders, 'Orders retrieved successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to get orders');
    }
  }

  /**
   * Get supplier report
   */
  async getSupplierReport(req: Request, res: Response): Promise<void> {
    try {
      const { dateFrom, dateTo, companyId } = req.query;
      const user = req.user;

      // For super admin, allow filtering by companyId
      // For regular users, use their companyId
      const targetCompanyId = user?.isSuperAdmin && companyId 
        ? companyId.toString() 
        : user?.companyId?.toString();

      if (!targetCompanyId) {
        this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
        return;
      }

      const report = await this.purchaseService.getSupplierReport(
        targetCompanyId, 
        dateFrom?.toString(), 
        dateTo?.toString()
      );
      this.sendSuccess(res, report, 'Supplier report retrieved successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to get supplier report');
    }
  }

  /**
   * Get category spend
   */
  async getCategorySpend(req: Request, res: Response): Promise<void> {
    try {
      const { dateFrom, dateTo, companyId } = req.query;
      const user = req.user;

      // For super admin, allow filtering by companyId
      // For regular users, use their companyId
      const targetCompanyId = user?.isSuperAdmin && companyId 
        ? companyId.toString() 
        : user?.companyId?.toString();

      if (!targetCompanyId) {
        this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
        return;
      }

      const spend = await this.purchaseService.getCategorySpend(
        targetCompanyId, 
        dateFrom?.toString(), 
        dateTo?.toString()
      );
      this.sendSuccess(res, spend, 'Category spend retrieved successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to get category spend');
    }
  }

  /**
   * Export purchase data
   */
  async exportPurchaseData(req: Request, res: Response): Promise<void> {
    try {
      const { format } = req.params;
      const filters = req.body;
      const user = req.user;

      // For super admin, allow filtering by companyId
      // For regular users, use their companyId
      const targetCompanyId = user?.isSuperAdmin && filters.companyId 
        ? filters.companyId 
        : user?.companyId?.toString();

      if (!targetCompanyId) {
        this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
        return;
      }

      const downloadUrl = await this.purchaseService.exportPurchaseData(
        format, 
        { ...filters, companyId: targetCompanyId }
      );
      this.sendSuccess(res, { downloadUrl }, 'Data exported successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to export data');
    }
  }
}
