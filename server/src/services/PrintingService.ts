import { BaseService } from './BaseService';
import Printing, { IPrinting } from '../models/Printing';

export class PrintingService extends BaseService<IPrinting> {
  constructor() {
    super(Printing);
  }

  // Add any specific methods for Printing here
}
