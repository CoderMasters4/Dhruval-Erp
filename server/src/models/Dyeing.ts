import mongoose, { Schema, Document } from 'mongoose';

export interface IDyeing extends Document {
  productionOrderId: mongoose.Types.ObjectId;
  batchNumber: string;
  stageNumber: number;
  
  // Dyeing Process Details
  dyeingType: 'reactive' | 'disperse' | 'acid' | 'basic' | 'direct' | 'vat' | 'sulfur';
  dyeingMethod: 'exhaust' | 'continuous' | 'semi-continuous';
  machineType: 'jigger' | 'winch' | 'jet' | 'overflow' | 'continuous_range';
  machineId?: string;
  
  // Process Parameters
  temperature: {
    planned: number;
    actual: number;
    unit: 'celsius' | 'fahrenheit';
  };
  time: {
    planned: number; // in minutes
    actual: number;
  };
  pH: {
    planned: number;
    actual: number;
  };
  liquorRatio: number; // e.g., 1:10, 1:15
  
  // Chemical Usage
  chemicals: Array<{
    chemicalName: string;
    chemicalType: 'dye' | 'auxiliary' | 'salt' | 'alkali' | 'acid' | 'softener';
    quantity: number;
    unit: string;
    concentration: number;
    supplier?: string;
    batchNumber?: string;
  }>;
  
  // Quality Parameters
  colorFastness: {
    washing: number; // 1-5 scale
    light: number;
    rubbing: number;
    perspiration: number;
  };
  shade: {
    target: string;
    achieved: string;
    deviation: number; // in percentage
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
    issueType: 'color_mismatch' | 'staining' | 'uneven_dyeing' | 'machine_fault' | 'chemical_issue' | 'other';
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
    chemicalCost: number;
    laborCost: number;
    machineCost: number;
    utilityCost: number;
    totalCost: number;
  };
  
  // Environmental Parameters
  waterUsage: number; // in liters
  energyConsumption: number; // in kWh
  wasteWaterGenerated: number; // in liters
  
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

const DyeingSchema = new Schema<IDyeing>({
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
  
  // Dyeing Process Details
  dyeingType: {
    type: String,
    enum: ['reactive', 'disperse', 'acid', 'basic', 'direct', 'vat', 'sulfur'],
    required: true
  },
  dyeingMethod: {
    type: String,
    enum: ['exhaust', 'continuous', 'semi-continuous'],
    required: true
  },
  machineType: {
    type: String,
    enum: ['jigger', 'winch', 'jet', 'overflow', 'continuous_range'],
    required: true
  },
  machineId: { type: String },
  
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
  time: {
    planned: { type: Number, required: true },
    actual: { type: Number }
  },
  pH: {
    planned: { type: Number, required: true },
    actual: { type: Number }
  },
  liquorRatio: { type: Number, required: true },
  
  // Chemical Usage
  chemicals: [{
    chemicalName: { type: String, required: true },
    chemicalType: {
      type: String,
      enum: ['dye', 'auxiliary', 'salt', 'alkali', 'acid', 'softener'],
      required: true
    },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    concentration: { type: Number },
    supplier: { type: String },
    batchNumber: { type: String }
  }],
  
  // Quality Parameters
  colorFastness: {
    washing: { type: Number, min: 1, max: 5 },
    light: { type: Number, min: 1, max: 5 },
    rubbing: { type: Number, min: 1, max: 5 },
    perspiration: { type: Number, min: 1, max: 5 }
  },
  shade: {
    target: { type: String, required: true },
    achieved: { type: String },
    deviation: { type: Number }
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
      enum: ['color_mismatch', 'staining', 'uneven_dyeing', 'machine_fault', 'chemical_issue', 'other'],
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
    chemicalCost: { type: Number, default: 0 },
    laborCost: { type: Number, default: 0 },
    machineCost: { type: Number, default: 0 },
    utilityCost: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 }
  },
  
  // Environmental Parameters
  waterUsage: { type: Number, default: 0 },
  energyConsumption: { type: Number, default: 0 },
  wasteWaterGenerated: { type: Number, default: 0 },
  
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
  collection: 'dyeing'
});

// Indexes
DyeingSchema.index({ productionOrderId: 1 });
DyeingSchema.index({ batchNumber: 1 });
DyeingSchema.index({ companyId: 1 });
DyeingSchema.index({ status: 1 });
DyeingSchema.index({ createdAt: -1 });

export default mongoose.model<IDyeing>('Dyeing', DyeingSchema);
