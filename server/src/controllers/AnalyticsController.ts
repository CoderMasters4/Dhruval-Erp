import { Request, Response } from 'express';
import { AnalyticsService } from '../services/AnalyticsService';

export class AnalyticsController {
  private analyticsService: AnalyticsService;

  constructor() {
    this.analyticsService = new AnalyticsService();
  }

  private sendSuccess(res: Response, data: any, message: string, statusCode: number = 200): void {
    res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  private sendError(res: Response, error: any, message: string, statusCode: number = 500): void {
    res.status(statusCode).json({
      success: false,
      message,
      error: error.message || 'Unknown error'
    });
  }

  /**
   * Get comprehensive analytics dashboard data
   */
  async getAnalyticsDashboard(req: Request, res: Response): Promise<void> {
    try {
      const companyId = req.user?.companyId;
      const { 
        timeRange = '30d',
        departments,
        metrics,
        startDate,
        endDate 
      } = req.query;

      if (!companyId) {
        this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
        return;
      }

      const params = {
        companyId: companyId.toString(),
        timeRange: timeRange as string,
        departments: departments ? (Array.isArray(departments) ? departments as string[] : [departments as string]) : undefined,
        metrics: metrics ? (Array.isArray(metrics) ? metrics as string[] : [metrics as string]) : undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      };

      const dashboardData = await this.analyticsService.getAnalyticsDashboard(params);
      this.sendSuccess(res, dashboardData, 'Analytics dashboard data retrieved successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to get analytics dashboard data');
    }
  }

  /**
   * Get KPI data with comparison
   */
  async getKPIData(req: Request, res: Response): Promise<void> {
    try {
      const companyId = req.user?.companyId;
      const { 
        timeRange = '30d',
        comparisonPeriod = 'previous',
        startDate,
        endDate 
      } = req.query;

      if (!companyId) {
        this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
        return;
      }

      const params = {
        companyId: companyId.toString(),
        timeRange: timeRange as string,
        comparisonPeriod: comparisonPeriod as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      };

      const kpiData = await this.analyticsService.getKPIData(params);
      this.sendSuccess(res, kpiData, 'KPI data retrieved successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to get KPI data');
    }
  }

  /**
   * Get daily reports
   */
  async getDailyReports(req: Request, res: Response): Promise<void> {
    try {
      const companyId = req.user?.companyId;
      const { 
        date,
        departments,
        metrics,
        includeDetails = 'false'
      } = req.query;

      if (!companyId) {
        this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
        return;
      }

      const params = {
        companyId: companyId.toString(),
        date: date ? new Date(date as string) : new Date(),
        departments: departments ? (Array.isArray(departments) ? departments as string[] : [departments as string]) : undefined,
        metrics: metrics ? (Array.isArray(metrics) ? metrics as string[] : [metrics as string]) : undefined,
        includeDetails: includeDetails === 'true',
      };

      const dailyReports = await this.analyticsService.getDailyReports(params);
      this.sendSuccess(res, dailyReports, 'Daily reports retrieved successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to get daily reports');
    }
  }

  /**
   * Get weekly reports
   */
  async getWeeklyReports(req: Request, res: Response): Promise<void> {
    try {
      const companyId = req.user?.companyId;
      const { 
        weekStart,
        weekEnd,
        departments,
        metrics,
        includeDetails = 'false'
      } = req.query;

      if (!companyId) {
        this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
        return;
      }

      const params = {
        companyId: companyId.toString(),
        weekStart: weekStart ? new Date(weekStart as string) : undefined,
        weekEnd: weekEnd ? new Date(weekEnd as string) : undefined,
        departments: departments ? (Array.isArray(departments) ? departments as string[] : [departments as string]) : undefined,
        metrics: metrics ? (Array.isArray(metrics) ? metrics as string[] : [metrics as string]) : undefined,
        includeDetails: includeDetails === 'true',
      };

      const weeklyReports = await this.analyticsService.getWeeklyReports(params);
      this.sendSuccess(res, weeklyReports, 'Weekly reports retrieved successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to get weekly reports');
    }
  }

  /**
   * Get monthly reports
   */
  async getMonthlyReports(req: Request, res: Response): Promise<void> {
    try {
      const companyId = req.user?.companyId;
      const { 
        year,
        month,
        departments,
        metrics,
        includeDetails = 'false'
      } = req.query;

      if (!companyId) {
        this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
        return;
      }

      const params = {
        companyId: companyId.toString(),
        year: year ? parseInt(year as string) : new Date().getFullYear(),
        month: month ? parseInt(month as string) : new Date().getMonth() + 1,
        departments: departments ? (Array.isArray(departments) ? departments as string[] : [departments as string]) : undefined,
        metrics: metrics ? (Array.isArray(metrics) ? metrics as string[] : [metrics as string]) : undefined,
        includeDetails: includeDetails === 'true',
      };

      const monthlyReports = await this.analyticsService.getMonthlyReports(params);
      this.sendSuccess(res, monthlyReports, 'Monthly reports retrieved successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to get monthly reports');
    }
  }

  /**
   * Get custom filtered reports
   */
  async getCustomReports(req: Request, res: Response): Promise<void> {
    try {
      const companyId = req.user?.companyId;
      const { 
        startDate,
        endDate,
        departments,
        products,
        statuses,
        metrics,
        groupBy,
        sortBy,
        sortOrder = 'desc',
        page = '1',
        limit = '50'
      } = req.query;

      if (!companyId) {
        this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
        return;
      }

      if (!startDate || !endDate) {
        this.sendError(res, new Error('Start date and end date are required'), 'Date range is required', 400);
        return;
      }

      const params = {
        companyId: companyId.toString(),
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string),
        departments: departments ? (Array.isArray(departments) ? departments as string[] : [departments as string]) : undefined,
        products: products ? (Array.isArray(products) ? products as string[] : [products as string]) : undefined,
        statuses: statuses ? (Array.isArray(statuses) ? statuses as string[] : [statuses as string]) : undefined,
        metrics: metrics ? (Array.isArray(metrics) ? metrics as string[] : [metrics as string]) : undefined,
        groupBy: groupBy as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      };

      const customReports = await this.analyticsService.getCustomReports(params);
      this.sendSuccess(res, customReports, 'Custom reports retrieved successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to get custom reports');
    }
  }

  /**
   * Export reports in various formats
   */
  async exportReport(req: Request, res: Response): Promise<void> {
    try {
      const companyId = req.user?.companyId;
      const { 
        reportType,
        format,
        timeRange,
        startDate,
        endDate,
        departments,
        products,
        statuses,
        includeCharts = 'false',
        includeDetails = 'false'
      } = req.body;

      if (!companyId) {
        this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
        return;
      }

      if (!reportType || !format) {
        this.sendError(res, new Error('Report type and format are required'), 'Report type and format are required', 400);
        return;
      }

      const params = {
        companyId: companyId.toString(),
        reportType: reportType as string,
        format: format as 'pdf' | 'excel' | 'csv',
        timeRange: timeRange as string,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        departments: departments ? (Array.isArray(departments) ? departments : [departments]) : undefined,
        products: products ? (Array.isArray(products) ? products : [products]) : undefined,
        statuses: statuses ? (Array.isArray(statuses) ? statuses : [statuses]) : undefined,
        includeCharts: includeCharts === 'true',
        includeDetails: includeDetails === 'true',
      };

      const exportResult = await this.analyticsService.exportReport(params);
      this.sendSuccess(res, exportResult, 'Report exported successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to export report');
    }
  }

  /**
   * Get available filter options
   */
  async getFilterOptions(req: Request, res: Response): Promise<void> {
    try {
      const companyId = req.user?.companyId;

      if (!companyId) {
        this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
        return;
      }

      const filterOptions = await this.analyticsService.getFilterOptions(companyId.toString());
      this.sendSuccess(res, filterOptions, 'Filter options retrieved successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to get filter options');
    }
  }

  /**
   * Get report templates
   */
  async getReportTemplates(req: Request, res: Response): Promise<void> {
    try {
      const companyId = req.user?.companyId;

      if (!companyId) {
        this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
        return;
      }

      const templates = await this.analyticsService.getReportTemplates(companyId.toString());
      this.sendSuccess(res, templates, 'Report templates retrieved successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to get report templates');
    }
  }

  /**
   * Save custom report template
   */
  async saveReportTemplate(req: Request, res: Response): Promise<void> {
    try {
      const companyId = req.user?.companyId;
      const { name, description, filters, metrics, groupBy, sortBy, sortOrder } = req.body;

      if (!companyId) {
        this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
        return;
      }

      if (!name || !filters || !metrics) {
        this.sendError(res, new Error('Name, filters, and metrics are required'), 'Required fields missing', 400);
        return;
      }

      const templateData = {
        companyId: companyId.toString(),
        name,
        description,
        filters,
        metrics,
        groupBy,
        sortBy,
        sortOrder: sortOrder || 'desc',
        createdBy: (req.user?.userId || req.user?._id)?.toString(),
      };

      const savedTemplate = await this.analyticsService.saveReportTemplate(templateData);
      this.sendSuccess(res, savedTemplate, 'Report template saved successfully', 201);
    } catch (error) {
      this.sendError(res, error, 'Failed to save report template');
    }
  }

  /**
   * Get real-time analytics
   */
  async getRealTimeAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const companyId = req.user?.companyId;
      const { metrics, refreshInterval = '30' } = req.query;

      if (!companyId) {
        this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
        return;
      }

      const params = {
        companyId: companyId.toString(),
        metrics: metrics ? (Array.isArray(metrics) ? metrics as string[] : [metrics as string]) : undefined,
        refreshInterval: parseInt(refreshInterval as string),
      };

      const realTimeData = await this.analyticsService.getRealTimeAnalytics(params);
      this.sendSuccess(res, realTimeData, 'Real-time analytics retrieved successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to get real-time analytics');
    }
  }
}
