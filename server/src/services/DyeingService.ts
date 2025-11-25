import { BaseService } from './BaseService';
import Dyeing, { IDyeing } from '../models/Dyeing';

export class DyeingService extends BaseService<IDyeing> {
  constructor() {
    super(Dyeing);
  }

  // Add any specific methods for Dyeing here
}
