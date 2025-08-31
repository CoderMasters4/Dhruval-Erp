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

  /**
   * Get scheduled reports
   */
  async getScheduledReports(req: Request, res: Response) {
    try {
      const { companyId } = req.user!;
      const scheduledReports = await this.advancedReportService.getScheduledReports(companyId.toString());
      this.sendSuccess(res, scheduledReports, 'Scheduled reports retrieved successfully');
    } catch (error) {
      console.error('Error getting scheduled reports:', error);
      this.sendError(res, error);
    }
  }

  /**
   * Get report templates
   */
  async getReportTemplates(req: Request, res: Response) {
    try {
      const { companyId } = req.user!;
      const templates = await this.advancedReportService.getReportTemplates(companyId.toString());
      this.sendSuccess(res, templates, 'Report templates retrieved successfully');
    } catch (error) {
      console.error('Error getting report templates:', error);
      this.sendError(res, error);
    }
  }

  /**
   * Get public reports
   */
  async getPublicReports(req: Request, res: Response) {
    try {
      const { companyId } = req.user!;
      const publicReports = await this.advancedReportService.getPublicReports(companyId.toString());
      this.sendSuccess(res, publicReports, 'Public reports retrieved successfully');
    } catch (error) {
      console.error('Error getting public reports:', error);
      this.sendError(res, error);
    }
  }

  /**
   * Clone report
   */
  async cloneReport(req: Request, res: Response) {
    try {
      const { companyId, userId } = req.user!;
      const { id } = req.params;
      const clonedReport = await this.advancedReportService.cloneReport(id, userId.toString());
      this.sendSuccess(res, clonedReport, 'Report cloned successfully');
    } catch (error) {
      console.error('Error cloning report:', error);
      this.sendError(res, error);
    }
  }

  /**
   * Get report status
   */
  async getReportStatus(req: Request, res: Response) {
    try {
      const { companyId } = req.user!;
      const { id } = req.params;
      const status = await this.advancedReportService.getReportStatus(id);
      this.sendSuccess(res, status, 'Report status retrieved successfully');
    } catch (error) {
      console.error('Error getting report status:', error);
      this.sendError(res, error);
    }
  }

  /**
   * Update schedule
   */
  async updateSchedule(req: Request, res: Response) {
    try {
      const { companyId, userId } = req.user!;
      const { id } = req.params;
      const { schedule } = req.body;
      const updatedSchedule = await this.advancedReportService.updateSchedule(id, schedule, userId.toString());
      this.sendSuccess(res, updatedSchedule, 'Schedule updated successfully');
    } catch (error) {
      console.error('Error updating schedule:', error);
      this.sendError(res, error);
    }
  }

  /**
   * Update distribution
   */
  async updateDistribution(req: Request, res: Response) {
    try {
      const { companyId, userId } = req.user!;
      const { id } = req.params;
      const { distribution } = req.body;
      const updatedDistribution = await this.advancedReportService.updateDistribution(id, distribution, userId.toString());
      this.sendSuccess(res, updatedDistribution, 'Distribution updated successfully');
    } catch (error) {
      console.error('Error updating distribution:', error);
      this.sendError(res, error);
    }
  }

  /**
   * Update access control
   */
  async updateAccessControl(req: Request, res: Response) {
    try {
      const { companyId, userId } = req.user!;
      const { id } = req.params;
      const { accessControl } = req.body;
      const updatedAccessControl = await this.advancedReportService.updateAccessControl(id, accessControl, userId.toString());
      this.sendSuccess(res, updatedAccessControl, 'Access control updated successfully');
    } catch (error) {
      console.error('Error updating access control:', error);
      this.sendError(res, error);
    }
  }

  /**
   * Get report analytics
   */
  async getReportAnalytics(req: Request, res: Response) {
    try {
      const { companyId } = req.user!;
      const { id } = req.params;
      const analytics = await this.advancedReportService.getReportAnalytics(id);
      this.sendSuccess(res, analytics, 'Report analytics retrieved successfully');
    } catch (error) {
      console.error('Error getting report analytics:', error);
      this.sendError(res, error);
    }
  }

  /**
   * Grant access
   */
  async grantAccess(req: Request, res: Response) {
    try {
      const { companyId, userId } = req.user!;
      const { id } = req.params;
      const { targetUserId, permissions } = req.body;
      const accessGranted = await this.advancedReportService.grantAccess(id, targetUserId, permissions, userId.toString());
      this.sendSuccess(res, accessGranted, 'Access granted successfully');
    } catch (error) {
      console.error('Error granting access:', error);
      this.sendError(res, error);
    }
  }

  /**
   * Revoke access
   */
  async revokeAccess(req: Request, res: Response) {
    try {
      const { companyId, userId } = req.user!;
      const { id, userId: targetUserId } = req.params;
      await this.advancedReportService.revokeAccess(id, targetUserId, userId.toString());
      this.sendSuccess(res, null, 'Access revoked successfully');
    } catch (error) {
      console.error('Error revoking access:', error);
      this.sendError(res, error);
    }
  }

  /**
   * Search reports
   */
  async searchReports(req: Request, res: Response) {
    try {
      const { companyId } = req.user!;
      const { query, filters } = req.query;
      const searchResults = await this.advancedReportService.searchReports(companyId.toString(), query as string, filters as any);
      this.sendSuccess(res, searchResults, 'Search results retrieved successfully');
    } catch (error) {
      console.error('Error searching reports:', error);
      this.sendError(res, error);
    }
  }
}
