'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { WarehouseSelector } from './WarehouseSelector';
import { useGetWarehouseByIdQuery } from '@/lib/api/warehousesApi';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface InventoryItemFormProps {
  item?: any;
  onSubmit: (formData: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const InventoryItemForm: React.FC<InventoryItemFormProps> = ({
  item,
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const [selectedWarehouse, setSelectedWarehouse] = useState(item?.warehouseId || '');
  const [reorderPoint, setReorderPoint] = useState(item?.reorderPoint || 0);
  const [reorderQuantity, setReorderQuantity] = useState(item?.reorderQuantity || 0);
  const [stockingMethod, setStockingMethod] = useState(item?.stockingMethod || 'fifo');

  // Get warehouse details to extract company ID
  const { data: warehouseData } = useGetWarehouseByIdQuery(selectedWarehouse, {
    skip: !selectedWarehouse
  });

  const warehouse = warehouseData?.data;

  // Handle item changes (for editing)
  useEffect(() => {
    if (item) {
      console.log('Form initialized with item:', item);
      setSelectedWarehouse(item.warehouseId || '');
      setReorderPoint(item.reorderPoint || 0);
      setReorderQuantity(item.reorderQuantity || 0);
      setStockingMethod(item.stockingMethod || 'fifo');
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate warehouse selection
    if (!selectedWarehouse) {
      alert('Please select a warehouse first');
      return;
    }
    
    // Validate company ID is available
    if (!warehouse?.companyId) {
      alert('Company ID not available from selected warehouse. Please try again.');
      return;
    }
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    // Add warehouse selection and company ID
    data.warehouseId = selectedWarehouse;
    data.companyId = warehouse.companyId.toString(); // Auto-get company ID from warehouse
    
    // Add reorder logic
    data.reorderPoint = reorderPoint;
    data.reorderQuantity = reorderQuantity;
    data.stockingMethod = stockingMethod;
    
    console.log('Form data being submitted:', data);
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
          Basic Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Name *
            </label>
            <Input
              name="itemName"
              defaultValue={item?.itemName || ''}
              required
              placeholder="Enter item name"
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Code
            </label>
            <Input
              name="itemCode"
              defaultValue={item?.itemCode || ''}
              placeholder="Auto-generated if empty"
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <Select
              name="category"
              defaultValue={item?.category?.primary || ''}
              onValueChange={(value) => {
                const form = document.querySelector('form') as HTMLFormElement;
                if (form) {
                  const categoryInput = form.querySelector('input[name="category"]') as HTMLInputElement;
                  if (categoryInput) {
                    categoryInput.value = value;
                  }
                }
              }}
            >
              <SelectTrigger className="bg-blue-50 border-blue-200 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                <SelectItem value="raw_material" className="bg-white hover:bg-gray-50">Raw Material</SelectItem>
                <SelectItem value="finished_goods" className="bg-white hover:bg-gray-50">Finished Goods</SelectItem>
                <SelectItem value="consumables" className="bg-white hover:bg-gray-50">Consumables</SelectItem>
                <SelectItem value="spare_parts" className="bg-white hover:bg-gray-50">Spare Parts</SelectItem>
              </SelectContent>
            </Select>
            <input type="hidden" name="category" defaultValue={item?.category?.primary || ''} />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Type
            </label>
            <Input
              name="productType"
              defaultValue={item?.productType || ''}
              placeholder="e.g., cotton, silk, etc."
              className="w-full"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="itemDescription"
            defaultValue={item?.itemDescription || ''}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter item description"
          />
        </div>
      </div>

      {/* Warehouse Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
          Warehouse & Location
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <WarehouseSelector
            selectedWarehouse={selectedWarehouse}
            onWarehouseChange={setSelectedWarehouse}
            onAddWarehouse={() => {
              // Handle add warehouse
              console.log('Add warehouse clicked');
            }}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zone/Location
            </label>
            <Input
              name="zone"
              defaultValue={item?.zone || ''}
              placeholder="e.g., Zone A, Section 1"
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rack Number
            </label>
            <Input
              name="rack"
              defaultValue={item?.rack || ''}
              placeholder="e.g., Rack 1, Shelf 2"
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bin Number
            </label>
            <Input
              name="bin"
              defaultValue={item?.bin || ''}
              placeholder="e.g., Bin A1, Container 3"
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Reorder Logic */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
          Reorder Logic & Stocking Method
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reorder Point *
            </label>
            <Input
              type="number"
              value={reorderPoint}
              onChange={(e) => setReorderPoint(Number(e.target.value))}
              required
              min="0"
              placeholder="Min stock level to trigger reorder"
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">When stock falls below this level, reorder is triggered</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reorder Quantity *
            </label>
            <Input
              type="number"
              value={reorderQuantity}
              onChange={(e) => setReorderQuantity(Number(e.target.value))}
              required
              min="1"
              placeholder="Quantity to reorder"
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">How much to order when reorder point is reached</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stocking Method *
            </label>
            <select
              value={stockingMethod}
              onChange={(e) => setStockingMethod(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="fifo">FIFO (First In, First Out)</option>
              <option value="lifo">LIFO (Last In, First Out)</option>
              <option value="average">Average Cost</option>
              <option value="specific">Specific Identification</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">How inventory costs are calculated</p>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Reorder Logic Explained:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>FIFO:</strong> Oldest items sold first (good for perishable goods)</li>
            <li>• <strong>LIFO:</strong> Newest items sold first (good for non-perishable)</li>
            <li>• <strong>Average:</strong> Cost averaged across all items</li>
            <li>• <strong>Specific:</strong> Track each item individually</li>
          </ul>
        </div>
      </div>

      {/* Specifications */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
          Specifications
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GSM
            </label>
            <Input
              name="gsm"
              type="number"
              defaultValue={item?.specifications?.gsm || ''}
              placeholder="Fabric weight"
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Width (inches)
            </label>
            <Input
              name="width"
              type="number"
              step="0.01"
              defaultValue={item?.specifications?.width || ''}
              placeholder="Fabric width"
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <Input
              name="color"
              defaultValue={item?.specifications?.color || ''}
              placeholder="e.g., Blue, Red"
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Design
            </label>
            <Input
              name="design"
              defaultValue={item?.specifications?.design || ''}
              placeholder="e.g., Geometric, Floral"
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Finish
            </label>
            <select
              name="finish"
              defaultValue={item?.specifications?.finish || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Finish</option>
              <option value="Glossy">Glossy</option>
              <option value="Matte">Matte</option>
              <option value="Textured">Textured</option>
              <option value="Smooth">Smooth</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Length (meters)
            </label>
            <Input
              name="length"
              type="number"
              step="0.01"
              defaultValue={item?.specifications?.length || ''}
              placeholder="Fabric length"
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Stock Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
          Stock Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Stock *
            </label>
            <Input
              name="currentStock"
              type="number"
              defaultValue={item?.stock?.currentStock || ''}
              required
              placeholder="Available quantity"
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unit *
            </label>
            <select
              name="unit"
              defaultValue={item?.stock?.unit || ''}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Unit</option>
              <option value="meters">Meters</option>
              <option value="kg">Kilograms</option>
              <option value="pieces">Pieces</option>
              <option value="boxes">Boxes</option>
              <option value="liters">Liters</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reorder Level
            </label>
            <Input
              name="reorderLevel"
              type="number"
              defaultValue={item?.stock?.reorderLevel || ''}
              placeholder="When to reorder"
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Stock Level
            </label>
            <Input
              name="maxStockLevel"
              type="number"
              defaultValue={item?.stock?.maxStockLevel || ''}
              placeholder="Maximum storage capacity"
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Stock Level
            </label>
            <Input
              name="minStockLevel"
              type="number"
              defaultValue={item?.stock?.minStockLevel || ''}
              placeholder="Minimum stock level"
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valuation Method
            </label>
            <select
              name="valuationMethod"
              defaultValue={item?.stock?.valuationMethod || 'FIFO'}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="FIFO">FIFO (First In, First Out)</option>
              <option value="LIFO">LIFO (Last In, First Out)</option>
              <option value="Weighted Average">Weighted Average</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
          Pricing Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cost Price (₹)
            </label>
            <Input
              name="costPrice"
              type="number"
              step="0.01"
              defaultValue={item?.pricing?.costPrice || ''}
              placeholder="Purchase cost per unit"
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selling Price (₹)
            </label>
            <Input
              name="sellingPrice"
              type="number"
              step="0.01"
              defaultValue={item?.pricing?.sellingPrice || ''}
              placeholder="Sale price per unit"
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              MRP (₹)
            </label>
            <Input
              name="mrp"
              type="number"
              step="0.01"
              defaultValue={item?.pricing?.mrp || ''}
              placeholder="Maximum retail price"
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Quality */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
          Quality Control
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quality Grade
            </label>
            <select
              name="qualityGrade"
              defaultValue={item?.quality?.qualityGrade || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Grade</option>
              <option value="A">A (Premium)</option>
              <option value="B">B (Standard)</option>
              <option value="C">C (Basic)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quality Check Required
            </label>
            <select
              name="qualityCheckRequired"
              defaultValue={item?.quality?.qualityCheckRequired ? 'true' : 'false'}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 justify-end pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="bg-blue-600 hover:bg-blue-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : (item ? 'Update Item' : 'Create Item')}
        </Button>
      </div>
    </form>
  );
};
