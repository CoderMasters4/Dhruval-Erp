import mongoose, { Schema, Document } from 'mongoose';
import { AuditableDocument } from '../types/models';

export interface IGreyFabricInward extends AuditableDocument {
  grnNumber: string;
  purchaseOrderId: mongoose.Types.ObjectId; // Required - GRN must be linked to PO
  purchaseOrderNumber: string; // Required - for easy reference
  // Supplier info will be populated from Purchase Order
  supplierId?: mongoose.Types.ObjectId; // Optional - populated from PO
  supplierName?: string; // Optional - populated from PO
  
  // Inventory Integration
  inventoryItemId?: mongoose.Types.ObjectId;
  inventoryItemCode?: string;
  
  // Fabric Details
  fabricDetails: {
    fabricType: 'cotton' | 'polyester' | 'viscose' | 'blend' | 'other';
    fabricGrade: 'A' | 'B' | 'C' | 'D';
    gsm: number;
    width: number;
    color: string;
    design?: string;
    pattern?: string;
    finish?: string;
  };
  
  // Quantity Information
  quantity: {
    receivedQuantity: number;
    unit: 'meters' | 'yards' | 'pieces';
    acceptedQuantity: number;
    rejectedQuantity: number;
    shortQuantity: number;
    excessQuantity: number;
  };
  
  // Quality Parameters
  qualityParameters: {
    weight: number;
    width: number;
    gsm: number;
    colorFastness: 'excellent' | 'good' | 'fair' | 'poor';
    shrinkage: number;
    pilling: 'none' | 'slight' | 'moderate' | 'severe';
    defects: {
      holes: number;
      stains: number;
      colorVariation: number;
      other: string;
    };
  };
  
  // Physical Condition
  physicalCondition: {
    isDamaged: boolean;
    damageDescription?: string;
    isWet: boolean;
    isContaminated: boolean;
    contaminationType?: string;
    storageCondition: 'good' | 'fair' | 'poor';
  };
  
  // Documentation
  documents: {
    supplierInvoice: string[];
    qualityCertificate: string[];
    testReports: string[];
    photos: string[];
    other: string[];
  };
  
  // Status and Approval
  status: 'pending' | 'approved' | 'rejected' | 'partially_approved';
  inspectionStatus: 'pending' | 'in_progress' | 'completed';
  qualityStatus: 'passed' | 'failed' | 'conditional';
  
  // Location and Storage
  storageLocation: {
    warehouseId: mongoose.Types.ObjectId;
    warehouseName: string;
    rackNumber?: string;
    shelfNumber?: string;
    binNumber?: string;
  };
  
  // Financial Information
  financial: {
    unitPrice: number;
    totalValue: number;
    currency: string;
    gstRate: number;
    gstAmount: number;
    totalAmount: number;
  };
  
  // Inspection Details
  inspection: {
    inspectedBy: mongoose.Types.ObjectId;
    inspectedByName: string;
    inspectionDate: Date;
    inspectionNotes?: string;
    qualityGrade: 'A' | 'B' | 'C' | 'D';
    recommendedAction: 'accept' | 'reject' | 'conditional_accept' | 'return_to_supplier';
  };
  
  // Additional Information
  remarks?: string;
  specialInstructions?: string;
  tags: string[];
  
  // Batch Information
  batchNumber?: string;
  lotNumber?: string;
  manufacturingDate?: Date;
  expiryDate?: Date;
}

const GreyFabricInwardSchema = new Schema<IGreyFabricInward>({
  grnNumber: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  purchaseOrderId: { 
    type: Schema.Types.ObjectId, 
    ref: 'PurchaseOrder',
    required: true,
    index: true
  },
  purchaseOrderNumber: { 
    type: String, 
    required: true,
    index: true
  },
  
  // Supplier info populated from Purchase Order
  supplierId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Supplier' // Optional - populated from PO
  },
  supplierName: { type: String }, // Optional - populated from PO
  
  // Inventory Integration
  inventoryItemId: { 
    type: Schema.Types.ObjectId, 
    ref: 'InventoryItem' 
  },
  inventoryItemCode: { type: String },
  
  // Fabric Details
  fabricDetails: {
    fabricType: { 
      type: String, 
      enum: ['cotton', 'polyester', 'viscose', 'blend', 'other'], 
      required: true 
    },
    fabricGrade: { 
      type: String, 
      enum: ['A', 'B', 'C', 'D'], 
      required: true 
    },
    gsm: { type: Number, required: true, min: 0 },
    width: { type: Number, required: true, min: 0 },
    color: { type: String, required: true },
    design: { type: String },
    pattern: { type: String },
    finish: { type: String }
  },
  
  // Quantity Information
  quantity: {
    receivedQuantity: { type: Number, required: true, min: 0 },
    unit: { 
      type: String, 
      enum: ['meters', 'yards', 'pieces'], 
      required: true 
    },
    acceptedQuantity: { type: Number, default: 0, min: 0 },
    rejectedQuantity: { type: Number, default: 0, min: 0 },
    shortQuantity: { type: Number, default: 0, min: 0 },
    excessQuantity: { type: Number, default: 0, min: 0 }
  },
  
  // Quality Parameters
  qualityParameters: {
    weight: { type: Number, required: true, min: 0 },
    width: { type: Number, required: true, min: 0 },
    gsm: { type: Number, required: true, min: 0 },
    colorFastness: { 
      type: String, 
      enum: ['excellent', 'good', 'fair', 'poor'], 
      required: true 
    },
    shrinkage: { type: Number, required: true, min: 0, max: 100 },
    pilling: { 
      type: String, 
      enum: ['none', 'slight', 'moderate', 'severe'], 
      required: true 
    },
    defects: {
      holes: { type: Number, default: 0, min: 0 },
      stains: { type: Number, default: 0, min: 0 },
      colorVariation: { type: Number, default: 0, min: 0 },
      other: { type: String }
    }
  },
  
  // Physical Condition
  physicalCondition: {
    isDamaged: { type: Boolean, default: false },
    damageDescription: { type: String },
    isWet: { type: Boolean, default: false },
    isContaminated: { type: Boolean, default: false },
    contaminationType: { type: String },
    storageCondition: { 
      type: String, 
      enum: ['good', 'fair', 'poor'], 
      default: 'good' 
    }
  },
  
  // Documentation
  documents: {
    supplierInvoice: [String],
    qualityCertificate: [String],
    testReports: [String],
    photos: [String],
    other: [String]
  },
  
  // Status and Approval
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'partially_approved'], 
    default: 'pending',
    index: true
  },
  inspectionStatus: { 
    type: String, 
    enum: ['pending', 'in_progress', 'completed'], 
    default: 'pending' 
  },
  qualityStatus: { 
    type: String, 
    enum: ['passed', 'failed', 'conditional'], 
    default: 'passed' 
  },
  
  // Location and Storage
  storageLocation: {
    warehouseId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Warehouse', 
      required: true 
    },
    warehouseName: { type: String, required: true },
    rackNumber: { type: String },
    shelfNumber: { type: String },
    binNumber: { type: String }
  },
  
  // Financial Information
  financial: {
    unitPrice: { type: Number, required: true, min: 0 },
    totalValue: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    gstRate: { type: Number, default: 0, min: 0, max: 100 },
    gstAmount: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 }
  },
  
  // Inspection Details
  inspection: {
    inspectedBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    inspectedByName: { type: String, required: true },
    inspectionDate: { type: Date, required: true },
    inspectionNotes: { type: String },
    qualityGrade: { 
      type: String, 
      enum: ['A', 'B', 'C', 'D'], 
      required: true 
    },
    recommendedAction: { 
      type: String, 
      enum: ['accept', 'reject', 'conditional_accept', 'return_to_supplier'], 
      required: true 
    }
  },
  
  // Additional Information
  remarks: { type: String },
  specialInstructions: { type: String },
  tags: [String],
  
  // Batch Information
  batchNumber: { type: String },
  lotNumber: { type: String },
  manufacturingDate: { type: Date },
  expiryDate: { type: Date }
}, {
  timestamps: true,
  collection: 'greyfabricinwards'
});

// Indexes
GreyFabricInwardSchema.index({ grnNumber: 1 });
GreyFabricInwardSchema.index({ supplierId: 1 });
GreyFabricInwardSchema.index({ status: 1 });
GreyFabricInwardSchema.index({ inspectionDate: 1 });
GreyFabricInwardSchema.index({ createdAt: -1 });

export default mongoose.model<IGreyFabricInward>('GreyFabricInward', GreyFabricInwardSchema);
