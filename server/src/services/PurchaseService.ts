import { Types } from 'mongoose';
import PurchaseOrder from '../models/PurchaseOrder';
import { SpareSupplier } from '../models/Supplier';
import { IPurchaseOrder } from '../types/models';
import { BaseService } from './BaseService';

export interface PurchaseFilters {
  companyId: string;
  status?: string;
  paymentStatus?: string;
  supplierId?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page: number;
  limit: number;
}

export interface PurchaseStats {
  totalPurchases: number;
  monthlySpend: number;
  totalSuppliers: number;
  pendingOrders: number;
  averageOrderValue: number;
  topCategories: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

export interface PurchaseAnalytics {
  dailyPurchases: Array<{ date: string; amount: number; orders: number }>;
  monthlyPurchases: Array<{ month: string; amount: number; orders: number }>;
  topSuppliers: Array<{ supplier: string; amount: number; orders: number }>;
  purchasesByCategory: Array<{ category: string; amount: number; percentage: number }>;
  purchaseTrends: Array<{ period: string; amount: number; growth: number }>;
}

export class PurchaseService extends BaseService<IPurchaseOrder> {
  constructor() {
    super(PurchaseOrder);
  }

  /**
   * Get purchase statistics
   */
  async getPurchaseStats(companyId: string): Promise<PurchaseStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get total purchases
    const totalPurchases = await PurchaseOrder.aggregate([
      { $match: { companyId: new Types.ObjectId(companyId) } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    // Get monthly spend
    const monthlySpend = await PurchaseOrder.aggregate([
      { 
        $match: { 
          companyId: new Types.ObjectId(companyId),
          createdAt: { $gte: startOfMonth }
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    // Get total suppliers
    const totalSuppliers = await PurchaseOrder.aggregate([
      { $match: { companyId: new Types.ObjectId(companyId) } },
      { $group: { _id: '$supplierId' } },
      { $count: 'total' }
    ]);

    // Get pending orders
    const pendingOrders = await PurchaseOrder.countDocuments({
      companyId: new Types.ObjectId(companyId),
      status: 'pending'
    });

    // Get average order value
    const avgOrderValue = await PurchaseOrder.aggregate([
      { $match: { companyId: new Types.ObjectId(companyId) } },
      { $group: { _id: null, avg: { $avg: '$totalAmount' } } }
    ]);

    // Get top categories
    const topCategories = await PurchaseOrder.aggregate([
      { $match: { companyId: new Types.ObjectId(companyId) } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.category',
          amount: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      { $sort: { amount: -1 } },
      { $limit: 5 }
    ]);

    const totalAmount = totalPurchases[0]?.total || 0;
    const categoriesWithPercentage = topCategories.map(cat => ({
      category: cat._id,
      amount: cat.amount,
      percentage: totalAmount > 0 ? (cat.amount / totalAmount) * 100 : 0
    }));

    return {
      totalPurchases: totalAmount,
      monthlySpend: monthlySpend[0]?.total || 0,
      totalSuppliers: totalSuppliers[0]?.total || 0,
      pendingOrders,
      averageOrderValue: avgOrderValue[0]?.avg || 0,
      topCategories: categoriesWithPercentage
    };
  }

  /**
   * Get purchase analytics
   */
  async getPurchaseAnalytics(companyId: string, period: string = 'month'): Promise<PurchaseAnalytics> {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Daily purchases
    const dailyPurchases = await PurchaseOrder.aggregate([
      {
        $match: {
          companyId: new Types.ObjectId(companyId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          amount: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Monthly purchases
    const monthlyPurchases = await PurchaseOrder.aggregate([
      {
        $match: {
          companyId: new Types.ObjectId(companyId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          amount: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Top suppliers
    const topSuppliers = await PurchaseOrder.aggregate([
      {
        $match: {
          companyId: new Types.ObjectId(companyId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $lookup: {
          from: 'suppliers',
          localField: 'supplierId',
          foreignField: '_id',
          as: 'supplier'
        }
      },
      { $unwind: '$supplier' },
      {
        $group: {
          _id: '$supplierId',
          supplier: { $first: '$supplier.name' },
          amount: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { amount: -1 } },
      { $limit: 10 }
    ]);

    // Purchases by category
    const purchasesByCategory = await PurchaseOrder.aggregate([
      {
        $match: {
          companyId: new Types.ObjectId(companyId),
          createdAt: { $gte: startDate }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.category',
          amount: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      { $sort: { amount: -1 } }
    ]);

    const totalCategoryAmount = purchasesByCategory.reduce((sum, cat) => sum + cat.amount, 0);
    const categoriesWithPercentage = purchasesByCategory.map(cat => ({
      category: cat._id,
      amount: cat.amount,
      percentage: totalCategoryAmount > 0 ? (cat.amount / totalCategoryAmount) * 100 : 0
    }));

    // Purchase trends
    const purchaseTrends = await PurchaseOrder.aggregate([
      {
        $match: {
          companyId: new Types.ObjectId(companyId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          amount: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } },
      {
        $group: {
          _id: null,
          periods: { $push: { period: '$_id', amount: '$amount' } }
        }
      }
    ]);

    const trends = purchaseTrends[0]?.periods || [];
    const trendsWithGrowth = trends.map((trend, index) => {
      const previousAmount = index > 0 ? trends[index - 1].amount : 0;
      const growth = previousAmount > 0 ? ((trend.amount - previousAmount) / previousAmount) * 100 : 0;
      return {
        period: trend.period,
        amount: trend.amount,
        growth
      };
    });

    return {
      dailyPurchases: dailyPurchases.map(dp => ({
        date: dp._id,
        amount: dp.amount,
        orders: dp.orders
      })),
      monthlyPurchases: monthlyPurchases.map(mp => ({
        month: mp._id,
        amount: mp.amount,
        orders: mp.orders
      })),
      topSuppliers: topSuppliers.map(ts => ({
        supplier: ts.supplier,
        amount: ts.amount,
        orders: ts.orders
      })),
      purchasesByCategory: categoriesWithPercentage,
      purchaseTrends: trendsWithGrowth
    };
  }

  /**
   * Get purchase orders with filters
   */
  async getPurchaseOrders(filters: PurchaseFilters) {
    const { 
      companyId, 
      status, 
      paymentStatus, 
      supplierId, 
      category, 
      dateFrom, 
      dateTo, 
      search, 
      page, 
      limit 
    } = filters;

    const query: any = { companyId: new Types.ObjectId(companyId) };

    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (supplierId) query.supplierId = new Types.ObjectId(supplierId);
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    if (search) {
      query.$or = [
        { purchaseOrderId: { $regex: search, $options: 'i' } },
        { 'supplier.name': { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query['items.category'] = category;
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      PurchaseOrder.find(query)
        .populate('supplierId', 'name email phone category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PurchaseOrder.countDocuments(query)
    ]);

    return {
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Create purchase order
   */
  async createPurchaseOrder(orderData: any, createdBy: string): Promise<IPurchaseOrder> {
    const { items, ...otherData } = orderData;

    // Calculate totals for items
    const itemsWithTotals = items.map((item: any) => ({
      ...item,
      total: item.quantity * item.price
    }));

    // Calculate total amount
    const totalAmount = itemsWithTotals.reduce((sum: number, item: any) => sum + item.total, 0);

    // Generate purchase order ID
    const purchaseOrderId = `PO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const order = new PurchaseOrder({
      ...otherData,
      items: itemsWithTotals,
      totalAmount,
      purchaseOrderId,
      createdBy,
      updatedBy: createdBy,
      status: 'pending',
      paymentStatus: 'pending',
      orderDate: new Date()
    });

    return await order.save();
  }

  /**
   * Get purchase order by ID
   */
  async getPurchaseOrderById(id: string, companyId?: string): Promise<IPurchaseOrder> {
    const query: any = { _id: id };
    if (companyId) {
      query.companyId = new Types.ObjectId(companyId);
    }

    const order = await PurchaseOrder.findOne(query)
      .populate('supplierId', 'name email phone category')
      .lean();

    if (!order) {
      throw new Error('Purchase order not found');
    }

    return order;
  }

  /**
   * Update purchase order
   */
  async updatePurchaseOrder(
    id: string, 
    updateData: any, 
    updatedBy: string, 
    companyId?: string
  ): Promise<IPurchaseOrder> {
    const query: any = { _id: id };
    if (companyId) {
      query.companyId = new Types.ObjectId(companyId);
    }

    const order = await PurchaseOrder.findOneAndUpdate(
      query,
      { 
        ...updateData, 
        updatedBy,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('supplierId', 'name email phone category');

    if (!order) {
      throw new Error('Purchase order not found');
    }

    return order;
  }

  /**
   * Delete purchase order
   */
  async deletePurchaseOrder(id: string, companyId?: string): Promise<void> {
    const query: any = { _id: id };
    if (companyId) {
      query.companyId = new Types.ObjectId(companyId);
    }

    const result = await PurchaseOrder.deleteOne(query);
    if (result.deletedCount === 0) {
      throw new Error('Purchase order not found');
    }
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(
    id: string, 
    paymentStatus: string, 
    amount?: number, 
    updatedBy?: string, 
    companyId?: string
  ): Promise<IPurchaseOrder> {
    const query: any = { _id: id };
    if (companyId) {
      query.companyId = new Types.ObjectId(companyId);
    }

    const updateData: any = { 
      paymentStatus,
      updatedBy,
      updatedAt: new Date()
    };

    if (amount) {
      updateData.paidAmount = amount;
    }

    const order = await PurchaseOrder.findOneAndUpdate(
      query,
      updateData,
      { new: true }
    ).populate('supplierId', 'name email phone category');

    if (!order) {
      throw new Error('Purchase order not found');
    }

    return order;
  }

  /**
   * Bulk update orders
   */
  async bulkUpdateOrders(
    orderIds: string[], 
    updates: any, 
    updatedBy: string, 
    companyId?: string
  ): Promise<IPurchaseOrder[]> {
    const query: any = { _id: { $in: orderIds } };
    if (companyId) {
      query.companyId = new Types.ObjectId(companyId);
    }

    const result = await PurchaseOrder.updateMany(
      query,
      { 
        ...updates, 
        updatedBy,
        updatedAt: new Date()
      }
    );

    if (result.modifiedCount === 0) {
      throw new Error('No orders were updated');
    }

    return await PurchaseOrder.find(query)
      .populate('supplierId', 'name email phone category')
      .lean();
  }

  /**
   * Get orders by status
   */
  async getOrdersByStatus(
    status: string, 
    companyId: string, 
    page: number = 1, 
    limit: number = 10
  ) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      PurchaseOrder.find({
        companyId: new Types.ObjectId(companyId),
        status
      })
        .populate('supplierId', 'name email phone category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PurchaseOrder.countDocuments({
        companyId: new Types.ObjectId(companyId),
        status
      })
    ]);

    return {
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get orders by supplier
   */
  async getOrdersBySupplier(
    supplierId: string, 
    companyId: string, 
    page: number = 1, 
    limit: number = 10
  ) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      PurchaseOrder.find({
        companyId: new Types.ObjectId(companyId),
        supplierId: new Types.ObjectId(supplierId)
      })
        .populate('supplierId', 'name email phone category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PurchaseOrder.countDocuments({
        companyId: new Types.ObjectId(companyId),
        supplierId: new Types.ObjectId(supplierId)
      })
    ]);

    return {
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get supplier report
   */
  async getSupplierReport(companyId: string, dateFrom?: string, dateTo?: string) {
    const query: any = { companyId: new Types.ObjectId(companyId) };
    
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    return await PurchaseOrder.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'suppliers',
          localField: 'supplierId',
          foreignField: '_id',
          as: 'supplier'
        }
      },
      { $unwind: '$supplier' },
      {
        $group: {
          _id: '$supplierId',
          supplierId: { $first: '$supplierId' },
          supplierName: { $first: '$supplier.name' },
          category: { $first: '$supplier.category' },
          totalPurchases: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: '$totalAmount' },
          lastOrderDate: { $max: '$createdAt' },
          outstandingAmount: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending'] }, '$totalAmount', 0] } }
        }
      },
      {
        $addFields: {
          paymentStatus: {
            $cond: [
              { $gt: ['$outstandingAmount', 0] },
              'delayed',
              'good'
            ]
          }
        }
      },
      { $sort: { totalPurchases: -1 } }
    ]);
  }

  /**
   * Get category spend
   */
  async getCategorySpend(companyId: string, dateFrom?: string, dateTo?: string) {
    const query: any = { companyId: new Types.ObjectId(companyId) };
    
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const categoryData = await PurchaseOrder.aggregate([
      { $match: query },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.category',
          amount: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
          orders: { $addToSet: '$_id' }
        }
      },
      {
        $addFields: {
          orders: { $size: '$orders' }
        }
      },
      { $sort: { amount: -1 } }
    ]);

    const totalAmount = categoryData.reduce((sum, cat) => sum + cat.amount, 0);

    return categoryData.map(cat => ({
      category: cat._id,
      amount: cat.amount,
      percentage: totalAmount > 0 ? (cat.amount / totalAmount) * 100 : 0,
      orders: cat.orders,
      topSuppliers: [] // This would need additional aggregation for supplier details
    }));
  }

  /**
   * Export purchase data
   */
  async exportPurchaseData(format: string, filters: PurchaseFilters): Promise<string> {
    // This is a placeholder - actual implementation would generate CSV/Excel files
    // and return a download URL
    const orders = await this.getPurchaseOrders(filters);
    
    // In a real implementation, you would:
    // 1. Generate the file (CSV/Excel)
    // 2. Upload to cloud storage (S3, etc.)
    // 3. Return the download URL
    
    return `/api/v1/purchase/download/${Date.now()}.${format}`;
  }
}
