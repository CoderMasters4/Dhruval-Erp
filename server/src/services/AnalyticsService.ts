import CustomerOrder from '../models/CustomerOrder';
import InventoryItem from '../models/InventoryItem';
import ProductionOrder from '../models/ProductionOrder';
import FinancialTransaction from '../models/FinancialTransaction';
import Employee from '../models/Employee';
import Customer from '../models/Customer';
import Supplier from '../models/Supplier';
import Visitor from '../models/Visitor';
import Company from '../models/Company';

export interface AnalyticsParams {
  companyId: string;
  timeRange?: string;
  startDate?: Date;
  endDate?: Date;
  date?: Date;
  year?: number;
  month?: number;
  departments?: string[];
  metrics?: string[];
  includeDetails?: boolean;
}

export class AnalyticsService {
  async getAnalyticsDashboard(params: AnalyticsParams) {
    const { companyId, timeRange = '30d' } = params;
    
    const endDate = new Date();
    const startDate = this.calculateStartDate(timeRange);
    
    const [orders, inventory, production, financial, employees, customers, suppliers, visitors] = await Promise.all([
      this.getOrdersData(companyId, startDate, endDate),
      this.getInventoryData(companyId),
      this.getProductionData(companyId, startDate, endDate),
      this.getFinancialData(companyId, startDate, endDate),
      this.getEmployeeData(companyId),
      this.getCustomerData(companyId),
      this.getSupplierData(companyId),
      this.getVisitorData(companyId, startDate, endDate)
    ]);

    return {
      kpiData: this.calculateKPIs({ orders, inventory, production, financial, employees, customers, suppliers, visitors }),
      revenueData: this.generateRevenueData(orders, financial, timeRange),
      departmentData: this.generateDepartmentData(employees, production, financial),
      resourceData: this.generateResourceData(employees, production, inventory),
      inventoryDistribution: this.generateInventoryDistribution(inventory)
    };
  }

  async getKPIData(params: AnalyticsParams) {
    const { companyId, timeRange = '30d' } = params;
    
    const endDate = new Date();
    const startDate = this.calculateStartDate(timeRange);
    
    const [orders, production, financial, inventory] = await Promise.all([
      this.getOrdersData(companyId, startDate, endDate),
      this.getProductionData(companyId, startDate, endDate),
      this.getFinancialData(companyId, startDate, endDate),
      this.getInventoryData(companyId)
    ]);

    return this.calculateKPIs({ orders, production, financial, inventory });
  }

  async getDailyReports(params: AnalyticsParams) {
    const { companyId, date } = params;
    
    const reportDate = date || new Date();
    const startDate = new Date(reportDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(reportDate);
    endDate.setHours(23, 59, 59, 999);

    const [orders, production, visitors] = await Promise.all([
      this.getOrdersData(companyId, startDate, endDate),
      this.getProductionData(companyId, startDate, endDate),
      this.getVisitorData(companyId, startDate, endDate)
    ]);

    return {
      date: reportDate,
      summary: {
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, order) => sum + (order.orderSummary?.totalAmount || 0), 0),
        productionOrders: production.length,
        visitors: visitors.length
      }
    };
  }

  async getWeeklyReports(params: AnalyticsParams) {
    const { companyId } = params;
    
    const startDate = this.getWeekStart();
    const endDate = this.getWeekEnd(startDate);

    const [orders, production, visitors] = await Promise.all([
      this.getOrdersData(companyId, startDate, endDate),
      this.getProductionData(companyId, startDate, endDate),
      this.getVisitorData(companyId, startDate, endDate)
    ]);

    return {
      weekStart: startDate,
      weekEnd: endDate,
      summary: {
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, order) => sum + (order.orderSummary?.totalAmount || 0), 0),
        productionOrders: production.length,
        visitors: visitors.length
      }
    };
  }

  async getMonthlyReports(params: AnalyticsParams) {
    const { companyId, year, month } = params;
    
    const reportYear = year || new Date().getFullYear();
    const reportMonth = month || new Date().getMonth() + 1;
    
    const startDate = new Date(reportYear, reportMonth - 1, 1);
    const endDate = new Date(reportYear, reportMonth, 0, 23, 59, 59, 999);

    const [orders, production, visitors] = await Promise.all([
      this.getOrdersData(companyId, startDate, endDate),
      this.getProductionData(companyId, startDate, endDate),
      this.getVisitorData(companyId, startDate, endDate)
    ]);

    return {
      year: reportYear,
      month: reportMonth,
      summary: {
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, order) => sum + (order.orderSummary?.totalAmount || 0), 0),
        productionOrders: production.length,
        visitors: visitors.length
      }
    };
  }

  async getCustomReports(params: AnalyticsParams) {
    const { companyId, startDate, endDate } = params;

    if (!startDate || !endDate) {
      throw new Error('Start date and end date are required');
    }

    const orders = await CustomerOrder.find({
      companyId,
      createdAt: { $gte: startDate, $lte: endDate }
    }).lean();

    return {
      data: orders,
      total: orders.length
    };
  }

  async getRealTimeAnalytics(params: AnalyticsParams) {
    const { companyId } = params;
    
    const now = new Date();
    const since = new Date(now.getTime() - (30 * 60 * 1000));

    const [orders, production, visitors] = await Promise.all([
      this.getOrdersData(companyId, since, now),
      this.getProductionData(companyId, since, now),
      this.getVisitorData(companyId, since, now)
    ]);

    return {
      timestamp: now,
      metrics: {
        orders: orders.length,
        production: production.length,
        visitors: visitors.length
      }
    };
  }

  async getFilterOptions(companyId: string) {
    const [departments, products, statuses] = await Promise.all([
      this.getDepartments(companyId),
      this.getProducts(companyId),
      this.getStatuses(companyId)
    ]);

    return {
      departments,
      products,
      statuses,
      metrics: this.getAvailableMetrics()
    };
  }

  async getReportTemplates(companyId: string) {
    return [
      {
        id: 'daily-summary',
        name: 'Daily Summary',
        description: 'Daily business summary report',
        type: 'daily'
      },
      {
        id: 'weekly-performance',
        name: 'Weekly Performance',
        description: 'Weekly performance metrics',
        type: 'weekly'
      },
      {
        id: 'monthly-review',
        name: 'Monthly Review',
        description: 'Monthly business review',
        type: 'monthly'
      }
    ];
  }

  async saveReportTemplate(templateData: any) {
    return {
      id: `template-${Date.now()}`,
      ...templateData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // Private helper methods
  private calculateStartDate(timeRange: string): Date {
    const now = new Date();
    switch (timeRange) {
      case '7d':
        return new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
      case '30d':
        return new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      case '90d':
        return new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
      case '1y':
        return new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000));
      default:
        return new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    }
  }

  private getWeekStart(): Date {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    return new Date(now.setDate(diff));
  }

  private getWeekEnd(weekStart: Date): Date {
    const endDate = new Date(weekStart);
    endDate.setDate(weekStart.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
    return endDate;
  }

  private calculateKPIs(data: any) {
    const { orders, inventory, production, financial, employees, customers, suppliers, visitors } = data;

    return {
      totalOrders: orders?.length || 0,
      totalRevenue: orders?.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0) || 0,
      productionOrders: production?.length || 0,
      completedProduction: production?.filter((p: any) => p.status === 'completed').length || 0,
      totalInventory: inventory?.length || 0,
      totalEmployees: employees?.length || 0,
      totalCustomers: customers?.length || 0,
      totalSuppliers: suppliers?.length || 0,
      totalVisitors: visitors?.length || 0
    };
  }

  private generateRevenueData(orders: any[], financial: any[], timeRange: string) {
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    return {
      total: totalRevenue,
      breakdown: this.groupDataByTime(orders, timeRange)
    };
  }

  private generateDepartmentData(employees: any[], production: any[], financial: any[]) {
    const departmentMap = new Map();
    
    employees.forEach(emp => {
      const dept = emp.department || 'Unknown';
      if (!departmentMap.has(dept)) {
        departmentMap.set(dept, { count: 0, production: 0, revenue: 0 });
      }
      const deptData = departmentMap.get(dept);
      deptData.count += 1;
    });

    return Array.from(departmentMap.entries()).map(([dept, data]) => ({
      department: dept,
      ...data
    }));
  }

  private generateResourceData(employees: any[], production: any[], inventory: any[]) {
    return {
      totalEmployees: employees.length,
      activeProduction: production.filter(p => p.status === 'in_progress').length,
      totalInventory: inventory.length
    };
  }

  private generateInventoryDistribution(inventory: any[]) {
    const categoryMap = new Map();
    
    inventory.forEach(item => {
      const category = item.category || 'Unknown';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, 0);
      }
      const currentValue = categoryMap.get(category);
      categoryMap.set(category, currentValue + item.quantity * (item.unitPrice || 0));
    });

    const totalValue = Array.from(categoryMap.values()).reduce((sum, value) => sum + value, 0);
    
    return Array.from(categoryMap.entries()).map(([category, value]: [string, number]) => ({
      category,
      value,
      percentage: Math.round((value / totalValue) * 100)
    }));
  }

  private groupDataByTime(orders: any[], timeRange: string) {
    const timeData = new Map();
    
    orders.forEach(order => {
      const timeKey = this.getTimeKey(new Date(order.createdAt), timeRange);
      if (!timeData.has(timeKey)) {
        timeData.set(timeKey, { orders: 0, revenue: 0 });
      }
      const current = timeData.get(timeKey);
      current.orders += 1;
      current.revenue += order.totalAmount || 0;
    });

    return Array.from(timeData.entries()).map(([time, data]) => ({
      time,
      ...data
    }));
  }

  private getTimeKey(date: Date, timeRange: string): string {
    switch (timeRange) {
      case '7d':
        return date.toISOString().split('T')[0];
      case '30d':
        return date.toISOString().split('T')[0];
      case '90d':
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      case '1y':
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      default:
        return date.toISOString().split('T')[0];
    }
  }

  private async getDepartments(companyId: string) {
    const employees = await Employee.find({ companyId }).distinct('department');
    return employees.filter(dept => dept).map(dept => ({ value: dept, label: dept }));
  }

  private async getProducts(companyId: string) {
    const products = await InventoryItem.find({ companyId }).distinct('name');
    return products.map(product => ({ value: product, label: product }));
  }

  private async getStatuses(companyId: string) {
    const [orderStatuses, productionStatuses] = await Promise.all([
      CustomerOrder.distinct('status'),
      ProductionOrder.distinct('status')
    ]);

    const allStatuses = [...new Set([...orderStatuses, ...productionStatuses])];
    return allStatuses.map(status => ({ value: status, label: status }));
  }

  private getAvailableMetrics() {
    return [
      { value: 'revenue', label: 'Revenue' },
      { value: 'orders', label: 'Orders' },
      { value: 'production', label: 'Production' },
      { value: 'inventory', label: 'Inventory' },
      { value: 'employees', label: 'Employees' },
      { value: 'customers', label: 'Customers' },
      { value: 'all', label: 'All Metrics' }
    ];
  }

  // Data fetching methods
  private async getOrdersData(companyId: string, startDate: Date, endDate: Date) {
    return await CustomerOrder.find({
      companyId,
      createdAt: { $gte: startDate, $lte: endDate }
    }).lean();
  }

  private async getInventoryData(companyId: string) {
    return await InventoryItem.find({ companyId }).lean();
  }

  private async getProductionData(companyId: string, startDate: Date, endDate: Date) {
    return await ProductionOrder.find({
      companyId,
      createdAt: { $gte: startDate, $lte: endDate }
    }).lean();
  }

  private async getFinancialData(companyId: string, startDate: Date, endDate: Date) {
    return await FinancialTransaction.find({
      companyId,
      createdAt: { $gte: startDate, $lte: endDate }
    }).lean();
  }

  private async getEmployeeData(companyId: string) {
    return await Employee.find({ companyId }).lean();
  }

  private async getCustomerData(companyId: string) {
    return await Customer.find({ companyId }).lean();
  }

  private async getSupplierData(companyId: string) {
    return await Supplier.find({ companyId }).lean();
  }

  private async getVisitorData(companyId: string, startDate: Date, endDate: Date) {
    return await Visitor.find({
      companyId,
      createdAt: { $gte: startDate, $lte: endDate }
    }).lean();
  }

  async exportReport(params: any) {
    // Mock export functionality
    return {
      success: true,
      message: 'Report exported successfully',
      downloadUrl: `/api/analytics/export/${Date.now()}.pdf`
    };
  }
}
