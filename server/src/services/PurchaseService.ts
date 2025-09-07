import { Types } from 'mongoose';
import PurchaseOrder from '@/models/PurchaseOrder';
import { ISpareSupplier, IPurchaseOrder } from '@/types/models';
import { BaseService } from '@/services/BaseService';
import { InventoryService } from './InventoryService';
import { AppError } from '../utils/errors';

export interface PurchaseFilters {
  companyId: string;
  status?: string;
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

interface PurchaseOrderData {
  companyId: string;
  supplier: {
    supplierId: string;
    name?: string;
  };
  items: Array<{
    quantity: number;
    rate: number;
    category?: string;
    [key: string]: any;
  }>;
  [key: string]: any;
}

const PENDING_STATUSES = ['draft', 'pending_approval', 'sent', 'acknowledged'] as const;

export class PurchaseService extends BaseService<IPurchaseOrder> {
  constructor() {
    super(PurchaseOrder);
  }

  private validateObjectId(id: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error(`Invalid ObjectId: ${id}`);
    }
    return new Types.ObjectId(id);
  }

  private validateDate(dateStr?: string): Date | undefined {
    if (!dateStr) return undefined;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date: ${dateStr}`);
    }
    return date;
  }

  private sanitizeSearch(search?: string): string | undefined {
    if (!search) return undefined;
    // Limit search length and escape regex special characters
    const maxLength = 100;
    const sanitized = search.slice(0, maxLength).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return sanitized;
  }

  /**
   * Get purchase statistics
   */
  async getPurchaseStats(companyId: string): Promise<PurchaseStats> {
    this.validateObjectId(companyId);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalPurchases, monthlySpend, totalSuppliers, pendingOrders, avgOrderValue, topCategories] =
      await Promise.all([
        PurchaseOrder.aggregate([
          { $match: { companyId: this.validateObjectId(companyId) } },
          { $group: { _id: null, total: { $sum: '$amounts.grandTotal' } } },
        ]),
        PurchaseOrder.aggregate([
          {
            $match: {
              companyId: this.validateObjectId(companyId),
              createdAt: { $gte: startOfMonth },
            },
          },
          { $group: { _id: null, total: { $sum: '$amounts.grandTotal' } } },
        ]),
        PurchaseOrder.aggregate([
          { $match: { companyId: this.validateObjectId(companyId) } },
          { $group: { _id: '$supplier.supplierId' } },
          { $count: 'total' },
        ]),
        PurchaseOrder.countDocuments({
          companyId: this.validateObjectId(companyId),
          status: { $in: PENDING_STATUSES },
        }),
        PurchaseOrder.aggregate([
          { $match: { companyId: this.validateObjectId(companyId) } },
          { $group: { _id: null, avg: { $avg: '$amounts.grandTotal' } } },
        ]),
        PurchaseOrder.aggregate([
          { $match: { companyId: this.validateObjectId(companyId) } },
          { $unwind: '$items' },
          {
            $group: {
              _id: '$items.category',
              amount: { $sum: { $multiply: ['$items.quantity', '$items.rate'] } },
            },
          },
          { $sort: { amount: -1 } },
          { $limit: 5 },
        ]),
      ]);

    const totalAmount = totalPurchases[0]?.total ?? 0;
    const categoriesWithPercentage = topCategories.map((cat) => ({
      category: cat._id ?? 'Unknown',
      amount: cat.amount ?? 0,
      percentage: totalAmount > 0 ? (cat.amount / totalAmount) * 100 : 0,
    }));

    return {
      totalPurchases: totalAmount,
      monthlySpend: monthlySpend[0]?.total ?? 0,
      totalSuppliers: totalSuppliers[0]?.total ?? 0,
      pendingOrders,
      averageOrderValue: avgOrderValue[0]?.avg ?? 0,
      topCategories: categoriesWithPercentage,
    };
  }

  /**
   * Get purchase analytics
   */
  async getPurchaseAnalytics(companyId: string, period: string = 'month'): Promise<PurchaseAnalytics> {
    this.validateObjectId(companyId);
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
        throw new Error(`Invalid period: ${period}`);
    }

    const [dailyPurchases, monthlyPurchases, topSuppliers, purchasesByCategory, purchaseTrends] =
      await Promise.all([
        PurchaseOrder.aggregate([
          {
            $match: {
              companyId: this.validateObjectId(companyId),
              createdAt: { $gte: startDate },
            },
          },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              amount: { $sum: '$amounts.grandTotal' },
              orders: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        PurchaseOrder.aggregate([
          {
            $match: {
              companyId: this.validateObjectId(companyId),
              createdAt: { $gte: startDate },
            },
          },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
              amount: { $sum: '$amounts.grandTotal' },
              orders: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        PurchaseOrder.aggregate([
          {
            $match: {
              companyId: this.validateObjectId(companyId),
              createdAt: { $gte: startDate },
            },
          },
          {
            $lookup: {
              from: 'suppliers', // Ensure this matches the actual collection name
              localField: 'supplier.supplierId',
              foreignField: '_id',
              as: 'supplier',
            },
          },
          { $unwind: { path: '$supplier', preserveNullAndEmptyArrays: true } },
          {
            $group: {
              _id: '$supplier.supplierId',
              supplier: { $first: '$supplier.name' },
              amount: { $sum: '$amounts.grandTotal' },
              orders: { $sum: 1 },
            },
          },
          { $sort: { amount: -1 } },
          { $limit: 10 },
        ]),
        PurchaseOrder.aggregate([
          {
            $match: {
              companyId: this.validateObjectId(companyId),
              createdAt: { $gte: startDate },
            },
          },
          { $unwind: '$items' },
          {
            $group: {
              _id: '$items.category',
              amount: { $sum: { $multiply: ['$items.quantity', '$items.rate'] } },
            },
          },
          { $sort: { amount: -1 } },
        ]),
        PurchaseOrder.aggregate([
          {
            $match: {
              companyId: this.validateObjectId(companyId),
              createdAt: { $gte: startDate },
            },
          },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              amount: { $sum: '$amounts.grandTotal' },
            },
          },
          { $sort: { _id: 1 } },
          {
            $group: {
              _id: null,
              periods: { $push: { period: '$_id', amount: '$amount' } },
            },
          },
        ]),
      ]);

    const totalCategoryAmount = purchasesByCategory.reduce((sum, cat) => sum + cat.amount, 0);
    const categoriesWithPercentage = purchasesByCategory.map((cat) => ({
      category: cat._id ?? 'Unknown',
      amount: cat.amount ?? 0,
      percentage: totalCategoryAmount > 0 ? (cat.amount / totalCategoryAmount) * 100 : 0,
    }));

    const trends = purchaseTrends[0]?.periods ?? [];
    const trendsWithGrowth = trends.map((trend, index) => {
      const previousAmount = index > 0 ? trends[index - 1].amount : 0;
      const growth = previousAmount > 0 ? ((trend.amount - previousAmount) / previousAmount) * 100 : 0;
      return {
        period: trend.period,
        amount: trend.amount,
        growth,
      };
    });

    return {
      dailyPurchases: dailyPurchases.map((dp) => ({
        date: dp._id,
        amount: dp.amount ?? 0,
        orders: dp.orders ?? 0,
      })),
      monthlyPurchases: monthlyPurchases.map((mp) => ({
        month: mp._id,
        amount: mp.amount ?? 0,
        orders: mp.orders ?? 0,
      })),
      topSuppliers: topSuppliers.map((ts) => ({
        supplier: ts.supplier ?? 'Unknown',
        amount: ts.amount ?? 0,
        orders: ts.orders ?? 0,
      })),
      purchasesByCategory: categoriesWithPercentage,
      purchaseTrends: trendsWithGrowth,
    };
  }

  /**
   * Get purchase orders with filters
   */
  async getPurchaseOrders(filters: PurchaseFilters) {
    const { companyId, status, supplierId, category, dateFrom, dateTo, search, page, limit } = filters;

    this.validateObjectId(companyId);
    const query: any = { companyId: this.validateObjectId(companyId) };

    if (status) query.status = status;
    if (supplierId) query['supplier.supplierId'] = this.validateObjectId(supplierId);
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = this.validateDate(dateFrom);
      if (dateTo) query.createdAt.$lte = this.validateDate(dateTo);
    }

    const sanitizedSearch = this.sanitizeSearch(search);
    if (sanitizedSearch) {
      query.$or = [
        { purchaseOrderId: { $regex: sanitizedSearch, $options: 'i' } },
        { 'supplier.name': { $regex: sanitizedSearch, $options: 'i' } },
        { notes: { $regex: sanitizedSearch, $options: 'i' } },
      ];
    }

    if (category) {
      query['items.category'] = category;
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      PurchaseOrder.find(query)
        .populate('supplier.supplierId', 'name email phone category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PurchaseOrder.countDocuments(query),
    ]);

    return {
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Create purchase order
   */
  async createPurchaseOrder(orderData: PurchaseOrderData, createdBy: string): Promise<IPurchaseOrder> {
    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      throw new Error('Items array is required and must not be empty');
    }

    this.validateObjectId(orderData.companyId);
    if (orderData.supplier?.supplierId) {
      this.validateObjectId(orderData.supplier.supplierId);
    }

    const itemsWithTotals = orderData.items.map((item) => {
      if (typeof item.quantity !== 'number' || typeof item.rate !== 'number') {
        throw new Error('Item quantity and rate must be numbers');
      }
      return {
        ...item,
        lineTotal: item.quantity * item.rate,
      };
    });

    const grandTotal = itemsWithTotals.reduce((sum, item) => sum + item.lineTotal, 0);

    const purchaseOrderId = `PO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const order = new PurchaseOrder({
      ...orderData,
      items: itemsWithTotals,
      amounts: {
        subtotal: grandTotal,
        totalDiscount: 0,
        taxableAmount: grandTotal,
        totalTaxAmount: 0,
        freightCharges: 0,
        packingCharges: 0,
        otherCharges: 0,
        roundingAdjustment: 0,
        grandTotal,
      },
      purchaseOrderId,
      createdBy,
      updatedBy: createdBy,
      status: 'draft',
      orderDate: new Date(),
    });

    return await order.save();
  }

  /**
   * Get purchase order by ID
   */
  async getPurchaseOrderById(id: string, companyId?: string): Promise<IPurchaseOrder> {
    this.validateObjectId(id);
    const query: any = { _id: this.validateObjectId(id) };
    if (companyId) {
      query.companyId = this.validateObjectId(companyId);
    }

    const order = await PurchaseOrder.findOne(query)
      .populate('supplier.supplierId', 'name email phone category')
      .lean();

    if (!order) {
      throw new Error(`Purchase order not found: ${id}`);
    }

    return order;
  }

  /**
   * Update purchase order
   */
  async updatePurchaseOrder(
    id: string,
    updateData: Partial<IPurchaseOrder>,
    updatedBy: string,
    companyId?: string
  ): Promise<IPurchaseOrder> {
    this.validateObjectId(id);
    const query: any = { _id: this.validateObjectId(id) };
    if (companyId) {
      query.companyId = this.validateObjectId(companyId);
    }

    const order = await PurchaseOrder.findOneAndUpdate(
      query,
      {
        ...updateData,
        updatedBy,
        updatedAt: new Date(),
      },
      { new: true }
    )
      .populate('supplier.supplierId', 'name email phone category')
      .lean();

    if (!order) {
      throw new Error(`Purchase order not found: ${id}`);
    }

    return order;
  }

  /**
   * Delete purchase order
   */
  async deletePurchaseOrder(id: string, companyId?: string): Promise<void> {
    this.validateObjectId(id);
    const query: any = { _id: this.validateObjectId(id) };
    if (companyId) {
      query.companyId = this.validateObjectId(companyId);
    }

    const result = await PurchaseOrder.deleteOne(query);
    if (result.deletedCount === 0) {
      throw new Error(`Purchase order not found: ${id}`);
    }
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(
    id: string,
    paymentStatus: string,
    amount: number,
    updatedBy: string,
    companyId?: string
  ): Promise<IPurchaseOrder> {
    this.validateObjectId(id);
    if (typeof paymentStatus !== 'string' || typeof amount !== 'number') {
      throw new Error('Invalid payment status or amount');
    }
    const query: any = { _id: this.validateObjectId(id) };
    if (companyId) {
      query.companyId = this.validateObjectId(companyId);
    }

    const order = await PurchaseOrder.findOneAndUpdate(
      query,
      {
        paymentStatus,
        lastPaymentAmount: amount,
        lastPaymentDate: new Date(),
        updatedBy,
        updatedAt: new Date(),
      },
      { new: true }
    )
      .populate('supplier.supplierId', 'name email phone category')
      .lean();

    if (!order) {
      throw new Error(`Purchase order not found: ${id}`);
    }

    return order;
  }

  /**
   * Bulk update orders
   */
  async bulkUpdateOrders(
    orderIds: string[],
    updates: Partial<IPurchaseOrder>,
    updatedBy: string,
    companyId?: string
  ): Promise<IPurchaseOrder[]> {
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      throw new Error('Order IDs array is required and must not be empty');
    }
    orderIds.forEach((id) => this.validateObjectId(id));
    const query: any = { _id: { $in: orderIds.map((id) => this.validateObjectId(id)) } };
    if (companyId) {
      query.companyId = this.validateObjectId(companyId);
    }

    const result = await PurchaseOrder.updateMany(
      query,
      {
        ...updates,
        updatedBy,
        updatedAt: new Date(),
      }
    );

    if (result.modifiedCount === 0) {
      throw new Error('No orders were updated');
    }

    return await PurchaseOrder.find(query)
      .populate('supplier.supplierId', 'name email phone category')
      .lean();
  }

  /**
   * Get orders by status
   */
  async getOrdersByStatus(status: string, companyId: string, page: number = 1, limit: number = 10) {
    this.validateObjectId(companyId);
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      PurchaseOrder.find({
        companyId: this.validateObjectId(companyId),
        status,
      })
        .populate('supplier.supplierId', 'name email phone category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PurchaseOrder.countDocuments({
        companyId: this.validateObjectId(companyId),
        status,
      }),
    ]);

    return {
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get orders by supplier
   */
  async getOrdersBySupplier(supplierId: string, companyId: string, page: number = 1, limit: number = 10) {
    this.validateObjectId(companyId);
    this.validateObjectId(supplierId);
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      PurchaseOrder.find({
        companyId: this.validateObjectId(companyId),
        'supplier.supplierId': this.validateObjectId(supplierId),
      })
        .populate('supplier.supplierId', 'name email phone category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PurchaseOrder.countDocuments({
        companyId: this.validateObjectId(companyId),
        'supplier.supplierId': this.validateObjectId(supplierId),
      }),
    ]);

    return {
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get supplier report
   */
  async getSupplierReport(companyId: string, dateFrom?: string, dateTo?: string) {
    this.validateObjectId(companyId);
    const query: any = { companyId: this.validateObjectId(companyId) };

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = this.validateDate(dateFrom);
      if (dateTo) query.createdAt.$lte = this.validateDate(dateTo);
    }

    return await PurchaseOrder.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'suppliers',
          localField: 'supplier.supplierId',
          foreignField: '_id',
          as: 'supplier',
        },
      },
      { $unwind: { path: '$supplier', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$supplier.supplierId',
          supplierId: { $first: '$supplier.supplierId' },
          supplierName: { $first: '$supplier.name' },
          category: { $first: '$supplier.category' },
          totalPurchases: { $sum: '$amounts.grandTotal' },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: '$amounts.grandTotal' },
          lastOrderDate: { $max: '$createdAt' },
          outstandingAmount: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, '$amounts.grandTotal', 0] } },
        },
      },
      {
        $addFields: {
          paymentStatus: {
            $cond: [{ $gt: ['$outstandingAmount', 0] }, 'delayed', 'good'],
          },
        },
      },
      { $sort: { totalPurchases: -1 } },
    ]);
  }

  /**
   * Get category spend
   */
  async getCategorySpend(companyId: string, dateFrom?: string, dateTo?: string) {
    this.validateObjectId(companyId);
    const query: any = { companyId: this.validateObjectId(companyId) };

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = this.validateDate(dateFrom);
      if (dateTo) query.createdAt.$lte = this.validateDate(dateTo);
    }

    const categoryData = await PurchaseOrder.aggregate([
      { $match: query },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.category',
          amount: { $sum: { $multiply: ['$items.quantity', '$items.rate'] } },
          orders: { $addToSet: '$_id' },
        },
      },
      {
        $addFields: {
          orders: { $size: '$orders' },
        },
      },
      { $sort: { amount: -1 } },
    ]);

    const totalAmount = categoryData.reduce((sum, cat) => sum + cat.amount, 0);

    return categoryData.map((cat) => ({
      category: cat._id ?? 'Unknown',
      amount: cat.amount ?? 0,
      percentage: totalAmount > 0 ? (cat.amount / totalAmount) * 100 : 0,
      orders: cat.orders,
      topSuppliers: [], // Placeholder for potential supplier details
    }));
  }

  /**
   * Export purchase data
   */
  async exportPurchaseData(format: string, filters: PurchaseFilters): Promise<string> {
    if (!['csv', 'excel'].includes(format)) {
      throw new Error(`Unsupported format: ${format}`);
    }
    this.validateObjectId(filters.companyId);
    const orders = await this.getPurchaseOrders(filters);

    // Placeholder for file generation logic
    // In production, implement CSV/Excel generation and upload to storage
    return `/api/v1/purchase/download/${Date.now()}.${format}`;
  }

  /**
   * Receive purchase order and update inventory
   */
  async receivePurchaseOrder(
    orderId: string, 
    receivedItems: Array<{
      itemId: string;
      itemName: string;
      quantity: number;
      unit: string;
      warehouseId: string;
      qualityCheck?: boolean;
      notes?: string;
    }>,
    receivedBy: string,
    companyId: string
  ): Promise<any> {
    try {
      const inventoryService = new InventoryService();
      
      // Find the purchase order
      const purchaseOrder = await PurchaseOrder.findOne({
        _id: orderId,
        companyId: this.validateObjectId(companyId)
      });

      if (!purchaseOrder) {
        throw new AppError('Purchase order not found', 404);
      }

      // Update inventory for each received item
      for (const receivedItem of receivedItems) {
        // Check if item exists in inventory
        let inventoryItem = await inventoryService.findOne({
          itemName: receivedItem.itemName,
          companyId: companyId
        });

        if (!inventoryItem) {
          // Create new inventory item if it doesn't exist
          const newItemData = {
            itemName: receivedItem.itemName,
            itemCode: `ITEM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            companyItemCode: `COMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            companyId: new Types.ObjectId(companyId),
            category: {
              primary: 'raw_material' as const
            },
            productType: 'saree' as const,
            stock: {
              currentStock: receivedItem.quantity,
              availableStock: receivedItem.quantity,
              reservedStock: 0,
              inTransitStock: 0,
              damagedStock: 0,
              unit: receivedItem.unit,
              minStockLevel: 0,
              reorderLevel: 0,
              maxStockLevel: receivedItem.quantity * 2,
              valuationMethod: 'FIFO' as const,
              averageCost: 0,
              totalValue: 0
            },
            pricing: {
              costPrice: 0,
              sellingPrice: 0,
              mrp: 0,
              currency: 'INR'
            },
            status: {
              isActive: true,
              isDiscontinued: false,
              isFastMoving: false,
              isSlowMoving: false,
              isObsolete: false,
              requiresApproval: false
            }
          };

          inventoryItem = await inventoryService.createInventoryItem(newItemData, receivedBy);
        } else {
          // Update existing item stock
          await inventoryService.updateStock(
            inventoryItem._id.toString(),
            receivedItem.warehouseId,
            receivedItem.quantity,
            'in',
            `Purchase Order: ${purchaseOrder.poNumber}`,
            receivedItem.notes || 'Received from purchase order',
            receivedBy
          );
        }
      }

      // Update purchase order status
      const updatedOrder = await PurchaseOrder.findOneAndUpdate(
        {
          _id: orderId,
          companyId: this.validateObjectId(companyId)
        },
        {
          status: 'received',
          actualDelivery: new Date(),
          receivedBy: receivedBy,
          receivedItems: receivedItems,
          updatedAt: new Date()
        },
        { new: true }
      );

      console.log('Purchase order received successfully', {
        orderId,
        receivedItemsCount: receivedItems.length,
        receivedBy,
        companyId
      });

      return updatedOrder;
    } catch (error) {
      console.error('Error receiving purchase order:', error);
      throw error;
    }
  }

  /**
   * Create new inventory item from purchase order
   */
  async createInventoryItemFromPurchase(
    itemData: {
      itemName: string;
      description?: string;
      category: string;
      quantity: number;
      unit: string;
      costPrice: number;
      warehouseId: string;
    },
    createdBy: string,
    companyId: string
  ): Promise<any> {
    try {
      const inventoryService = new InventoryService();
      
      const newItemData = {
        itemName: itemData.itemName,
        itemDescription: itemData.description || '',
        itemCode: `ITEM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        companyItemCode: `COMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        companyId: new Types.ObjectId(companyId),
        category: {
          primary: itemData.category as 'raw_material' | 'finished_goods' | 'consumables' | 'semi_finished' | 'spare_parts'
        },
        productType: 'saree' as const,
        stock: {
          currentStock: itemData.quantity,
          availableStock: itemData.quantity,
          reservedStock: 0,
          inTransitStock: 0,
          damagedStock: 0,
          unit: itemData.unit,
          minStockLevel: 0,
          reorderLevel: 0,
          maxStockLevel: itemData.quantity * 2,
          valuationMethod: 'FIFO' as const,
          averageCost: itemData.costPrice,
          totalValue: itemData.quantity * itemData.costPrice
        },
        pricing: {
          costPrice: itemData.costPrice,
          sellingPrice: itemData.costPrice * 1.2, // 20% markup
          mrp: itemData.costPrice * 1.5, // 50% markup
          currency: 'INR'
        },
        status: {
          isActive: true,
          isDiscontinued: false,
          isFastMoving: false,
          isSlowMoving: false,
          isObsolete: false,
          requiresApproval: false
        }
      };

      const inventoryItem = await inventoryService.createInventoryItem(newItemData, createdBy);

      // Add initial stock
      if (itemData.quantity > 0) {
        await inventoryService.updateStock(
          inventoryItem._id.toString(),
          itemData.warehouseId,
          itemData.quantity,
          'in',
          'Initial stock from purchase',
          'Initial stock added from purchase order',
          createdBy
        );
      }

      return inventoryItem;
    } catch (error) {
      console.error('Error creating inventory item from purchase:', error);
      throw error;
    }
  }
}