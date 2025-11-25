import mongoose, { Schema, Document } from 'mongoose';

export interface IDispatch extends Document {
  // Basic Information
  dispatchNumber: string;
  dispatchDate: Date;
  dispatchType: 'pickup' | 'delivery' | 'transfer' | 'return';
  status: 'pending' | 'in-progress' | 'completed' | 'delivered' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  companyId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  
  // Source Information (simplified)
  sourceWarehouseId: mongoose.Types.ObjectId;
  
  // Customer Order Reference (destination comes from here)
  customerOrderId: mongoose.Types.ObjectId;
  
  // Delivery Information
  vehicleNumber?: string;
  deliveryPersonName?: string;
  deliveryPersonNumber?: string;
  
  // Documents
  documents?: {
    photos: string[];
  };
  
  // Notes
  notes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const dispatchSchema = new Schema<IDispatch>({
  // Basic Information
  dispatchNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  dispatchDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  dispatchType: {
    type: String,
    enum: ['pickup', 'delivery', 'transfer', 'return'],
    default: 'pickup'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'delivered', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Source Information (simplified)
  sourceWarehouseId: {
    type: Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true
  },
  
  // Customer Order Reference (destination comes from here)
  customerOrderId: {
    type: Schema.Types.ObjectId,
    ref: 'CustomerOrder',
    required: true
  },
  
  // Delivery Information
  vehicleNumber: {
    type: String,
    trim: true
  },
  deliveryPersonName: {
    type: String,
    trim: true
  },
  deliveryPersonNumber: {
    type: String,
    trim: true
  },
  
  // Documents
  documents: {
    photos: [{
      type: String,
      trim: true
    }]
  },
  
  // Notes
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
dispatchSchema.index({ companyId: 1, createdAt: -1 });
// dispatchNumber index is automatically created by unique: true
dispatchSchema.index({ status: 1 });
dispatchSchema.index({ priority: 1 });
dispatchSchema.index({ dispatchDate: 1 });
dispatchSchema.index({ customerOrderId: 1 });
dispatchSchema.index({ sourceWarehouseId: 1 });
dispatchSchema.index({ createdBy: 1 });
dispatchSchema.index({ assignedTo: 1 });

export const Dispatch = mongoose.model<IDispatch>('Dispatch', dispatchSchema);
