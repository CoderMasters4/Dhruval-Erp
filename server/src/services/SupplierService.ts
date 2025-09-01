import { Types } from 'mongoose';
import { BaseService } from './BaseService';
import { SpareSupplier } from '../models/Supplier';
import { ISpareSupplier } from '../models/Supplier';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export class SupplierService extends BaseService<ISpareSupplier> {
  constructor() {
    super(SpareSupplier as any);
  }

  /**
   * Create a new supplier
   */
  async createSupplier(supplierData: Partial<ISpareSupplier>, createdBy?: string): Promise<ISpareSupplier> {
    try {
      // Validate supplier data
      this.validateSupplierData(supplierData);

      // Check for duplicate supplier code
      if (supplierData.supplierCode) {
        const existingSupplier = await this.findOne({ 
          supplierCode: supplierData.supplierCode
        });

        if (existingSupplier) {
          throw new AppError('Supplier with this code already exists', 400);
        }
      }

      // Create supplier
      const supplier = await this.create({
        ...supplierData,
        status: supplierData.status || 'active',
        performanceMetrics: {
          onTimeDeliveryRate: 0,
          qualityRejectionRate: 0,
          averageLeadTime: 0,
          totalOrders: 0,
          totalOrderValue: 0,
          averageOrderValue: 0
        },
        pricingHistory: [],
        performanceScore: 0
      }, createdBy);

      logger.info('Supplier created successfully', {
        supplierId: supplier._id,
        supplierCode: supplier.supplierCode,
        createdBy
      });

      return supplier;
    } catch (error) {
      logger.error('Error creating supplier', { error, supplierData, createdBy });
      throw error;
    }
  }

  /**
   * Get supplier by code
   */
  async getSupplierByCode(supplierCode: string): Promise<ISpareSupplier | null> {
    try {
      return await this.findOne({ supplierCode });
    } catch (error) {
      logger.error('Error getting supplier by code', { error, supplierCode });
      throw error;
    }
  }

  /**
   * Get suppliers by status
   */
  async getSuppliersByStatus(status: string): Promise<ISpareSupplier[]> {
    try {
      return await this.findMany({ status });
    } catch (error) {
      logger.error('Error getting suppliers by status', { error, status });
      throw error;
    }
  }

  /**
   * Get primary suppliers
   */
  async getPrimarySuppliers(): Promise<ISpareSupplier[]> {
    try {
      return await this.findMany({ isPrimary: true });
    } catch (error) {
      logger.error('Error getting primary suppliers', { error });
      throw error;
    }
  }

  /**
   * Get suppliers by quality rating
   */
  async getSuppliersByQualityRating(minRating: number): Promise<ISpareSupplier[]> {
    try {
      return await this.findMany({ qualityRating: { $gte: minRating } });
    } catch (error) {
      logger.error('Error getting suppliers by quality rating', { error, minRating });
      throw error;
    }
  }

  /**
   * Update supplier rating
   */
  async updateSupplierRating(supplierId: string, rating: number, ratedBy?: string): Promise<ISpareSupplier | null> {
    try {
      const supplier = await this.findById(supplierId);
      if (!supplier) {
        throw new AppError('Supplier not found', 404);
      }

      const updatedSupplier = await this.update(supplierId, {
        qualityRating: rating
      }, ratedBy);

      logger.info('Supplier rating updated', {
        supplierId,
        oldRating: supplier.qualityRating,
        newRating: rating,
        ratedBy
      });

      return updatedSupplier;
    } catch (error) {
      logger.error('Error updating supplier rating', { error, supplierId, rating, ratedBy });
      throw error;
    }
  }

  /**
   * Validate supplier data
   */
  private validateSupplierData(supplierData: Partial<ISpareSupplier>): void {
    if (!supplierData.supplierName) {
      throw new AppError('Supplier name is required', 400);
    }

    if (!supplierData.supplierCode) {
      throw new AppError('Supplier code is required', 400);
    }

    if (!supplierData.partNumber) {
      throw new AppError('Part number is required', 400);
    }

    if (supplierData.leadTime !== undefined && supplierData.leadTime < 0) {
      throw new AppError('Lead time must be non-negative', 400);
    }

    if (supplierData.minOrderQuantity !== undefined && supplierData.minOrderQuantity < 0) {
      throw new AppError('Minimum order quantity must be non-negative', 400);
    }

    if (supplierData.qualityRating !== undefined && (supplierData.qualityRating < 1 || supplierData.qualityRating > 5)) {
      throw new AppError('Quality rating must be between 1 and 5', 400);
    }
  }
}

