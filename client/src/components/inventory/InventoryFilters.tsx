'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Filter, X } from 'lucide-react';

interface InventoryFiltersProps {
  categoryFilter: string;
  statusFilter: string;
  onCategoryChange: (category: string) => void;
  onStatusChange: (status: string) => void;
  onClearFilters: () => void;
  theme: 'light' | 'dark';
}

export const InventoryFilters: React.FC<InventoryFiltersProps> = ({
  categoryFilter,
  statusFilter,
  onCategoryChange,
  onStatusChange,
  onClearFilters,
  theme
}) => {
  const categories = [
    { value: 'raw_material', label: 'Raw Material', color: 'bg-blue-100 text-blue-800' },
    { value: 'finished_goods', label: 'Finished Goods', color: 'bg-green-100 text-green-800' },
    { value: 'consumables', label: 'Consumables', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'spare_parts', label: 'Spare Parts', color: 'bg-purple-100 text-purple-800' }
  ];

  const statuses = [
    { value: 'low_stock', label: 'Low Stock', color: 'bg-red-100 text-red-800' },
    { value: 'normal', label: 'Normal', color: 'bg-green-100 text-green-800' },
    { value: 'overstock', label: 'Overstock', color: 'bg-orange-100 text-orange-800' }
  ];

  const hasActiveFilters = categoryFilter || statusFilter;

  return (
    <div className={`rounded-xl border p-4 shadow-sm transition-theme ${
      theme === 'dark' 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-800">Filters</h3>
        </div>
        
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="text-gray-600 hover:text-gray-800"
          >
            <X className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => onCategoryChange(categoryFilter === category.value ? '' : category.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  categoryFilter === category.value
                    ? category.color + ' ring-2 ring-offset-2 ring-blue-500'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stock Status
          </label>
          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => (
              <button
                key={status.value}
                onClick={() => onStatusChange(statusFilter === status.value ? '' : status.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  statusFilter === status.value
                    ? status.color + ' ring-2 ring-offset-2 ring-blue-500'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="pt-3 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {categoryFilter && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Category: {categories.find(c => c.value === categoryFilter)?.label}
                  <button
                    onClick={() => onCategoryChange('')}
                    className="ml-2 hover:text-blue-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {statusFilter && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Status: {statuses.find(s => s.value === statusFilter)?.label}
                  <button
                    onClick={() => onStatusChange('')}
                    className="ml-2 hover:text-green-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
