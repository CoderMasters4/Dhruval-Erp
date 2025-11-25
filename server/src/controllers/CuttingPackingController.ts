import { Request, Response } from 'express';
import CuttingPacking from '../models/CuttingPacking';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';

export class CuttingPackingController {
  constructor() {
    // No base controller needed
  }

  /**
   * Handle errors consistently
   */
  private handleError(res: Response, error: any): void {
    logger.error('CuttingPackingController Error:', error);
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
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Create a new cutting & packing process
   */
  async createCuttingPackingProcess(req: Request, res: Response): Promise<void> {
    try {
      const { productionOrderId } = req.params;
      const cuttingPackingData = req.body;
      const { companyId, userId } = req.user;

      const cuttingPackingProcess = new CuttingPacking({
        ...cuttingPackingData,
        productionOrderId,
        companyId,
        createdBy: userId,
        updatedBy: userId
      });

      await cuttingPackingProcess.save();

      res.status(201).json({
        success: true,
        message: 'Cutting & Packing process created successfully',
        data: cuttingPackingProcess
      });
    } catch (error) {
      logger.error('Error creating cutting & packing process:', error);
      this.handleError(res, error);
    }
  }

  /**
   * Get cutting & packing process by ID
   */
  async getCuttingPackingProcess(req: Request, res: Response): Promise<void> {
    try {
      const { cuttingPackingId } = req.params;
      const { companyId } = req.user;

      const cuttingPackingProcess = await CuttingPacking.findOne({
        _id: cuttingPackingId,
        companyId
      }).populate('productionOrderId', 'productionOrderNumber customerName');

      if (!cuttingPackingProcess) {
        res.status(404).json({
          success: false,
          message: 'Cutting & Packing process not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: cuttingPackingProcess
      });
    } catch (error) {
      logger.error('Error fetching cutting & packing process:', error);
      this.handleError(res, error);
    }
  }

  /**
   * Get all cutting & packing processes for a production order
   */
  async getCuttingPackingProcessesByOrder(req: Request, res: Response): Promise<void> {
    try {
      const { productionOrderId } = req.params;
      const { companyId } = req.user;

      const cuttingPackingProcesses = await CuttingPacking.find({
        productionOrderId,
        companyId
      }).populate('productionOrderId', 'productionOrderNumber customerName');

      res.status(200).json({
        success: true,
        data: cuttingPackingProcesses
      });
    } catch (error) {
      logger.error('Error fetching cutting & packing processes:', error);
      this.handleError(res, error);
    }
  }

  /**
   * Update cutting & packing process
   */
  async updateCuttingPackingProcess(req: Request, res: Response): Promise<void> {
    try {
      const { cuttingPackingId } = req.params;
      const updateData = req.body;
      const { companyId, userId } = req.user;

      const cuttingPackingProcess = await CuttingPacking.findOneAndUpdate(
        { _id: cuttingPackingId, companyId },
        { ...updateData, updatedBy: userId },
        { new: true, runValidators: true }
      );

      if (!cuttingPackingProcess) {
        res.status(404).json({
          success: false,
          message: 'Cutting & Packing process not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Cutting & Packing process updated successfully',
        data: cuttingPackingProcess
      });
    } catch (error) {
      logger.error('Error updating cutting & packing process:', error);
      this.handleError(res, error);
    }
  }

  /**
   * Start cutting & packing process
   */
  async startCuttingPackingProcess(req: Request, res: Response): Promise<void> {
    try {
      const { cuttingPackingId } = req.params;
      const { companyId, userId } = req.user;

      const cuttingPackingProcess = await CuttingPacking.findOneAndUpdate(
        { _id: cuttingPackingId, companyId },
        {
          status: 'in_progress',
          startTime: new Date(),
          updatedBy: userId
        },
        { new: true }
      );

      if (!cuttingPackingProcess) {
        res.status(404).json({
          success: false,
          message: 'Cutting & Packing process not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Cutting & Packing process started successfully',
        data: cuttingPackingProcess
      });
    } catch (error) {
      logger.error('Error starting cutting & packing process:', error);
      this.handleError(res, error);
    }
  }

  /**
   * Complete cutting & packing process
   */
  async completeCuttingPackingProcess(req: Request, res: Response): Promise<void> {
    try {
      const { cuttingPackingId } = req.params;
      const completionData = req.body;
      const { companyId, userId } = req.user;

      const cuttingPackingProcess = await CuttingPacking.findOneAndUpdate(
        { _id: cuttingPackingId, companyId },
        {
          status: 'completed',
          endTime: new Date(),
          completedBy: userId,
          ...completionData,
          updatedBy: userId
        },
        { new: true }
      );

      if (!cuttingPackingProcess) {
        res.status(404).json({
          success: false,
          message: 'Cutting & Packing process not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Cutting & Packing process completed successfully',
        data: cuttingPackingProcess
      });
    } catch (error) {
      logger.error('Error completing cutting & packing process:', error);
      this.handleError(res, error);
    }
  }

  /**
   * Add quality check to cutting & packing process
   */
  async addQualityCheck(req: Request, res: Response): Promise<void> {
    try {
      const { cuttingPackingId } = req.params;
      const qualityCheck = req.body;
      const { companyId, userId } = req.user;

      const cuttingPackingProcess = await CuttingPacking.findOneAndUpdate(
        { _id: cuttingPackingId, companyId },
        {
          $push: {
            qualityChecks: {
              ...qualityCheck,
              checkedBy: userId,
              checkedAt: new Date()
            }
          },
          updatedBy: userId
        },
        { new: true }
      );

      if (!cuttingPackingProcess) {
        res.status(404).json({
          success: false,
          message: 'Cutting & Packing process not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Quality check added successfully',
        data: cuttingPackingProcess
      });
    } catch (error) {
      logger.error('Error adding quality check:', error);
      this.handleError(res, error);
    }
  }

  /**
   * Get cutting & packing analytics
   */
  async getCuttingPackingAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const { startDate, endDate } = req.query;

      const matchStage: any = { companyId };
      if (startDate && endDate) {
        matchStage.createdAt = {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string)
        };
      }

      const analytics = await CuttingPacking.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalProcesses: { $sum: 1 },
            completedProcesses: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            inProgressProcesses: {
              $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
            },
            averageEfficiency: { $avg: '$efficiency' },
            totalCost: { $sum: '$costBreakdown.totalCost' },
            averageCycleTime: {
              $avg: {
                $divide: [
                  { $subtract: ['$endTime', '$startTime'] },
                  1000 * 60 * 60 // Convert to hours
                ]
              }
            }
          }
        }
      ]);

      res.status(200).json({
        success: true,
        data: analytics[0] || {
          totalProcesses: 0,
          completedProcesses: 0,
          inProgressProcesses: 0,
          averageEfficiency: 0,
          totalCost: 0,
          averageCycleTime: 0
        }
      });
    } catch (error) {
      logger.error('Error fetching cutting & packing analytics:', error);
      this.handleError(res, error);
    }
  }
}
