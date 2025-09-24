'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Package,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Can } from '@/lib/casl/Can';

interface InventoryListProps {
  items: any[];
  onViewDetails: (item: any) => void;
  onEditItem: (item: any) => void;
  onDeleteItem: (id: string) => void;
  theme: 'light' | 'dark';
}

export function InventoryList({ items, onViewDetails, onEditItem, onDeleteItem, theme }: InventoryListProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getStockStatus = (item: any) => {
    const currentStock = item.stock?.currentStock || 0;
    const reorderLevel = item.stock?.reorderLevel || 0;
    
    if (currentStock === 0) return 'out_of_stock';
    if (currentStock <= reorderLevel) return 'low_stock';
    if (currentStock > reorderLevel * 2) return 'overstocked';
    return 'normal_stock';
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'out_of_stock':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'low_stock':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'overstocked':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getStockStatusIcon = (status: string) => {
    switch (status) {
      case 'out_of_stock':
        return <TrendingDown className="w-4 h-4" />;
      case 'low_stock':
        return <TrendingDown className="w-4 h-4" />;
      case 'overstocked':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className={`w-16 h-16 mx-auto mb-4 ${
          theme === 'dark' ? 'text-gray-600' : 'text-gray-300'
        }`} />
        <h3 className={`text-lg font-medium mb-2 ${
          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
        }`}>No inventory items found</h3>
        <p className={`${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>Get started by adding your first inventory item.</p>
      </div>
    );
  }

  return (
    <div className={`rounded-lg shadow overflow-hidden transition-theme ${
      theme === 'dark' ? 'bg-gray-800' : 'bg-white'
    }`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className={`${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Item
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Category
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Stock
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Status
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Value
              </th>
              <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            {items.map((item) => {
              const stockStatus = getStockStatus(item);
              
              return (
                <tr key={item._id} className={`transition-colors ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                      }`}>
                        {item.itemName}
                      </div>
                      <div className={`text-sm font-mono ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {item.itemCode}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm capitalize ${
                      theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                    }`}>
                      {item.category?.primary || 'N/A'}
                    </div>
                    <div className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {item.productType || 'N/A'}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${
                      theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                    }`}>
                      {item.stock?.currentStock || 0} {item.stock?.unit || 'units'}
                    </div>
                    <div className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Reorder: {item.stock?.reorderLevel || 0}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={`${getStockStatusColor(stockStatus)} flex items-center gap-1`}>
                      {getStockStatusIcon(stockStatus)}
                      {stockStatus.replace('_', ' ')}
                    </Badge>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${
                      theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                    }`}>
                      {formatCurrency(item.stock?.totalValue || 0)}
                    </div>
                    <div className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {formatCurrency(item.pricing?.costPrice || 0)} per unit
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Can I="read" a="InventoryItem">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewDetails(item)}
                          className={`transition-colors ${
                            theme === 'dark' 
                              ? 'text-gray-400 hover:text-gray-200' 
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Can>
                      
                      <Can I="update" a="InventoryItem">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditItem(item)}
                          className={`transition-colors ${
                            theme === 'dark' 
                              ? 'text-blue-400 hover:text-blue-300' 
                              : 'text-blue-600 hover:text-blue-900'
                          }`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Can>
                      
                      <Can I="delete" a="InventoryItem">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteItem(item._id)}
                          className={`transition-colors ${
                            theme === 'dark' 
                              ? 'text-red-400 hover:text-red-300' 
                              : 'text-red-600 hover:text-red-900'
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </Can>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

