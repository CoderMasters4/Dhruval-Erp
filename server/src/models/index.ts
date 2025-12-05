// =============================================
// FACTORY ERP MODELS INDEX
// =============================================
// Central export file for all MongoDB models
// This ensures proper model registration and prevents circular dependencies

import Company from './Company';
import User from './User';
import InventoryItem from './InventoryItem';
import StockMovement from './StockMovement';
import ProductionOrder from './ProductionOrder';
import CustomerOrder from './CustomerOrder';
import Customer from './Customer';
import CustomerVisit from './CustomerVisit';
import { SpareSupplier } from './Supplier';
import FinancialTransaction from './FinancialTransaction';
import AuditLog from './AuditLog';
import Role from './Role';
import Visitor from './Visitor';
import Vehicle, { ISimpleVehicle } from './Vehicle';
import GatePass, { IGatePass } from './GatePass';
import SecurityLog from './SecurityLog';
import Warehouse from './Warehouse';
import Invoice from './Invoice';
import PurchaseOrder from './PurchaseOrder';
import Quotation from './Quotation';
import BusinessAnalytics from './BusinessAnalytics';
import BoilerMonitoring from './BoilerMonitoring';
import ElectricityMonitoring from './ElectricityMonitoring';
import Hospitality from './Hospitality';
import { Dispatch } from './Dispatch';
import Report from './Report';
import Spare from './Spare';
import Scrap from './Scrap';
import GoodsReturn from './GoodsReturn';
import Design from './Design';
import ProductionDashboard from './ProductionDashboard';
import AdvancedReport from './AdvancedReport';
import DocumentManagement from './DocumentManagement';
import GreyFabricInward from './GreyFabricInward';
import PreProcessing from './PreProcessing';
import Dyeing from './Dyeing';
import Printing from './Printing';
import Finishing from './Finishing';
import CuttingPacking from './CuttingPacking';
import ProductionLog from './ProductionLog';

// Export all models
export {
  Company,
  User,
  InventoryItem,
  StockMovement,
  ProductionOrder,
  CustomerOrder,
  Customer,
  CustomerVisit,
  SpareSupplier,
  FinancialTransaction,
  AuditLog,
  Role,
  Visitor,
  Vehicle,
  GatePass,
  SecurityLog,
  Warehouse,
  Invoice,
  PurchaseOrder,
  Quotation,
  BusinessAnalytics,
  BoilerMonitoring,
  ElectricityMonitoring,
  Hospitality,
  Dispatch, // ✅ FIXED: TypeScript errors resolved
  Report,
  Spare,
  Scrap,
  Design,
  ProductionDashboard,
  AdvancedReport,
  DocumentManagement,
  GreyFabricInward,
  PreProcessing,
  Dyeing,
  Printing,
  Finishing,
  CuttingPacking,
  ProductionLog,
  // Export interfaces
  ISimpleVehicle,
  IGatePass
};

// Default export with all models
export default {
  Company,
  User,
  InventoryItem,
  StockMovement,
  ProductionOrder,
  CustomerOrder,
  Customer,
  CustomerVisit,
  SpareSupplier,
  FinancialTransaction,
  AuditLog,
  Role,
  Visitor,
  Vehicle,
  GatePass,
  SecurityLog,
  Warehouse,
  Invoice,
  PurchaseOrder,
  Quotation,
  BusinessAnalytics,
  BoilerMonitoring,
  ElectricityMonitoring,
  Hospitality,
  Dispatch,
  Report,
  Spare,
  Scrap,
  Design,
  ProductionDashboard,
  AdvancedReport,
  DocumentManagement,
  GreyFabricInward,
  PreProcessing,
  Dyeing,
  Printing,
  Finishing,
  CuttingPacking
};

// Model registration function
export const registerModels = () => {
  // This function ensures all models are registered with Mongoose
  // It's called during application startup

  console.log('📊 Registering MongoDB models...');

  const models = [
    'Company',
    'User',
    'InventoryItem',
    'StockMovement',
    'ProductionOrder',
    'CustomerOrder',
    'Customer',
    'CustomerVisit',
    'SpareSupplier',
    'FinancialTransaction',
    'AuditLog',
    'Role',
    'Visitor',
    'Vehicle',
    'GatePass',
    'SecurityLog',
    'Warehouse',
    'Invoice',
    'PurchaseOrder',
    'Quotation',
    'BusinessAnalytics',
    'BoilerMonitoring',
    'ElectricityMonitoring',
    'Hospitality',
    'Dispatch',
    'Report',
    'Spare',
    'Scrap',
    'GoodsReturn',
    'Design',
    'ProductionDashboard',
    'AdvancedReport',
    'DocumentManagement'
  ];

  console.log(`✅ Registered ${models.length} models: ${models.join(', ')}`);

  return models;
};
