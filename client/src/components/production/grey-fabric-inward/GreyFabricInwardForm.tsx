'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  useCreateGreyFabricInwardMutation,
  useUpdateGreyFabricInwardMutation,
  GreyFabricInward,
  CreateGreyFabricInwardRequest
} from '@/lib/api/greyFabricInwardApi';
import { useGetAllCompaniesQuery } from '@/lib/features/companies/companiesApi';
import { useGetPurchaseOrdersQuery } from '@/lib/api/purchaseOrdersApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsSuperAdmin } from '@/lib/features/auth/authSlice';
import { X, Save, Package, AlertCircle } from 'lucide-react';

interface GreyFabricInwardFormProps {
  grn?: GreyFabricInward | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function GreyFabricInwardForm({ grn, onClose, onSuccess }: GreyFabricInwardFormProps) {
  // User and company info
  const user = useSelector(selectCurrentUser);
  const isSuperAdmin = useSelector(selectIsSuperAdmin);
  const userCompanyId = (user as any)?.companyAccess?.[0]?.companyId;

  const [formData, setFormData] = useState<CreateGreyFabricInwardRequest>({
    purchaseOrderId: '',
    companyId: userCompanyId || '',
    fabricType: 'cotton',
    fabricColor: '',
    fabricWeight: 0,
    fabricWidth: 0,
    quantity: 0,
    unit: 'meters',
    quality: 'A',
    expectedAt: '',
    remarks: '',
    images: [],
    costBreakdown: {
      fabricCost: 0,
      transportationCost: 0,
      inspectionCost: 0
    }
  });

  const [selectedCompanyId, setSelectedCompanyId] = useState(userCompanyId || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedPO, setSelectedPO] = useState<any>(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);

  // RTK Query hooks
  const [createGrn, { isLoading: isCreating }] = useCreateGreyFabricInwardMutation();
  const [updateGrn, { isLoading: isUpdating }] = useUpdateGreyFabricInwardMutation();
  const { data: companiesData } = useGetAllCompaniesQuery(undefined, {
    skip: !isSuperAdmin
  });
  const { data: purchaseOrders, isLoading: ordersLoading, error: ordersError } = useGetPurchaseOrdersQuery({
    companyId: selectedCompanyId,
    page: 1,
    limit: 100
  }, {
    skip: !selectedCompanyId
  });

  const isEdit = !!grn;
  const isLoading = isCreating || isUpdating;
  const isFormDisabled = !purchaseOrders?.data?.length || !!ordersError || 
                        formData.purchaseOrderId === 'loading' || formData.purchaseOrderId === 'error' || formData.purchaseOrderId === 'no-data';

  useEffect(() => {
    if (grn) {
      setFormData({
        purchaseOrderId: grn.purchaseOrderId || '',
        companyId: grn.companyId || userCompanyId || '',
        fabricType: (grn.fabricType as 'cotton' | 'polyester' | 'viscose' | 'blend' | 'other') || 'cotton',
        fabricColor: grn.fabricColor,
        fabricWeight: grn.fabricWeight,
        fabricWidth: grn.fabricWidth,
        quantity: typeof grn.quantity === 'number' ? grn.quantity : grn.quantity.receivedQuantity,
        unit: grn.unit,
        quality: grn.quality,
        expectedAt: grn.expectedAt || '',
        remarks: grn.remarks || '',
        images: grn.images || [],
        costBreakdown: {
          fabricCost: grn.costBreakdown?.fabricCost || 0,
          transportationCost: grn.costBreakdown?.transportationCost || 0,
          inspectionCost: grn.costBreakdown?.inspectionCost || 0
        }
      });
    }
  }, [grn, userCompanyId]);

  // Auto-populate form when PO is selected
  useEffect(() => {
    if (formData.purchaseOrderId && purchaseOrders?.data) {
      const selectedOrder = purchaseOrders.data.find(po => po._id === formData.purchaseOrderId);
      if (selectedOrder) {
        setSelectedPO(selectedOrder);
        
        // Auto-populate form data from selected PO
        if (selectedOrder.items && selectedOrder.items.length > 0) {
          const selectedItem = selectedOrder.items[selectedItemIndex] || selectedOrder.items[0];
          
          // Map item name to valid fabric type enum
          const mapToFabricType = (itemName: string): 'cotton' | 'polyester' | 'viscose' | 'blend' | 'other' => {
            const name = itemName.toLowerCase();
            if (name.includes('cotton')) return 'cotton';
            if (name.includes('polyester')) return 'polyester';
            if (name.includes('viscose')) return 'viscose';
            if (name.includes('blend')) return 'blend';
            return 'other';
          };
          
          setFormData(prev => ({
            ...prev,
            fabricType: mapToFabricType(selectedItem.itemName || ''),
            fabricColor: selectedItem.itemName || prev.fabricColor,
            fabricWeight: selectedItem.specifications ? parseFloat(selectedItem.specifications) || prev.fabricWeight : prev.fabricWeight,
            fabricWidth: selectedItem.quantity || prev.fabricWidth,
            quantity: selectedItem.quantity || prev.quantity,
            unit: prev.unit, // Keep existing unit
            costBreakdown: {
              ...prev.costBreakdown,
              fabricCost: selectedItem.unitPrice || prev.costBreakdown.fabricCost
            }
          }));
        }
        
        // Auto-populate supplier info if available
        if (selectedOrder.supplier) {
          setFormData(prev => ({
            ...prev,
            remarks: `Supplier: ${selectedOrder.supplier?.supplierName || 'N/A'}\nPO Number: ${(selectedOrder as any).poNumber || 'N/A'}\nExpected Delivery: ${selectedOrder.expectedDeliveryDate ? new Date(selectedOrder.expectedDeliveryDate).toLocaleDateString() : 'N/A'}`
          }));
        }
      }
    }
  }, [formData.purchaseOrderId, purchaseOrders?.data]);

  // Re-populate form when selected item index changes
  useEffect(() => {
    if (selectedPO && selectedPO.items && selectedPO.items.length > 0) {
      const selectedItem = selectedPO.items[selectedItemIndex] || selectedPO.items[0];
      
      // Map item name to valid fabric type enum
      const mapToFabricType = (itemName: string): 'cotton' | 'polyester' | 'viscose' | 'blend' | 'other' => {
        const name = itemName.toLowerCase();
        if (name.includes('cotton')) return 'cotton';
        if (name.includes('polyester')) return 'polyester';
        if (name.includes('viscose')) return 'viscose';
        if (name.includes('blend')) return 'blend';
        return 'other';
      };
      
      setFormData(prev => ({
        ...prev,
        fabricType: mapToFabricType(selectedItem.itemName || ''),
        fabricColor: selectedItem.itemName || prev.fabricColor,
        fabricWeight: selectedItem.specifications ? parseFloat(selectedItem.specifications) || prev.fabricWeight : prev.fabricWeight,
        fabricWidth: selectedItem.quantity || prev.fabricWidth,
        quantity: selectedItem.quantity || prev.quantity,
        unit: prev.unit, // Keep existing unit
        costBreakdown: {
          ...prev.costBreakdown,
          fabricCost: selectedItem.unitPrice || prev.costBreakdown.fabricCost
        }
      }));
    }
  }, [selectedItemIndex, selectedPO]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.purchaseOrderId || formData.purchaseOrderId === 'loading' || formData.purchaseOrderId === 'error' || formData.purchaseOrderId === 'no-data') {
      newErrors.purchaseOrderId = 'Purchase Order is required';
    }
    if (!formData.companyId) {
      newErrors.companyId = 'Company is required';
    }
    if (!formData.fabricType) newErrors.fabricType = 'Fabric Type is required';
    if (!formData.fabricColor) newErrors.fabricColor = 'Fabric Color is required';
    if (formData.fabricWeight <= 0) newErrors.fabricWeight = 'Fabric Weight must be greater than 0';
    if (formData.fabricWidth <= 0) newErrors.fabricWidth = 'Fabric Width must be greater than 0';
    if (formData.quantity <= 0) newErrors.quantity = 'Quantity must be greater than 0';
    if (!formData.unit) newErrors.unit = 'Unit is required';
    if (!formData.quality) newErrors.quality = 'Quality is required';
    if ((formData.costBreakdown?.fabricCost || 0) < 0) newErrors.fabricCost = 'Fabric Cost cannot be negative';
    if ((formData.costBreakdown?.transportationCost || 0) < 0) newErrors.transportationCost = 'Transportation Cost cannot be negative';
    if ((formData.costBreakdown?.inspectionCost || 0) < 0) newErrors.inspectionCost = 'Inspection Cost cannot be negative';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Check if required data is available
    if (!purchaseOrders?.data || purchaseOrders.data.length === 0) {
      alert('No purchase orders available. Please create a purchase order first.');
      return;
    }

    // Check if valid IDs are selected (not special values)
    if (formData.purchaseOrderId === 'loading' || formData.purchaseOrderId === 'error' || formData.purchaseOrderId === 'no-data') {
      alert('Please select a valid purchase order.');
      return;
    }

    // Use actual form data
    console.log('Using form data:', formData);

    try {
      // Debug: Log the data being sent
      console.log('Form data being sent:', formData);
      
      if (isEdit && grn) {
        await updateGrn({
          id: grn._id,
          data: formData
        }).unwrap();
      } else {
        // Use actual form data
        await createGrn(formData).unwrap();
      }
      onSuccess();
    } catch (error: any) {
      console.error('Error saving GRN:', error);
      
      // Better error handling
      let errorMessage = 'Error saving GRN. Please try again.';
      
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.status === 401) {
        errorMessage = 'Authentication required. Please login again.';
      } else if (error?.status === 403) {
        errorMessage = 'You do not have permission to create GRN entries.';
      } else if (error?.status === 400) {
        errorMessage = 'Invalid data provided. Please check your inputs.';
      } else if (error?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      alert(errorMessage);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleCostChange = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      costBreakdown: {
        fabricCost: prev.costBreakdown?.fabricCost || 0,
        transportationCost: prev.costBreakdown?.transportationCost || 0,
        inspectionCost: prev.costBreakdown?.inspectionCost || 0,
        [field]: value
      }
    }));
  };

  const totalCost = (formData.costBreakdown?.fabricCost || 0) + 
                   (formData.costBreakdown?.transportationCost || 0) + 
                   (formData.costBreakdown?.inspectionCost || 0);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto border-0 shadow-2xl">
        <DialogHeader className="pb-6">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
              <Package className="h-5 w-5" />
            </div>
            {isEdit ? 'Edit GRN Entry' : 'Create New GRN Entry'}
          </DialogTitle>
          <p className="text-gray-600 mt-2">
            {isEdit ? 'Update your GRN entry details' : 'Fill in the details to create a new GRN entry'}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Help Message */}
          {(ordersError || !purchaseOrders?.data?.length) && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Setup Required</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      To create a GRN entry, you need:
                    </p>
                    <ul className="text-sm text-yellow-700 mt-2 list-disc list-inside space-y-1">
                      <li>At least one Purchase Order</li>
                    </ul>
                    <p className="text-sm text-yellow-700 mt-2">
                      Please create a purchase order first or contact your administrator.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Basic Information */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">1</div>
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Company Selection - Only for Super Admin */}
                {isSuperAdmin && (
                  <div>
                    <Label htmlFor="companyId">Company *</Label>
                    <Select
                      value={selectedCompanyId}
                      onValueChange={(value) => {
                        setSelectedCompanyId(value);
                        setFormData(prev => ({ ...prev, companyId: value, purchaseOrderId: '' }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Company" />
                      </SelectTrigger>
                      <SelectContent>
                        {companiesData?.data?.map((company) => (
                          <SelectItem key={company._id} value={company._id}>
                            {company.companyName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.companyId && (
                      <p className="text-sm text-red-600 mt-1">{errors.companyId}</p>
                    )}
                  </div>
                )}

                <div>
                  <Label htmlFor="purchaseOrderId">Purchase Order *</Label>
                  <Select
                    value={formData.purchaseOrderId}
                    onValueChange={(value) => handleInputChange('purchaseOrderId', value)}
                    disabled={ordersLoading || !selectedCompanyId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={ordersLoading ? "Loading..." : !selectedCompanyId ? "Select Company First" : "Select Purchase Order"} />
                    </SelectTrigger>
                    <SelectContent>
                      {ordersLoading ? (
                        <SelectItem value="loading" disabled>Loading purchase orders...</SelectItem>
                      ) : ordersError ? (
                        <SelectItem value="error" disabled>Error loading orders</SelectItem>
                      ) : purchaseOrders?.data && purchaseOrders.data.length > 0 ? (
                        purchaseOrders.data.map((order: any) => (
                          <SelectItem key={order._id} value={order._id}>
                            {order.poNumber} - {order.supplier?.supplierName || 'Unknown Supplier'}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-data" disabled>No purchase orders found</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.purchaseOrderId && (
                    <p className="text-sm text-red-600 mt-1">{errors.purchaseOrderId}</p>
                  )}
                  {ordersError && (
                    <p className="text-sm text-yellow-600 mt-1">Unable to load purchase orders. Please refresh the page.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected PO Information */}
          {selectedPO && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Selected Purchase Order Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">PO Number</Label>
                    <p className="text-sm">{selectedPO.poNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Supplier</Label>
                    <p className="text-sm">{selectedPO.supplier?.supplierName || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Expected Delivery</Label>
                    <p className="text-sm">{new Date(selectedPO.expectedDeliveryDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Total Items</Label>
                    <p className="text-sm">{selectedPO.items?.length || 0}</p>
                  </div>
                </div>
                
                {/* PO Items Preview */}
                {selectedPO.items && selectedPO.items.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium text-gray-600">Select Item to Auto-populate</Label>
                      {selectedPO.items.length > 1 && (
                        <Select
                          value={selectedItemIndex.toString()}
                          onValueChange={(value) => {
                            setSelectedItemIndex(parseInt(value));
                          }}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedPO.items.map((item: any, index: number) => (
                              <SelectItem key={index} value={index.toString()}>
                                {item.itemName} (Qty: {item.quantity} {item.unit})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Item:</span> {selectedPO.items[selectedItemIndex]?.itemName}
                        </div>
                        <div>
                          <span className="font-medium">Qty:</span> {selectedPO.items[selectedItemIndex]?.quantity} {selectedPO.items[selectedItemIndex]?.unit}
                        </div>
                        <div>
                          <span className="font-medium">Rate:</span> ₹{selectedPO.items[selectedItemIndex]?.rate}
                        </div>
                      </div>
                      {selectedPO.items[selectedItemIndex]?.description && (
                        <div className="mt-2 text-sm">
                          <span className="font-medium">Description:</span> {selectedPO.items[selectedItemIndex].description}
                        </div>
                      )}
                      <div className="mt-2 text-xs text-blue-600">
                        💡 This item's details will be auto-populated in the form below
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Fabric Details */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-blue-50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">2</div>
                Fabric Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fabricType">Fabric Type *</Label>
                  <Select
                    value={formData.fabricType}
                    onValueChange={(value) => handleInputChange('fabricType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Fabric Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cotton">Cotton</SelectItem>
                      <SelectItem value="polyester">Polyester</SelectItem>
                      <SelectItem value="viscose">Viscose</SelectItem>
                      <SelectItem value="blend">Blend</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.fabricType && (
                    <p className="text-sm text-red-600 mt-1">{errors.fabricType}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="fabricColor">Fabric Color *</Label>
                  <Input
                    id="fabricColor"
                    value={formData.fabricColor}
                    onChange={(e) => handleInputChange('fabricColor', e.target.value)}
                    placeholder="e.g., White, Blue, Red"
                  />
                  {errors.fabricColor && (
                    <p className="text-sm text-red-600 mt-1">{errors.fabricColor}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="fabricWeight">Fabric Weight (GSM) *</Label>
                  <Input
                    id="fabricWeight"
                    type="number"
                    value={formData.fabricWeight}
                    onChange={(e) => handleInputChange('fabricWeight', parseFloat(e.target.value) || 0)}
                    placeholder="e.g., 150"
                  />
                  {errors.fabricWeight && (
                    <p className="text-sm text-red-600 mt-1">{errors.fabricWeight}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="fabricWidth">Fabric Width (inches) *</Label>
                  <Input
                    id="fabricWidth"
                    type="number"
                    value={formData.fabricWidth}
                    onChange={(e) => handleInputChange('fabricWidth', parseFloat(e.target.value) || 0)}
                    placeholder="e.g., 60"
                  />
                  {errors.fabricWidth && (
                    <p className="text-sm text-red-600 mt-1">{errors.fabricWidth}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', parseFloat(e.target.value) || 0)}
                    placeholder="e.g., 1000"
                  />
                  {errors.quantity && (
                    <p className="text-sm text-red-600 mt-1">{errors.quantity}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="unit">Unit *</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) => handleInputChange('unit', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="meters">Meters</SelectItem>
                      <SelectItem value="yards">Yards</SelectItem>
                      <SelectItem value="pieces">Pieces</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.unit && (
                    <p className="text-sm text-red-600 mt-1">{errors.unit}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="quality">Quality Grade *</Label>
                  <Select
                    value={formData.quality}
                    onValueChange={(value) => handleInputChange('quality', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                      <SelectItem value="D">D</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.quality && (
                    <p className="text-sm text-red-600 mt-1">{errors.quality}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="expectedAt">Expected Delivery Date</Label>
                  <Input
                    id="expectedAt"
                    type="datetime-local"
                    value={formData.expectedAt}
                    onChange={(e) => handleInputChange('expectedAt', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  value={formData.remarks}
                  onChange={(e) => handleInputChange('remarks', e.target.value)}
                  placeholder="Additional notes or remarks..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Cost Breakdown */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm">3</div>
                Cost Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="fabricCost">Fabric Cost (₹)</Label>
                  <Input
                    id="fabricCost"
                    type="number"
                    value={formData.costBreakdown?.fabricCost || 0}
                    onChange={(e) => handleCostChange('fabricCost', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                  {errors.fabricCost && (
                    <p className="text-sm text-red-600 mt-1">{errors.fabricCost}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="transportationCost">Transportation Cost (₹)</Label>
                  <Input
                    id="transportationCost"
                    type="number"
                    value={formData.costBreakdown?.transportationCost || 0}
                    onChange={(e) => handleCostChange('transportationCost', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                  {errors.transportationCost && (
                    <p className="text-sm text-red-600 mt-1">{errors.transportationCost}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="inspectionCost">Inspection Cost (₹)</Label>
                  <Input
                    id="inspectionCost"
                    type="number"
                    value={formData.costBreakdown?.inspectionCost || 0}
                    onChange={(e) => handleCostChange('inspectionCost', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                  {errors.inspectionCost && (
                    <p className="text-sm text-red-600 mt-1">{errors.inspectionCost}</p>
                  )}
                </div>
              </div>

              <div className="border-t pt-6 mt-6">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total Cost:</span>
                    <span className="text-2xl font-bold">₹{totalCost.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="px-6 py-2 hover:bg-gray-50 transition-all duration-200"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || isFormDisabled}
              className="px-8 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : isFormDisabled ? 'Setup Required' : isEdit ? 'Update GRN' : 'Create GRN'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
