import { Types } from 'mongoose';
import { BaseService } from './BaseService';
import { Dispatch } from '../models/Dispatch';
import { AppError } from '../utils/errors';

export class EnhancedDispatchService extends BaseService<any> {
  constructor() {
    super(Dispatch as any);
  }

  async createDispatch(dispatchData: any) {
    try {
      const dispatch = new Dispatch(dispatchData);
      await dispatch.save();
      
      const populatedDispatch = await Dispatch.findById(dispatch._id)
        .populate('assignedTo', 'name email')
        .populate('companyId', 'name');
      
      return populatedDispatch;
    } catch (error) {
      throw new AppError('Failed to create dispatch', 500);
    }
  }

  async getDispatches(filters: any = {}, search?: string) {
    try {
      const { user } = filters;
      let query: any = { ...filters };
      
      // Remove user from query as it's not a field
      delete query.user;
      
      // If not superadmin, filter by company
      if (user && !user.isSuperAdmin) {
        query.companyId = user.companyId;
      }
      
      // Add search functionality
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } }
        ];
      }

      const dispatches = await Dispatch.find(query)
        .populate('assignedTo', 'name email')
        .populate('companyId', 'name')
        .sort({ createdAt: -1 });

      return dispatches;
    } catch (error) {
      throw new AppError('Failed to get dispatches', 500);
    }
  }

  async getDispatchById(id: string) {
    try {
      const dispatch = await Dispatch.findById(id)
        .populate('assignedTo', 'name email')
        .populate('companyId', 'name');
      
      return dispatch;
    } catch (error) {
      throw new AppError('Failed to get dispatch', 500);
    }
  }

  async updateDispatch(id: string, updateData: any) {
    try {
      const dispatch = await Dispatch.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true }
      ).populate('assignedTo', 'name email')
       .populate('companyId', 'name');
      
      return dispatch;
    } catch (error) {
      throw new AppError('Failed to update dispatch', 500);
    }
  }

  async deleteDispatch(id: string) {
    try {
      const result = await Dispatch.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      throw new AppError('Failed to delete dispatch', 500);
    }
  }

  async getDispatchesByCompany(companyId: string, options: any = {}) {
    try {
      const { page = 1, limit = 10, status, priority } = options;
      
      const query: any = { companyId };
      
      if (status && status !== 'all') {
        query.status = status;
      }
      
      if (priority && priority !== 'all') {
        query.priority = priority;
      }

      const dispatches = await Dispatch.find(query)
        .populate('assignedTo', 'name email')
        .populate('companyId', 'name')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await Dispatch.countDocuments(query);

      return {
        dispatches,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new AppError('Failed to get dispatches', 500);
    }
  }

  async updateDispatchStatus(dispatchId: string, status: string, updatedBy: string) {
    try {
      const dispatch = await Dispatch.findById(dispatchId);
      if (!dispatch) {
        throw new AppError('Dispatch not found', 404);
      }

      dispatch.status = status as 'pending' | 'in-progress' | 'completed' | 'cancelled';
      dispatch.updatedAt = new Date();
      await dispatch.save();

      return dispatch;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update dispatch status', 500);
    }
  }

  async getDispatchStats(companyId: string, startDate?: Date, endDate?: Date) {
    try {
      const query: any = { companyId };
      
      if (startDate && endDate) {
        query.createdAt = {
          $gte: startDate,
          $lte: endDate
        };
      }

      const dispatches = await Dispatch.find(query);
      
      const stats = {
        total: dispatches.length,
        pending: dispatches.filter(d => d.status === 'pending').length,
        inProgress: dispatches.filter(d => d.status === 'in-progress').length,
        completed: dispatches.filter(d => d.status === 'completed').length,
        cancelled: dispatches.filter(d => d.status === 'cancelled').length,
        low: dispatches.filter(d => d.priority === 'low').length,
        medium: dispatches.filter(d => d.priority === 'medium').length,
        high: dispatches.filter(d => d.priority === 'high').length,
        urgent: dispatches.filter(d => d.priority === 'urgent').length
      };

      return stats;
    } catch (error) {
      throw new AppError('Failed to get dispatch stats', 500);
    }
  }
}
