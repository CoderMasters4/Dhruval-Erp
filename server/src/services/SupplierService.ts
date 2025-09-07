import { Types, Document, Schema } from 'mongoose';
import { BaseService } from './BaseService';
import { Supplier } from '../models/Supplier';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

// Define ISupplier interface based on the Supplier model
interface ISupplier extends Document {
  companyId: Schema.Types.ObjectId;
  supplierCode: string;
  supplierName: string;
  legalName?: string;
  displayName?: string;
  businessInfo: {
    businessType: string;
    industry: string;
    subIndustry: string;
    businessDescription: string;
    website: string;
    socialMedia: {
      facebook: string;
      instagram: string;
      linkedin: string;
      twitter: string;
    };
    establishedYear: number;
    employeeCount: string;
    annualTurnover: string;
    manufacturingCapacity: string;
  };
  registrationDetails: {
    gstin: string;
    pan: string;
    cin: string;
    udyogAadhar: string;
    iecCode: string;
    registrationNumber: string;
    vatNumber: string;
    cstNumber: string;
    msmeNumber: string;
    factoryLicense: string;
  };
  contactInfo: {
    primaryPhone: string;
    alternatePhone?: string;
    primaryEmail: string;
    alternateEmail?: string;
    whatsapp?: string;
    fax?: string;
    tollFree?: string;
  };
  addresses: Array<{
    type: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    isDefault: boolean;
  }>;
  contactPersons: Array<{
    name: string;
    designation?: string;
    phone?: string;
    email?: string;
    isPrimary: boolean;
  }>;
  productCategories: Array<{
    category: string;
    subCategory?: string;
    description?: string;
  }>;
  financialInfo: {
    paymentTerms: string;
    creditDays: number;
    securityDeposit: number;
    advancePaid: number;
    outstandingPayable: number;
    totalPurchases: number;
    lastPaymentDate?: Date;
    lastPaymentAmount?: number;
    preferredPaymentMethod?: string;
    currency: string;
    taxDeductionRate: number;
  };
  bankingDetails: {
    bankName: string;
    branchName: string;
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
    accountType: string;
    upiId?: string;
    isVerified: boolean;
  };
  supplyHistory: {
    firstOrderDate: Date;
    lastOrderDate: Date;
    totalOrders: number;
    totalOrderValue: number;
    averageOrderValue: number;
    onTimeDeliveryRate: number;
    qualityRejectionRate: number;
    averageLeadTime: number;
    suppliedProducts: string[];
  };
  performanceMetrics: Array<{
    metric: string;
    value: number;
    unit?: string;
    date: Date;
  }>;
  quality: {
    qualityRating: number;
    qualityGrade: string;
    certifications: string[];
    qualityAgreements: string[];
    lastQualityAudit?: Date;
    nextQualityAudit?: Date;
    qualityNotes?: string;
    defectRate: number;
    returnRate: number;
  };
  relationship: {
    supplierType: string;
    supplierCategory: string;
    relationshipManager?: Schema.Types.ObjectId;
    assignedBuyer?: Schema.Types.ObjectId;
    supplierSince: Date;
    lastInteraction: Date;
    nextReview: Date;
    priority: string;
    exclusiveSupplier: boolean;
    strategicPartner: boolean;
  };
  compliance: {
    vendorApprovalStatus: string;
    approvalDate?: Date;
    approvedBy?: Schema.Types.ObjectId;
    complianceDocuments: string[];
    riskCategory: string;
    blacklisted: boolean;
    blacklistReason?: string;
    complianceNotes?: string;
    lastComplianceCheck?: Date;
    nextComplianceCheck?: Date;
    environmentalCompliance: boolean;
    laborCompliance: boolean;
    safetyCompliance: boolean;
  };
  notes?: string;
  tags?: string[];
  customFields?: Schema.Types.Mixed;
  attachments?: string[];
  isActive: boolean;
}

export class SupplierService extends BaseService<ISupplier> {
  constructor() {
    super(Supplier as any);
  }

  /**
   * Create a new supplier
   */
  async createSupplier(supplierData: Partial<ISupplier>, createdBy?: string): Promise<ISupplier> {
    try {
      // Validate supplier data
      this.validateSupplierData(supplierData);

      // Check for duplicate supplier code
      if (supplierData.supplierCode) {
        const existingSupplier = await this.findOne({ 
          supplierCode: supplierData.supplierCode,
          companyId: supplierData.companyId
        });

        if (existingSupplier) {
          throw new AppError('Supplier with this code already exists', 400);
        }
      }

      // Create supplier
      const supplier = await this.create({
        ...supplierData,
        isActive: true,
        supplyHistory: {
          firstOrderDate: new Date(),
          lastOrderDate: new Date(),
          totalOrders: 0,
          totalOrderValue: 0,
          averageOrderValue: 0,
          onTimeDeliveryRate: 0,
          qualityRejectionRate: 0,
          averageLeadTime: 0,
          suppliedProducts: []
        },
        performanceMetrics: [],
        quality: {
          qualityRating: 3,
          qualityGrade: 'B',
          certifications: [],
          qualityAgreements: [],
          defectRate: 0,
          returnRate: 0
        },
        relationship: {
          supplierType: 'manufacturer',
          supplierCategory: 'approved',
          supplierSince: new Date(),
          lastInteraction: new Date(),
          nextReview: new Date(),
          priority: 'medium',
          exclusiveSupplier: false,
          strategicPartner: false
        },
        compliance: {
          vendorApprovalStatus: 'pending',
          complianceDocuments: [],
          riskCategory: 'low',
          blacklisted: false,
          environmentalCompliance: false,
          laborCompliance: false,
          safetyCompliance: false
        }
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
  async getSupplierByCode(supplierCode: string, companyId?: string): Promise<ISupplier | null> {
    try {
      const filter: any = { supplierCode };
      if (companyId) {
        filter.companyId = companyId;
      }
      return await this.findOne(filter);
    } catch (error) {
      logger.error('Error getting supplier by code', { error, supplierCode });
      throw error;
    }
  }

  /**
   * Get suppliers by status
   */
  async getSuppliersByStatus(status: string, companyId?: string): Promise<ISupplier[]> {
    try {
      const filter: any = { status };
      if (companyId) {
        filter.companyId = companyId;
      }
      return await this.findMany(filter);
    } catch (error) {
      logger.error('Error getting suppliers by status', { error, status });
      throw error;
    }
  }

  /**
   * Get suppliers by company with pagination and filters
   */
  async getSuppliersByCompany(companyId: string, options: any = {}): Promise<{ data: ISupplier[], pagination: any }> {
    try {
      const { page = 1, limit = 10, search, category, status } = options;
      
      const filter: any = { companyId };
      
      if (search) {
        const searchRegex = new RegExp(search, 'i');
        filter.$or = [
          { supplierName: searchRegex },
          { supplierCode: searchRegex },
          { 'contactInfo.primaryEmail': searchRegex }
        ];
      }
      
      if (category) {
        filter['relationship.supplierCategory'] = category;
      }
      
      if (status) {
        filter.status = status;
      }

      const skip = (page - 1) * limit;
      
      const [suppliers, total] = await Promise.all([
        this.findMany(filter, { skip, limit }, ['companyId']),
        this.count(filter)
      ]);

      const pagination = {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      };

      return { data: suppliers, pagination };
    } catch (error) {
      logger.error('Error getting suppliers by company', { error, companyId, options });
      throw error;
    }
  }

  /**
   * Get primary suppliers
   */
  async getPrimarySuppliers(companyId?: string): Promise<ISupplier[]> {
    try {
      const filter: any = { 'relationship.priority': 'high' };
      if (companyId) {
        filter.companyId = companyId;
      }
      return await this.findMany(filter);
    } catch (error) {
      logger.error('Error getting primary suppliers', { error });
      throw error;
    }
  }

  /**
   * Get suppliers by quality rating
   */
  async getSuppliersByQualityRating(minRating: number, companyId?: string): Promise<ISupplier[]> {
    try {
      const filter: any = { 'quality.qualityRating': { $gte: minRating } };
      if (companyId) {
        filter.companyId = companyId;
      }
      return await this.findMany(filter);
    } catch (error) {
      logger.error('Error getting suppliers by quality rating', { error, minRating });
      throw error;
    }
  }

  /**
   * Update supplier rating
   */
  async updateSupplierRating(supplierId: string, rating: number, ratedBy?: string): Promise<ISupplier | null> {
    try {
      const supplier = await this.findById(supplierId);
      if (!supplier) {
        throw new AppError('Supplier not found', 404);
      }

      const updatedSupplier = await this.update(supplierId, {
        'quality.qualityRating': rating
      }, ratedBy);

      logger.info('Supplier rating updated', {
        supplierId,
        oldRating: supplier.quality?.qualityRating,
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
   * Search suppliers
   */
  async searchSuppliers(query: string, companyId?: string): Promise<ISupplier[]> {
    try {
      const searchRegex = new RegExp(query, 'i');
      const filter: any = {
        $or: [
          { supplierName: searchRegex },
          { supplierCode: searchRegex },
          { 'contactInfo.primaryEmail': searchRegex },
          { 'contactInfo.primaryPhone': searchRegex }
        ]
      };
      
      if (companyId) {
        filter.companyId = companyId;
      }
      
      return await this.findMany(filter);
    } catch (error) {
      logger.error('Error searching suppliers', { error, query });
      throw error;
    }
  }

  /**
   * Get supplier statistics
   */
  async getSupplierStats(companyId?: string): Promise<any> {
    try {
      const filter: any = {};
      if (companyId) {
        filter.companyId = companyId;
      }

      const [totalSuppliers, activeSuppliers] = await Promise.all([
        this.count(filter),
        this.count({ ...filter, status: 'active' })
      ]);

      return {
        totalSuppliers,
        activeSuppliers,
        inactiveSuppliers: totalSuppliers - activeSuppliers
      };
    } catch (error) {
      logger.error('Error getting supplier stats', { error });
      throw error;
    }
  }

  /**
   * Validate supplier data
   */
  private validateSupplierData(supplierData: Partial<ISupplier>): void {
    if (!supplierData.supplierName) {
      throw new AppError('Supplier name is required', 400);
    }

    if (!supplierData.supplierCode) {
      throw new AppError('Supplier code is required', 400);
    }

    if (!supplierData.companyId) {
      throw new AppError('Company ID is required', 400);
    }

    if (supplierData.quality?.qualityRating !== undefined && 
        (supplierData.quality.qualityRating < 1 || supplierData.quality.qualityRating > 5)) {
      throw new AppError('Quality rating must be between 1 and 5', 400);
    }
  }
}

