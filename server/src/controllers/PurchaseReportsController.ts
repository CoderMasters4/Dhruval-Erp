import { Request, Response } from 'express';
import { PurchaseReportsService, ReportFilters } from '../services/PurchaseReportsService';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import PurchaseOrder from '../models/PurchaseOrder';
import { Types } from 'mongoose';

export class PurchaseReportsController {
  private reportsService: PurchaseReportsService;
  private modelName: string = 'PurchaseReports';

  constructor() {
    this.reportsService = new PurchaseReportsService();
  }

  protected sendSuccess(
    res: Response, 
    data: any, 
    message: string = 'Operation successful', 
    statusCode: number = 200
  ): void {
    res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  protected sendError(
    res: Response, 
    error: any, 
    message: string = 'Operation failed', 
    statusCode: number = 500
  ): void {
    logger.error(`${this.modelName} controller error`, { error, message });
    
    res.status(statusCode).json({
      success: false,
      message,
      error: error?.message || error,
      timestamp: new Date().toISOString()
    });
  }

  private getTargetCompanyId(user: any, companyId?: string | any): string | null {
    // Helper function to convert any ID to string
    const convertToString = (id: any): string | null => {
      if (!id) return null;
      if (typeof id === 'string') return id;
      if (id instanceof Types.ObjectId) return id.toString();
      if (typeof id === 'object') {
        // Check for Mongoose ObjectId methods
        if (typeof id.toHexString === 'function') return id.toHexString();
        if (typeof id.toString === 'function') {
          const str = id.toString();
          if (str !== '[object Object]') return str;
        }
        // Check for common ObjectId properties
        if (id._id) return convertToString(id._id);
        if (id.id) return convertToString(id.id);
        if (id.value) return String(id.value);
      }
      const str = String(id);
      return str !== '[object Object]' ? str : null;
    };

    if (companyId && user.isSuperAdmin) {
      return convertToString(companyId);
    }
    
    // Get companyId from user and ensure it's a string
    const userCompanyId = user.companyAccess?.[0]?.companyId || user.companyId;
    return convertToString(userCompanyId);
  }

  private sendUnauthorized(res: Response): void {
    this.sendError(res, new Error('Unauthorized'), 'User authentication required', 401);
  }

  private sendBadRequest(res: Response, message: string): void {
    this.sendError(res, new Error(message), message, 400);
  }

  /**
   * Get Vendor-wise Purchase Summary
   */
  async getVendorWiseSummary(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as any;
      if (!user) {
        this.sendUnauthorized(res);
        return;
      }

      const { companyId, vendorId, dateFrom, dateTo } = req.query;
      const targetCompanyId = this.getTargetCompanyId(user, companyId as string);

      if (!targetCompanyId) {
        this.sendBadRequest(res, 'Company ID is required');
        return;
      }

      const filters: ReportFilters = {
        companyId: targetCompanyId,
        vendorId: vendorId as string,
        dateFrom: dateFrom as string,
        dateTo: dateTo as string
      };

      const report = await this.reportsService.getVendorWisePurchaseSummary(filters);
      this.sendSuccess(res, report, 'Vendor-wise purchase summary retrieved successfully');
    } catch (error) {
      this.sendError(res, error as Error, 'Failed to get vendor-wise purchase summary', 500);
    }
  }

  /**
   * Get Item-wise Purchase Report
   */
  async getItemWiseReport(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as any;
      if (!user) {
        this.sendUnauthorized(res);
        return;
      }

      const { companyId, itemId, category, dateFrom, dateTo } = req.query;
      const targetCompanyId = this.getTargetCompanyId(user, companyId as string);

      if (!targetCompanyId) {
        this.sendBadRequest(res, 'Company ID is required');
        return;
      }

      const filters: ReportFilters = {
        companyId: targetCompanyId,
        itemId: itemId as string,
        category: category as string,
        dateFrom: dateFrom as string,
        dateTo: dateTo as string
      };

      const report = await this.reportsService.getItemWisePurchaseReport(filters);
      this.sendSuccess(res, report, 'Item-wise purchase report retrieved successfully');
    } catch (error) {
      this.sendError(res, error as Error, 'Failed to get item-wise purchase report', 500);
    }
  }

  /**
   * Get Category-wise Purchase Report
   */
  async getCategoryWiseReport(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as any;
      if (!user) {
        this.sendUnauthorized(res);
        return;
      }

      const { companyId, category, dateFrom, dateTo } = req.query;
      const targetCompanyId = this.getTargetCompanyId(user, companyId as string);

      if (!targetCompanyId) {
        this.sendBadRequest(res, 'Company ID is required');
        return;
      }

      const filters: ReportFilters = {
        companyId: targetCompanyId,
        category: category as string,
        dateFrom: dateFrom as string,
        dateTo: dateTo as string
      };

      const report = await this.reportsService.getCategoryWisePurchaseReport(filters);
      this.sendSuccess(res, report, 'Category-wise purchase report retrieved successfully');
    } catch (error) {
      this.sendError(res, error as Error, 'Failed to get category-wise purchase report', 500);
    }
  }

  /**
   * Get Date Range Report
   */
  async getDateRangeReport(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as any;
      if (!user) {
        this.sendUnauthorized(res);
        return;
      }

      const { companyId, vendorId, dateFrom, dateTo } = req.query;
      const targetCompanyId = this.getTargetCompanyId(user, companyId as string);

      if (!targetCompanyId) {
        this.sendBadRequest(res, 'Company ID is required');
        return;
      }

      if (!dateFrom || !dateTo) {
        this.sendBadRequest(res, 'Date range (dateFrom and dateTo) is required');
        return;
      }

      const filters: ReportFilters = {
        companyId: targetCompanyId,
        vendorId: vendorId as string,
        dateFrom: dateFrom as string,
        dateTo: dateTo as string
      };

      const report = await this.reportsService.getDateRangeReport(filters);
      this.sendSuccess(res, report, 'Date range report retrieved successfully');
    } catch (error) {
      this.sendError(res, error as Error, 'Failed to get date range report', 500);
    }
  }

  /**
   * Export Report (Excel or PDF)
   */
  async exportReport(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as any;
      if (!user) {
        this.sendUnauthorized(res);
        return;
      }

      const { reportType, format } = req.params;
      const { companyId, vendorId, itemId, category, dateFrom, dateTo } = req.body;

      const targetCompanyId = this.getTargetCompanyId(user, companyId);

      if (!targetCompanyId) {
        this.sendBadRequest(res, 'Company ID is required');
        return;
      }

      if (!['xlsx', 'pdf'].includes(format)) {
        this.sendBadRequest(res, 'Invalid format. Supported formats: xlsx, pdf');
        return;
      }

      const filters: ReportFilters = {
        companyId: targetCompanyId,
        vendorId,
        itemId,
        category,
        dateFrom,
        dateTo
      };

      let reportData: any;
      let fileName: string;

      switch (reportType) {
        case 'vendor-wise':
          reportData = await this.reportsService.getVendorWisePurchaseSummary(filters);
          fileName = `vendor-wise-purchase-summary-${new Date().toISOString().split('T')[0]}`;
          break;
        case 'item-wise':
          reportData = await this.reportsService.getItemWisePurchaseReport(filters);
          fileName = `item-wise-purchase-report-${new Date().toISOString().split('T')[0]}`;
          break;
        case 'category-wise':
          reportData = await this.reportsService.getCategoryWisePurchaseReport(filters);
          fileName = `category-wise-purchase-report-${new Date().toISOString().split('T')[0]}`;
          break;
        case 'date-range':
          if (!dateFrom || !dateTo) {
            this.sendBadRequest(res, 'Date range (dateFrom and dateTo) is required for date range report');
            return;
          }
          reportData = await this.reportsService.getDateRangeReport(filters);
          fileName = `date-range-purchase-report-${dateFrom}-to-${dateTo}`;
          break;
        default:
          this.sendBadRequest(res, 'Invalid report type');
          return;
      }

      // TODO: Implement actual Excel/PDF generation
      // For now, return a placeholder download URL
      const downloadUrl = `/api/v1/purchase/reports/export/${reportType}/${fileName}.${format}`;

      this.sendSuccess(res, {
        downloadUrl,
        fileName: `${fileName}.${format}`,
        format,
        reportType,
        recordCount: Array.isArray(reportData) ? reportData.length : 1
      }, 'Report export generated successfully');
    } catch (error) {
      this.sendError(res, error as Error, 'Failed to export report', 500);
    }
  }
}

