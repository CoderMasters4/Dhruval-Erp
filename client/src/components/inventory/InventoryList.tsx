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
}

export function InventoryList({ items, onViewDetails, onEditItem, onDeleteItem }: InventoryListProps) {
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
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory items found</h3>
        <p className="text-gray-600">Get started by adding your first inventory item.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => {
              const stockStatus = getStockStatus(item);
              
              return (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.itemName}
                      </div>
                      <div className="text-sm text-gray-500 font-mono">
                        {item.itemCode}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 capitalize">
                      {item.category?.primary || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {item.productType || 'N/A'}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.stock?.currentStock || 0} {item.stock?.unit || 'units'}
                    </div>
                    <div className="text-sm text-gray-500">
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
                    <div className="text-sm text-gray-900">
                      {formatCurrency(item.stock?.totalValue || 0)}
                    </div>
                    <div className="text-sm text-gray-500">
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
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Can>
                      
                      <Can I="update" a="InventoryItem">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditItem(item)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Can>
                      
                      <Can I="delete" a="InventoryItem">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteItem(item._id)}
                          className="text-red-600 hover:text-red-900"
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
