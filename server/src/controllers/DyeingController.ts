import { Request, Response } from 'express';
import Dyeing from '../models/Dyeing';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';

export class DyeingController {
  constructor() {
    // No base controller needed
  }

  /**
   * Handle errors consistently
   */
  private handleError(res: Response, error: any): void {
    logger.error('DyeingController Error:', error);
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
   * Create a new dyeing process
   */
  async createDyeingProcess(req: Request, res: Response): Promise<void> {
    try {
      const { productionOrderId } = req.params;
      const dyeingData = req.body;
      const { companyId, userId } = req.user;

      const dyeingProcess = new Dyeing({
        ...dyeingData,
        productionOrderId,
        companyId,
        createdBy: userId,
        updatedBy: userId
      });

      await dyeingProcess.save();

      res.status(201).json({
        success: true,
        message: 'Dyeing process created successfully',
        data: dyeingProcess
      });
    } catch (error) {
      logger.error('Error creating dyeing process:', error);
      this.handleError(res, error);
    }
  }

  /**
   * Get dyeing process by ID
   */
  async getDyeingProcess(req: Request, res: Response): Promise<void> {
    try {
      const { dyeingId } = req.params;
      const { companyId } = req.user;

      const dyeingProcess = await Dyeing.findOne({
        _id: dyeingId,
        companyId
      }).populate('productionOrderId', 'productionOrderNumber customerName');

      if (!dyeingProcess) {
        res.status(404).json({
          success: false,
          message: 'Dyeing process not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: dyeingProcess
      });
    } catch (error) {
      logger.error('Error fetching dyeing process:', error);
      this.handleError(res, error);
    }
  }

  /**
   * Get all dyeing processes for a production order
   */
  async getDyeingProcessesByOrder(req: Request, res: Response): Promise<void> {
    try {
      const { productionOrderId } = req.params;
      const { companyId } = req.user;

      const dyeingProcesses = await Dyeing.find({
        productionOrderId,
        companyId
      }).populate('productionOrderId', 'productionOrderNumber customerName');

      res.status(200).json({
        success: true,
        data: dyeingProcesses
      });
    } catch (error) {
      logger.error('Error fetching dyeing processes:', error);
      this.handleError(res, error);
    }
  }

  /**
   * Update dyeing process
   */
  async updateDyeingProcess(req: Request, res: Response): Promise<void> {
    try {
      const { dyeingId } = req.params;
      const updateData = req.body;
      const { companyId, userId } = req.user;

      const dyeingProcess = await Dyeing.findOneAndUpdate(
        { _id: dyeingId, companyId },
        { ...updateData, updatedBy: userId },
        { new: true, runValidators: true }
      );

      if (!dyeingProcess) {
        res.status(404).json({
          success: false,
          message: 'Dyeing process not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Dyeing process updated successfully',
        data: dyeingProcess
      });
    } catch (error) {
      logger.error('Error updating dyeing process:', error);
      this.handleError(res, error);
    }
  }

  /**
   * Start dyeing process
   */
  async startDyeingProcess(req: Request, res: Response): Promise<void> {
    try {
      const { dyeingId } = req.params;
      const { companyId, userId } = req.user;

      const dyeingProcess = await Dyeing.findOneAndUpdate(
        { _id: dyeingId, companyId },
        {
          status: 'in_progress',
          startTime: new Date(),
          updatedBy: userId
        },
        { new: true }
      );

      if (!dyeingProcess) {
        res.status(404).json({
          success: false,
          message: 'Dyeing process not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Dyeing process started successfully',
        data: dyeingProcess
      });
    } catch (error) {
      logger.error('Error starting dyeing process:', error);
      this.handleError(res, error);
    }
  }

  /**
   * Complete dyeing process
   */
  async completeDyeingProcess(req: Request, res: Response): Promise<void> {
    try {
      const { dyeingId } = req.params;
      const completionData = req.body;
      const { companyId, userId } = req.user;

      const dyeingProcess = await Dyeing.findOneAndUpdate(
        { _id: dyeingId, companyId },
        {
          status: 'completed',
          endTime: new Date(),
          completedBy: userId,
          ...completionData,
          updatedBy: userId
        },
        { new: true }
      );

      if (!dyeingProcess) {
        res.status(404).json({
          success: false,
          message: 'Dyeing process not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Dyeing process completed successfully',
        data: dyeingProcess
      });
    } catch (error) {
      logger.error('Error completing dyeing process:', error);
      this.handleError(res, error);
    }
  }

  /**
   * Add quality check to dyeing process
   */
  async addQualityCheck(req: Request, res: Response): Promise<void> {
    try {
      const { dyeingId } = req.params;
      const qualityCheck = req.body;
      const { companyId, userId } = req.user;

      const dyeingProcess = await Dyeing.findOneAndUpdate(
        { _id: dyeingId, companyId },
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

      if (!dyeingProcess) {
        res.status(404).json({
          success: false,
          message: 'Dyeing process not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Quality check added successfully',
        data: dyeingProcess
      });
    } catch (error) {
      logger.error('Error adding quality check:', error);
      this.handleError(res, error);
    }
  }

  /**
   * Get dyeing analytics
   */
  async getDyeingAnalytics(req: Request, res: Response): Promise<void> {
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

      const analytics = await Dyeing.aggregate([
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
      logger.error('Error fetching dyeing analytics:', error);
      this.handleError(res, error);
    }
  }
}
