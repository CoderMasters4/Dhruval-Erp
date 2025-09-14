import { BaseService } from './BaseService';
import CuttingPacking, { ICuttingPacking } from '../models/CuttingPacking';

export class CuttingPackingService extends BaseService<ICuttingPacking> {
  constructor() {
    super(CuttingPacking);
  }

  // Add any specific methods for CuttingPacking here
}
