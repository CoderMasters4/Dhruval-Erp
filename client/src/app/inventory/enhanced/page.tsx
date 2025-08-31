'use client';

import React, { useState, useEffect } from 'react';
import { 
  useGetInventoryItemsQuery, 
  useGetInventoryStatsQuery, 
  useGetInventoryAlertsQuery,
  useCreateInventoryItemMutation,
  useUpdateInventoryItemMutation,
  useDeleteInventoryItemMutation
} from '@/lib/api/inventoryApi';
import { AppLayout } from '@/components/layout/AppLayout';
import { Activity } from 'lucide-react';
import { 
  InventoryHeader,
  InventoryFilters,
  InventoryItemForm,
  InventoryAnalytics,
  InventoryGrid,
  InventoryList,
  InventoryDetailsModal
} from '@/components/inventory';

const EnhancedInventoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'analytics'>('list');
  const [isClient, setIsClient] = useState(false);
  const [viewDetails, setViewDetails] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Debug modal state
  useEffect(() => {
    console.log('Modal state changed:', { showCreateModal, selectedItem });
  }, [showCreateModal, selectedItem]);

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

  const items = inventoryData?.data?.data || [];
  const stats = inventoryStats?.data;
  const alerts = inventoryAlerts?.data || [];

  // Debug: Log the alerts data
  console.log('Inventory Alerts Data:', inventoryAlerts);
  console.log('Processed Alerts:', alerts);

  // Ensure items is always an array before filtering
  const safeItems = Array.isArray(items) ? items : [];
  
  const filteredItems = safeItems.filter((item: any) => {
    const matchesSearch = !searchTerm || 
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.itemDescription || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || item.category?.primary === categoryFilter;
    const matchesStatus = !statusFilter || getStockStatus(item) === statusFilter;
    
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

  const handleUpdateItem = async (formData: any) => {
    if (!selectedItem) return;
    
    try {
      await updateInventoryItem({ itemId: selectedItem._id, itemData: formData }).unwrap();
      setSelectedItem(null);
      setShowCreateModal(false);
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

  const handleViewDetails = (item: any) => {
    setViewDetails(item);
  };

  const handleEditItem = (item: any) => {
    setSelectedItem(item);
    setShowCreateModal(true);
  };

  const handleFormClose = () => {
    setShowCreateModal(false);
    setSelectedItem(null);
  };

  const handleFormSubmit = (formData: any) => {
    if (selectedItem) {
      handleUpdateItem(formData);
    } else {
      handleCreateItem(formData);
    }
  };

  // Helper function for stock status
  const getStockStatus = (item: any) => {
    const currentStock = item.stock?.currentStock || 0;
    const reorderLevel = item.stock?.reorderLevel || 0;
    
    if (currentStock === 0) return 'out_of_stock';
    if (currentStock <= reorderLevel) return 'low_stock';
    if (currentStock > reorderLevel * 2) return 'overstocked';
    return 'normal_stock';
  };

  // Calculate low stock count for header
  const lowStockCount = safeItems.filter((item: any) => getStockStatus(item) === 'low_stock').length;

  if (!isClient) {
    return null;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
      <InventoryHeader
        totalItems={safeItems.length}
          lowStockCount={lowStockCount}
        onAddItem={() => setShowCreateModal(true)}
        onRefresh={() => refetch()}
        onExport={() => console.log('Export clicked')}
        onImport={() => console.log('Import clicked')}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

        {/* Filters */}
          <InventoryFilters
            categoryFilter={categoryFilter}
            statusFilter={statusFilter}
            onCategoryChange={setCategoryFilter}
            onStatusChange={setStatusFilter}
            onClearFilters={() => {
              setCategoryFilter('');
              setStatusFilter('');
            }}
          />

          {/* Alerts Section - Show on all views */}
          {alerts && alerts.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-orange-800 flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Inventory Alerts ({alerts.length})
                </h3>
                <span className="text-sm text-orange-600">
                  {viewMode === 'analytics' ? 'Viewing in Analytics' : 'Switch to Analytics for detailed view'}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {alerts.slice(0, 3).map((alert: any, index: number) => (
                  <div key={alert.id || index} className="bg-white p-3 rounded-lg border border-orange-300">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full ${
                            alert.severity === 'critical' ? 'bg-red-500' : 
                            alert.severity === 'warning' ? 'bg-orange-500' : 
                            'bg-blue-500'
                          }`}></div>
                          <span className="text-xs font-medium text-gray-600 uppercase">
                            {alert.type?.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1">{alert.message}</p>
                        <p className="text-xs text-gray-500">Item: {alert.itemCode}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
                    )}

          {/* View Mode Toggle */}
        <div className="flex justify-center">
            <div className="flex bg-gray-100 rounded-lg p-1">
            <button
                onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              List View
            </button>
            <button
                onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Grid View
            </button>
            <button
                onClick={() => setViewMode('analytics')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'analytics' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              >
                Analytics
            </button>
          </div>
        </div>

        {/* Main Content */}
        {viewMode === 'analytics' ? (
          <InventoryAnalytics stats={stats} alerts={alerts} />
        ) : viewMode === 'grid' ? (
          <InventoryGrid
            items={filteredItems}
            onViewDetails={handleViewDetails}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
          />
        ) : (
          <InventoryList
            items={filteredItems}
            onViewDetails={handleViewDetails}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
          />
        )}

              {/* Create/Edit Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-lg p-6 max-w-4xl mx-4 max-h-[90vh] overflow-y-auto border-4 border-red-500">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedItem ? 'Edit Inventory Item' : 'Create New Inventory Item'}
                </h2>
                <button
                  onClick={handleFormClose}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>
              <div className="bg-yellow-100 p-4 mb-4 rounded">
                <p className="text-yellow-800">Modal is open! showCreateModal: {showCreateModal.toString()}</p>
              </div>
              <InventoryItemForm
                item={selectedItem}
                onSubmit={handleFormSubmit}
                onCancel={handleFormClose}
              />
            </div>
          </div>
        )}

      {/* View Details Modal */}
      {viewDetails && (
          <InventoryDetailsModal
            item={viewDetails}
            onClose={() => setViewDetails(null)}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
          />
      )}
      </div>
    </AppLayout>
  );
};

export default EnhancedInventoryPage;
