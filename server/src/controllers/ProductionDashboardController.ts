import { Request, Response } from 'express';
import { ProductionDashboard } from '../models/ProductionDashboard';
import { ApiResponse } from '../types/api';

export class ProductionDashboardController {
  /**
   * Get production dashboard by company
   */
  async getDashboardByCompany(req: Request, res: Response) {
    try {
      const { companyId } = req.user!;
      
      const dashboard = await ProductionDashboard.findByCompany(companyId);
      
      if (!dashboard) {
        return res.status(404).json({
          success: false,
          message: 'Production dashboard not found for this company'
        });
      }
      
      const response: ApiResponse = {
        success: true,
        message: 'Production dashboard retrieved successfully',
        data: dashboard
      };
      
      res.status(200).json(response);
    } catch (error) {
      console.error('Error getting production dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create new production dashboard
   */
  async createDashboard(req: Request, res: Response) {
    try {
      const { companyId } = req.user!;
      const dashboardData = req.body;
      
      // Check if dashboard already exists for company
      const existingDashboard = await ProductionDashboard.findByCompany(companyId);
      if (existingDashboard) {
        return res.status(400).json({
          success: false,
          message: 'Production dashboard already exists for this company'
        });
      }
      
      const dashboard = new ProductionDashboard({
        ...dashboardData,
        companyId,
        createdBy: req.user!._id
      });
      
      await dashboard.save();
      
      const response: ApiResponse = {
        success: true,
        message: 'Production dashboard created successfully',
        data: dashboard
      };
      
      res.status(201).json(response);
    } catch (error) {
      console.error('Error creating production dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get machine status from dashboard
   */
  async getMachineStatus(req: Request, res: Response) {
    try {
      const { companyId } = req.user!;
      const { machineId } = req.params;
      
      const dashboard = await ProductionDashboard.getMachineStatus(companyId, machineId);
      
      if (!dashboard) {
        return res.status(404).json({
          success: false,
          message: 'Machine status not found'
        });
      }
      
      const response: ApiResponse = {
        success: true,
        message: 'Machine status retrieved successfully',
        data: dashboard
      };
      
      res.status(200).json(response);
    } catch (error) {
      console.error('Error getting machine status:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update machine status in dashboard
   */
  async updateMachineStatus(req: Request, res: Response) {
    try {
      const { companyId } = req.user!;
      const { machineId } = req.params;
      const statusData = req.body;
      
      const dashboard = await ProductionDashboard.findByCompany(companyId);
      
      if (!dashboard) {
        return res.status(404).json({
          success: false,
          message: 'Production dashboard not found'
        });
      }
      
      await dashboard.updateMachineStatus(machineId, statusData);
      
      const response: ApiResponse = {
        success: true,
        message: 'Machine status updated successfully',
        data: dashboard
      };
      
      res.status(200).json(response);
    } catch (error) {
      console.error('Error updating machine status:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get daily production summary
   */
  async getDailySummary(req: Request, res: Response) {
    try {
      const { companyId } = req.user!;
      const { date } = req.query;
      
      const targetDate = date ? new Date(date as string) : new Date();
      const dashboard = await ProductionDashboard.getDailySummary(companyId, targetDate);
      
      const response: ApiResponse = {
        success: true,
        message: 'Daily production summary retrieved successfully',
        data: dashboard?.dailySummary || []
      };
      
      res.status(200).json(response);
    } catch (error) {
      console.error('Error getting daily summary:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Add daily production summary
   */
  async addDailySummary(req: Request, res: Response) {
    try {
      const { companyId } = req.user!;
      const summaryData = req.body;
      
      const dashboard = await ProductionDashboard.findByCompany(companyId);
      
      if (!dashboard) {
        return res.status(404).json({
          success: false,
          message: 'Production dashboard not found'
        });
      }
      
      dashboard.dailySummary.push({
        ...summaryData,
        date: new Date()
      });
      
      await dashboard.save();
      
      const response: ApiResponse = {
        success: true,
        message: 'Daily production summary added successfully',
        data: dashboard
      };
      
      res.status(200).json(response);
    } catch (error) {
      console.error('Error adding daily summary:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get printing status for all machines
   */
  async getPrintingStatus(req: Request, res: Response) {
    try {
      const { companyId } = req.user!;
      
      const dashboard = await ProductionDashboard.findByCompany(companyId);
      
      if (!dashboard) {
        return res.status(404).json({
          success: false,
          message: 'Production dashboard not found'
        });
      }
      
      const response: ApiResponse = {
        success: true,
        message: 'Printing status retrieved successfully',
        data: dashboard.printingStatus
      };
      
      res.status(200).json(response);
    } catch (error) {
      console.error('Error getting printing status:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update printing status for specific machine
   */
  async updatePrintingStatus(req: Request, res: Response) {
    try {
      const { companyId } = req.user!;
      const { machineId } = req.params;
      const statusData = req.body;
      
      const dashboard = await ProductionDashboard.findByCompany(companyId);
      
      if (!dashboard) {
        return res.status(404).json({
          success: false,
          message: 'Production dashboard not found'
        });
      }
      
      const machineIndex = dashboard.printingStatus.findIndex(
        (machine: any) => machine.machineId.toString() === machineId
      );
      
      if (machineIndex !== -1) {
        dashboard.printingStatus[machineIndex] = { 
          ...dashboard.printingStatus[machineIndex], 
          ...statusData, 
          lastUpdated: new Date() 
        };
      } else {
        dashboard.printingStatus.push({ 
          ...statusData, 
          machineId, 
          lastUpdated: new Date() 
        });
      }
      
      await dashboard.save();
      
      const response: ApiResponse = {
        success: true,
        message: 'Printing status updated successfully',
        data: dashboard
      };
      
      res.status(200).json(response);
    } catch (error) {
      console.error('Error updating printing status:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get active alerts
   */
  async getActiveAlerts(req: Request, res: Response) {
    try {
      const { companyId } = req.user!;
      
      const dashboard = await ProductionDashboard.getActiveAlerts(companyId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Active alerts retrieved successfully',
        data: dashboard?.alerts || []
      };
      
      res.status(200).json(response);
    } catch (error) {
      console.error('Error getting active alerts:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Add new alert
   */
  async addAlert(req: Request, res: Response) {
    try {
      const { companyId } = req.user!;
      const alertData = req.body;
      
      const dashboard = await ProductionDashboard.findByCompany(companyId);
      
      if (!dashboard) {
        return res.status(404).json({
          success: false,
          message: 'Production dashboard not found'
        });
      }
      
      await dashboard.addAlert(alertData);
      
      const response: ApiResponse = {
        success: true,
        message: 'Alert added successfully',
        data: dashboard
      };
      
      res.status(200).json(response);
    } catch (error) {
      console.error('Error adding alert:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(req: Request, res: Response) {
    try {
      const { companyId } = req.user!;
      const { alertIndex } = req.params;
      const { userId } = req.body;
      
      const dashboard = await ProductionDashboard.findByCompany(companyId);
      
      if (!dashboard) {
        return res.status(404).json({
          success: false,
          message: 'Production dashboard not found'
        });
      }
      
      await dashboard.acknowledgeAlert(parseInt(alertIndex), userId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Alert acknowledged successfully',
        data: dashboard
      };
      
      res.status(200).json(response);
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Resolve alert
   */
  async resolveAlert(req: Request, res: Response) {
    try {
      const { companyId } = req.user!;
      const { alertIndex } = req.params;
      const { userId, notes } = req.body;
      
      const dashboard = await ProductionDashboard.findByCompany(companyId);
      
      if (!dashboard) {
        return res.status(404).json({
          success: false,
          message: 'Production dashboard not found'
        });
      }
      
      await dashboard.resolveAlert(parseInt(alertIndex), userId, notes);
      
      const response: ApiResponse = {
        success: true,
        message: 'Alert resolved successfully',
        data: dashboard
      };
      
      res.status(200).json(response);
    } catch (error) {
      console.error('Error resolving alert:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(req: Request, res: Response) {
    try {
      const { companyId } = req.user!;
      
      const dashboard = await ProductionDashboard.findByCompany(companyId);
      
      if (!dashboard) {
        return res.status(404).json({
          success: false,
          message: 'Production dashboard not found'
        });
      }
      
      const response: ApiResponse = {
        success: true,
        message: 'Performance metrics retrieved successfully',
        data: dashboard.performanceMetrics
      };
      
      res.status(200).json(response);
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update performance metrics
   */
  async updatePerformanceMetrics(req: Request, res: Response) {
    try {
      const { companyId } = req.user!;
      const metricsData = req.body;
      
      const dashboard = await ProductionDashboard.findByCompany(companyId);
      
      if (!dashboard) {
        return res.status(404).json({
          success: false,
          message: 'Production dashboard not found'
        });
      }
      
      dashboard.performanceMetrics = {
        ...dashboard.performanceMetrics,
        ...metricsData,
        lastUpdated: new Date()
      };
      
      await dashboard.save();
      
      const response: ApiResponse = {
        success: true,
        message: 'Performance metrics updated successfully',
        data: dashboard
      };
      
      res.status(200).json(response);
    } catch (error) {
      console.error('Error updating performance metrics:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get dashboard configuration
   */
  async getDashboardConfig(req: Request, res: Response) {
    try {
      const { companyId } = req.user!;
      
      const dashboard = await ProductionDashboard.findByCompany(companyId);
      
      if (!dashboard) {
        return res.status(404).json({
          success: false,
          message: 'Production dashboard not found'
        });
      }
      
      const response: ApiResponse = {
        success: true,
        message: 'Dashboard configuration retrieved successfully',
        data: dashboard.dashboardConfig
      };
      
      res.status(200).json(response);
    } catch (error) {
      console.error('Error getting dashboard config:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update dashboard configuration
   */
  async updateDashboardConfig(req: Request, res: Response) {
    try {
      const { companyId } = req.user!;
      const configData = req.body;
      
      const dashboard = await ProductionDashboard.findByCompany(companyId);
      
      if (!dashboard) {
        return res.status(404).json({
          success: false,
          message: 'Production dashboard not found'
        });
      }
      
      dashboard.dashboardConfig = {
        ...dashboard.dashboardConfig,
        ...configData
      };
      
      await dashboard.save();
      
      const response: ApiResponse = {
        success: true,
        message: 'Dashboard configuration updated successfully',
        data: dashboard
      };
      
      res.status(200).json(response);
    } catch (error) {
      console.error('Error updating dashboard config:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
