import mongoose, { Schema, Document } from 'mongoose';

export interface IDispatch extends Document {
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  dueDate: Date;
  location: string;
  vehicleId?: string;
  vehicleNumber?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const dispatchSchema = new Schema<IDispatch>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  vehicleId: {
    type: String,
    trim: true
  },
  vehicleNumber: {
    type: String,
    trim: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
dispatchSchema.index({ companyId: 1, createdAt: -1 });
dispatchSchema.index({ assignedTo: 1 });
dispatchSchema.index({ status: 1 });
dispatchSchema.index({ priority: 1 });
dispatchSchema.index({ dueDate: 1 });

export const Dispatch = mongoose.model<IDispatch>('Dispatch', dispatchSchema);
