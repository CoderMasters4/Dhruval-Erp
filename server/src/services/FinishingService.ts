import { BaseService } from './BaseService';
import Finishing, { IFinishing } from '../models/Finishing';

export class FinishingService extends BaseService<IFinishing> {
  constructor() {
    super(Finishing);
  }

  // Add any specific methods for Finishing here
}
