import mongoose, { Schema, Document } from 'mongoose';

export interface IFinishing extends Document {
  productionOrderId: mongoose.Types.ObjectId;
  batchNumber: string;
  stageNumber: number;
  
  // Finishing Process Details
  finishingType: 'stenter' | 'coating' | 'calendering' | 'compacting' | 'sanforizing' | 'mercerizing' | 'softening';
  machineType: 'stenter_frame' | 'coating_machine' | 'calendar_machine' | 'compactor' | 'sanforizer' | 'mercerizer';
  machineId?: string;
  
  // Process Parameters
  temperature: {
    planned: number;
    actual: number;
    unit: 'celsius' | 'fahrenheit';
  };
  speed: {
    planned: number; // meters per minute
    actual: number;
  };
  tension: {
    planned: number; // in percentage
    actual: number;
  };
  pressure: {
    planned: number; // in bar
    actual: number;
  };
  
  // Stenter Specific Parameters
  stenterSettings?: {
    overfeed: number; // percentage
    pinning: {
      type: 'pin' | 'clip' | 'combination';
      spacing: number; // in mm
    };
    dwellTime: number; // in minutes
    airFlow: number; // in m³/min
  };
  
  // Coating Specific Parameters
  coatingSettings?: {
    coatingType: 'acrylic' | 'polyurethane' | 'silicone' | 'fluorocarbon' | 'wax' | 'resin';
    coatingWeight: number; // in g/m²
    applicationMethod: 'knife' | 'roller' | 'spray' | 'foam';
    curingTemperature: number;
    curingTime: number; // in minutes
  };
  
  // Chemical Usage
  chemicals: Array<{
    chemicalName: string;
    chemicalType: 'softener' | 'resin' | 'catalyst' | 'crosslinker' | 'defoamer' | 'wetting_agent';
    quantity: number;
    unit: string;
    concentration: number;
    supplier?: string;
    batchNumber?: string;
  }>;
  
  // Quality Parameters
  dimensionalStability: {
    warpShrinkage: number; // percentage
    weftShrinkage: number; // percentage
    skew: number; // in degrees
  };
  handFeel: {
    softness: number; // 1-5 scale
    stiffness: number; // 1-5 scale
    drape: number; // 1-5 scale
  };
  appearance: {
    luster: number; // 1-5 scale
    smoothness: number; // 1-5 scale
    uniformity: number; // 1-5 scale
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
    issueType: 'dimensional_issue' | 'hand_feel_issue' | 'appearance_issue' | 'machine_fault' | 'chemical_issue' | 'other';
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

const FinishingSchema = new Schema<IFinishing>({
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
  
  // Finishing Process Details
  finishingType: {
    type: String,
    enum: ['stenter', 'coating', 'calendering', 'compacting', 'sanforizing', 'mercerizing', 'softening'],
    required: true
  },
  machineType: {
    type: String,
    enum: ['stenter_frame', 'coating_machine', 'calendar_machine', 'compactor', 'sanforizer', 'mercerizer'],
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
  speed: {
    planned: { type: Number, required: true },
    actual: { type: Number }
  },
  tension: {
    planned: { type: Number, required: true },
    actual: { type: Number }
  },
  pressure: {
    planned: { type: Number, required: true },
    actual: { type: Number }
  },
  
  // Stenter Specific Parameters
  stenterSettings: {
    overfeed: { type: Number },
    pinning: {
      type: {
        type: String,
        enum: ['pin', 'clip', 'combination']
      },
      spacing: { type: Number }
    },
    dwellTime: { type: Number },
    airFlow: { type: Number }
  },
  
  // Coating Specific Parameters
  coatingSettings: {
    coatingType: {
      type: String,
      enum: ['acrylic', 'polyurethane', 'silicone', 'fluorocarbon', 'wax', 'resin']
    },
    coatingWeight: { type: Number },
    applicationMethod: {
      type: String,
      enum: ['knife', 'roller', 'spray', 'foam']
    },
    curingTemperature: { type: Number },
    curingTime: { type: Number }
  },
  
  // Chemical Usage
  chemicals: [{
    chemicalName: { type: String, required: true },
    chemicalType: {
      type: String,
      enum: ['softener', 'resin', 'catalyst', 'crosslinker', 'defoamer', 'wetting_agent'],
      required: true
    },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    concentration: { type: Number },
    supplier: { type: String },
    batchNumber: { type: String }
  }],
  
  // Quality Parameters
  dimensionalStability: {
    warpShrinkage: { type: Number },
    weftShrinkage: { type: Number },
    skew: { type: Number }
  },
  handFeel: {
    softness: { type: Number, min: 1, max: 5 },
    stiffness: { type: Number, min: 1, max: 5 },
    drape: { type: Number, min: 1, max: 5 }
  },
  appearance: {
    luster: { type: Number, min: 1, max: 5 },
    smoothness: { type: Number, min: 1, max: 5 },
    uniformity: { type: Number, min: 1, max: 5 }
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
      enum: ['dimensional_issue', 'hand_feel_issue', 'appearance_issue', 'machine_fault', 'chemical_issue', 'other'],
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
  collection: 'finishing'
});

// Indexes
FinishingSchema.index({ productionOrderId: 1 });
FinishingSchema.index({ batchNumber: 1 });
FinishingSchema.index({ companyId: 1 });
FinishingSchema.index({ status: 1 });
FinishingSchema.index({ createdAt: -1 });

export default mongoose.model<IFinishing>('Finishing', FinishingSchema);
