import { Types } from 'mongoose';
import PurchaseOrder from '../models/PurchaseOrder';
import { IPurchaseOrder } from '../types/models';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export interface ReportFilters {
  companyId: string;
  vendorId?: string;
  category?: string;
  itemId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface VendorWisePurchaseSummary {
  vendorId: string;
  vendorName: string;
  contactPerson?: string;
  contactNumber?: string;
  email?: string;
  gstin?: string;
  totalPurchases: number;
  totalOrders: number;
  totalQuantity: number;
  averageOrderValue: number;
  items: Array<{
    itemId: string;
    itemName: string;
    itemCode: string;
    category?: string;
    totalQuantity: number;
    totalAmount: number;
    averageRate: number;
    orderDates: string[]; // ISO date strings for frontend
  }>;
}

export interface ItemWisePurchaseReport {
  itemId: string;
  itemName: string;
  itemCode: string;
  category?: string;
  subcategory?: string;
  totalQuantity: number;
  totalAmount: number;
  averageRate: number;
  minRate: number;
  maxRate: number;
  purchaseCount: number;
  purchases: Array<{
    poNumber: string;
    poDate: Date;
    vendorName: string;
    vendorId: string;
    quantity: number;
    rate: number;
    amount: number;
    unit: string;
  }>;
}

export interface CategoryWisePurchaseReport {
  category: string;
  totalPurchases: number;
  totalQuantity: number;
  totalOrders: number;
  averageOrderValue: number;
  items: Array<{
    itemId: string;
    itemName: string;
    itemCode: string;
    totalQuantity: number;
    totalAmount: number;
    averageRate: number;
  }>;
  vendors: Array<{
    vendorId: string;
    vendorName: string;
    totalPurchases: number;
    totalOrders: number;
  }>;
}

export interface DateRangeReport {
  dateFrom: Date;
  dateTo: Date;
  totalAmount: number;
  totalQuantity: number;
  totalOrders: number;
  averageOrderValue: number;
  vendorDetails: Array<{
    vendorId: string;
    vendorName: string;
    totalPurchases: number;
    totalOrders: number;
  }>;
  itemDetails: Array<{
    itemId: string;
    itemName: string;
    itemCode: string;
    totalQuantity: number;
    totalAmount: number;
  }>;
  poEntries: Array<{
    poNumber: string;
    poDate: Date;
    vendorName: string;
    vendorId: string;
    totalAmount: number;
    totalQuantity: number;
    itemCount: number;
    status: string;
    paymentStatus?: string;
  }>;
}

export class PurchaseReportsService {
  private validateObjectId(id: string | any): Types.ObjectId {
    // Convert to string if it's an object or other type
    let idString: string;
    
    if (typeof id === 'string') {
      idString = id;
    } else if (id instanceof Types.ObjectId) {
      idString = id.toString();
    } else if (id && typeof id === 'object') {
      // Handle Mongoose ObjectId with toHexString
      if (typeof id.toHexString === 'function') {
        idString = id.toHexString();
      } else if ('_str' in id) {
        idString = id._str;
      } else if ('value' in id) {
        idString = String(id.value);
      } else {
        // Try toString as last resort
        try {
          const str = String(id);
          if (str === '[object Object]') {
            throw new AppError(`Invalid ObjectId: Cannot convert object to string. Received: ${JSON.stringify(id)}`, 400);
          }
          idString = str;
        } catch (e: any) {
          throw new AppError(`Invalid ObjectId: ${e.message || 'Conversion failed'}`, 400);
        }
      }
    } else {
      idString = String(id || '');
    }
    
    // Validate the string is a valid ObjectId
    if (!Types.ObjectId.isValid(idString)) {
      throw new AppError(`Invalid ObjectId format: ${idString}. Received type: ${typeof id}`, 400);
    }
    
    return new Types.ObjectId(idString);
  }

  private validateDate(dateStr?: string): Date | undefined {
    if (!dateStr) return undefined;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      throw new AppError(`Invalid date: ${dateStr}`, 400);
    }
    return date;
  }

  /**
   * Vendor-wise Purchase Summary
   * Shows total purchases made from each vendor with item details
   */
  async getVendorWisePurchaseSummary(filters: ReportFilters): Promise<VendorWisePurchaseSummary[]> {
    try {
      const query: any = {
        companyId: this.validateObjectId(filters.companyId),
        isActive: true
      };

      if (filters.vendorId) {
        query['supplier.supplierId'] = this.validateObjectId(filters.vendorId);
      }

      if (filters.dateFrom || filters.dateTo) {
        const dateQuery: any = {};
        if (filters.dateFrom) {
          const dateStr = filters.dateFrom;
          // Parse date string and create Date object
          const dateObj = new Date(dateStr);
          if (!isNaN(dateObj.getTime())) {
            // Set to start of day in UTC
            const startDate = new Date(Date.UTC(
              dateObj.getFullYear(),
              dateObj.getMonth(),
              dateObj.getDate(),
              0, 0, 0, 0
            ));
            dateQuery.$gte = startDate;
          }
        }
        if (filters.dateTo) {
          const dateStr = filters.dateTo;
          // Parse date string and create Date object
          const dateObj = new Date(dateStr);
          if (!isNaN(dateObj.getTime())) {
            // Set to end of day in UTC
            const endDate = new Date(Date.UTC(
              dateObj.getFullYear(),
              dateObj.getMonth(),
              dateObj.getDate(),
              23, 59, 59, 999
            ));
            dateQuery.$lte = endDate;
          }
        }
        if (Object.keys(dateQuery).length > 0) {
          query.poDate = dateQuery;
        }
      }

      const purchaseOrders = await PurchaseOrder.find(query)
        .populate('supplier.supplierId', 'supplierName contactPersons contactInfo registrationDetails')
        .populate('items.itemId', 'itemName itemCode category')
        .lean();

      // Group by vendor
      const vendorMap = new Map<string, VendorWisePurchaseSummary>();

      for (const po of purchaseOrders) {
        const supplierId = (po.supplier?.supplierId as any)?._id?.toString() || po.supplier?.supplierId?.toString();
        const supplierData = (po.supplier?.supplierId as any) || {};

        if (!vendorMap.has(supplierId)) {
          vendorMap.set(supplierId, {
            vendorId: supplierId,
            vendorName: po.supplier?.supplierName || supplierData.supplierName || 'Unknown Vendor',
            contactPerson: po.supplier?.contactPerson || supplierData.contactPersons?.[0]?.name,
            contactNumber: po.supplier?.phone || supplierData.contactInfo?.primaryPhone,
            email: po.supplier?.email || supplierData.contactInfo?.primaryEmail,
            gstin: po.supplier?.gstin || supplierData.registrationDetails?.gstin,
            totalPurchases: 0,
            totalOrders: 0,
            totalQuantity: 0,
            averageOrderValue: 0,
            items: []
          });
        }

        const vendorData = vendorMap.get(supplierId)!;
        vendorData.totalPurchases += po.amounts?.grandTotal || 0;
        vendorData.totalOrders += 1;

        // Process items
        for (const item of po.items || []) {
          const itemId = (item.itemId as any)?._id?.toString() || item.itemId?.toString();
          const itemData = (item.itemId as any) || {};

          let itemSummary = vendorData.items.find(i => i.itemId === itemId);
          if (!itemSummary) {
            itemSummary = {
              itemId: itemId,
              itemName: item.itemName || itemData.itemName || 'Unknown Item',
              itemCode: item.itemCode || itemData.itemCode || '',
              category: itemData.category?.primary || itemData.category || undefined,
              totalQuantity: 0,
              totalAmount: 0,
              averageRate: 0,
              orderDates: []
            };
            vendorData.items.push(itemSummary);
          }

          itemSummary.totalQuantity += item.quantity || 0;
          itemSummary.totalAmount += (item.quantity || 0) * (item.rate || 0);
          itemSummary.averageRate = itemSummary.totalAmount / itemSummary.totalQuantity;
          // Convert date to ISO string for frontend
          const poDate = po.poDate ? (po.poDate instanceof Date ? po.poDate : new Date(po.poDate)) : new Date();
          itemSummary.orderDates.push(poDate.toISOString());
        }
      }

      // Calculate totals and averages
      const results = Array.from(vendorMap.values()).map(vendor => {
        vendor.totalQuantity = vendor.items.reduce((sum, item) => sum + item.totalQuantity, 0);
        vendor.averageOrderValue = vendor.totalOrders > 0 ? vendor.totalPurchases / vendor.totalOrders : 0;
        return vendor;
      });

      return results.sort((a, b) => b.totalPurchases - a.totalPurchases);
    } catch (error: any) {
      logger.error('Error in getVendorWisePurchaseSummary:', error);
      throw new AppError(error.message || 'Failed to generate vendor-wise purchase summary', 500);
    }
  }

  /**
   * Item-wise Purchase Report
   * Tracks all purchases for each product with quantity, rate, date, vendor
   */
  async getItemWisePurchaseReport(filters: ReportFilters): Promise<ItemWisePurchaseReport[]> {
    try {
      const query: any = {
        companyId: this.validateObjectId(filters.companyId),
        isActive: true
      };

      if (filters.itemId) {
        query['items.itemId'] = this.validateObjectId(filters.itemId);
      }

      if (filters.category) {
        // This will be handled after population
      }

      if (filters.dateFrom || filters.dateTo) {
        const dateQuery: any = {};
        if (filters.dateFrom) {
          const dateStr = filters.dateFrom;
          // Parse YYYY-MM-DD format and create Date object in UTC
          const [year, month, day] = dateStr.split('-').map(Number);
          if (year && month !== undefined && day !== undefined) {
            // Create Date in UTC (month is 0-indexed in Date.UTC)
            const startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
            dateQuery.$gte = startDate;
          }
        }
        if (filters.dateTo) {
          const dateStr = filters.dateTo;
          // Parse YYYY-MM-DD format and create Date object in UTC
          const [year, month, day] = dateStr.split('-').map(Number);
          if (year && month !== undefined && day !== undefined) {
            // Create Date in UTC (month is 0-indexed in Date.UTC)
            const endDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
            dateQuery.$lte = endDate;
          }
        }
        if (Object.keys(dateQuery).length > 0) {
          query.poDate = dateQuery;
        }
      }

      const purchaseOrders = await PurchaseOrder.find(query)
        .populate('supplier.supplierId', 'supplierName')
        .populate('items.itemId', 'itemName itemCode category')
        .lean();

      // Group by item
      const itemMap = new Map<string, ItemWisePurchaseReport>();

      for (const po of purchaseOrders) {
        for (const item of po.items || []) {
          const itemId = (item.itemId as any)?._id?.toString() || item.itemId?.toString();
          const itemData = (item.itemId as any) || {};

          // Filter by category if specified
          if (filters.category) {
            const itemCategory = itemData.category?.primary || itemData.category;
            if (itemCategory !== filters.category) continue;
          }

          if (!itemMap.has(itemId)) {
            itemMap.set(itemId, {
              itemId: itemId,
              itemName: item.itemName || itemData.itemName || 'Unknown Item',
              itemCode: item.itemCode || itemData.itemCode || '',
              category: itemData.category?.primary || itemData.category || undefined,
              subcategory: itemData.category?.secondary || undefined,
              totalQuantity: 0,
              totalAmount: 0,
              averageRate: 0,
              minRate: Infinity,
              maxRate: 0,
              purchaseCount: 0,
              purchases: []
            });
          }

          const itemReport = itemMap.get(itemId)!;
          const quantity = item.quantity || 0;
          const rate = item.rate || 0;
          const amount = quantity * rate;

          itemReport.totalQuantity += quantity;
          itemReport.totalAmount += amount;
          itemReport.purchaseCount += 1;
          itemReport.minRate = Math.min(itemReport.minRate, rate);
          itemReport.maxRate = Math.max(itemReport.maxRate, rate);

          const supplierData = (po.supplier?.supplierId as any) || {};
          itemReport.purchases.push({
            poNumber: po.poNumber || '',
            poDate: po.poDate,
            vendorName: po.supplier?.supplierName || supplierData.supplierName || 'Unknown Vendor',
            vendorId: (po.supplier?.supplierId as any)?._id?.toString() || po.supplier?.supplierId?.toString(),
            quantity: quantity,
            rate: rate,
            amount: amount,
            unit: item.unit || 'pcs'
          });
        }
      }

      // Calculate averages
      const results = Array.from(itemMap.values()).map(item => {
        item.averageRate = item.totalQuantity > 0 ? item.totalAmount / item.totalQuantity : 0;
        if (item.minRate === Infinity) item.minRate = 0;
        // Sort purchases by date descending
        item.purchases.sort((a, b) => new Date(b.poDate).getTime() - new Date(a.poDate).getTime());
        return item;
      });

      return results.sort((a, b) => b.totalAmount - a.totalAmount);
    } catch (error: any) {
      logger.error('Error in getItemWisePurchaseReport:', error);
      throw new AppError(error.message || 'Failed to generate item-wise purchase report', 500);
    }
  }

  /**
   * Category-wise Purchase Report
   * Groups products category-wise
   */
  async getCategoryWisePurchaseReport(filters: ReportFilters): Promise<CategoryWisePurchaseReport[]> {
    try {
      const query: any = {
        companyId: this.validateObjectId(filters.companyId),
        isActive: true
      };

      if (filters.category) {
        // Will filter after population
      }

      if (filters.dateFrom || filters.dateTo) {
        const dateQuery: any = {};
        if (filters.dateFrom) {
          const dateStr = filters.dateFrom;
          // Parse YYYY-MM-DD format and create Date object in UTC
          const [year, month, day] = dateStr.split('-').map(Number);
          if (year && month !== undefined && day !== undefined) {
            // Create Date in UTC (month is 0-indexed in Date.UTC)
            const startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
            dateQuery.$gte = startDate;
          }
        }
        if (filters.dateTo) {
          const dateStr = filters.dateTo;
          // Parse YYYY-MM-DD format and create Date object in UTC
          const [year, month, day] = dateStr.split('-').map(Number);
          if (year && month !== undefined && day !== undefined) {
            // Create Date in UTC (month is 0-indexed in Date.UTC)
            const endDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
            dateQuery.$lte = endDate;
          }
        }
        if (Object.keys(dateQuery).length > 0) {
          query.poDate = dateQuery;
        }
      }

      const purchaseOrders = await PurchaseOrder.find(query)
        .populate('supplier.supplierId', 'supplierName')
        .populate('items.itemId', 'itemName itemCode category')
        .lean();

      // Group by category
      type CategoryReportData = {
        category: string;
        totalPurchases: number;
        totalQuantity: number;
        totalOrdersSet: Set<string>;
        averageOrderValue: number;
        items: Array<{
          itemId: string;
          itemName: string;
          itemCode: string;
          totalQuantity: number;
          totalAmount: number;
          averageRate: number;
        }>;
        vendors: Array<{
          vendorId: string;
          vendorName: string;
          totalPurchases: number;
          totalOrders: number;
        }>;
      };
      const categoryMap = new Map<string, CategoryReportData>();
      const vendorMap = new Map<string, { vendorId: string; vendorName: string; totalPurchases: number; totalOrders: number }>();

      for (const po of purchaseOrders) {
        const supplierId = (po.supplier?.supplierId as any)?._id?.toString() || po.supplier?.supplierId?.toString();
        const supplierData = (po.supplier?.supplierId as any) || {};
        const vendorName = po.supplier?.supplierName || supplierData.supplierName || 'Unknown Vendor';

        if (!vendorMap.has(supplierId)) {
          vendorMap.set(supplierId, {
            vendorId: supplierId,
            vendorName: vendorName,
            totalPurchases: 0,
            totalOrders: 0
          });
        }
        const vendorData = vendorMap.get(supplierId)!;
        vendorData.totalOrders += 1;

        for (const item of po.items || []) {
          const itemData = (item.itemId as any) || {};
          const category = itemData.category?.primary || itemData.category || 'uncategorized';

          // Filter by category if specified
          if (filters.category && category !== filters.category) continue;

          if (!categoryMap.has(category)) {
            categoryMap.set(category, {
              category: category,
              totalPurchases: 0,
              totalQuantity: 0,
              totalOrdersSet: new Set<string>(),
              averageOrderValue: 0,
              items: [],
              vendors: []
            });
          }

          const categoryReport = categoryMap.get(category)!;
          const quantity = item.quantity || 0;
          const amount = quantity * (item.rate || 0);

          categoryReport.totalPurchases += amount;
          categoryReport.totalQuantity += quantity;
          categoryReport.totalOrdersSet.add(po._id.toString());

          vendorData.totalPurchases += amount;

          // Process items
          const itemId = (item.itemId as any)?._id?.toString() || item.itemId?.toString();
          let itemSummary = categoryReport.items.find(i => i.itemId === itemId);
          if (!itemSummary) {
            itemSummary = {
              itemId: itemId,
              itemName: item.itemName || itemData.itemName || 'Unknown Item',
              itemCode: item.itemCode || itemData.itemCode || '',
              totalQuantity: 0,
              totalAmount: 0,
              averageRate: 0
            };
            categoryReport.items.push(itemSummary);
          }

          itemSummary.totalQuantity += quantity;
          itemSummary.totalAmount += amount;
          itemSummary.averageRate = itemSummary.totalAmount / itemSummary.totalQuantity;
        }
      }

      // Calculate averages and add vendors
      const results: CategoryWisePurchaseReport[] = Array.from(categoryMap.values()).map(category => {
        const totalOrders = category.totalOrdersSet.size;
        const averageOrderValue = totalOrders > 0 ? category.totalPurchases / totalOrders : 0;
        
        // Add unique vendors for this category
        const categoryVendors = new Set<string>();
        for (const po of purchaseOrders) {
          for (const item of po.items || []) {
            const itemData = (item.itemId as any) || {};
            const itemCategory = itemData.category?.primary || itemData.category || 'uncategorized';
            if (itemCategory === category.category) {
              const supplierId = (po.supplier?.supplierId as any)?._id?.toString() || po.supplier?.supplierId?.toString();
              if (supplierId) categoryVendors.add(supplierId);
            }
          }
        }

        const vendors = Array.from(categoryVendors).map(vendorId => {
          const vendor = vendorMap.get(vendorId);
          return vendor || { vendorId, vendorName: 'Unknown', totalPurchases: 0, totalOrders: 0 };
        });

        return {
          category: category.category,
          totalPurchases: category.totalPurchases,
          totalQuantity: category.totalQuantity,
          totalOrders: totalOrders,
          averageOrderValue: averageOrderValue,
          items: category.items,
          vendors: vendors
        };
      });

      return results.sort((a, b) => b.totalPurchases - a.totalPurchases);
    } catch (error: any) {
      logger.error('Error in getCategoryWisePurchaseReport:', error);
      throw new AppError(error.message || 'Failed to generate category-wise purchase report', 500);
    }
  }

  /**
   * Date Range Report
   * User selects From Date → To Date and sees all PO entries with totals
   */
  async getDateRangeReport(filters: ReportFilters): Promise<DateRangeReport> {
    try {
      if (!filters.dateFrom || !filters.dateTo) {
        throw new AppError('Date range (dateFrom and dateTo) is required', 400);
      }

      // Validate and convert dates
      if (!filters.dateFrom || !filters.dateTo) {
        throw new AppError('Date range (dateFrom and dateTo) is required', 400);
      }

      // Parse YYYY-MM-DD format and create Date objects in UTC
      const [fromYear, fromMonth, fromDay] = filters.dateFrom.split('-').map(Number);
      const [toYear, toMonth, toDay] = filters.dateTo.split('-').map(Number);
      
      if (!fromYear || fromMonth === undefined || fromDay === undefined ||
          !toYear || toMonth === undefined || toDay === undefined) {
        throw new AppError('Invalid date format. Expected YYYY-MM-DD', 400);
      }

      // Create Date objects in UTC (month is 0-indexed in Date.UTC)
      const startDate = new Date(Date.UTC(fromYear, fromMonth - 1, fromDay, 0, 0, 0, 0));
      const endDate = new Date(Date.UTC(toYear, toMonth - 1, toDay, 23, 59, 59, 999));

      const query: any = {
        companyId: this.validateObjectId(filters.companyId),
        isActive: true,
        poDate: {
          $gte: startDate,
          $lte: endDate
        }
      };

      if (filters.vendorId) {
        query['supplier.supplierId'] = this.validateObjectId(filters.vendorId);
      }

      const purchaseOrders = await PurchaseOrder.find(query)
        .populate('supplier.supplierId', 'supplierName')
        .populate('items.itemId', 'itemName itemCode')
        .lean();

      const dateFrom = this.validateDate(filters.dateFrom)!;
      const dateTo = this.validateDate(filters.dateTo)!;

      let totalAmount = 0;
      let totalQuantity = 0;
      const vendorMap = new Map<string, { vendorId: string; vendorName: string; totalPurchases: number; totalOrders: number }>();
      const itemMap = new Map<string, { itemId: string; itemName: string; itemCode: string; totalQuantity: number; totalAmount: number }>();

      const poEntries = purchaseOrders.map(po => {
        const supplierId = (po.supplier?.supplierId as any)?._id?.toString() || po.supplier?.supplierId?.toString();
        const supplierData = (po.supplier?.supplierId as any) || {};
        const vendorName = po.supplier?.supplierName || supplierData.supplierName || 'Unknown Vendor';

        if (!vendorMap.has(supplierId)) {
          vendorMap.set(supplierId, {
            vendorId: supplierId,
            vendorName: vendorName,
            totalPurchases: 0,
            totalOrders: 0
          });
        }
        const vendorData = vendorMap.get(supplierId)!;
        vendorData.totalOrders += 1;

        const poAmount = po.amounts?.grandTotal || 0;
        const poQuantity = po.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

        totalAmount += poAmount;
        totalQuantity += poQuantity;
        vendorData.totalPurchases += poAmount;

        // Process items
        for (const item of po.items || []) {
          const itemId = (item.itemId as any)?._id?.toString() || item.itemId?.toString();
          const itemData = (item.itemId as any) || {};

          if (!itemMap.has(itemId)) {
            itemMap.set(itemId, {
              itemId: itemId,
              itemName: item.itemName || itemData.itemName || 'Unknown Item',
              itemCode: item.itemCode || itemData.itemCode || '',
              totalQuantity: 0,
              totalAmount: 0
            });
          }

          const itemSummary = itemMap.get(itemId)!;
          const quantity = item.quantity || 0;
          const amount = quantity * (item.rate || 0);
          itemSummary.totalQuantity += quantity;
          itemSummary.totalAmount += amount;
        }

        return {
          poNumber: po.poNumber || '',
          poDate: po.poDate,
          vendorName: vendorName,
          vendorId: supplierId,
          totalAmount: poAmount,
          totalQuantity: poQuantity,
          itemCount: po.items?.length || 0,
          status: po.status || 'pending',
          paymentStatus: po.paymentTerms?.termType || 'pending'
        };
      });

      const report: DateRangeReport = {
        dateFrom: dateFrom,
        dateTo: dateTo,
        totalAmount: totalAmount,
        totalQuantity: totalQuantity,
        totalOrders: purchaseOrders.length,
        averageOrderValue: purchaseOrders.length > 0 ? totalAmount / purchaseOrders.length : 0,
        vendorDetails: Array.from(vendorMap.values()),
        itemDetails: Array.from(itemMap.values()).sort((a, b) => b.totalAmount - a.totalAmount),
        poEntries: poEntries.sort((a, b) => new Date(b.poDate).getTime() - new Date(a.poDate).getTime())
      };

      return report;
    } catch (error: any) {
      logger.error('Error in getDateRangeReport:', error);
      throw new AppError(error.message || 'Failed to generate date range report', 500);
    }
  }
}


