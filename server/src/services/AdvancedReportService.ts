import { Types } from 'mongoose';
import { BaseService } from './BaseService';
import { Report } from '../models';
import { IReport } from '../types/models';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export class AdvancedReportService extends BaseService<IReport> {
  constructor() {
    super(Report);
  }

  /**
   * Create a new advanced report
   */
  async createAdvancedReport(reportData: Partial<IReport>, createdBy?: string): Promise<IReport> {
    try {
      // Validate report data
      this.validateReportData(reportData);

      // Check if report name already exists for the company
      if (reportData.reportName && reportData.companyId) {
        const existingReport = await this.findOne({ 
          reportName: reportData.reportName,
          companyId: reportData.companyId 
        });

        if (existingReport) {
          throw new AppError('Report name already exists for this company', 400);
        }
      }

      // Generate report ID if not provided
      if (!reportData.reportId) {
        reportData.reportId = await this.generateReportId(reportData.companyId!);
      }

      // Set created by
      if (createdBy) {
        reportData.createdBy = new Types.ObjectId(createdBy);
        reportData.updatedBy = new Types.ObjectId(createdBy);
      }

      const report = await this.create(reportData);
      logger.info('Advanced report created successfully', { reportId: report.reportId });
      
      return report;
    } catch (error) {
      logger.error('Error creating advanced report:', error);
      throw error;
    }
  }

  /**
   * Update an advanced report
   */
  async updateAdvancedReport(
    reportId: string,
    updateData: Partial<IReport>,
    updatedBy?: string
  ): Promise<IReport> {
    try {
      // Set updated by
      if (updatedBy) {
        updateData.updatedBy = new Types.ObjectId(updatedBy);
      }

      const report = await this.update(reportId, updateData);
      if (!report) {
        throw new AppError('Advanced report not found', 404);
      }

      logger.info('Advanced report updated successfully', { reportId: report.reportId });
      return report;
    } catch (error) {
      logger.error('Error updating advanced report:', error);
      throw error;
    }
  }

  /**
   * Get reports by company
   */
  async getReportsByCompany(companyId: string, options: any = {}): Promise<IReport[]> {
    try {
      const filter = { companyId: new Types.ObjectId(companyId) };
      
      // Add category filter if provided
      if (options.category) {
        (filter as any).reportCategory = options.category;
      }

      // Add status filter if provided
      if (options.status) {
        (filter as any).status = options.status;
      }

      const reports = await this.findMany(filter, {
        sort: { createdAt: -1 },
        populate: [
          { path: 'createdBy', select: 'name email' },
          { path: 'updatedBy', select: 'name email' }
        ]
      });

      return reports;
    } catch (error) {
      logger.error('Error getting reports by company:', error);
      throw error;
    }
  }

  /**
   * Generate report data
   */
  async generateReportData(reportId: string, parameters: any): Promise<any> {
    try {
      const report = await this.findById(reportId);
      if (!report) {
        throw new AppError('Advanced report not found', 404);
      }

      // This would contain the actual report generation logic
      // For now, returning a placeholder
      const reportData = {
        reportId,
        reportName: report.reportName,
        category: report.reportCategory,
        generatedAt: new Date(),
        parameters,
        data: {
          summary: 'Report generated successfully',
          metrics: {},
          charts: [],
          tables: []
        }
      };

      logger.info('Report data generated successfully', { reportId });
      return reportData;
    } catch (error) {
      logger.error('Error generating report data:', error);
      throw error;
    }
  }

  /**
   * Schedule report
   */
  async scheduleReport(reportId: string, schedule: any, scheduledBy?: string): Promise<any> {
    try {
      const report = await this.findById(reportId);
      if (!report) {
        throw new AppError('Advanced report not found', 404);
      }

      // This would contain the actual scheduling logic
      // For now, returning a placeholder
      const scheduleData = {
        reportId,
        schedule,
        scheduledBy,
        scheduledAt: new Date(),
        nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000) // Next day
      };

      logger.info('Report scheduled successfully', { reportId });
      return scheduleData;
    } catch (error) {
      logger.error('Error scheduling report:', error);
      throw error;
    }
  }

  /**
   * Validate report data
   */
  private validateReportData(reportData: Partial<IAdvancedReport>): void {
    if (!reportData.reportName) {
      throw new AppError('Report name is required', 400);
    }

    if (!reportData.reportCategory) {
      throw new AppError('Report category is required', 400);
    }

    if (!reportData.companyId) {
      throw new AppError('Company ID is required', 400);
    }
  }

  /**
   * Generate unique report ID
   */
  private async generateReportId(companyId: Types.ObjectId): Promise<string> {
    const prefix = 'RPT';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    
    let reportId = `${prefix}-${timestamp}-${random}`;
    
    // Ensure uniqueness
    let counter = 1;
    while (await this.findOne({ reportId, companyId })) {
      reportId = `${prefix}-${timestamp}-${random}-${counter}`;
      counter++;
    }
    
    return reportId;
  }

  /**
   * Get report statistics
   */
  async getReportStatistics(companyId: string): Promise<any> {
    try {
      const filter = { companyId: new Types.ObjectId(companyId) };
      
      const [
        totalReports,
        activeReports,
        draftReports,
        categoryStats
      ] = await Promise.all([
        this.model.countDocuments(filter),
        this.model.countDocuments({ ...filter, status: 'active' }),
        this.model.countDocuments({ ...filter, status: 'draft' }),
        this.model.aggregate([
          { $match: filter },
          { $group: { _id: '$reportCategory', count: { $sum: 1 } } }
        ])
      ]);

      return {
        totalReports,
        activeReports,
        draftReports,
        categoryStats: categoryStats.reduce((acc: any, item: any) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      };
    } catch (error) {
      logger.error('Error getting report statistics:', error);
      throw error;
    }
  }
}
