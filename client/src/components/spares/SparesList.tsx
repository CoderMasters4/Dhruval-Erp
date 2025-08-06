import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  AlertTriangle,
  Package,
  TrendingDown,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ViewToggle, ViewMode } from '@/components/ui/ViewToggle';
import { DataView } from '@/components/ui/DataView';
import { Spare, SpareFilters } from '@/lib/api/sparesApi';

interface SparesListProps {
  spares: Spare[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  isLoading: boolean;
  filters: SpareFilters;
  onFiltersChange: (filters: SpareFilters) => void;
  onCreateSpare: () => void;
  onEditSpare: (spare: Spare) => void;
  onDeleteSpare: (spare: Spare) => void;
  onViewSpare: (spare: Spare) => void;
  onUpdateStock: (spare: Spare) => void;
}

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'mechanical', label: 'Mechanical' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'electronic', label: 'Electronic' },
  { value: 'hydraulic', label: 'Hydraulic' },
  { value: 'pneumatic', label: 'Pneumatic' },
  { value: 'consumable', label: 'Consumable' },
  { value: 'tool', label: 'Tool' },
  { value: 'safety', label: 'Safety' },
  { value: 'other', label: 'Other' }
];

export const SparesList: React.FC<SparesListProps> = ({
  spares,
  total,
  page,
  limit,
  totalPages,
  isLoading,
  filters,
  onFiltersChange,
  onCreateSpare,
  onEditSpare,
  onDeleteSpare,
  onViewSpare,
  onUpdateStock
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value, page: 1 });
  };

  const handleFilterChange = (key: keyof SpareFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    onFiltersChange({ ...filters, page: newPage });
  };

  const getStockStatus = (spare: Spare) => {
    if (spare.stock.currentStock === 0) {
      return { status: 'out-of-stock', label: 'Out of Stock', color: 'text-red-600 bg-red-100' };
    } else if (spare.stock.currentStock <= spare.stock.reorderLevel) {
      return { status: 'low-stock', label: 'Low Stock', color: 'text-yellow-600 bg-yellow-100' };
    } else if (spare.stock.currentStock <= spare.stock.minStockLevel) {
      return { status: 'critical-low', label: 'Critical Low', color: 'text-orange-600 bg-orange-100' };
    }
    return { status: 'normal', label: 'Normal', color: 'text-green-600 bg-green-100' };
  };

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const columns = [
    {
      key: 'spareCode',
      label: 'Spare Code',
      sortable: true,
      render: (spare: Spare) => (
        <div className="font-medium text-gray-900">{spare.spareCode}</div>
      )
    },
    {
      key: 'spareName',
      label: 'Spare Name',
      sortable: true,
      render: (spare: Spare) => (
        <div>
          <div className="font-medium text-gray-900">{spare.spareName}</div>
          <div className="text-sm text-gray-500">{spare.partNumber}</div>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (spare: Spare) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {spare.category}
        </span>
      )
    },
    {
      key: 'manufacturer',
      label: 'Manufacturer',
      sortable: true,
      render: (spare: Spare) => (
        <div>
          <div className="font-medium text-gray-900">{spare.manufacturer}</div>
          {spare.brand && <div className="text-sm text-gray-500">{spare.brand}</div>}
        </div>
      )
    },
    {
      key: 'stock',
      label: 'Stock',
      sortable: true,
      render: (spare: Spare) => {
        const stockStatus = getStockStatus(spare);
        return (
          <div>
            <div className="font-medium text-gray-900">
              {spare.stock.currentStock} {spare.stock.unit}
            </div>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
              {stockStatus.label}
            </span>
          </div>
        );
      }
    },
    {
      key: 'criticality',
      label: 'Criticality',
      sortable: true,
      render: (spare: Spare) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCriticalityColor(spare.maintenance.criticality)}`}>
          {spare.maintenance.criticality.toUpperCase()}
        </span>
      )
    },
    {
      key: 'totalValue',
      label: 'Value',
      sortable: true,
      render: (spare: Spare) => (
        <div className="font-medium text-gray-900">
          ₹{spare.stock.totalValue.toLocaleString()}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (spare: Spare) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onViewSpare(spare)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onUpdateStock(spare)}
            className="text-blue-400 hover:text-blue-600 transition-colors"
            title="Update Stock"
          >
            <Package className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEditSpare(spare)}
            className="text-yellow-400 hover:text-yellow-600 transition-colors"
            title="Edit Spare"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDeleteSpare(spare)}
            className="text-red-400 hover:text-red-600 transition-colors"
            title="Delete Spare"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const cardRender = (spare: Spare) => {
    const stockStatus = getStockStatus(spare);
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{spare.spareName}</h3>
            <p className="text-sm text-gray-500">{spare.spareCode}</p>
          </div>
          <div className="flex items-center space-x-2">
            {spare.status.isCritical && (
              <AlertTriangle className="w-5 h-5 text-red-500" />
            )}
            {spare.stock.currentStock <= spare.stock.reorderLevel && (
              <TrendingDown className="w-5 h-5 text-yellow-500" />
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Category</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {spare.category}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Manufacturer</p>
            <p className="text-sm font-medium text-gray-900">{spare.manufacturer}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Stock</p>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {spare.stock.currentStock} {spare.stock.unit}
              </p>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                {stockStatus.label}
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Criticality</p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCriticalityColor(spare.maintenance.criticality)}`}>
              {spare.maintenance.criticality.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm font-medium text-gray-900">
            Value: ₹{spare.stock.totalValue.toLocaleString()}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onViewSpare(spare)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => onUpdateStock(spare)}
              className="text-blue-400 hover:text-blue-600 transition-colors"
              title="Update Stock"
            >
              <Package className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEditSpare(spare)}
              className="text-yellow-400 hover:text-yellow-600 transition-colors"
              title="Edit Spare"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDeleteSpare(spare)}
              className="text-red-400 hover:text-red-600 transition-colors"
              title="Delete Spare"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Spares Management</h1>
          <p className="text-gray-600">Manage your spare parts inventory</p>
        </div>
        <Button onClick={onCreateSpare} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Spare</span>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search spares..."
                value={filters.search || ''}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </Button>
          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Manufacturer
              </label>
              <Input
                type="text"
                placeholder="Filter by manufacturer"
                value={filters.manufacturer || ''}
                onChange={(e) => handleFilterChange('manufacturer', e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.isLowStock || false}
                  onChange={(e) => handleFilterChange('isLowStock', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Low Stock</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.isCritical || false}
                  onChange={(e) => handleFilterChange('isCritical', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Critical</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Data View */}
      {isLoading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      ) : spares.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No spares found</h3>
          <p className="text-gray-500 mb-4">Get started by creating your first spare part.</p>
          <Button onClick={onCreateSpare}>Add Spare</Button>
        </div>
      ) : (
        <>
          <DataView
            data={spares}
            columns={columns}
            viewMode={viewMode}
            renderGridCard={cardRender}
            loading={isLoading}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} results
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-700">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
