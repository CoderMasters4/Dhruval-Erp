import { Request, Response } from 'express';
import { ProductionTrackingService } from '../services/ProductionTrackingService';

export class ProductionTrackingController {
  private productionTrackingService: ProductionTrackingService;

  constructor() {
    this.productionTrackingService = new ProductionTrackingService();
  }

  protected sendSuccess(res: Response, data: any, message: string = 'Operation successful', statusCode: number = 200): void {
    res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  protected sendError(res: Response, error: any, message: string = 'Operation failed', statusCode: number = 500): void {
    res.status(statusCode).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }

  async getProductionTrackingData(req: Request, res: Response): Promise<void> {
    try {
      const {
        companyId,
        date,
        firmId,
        machineId,
        status,
        includeDetails = false
      } = req.query;

      const result = await this.productionTrackingService.getProductionTrackingData({
        companyId: companyId as string,
        date: date as string,
        firmId: firmId as string,
        machineId: machineId as string,
        status: status as string,
        includeDetails: includeDetails === 'true'
      });

      this.sendSuccess(res, result);
    } catch (error) {
      this.sendError(res, error);
    }
  }

  async getPrintingStatus(req: Request, res: Response): Promise<void> {
    try {
      const {
        companyId,
        printingType,
        status,
        machineId,
        operatorId
      } = req.query;

      const result = await this.productionTrackingService.getPrintingStatus({
        companyId: companyId as string,
        printingType: printingType as 'table' | 'machine',
        status: status as string,
        machineId: machineId as string,
        operatorId: operatorId as string
      });

      this.sendSuccess(res, result);
    } catch (error) {
      this.sendError(res, error);
    }
  }

  async getJobWorkTracking(req: Request, res: Response): Promise<void> {
    try {
      const {
        companyId,
        jobType,
        status,
        contractorId,
        startDate,
        endDate
      } = req.query;

      const result = await this.productionTrackingService.getJobWorkTracking({
        companyId: companyId as string,
        jobType: jobType as 'in_house' | 'third_party',
        status: status as string,
        contractorId: contractorId as string,
        startDate: startDate as string,
        endDate: endDate as string
      });

      this.sendSuccess(res, result);
    } catch (error) {
      this.sendError(res, error);
    }
  }

  async getProcessTracking(req: Request, res: Response): Promise<void> {
    try {
      const {
        companyId,
        jobId,
        stage,
        status,
        includeQualityChecks = false
      } = req.query;

      const result = await this.productionTrackingService.getProcessTracking({
        companyId: companyId as string,
        jobId: jobId as string,
        stage: stage as string,
        status: status as string,
        includeQualityChecks: includeQualityChecks === 'true'
      });

      this.sendSuccess(res, result);
    } catch (error) {
      this.sendError(res, error);
    }
  }

  async getDailyProductionSummary(req: Request, res: Response): Promise<void> {
    try {
      const {
        companyId,
        date,
        firmId,
        includeBreakdown = false
      } = req.query;

      const result = await this.productionTrackingService.getDailyProductionSummary({
        companyId: companyId as string,
        date: date as string,
        firmId: firmId as string,
        includeBreakdown: includeBreakdown === 'true'
      });

      this.sendSuccess(res, result);
    } catch (error) {
      this.sendError(res, error);
    }
  }

  async getMachineWiseSummary(req: Request, res: Response): Promise<void> {
    try {
      const {
        companyId,
        machineType,
        status,
        includeMaintenance = false
      } = req.query;

      const result = await this.productionTrackingService.getMachineWiseSummary({
        companyId: companyId as string,
        machineType: machineType as string,
        status: status as string,
        includeMaintenance: includeMaintenance === 'true'
      });

      this.sendSuccess(res, result);
    } catch (error) {
      this.sendError(res, error);
    }
  }

  async updateProductionStatus(req: Request, res: Response): Promise<void> {
    try {
      const {
        jobId,
        stageId,
        status,
        progress,
        operatorId,
        machineId,
        notes,
        qualityChecks
      } = req.body;

      const result = await this.productionTrackingService.updateProductionStatus({
        jobId,
        stageId,
        status,
        progress,
        operatorId,
        machineId,
        notes,
        qualityChecks
      });

      this.sendSuccess(res, result);
    } catch (error) {
      this.sendError(res, error);
    }
  }

  async startProductionStage(req: Request, res: Response): Promise<void> {
    try {
      const {
        jobId,
        stageId,
        operatorId,
        machineId,
        startTime,
        notes
      } = req.body;

      const result = await this.productionTrackingService.startProductionStage({
        jobId,
        stageId,
        operatorId,
        machineId,
        startTime,
        notes
      });

      this.sendSuccess(res, result);
    } catch (error) {
      this.sendError(res, error);
    }
  }

  async completeProductionStage(req: Request, res: Response): Promise<void> {
    try {
      const {
        jobId,
        stageId,
        operatorId,
        completionTime,
        qualityChecks,
        notes
      } = req.body;

      const result = await this.productionTrackingService.completeProductionStage({
        jobId,
        stageId,
        operatorId,
        completionTime,
        qualityChecks,
        notes
      });

      this.sendSuccess(res, result);
    } catch (error) {
      this.sendError(res, error);
    }
  }

  async addQualityCheck(req: Request, res: Response): Promise<void> {
    try {
      const {
        jobId,
        stageId,
        checkType,
        status,
        notes,
        operatorId,
        timestamp
      } = req.body;

      const result = await this.productionTrackingService.addQualityCheck({
        jobId,
        stageId,
        checkType,
        status,
        notes,
        operatorId,
        timestamp
      });

      this.sendSuccess(res, result);
    } catch (error) {
      this.sendError(res, error);
    }
  }

  async getProductionAlerts(req: Request, res: Response): Promise<void> {
    try {
      const {
        companyId,
        alertType,
        severity,
        includeResolved = false
      } = req.query;

      const result = await this.productionTrackingService.getProductionAlerts({
        companyId: companyId as string,
        alertType: alertType as 'delayed' | 'quality' | 'maintenance' | 'efficiency',
        severity: severity as 'low' | 'medium' | 'high' | 'critical',
        includeResolved: includeResolved === 'true'
      });

      this.sendSuccess(res, result);
    } catch (error) {
      this.sendError(res, error);
    }
  }

  async getProductionEfficiency(req: Request, res: Response): Promise<void> {
    try {
      const {
        companyId,
        timeRange = '30d',
        startDate,
        endDate,
        firmId,
        machineId,
        metric = 'overall'
      } = req.query;

      const result = await this.productionTrackingService.getProductionEfficiency({
        companyId: companyId as string,
        timeRange: timeRange as string,
        startDate: startDate as string,
        endDate: endDate as string,
        firmId: firmId as string,
        machineId: machineId as string,
        metric: metric as 'overall' | 'machine' | 'operator' | 'process'
      });

      this.sendSuccess(res, result);
    } catch (error) {
      this.sendError(res, error);
    }
  }

  async getRealTimeProductionDashboard(req: Request, res: Response): Promise<void> {
    try {
      const {
        companyId,
        refreshInterval = 30000,
        includeCharts = true
      } = req.query;

      const result = await this.productionTrackingService.getRealTimeProductionDashboard({
        companyId: companyId as string,
        refreshInterval: parseInt(refreshInterval as string),
        includeCharts: includeCharts === 'true'
      });

      this.sendSuccess(res, result);
    } catch (error) {
      this.sendError(res, error);
    }
  }
}
