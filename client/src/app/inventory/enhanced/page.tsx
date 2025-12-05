'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
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
import { selectTheme } from '@/lib/features/ui/uiSlice';
import {
  InventoryHeader,
  InventoryFilters,
  InventoryGrid,
  InventoryList,
  CreateInventoryItemModal,
  InventoryDetailsModal,
  InventoryItemForm
} from '@/components/inventory';
import { MoveToScrapModal } from '@/components/inventory/MoveToScrapModal';
import { GoodsReturnModal } from '@/components/inventory/GoodsReturnModal';

const EnhancedInventoryPage = () => {
  const router = useRouter();
  const theme = useSelector(selectTheme);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isClient, setIsClient] = useState(false);
  const [viewDetails, setViewDetails] = useState<any>(null);
  const [showScrapModal, setShowScrapModal] = useState(false);
  const [selectedItemForScrap, setSelectedItemForScrap] = useState<any>(null);
  const [showGoodsReturnModal, setShowGoodsReturnModal] = useState(false);
  const [selectedItemForReturn, setSelectedItemForReturn] = useState<any>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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
    status: statusFilter || undefined,
    page: currentPage,
    limit: pageSize
  });

  const { data: inventoryStats } = useGetInventoryStatsQuery({});
  const { data: inventoryAlerts } = useGetInventoryAlertsQuery({});

  const [createInventoryItem] = useCreateInventoryItemMutation();
  const [updateInventoryItem] = useUpdateInventoryItemMutation();
  const [deleteInventoryItem] = useDeleteInventoryItemMutation();

  const items = inventoryData?.data?.data || [];
  const stats = inventoryStats?.data;
  const alerts = inventoryAlerts?.data || [];

  // Pagination data
  const pagination = inventoryData?.data?.pagination;
  const totalItems = pagination?.total || 0;
  const totalPages = pagination?.totalPages || 1;
  const hasNextPage = pagination?.hasNext || false;
  const hasPrevPage = pagination?.hasPrev || false;

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, statusFilter]);

  // Debug: Log the alerts data
  console.log('Inventory Alerts Data:', inventoryAlerts);
  console.log('Processed Alerts:', alerts);

  // Ensure items is always an array before filtering
  const safeItems = Array.isArray(items) ? items : [];

  const filteredItems = safeItems.filter((item: any) => {
    const matchesSearch = !searchTerm ||
      (item.itemName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item.itemCode?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item.itemDescription?.toLowerCase() || '').includes(searchTerm.toLowerCase());
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
    if (!selectedItem) {
      console.error('No selected item for update');
      return;
    }

    console.log('Updating item:', selectedItem._id);
    console.log('Update data:', formData);

    try {
      const result = await updateInventoryItem({ itemId: selectedItem._id, itemData: formData }).unwrap();
      console.log('Item updated successfully:', result);
      setSelectedItem(null);
      setShowCreateModal(false);
      refetch();
    } catch (error) {
      console.error('Failed to update inventory item:', error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    console.log('Delete item clicked for ID:', id);
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      try {
        console.log('Attempting to delete item with ID:', id);
        await deleteInventoryItem(id).unwrap();
        console.log('Item deleted successfully');
        refetch();
      } catch (error) {
        console.error('Failed to delete inventory item:', error);
      }
    }
  };

  const handleViewDetails = (item: any) => {
    router.push(`/inventory/enhanced/${item._id}`);
  };

  const handleEditItem = (item: any) => {
    console.log('Edit item clicked:', item);
    setSelectedItem(item);
    setShowCreateModal(true);
  };

  const handleFormClose = () => {
    setShowCreateModal(false);
    setSelectedItem(null);
  };

  const handleFormSubmit = (formData: any) => {
    // InventoryItemForm already sends nested structure, so we need to merge/validate it
    // Ensure category.primary is a string, not an object
    let categoryPrimary = formData.category?.primary;
    if (typeof categoryPrimary === 'object' && categoryPrimary !== null) {
      // If it's an object, extract the primary value
      categoryPrimary = categoryPrimary.primary || categoryPrimary.name || 'raw_material';
    } else if (!categoryPrimary) {
      categoryPrimary = 'raw_material';
    }

    // Ensure unit is present in stock
    const unit = formData.stock?.unit || formData.unit || '';
    if (!unit) {
      alert('Please select a unit');
      return;
    }

    // Build the transformed data structure
    const transformedData = {
      itemName: formData.itemName,
      itemCode: formData.itemCode,
      itemDescription: formData.itemDescription,
      category: {
        primary: categoryPrimary,
        secondary: formData.category?.secondary || '',
        tertiary: formData.category?.tertiary || ''
      },
      warehouseId: formData.warehouseId,
      companyId: formData.companyId,
      specifications: {
        ...formData.specifications,
        // Ensure tare and fold are included if they exist
        tareWeight: formData.specifications?.tareWeight !== undefined ? formData.specifications.tareWeight : undefined,
        fold: formData.specifications?.fold !== undefined ? formData.specifications.fold : undefined,
        grossQuantity: formData.specifications?.grossQuantity !== undefined ? formData.specifications.grossQuantity : undefined,
      },
      stock: {
        unit: unit,
        currentStock: Number(formData.stock?.currentStock || formData.currentStock || 0),
        availableStock: Number(formData.stock?.availableStock || formData.stock?.currentStock || formData.currentStock || 0),
        netQuantity: formData.stock?.netQuantity,
        reorderLevel: Number(formData.stock?.reorderLevel || 0),
        minStockLevel: Number(formData.stock?.minStockLevel || 0),
        maxStockLevel: Number(formData.stock?.maxStockLevel || 0),
        economicOrderQuantity: Number(formData.stock?.economicOrderQuantity || 0),
        valuationMethod: formData.stock?.valuationMethod || 'FIFO',
        averageCost: Number(formData.stock?.averageCost || formData.pricing?.costPrice || 0),
        totalValue: Number(formData.stock?.totalValue || 0)
      },
      pricing: {
        costPrice: Number(formData.pricing?.costPrice || 0),
        sellingPrice: Number(formData.pricing?.sellingPrice || 0),
        mrp: Number(formData.pricing?.mrp || formData.pricing?.sellingPrice || 0),
        currency: formData.pricing?.currency || 'INR'
      },
      locations: formData.locations || []
    };

    console.log('Original form data:', formData);
    console.log('Transformed data:', transformedData);

    if (selectedItem) {
      handleUpdateItem(transformedData);
    } else {
      handleCreateItem(transformedData);
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
      <div
        className={`transition-theme ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
          }`}
      >
        <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-5 lg:px-6 lg:py-6 space-y-4 sm:space-y-6">
          {/* Header */}
          <InventoryHeader
            totalItems={totalItems}
            lowStockCount={lowStockCount}
            onAddItem={() => setShowCreateModal(true)}
            onRefresh={() => refetch()}
            onExport={() => { }}
            onImport={() => { }}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            theme={theme}
          />

          {/* Filters */}
          <div
            className={`rounded-lg border transition-theme ${theme === 'dark'
                ? 'bg-gray-900/60 border-gray-800'
                : 'bg-white border-gray-200 shadow-sm'
              }`}
          >
            <div className="p-3 sm:p-4">
              <InventoryFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                categoryFilter={categoryFilter || 'all'}
                onCategoryFilterChange={setCategoryFilter}
                statusFilter={statusFilter || 'all'}
                onStatusFilterChange={setStatusFilter}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            </div>
          </div>

          {/* Alerts Section - Show on all views */}
          {alerts && alerts.length > 0 && (
            <div
              className={`rounded-lg p-3 sm:p-4 transition-theme ${theme === 'dark'
                  ? 'bg-orange-900/20 border border-orange-800'
                  : 'bg-orange-50 border border-orange-200'
                }`}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
                <h3 className={`text-lg font-semibold flex items-center ${theme === 'dark' ? 'text-orange-200' : 'text-orange-800'
                  }`}>
                  <Activity className="w-5 h-5 mr-2" />
                  Inventory Alerts ({alerts.length})
                </h3>
                <span className={`text-sm ${theme === 'dark' ? 'text-orange-300' : 'text-orange-600'
                  }`}>
                  Review low stock items and plan replenishment
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {alerts.slice(0, 3).map((alert: any, index: number) => (
                  <div key={alert.id || index} className={`p-3 rounded-lg border transition-theme ${theme === 'dark'
                      ? 'bg-gray-800 border-orange-700'
                      : 'bg-white border-orange-300'
                    }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full ${alert.severity === 'critical' ? 'bg-red-500' :
                              alert.severity === 'warning' ? 'bg-orange-500' :
                                'bg-blue-500'
                            }`}></div>
                          <span className={`text-xs font-medium uppercase ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                            {alert.type?.replace('_', ' ')}
                          </span>
                        </div>
                        <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                          }`}>{alert.message}</p>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>Item: {alert.itemCode}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Content */}
          {viewMode === 'grid' ? (
            <InventoryGrid
              items={filteredItems}
              onViewDetails={handleViewDetails}
              onEditItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
              onMoveToScrap={(item) => {
                setSelectedItemForScrap(item);
                setShowScrapModal(true);
              }}
              onGoodsReturn={(item) => {
                setSelectedItemForReturn(item);
                setShowGoodsReturnModal(true);
              }}
              theme={theme}
            />
          ) : (
            <InventoryList
              items={filteredItems}
              onViewDetails={handleViewDetails}
              onEditItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
              onMoveToScrap={(item) => {
                setSelectedItemForScrap(item);
                setShowScrapModal(true);
              }}
              onGoodsReturn={(item) => {
                setSelectedItemForReturn(item);
                setShowGoodsReturnModal(true);
              }}
              theme={theme}
            />
          )}

          {/* Pagination Controls */}
          {totalItems > 0 && (
            <div
              className={`rounded-lg border p-3 sm:p-4 transition-theme ${theme === 'dark'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200 shadow-sm'
                }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} items
                  </span>
                  <select
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    className={`px-3 py-1 border rounded-md text-sm transition-theme ${theme === 'dark'
                        ? 'border-gray-600 bg-gray-700 text-gray-100'
                        : 'border-gray-300 bg-white text-gray-900'
                      }`}
                  >
                    <option value={10}>10 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
                  </select>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!hasPrevPage}
                    className={`px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-theme ${theme === 'dark'
                        ? 'border-gray-600 bg-gray-700 text-gray-100 hover:bg-gray-600'
                        : 'border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
                      }`}
                  >
                    Previous
                  </button>

                  <div className="hidden sm:flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-1 text-sm border rounded-md transition-theme ${currentPage === pageNum
                              ? theme === 'dark'
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-blue-500 text-white border-blue-500'
                              : theme === 'dark'
                                ? 'border-gray-600 bg-gray-700 text-gray-100 hover:bg-gray-600'
                                : 'border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!hasNextPage}
                    className={`px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-theme ${theme === 'dark'
                        ? 'border-gray-600 bg-gray-700 text-gray-100 hover:bg-gray-600'
                        : 'border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
                      }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Create/Edit Modal */}
          {showCreateModal && (
            <div
              className={`fixed inset-0 flex items-center justify-center z-[9999] transition-theme ${theme === 'dark'
                  ? 'bg-gray-900/80 backdrop-blur-sm'
                  : 'bg-gray-900/40 backdrop-blur-sm'
                }`}
            >
              <div
                className={`w-full max-w-4xl mx-3 sm:mx-4 rounded-xl p-4 sm:p-6 max-h-[92vh] overflow-y-auto shadow-2xl transition-theme border ${theme === 'dark'
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-200'
                  }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                    }`}>
                    {selectedItem ? 'Edit Inventory Item' : 'Create New Inventory Item'}
                  </h2>
                  <button
                    onClick={handleFormClose}
                    className={`text-2xl transition-colors ${theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
                      }`}
                  >
                    ✕
                  </button>
                </div>
                {/* Debug banner removed for cleaner UI */}
                <InventoryItemForm
                  key={selectedItem?._id || 'new'}
                  item={selectedItem}
                  onSubmit={handleFormSubmit}
                  onCancel={handleFormClose}
                  theme={theme}
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
              theme={theme}
            />
          )}

          {/* Move to Scrap Modal */}
          <MoveToScrapModal
            isOpen={showScrapModal}
            onClose={() => {
              setShowScrapModal(false);
              setSelectedItemForScrap(null);
            }}
            inventoryItem={selectedItemForScrap}
            onSuccess={() => {
              refetch();
            }}
            theme={theme}
          />

          {/* Goods Return Modal */}
          <GoodsReturnModal
            isOpen={showGoodsReturnModal}
            onClose={() => {
              setShowGoodsReturnModal(false);
              setSelectedItemForReturn(null);
            }}
            inventoryItem={selectedItemForReturn}
            onSuccess={() => {
              refetch();
            }}
            theme={theme}
          />
        </div>
      </div>
    </AppLayout>
  );
}

export default EnhancedInventoryPage;
