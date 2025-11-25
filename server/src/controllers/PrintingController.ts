import { Request, Response } from 'express';
import Printing from '../models/Printing';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';

export class PrintingController {
  constructor() {
    // No base controller needed
  }

  /**
   * Handle errors consistently
   */
  private handleError(res: Response, error: any): void {
    logger.error('PrintingController Error:', error);
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
   * Create a new printing process
   */
  async createPrintingProcess(req: Request, res: Response): Promise<void> {
    try {
      const { productionOrderId } = req.params;
      const printingData = req.body;
      const { companyId, userId } = req.user;

      const printingProcess = new Printing({
        ...printingData,
        productionOrderId,
        companyId,
        createdBy: userId,
        updatedBy: userId
      });

      await printingProcess.save();

      res.status(201).json({
        success: true,
        message: 'Printing process created successfully',
        data: printingProcess
      });
    } catch (error) {
      logger.error('Error creating printing process:', error);
      this.handleError(res, error);
    }
  }

  /**
   * Get printing process by ID
   */
  async getPrintingProcess(req: Request, res: Response): Promise<void> {
    try {
      const { printingId } = req.params;
      const { companyId } = req.user;

      const printingProcess = await Printing.findOne({
        _id: printingId,
        companyId
      }).populate('productionOrderId', 'productionOrderNumber customerName');

      if (!printingProcess) {
        res.status(404).json({
          success: false,
          message: 'Printing process not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: printingProcess
      });
    } catch (error) {
      logger.error('Error fetching printing process:', error);
      this.handleError(res, error);
    }
  }

  /**
   * Get all printing processes for a production order
   */
  async getPrintingProcessesByOrder(req: Request, res: Response): Promise<void> {
    try {
      const { productionOrderId } = req.params;
      const { companyId } = req.user;

      const printingProcesses = await Printing.find({
        productionOrderId,
        companyId
      }).populate('productionOrderId', 'productionOrderNumber customerName');

      res.status(200).json({
        success: true,
        data: printingProcesses
      });
    } catch (error) {
      logger.error('Error fetching printing processes:', error);
      this.handleError(res, error);
    }
  }

  /**
   * Update printing process
   */
  async updatePrintingProcess(req: Request, res: Response): Promise<void> {
    try {
      const { printingId } = req.params;
      const updateData = req.body;
      const { companyId, userId } = req.user;

      const printingProcess = await Printing.findOneAndUpdate(
        { _id: printingId, companyId },
        { ...updateData, updatedBy: userId },
        { new: true, runValidators: true }
      );

      if (!printingProcess) {
        res.status(404).json({
          success: false,
          message: 'Printing process not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Printing process updated successfully',
        data: printingProcess
      });
    } catch (error) {
      logger.error('Error updating printing process:', error);
      this.handleError(res, error);
    }
  }

  /**
   * Start printing process
   */
  async startPrintingProcess(req: Request, res: Response): Promise<void> {
    try {
      const { printingId } = req.params;
      const { companyId, userId } = req.user;

      const printingProcess = await Printing.findOneAndUpdate(
        { _id: printingId, companyId },
        {
          status: 'in_progress',
          startTime: new Date(),
          updatedBy: userId
        },
        { new: true }
      );

      if (!printingProcess) {
        res.status(404).json({
          success: false,
          message: 'Printing process not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Printing process started successfully',
        data: printingProcess
      });
    } catch (error) {
      logger.error('Error starting printing process:', error);
      this.handleError(res, error);
    }
  }

  /**
   * Complete printing process
   */
  async completePrintingProcess(req: Request, res: Response): Promise<void> {
    try {
      const { printingId } = req.params;
      const completionData = req.body;
      const { companyId, userId } = req.user;

      const printingProcess = await Printing.findOneAndUpdate(
        { _id: printingId, companyId },
        {
          status: 'completed',
          endTime: new Date(),
          completedBy: userId,
          ...completionData,
          updatedBy: userId
        },
        { new: true }
      );

      if (!printingProcess) {
        res.status(404).json({
          success: false,
          message: 'Printing process not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Printing process completed successfully',
        data: printingProcess
      });
    } catch (error) {
      logger.error('Error completing printing process:', error);
      this.handleError(res, error);
    }
  }

  /**
   * Add quality check to printing process
   */
  async addQualityCheck(req: Request, res: Response): Promise<void> {
    try {
      const { printingId } = req.params;
      const qualityCheck = req.body;
      const { companyId, userId } = req.user;

      const printingProcess = await Printing.findOneAndUpdate(
        { _id: printingId, companyId },
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

      if (!printingProcess) {
        res.status(404).json({
          success: false,
          message: 'Printing process not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Quality check added successfully',
        data: printingProcess
      });
    } catch (error) {
      logger.error('Error adding quality check:', error);
      this.handleError(res, error);
    }
  }

  /**
   * Get printing analytics
   */
  async getPrintingAnalytics(req: Request, res: Response): Promise<void> {
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

      const analytics = await Printing.aggregate([
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
      logger.error('Error fetching printing analytics:', error);
      this.handleError(res, error);
    }
  }
}
