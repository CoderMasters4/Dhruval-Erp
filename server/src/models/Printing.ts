import mongoose, { Schema, Document } from 'mongoose';

export interface IPrinting extends Document {
  productionOrderId: mongoose.Types.ObjectId;
  batchNumber: string;
  stageNumber: number;
  
  // Printing Process Details
  printingType: 'screen' | 'digital' | 'rotary' | 'flatbed' | 'roller' | 'heat_transfer' | 'sublimation';
  printingMethod: 'direct' | 'discharge' | 'resist' | 'pigment' | 'reactive' | 'acid';
  machineType: 'manual' | 'automatic' | 'semi_automatic';
  machineId?: string;
  
  // Design Details
  design: {
    designName: string;
    designCode: string;
    designFile: string;
    colors: string[];
    repeatSize: {
      width: number;
      height: number;
      unit: 'cm' | 'inch';
    };
    printArea: {
      width: number;
      height: number;
      unit: 'cm' | 'inch';
    };
  };
  
  // Process Parameters
  temperature: {
    planned: number;
    actual: number;
    unit: 'celsius' | 'fahrenheit';
  };
  pressure: {
    planned: number;
    actual: number;
    unit: 'bar' | 'psi';
  };
  speed: {
    planned: number; // meters per minute
    actual: number;
  };
  curingTime: {
    planned: number; // in minutes
    actual: number;
  };
  
  // Ink/Paste Usage
  inks: Array<{
    color: string;
    inkType: 'pigment' | 'reactive' | 'acid' | 'disperse' | 'sublimation';
    quantity: number;
    unit: string;
    viscosity: number;
    pH: number;
    supplier?: string;
    batchNumber?: string;
  }>;
  
  // Quality Parameters
  colorAccuracy: {
    target: string;
    achieved: string;
    deviation: number; // in percentage
  };
  printSharpness: {
    rating: number; // 1-5 scale
    notes?: string;
  };
  registration: {
    accuracy: number; // in mm
    status: 'good' | 'acceptable' | 'poor';
  };
  
  // Process Status
  status: 'pending' | 'in_progress' | 'completed' | 'on_hold' | 'rejected' | 'rework';
  startTime?: Date;
  endTime?: Date;
  completedBy?: mongoose.Types.ObjectId;
  
  // Quality Control
  qualityChecks: Array<{
    parameter: string;
    expectedValue: string;
    actualValue: string;
    status: 'pass' | 'fail' | 'rework';
    checkedBy: mongoose.Types.ObjectId;
    checkedAt: Date;
    remarks?: string;
  }>;
  
  // Output Details
  inputQuantity: number;
  outputQuantity: number;
  wasteQuantity: number;
  efficiency: number; // percentage
  
  // Issues and Rework
  issues: Array<{
    issueType: 'color_mismatch' | 'registration_error' | 'smudging' | 'bleeding' | 'machine_fault' | 'ink_issue' | 'other';
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    reportedBy: mongoose.Types.ObjectId;
    reportedAt: Date;
    resolvedAt?: Date;
    resolution?: string;
  }>;
  
  // Rework Details
  reworkDetails?: {
    reason: string;
    reworkType: 'partial' | 'complete';
    reworkQuantity: number;
    reworkCost: number;
    reworkBy: mongoose.Types.ObjectId;
    reworkAt: Date;
  };
  
  // Cost Analysis
  costBreakdown: {
    inkCost: number;
    laborCost: number;
    machineCost: number;
    utilityCost: number;
    totalCost: number;
  };
  
  // Environmental Parameters
  waterUsage: number; // in liters
  energyConsumption: number; // in kWh
  wasteGenerated: number; // in kg
  
  // Documentation
  processImages: string[];
  qualityCertificates: string[];
  testReports: string[];
  
  // Metadata
  companyId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PrintingSchema = new Schema<IPrinting>({
  productionOrderId: { 
    type: Schema.Types.ObjectId, 
    ref: 'ProductionOrder', 
    required: true 
  },
  batchNumber: { 
    type: String, 
    required: true,
    unique: true 
  },
  stageNumber: { 
    type: Number, 
    required: true 
  },
  
  // Printing Process Details
  printingType: {
    type: String,
    enum: ['screen', 'digital', 'rotary', 'flatbed', 'roller', 'heat_transfer', 'sublimation'],
    required: true
  },
  printingMethod: {
    type: String,
    enum: ['direct', 'discharge', 'resist', 'pigment', 'reactive', 'acid'],
    required: true
  },
  machineType: {
    type: String,
    enum: ['manual', 'automatic', 'semi_automatic'],
    required: true
  },
  machineId: { type: String },
  
  // Design Details
  design: {
    designName: { type: String, required: true },
    designCode: { type: String, required: true },
    designFile: { type: String, required: true },
    colors: [{ type: String }],
    repeatSize: {
      width: { type: Number, required: true },
      height: { type: Number, required: true },
      unit: { 
        type: String, 
        enum: ['cm', 'inch'], 
        default: 'cm' 
      }
    },
    printArea: {
      width: { type: Number, required: true },
      height: { type: Number, required: true },
      unit: { 
        type: String, 
        enum: ['cm', 'inch'], 
        default: 'cm' 
      }
    }
  },
  
  // Process Parameters
  temperature: {
    planned: { type: Number, required: true },
    actual: { type: Number },
    unit: { 
      type: String, 
      enum: ['celsius', 'fahrenheit'], 
      default: 'celsius' 
    }
  },
  pressure: {
    planned: { type: Number, required: true },
    actual: { type: Number },
    unit: { 
      type: String, 
      enum: ['bar', 'psi'], 
      default: 'bar' 
    }
  },
  speed: {
    planned: { type: Number, required: true },
    actual: { type: Number }
  },
  curingTime: {
    planned: { type: Number, required: true },
    actual: { type: Number }
  },
  
  // Ink/Paste Usage
  inks: [{
    color: { type: String, required: true },
    inkType: {
      type: String,
      enum: ['pigment', 'reactive', 'acid', 'disperse', 'sublimation'],
      required: true
    },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    viscosity: { type: Number },
    pH: { type: Number },
    supplier: { type: String },
    batchNumber: { type: String }
  }],
  
  // Quality Parameters
  colorAccuracy: {
    target: { type: String, required: true },
    achieved: { type: String },
    deviation: { type: Number }
  },
  printSharpness: {
    rating: { type: Number, min: 1, max: 5 },
    notes: { type: String }
  },
  registration: {
    accuracy: { type: Number },
    status: {
      type: String,
      enum: ['good', 'acceptable', 'poor']
    }
  },
  
  // Process Status
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'on_hold', 'rejected', 'rework'],
    default: 'pending'
  },
  startTime: { type: Date },
  endTime: { type: Date },
  completedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  
  // Quality Control
  qualityChecks: [{
    parameter: { type: String, required: true },
    expectedValue: { type: String, required: true },
    actualValue: { type: String, required: true },
    status: {
      type: String,
      enum: ['pass', 'fail', 'rework'],
      required: true
    },
    checkedBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    checkedAt: { type: Date, required: true },
    remarks: { type: String }
  }],
  
  // Output Details
  inputQuantity: { type: Number, required: true, min: 0 },
  outputQuantity: { type: Number, min: 0 },
  wasteQuantity: { type: Number, default: 0, min: 0 },
  efficiency: { type: Number, min: 0, max: 100 },
  
  // Issues and Rework
  issues: [{
    issueType: {
      type: String,
      enum: ['color_mismatch', 'registration_error', 'smudging', 'bleeding', 'machine_fault', 'ink_issue', 'other'],
      required: true
    },
    description: { type: String, required: true },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true
    },
    reportedBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    reportedAt: { type: Date, required: true },
    resolvedAt: { type: Date },
    resolution: { type: String }
  }],
  
  // Rework Details
  reworkDetails: {
    reason: { type: String },
    reworkType: {
      type: String,
      enum: ['partial', 'complete']
    },
    reworkQuantity: { type: Number },
    reworkCost: { type: Number },
    reworkBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reworkAt: { type: Date }
  },
  
  // Cost Analysis
  costBreakdown: {
    inkCost: { type: Number, default: 0 },
    laborCost: { type: Number, default: 0 },
    machineCost: { type: Number, default: 0 },
    utilityCost: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 }
  },
  
  // Environmental Parameters
  waterUsage: { type: Number, default: 0 },
  energyConsumption: { type: Number, default: 0 },
  wasteGenerated: { type: Number, default: 0 },
  
  // Documentation
  processImages: [{ type: String }],
  qualityCertificates: [{ type: String }],
  testReports: [{ type: String }],
  
  // Metadata
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
  updatedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, {
  timestamps: true,
  collection: 'printing'
});

// Indexes
PrintingSchema.index({ productionOrderId: 1 });
PrintingSchema.index({ batchNumber: 1 });
PrintingSchema.index({ companyId: 1 });
PrintingSchema.index({ status: 1 });
PrintingSchema.index({ createdAt: -1 });

export default mongoose.model<IPrinting>('Printing', PrintingSchema);
