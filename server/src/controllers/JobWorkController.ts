import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { JobWorkService, CreateJobWorkData, UpdateJobWorkData } from '../services/JobWorkService';
import { IJobWorkDocument } from '../models/JobWork';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export class JobWorkController extends BaseController<IJobWorkDocument> {
  private jobWorkService: JobWorkService;

  constructor() {
    const jobWorkService = new JobWorkService();
    super(jobWorkService as any, 'JobWork');
    this.jobWorkService = jobWorkService;
  }

  /**
   * Create a new job work
   */
  async createJobWork(req: Request, res: Response): Promise<void> {
    try {
      const jobWorkData: CreateJobWorkData = req.body;
      const createdBy = req.user?._id?.toString();
      const companyId = req.company?._id?.toString() || req.user?.primaryCompanyId?.toString();

      if (!companyId) {
        this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
        return;
      }

      if (!createdBy) {
        this.sendError(res, new Error('User ID is required'), 'User ID is required', 400);
        return;
      }

      jobWorkData.companyId = companyId;
      jobWorkData.createdBy = createdBy;

      const jobWork = await this.jobWorkService.createJobWork(jobWorkData);
      this.sendSuccess(res, jobWork, 'Job work created successfully', 201);
    } catch (error: any) {
      this.sendError(res, error, 'Failed to create job work');
    }
  }

  /**
   * Get all job works with filters
   */
  async getJobWorks(req: Request, res: Response): Promise<void> {
    try {
      const {
        jobWorkerId,
        status,
        jobWorkType,
        startDate,
        endDate,
        paymentStatus,
        qualityStatus,
        challanNumber,
        categoryId,
        page,
        limit
      } = req.query;

      let companyId = req.query.companyId as string;
      if (!companyId && req.user?.isSuperAdmin) {
        companyId = undefined;
      } else if (!companyId) {
        companyId = req.company?._id?.toString() || req.user?.primaryCompanyId?.toString();
      }

      if (!companyId && !req.user?.isSuperAdmin) {
        this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
        return;
      }

      const filters = {
        companyId,
        jobWorkerId: jobWorkerId as string,
        status: status as string,
        jobWorkType: jobWorkType as string,
        startDate: startDate as string,
        endDate: endDate as string,
        paymentStatus: paymentStatus as string,
        qualityStatus: qualityStatus as string,
        challanNumber: challanNumber as string,
        categoryId: categoryId as string,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10
      };

      const result = await this.jobWorkService.getJobWorks(filters);
      this.sendSuccess(res, result, 'Job works retrieved successfully');
    } catch (error: any) {
      this.sendError(res, error, 'Failed to get job works');
    }
  }

  /**
   * Get job work by ID
   */
  async getJobWorkById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      let companyId = req.query.companyId as string;
      if (!companyId && !req.user?.isSuperAdmin) {
        companyId = req.company?._id?.toString() || req.user?.primaryCompanyId?.toString();
      }

      const jobWork = await this.jobWorkService.getJobWorkById(id, companyId);

      if (!jobWork) {
        this.sendError(res, new Error('Job work not found'), 'Job work not found', 404);
        return;
      }

      this.sendSuccess(res, jobWork, 'Job work retrieved successfully');
    } catch (error: any) {
      this.sendError(res, error, 'Failed to get job work');
    }
  }

  /**
   * Update job work
   */
  async updateJobWork(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateJobWorkData = req.body;
      const updatedBy = req.user?._id?.toString();

      if (!updatedBy) {
        this.sendError(res, new Error('User ID is required'), 'User ID is required', 400);
        return;
      }

      let companyId = req.query.companyId as string;
      if (!companyId && !req.user?.isSuperAdmin) {
        companyId = req.company?._id?.toString() || req.user?.primaryCompanyId?.toString();
      }

      updateData.updatedBy = updatedBy;

      const jobWork = await this.jobWorkService.updateJobWork(id, updateData, companyId);

      if (!jobWork) {
        this.sendError(res, new Error('Job work not found'), 'Job work not found', 404);
        return;
      }

      this.sendSuccess(res, jobWork, 'Job work updated successfully');
    } catch (error: any) {
      this.sendError(res, error, 'Failed to update job work');
    }
  }

  /**
   * Delete job work
   */
  async deleteJobWork(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      let companyId = req.query.companyId as string;
      if (!companyId && !req.user?.isSuperAdmin) {
        companyId = req.company?._id?.toString() || req.user?.primaryCompanyId?.toString();
      }

      const deleted = await this.jobWorkService.deleteJobWork(id, companyId);

      if (!deleted) {
        this.sendError(res, new Error('Job work not found'), 'Job work not found', 404);
        return;
      }

      this.sendSuccess(res, null, 'Job work deleted successfully');
    } catch (error: any) {
      this.sendError(res, error, 'Failed to delete job work');
    }
  }

  /**
   * Get job work statistics
   */
  async getJobWorkStats(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      let companyId = req.query.companyId as string;
      if (!companyId && !req.user?.isSuperAdmin) {
        companyId = req.company?._id?.toString() || req.user?.primaryCompanyId?.toString();
      }

      if (!companyId && !req.user?.isSuperAdmin) {
        this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
        return;
      }

      const stats = await this.jobWorkService.getJobWorkStats(
        companyId,
        startDate as string,
        endDate as string
      );

      this.sendSuccess(res, stats, 'Job work statistics retrieved successfully');
    } catch (error: any) {
      this.sendError(res, error, 'Failed to get job work statistics');
    }
  }

  /**
   * Get job works by worker
   */
  async getJobWorksByWorker(req: Request, res: Response): Promise<void> {
    try {
      const { workerId } = req.params;
      let companyId = req.query.companyId as string;
      if (!companyId && !req.user?.isSuperAdmin) {
        companyId = req.company?._id?.toString() || req.user?.primaryCompanyId?.toString();
      }

      const jobWorks = await this.jobWorkService.getJobWorkByWorker(workerId, companyId);
      this.sendSuccess(res, jobWorks, 'Job works retrieved successfully');
    } catch (error: any) {
      this.sendError(res, error, 'Failed to get job works by worker');
    }
  }

  /**
   * Generate Job Work Challan PDF
   * Excludes party details (only job worker, materials, dates, and job work info)
   */
  async generateChallanPDF(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      let companyId = req.query.companyId as string;
      if (!companyId && !req.user?.isSuperAdmin) {
        companyId = req.company?._id?.toString() || req.user?.primaryCompanyId?.toString();
      }

      const jobWork = await this.jobWorkService.getJobWorkById(id, companyId);

      if (!jobWork) {
        this.sendError(res, new Error('Job work not found'), 'Job work not found', 404);
        return;
      }

      const pdfDoc = await PDFDocument.create();
      let page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      let y = height - 50;
      const lineHeight = 16;

      const drawLine = (text: string, size = 12, x: number = 50) => {
        page.drawText(text, {
          x,
          y,
          size,
          font,
          color: rgb(0, 0, 0),
        });
        y -= lineHeight;
      };

      const ensureSpace = () => {
        if (y < 80) {
          page = pdfDoc.addPage();
          y = height - 50;
        }
      };

      // Header - centered title
      const title = 'JOB WORK CHALLAN';
      const titleSize = 18;
      const titleWidth = font.widthOfTextAtSize(title, titleSize);
      page.drawText(title, {
        x: (width - titleWidth) / 2,
        y,
        size: titleSize,
        font,
        color: rgb(0, 0, 0),
      });
      y -= lineHeight + 4;

      // Basic details (left column)
      drawLine(`Challan Number : ${jobWork.challanNumber || '-'}`);
      drawLine(
        `Challan Date   : ${
          jobWork.challanDate ? new Date(jobWork.challanDate).toLocaleDateString('en-IN') : '-'
        }`,
      );
      drawLine(`Job Work ID    : ${jobWork._id.toString()}`);
      y -= 10;

      drawLine(`Job Worker     : ${jobWork.jobWorkerName || '-'}`);
      drawLine(`Job Work Type  : ${jobWork.jobWorkType || '-'}`);
      drawLine(`Quantity       : ${jobWork.quantity} ${jobWork.unit || ''}`);
      drawLine(`Rate           : ${jobWork.jobWorkerRate || 0}`);
      drawLine(
        `Expected Delivery : ${
          jobWork.expectedDelivery
            ? new Date(jobWork.expectedDelivery).toLocaleDateString('en-IN')
            : '-'
        }`,
      );
      if (jobWork.actualDelivery) {
        drawLine(
          `Actual Delivery   : ${new Date(jobWork.actualDelivery).toLocaleDateString('en-IN')}`,
        );
      }
      y -= 10;

      drawLine(`Status         : ${jobWork.status}`);
      drawLine(
        `Payment        : ${jobWork.paymentStatus || 'pending'}${
          jobWork.paymentAmount ? ` (Rs. ${jobWork.paymentAmount})` : ''
        }`,
      );
      if (jobWork.jobWorkCost) {
        drawLine(`Job Work Cost  : Rs. ${jobWork.jobWorkCost}`);
      }
      y -= 10;

      // Transport Details section
      if (jobWork.transportName || jobWork.transportNumber) {
        drawLine('TRANSPORT DETAILS:', 14);
        ensureSpace();
        if (jobWork.transportName) {
          drawLine(`Transport Name   : ${jobWork.transportName}`);
        }
        if (jobWork.transportNumber) {
          drawLine(`Transport Number : ${jobWork.transportNumber}`);
        }
        y -= 10;
      }

      // Material Provided section
      drawLine('MATERIAL PROVIDED:', 14);
      ensureSpace();

      const drawMaterialsHeader = () => {
        // Table header: S.No | Item | Qty | Unit
        page.drawText('S.No', { x: 50, y, size: 11, font, color: rgb(0, 0, 0) });
        page.drawText('Item', { x: 90, y, size: 11, font, color: rgb(0, 0, 0) });
        page.drawText('Qty', { x: 360, y, size: 11, font, color: rgb(0, 0, 0) });
        page.drawText('Unit', { x: 420, y, size: 11, font, color: rgb(0, 0, 0) });
        y -= lineHeight;
      };

      if (jobWork.materialProvided && jobWork.materialProvided.length > 0) {
        drawMaterialsHeader();
        jobWork.materialProvided.forEach((m: any, index: number) => {
          ensureSpace();
          if (y === height - 50) {
            // New page: re-draw header
            drawMaterialsHeader();
          }
          page.drawText(`${index + 1}.`, {
            x: 50,
            y,
            size: 11,
            font,
            color: rgb(0, 0, 0),
          });
          page.drawText(m.itemName || '', {
            x: 90,
            y,
            size: 11,
            font,
            color: rgb(0, 0, 0),
          });
          page.drawText(String(m.quantity ?? ''), {
            x: 360,
            y,
            size: 11,
            font,
            color: rgb(0, 0, 0),
          });
          page.drawText(m.unit || '', {
            x: 420,
            y,
            size: 11,
            font,
            color: rgb(0, 0, 0),
          });
          y -= lineHeight;
        });
      } else {
        drawLine('No materials provided');
      }

      y -= 10;
      ensureSpace();
      drawLine('Remarks:', 14);
      if (jobWork.remarks) {
        // Simple multi-line wrap for remarks
        const remarkLines = jobWork.remarks.split('\n');
        remarkLines.forEach((line: string) => {
          ensureSpace();
          drawLine(line, 11);
        });
      } else {
        drawLine('-', 11);
      }

      // Signatures at bottom
      y -= 20;
      ensureSpace();
      const sigY = y;
      drawLine('For Company:', 12, 50);
      drawLine('Job Worker Signature:', 12, width / 2);
      y = sigY - 40;

      const pdfBytes = await pdfDoc.save();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="JobWork-Challan-${jobWork.challanNumber || jobWork._id.toString()}.pdf"`,
      );

      res.send(Buffer.from(pdfBytes));
    } catch (error: any) {
      this.sendError(res, error, 'Failed to generate job work challan PDF');
    }
  }
}

