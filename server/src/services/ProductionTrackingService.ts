import { BaseService } from './BaseService';
import ProductionOrder from '../models/ProductionOrder';
import Employee from '../models/Employee';
import Company from '../models/Company';

export interface ProductionTrackingParams {
  companyId?: string;
  date?: string;
  firmId?: string;
  machineId?: string;
  status?: string;
  includeDetails?: boolean;
}

export interface ProductionUpdateRequest {
  jobId: string;
  stageId?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'on_hold' | 'delayed';
  progress?: number;
  operatorId?: string;
  machineId?: string;
  notes?: string;
  qualityChecks?: Array<{
    checkType: string;
    status: 'passed' | 'failed' | 'pending';
    notes?: string;
  }>;
}

export class ProductionTrackingService {
  async getProductionTrackingData(params: ProductionTrackingParams): Promise<any> {
    try {
      const { companyId, date, firmId, machineId, status, includeDetails } = params;
      
      // Build match conditions
      const matchConditions: any = {};
      if (companyId) matchConditions.companyId = companyId;
      if (date) matchConditions.date = new Date(date);
      if (firmId) matchConditions.firmId = firmId;
      if (machineId) matchConditions.machineId = machineId;
      if (status) matchConditions.status = status;

      // Get summary data
      const summary = await this.getProductionSummary(matchConditions);

      // Get printing status
      const printingStatus = await this.getPrintingStatusData(matchConditions);

      // Get job work tracking
      const jobWorkTracking = await this.getJobWorkTrackingData(matchConditions);

      // Get process tracking
      const processTracking = await this.getProcessTrackingData(matchConditions, includeDetails);

      // Get daily production summary
      const dailyProductionSummary = await this.getDailyProductionSummaryData(matchConditions);

      // Get machine-wise summary
      const machineWiseSummary = await this.getMachineWiseSummaryData(matchConditions);

      return {
        summary,
        printingStatus,
        jobWorkTracking,
        processTracking,
        dailyProductionSummary,
        machineWiseSummary
      };
    } catch (error) {
      console.error('Error in getProductionTrackingData:', error);
      throw error;
    }
  }

  async getPrintingStatus(params: any): Promise<any> {
    try {
      const { companyId, printingType, status, machineId, operatorId } = params;
      
      const matchConditions: any = { jobType: 'printing' };
      if (companyId) matchConditions.companyId = companyId;
      if (printingType) matchConditions.printingType = printingType;
      if (status) matchConditions.status = status;
      if (machineId) matchConditions.machineId = machineId;
      if (operatorId) matchConditions.operatorId = operatorId;

      const result = await ProductionOrder.aggregate([
        { $match: matchConditions },
        {
          $lookup: {
            from: 'customers',
            localField: 'customerId',
            foreignField: '_id',
            as: 'customerInfo'
          }
        },
        { $unwind: '$customerInfo' },
        {
          $project: {
            jobId: '$_id',
            jobNumber: '$jobNumber',
            customerName: '$customerInfo.name',
            productName: '$productName',
            printingType: 1,
            status: 1,
            progress: 1,
            startTime: 1,
            estimatedCompletion: 1,
            actualCompletion: 1,
            machineId: 1,
            operatorId: 1,
            qualityChecks: 1
          }
        },
        { $sort: { startTime: -1 } }
      ]);

      return result;
    } catch (error) {
      console.error('Error in getPrintingStatus:', error);
      throw error;
    }
  }

  async getJobWorkTracking(params: any): Promise<any> {
    try {
      const { companyId, jobType, status, contractorId, startDate, endDate } = params;
      
      const matchConditions: any = {};
      if (companyId) matchConditions.companyId = companyId;
      if (jobType) matchConditions.jobType = jobType;
      if (status) matchConditions.status = status;
      if (contractorId) matchConditions.contractorId = contractorId;
      if (startDate && endDate) {
        matchConditions.startDate = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const result = await ProductionOrder.aggregate([
        { $match: matchConditions },
        {
          $lookup: {
            from: 'customers',
            localField: 'customerId',
            foreignField: '_id',
            as: 'customerInfo'
          }
        },
        { $unwind: '$customerInfo' },
        {
          $project: {
            jobId: '$_id',
            jobNumber: '$jobNumber',
            customerName: '$customerInfo.name',
            jobType: 1,
            contractorName: 1,
            contractorContact: 1,
            startDate: 1,
            estimatedCompletion: 1,
            actualCompletion: 1,
            status: 1,
            progress: 1,
            stages: 1
          }
        },
        { $sort: { startDate: -1 } }
      ]);

      return result;
    } catch (error) {
      console.error('Error in getJobWorkTracking:', error);
      throw error;
    }
  }

  async getProcessTracking(params: any): Promise<any> {
    try {
      const { companyId, jobId, stage, status, includeQualityChecks } = params;
      
      const matchConditions: any = {};
      if (companyId) matchConditions.companyId = companyId;
      if (jobId) matchConditions._id = jobId;
      if (stage) matchConditions.currentStage = stage;
      if (status) matchConditions.status = status;

      const pipeline: any[] = [
        { $match: matchConditions },
        {
          $lookup: {
            from: 'customers',
            localField: 'customerId',
            foreignField: '_id',
            as: 'customerInfo'
          }
        },
        { $unwind: '$customerInfo' }
      ];

      if (includeQualityChecks) {
        pipeline.push({
          $lookup: {
            from: 'qualitychecks',
            localField: '_id',
            foreignField: 'jobId',
            as: 'qualityChecks'
          }
        });
      }

      pipeline.push({
        $project: {
          jobId: '$_id',
          jobNumber: '$jobNumber',
          customerName: '$customerInfo.name',
          currentStage: 1,
          overallProgress: 1,
          stages: 1,
          qualityChecks: 1
        }
      });

      const result = await ProductionOrder.aggregate(pipeline);
      return result;
    } catch (error) {
      console.error('Error in getProcessTracking:', error);
      throw error;
    }
  }

  async getDailyProductionSummary(params: any): Promise<any> {
    try {
      const { companyId, date, firmId, includeBreakdown } = params;
      
      const matchConditions: any = {};
      if (companyId) matchConditions.companyId = companyId;
      if (date) matchConditions.date = new Date(date);
      if (firmId) matchConditions.firmId = firmId;

      const pipeline: any[] = [
        { $match: matchConditions },
        {
          $group: {
            _id: {
              date: '$date',
              firmId: '$firmId'
            },
            totalJobs: { $sum: 1 },
            completedJobs: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            totalProduction: { $sum: '$productionQuantity' },
            efficiency: { $avg: '$efficiency' },
            qualityScore: { $avg: '$qualityScore' },
            machineUtilization: { $avg: '$machineUtilization' }
          }
        }
      ];

      if (includeBreakdown) {
        pipeline.push({
          $lookup: {
            from: 'productionstages',
            localField: '_id',
            foreignField: 'jobId',
            as: 'stageData'
          }
        });
      }

      const result = await ProductionOrder.aggregate(pipeline);
      return result;
    } catch (error) {
      console.error('Error in getDailyProductionSummary:', error);
      throw error;
    }
  }

  async getMachineWiseSummary(params: any): Promise<any> {
    try {
      const { companyId, machineType, status, includeMaintenance } = params;
      
      const matchConditions: any = {};
      if (companyId) matchConditions.companyId = companyId;
      if (machineType) matchConditions.machineType = machineType;
      if (status) matchConditions.status = status;

      const pipeline: any[] = [
        { $match: matchConditions },
        {
          $group: {
            _id: '$machineId',
            totalJobs: { $sum: 1 },
            completedJobs: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            totalProduction: { $sum: '$productionQuantity' },
            efficiency: { $avg: '$efficiency' },
            uptime: { $avg: '$uptime' },
            downtime: { $avg: '$downtime' }
          }
        },
        {
          $lookup: {
            from: 'machines',
            localField: '_id',
            foreignField: '_id',
            as: 'machineInfo'
          }
        },
        { $unwind: '$machineInfo' }
      ];

      if (includeMaintenance) {
        pipeline.push({
          $lookup: {
            from: 'maintenance',
            localField: '_id',
            foreignField: 'machineId',
            as: 'maintenanceInfo'
          }
        });
      }

      pipeline.push({
        $project: {
          machineId: '$_id',
          machineName: '$machineInfo.name',
          machineType: '$machineInfo.type',
          totalJobs: 1,
          completedJobs: 1,
          totalProduction: 1,
          efficiency: 1,
          uptime: 1,
          downtime: 1,
          maintenanceStatus: '$machineInfo.maintenanceStatus',
          lastMaintenance: '$maintenanceInfo.lastMaintenance',
          nextMaintenance: '$maintenanceInfo.nextMaintenance'
        }
      });

      const result = await ProductionOrder.aggregate(pipeline);
      return result;
    } catch (error) {
      console.error('Error in getMachineWiseSummary:', error);
      throw error;
    }
  }

  async updateProductionStatus(params: ProductionUpdateRequest): Promise<any> {
    try {
      const { jobId, stageId, status, progress, operatorId, machineId, notes, qualityChecks } = params;

      const updateData: any = { status };
      if (progress !== undefined) updateData.progress = progress;
      if (operatorId) updateData.operatorId = operatorId;
      if (machineId) updateData.machineId = machineId;
      if (notes) updateData.notes = notes;
      if (qualityChecks) updateData.qualityChecks = qualityChecks;

      const result = await ProductionOrder.findByIdAndUpdate(
        jobId,
        { $set: updateData },
        { new: true }
      );

      return result;
    } catch (error) {
      console.error('Error in updateProductionStatus:', error);
      throw error;
    }
  }

  async startProductionStage(params: any): Promise<any> {
    try {
      const { jobId, stageId, operatorId, machineId, startTime, notes } = params;

      const updateData: any = {
        status: 'in_progress',
        startTime: startTime || new Date(),
        operatorId,
        notes
      };
      if (machineId) updateData.machineId = machineId;

      const result = await ProductionOrder.findByIdAndUpdate(
        jobId,
        { $set: updateData },
        { new: true }
      );

      return result;
    } catch (error) {
      console.error('Error in startProductionStage:', error);
      throw error;
    }
  }

  async completeProductionStage(params: any): Promise<any> {
    try {
      const { jobId, stageId, operatorId, completionTime, qualityChecks, notes } = params;

      const updateData: any = {
        status: 'completed',
        completionTime: completionTime || new Date(),
        operatorId,
        notes
      };
      if (qualityChecks) updateData.qualityChecks = qualityChecks;

      const result = await ProductionOrder.findByIdAndUpdate(
        jobId,
        { $set: updateData },
        { new: true }
      );

      return result;
    } catch (error) {
      console.error('Error in completeProductionStage:', error);
      throw error;
    }
  }

  async addQualityCheck(params: any): Promise<any> {
    try {
      const { jobId, stageId, checkType, status, notes, operatorId, timestamp } = params;

      const qualityCheck = {
        checkType,
        status,
        notes,
        operatorId,
        timestamp: timestamp || new Date()
      };

      const result = await ProductionOrder.findByIdAndUpdate(
        jobId,
        { $push: { qualityChecks: qualityCheck } },
        { new: true }
      );

      return result;
    } catch (error) {
      console.error('Error in addQualityCheck:', error);
      throw error;
    }
  }

  async getProductionAlerts(params: any): Promise<any> {
    try {
      const { companyId, alertType, severity, includeResolved } = params;
      
      const matchConditions: any = {};
      if (companyId) matchConditions.companyId = companyId;
      if (alertType) matchConditions.alertType = alertType;
      if (severity) matchConditions.severity = severity;
      if (!includeResolved) matchConditions.resolved = false;

      const result = await ProductionOrder.aggregate([
        { $match: matchConditions },
        {
          $project: {
            alertId: '$_id',
            jobId: 1,
            alertType: 1,
            severity: 1,
            message: 1,
            timestamp: 1,
            resolved: 1
          }
        },
        { $sort: { timestamp: -1 } }
      ]);

      return result;
    } catch (error) {
      console.error('Error in getProductionAlerts:', error);
      throw error;
    }
  }

  async getProductionEfficiency(params: any): Promise<any> {
    try {
      const { companyId, timeRange, startDate, endDate, firmId, machineId, metric } = params;
      
      const dateFilter = this.buildDateFilter(timeRange, startDate, endDate);
      const matchConditions: any = { ...dateFilter };
      if (companyId) matchConditions.companyId = companyId;
      if (firmId) matchConditions.firmId = firmId;
      if (machineId) matchConditions.machineId = machineId;

      let groupBy = '$date';
      if (metric === 'machine') groupBy = '$machineId';
      if (metric === 'operator') groupBy = '$operatorId';
      if (metric === 'process') groupBy = '$processType';

      const result = await ProductionOrder.aggregate([
        { $match: matchConditions },
        {
          $group: {
            _id: groupBy,
            efficiency: { $avg: '$efficiency' },
            qualityScore: { $avg: '$qualityScore' },
            machineUtilization: { $avg: '$machineUtilization' },
            totalJobs: { $sum: 1 },
            completedJobs: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      return result;
    } catch (error) {
      console.error('Error in getProductionEfficiency:', error);
      throw error;
    }
  }

  async getRealTimeProductionDashboard(params: any): Promise<any> {
    try {
      const { companyId, refreshInterval, includeCharts } = params;
      
      const matchConditions: any = {};
      if (companyId) matchConditions.companyId = companyId;

      // Get real-time data
      const realTimeData = await this.getRealTimeData(matchConditions);
      
      // Get production trends if charts are requested
      let productionTrends = [];
      let processDistribution = [];
      if (includeCharts) {
        productionTrends = await this.getProductionTrends(matchConditions);
        processDistribution = await this.getProcessDistribution(matchConditions);
      }

      // Get alerts
      const alerts = await this.getProductionAlerts({ companyId, includeResolved: false });

      return {
        realTimeData,
        productionTrends,
        processDistribution,
        alerts,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in getRealTimeProductionDashboard:', error);
      throw error;
    }
  }

  // Helper methods
  private async getProductionSummary(matchConditions: any): Promise<any> {
    const result = await ProductionOrder.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: null,
          totalJobs: { $sum: 1 },
          activeJobs: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
          completedJobs: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          pendingJobs: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          totalProduction: { $sum: '$productionQuantity' },
          productionEfficiency: { $avg: '$efficiency' },
          machineUtilization: { $avg: '$machineUtilization' },
          qualityScore: { $avg: '$qualityScore' }
        }
      }
    ]);

    return result[0] || {
      totalJobs: 0,
      activeJobs: 0,
      completedJobs: 0,
      pendingJobs: 0,
      totalProduction: 0,
      productionEfficiency: 0,
      machineUtilization: 0,
      qualityScore: 0
    };
  }

  private async getPrintingStatusData(matchConditions: any): Promise<any[]> {
    return await ProductionOrder.aggregate([
      { $match: { ...matchConditions, jobType: 'printing' } },
      {
        $project: {
          jobId: '$_id',
          jobNumber: 1,
          customerName: 1,
          productName: 1,
          printingType: 1,
          status: 1,
          progress: 1,
          startTime: 1,
          estimatedCompletion: 1,
          actualCompletion: 1,
          machineId: 1,
          operatorId: 1,
          qualityChecks: 1
        }
      },
      { $sort: { startTime: -1 } }
    ]);
  }

  private async getJobWorkTrackingData(matchConditions: any): Promise<any[]> {
    return await ProductionOrder.aggregate([
      { $match: matchConditions },
      {
        $project: {
          jobId: '$_id',
          jobNumber: 1,
          customerName: 1,
          jobType: 1,
          contractorName: 1,
          contractorContact: 1,
          startDate: 1,
          estimatedCompletion: 1,
          actualCompletion: 1,
          status: 1,
          progress: 1,
          stages: 1
        }
      },
      { $sort: { startDate: -1 } }
    ]);
  }

  private async getProcessTrackingData(matchConditions: any, includeDetails: boolean): Promise<any[]> {
    const pipeline: any[] = [
      { $match: matchConditions },
      {
        $project: {
          jobId: '$_id',
          jobNumber: 1,
          customerName: 1,
          currentStage: 1,
          overallProgress: 1,
          stages: 1
        }
      }
    ];

    if (includeDetails) {
      pipeline.push({
        $lookup: {
          from: 'qualitychecks',
          localField: '_id',
          foreignField: 'jobId',
          as: 'qualityChecks'
        }
      });
    }

    return await ProductionOrder.aggregate(pipeline);
  }

  private async getDailyProductionSummaryData(matchConditions: any): Promise<any[]> {
    return await ProductionOrder.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: {
            date: '$date',
            firmId: '$firmId'
          },
          totalJobs: { $sum: 1 },
          completedJobs: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          totalProduction: { $sum: '$productionQuantity' },
          efficiency: { $avg: '$efficiency' },
          qualityScore: { $avg: '$qualityScore' },
          machineUtilization: { $avg: '$machineUtilization' }
        }
      },
      { $sort: { '_id.date': -1 } }
    ]);
  }

  private async getMachineWiseSummaryData(matchConditions: any): Promise<any[]> {
    return await ProductionOrder.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: '$machineId',
          totalJobs: { $sum: 1 },
          completedJobs: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          totalProduction: { $sum: '$productionQuantity' },
          efficiency: { $avg: '$efficiency' },
          uptime: { $avg: '$uptime' },
          downtime: { $avg: '$downtime' }
        }
      },
      { $sort: { totalJobs: -1 } }
    ]);
  }

  private async getRealTimeData(matchConditions: any): Promise<any> {
    const result = await ProductionOrder.aggregate([
      { $match: { ...matchConditions, status: { $in: ['pending', 'in_progress'] } } },
      {
        $group: {
          _id: null,
          activeJobs: { $sum: 1 },
          totalProduction: { $sum: '$productionQuantity' },
          avgEfficiency: { $avg: '$efficiency' }
        }
      }
    ]);

    return result[0] || {
      activeJobs: 0,
      totalProduction: 0,
      avgEfficiency: 0
    };
  }

  private async getProductionTrends(matchConditions: any): Promise<any[]> {
    return await ProductionOrder.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' }
          },
          production: { $sum: '$productionQuantity' },
          efficiency: { $avg: '$efficiency' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
  }

  private async getProcessDistribution(matchConditions: any): Promise<any[]> {
    return await ProductionOrder.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: '$processType',
          value: { $sum: 1 }
        }
      },
      { $sort: { value: -1 } }
    ]);
  }

  private buildDateFilter(timeRange?: string, startDate?: string, endDate?: string): any {
    if (startDate && endDate) {
      return {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    if (timeRange) {
      const now = new Date();
      let start = new Date();
      
      switch (timeRange) {
        case '7d':
          start.setDate(now.getDate() - 7);
          break;
        case '30d':
          start.setDate(now.getDate() - 30);
          break;
        case '90d':
          start.setDate(now.getDate() - 90);
          break;
        case '1y':
          start.setFullYear(now.getFullYear() - 1);
          break;
        default:
          start.setDate(now.getDate() - 30);
      }

      return {
        date: {
          $gte: start,
          $lte: now
        }
      };
    }

    return {};
  }
}
