import { Request, Response } from 'express';
import Finishing from '../models/Finishing';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';

export class FinishingController {
  constructor() {
    // No base controller needed
  }

  /**
   * Handle errors consistently
   */
  private handleError(res: Response, error: any): void {
    logger.error('FinishingController Error:', error);
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
   * Create a new finishing process
   */
  async createFinishingProcess(req: Request, res: Response): Promise<void> {
    try {
      const { productionOrderId } = req.params;
      const finishingData = req.body;
      const { companyId, userId } = req.user;

      const finishingProcess = new Finishing({
        ...finishingData,
        productionOrderId,
        companyId,
        createdBy: userId,
        updatedBy: userId
      });

      await finishingProcess.save();

      res.status(201).json({
        success: true,
        message: 'Finishing process created successfully',
        data: finishingProcess
      });
    } catch (error) {
      logger.error('Error creating finishing process:', error);
      this.handleError(res, error);
    }
  }

  /**
   * Get finishing process by ID
   */
  async getFinishingProcess(req: Request, res: Response): Promise<void> {
    try {
      const { finishingId } = req.params;
      const { companyId } = req.user;

      const finishingProcess = await Finishing.findOne({
        _id: finishingId,
        companyId
      }).populate('productionOrderId', 'productionOrderNumber customerName');

      if (!finishingProcess) {
        res.status(404).json({
          success: false,
          message: 'Finishing process not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: finishingProcess
      });
    } catch (error) {
      logger.error('Error fetching finishing process:', error);
      this.handleError(res, error);
    }
  }

  /**
   * Get all finishing processes for a production order
   */
  async getFinishingProcessesByOrder(req: Request, res: Response): Promise<void> {
    try {
      const { productionOrderId } = req.params;
      const { companyId } = req.user;

      const finishingProcesses = await Finishing.find({
        productionOrderId,
        companyId
      }).populate('productionOrderId', 'productionOrderNumber customerName');

      res.status(200).json({
        success: true,
        data: finishingProcesses
      });
    } catch (error) {
      logger.error('Error fetching finishing processes:', error);
      this.handleError(res, error);
    }
  }

  /**
   * Update finishing process
   */
  async updateFinishingProcess(req: Request, res: Response): Promise<void> {
    try {
      const { finishingId } = req.params;
      const updateData = req.body;
      const { companyId, userId } = req.user;

      const finishingProcess = await Finishing.findOneAndUpdate(
        { _id: finishingId, companyId },
        { ...updateData, updatedBy: userId },
        { new: true, runValidators: true }
      );

      if (!finishingProcess) {
        res.status(404).json({
          success: false,
          message: 'Finishing process not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Finishing process updated successfully',
        data: finishingProcess
      });
    } catch (error) {
      logger.error('Error updating finishing process:', error);
      this.handleError(res, error);
    }
  }

  /**
   * Start finishing process
   */
  async startFinishingProcess(req: Request, res: Response): Promise<void> {
    try {
      const { finishingId } = req.params;
      const { companyId, userId } = req.user;

      const finishingProcess = await Finishing.findOneAndUpdate(
        { _id: finishingId, companyId },
        {
          status: 'in_progress',
          startTime: new Date(),
          updatedBy: userId
        },
        { new: true }
      );

      if (!finishingProcess) {
        res.status(404).json({
          success: false,
          message: 'Finishing process not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Finishing process started successfully',
        data: finishingProcess
      });
    } catch (error) {
      logger.error('Error starting finishing process:', error);
      this.handleError(res, error);
    }
  }

  /**
   * Complete finishing process
   */
  async completeFinishingProcess(req: Request, res: Response): Promise<void> {
    try {
      const { finishingId } = req.params;
      const completionData = req.body;
      const { companyId, userId } = req.user;

      const finishingProcess = await Finishing.findOneAndUpdate(
        { _id: finishingId, companyId },
        {
          status: 'completed',
          endTime: new Date(),
          completedBy: userId,
          ...completionData,
          updatedBy: userId
        },
        { new: true }
      );

      if (!finishingProcess) {
        res.status(404).json({
          success: false,
          message: 'Finishing process not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Finishing process completed successfully',
        data: finishingProcess
      });
    } catch (error) {
      logger.error('Error completing finishing process:', error);
      this.handleError(res, error);
    }
  }

  /**
   * Add quality check to finishing process
   */
  async addQualityCheck(req: Request, res: Response): Promise<void> {
    try {
      const { finishingId } = req.params;
      const qualityCheck = req.body;
      const { companyId, userId } = req.user;

      const finishingProcess = await Finishing.findOneAndUpdate(
        { _id: finishingId, companyId },
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

      if (!finishingProcess) {
        res.status(404).json({
          success: false,
          message: 'Finishing process not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Quality check added successfully',
        data: finishingProcess
      });
    } catch (error) {
      logger.error('Error adding quality check:', error);
      this.handleError(res, error);
    }
  }

  /**
   * Get finishing analytics
   */
  async getFinishingAnalytics(req: Request, res: Response): Promise<void> {
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

      const analytics = await Finishing.aggregate([
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
      logger.error('Error fetching finishing analytics:', error);
      this.handleError(res, error);
    }
  }
}
