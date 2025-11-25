import { Schema, model, Document } from 'mongoose';

export interface IGatePass extends Document {
  gatePassNumber: string;
  vehicleId: Schema.Types.ObjectId;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  driverIdNumber?: string;
  driverLicenseNumber?: string;
  purpose: 'delivery' | 'pickup' | 'maintenance' | 'other';
  reason: string;
  personToMeet?: string;
  department?: string;
  companyId: Schema.Types.ObjectId;
  timeIn: Date;
  timeOut?: Date;
  status: 'active' | 'completed' | 'expired' | 'cancelled';
  securityNotes?: string;
  items?: {
    description: string;
    quantity: number;
    value?: number;
  }[];
  images?: string[];
  printedAt?: Date;
  printedBy?: Schema.Types.ObjectId;
  approvedBy?: Schema.Types.ObjectId;
  approvedAt?: Date;
  createdBy: Schema.Types.ObjectId;
  isActive: boolean;
  // Instance methods
  isCurrentlyActive(): boolean;
  complete(): void;
  cancel(): void;
  getDuration(): number;
  print(printedBy: string): void;
}

const GatePassSchema = new Schema<IGatePass>({
  gatePassNumber: {
    type: String,
    required: false, // Will be auto-generated in pre-save hook
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },
  
  vehicleId: {
    type: Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true,
    index: true
  },
  
  vehicleNumber: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    index: true
  },
  
  driverName: {
    type: String,
    required: true,
    trim: true
  },
  
  driverPhone: {
    type: String,
    required: true,
    trim: true
  },
  
  driverIdNumber: {
    type: String,
    trim: true
  },
  
  driverLicenseNumber: {
    type: String,
    trim: true
  },
  
  purpose: {
    type: String,
    enum: ['delivery', 'pickup', 'maintenance', 'other'],
    required: true,
    index: true
  },
  
  reason: {
    type: String,
    required: true,
    trim: true
  },
  
  personToMeet: {
    type: String,
    trim: true
  },
  
  department: {
    type: String,
    trim: true
  },
  
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  
  timeIn: {
    type: Date,
    default: Date.now,
    required: true,
    index: true
  },
  
  timeOut: {
    type: Date,
    index: true
  },
  
  status: {
    type: String,
    enum: ['active', 'completed', 'expired', 'cancelled'],
    default: 'active',
    index: true
  },
  
  securityNotes: {
    type: String,
    trim: true
  },
  
  items: [{
    description: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    value: {
      type: Number,
      min: 0
    }
  }],
  
  images: [String],
  
  printedAt: {
    type: Date
  },
  
  printedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  
  approvedAt: {
    type: Date
  },
  
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true,
  collection: 'gatepasses'
});

// Indexes for optimal performance
GatePassSchema.index({ companyId: 1, status: 1 });
GatePassSchema.index({ companyId: 1, timeIn: -1 });
GatePassSchema.index({ vehicleNumber: 1, timeIn: -1 });
GatePassSchema.index({ driverPhone: 1, timeIn: -1 });
GatePassSchema.index({ purpose: 1, timeIn: -1 });

// Text search index
GatePassSchema.index({
  gatePassNumber: 'text',
  vehicleNumber: 'text',
  driverName: 'text',
  reason: 'text',
  personToMeet: 'text'
});

// Pre-save middleware
GatePassSchema.pre('save', function(next) {
  // Auto-generate gate pass number if not provided
  if (!this.gatePassNumber) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.gatePassNumber = `GP${timestamp}${random}`;
  }
  
  next();
});

// Instance methods
GatePassSchema.methods.isCurrentlyActive = function(): boolean {
  return this.status === 'active' && this.isActive;
};

GatePassSchema.methods.complete = function(): void {
  this.status = 'completed';
  this.timeOut = new Date();
};

GatePassSchema.methods.cancel = function(): void {
  this.status = 'cancelled';
};

GatePassSchema.methods.getDuration = function(): number {
  if (!this.timeOut) return 0;
  return Math.floor((this.timeOut.getTime() - this.timeIn.getTime()) / (1000 * 60)); // Duration in minutes
};

GatePassSchema.methods.print = function(printedBy: string): void {
  this.printedAt = new Date();
  this.printedBy = new Schema.Types.ObjectId(printedBy);
};

// Static methods
GatePassSchema.statics.findByCompany = function(companyId: string) {
  return this.find({ companyId, isActive: true });
};

GatePassSchema.statics.findActive = function(companyId: string) {
  return this.find({
    companyId,
    status: 'active',
    isActive: true
  });
};

GatePassSchema.statics.findByVehicle = function(vehicleNumber: string, companyId: string) {
  return this.find({
    vehicleNumber: vehicleNumber.toUpperCase(),
    companyId,
    isActive: true
  }).sort({ timeIn: -1 });
};

GatePassSchema.statics.getGatePassStats = function(companyId: string) {
  return this.aggregate([
    { $match: { companyId: new Schema.Types.ObjectId(companyId), isActive: true } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalDuration: {
          $sum: {
            $cond: [
              { $ne: ['$timeOut', null] },
              { $divide: [{ $subtract: ['$timeOut', '$timeIn'] }, 60000] }, // Convert to minutes
              0
            ]
          }
        }
      }
    }
  ]);
};

export default model<IGatePass>('GatePass', GatePassSchema);
