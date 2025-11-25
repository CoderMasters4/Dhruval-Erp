import mongoose, { Schema, Document } from 'mongoose';

export interface ICuttingPacking extends Document {
  productionOrderId: mongoose.Types.ObjectId;
  batchNumber: string;
  stageNumber: number;
  
  // Cutting Process Details
  cuttingType: 'manual' | 'automatic' | 'laser' | 'water_jet' | 'die_cutting';
  cuttingMethod: 'straight' | 'pattern' | 'contour' | 'layered';
  machineType: 'straight_knife' | 'round_knife' | 'band_knife' | 'laser_cutter' | 'water_jet' | 'die_cutter';
  machineId?: string;
  
  // Packing Details
  packingType: 'carton' | 'poly_bag' | 'shrink_wrap' | 'vacuum_pack' | 'roll_pack';
  packingMethod: 'manual' | 'semi_automatic' | 'automatic';
  
  // Cutting Parameters
  cuttingSettings: {
    bladeType: 'straight' | 'serrated' | 'wave' | 'pinking';
    bladeAngle: number; // in degrees
    cuttingSpeed: number; // in m/min
    pressure: number; // in bar
    layers: number; // number of fabric layers
  };
  
  // Pattern Details
  pattern: {
    patternName: string;
    patternFile: string;
    markerEfficiency: number; // percentage
    fabricUtilization: number; // percentage
    piecesPerMarker: number;
  };
  
  // Packing Specifications
  packingSpecs: {
    cartonSize: {
      length: number;
      width: number;
      height: number;
      unit: 'cm' | 'inch';
    };
    piecesPerCarton: number;
    cartonWeight: number; // in kg
    totalCartons: number;
    labels: Array<{
      labelType: 'size' | 'color' | 'style' | 'barcode' | 'qr_code' | 'custom';
      content: string;
      position: string;
    }>;
  };
  
  // Quality Parameters
  cuttingAccuracy: {
    tolerance: number; // in mm
    actualDeviation: number; // in mm
    status: 'good' | 'acceptable' | 'poor';
  };
  packingQuality: {
    neatness: number; // 1-5 scale
    security: number; // 1-5 scale
    labeling: number; // 1-5 scale
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
  inputQuantity: number; // fabric length in meters
  outputQuantity: number; // number of pieces
  wasteQuantity: number; // fabric waste in meters
  efficiency: number; // percentage
  
  // Piece Details
  pieces: Array<{
    pieceNumber: string;
    size: string;
    color: string;
    quantity: number;
    quality: 'A' | 'B' | 'C' | 'D';
    defects?: Array<{
      type: string;
      description: string;
      severity: 'minor' | 'major' | 'critical';
    }>;
  }>;
  
  // Issues and Rework
  issues: Array<{
    issueType: 'cutting_issue' | 'packing_issue' | 'labeling_issue' | 'machine_fault' | 'material_issue' | 'other';
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
    laborCost: number;
    machineCost: number;
    materialCost: number;
    packingCost: number;
    totalCost: number;
  };
  
  // Inventory Tracking
  inventoryUpdate: {
    fabricConsumed: number; // in meters
    packingMaterialUsed: {
      cartons: number;
      polyBags: number;
      labels: number;
      other: Array<{
        material: string;
        quantity: number;
        unit: string;
      }>;
    };
  };
  
  // Documentation
  processImages: string[];
  qualityCertificates: string[];
  packingList: string[];
  
  // Metadata
  companyId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CuttingPackingSchema = new Schema<ICuttingPacking>({
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
  
  // Cutting Process Details
  cuttingType: {
    type: String,
    enum: ['manual', 'automatic', 'laser', 'water_jet', 'die_cutting'],
    required: true
  },
  cuttingMethod: {
    type: String,
    enum: ['straight', 'pattern', 'contour', 'layered'],
    required: true
  },
  machineType: {
    type: String,
    enum: ['straight_knife', 'round_knife', 'band_knife', 'laser_cutter', 'water_jet', 'die_cutter'],
    required: true
  },
  machineId: { type: String },
  
  // Packing Details
  packingType: {
    type: String,
    enum: ['carton', 'poly_bag', 'shrink_wrap', 'vacuum_pack', 'roll_pack'],
    required: true
  },
  packingMethod: {
    type: String,
    enum: ['manual', 'semi_automatic', 'automatic'],
    required: true
  },
  
  // Cutting Parameters
  cuttingSettings: {
    bladeType: {
      type: String,
      enum: ['straight', 'serrated', 'wave', 'pinking']
    },
    bladeAngle: { type: Number },
    cuttingSpeed: { type: Number },
    pressure: { type: Number },
    layers: { type: Number }
  },
  
  // Pattern Details
  pattern: {
    patternName: { type: String, required: true },
    patternFile: { type: String, required: true },
    markerEfficiency: { type: Number, min: 0, max: 100 },
    fabricUtilization: { type: Number, min: 0, max: 100 },
    piecesPerMarker: { type: Number, required: true }
  },
  
  // Packing Specifications
  packingSpecs: {
    cartonSize: {
      length: { type: Number, required: true },
      width: { type: Number, required: true },
      height: { type: Number, required: true },
      unit: { 
        type: String, 
        enum: ['cm', 'inch'], 
        default: 'cm' 
      }
    },
    piecesPerCarton: { type: Number, required: true },
    cartonWeight: { type: Number },
    totalCartons: { type: Number, required: true },
    labels: [{
      labelType: {
        type: String,
        enum: ['size', 'color', 'style', 'barcode', 'qr_code', 'custom']
      },
      content: { type: String, required: true },
      position: { type: String, required: true }
    }]
  },
  
  // Quality Parameters
  cuttingAccuracy: {
    tolerance: { type: Number },
    actualDeviation: { type: Number },
    status: {
      type: String,
      enum: ['good', 'acceptable', 'poor']
    }
  },
  packingQuality: {
    neatness: { type: Number, min: 1, max: 5 },
    security: { type: Number, min: 1, max: 5 },
    labeling: { type: Number, min: 1, max: 5 }
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
  
  // Piece Details
  pieces: [{
    pieceNumber: { type: String, required: true },
    size: { type: String, required: true },
    color: { type: String, required: true },
    quantity: { type: Number, required: true },
    quality: {
      type: String,
      enum: ['A', 'B', 'C', 'D']
    },
    defects: [{
      type: { type: String, required: true },
      description: { type: String, required: true },
      severity: {
        type: String,
        enum: ['minor', 'major', 'critical']
      }
    }]
  }],
  
  // Issues and Rework
  issues: [{
    issueType: {
      type: String,
      enum: ['cutting_issue', 'packing_issue', 'labeling_issue', 'machine_fault', 'material_issue', 'other'],
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
    laborCost: { type: Number, default: 0 },
    machineCost: { type: Number, default: 0 },
    materialCost: { type: Number, default: 0 },
    packingCost: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 }
  },
  
  // Inventory Tracking
  inventoryUpdate: {
    fabricConsumed: { type: Number, default: 0 },
    packingMaterialUsed: {
      cartons: { type: Number, default: 0 },
      polyBags: { type: Number, default: 0 },
      labels: { type: Number, default: 0 },
      other: [{
        material: { type: String, required: true },
        quantity: { type: Number, required: true },
        unit: { type: String, required: true }
      }]
    }
  },
  
  // Documentation
  processImages: [{ type: String }],
  qualityCertificates: [{ type: String }],
  packingList: [{ type: String }],
  
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
  collection: 'cutting_packing'
});

// Indexes
CuttingPackingSchema.index({ productionOrderId: 1 });
CuttingPackingSchema.index({ batchNumber: 1 });
CuttingPackingSchema.index({ companyId: 1 });
CuttingPackingSchema.index({ status: 1 });
CuttingPackingSchema.index({ createdAt: -1 });

export default mongoose.model<ICuttingPacking>('CuttingPacking', CuttingPackingSchema);
