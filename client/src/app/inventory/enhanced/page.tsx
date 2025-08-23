'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/Input';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Warehouse, 
  ShoppingCart, 
  Tag, 
  Calendar,
  Download,
  Upload,
  RefreshCw,
  Settings,
  PieChart,
  Activity
} from 'lucide-react';
import { 
  useGetInventoryItemsQuery, 
  useGetInventoryStatsQuery, 
  useGetInventoryAlertsQuery,
  useCreateInventoryItemMutation,
  useUpdateInventoryItemMutation,
  useDeleteInventoryItemMutation
} from '@/lib/api/inventoryApi';
import { Can } from '@/lib/casl/Can';

const EnhancedInventoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'analytics'>('list');

  // RTK Query hooks
  const { data: inventoryData, isLoading, error, refetch } = useGetInventoryItemsQuery({
    search: searchTerm || undefined,
    category: categoryFilter || undefined,
    status: statusFilter || undefined
  });

  const { data: inventoryStats } = useGetInventoryStatsQuery({});
  const { data: inventoryAlerts } = useGetInventoryAlertsQuery({});

  const [createInventoryItem] = useCreateInventoryItemMutation();
  const [updateInventoryItem] = useUpdateInventoryItemMutation();
  const [deleteInventoryItem] = useDeleteInventoryItemMutation();

  const items = inventoryData?.data || [];
  const stats = inventoryStats?.data;
  const alerts = inventoryAlerts?.data || [];

  const filteredItems = items.filter(item => {
    const matchesSearch = !searchTerm || 
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    const matchesStatus = !statusFilter || item.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCreateItem = async (formData: any) => {
    try {
      await createInventoryItem(formData).unwrap();
      setShowCreateModal(false);
      refetch();
    } catch (error) {
      console.error('Failed to create inventory item:', error);
    }
  };

  const handleUpdateItem = async (id: string, formData: any) => {
    try {
      await updateInventoryItem({ itemId: id, itemData: formData }).unwrap();
      setSelectedItem(null);
      refetch();
    } catch (error) {
      console.error('Failed to update inventory item:', error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      try {
        await deleteInventoryItem(id).unwrap();
        refetch();
      } catch (error) {
        console.error('Failed to delete inventory item:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'low_stock': return 'bg-red-100 text-red-800';
      case 'overstock': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'low_stock': return <TrendingDown className="w-4 h-4" />;
      case 'overstock': return <TrendingUp className="w-4 h-4" />;
      case 'normal': return <BarChart3 className="w-4 h-4" />;
      default: return <BarChart3 className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error loading inventory data</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Enhanced Inventory Management</h1>
        <div className="flex gap-2">
          <Can I="create" a="InventoryItem">
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </Can>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex justify-center">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            List
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Package className="w-4 h-4 mr-2" />
            Grid
          </Button>
          <Button
            variant={viewMode === 'analytics' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('analytics')}
          >
            <PieChart className="w-4 h-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalItems || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Tag className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats?.totalValue || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.lowStockItems || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Movements</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.todayMovements || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select 
                value={categoryFilter} 
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                <option value="raw_material">Raw Material</option>
                <option value="finished_goods">Finished Goods</option>
                <option value="spare_parts">Spare Parts</option>
                <option value="packaging">Packaging</option>
                <option value="consumables">Consumables</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="low_stock">Low Stock</option>
                <option value="overstock">Overstock</option>
                <option value="normal">Normal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-end gap-2">
              <Can I="read" a="InventoryItem">
                <Button variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </Can>
              <Can I="create" a="InventoryItem">
                <Button variant="outline">
                  <Upload className="w-4 h-4" />
                </Button>
              </Can>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              Stock Alerts ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {alerts.slice(0, 3).map((alert) => (
                <div key={alert._id} className="bg-white p-4 rounded-lg border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-red-800">{alert.itemName}</h4>
                      <p className="text-sm text-red-600">{alert.itemCode}</p>
                    </div>
                    <Badge className={alert.urgency === 'critical' ? 'bg-red-600' : 'bg-orange-600'}>
                      {alert.urgency}
                    </Badge>
                  </div>
                  <div className="mt-2 text-sm text-red-700">
                    <p>Current: {alert.currentStock}</p>
                    <p>Required: {alert.minStock}</p>
                    <p>Shortage: {alert.shortage}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Items - List View */}
      {viewMode === 'list' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Inventory Items ({filteredItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-2 text-left font-medium">Item Code</th>
                    <th className="border border-gray-200 px-4 py-2 text-left font-medium">Name</th>
                    <th className="border border-gray-200 px-4 py-2 text-left font-medium">Category</th>
                    <th className="border border-gray-200 px-4 py-2 text-left font-medium">Current Stock</th>
                    <th className="border border-gray-200 px-4 py-2 text-left font-medium">Min/Max Stock</th>
                    <th className="border border-gray-200 px-4 py-2 text-left font-medium">Unit Price</th>
                    <th className="border border-gray-200 px-4 py-2 text-left font-medium">Total Value</th>
                    <th className="border border-gray-200 px-4 py-2 text-left font-medium">Status</th>
                    <th className="border border-gray-200 px-4 py-2 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-4 py-2">
                        <div className="font-mono text-sm">{item.itemCode}</div>
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        <div>
                          <div className="font-medium">{item.itemName}</div>
                          <div className="text-sm text-gray-500">{item.description}</div>
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        <Badge variant="outline">{item.category}</Badge>
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        <div className="text-center">
                          <div className="font-medium">{item.currentStock}</div>
                          <div className="text-sm text-gray-500">{item.unit}</div>
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        <div className="text-sm">
                          <div>Min: {item.minStock}</div>
                          <div>Max: {item.maxStock}</div>
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        <span className="font-medium">{formatCurrency(item.unitPrice)}</span>
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        <span className="font-medium">{formatCurrency(item.totalValue)}</span>
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        <Badge className={getStatusColor(item.status)}>
                          {getStatusIcon(item.status)}
                          <span className="ml-1">{item.status.replace('_', ' ')}</span>
                        </Badge>
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        <div className="flex gap-2">
                          <Can I="read" a="InventoryItem">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedItem(item)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Can>
                          
                          <Can I="update" a="InventoryItem">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedItem(item)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Can>
                          
                          <Can I="delete" a="InventoryItem">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteItem(item._id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </Can>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card key={item._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{item.itemName}</CardTitle>
                    <p className="text-sm text-gray-500">{item.itemCode}</p>
                  </div>
                  <Badge className={getStatusColor(item.status)}>
                    {item.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Category:</span>
                    <span className="text-sm font-medium">{item.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Stock:</span>
                    <span className="text-sm font-medium">
                      {item.currentStock} {item.unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Price:</span>
                    <span className="text-sm font-medium">{formatCurrency(item.unitPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Value:</span>
                    <span className="text-sm font-medium">{formatCurrency(item.totalValue)}</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Can I="read" a="InventoryItem">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setSelectedItem(item)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </Can>
                  <Can I="update" a="InventoryItem">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setSelectedItem(item)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </Can>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Analytics View */}
      {viewMode === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Category Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.categories && Object.entries(stats.categories).map(([category, count]) => (
                  <div key={category} className="flex justify-between items-center">
                    <span className="text-sm font-medium capitalize">{category.replace('_', ' ')}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(count / stats.totalItems) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stock Status Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Normal Stock</span>
                  <Badge className="bg-green-100 text-green-800">
                    {stats?.normalStockItems || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Low Stock</span>
                  <Badge className="bg-red-100 text-red-800">
                    {stats?.lowStockItems || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Overstock</span>
                  <Badge className="bg-orange-100 text-orange-800">
                    {stats?.overstockItems || 0}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Can I="create" a="InventoryItem">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Item Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowCreateModal(true)}
              >
                Add New Item
              </Button>
              <Button variant="outline" className="w-full">
                Bulk Import
              </Button>
              <Button variant="outline" className="w-full">
                Item Templates
              </Button>
            </CardContent>
          </Card>
        </Can>

        <Can I="read" a="InventoryItem">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Stock Operations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full">
                Stock In
              </Button>
              <Button variant="outline" className="w-full">
                Stock Out
              </Button>
              <Button variant="outline" className="w-full">
                Stock Transfer
              </Button>
            </CardContent>
          </Card>
        </Can>

        <Can I="read" a="InventoryItem">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full">
                Stock Report
              </Button>
              <Button variant="outline" className="w-full">
                Movement Report
              </Button>
              <Button variant="outline" className="w-full">
                Valuation Report
              </Button>
            </CardContent>
          </Card>
        </Can>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Add New Inventory Item</h2>
            {/* Form would go here */}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowCreateModal(false)}>
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedInventoryPage;
