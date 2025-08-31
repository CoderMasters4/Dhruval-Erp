'use client';

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { 
  Warehouse as WarehouseIcon, 
  Building2, 
  MapPin, 
  ChevronDown,
  Check,
  Plus,
  Loader2
} from 'lucide-react';
import { selectCurrentUser, selectIsSuperAdmin } from '@/lib/features/auth/authSlice';
import { Can } from '@/lib/casl/Can';
import { useGetWarehousesQuery, type Warehouse } from '@/lib/api/warehousesApi';

interface WarehouseSelectorProps {
  selectedWarehouse: string;
  onWarehouseChange: (warehouseId: string) => void;
  onAddWarehouse?: () => void;
}

export const WarehouseSelector: React.FC<WarehouseSelectorProps> = ({
  selectedWarehouse,
  onWarehouseChange,
  onAddWarehouse
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const user = useSelector(selectCurrentUser);
  const isSuperAdmin = useSelector(selectIsSuperAdmin);

  // Use RTK Query to fetch warehouses
  const { data: warehousesResponse, isLoading, error, refetch } = useGetWarehousesQuery({});

  const allWarehouses = warehousesResponse?.data || [];
  const pagination = warehousesResponse?.pagination;
  
  // Filter warehouses based on user access
  const warehouses = isSuperAdmin 
    ? allWarehouses 
    : allWarehouses.filter(w => w.companyId === user?.companyId);
    
  const selectedWarehouseData = warehouses.find((w: Warehouse) => w._id === selectedWarehouse);

  const handleWarehouseSelect = (warehouseId: string) => {
    onWarehouseChange(warehouseId);
    setIsOpen(false);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading warehouses...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-center py-4">
          <div className="text-red-600 mb-2">⚠️ Error loading warehouses</div>
          <div className="text-sm text-gray-600 mb-3">
            Failed to fetch warehouses
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium text-gray-700">
          Warehouse *
        </label>
        <Can I="create" a="Warehouse">
          {onAddWarehouse && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAddWarehouse}
              className="text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          )}
        </Can>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <div className="flex items-center gap-3">
            <WarehouseIcon className="w-5 h-5 text-gray-500" />
            <div className="text-left">
              <div className="font-medium text-gray-900">
                {selectedWarehouseData?.warehouseName || 'Select Warehouse'}
              </div>
              {selectedWarehouseData && (
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {selectedWarehouseData.address.city}, {selectedWarehouseData.address.state}
                </div>
              )}
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
            <div className="p-2">
              {warehouses.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  {isSuperAdmin ? 'No warehouses found' : 'No warehouses available for your company'}
                </div>
              ) : (
                warehouses.map((warehouse: Warehouse) => (
                  <div key={warehouse._id}>
                    <button
                      onClick={() => handleWarehouseSelect(warehouse._id)}
                      className={`w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors ${
                        selectedWarehouse === warehouse._id ? 'bg-blue-50 border border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <WarehouseIcon className="w-5 h-5 text-gray-500" />
                          <div>
                            <div className="font-medium text-gray-900">{warehouse.warehouseName}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {warehouse.address.city}, {warehouse.address.state}
                            </div>
                            <div className="text-xs text-gray-400">
                              Capacity: {warehouse.currentUtilization.currentWeight}/{warehouse.capacity.maxWeight} kg
                            </div>
                            {isSuperAdmin && warehouse.companyId !== user?.companyId && (
                              <Badge variant="outline" className="mt-1 text-xs">
                                Company ID: {warehouse.companyId}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {selectedWarehouse === warehouse._id && (
                          <Check className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Company Access Info */}
      {!isSuperAdmin && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <Building2 className="w-4 h-4" />
            <span>
              You can only access warehouses from your company: <strong>Company ID: {user?.companyId || 'Unknown'}</strong>
            </span>
          </div>
        </div>
      )}

      {isSuperAdmin && (
        <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 text-sm text-purple-800">
            <Building2 className="w-4 h-4" />
            <span>
              <strong>Super Admin:</strong> You can access warehouses from all companies
            </span>
          </div>
        </div>
      )}

      {/* Warehouse Count Info */}
      {pagination && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-700">
            <div className="font-medium mb-1">Warehouse Information:</div>
            <div className="text-xs text-gray-600">
              Showing {allWarehouses.length} of {pagination.total} warehouses
              {pagination.pages > 1 && ` (Page ${pagination.page} of ${pagination.pages})`}
            </div>
          </div>
        </div>
      )}

      {/* Warehouse Details (if selected) */}
      {selectedWarehouseData && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-700">
            <div className="font-medium mb-2">Selected Warehouse Details:</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="font-medium">Address:</span> {selectedWarehouseData.address.addressLine1}</div>
              <div><span className="font-medium">Contact:</span> {selectedWarehouseData.contactInfo.primaryPhone}</div>
              <div><span className="font-medium">Phone:</span> {selectedWarehouseData.contactInfo.primaryPhone}</div>
              <div><span className="font-medium">Email:</span> {selectedWarehouseData.contactInfo.email || 'N/A'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
