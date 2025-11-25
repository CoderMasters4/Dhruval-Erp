'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useCreatePurchaseOrderMutation, useUpdatePurchaseOrderMutation } from '@/lib/api/purchaseApi'
import { useCreateInventoryItemMutation, useCreateStockMovementMutation } from '@/lib/api/inventoryApi'
import { useSelector } from 'react-redux'
import { selectCurrentUser, selectIsSuperAdmin } from '@/lib/features/auth/authSlice'
import { selectTheme } from '@/lib/features/ui/uiSlice'
import { Save, FileText, DollarSign, Package, Truck, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'
import { PurchaseOrderDetails } from './PurchaseOrderDetails'
import { SupplierSelection } from './SupplierSelection'
import { WarehouseSelection } from './WarehouseSelection'
import { ItemsSection } from './ItemsSection'
import { ChargesSection } from './ChargesSection'
import { PaymentTermsSection } from './PaymentTermsSection'
import { NotesSection } from './NotesSection'
import { OrderSummary } from './OrderSummary'
import { InventoryImpactSummary } from './InventoryImpactSummary'
import { useGetAllCompaniesQuery } from '@/lib/api/authApi'

interface PurchaseOrderFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  isSubmitting?: boolean
  setIsSubmitting?: (submitting: boolean) => void
}

export interface PurchaseOrderFormData {
  // Basic Details
  poNumber: string
  poDate: string
  expectedDeliveryDate: string
  financialYear: string
  poType: 'standard' | 'blanket' | 'contract' | 'planned' | 'emergency' | 'service' | 'capital'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'raw_material' | 'finished_goods' | 'consumables' | 'services' | 'capital_goods' | 'maintenance'
  
  // Company
  selectedCompanyId: string
  
  // Supplier
  selectedSupplierId: string
  selectedSupplier: any
  
  // Warehouse
  selectedWarehouseId: string
  selectedWarehouse: any
  
  // Items
  items: Array<{
    category?: 'raw_material' | 'finished_goods' | 'consumables' | 'services' | 'capital_goods' | 'maintenance' | 'spare_parts'
    itemId?: string
    itemCode: string
    itemName: string
    description: string
    specifications: string
    hsnCode: string
    quantity: number
    unit: string
    rate: number
    itemType?: 'new' | 'existing'
    selectedInventoryItemId?: string
    currentStock?: number
    availableStock?: number
    discount: {
      type: 'percentage' | 'amount'
      value: number
    }
    discountAmount: number
    taxableAmount: number
    taxBreakup: Array<{
      taxType: 'CGST' | 'SGST' | 'IGST' | 'CESS'
      rate: number
      amount: number
    }>
    totalTaxAmount: number
    lineTotal: number
    deliveryDate: string
    notes: string
  }>
  
  // Charges
  freightCharges: number
  packingCharges: number
  otherCharges: number
  
  // Payment Terms
  paymentTermType: 'advance' | 'net' | 'cod' | 'credit' | 'milestone'
  paymentDays: number
  advancePercentage: number
  
  // Notes
  terms: string
  notes: string
}

export function PurchaseOrderForm({ onSuccess, onCancel, isSubmitting, setIsSubmitting }: PurchaseOrderFormProps) {
  const user = useSelector(selectCurrentUser)
  const isSuperAdmin = useSelector(selectIsSuperAdmin)
  const theme = useSelector(selectTheme)
  const userCompanyId = user?.companyAccess?.[0]?.companyId

  // API hooks
  const [createPurchaseOrder] = useCreatePurchaseOrderMutation()
  const [updatePurchaseOrder] = useUpdatePurchaseOrderMutation()
  const [createInventoryItem] = useCreateInventoryItemMutation()
  const [createStockMovement] = useCreateStockMovementMutation()
  const { data: companiesData } = useGetAllCompaniesQuery(undefined, {
    skip: !isSuperAdmin
  })

  // Form state
  const [formData, setFormData] = useState<PurchaseOrderFormData>({
    poNumber: '',
    poDate: '',
    expectedDeliveryDate: '',
    financialYear: '',
    poType: 'standard',
    priority: 'medium',
    category: 'raw_material',
    selectedCompanyId: '',
    selectedSupplierId: '',
    selectedSupplier: null,
    selectedWarehouseId: '',
    selectedWarehouse: null,
    items: [],
    freightCharges: 0,
    packingCharges: 0,
    otherCharges: 0,
    paymentTermType: 'net',
    paymentDays: 30,
    advancePercentage: 0,
    terms: '',
    notes: ''
  })

  // Initialize form with default values
  useEffect(() => {
    const currentDate = new Date().toISOString().split('T')[0]
    const currentYear = new Date().getFullYear()
    const nextYear = currentYear + 1
    
    setFormData(prev => ({
      ...prev,
      poNumber: `PO-${currentYear}-${Date.now().toString().slice(-6)}`,
      poDate: currentDate,
      financialYear: `${currentYear}-${nextYear}`,
      selectedCompanyId: isSuperAdmin ? '' : userCompanyId || ''
    }))
  }, [isSuperAdmin, userCompanyId])

  // Update form data
  const updateFormData = useCallback((updates: Partial<PurchaseOrderFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }, [])

  // Calculate totals
  const subtotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0)
  const totalDiscount = formData.items.reduce((sum, item) => sum + item.discountAmount, 0)
  const taxableAmount = formData.items.reduce((sum, item) => sum + item.taxableAmount, 0)
  const totalTaxAmount = formData.items.reduce((sum, item) => sum + item.totalTaxAmount, 0)
  const grandTotal = taxableAmount + totalTaxAmount + formData.freightCharges + formData.packingCharges + formData.otherCharges

  // Validation
  const validateForm = () => {
    if (!formData.selectedCompanyId) {
      toast.error('Please select a company')
      return false
    }

    if (!formData.selectedSupplierId || !formData.selectedSupplier) {
      toast.error('Please select a supplier')
      return false
    }

    if (!formData.selectedWarehouseId || !formData.selectedWarehouse) {
      toast.error('Please select a warehouse')
      return false
    }

    if (formData.items.length === 0) {
      toast.error('Please add at least one item')
      return false
    }

    // Validate each item has required fields
    for (let i = 0; i < formData.items.length; i++) {
      const item = formData.items[i]
      
      // For existing items, check if item is selected
      if (item.itemType === 'existing') {
        if (!item.selectedInventoryItemId || !item.itemCode || !item.itemName || item.quantity <= 0 || item.rate <= 0) {
          toast.error(`Item ${i + 1}: Please select an existing item and fill quantity`)
          return false
        }
      } else {
        // For new items, check all required fields
        if (!item.itemCode || !item.itemName || item.quantity <= 0 || item.rate <= 0) {
          toast.error(`Item ${i + 1}: Please fill all required fields (Item Code, Item Name, Quantity, Rate)`)
          return false
        }
      }
    }

    if (!formData.expectedDeliveryDate) {
      toast.error('Please select expected delivery date')
      return false
    }

    return true
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if user is authenticated
    if (!user || !user._id) {
      toast.error('User not authenticated. Please log in again.');
      return;
    }
    
    if (!validateForm()) return

    const submitting = setIsSubmitting || (() => {})
    submitting(true)

    try {
      // Debug: Log user information
      console.log('Purchase Order Creation - User Debug:', {
        user: user,
        userId: user?._id,
        userEmail: user?.email,
        userName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
      });

      // Get user ID with fallbacks
      const getUserId = () => {
        if (user?._id) return user._id;
        
        // Try to get from localStorage as fallback
        if (typeof window !== 'undefined') {
          try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
              const parsedUser = JSON.parse(storedUser);
              if (parsedUser._id) return parsedUser._id;
            }
          } catch (error) {
            console.error('Error parsing stored user:', error);
          }
        }
        
        // Last resort - throw error if no user ID found
        throw new Error('User ID not found. Please log in again.');
      };

      const userId = getUserId();

      const purchaseOrderData = {
        companyId: formData.selectedCompanyId,
        poNumber: formData.poNumber,
        poDate: formData.poDate,
        expectedDeliveryDate: formData.expectedDeliveryDate,
        financialYear: formData.financialYear,
        poType: formData.poType,
        priority: formData.priority,
        category: formData.category,
        supplier: {
          supplierId: formData.selectedSupplier._id || '',
          supplierCode: formData.selectedSupplier.supplierCode,
          supplierName: formData.selectedSupplier.supplierName,
          gstin: formData.selectedSupplier.gstin || '',
          pan: formData.selectedSupplier.pan || '',
          contactPerson: formData.selectedSupplier.contactPerson || '',
          phone: formData.selectedSupplier.phone || '',
          email: formData.selectedSupplier.email || '',
          address: {
            addressLine1: formData.selectedSupplier.addresses?.[0]?.addressLine1 || '',
            addressLine2: formData.selectedSupplier.addresses?.[0]?.addressLine2 || '',
            city: formData.selectedSupplier.addresses?.[0]?.city || '',
            state: formData.selectedSupplier.addresses?.[0]?.state || '',
            pincode: formData.selectedSupplier.addresses?.[0]?.pincode || '',
            country: formData.selectedSupplier.addresses?.[0]?.country || 'India'
          }
        },
        deliveryInfo: {
          deliveryAddress: {
            addressLine1: formData.selectedWarehouse?.address?.addressLine1 || '',
            addressLine2: formData.selectedWarehouse?.address?.addressLine2 || '',
            city: formData.selectedWarehouse?.address?.city || '',
            state: formData.selectedWarehouse?.address?.state || '',
            pincode: formData.selectedWarehouse?.address?.pincode || '',
            country: formData.selectedWarehouse?.address?.country || 'India'
          },
          warehouseId: formData.selectedWarehouseId,
          warehouseName: formData.selectedWarehouse?.warehouseName || '',
          contactPerson: formData.selectedWarehouse?.contactInfo?.primaryPhone || '',
          contactPhone: formData.selectedWarehouse?.contactInfo?.primaryPhone || '',
          deliveryInstructions: '',
          workingHours: '',
          deliveryType: 'standard' as const
        },
        items: formData.items.map(item => ({
          // For existing items, use the actual inventory item ID
          // For new items, create a temporary ID that will be replaced when inventory item is created
          itemId: item.itemType === 'existing' ? item.selectedInventoryItemId! : `temp-${Date.now()}-${Math.random()}`,
          // Store the original inventory item ID for linking
          inventoryItemId: item.itemType === 'existing' ? item.selectedInventoryItemId! : null,
          itemCode: item.itemCode,
          itemName: item.itemName,
          description: item.description,
          specifications: item.specifications,
          hsnCode: item.hsnCode,
          quantity: item.quantity,
          unit: item.unit,
          rate: item.rate,
          discount: item.discount,
          discountAmount: item.discountAmount,
          taxableAmount: item.taxableAmount,
          taxBreakup: item.taxBreakup.map(tax => ({
            ...tax,
            taxType: tax.taxType as 'CGST' | 'SGST' | 'IGST' | 'CESS'
          })),
          totalTaxAmount: item.totalTaxAmount,
          lineTotal: item.lineTotal,
          deliveryDate: item.deliveryDate,
          notes: item.notes,
          category: item.category
        })),
        amounts: {
          subtotal,
          totalDiscount,
          taxableAmount,
          totalTaxAmount,
          freightCharges: formData.freightCharges,
          packingCharges: formData.packingCharges,
          otherCharges: formData.otherCharges,
          roundingAdjustment: 0,
          grandTotal
        },
        taxDetails: {
          placeOfSupply: formData.selectedWarehouse?.address?.state || 'Maharashtra',
          isReverseCharge: false,
          taxBreakup: [
            { taxType: 'CGST' as const, rate: 9, taxableAmount: taxableAmount / 2, taxAmount: totalTaxAmount / 2 },
            { taxType: 'SGST' as const, rate: 9, taxableAmount: taxableAmount / 2, taxAmount: totalTaxAmount / 2 }
          ],
          totalTaxAmount
        },
        paymentTerms: {
          termType: formData.paymentTermType,
          days: formData.paymentDays,
          advancePercentage: formData.advancePercentage
        },
        terms: formData.terms,
        notes: formData.notes,
        specialInstructions: '',
        createdBy: userId,
        lastModifiedBy: userId,
        buyerId: userId,
        buyerName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || 'Unknown User',
        isActive: true
      }

      const result = await createPurchaseOrder(purchaseOrderData).unwrap()
      
      // Store mapping of temporary item IDs to actual inventory item IDs
      const itemIdMapping: { [key: string]: string } = {}
      
      // Handle inventory updates and linking
      for (const item of formData.items) {
        if (item.itemType === 'new') {
          try {
            // Create new inventory item
            const inventoryData = {
              itemName: item.itemName,
              itemCode: item.itemCode,
              category: item.category || 'raw_material',
              warehouseId: formData.selectedWarehouseId,
              reorderPoint: 0,
              reorderQuantity: item.quantity,
              stockingMethod: 'fifo' as const,
              currentStock: item.quantity,
              unitOfMeasure: item.unit,
              specifications: {
                color: '',
                design: '',
                finish: ''
              },
              pricing: {
                costPrice: item.rate,
                sellingPrice: item.rate * 1.2, // 20% markup
                mrp: item.rate * 1.3
              }
            }
            
            const newInventoryItem = await createInventoryItem(inventoryData).unwrap()
            
            // Store the mapping from temporary ID to actual inventory item ID
            if (item.itemId) {
              itemIdMapping[item.itemId] = newInventoryItem.data._id
            }
            
            // Create stock movement record with the new inventory item ID
            await createStockMovement({
              companyId: formData.selectedCompanyId,
              itemId: newInventoryItem.data._id, // Use the actual created inventory item ID
              warehouseId: formData.selectedWarehouseId,
              movementType: 'inward',
              quantity: item.quantity,
              unit: item.unit,
              referenceDocument: {
                type: 'purchase_order',
                number: formData.poNumber,
                date: formData.poDate
              },
              notes: `Initial stock from PO ${formData.poNumber}`,
              movementDate: formData.poDate
            }).unwrap()
            
            console.log(`Created new inventory item: ${newInventoryItem.data._id} for item: ${item.itemName}`)
            
          } catch (error) {
            console.error('Failed to create inventory item:', error)
            toast.error(`Failed to create inventory item: ${item.itemName}`)
          }
        } else if (item.itemType === 'existing' && item.selectedInventoryItemId) {
          try {
            // For existing items, create stock movement with the linked inventory item ID
            await createStockMovement({
              companyId: formData.selectedCompanyId,
              itemId: item.selectedInventoryItemId, // Use the existing inventory item ID
              warehouseId: formData.selectedWarehouseId,
              movementType: 'inward',
              quantity: item.quantity,
              unit: item.unit,
              referenceDocument: {
                type: 'purchase_order',
                number: formData.poNumber,
                date: formData.poDate
              },
              notes: `Stock addition from PO ${formData.poNumber}`,
              movementDate: formData.poDate
            }).unwrap()
            
            console.log(`Updated existing inventory item: ${item.selectedInventoryItemId} for item: ${item.itemName}`)
            
          } catch (error) {
            console.error('Failed to update inventory stock:', error)
            toast.error(`Failed to update stock for: ${item.itemName}`)
          }
        }
      }
      
      // Log the linking summary
      console.log('Purchase Order Item Linking Summary:', {
        poNumber: formData.poNumber,
        poId: result.data._id,
        itemMappings: itemIdMapping,
        existingItems: formData.items.filter(item => item.itemType === 'existing').map(item => ({
          itemName: item.itemName,
          inventoryItemId: item.selectedInventoryItemId
        }))
      })
      
      toast.success('Purchase Order created successfully!')
      onSuccess?.()
    } catch (error: any) {
      console.error('Purchase Order Creation Error:', error);
      
      // Handle specific error cases
      if (error?.message === 'User ID not found. Please log in again.') {
        toast.error('Session expired. Please log in again.');
        // Optionally redirect to login page
        // window.location.href = '/login';
      } else {
        toast.error(error?.data?.message || error?.message || 'Failed to create purchase order');
      }
    } finally {
      submitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Purchase Order Details */}
      <PurchaseOrderDetails 
        formData={formData} 
        updateFormData={updateFormData}
        isSuperAdmin={isSuperAdmin}
        companies={companiesData?.data || []}
      />

      {/* Supplier Selection */}
      <SupplierSelection 
        formData={formData} 
        updateFormData={updateFormData}
      />

      {/* Warehouse Selection */}
      <WarehouseSelection 
        formData={formData} 
        updateFormData={updateFormData}
      />

      {/* Items */}
      <ItemsSection 
        formData={formData} 
        updateFormData={updateFormData}
      />

      {/* Charges */}
      <ChargesSection 
        formData={formData} 
        updateFormData={updateFormData}
      />

      {/* Payment Terms */}
      <PaymentTermsSection 
        formData={formData} 
        updateFormData={updateFormData}
      />

      {/* Notes */}
      <NotesSection 
        formData={formData} 
        updateFormData={updateFormData}
      />

      {/* Inventory Impact Summary */}
      <InventoryImpactSummary items={formData.items} />

      {/* Order Summary */}
      <OrderSummary 
        items={formData.items}
        freightCharges={formData.freightCharges}
        packingCharges={formData.packingCharges}
        otherCharges={formData.otherCharges}
      />

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="min-w-[120px] bg-sky-500 hover:bg-sky-600 text-white"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner className="h-4 w-4 mr-2" />
              Creating...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Create PO
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
