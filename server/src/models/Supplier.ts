import mongoose from 'mongoose';

// Performance Metrics Schema
const PerformanceMetricsSchema = new mongoose.Schema({
  onTimeDeliveryRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  qualityRejectionRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  averageLeadTime: {
    type: Number,
    default: 0,
    min: 0
  },
  totalOrders: {
    type: Number,
    default: 0,
    min: 0
  },
  totalOrderValue: {
    type: Number,
    default: 0,
    min: 0
  },
  averageOrderValue: {
    type: Number,
    default: 0,
    min: 0
  }
}, { _id: false });

// Pricing History Schema
const PricingHistorySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD']
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  orderNumber: {
    type: String,
    trim: true
  }
}, { _id: false });

// Supplier Schema (embedded in Spare)
export const SpareSupplierSchema = new mongoose.Schema({
  supplierId: {
    type: String,
    required: true,
    trim: true
  },
  supplierName: {
    type: String,
    required: true,
    trim: true
  },
  supplierCode: {
    type: String,
    required: true,
    trim: true
  },
  partNumber: {
    type: String,
    required: true,
    trim: true
  },
  isPrimary: {
    type: Boolean,
    default: false
  },
  leadTime: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  minOrderQuantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  lastSupplyDate: {
    type: Date
  },
  lastSupplyRate: {
    type: Number,
    min: 0
  },
  qualityRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    default: 3
  },
  warrantyPeriod: {
    type: Number,
    min: 0,
    default: 0
  },
  contactPerson: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'blacklisted', 'pending'],
    default: 'active'
  },
  performanceMetrics: {
    type: PerformanceMetricsSchema,
    default: () => ({})
  },
  pricingHistory: {
    type: [PricingHistorySchema],
    default: []
  },
  notes: {
    type: String,
    trim: true
  }
}, { 
  timestamps: true,
  _id: false 
});

// Indexes for better query performance
SpareSupplierSchema.index({ supplierId: 1 });
SpareSupplierSchema.index({ supplierName: 1 });
SpareSupplierSchema.index({ supplierCode: 1 });
SpareSupplierSchema.index({ partNumber: 1 });
SpareSupplierSchema.index({ status: 1 });
SpareSupplierSchema.index({ isPrimary: 1 });

// Virtual for supplier performance score
SpareSupplierSchema.virtual('performanceScore').get(function() {
  const metrics = this.performanceMetrics;
  if (!metrics) return 0;
  
  const onTimeScore = metrics.onTimeDeliveryRate || 0;
  const qualityScore = (100 - (metrics.qualityRejectionRate || 0));
  const leadTimeScore = Math.max(0, 100 - (metrics.averageLeadTime || 0));
  
  return Math.round((onTimeScore + qualityScore + leadTimeScore) / 3);
});

// Method to update performance metrics
SpareSupplierSchema.methods.updatePerformanceMetrics = function(newOrder) {
  const metrics = this.performanceMetrics;
  
  // Update total orders and value
  metrics.totalOrders = (metrics.totalOrders || 0) + 1;
  metrics.totalOrderValue = (metrics.totalOrderValue || 0) + (newOrder.value || 0);
  metrics.averageOrderValue = metrics.totalOrderValue / metrics.totalOrders;
  
  // Update lead time if provided
  if (newOrder.leadTime !== undefined) {
    const currentAvg = metrics.averageLeadTime || 0;
    const currentCount = metrics.totalOrders - 1;
    metrics.averageLeadTime = ((currentAvg * currentCount) + newOrder.leadTime) / metrics.totalOrders;
  }
  
  // Update delivery rate if provided
  if (newOrder.onTime !== undefined) {
    const currentRate = metrics.onTimeDeliveryRate || 0;
    const currentCount = metrics.totalOrders - 1;
    const newRate = newOrder.onTime ? 100 : 0;
    metrics.onTimeDeliveryRate = ((currentRate * currentCount) + newRate) / metrics.totalOrders;
  }
  
  // Update quality rejection rate if provided
  if (newOrder.rejected !== undefined) {
    const currentRate = metrics.qualityRejectionRate || 0;
    const currentCount = metrics.totalOrders - 1;
    const newRate = newOrder.rejected ? 100 : 0;
    metrics.qualityRejectionRate = ((currentRate * currentCount) + newRate) / metrics.totalOrders;
  }
  
  return this;
};

// Method to add pricing history
SpareSupplierSchema.methods.addPricingHistory = function(pricingData) {
  const newPricing = {
    date: pricingData.date || new Date(),
    price: pricingData.price,
    currency: pricingData.currency || 'USD',
    quantity: pricingData.quantity,
    orderNumber: pricingData.orderNumber
  };
  
  this.pricingHistory.push(newPricing);
  
  // Keep only last 50 pricing records
  if (this.pricingHistory.length > 50) {
    this.pricingHistory = this.pricingHistory.slice(-50);
  }
  
  return this;
};

// Method to get current price
SpareSupplierSchema.methods.getCurrentPrice = function() {
  if (this.pricingHistory.length === 0) {
    return null;
  }
  
  // Sort by date and get the most recent
  const sortedHistory = [...this.pricingHistory].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  return sortedHistory[0];
};

// Method to get price trend
SpareSupplierSchema.methods.getPriceTrend = function() {
  if (this.pricingHistory.length < 2) {
    return 'stable';
  }
  
  const sortedHistory = [...this.pricingHistory].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  const recent = sortedHistory[0].price;
  const previous = sortedHistory[1].price;
  
  if (recent > previous) return 'increasing';
  if (recent < previous) return 'decreasing';
  return 'stable';
};

// Static method to find suppliers by status
SpareSupplierSchema.statics.findByStatus = function(status) {
  return this.find({ status });
};

// Static method to find primary suppliers
SpareSupplierSchema.statics.findPrimarySuppliers = function() {
  return this.find({ isPrimary: true });
};

// Static method to find suppliers by quality rating
SpareSupplierSchema.statics.findByQualityRating = function(minRating) {
  return this.find({ qualityRating: { $gte: minRating } });
};

// Pre-save middleware to ensure only one primary supplier per spare
SpareSupplierSchema.pre('save', function(next) {
  if (this.isPrimary && this.isModified('isPrimary')) {
    // This will be handled at the Spare level
    // where we ensure only one supplier is primary
  }
  next();
});

// Export the schema
export const SpareSupplier = mongoose.model('SpareSupplier', SpareSupplierSchema);

// Export types for TypeScript
export interface ISpareSupplier extends mongoose.Document {
  supplierId: string;
  supplierName: string;
  supplierCode: string;
  partNumber: string;
  isPrimary: boolean;
  leadTime: number;
  minOrderQuantity: number;
  lastSupplyDate?: Date;
  lastSupplyRate?: number;
  qualityRating: number;
  warrantyPeriod?: number;
  contactPerson?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  status: 'active' | 'inactive' | 'blacklisted' | 'pending';
  performanceMetrics: {
    onTimeDeliveryRate: number;
    qualityRejectionRate: number;
    averageLeadTime: number;
    totalOrders: number;
    totalOrderValue: number;
    averageOrderValue: number;
  };
  pricingHistory: Array<{
    date: Date;
    price: number;
    currency: string;
    quantity: number;
    orderNumber?: string;
  }>;
  notes?: string;
  performanceScore: number;
  updatePerformanceMetrics: (newOrder: any) => ISpareSupplier;
  addPricingHistory: (pricingData: any) => ISpareSupplier;
  getCurrentPrice: () => any;
  getPriceTrend: () => string;
}
