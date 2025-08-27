import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { AdvancedReportService } from '../services/AdvancedReportService';
import { IReport } from '../types/models';

export class AdvancedReportController extends BaseController<IReport> {
  private advancedReportService: AdvancedReportService;

  constructor() {
    const advancedReportService = new AdvancedReportService();
    super(advancedReportService, 'AdvancedReport');
    this.advancedReportService = advancedReportService;
  }
  /**
   * Get advanced reports by company
   */
  async getReportsByCompany(req: Request, res: Response) {
    try {
      const { companyId } = req.user!;

      const reports = await this.advancedReportService.getReportsByCompany(companyId.toString());

      this.sendSuccess(res, reports, 'Advanced reports retrieved successfully');
    } catch (error) {
      console.error('Error getting advanced reports:', error);
      this.sendError(res, error);
    }
  }

  /**
   * Create new advanced report
   */
  async createReport(req: Request, res: Response) {
    try {
      const { companyId, userId } = req.user!;

      const reportData = {
        ...req.body,
        companyId
      };

      const report = await this.advancedReportService.createAdvancedReport(reportData, userId.toString());

      this.sendSuccess(res, report, 'Advanced report created successfully', 201);
    } catch (error) {
      console.error('Error creating advanced report:', error);
      this.sendError(res, error);
    }
  }

  /**
   * Get advanced report by ID
   */
  async getReportById(req: Request, res: Response) {
    try {
      const { companyId } = req.user!;
      const { id } = req.params;

      const report = await this.advancedReportService.findById(id);

      if (!report || report.companyId.toString() !== companyId.toString()) {
        return res.status(404).json({
          success: false,
          message: 'Advanced report not found'
        });
      }

      this.sendSuccess(res, report, 'Advanced report retrieved successfully');
    } catch (error) {
      console.error('Error getting advanced report:', error);
      this.sendError(res, error);
    }
  }

  /**
   * Update advanced report
   */
  async updateReport(req: Request, res: Response) {
    try {
      const { companyId, userId } = req.user!;
      const { id } = req.params;

      const report = await this.advancedReportService.updateAdvancedReport(
        id,
        req.body,
        userId.toString()
      );

      if (!report || report.companyId.toString() !== companyId.toString()) {
        return res.status(404).json({
          success: false,
          message: 'Advanced report not found'
        });
      }

      this.sendSuccess(res, report, 'Advanced report updated successfully');
    } catch (error) {
      console.error('Error updating advanced report:', error);
      this.sendError(res, error);
    }
  }

  /**
   * Delete advanced report
   */
  async deleteReport(req: Request, res: Response) {
    try {
      const { companyId } = req.user!;
      const { id } = req.params;

      const report = await this.advancedReportService.findById(id);

      if (!report || report.companyId.toString() !== companyId.toString()) {
        return res.status(404).json({
          success: false,
          message: 'Advanced report not found'
        });
      }

      await this.advancedReportService.delete(id);

      this.sendSuccess(res, report, 'Advanced report deleted successfully');
    } catch (error) {
      console.error('Error deleting advanced report:', error);
      this.sendError(res, error);
    }
  }

  /**
   * Generate report data
   */
  async generateReport(req: Request, res: Response) {
    try {
      const { companyId } = req.user!;
      const { reportType, dateRange, filters } = req.body;
      
      // This would contain the actual report generation logic
      // For now, returning a placeholder response
      const reportData = {
        reportType,
        dateRange,
        filters,
        generatedAt: new Date(),
        data: {
          summary: 'Report generated successfully',
          metrics: {},
          charts: [],
          tables: []
        }
      };
      
      this.sendSuccess(res, reportData, 'Report generated successfully');
    } catch (error) {
      console.error('Error generating report:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while generating report'
      });
    }
  }

  /**
   * Export report
   */
  async exportReport(req: Request, res: Response) {
    try {
      const { companyId } = req.user!;
      const { id } = req.params;
      const { format = 'pdf' } = req.query;

      const report = await this.advancedReportService.findById(id);

      if (!report || report.companyId.toString() !== companyId.toString()) {
        return res.status(404).json({
          success: false,
          message: 'Advanced report not found'
        });
      }

      // This would contain the actual export logic
      // For now, returning a placeholder response
      const exportData = {
        reportId: id,
        format,
        exportedAt: new Date(),
        downloadUrl: `/api/v1/advanced-reports/${id}/download?format=${format}`
      };

      this.sendSuccess(res, exportData, 'Report export initiated successfully');
    } catch (error) {
      console.error('Error exporting report:', error);
      this.sendError(res, error);
    }
  }

  /**
   * Schedule report
   */
  async scheduleReport(req: Request, res: Response) {
    try {
      const { companyId, userId } = req.user!;
      const { reportId, schedule } = req.body;

      const report = await this.advancedReportService.findById(reportId);

      if (!report || report.companyId.toString() !== companyId.toString()) {
        return res.status(404).json({
          success: false,
          message: 'Advanced report not found'
        });
      }

      const scheduleData = await this.advancedReportService.scheduleReport(
        reportId,
        schedule,
        userId.toString()
      );

      this.sendSuccess(res, scheduleData, 'Report scheduled successfully');
    } catch (error) {
      console.error('Error scheduling report:', error);
      this.sendError(res, error);
    }
  }
}
