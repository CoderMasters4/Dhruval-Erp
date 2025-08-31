'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  RefreshCw, 
  BarChart3,
  Package,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { Can } from '@/lib/casl/Can';

interface InventoryHeaderProps {
  totalItems: number;
  lowStockCount: number;
  onAddItem: () => void;
  onRefresh: () => void;
  onExport: () => void;
  onImport: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const InventoryHeader: React.FC<InventoryHeaderProps> = ({
  totalItems,
  lowStockCount,
  onAddItem,
  onRefresh,
  onExport,
  onImport,
  searchTerm,
  onSearchChange
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
      {/* Main Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Inventory Management</h1>
          <p className="text-blue-100 text-lg">
            Manage your textile inventory with precision and efficiency
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xl font-bold">{totalItems}</div>
            <div className="text-blue-100 text-sm">Total Items</div>
          </div>
          {lowStockCount > 0 && (
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-300">{lowStockCount}</div>
              <div className="text-blue-100 text-sm">Low Stock</div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-200" />
            <div>
              <div className="text-2xl font-bold">{totalItems}</div>
              <div className="text-blue-100 text-sm">Items</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-green-200" />
            <div>
              <div className="text-2xl font-bold">{totalItems - lowStockCount}</div>
              <div className="text-blue-100 text-sm">In Stock</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-yellow-200" />
            <div>
              <div className="text-2xl font-bold">{lowStockCount}</div>
              <div className="text-blue-100 text-sm">Low Stock</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-purple-200" />
            <div>
              <div className="text-2xl font-bold">₹0</div>
              <div className="text-blue-100 text-sm">Total Value</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        {/* Search Bar */}
        <div className="flex-1 w-full lg:max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search items by name, code, or description..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Can I="create" a="InventoryItem">
            <Button
              onClick={() => {
                console.log('Add Item button clicked');
                onAddItem();
                console.log('onAddItem function called');
              }}
              className="bg-white text-blue-600 hover:bg-gray-50 font-semibold px-6 py-3"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Item
            </Button>
          </Can>
          
          <Button
            variant="outline"
            onClick={onRefresh}
            className="border-white/30 text-white hover:bg-white/10"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Refresh
          </Button>
          
          <Button
            variant="outline"
            onClick={onExport}
            className="border-white/30 text-white hover:bg-white/10"
          >
            <Download className="w-5 h-5 mr-2" />
            Export
          </Button>
          
          <Button
            variant="outline"
            onClick={onImport}
            className="border-white/30 text-white hover:bg-white/10"
          >
            <Upload className="w-5 h-5 mr-2" />
            Import
          </Button>
        </div>
      </div>
    </div>
  );
};
