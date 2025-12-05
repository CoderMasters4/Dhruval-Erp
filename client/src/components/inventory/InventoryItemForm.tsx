'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { WarehouseSelector } from './WarehouseSelector';
import { QuickCreateCategory } from './QuickCreateCategory';
import { QuickCreateSubcategory } from './QuickCreateSubcategory';
import { QuickCreateUnit } from './QuickCreateUnit';
import { useGetWarehouseByIdQuery } from '@/lib/api/warehousesApi';
import { useGetCategoriesQuery } from '@/features/category/api/categoryApi';
import { useGetSubcategoriesByCategoryQuery } from '@/features/subcategory/api/subcategoryApi';
import { useGetUnitsQuery } from '@/features/unit/api/unitApi';
import { useGetInventoryItemsQuery } from '@/lib/api/inventoryApi';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { Plus, Minus } from 'lucide-react';

interface InventoryItemFormProps {
  item?: any;
  onSubmit: (formData: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  theme: 'light' | 'dark';
}

export const InventoryItemForm: React.FC<InventoryItemFormProps> = ({
  item,
  onSubmit,
  onCancel,
  isSubmitting = false,
  theme
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string>(item?._id || '');
  const [selectedWarehouse, setSelectedWarehouse] = useState(item?.warehouseId || '');
  const [selectedCategory, setSelectedCategory] = useState(item?.category?.primary || '');
  const [selectedSubcategory, setSelectedSubcategory] = useState(item?.category?.secondary || '');
  const [selectedUnit, setSelectedUnit] = useState(item?.stock?.unit || '');
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showSubcategoryDialog, setShowSubcategoryDialog] = useState(false);
  const [showUnitDialog, setShowUnitDialog] = useState(false);
  
  // New fields state
  const [grossQuantity, setGrossQuantity] = useState<number>(item?.specifications?.grossQuantity || 0);
  const [tareWeight, setTareWeight] = useState<number>(item?.specifications?.tareWeight || 0);
  const [fold, setFold] = useState<number>(item?.specifications?.fold || 0);
  const [useTare, setUseTare] = useState<boolean>(item?.specifications?.tareWeight !== undefined && item?.specifications?.tareWeight !== null);
  const [pricePerNetQty, setPricePerNetQty] = useState<number>(item?.pricing?.pricePerNetQty || 0);
  const [gst, setGst] = useState<number>(item?.pricing?.gst || 0);
  
  // Dynamic designs state
  const [designs, setDesigns] = useState<Array<{
    designNumber: string;
    designName: string;
    designCategory: string;
    season: string;
    collection: string;
  }>>(() => {
    if (item?.designInfo) {
      return [{
        designNumber: item.designInfo.designNumber || '',
        designName: item.designInfo.designName || '',
        designCategory: item.designInfo.designCategory || '',
        season: item.designInfo.season || '',
        collection: item.designInfo.collection || ''
      }];
    }
    return [];
  });
  
  // Calculate Net Quantity
  const netQuantity = useTare 
    ? grossQuantity - (grossQuantity * (tareWeight / 100))
    : grossQuantity + (grossQuantity * (fold / 100));
  
  // Calculate Final Price
  const finalPrice = pricePerNetQty * netQuantity * (1 + (gst / 100));

  // Track previous dialog states to only refetch when transitioning from open to closed
  const prevCategoryDialogRef = useRef(false);
  const prevSubcategoryDialogRef = useRef(false);
  const prevUnitDialogRef = useRef(false);

  // Get theme from Redux
  const currentTheme = useSelector((state: RootState) => state.ui.theme);

  // Get warehouse details to extract company ID (must be defined before using it)
  const { data: warehouseData } = useGetWarehouseByIdQuery(selectedWarehouse, {
    skip: !selectedWarehouse
  });

  const warehouse = warehouseData?.data;

  // Get company ID from warehouse or user
  const companyIdFromWarehouse = warehouse?.companyId;
  const companyIdFromUser = useSelector((state: RootState) => state.auth.user?.companyAccess?.[0]?.companyId);
  const effectiveCompanyId = companyIdFromWarehouse || companyIdFromUser;

  // Fetch categories and units - refetch when dialogs open/close to get latest data
  const { data: categoriesData, refetch: refetchCategories } = useGetCategoriesQuery(
    effectiveCompanyId ? { companyId: effectiveCompanyId.toString() } : {},
    { skip: false }
  );
  const { data: unitsData, refetch: refetchUnits } = useGetUnitsQuery(
    effectiveCompanyId ? { companyId: effectiveCompanyId.toString() } : {},
    { skip: false }
  );

  const categories = categoriesData?.data || [];
  const units = unitsData?.data || [];

  // Fetch subcategories based on selected category
  const { data: subcategoriesData, refetch: refetchSubcategories } = useGetSubcategoriesByCategoryQuery(
    selectedCategory || '',
    { skip: !selectedCategory }
  );
  const subcategories = subcategoriesData?.data || [];

  // Fetch inventory items for selection
  const { data: inventoryItemsData } = useGetInventoryItemsQuery({
    page: 1,
    limit: 1000, // Get all items for selection
  });
  const inventoryItems = inventoryItemsData?.data?.data || [];

  // Store selected item data
  const [selectedItemData, setSelectedItemData] = useState<any>(item || null);

  // Handle item selection
  const handleItemSelect = (itemId: string) => {
    if (itemId === 'new') {
      // Create new item - reset form
      setSelectedItemId('');
      setSelectedItemData(null);
      setSelectedWarehouse('');
      setSelectedCategory('');
      setSelectedSubcategory('');
      setSelectedUnit('');
      setGrossQuantity(0);
      setTareWeight(0);
      setFold(0);
      setUseTare(false);
      setPricePerNetQty(0);
      setGst(0);
      setDesigns([]);
    } else {
      // Select existing item
      const selectedItem = inventoryItems.find((invItem: any) => invItem._id === itemId);
      if (selectedItem) {
        setSelectedItemId(itemId);
        setSelectedItemData(selectedItem);
        setSelectedWarehouse((selectedItem as any).warehouseId || '');
        
        // Find category by name
        const categoryByName = categories.find((cat: any) =>
          cat.name === selectedItem.category?.primary || cat._id === selectedItem.category?.primary
        );
        setSelectedCategory(categoryByName?._id || selectedItem.category?.primary || '');
        
        setSelectedUnit(selectedItem.stock?.unit || '');
        
        // Set new fields
        if (selectedItem.specifications) {
          setGrossQuantity((selectedItem.specifications as any).grossQuantity || 0);
          setTareWeight((selectedItem.specifications as any).tareWeight || 0);
          setFold((selectedItem.specifications as any).fold || 0);
          setUseTare((selectedItem.specifications as any).tareWeight !== undefined && (selectedItem.specifications as any).tareWeight !== null);
        }
        if (selectedItem.pricing) {
          setPricePerNetQty((selectedItem.pricing as any).pricePerNetQty || 0);
          setGst((selectedItem.pricing as any).gst || 0);
        }
        // Initialize designs from selected item
        if ((selectedItem as any).designInfo) {
          setDesigns([{
            designNumber: (selectedItem as any).designInfo.designNumber || '',
            designName: (selectedItem as any).designInfo.designName || '',
            designCategory: (selectedItem as any).designInfo.designCategory || '',
            season: (selectedItem as any).designInfo.season || '',
            collection: (selectedItem as any).designInfo.collection || ''
          }]);
        } else {
          setDesigns([]);
        }
      }
    }
  };

  // Update form when selectedItemData changes
  useEffect(() => {
      if (selectedItemData && categories.length > 0) {
      setSelectedWarehouse((selectedItemData as any).warehouseId || '');
      const categoryByName = categories.find((cat: any) =>
        cat.name === selectedItemData.category?.primary || cat._id === selectedItemData.category?.primary
      );
      setSelectedCategory(categoryByName?._id || selectedItemData.category?.primary || '');
      setSelectedUnit(selectedItemData.stock?.unit || '');
      
      if (selectedItemData.specifications) {
        setGrossQuantity((selectedItemData.specifications as any).grossQuantity || 0);
        setTareWeight((selectedItemData.specifications as any).tareWeight || 0);
        setFold((selectedItemData.specifications as any).fold || 0);
        setUseTare((selectedItemData.specifications as any).tareWeight !== undefined && (selectedItemData.specifications as any).tareWeight !== null);
      }
      if (selectedItemData.pricing) {
        setPricePerNetQty((selectedItemData.pricing as any).pricePerNetQty || 0);
        setGst((selectedItemData.pricing as any).gst || 0);
      }
    }
  }, [selectedItemData, categories]);

  // Initialize selectedItemId when item prop is provided
  useEffect(() => {
    if (item?._id) {
      setSelectedItemId(item._id);
      setSelectedItemData(item);
    }
  }, [item?._id]);

  // Handle item changes (for editing)
  useEffect(() => {
    if (item && categories.length > 0) {
      console.log('Form initialized with item:', item);
      setSelectedWarehouse((item as any).warehouseId || '');

      // Find category by name (item.category.primary is a name, not ID)
      const categoryByName = categories.find((cat: any) =>
        cat.name === item.category?.primary || cat._id === item.category?.primary
      );
      setSelectedCategory(categoryByName?._id || item.category?.primary || '');

      // Initialize designs from item
      if ((item as any).designInfo) {
        setDesigns([{
          designNumber: (item as any).designInfo.designNumber || '',
          designName: (item as any).designInfo.designName || '',
          designCategory: (item as any).designInfo.designCategory || '',
          season: (item as any).designInfo.season || '',
          collection: (item as any).designInfo.collection || ''
        }]);
      } else {
        setDesigns([]);
      }

      setSelectedUnit(item.stock?.unit || '');
      
      // Initialize new fields
      if (item.specifications) {
        setGrossQuantity((item.specifications as any).grossQuantity || 0);
        setTareWeight((item.specifications as any).tareWeight || 0);
        setFold((item.specifications as any).fold || 0);
        setUseTare((item.specifications as any).tareWeight !== undefined && (item.specifications as any).tareWeight !== null);
      }
      if (item.pricing) {
        setPricePerNetQty((item.pricing as any).pricePerNetQty || 0);
        setGst((item.pricing as any).gst || 0);
      }
    }
  }, [item, categories]);

  // Set subcategory when category and subcategories are loaded
  useEffect(() => {
    if (item && subcategories.length > 0 && selectedCategory) {
      // Find subcategory by name (item.category.secondary is a name, not ID)
      const subcategoryByName = subcategories.find((sub: any) =>
        sub.name === item.category?.secondary || sub._id === item.category?.secondary
      );
      setSelectedSubcategory(subcategoryByName?._id || item.category?.secondary || '');
    }
  }, [item, subcategories, selectedCategory]);

  // Reset subcategory when category changes
  useEffect(() => {
    setSelectedSubcategory('');
  }, [selectedCategory]);

  // Handle category creation callback
  const handleCategoryCreated = async (categoryId: string) => {
    // Refetch categories to ensure the new one is in the list
    if (refetchCategories) {
      try {
        await refetchCategories();
      } catch (error) {
        console.warn('Could not refetch categories:', error);
      }
    }
    setSelectedCategory(categoryId);
  };

  // Handle subcategory creation callback
  const handleSubcategoryCreated = async (subcategoryId: string) => {
    // Refetch subcategories to ensure the new one is in the list
    if (refetchSubcategories && selectedCategory) {
      try {
        await refetchSubcategories();
      } catch (error) {
        console.warn('Could not refetch subcategories:', error);
      }
    }
    setSelectedSubcategory(subcategoryId);
  };

  // Handle unit creation callback
  const handleUnitCreated = async (unitId: string) => {
    // Refetch units to ensure the new one is in the list
    if (refetchUnits) {
      try {
        await refetchUnits();
      } catch (error) {
        console.warn('Could not refetch units:', error);
      }
    }
    setSelectedUnit(unitId);
  };

  // Refetch when dialogs close to get latest data
  // Only refetch when transitioning from open to closed (not on initial mount)
  useEffect(() => {
    const wasOpen = prevCategoryDialogRef.current;
    const isClosed = !showCategoryDialog;

    if (wasOpen && isClosed && refetchCategories) {
      // Dialog was open and is now closed, safe to refetch
      refetchCategories().catch((error) => {
        console.warn('Could not refetch categories:', error);
      });
    }

    prevCategoryDialogRef.current = showCategoryDialog;
  }, [showCategoryDialog, refetchCategories]);

  useEffect(() => {
    const wasOpen = prevSubcategoryDialogRef.current;
    const isClosed = !showSubcategoryDialog;

    if (wasOpen && isClosed && refetchSubcategories && selectedCategory) {
      // Dialog was open and is now closed, safe to refetch
      refetchSubcategories().catch((error) => {
        console.warn('Could not refetch subcategories:', error);
      });
    }

    prevSubcategoryDialogRef.current = showSubcategoryDialog;
  }, [showSubcategoryDialog, refetchSubcategories, selectedCategory]);

  useEffect(() => {
    const wasOpen = prevUnitDialogRef.current;
    const isClosed = !showUnitDialog;

    if (wasOpen && isClosed && refetchUnits) {
      // Dialog was open and is now closed, safe to refetch
      refetchUnits().catch((error) => {
        console.warn('Could not refetch units:', error);
      });
    }

    prevUnitDialogRef.current = showUnitDialog;
  }, [showUnitDialog, refetchUnits]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate warehouse selection
    if (!selectedWarehouse) {
      alert('Please select a warehouse first');
      return;
    }

    // Validate category selection
    if (!selectedCategory) {
      alert('Please select a category');
      return;
    }

    // Validate unit selection
    if (!selectedUnit) {
      alert('Please select a unit');
      return;
    }

    // Validate company ID is available
    if (!warehouse?.companyId) {
      alert('Company ID not available from selected warehouse. Please try again.');
      return;
    }

    // Get category object from selected category ID
    const selectedCategoryObj = categories.find((cat: any) => cat._id === selectedCategory);

    // Get unit object from selected unit ID
    const selectedUnitObj = units.find((unit: any) => unit._id === selectedUnit);
    const unitValue = selectedUnitObj?.symbol || selectedUnitObj?.name || selectedUnit;

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // Build complete data structure
    const transformedData: any = {
      _id: selectedItemId || undefined, // Include item ID if editing existing item
      itemName: data.itemName,
      itemCode: data.itemCode || undefined,
      itemDescription: data.itemDescription || undefined,
      warehouseId: selectedWarehouse,
      companyId: warehouse.companyId.toString(),
      category: {
        primary: selectedCategoryObj?.name || selectedCategory, // Use category name or ID
        secondary: selectedSubcategory
          ? (subcategories.find((sub: any) => sub._id === selectedSubcategory)?.name || selectedSubcategory)
          : '',
        tertiary: data.categoryTertiary || ''
      },
      specifications: {
        color: data.color || undefined,
        design: data.design || undefined,
        lotNumber: data.lotNumber || undefined,
        challan: data.challan || undefined,
        additionalDetails: data.additionalDetails || undefined,
        hsnCode: data.hsnCode || undefined,
        attributeName: data.attributeName || undefined,
        grossQuantity: grossQuantity > 0 ? grossQuantity : undefined,
        tareWeight: useTare && tareWeight > 0 ? tareWeight : undefined,
        fold: !useTare && fold > 0 ? fold : undefined,
        date: data.date ? new Date(String(data.date)) : undefined,
        lrNumber: data.lrNumber || undefined,
        transportNumber: data.transportNumber || undefined,
      },
      designInfo: designs.length > 0 && designs[0].designNumber ? {
        designNumber: designs[0].designNumber || undefined,
        designName: designs[0].designName || undefined,
        designCategory: designs[0].designCategory || undefined,
        season: designs[0].season || undefined,
        collection: designs[0].collection || undefined,
      } : undefined,
      stock: {
        currentStock: Number(data.currentStock) || 0,
        unit: unitValue,
        availableStock: Number(data.currentStock) || 0,
        netQuantity: netQuantity || undefined,
      },
      pricing: {
        costPrice: Number(data.price) || 0,
        sellingPrice: Number(data.price) || 0,
        mrp: Number(data.price) || 0,
        currency: 'INR'
      },
      priceChangeReason: data.priceChangeReason || 'Price updated',
      priceChangeNotes: data.priceChangeNotes || ''
    };

    console.log('Form data being submitted:', transformedData);
    onSubmit(transformedData);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        form input:invalid,
        form select:invalid,
        form textarea:invalid {
          border-color: rgb(209, 213, 219) !important;
          box-shadow: none !important;
        }
        form input:invalid:focus,
        form select:invalid:focus,
        form textarea:invalid:focus {
          border-color: rgb(14, 165, 233) !important;
          box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.2) !important;
        }
        .dark form input:invalid,
        .dark form select:invalid,
        .dark form textarea:invalid {
          border-color: rgb(75, 85, 99) !important;
        }
        .dark form input:invalid:focus,
        .dark form select:invalid:focus,
        .dark form textarea:invalid:focus {
          border-color: rgb(14, 165, 233) !important;
        }
      `}} />
      <form key={selectedItemId || 'new'} onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Item Selection */}
      <div className={`rounded-lg border p-6 ${currentTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className={`text-lg font-semibold mb-4 border-b pb-2 ${currentTheme === 'dark' ? 'text-gray-100 border-gray-700' : 'text-gray-800 border-gray-200'}`}>
          Select Item
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <Label className={currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                Select Existing Item or Create New
              </Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleItemSelect('new')}
                className={`h-7 px-2 ${currentTheme === 'dark' ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : ''}`}
              >
                <Plus className="h-3 w-3 mr-1" />
                Create New
              </Button>
            </div>
            <Select
              value={selectedItemId}
              onValueChange={handleItemSelect}
            >
              <SelectTrigger className={currentTheme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-blue-50 border-blue-200'}>
                <SelectValue placeholder="Select an item or create new" />
              </SelectTrigger>
              <SelectContent className={`!z-[10060] ${currentTheme === 'dark' ? '!bg-gray-800 !border-gray-700 !text-white' : '!bg-white !border-gray-200 !text-gray-900'}`}>
                <SelectItem
                  value="new"
                  className={currentTheme === 'dark' ? '!text-white hover:!bg-gray-700 focus:!bg-gray-700' : '!text-gray-900 hover:!bg-gray-50 focus:!bg-gray-50'}
                >
                  + Create New Item
                </SelectItem>
                {inventoryItems.map((invItem: any) => (
                  <SelectItem
                    key={invItem._id}
                    value={invItem._id}
                    className={currentTheme === 'dark' ? '!text-white hover:!bg-gray-700 focus:!bg-gray-700' : '!text-gray-900 hover:!bg-gray-50 focus:!bg-gray-50'}
                  >
                    {invItem.itemCode || invItem.companyItemCode} - {invItem.itemName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className={`rounded-lg border p-6 ${currentTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className={`text-lg font-semibold mb-4 border-b pb-2 ${currentTheme === 'dark' ? 'text-gray-100 border-gray-700' : 'text-gray-800 border-gray-200'}`}>
          Basic Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className={currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
              Challan Number
            </Label>
            <Input
              name="challan"
              defaultValue={selectedItemData?.specifications?.challan || item?.specifications?.challan || ''}
              placeholder="Enter challan number"
              className={`w-full ${currentTheme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className={currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                Category *
              </Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setShowCategoryDialog(true)}
                className={`h-7 px-2 ${currentTheme === 'dark' ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : ''}`}
              >
                <Plus className="h-3 w-3 mr-1" />
                New
              </Button>
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className={currentTheme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-blue-50 border-blue-200'}>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent className={`!z-[10060] ${currentTheme === 'dark' ? '!bg-gray-800 !border-gray-700 !text-white' : '!bg-white !border-gray-200 !text-gray-900'}`}>
                {categories.map((cat: any) => (
                  <SelectItem
                    key={cat._id}
                    value={cat._id}
                    className={currentTheme === 'dark' ? '!text-white hover:!bg-gray-700 focus:!bg-gray-700' : '!text-gray-900 hover:!bg-gray-50 focus:!bg-gray-50'}
                  >
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="category" value={selectedCategory} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className={currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                Subcategory
              </Label>
              {selectedCategory && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowSubcategoryDialog(true)}
                  className={`h-7 px-2 ${currentTheme === 'dark' ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : ''}`}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  New
                </Button>
              )}
            </div>
            <Select
              value={selectedSubcategory}
              onValueChange={setSelectedSubcategory}
              disabled={!selectedCategory}
            >
              <SelectTrigger className={currentTheme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : selectedCategory ? 'bg-blue-50 border-blue-200' : 'bg-gray-100 border-gray-300'}>
                <SelectValue placeholder={selectedCategory ? "Select Subcategory" : "Select Category First"} />
              </SelectTrigger>
              <SelectContent className={`!z-[10060] ${currentTheme === 'dark' ? '!bg-gray-800 !border-gray-700 !text-white' : '!bg-white !border-gray-200 !text-gray-900'}`}>
                {subcategories.length > 0 ? (
                  subcategories.map((sub: any) => (
                    <SelectItem
                      key={sub._id}
                      value={sub._id}
                      className={currentTheme === 'dark' ? '!text-white hover:!bg-gray-700 focus:!bg-gray-700' : '!text-gray-900 hover:!bg-gray-50 focus:!bg-gray-50'}
                    >
                      {sub.name}
                    </SelectItem>
                  ))
                ) : selectedCategory ? (
                  <div className={`px-2 py-1.5 text-sm ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    No subcategories found. Click "New" to create one.
                  </div>
                ) : (
                  <div className={`px-2 py-1.5 text-sm ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Please select a category first
                  </div>
                )}
              </SelectContent>
            </Select>
            <input type="hidden" name="subcategory" value={selectedSubcategory} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <Label className={currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
              Item Name *
            </Label>
            <Input
              name="itemName"
              defaultValue={selectedItemData?.itemName || item?.itemName || ''}
              required
              placeholder="Enter item name"
              className={`w-full ${currentTheme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>

          <div>
            <Label className={currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
              HSN Code
            </Label>
            <Input
              name="hsnCode"
              defaultValue={selectedItemData?.specifications?.hsnCode || item?.specifications?.hsnCode || ''}
              placeholder="Enter HSN code"
              className={`w-full ${currentTheme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>

          <div>
            <Label className={currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
              Attribute Name
            </Label>
            <Input
              name="attributeName"
              defaultValue={selectedItemData?.specifications?.attributeName || item?.specifications?.attributeName || ''}
              placeholder="Enter attribute name"
              className={`w-full ${currentTheme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <Label className={currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
              Item Code
            </Label>
            <Input
              name="itemCode"
              defaultValue={selectedItemData?.itemCode || item?.itemCode || ''}
              placeholder="Auto-generated if empty"
              className={`w-full ${currentTheme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>

          <div>
            <Label className={currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
              Date
            </Label>
            <Input
              name="date"
              type="date"
              defaultValue={item?.specifications?.date ? new Date(item.specifications.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
              className={`w-full ${currentTheme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <Label className={currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
              Barcode
            </Label>
            <Input
              name="barcode"
              defaultValue={item?.barcode || ''}
              placeholder="Barcode number"
              className={`w-full ${currentTheme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        <div className="mt-4">
          <Label className={currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
            Description
          </Label>
          <textarea
            name="itemDescription"
            defaultValue={item?.itemDescription || ''}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${currentTheme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            placeholder="Enter item description"
          />
        </div>
      </div>

      {/* Warehouse Selection */}
      <div className={`rounded-lg border p-6 ${currentTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className={`text-lg font-semibold mb-4 border-b pb-2 ${currentTheme === 'dark' ? 'text-gray-100 border-gray-700' : 'text-gray-800 border-gray-200'}`}>
          Warehouse
        </h3>

        <div className="grid grid-cols-1 gap-6">
          <WarehouseSelector
            selectedWarehouse={selectedWarehouse}
            onWarehouseChange={setSelectedWarehouse}
            onAddWarehouse={() => {
              // Handle add warehouse
              console.log('Add warehouse clicked');
            }}
          />
        </div>
      </div>


      {/* Specifications */}
      <div className={`rounded-lg border p-6 ${currentTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className={`text-lg font-semibold mb-4 border-b pb-2 ${currentTheme === 'dark' ? 'text-gray-100 border-gray-700' : 'text-gray-800 border-gray-200'}`}>
          Specifications
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className={currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
              Color
            </Label>
            <Input
              name="color"
              defaultValue={item?.specifications?.color || ''}
              placeholder="e.g., Blue, Red"
              className={`w-full ${currentTheme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>

          <div>
            <Label className={currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
              Design
            </Label>
            <Input
              name="design"
              defaultValue={item?.specifications?.design || ''}
              placeholder="e.g., Geometric, Floral"
              className={`w-full ${currentTheme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        {/* Transport & Lot Information */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className={`text-md font-semibold mb-3 ${currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
            Transport & Lot Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className={currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                LR Number
              </Label>
              <Input
                name="lrNumber"
                defaultValue={item?.specifications?.lrNumber || ''}
                placeholder="Enter LR number"
                className={`w-full ${currentTheme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>

            <div>
              <Label className={currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                Transport Number
              </Label>
              <Input
                name="transportNumber"
                defaultValue={item?.specifications?.transportNumber || ''}
                placeholder="Enter transport number"
                className={`w-full ${currentTheme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>

            <div>
              <Label className={currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                Lot Number
              </Label>
              <Input
                name="lotNumber"
                defaultValue={item?.specifications?.lotNumber || ''}
                placeholder="Lot number (optional)"
                className={`w-full ${currentTheme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Designs Section */}
      <div className={`rounded-lg border p-6 ${currentTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center justify-between mb-4 border-b pb-2">
          <h3 className={`text-lg font-semibold ${currentTheme === 'dark' ? 'text-gray-100 border-gray-700' : 'text-gray-800 border-gray-200'}`}>
            Design Information
          </h3>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setDesigns([...designs, { designNumber: '', designName: '', designCategory: '', season: '', collection: '' }])}
            className={`h-8 px-3 ${currentTheme === 'dark' ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : ''}`}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Design
          </Button>
        </div>

        {designs.length === 0 ? (
          <div className={`text-center py-8 ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            <p className="text-sm">No designs added yet. Click "Add Design" to add one.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {designs.map((design, index) => (
              <div key={index} className={`rounded-lg border p-4 ${currentTheme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className={`text-sm font-semibold ${currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    Design {index + 1}
                  </h4>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setDesigns(designs.filter((_, i) => i !== index))}
                    className={`h-7 px-2 ${currentTheme === 'dark' ? 'border-red-600 text-red-400 hover:bg-red-900/20' : 'border-red-300 text-red-600 hover:bg-red-50'}`}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className={currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                      Design Number
                    </Label>
                    <Input
                      value={design.designNumber}
                      onChange={(e) => {
                        const newDesigns = [...designs];
                        newDesigns[index].designNumber = e.target.value;
                        setDesigns(newDesigns);
                      }}
                      placeholder="e.g., D001, D002"
                      className={`w-full ${currentTheme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <Label className={currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                      Design Name
                    </Label>
                    <Input
                      value={design.designName}
                      onChange={(e) => {
                        const newDesigns = [...designs];
                        newDesigns[index].designName = e.target.value;
                        setDesigns(newDesigns);
                      }}
                      placeholder="e.g., Floral Pattern, Geometric"
                      className={`w-full ${currentTheme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <Label className={currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                      Design Category
                    </Label>
                    <Input
                      value={design.designCategory}
                      onChange={(e) => {
                        const newDesigns = [...designs];
                        newDesigns[index].designCategory = e.target.value;
                        setDesigns(newDesigns);
                      }}
                      placeholder="e.g., Traditional, Modern"
                      className={`w-full ${currentTheme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <Label className={currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                      Season
                    </Label>
                    <Select
                      value={design.season}
                      onValueChange={(value) => {
                        const newDesigns = [...designs];
                        newDesigns[index].season = value;
                        setDesigns(newDesigns);
                      }}
                    >
                      <SelectTrigger className={currentTheme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}>
                        <SelectValue placeholder="Select season" />
                      </SelectTrigger>
                      <SelectContent className={`!z-[10060] ${currentTheme === 'dark' ? '!bg-gray-800 !border-gray-700 !text-white' : '!bg-white !border-gray-200 !text-gray-900'}`}>
                        <SelectItem value="spring" className={currentTheme === 'dark' ? '!text-white hover:!bg-gray-700' : ''}>Spring</SelectItem>
                        <SelectItem value="summer" className={currentTheme === 'dark' ? '!text-white hover:!bg-gray-700' : ''}>Summer</SelectItem>
                        <SelectItem value="monsoon" className={currentTheme === 'dark' ? '!text-white hover:!bg-gray-700' : ''}>Monsoon</SelectItem>
                        <SelectItem value="winter" className={currentTheme === 'dark' ? '!text-white hover:!bg-gray-700' : ''}>Winter</SelectItem>
                        <SelectItem value="all_season" className={currentTheme === 'dark' ? '!text-white hover:!bg-gray-700' : ''}>All Season</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label className={currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                      Collection
                    </Label>
                    <Input
                      value={design.collection}
                      onChange={(e) => {
                        const newDesigns = [...designs];
                        newDesigns[index].collection = e.target.value;
                        setDesigns(newDesigns);
                      }}
                      placeholder="e.g., Summer 2024, Premium Collection"
                      className={`w-full ${currentTheme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Additional Details */}
      <div className={`rounded-lg border p-6 ${currentTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className={`text-lg font-semibold mb-4 border-b pb-2 ${currentTheme === 'dark' ? 'text-gray-100 border-gray-700' : 'text-gray-800 border-gray-200'}`}>
          Additional Details
        </h3>

        <div>
          <Label className={currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
            Additional Details (optional)
          </Label>
          <Input
            name="additionalDetails"
            defaultValue={item?.specifications?.additionalDetails || ''}
            placeholder="Enter any additional details"
            className={`w-full ${currentTheme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          />
        </div>
      </div>

      {/* Stock Information */}
      <div className={`rounded-lg border p-6 ${currentTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className={`text-lg font-semibold mb-4 border-b pb-2 ${currentTheme === 'dark' ? 'text-gray-100 border-gray-700' : 'text-gray-800 border-gray-200'}`}>
          Stock Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className={currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                Unit
              </Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setShowUnitDialog(true)}
                className={`h-7 px-2 ${currentTheme === 'dark' ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : ''}`}
              >
                <Plus className="h-3 w-3 mr-1" />
                New
              </Button>
            </div>
            <Select
              value={selectedUnit}
              onValueChange={setSelectedUnit}
            >
              <SelectTrigger className={currentTheme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-blue-50 border-blue-200'}>
                <SelectValue placeholder="Select or add unit" />
              </SelectTrigger>
              <SelectContent className={`!z-[10060] ${currentTheme === 'dark' ? '!bg-gray-800 !border-gray-700 !text-white' : '!bg-white !border-gray-200 !text-gray-900'}`}>
                {units.map((unit: any) => (
                  <SelectItem
                    key={unit._id}
                    value={unit._id}
                    className={currentTheme === 'dark' ? '!text-white hover:!bg-gray-700 focus:!bg-gray-700' : '!text-gray-900 hover:!bg-gray-50 focus:!bg-gray-50'}
                  >
                    {unit.name} ({unit.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="unit" value={selectedUnit} />
          </div>

          <div>
            <Label className={currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
              Gross Quantity
            </Label>
            <Input
              name="grossQuantity"
              type="number"
              step="0.01"
              value={grossQuantity}
              onChange={(e) => setGrossQuantity(Number(e.target.value) || 0)}
              placeholder="Enter gross quantity"
              className={`w-full ${currentTheme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>

          <div>
            <Label className={currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
              Net Quantity (Calculated)
            </Label>
            <Input
              name="netQuantity"
              type="number"
              value={netQuantity.toFixed(2)}
              readOnly
              className={`w-full bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-300 cursor-not-allowed`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Label className={currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                Tare Weight (%) / Fold (%)
              </Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setUseTare(true);
                    setFold(0);
                  }}
                  className={`px-3 py-1 text-sm rounded ${useTare 
                    ? 'bg-blue-600 text-white' 
                    : currentTheme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Tare
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUseTare(false);
                    setTareWeight(0);
                  }}
                  className={`px-3 py-1 text-sm rounded ${!useTare 
                    ? 'bg-blue-600 text-white' 
                    : currentTheme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Fold
                </button>
              </div>
            </div>
            {useTare ? (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setTareWeight(Math.max(0, tareWeight - 1))}
                  className={`${currentTheme === 'dark' ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : ''}`}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  name="tareWeight"
                  type="number"
                  step="0.01"
                  value={tareWeight}
                  onChange={(e) => setTareWeight(Number(e.target.value) || 0)}
                  placeholder="0"
                  className={`flex-1 ${currentTheme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setTareWeight(tareWeight + 1)}
                  className={`${currentTheme === 'dark' ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : ''}`}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setFold(fold - 1)}
                  className={`${currentTheme === 'dark' ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : ''}`}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  name="fold"
                  type="number"
                  step="0.01"
                  value={fold}
                  onChange={(e) => setFold(Number(e.target.value) || 0)}
                  placeholder="0"
                  className={`flex-1 ${currentTheme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setFold(fold + 1)}
                  className={`${currentTheme === 'dark' ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : ''}`}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div>
            <Label className={currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
              Current Stock
            </Label>
            <Input
              name="currentStock"
              type="number"
              defaultValue={item?.stock?.currentStock || ''}
              placeholder="Available quantity"
              className={`w-full ${currentTheme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className={`rounded-lg border p-6 ${currentTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className={`text-lg font-semibold mb-4 border-b pb-2 ${currentTheme === 'dark' ? 'text-gray-100 border-gray-700' : 'text-gray-800 border-gray-200'}`}>
          Pricing Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <div>
            <Label className={currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
              Price (₹)
            </Label>
            <Input
              name="price"
              type="number"
              step="0.01"
              defaultValue={selectedItemData?.pricing?.costPrice || selectedItemData?.pricing?.sellingPrice || item?.pricing?.costPrice || item?.pricing?.sellingPrice || ''}
              placeholder="Enter price"
              className={`w-full ${currentTheme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        {/* Price History */}
        {(selectedItemData?.priceHistory && selectedItemData.priceHistory.length > 0) || (item?.priceHistory && item.priceHistory.length > 0) ? (
          <div className={`mt-6 pt-4 border-t ${currentTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <h4 className={`text-md font-semibold mb-3 ${currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
              Price History
            </h4>
            <div className={`rounded-lg border ${currentTheme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`border-b ${currentTheme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                      <th className={`px-4 py-2 text-left ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Date</th>
                      <th className={`px-4 py-2 text-left ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Previous Price</th>
                      <th className={`px-4 py-2 text-left ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>New Price</th>
                      <th className={`px-4 py-2 text-left ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Change</th>
                      <th className={`px-4 py-2 text-left ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {((selectedItemData?.priceHistory || item?.priceHistory) || []).slice().reverse().map((history: any, index: number) => {
                      const priceChange = history.previousPrice 
                        ? ((history.price - history.previousPrice) / history.previousPrice * 100).toFixed(2)
                        : 'N/A';
                      const isIncrease = history.previousPrice && history.price > history.previousPrice;
                      const isDecrease = history.previousPrice && history.price < history.previousPrice;
                      
                      return (
                        <tr key={index} className={`border-b ${currentTheme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                          <td className={`px-4 py-2 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {new Date(history.changedAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>
                          <td className={`px-4 py-2 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {history.previousPrice ? `₹ ${history.previousPrice.toFixed(2)}` : 'N/A'}
                          </td>
                          <td className={`px-4 py-2 font-medium ${currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                            ₹ {history.price.toFixed(2)}
                          </td>
                          <td className={`px-4 py-2 ${
                            isIncrease ? 'text-green-600' : isDecrease ? 'text-red-600' : currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            {priceChange !== 'N/A' && (isIncrease ? '+' : '')}{priceChange}%
                          </td>
                          <td className={`px-4 py-2 ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {history.reason || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}
      </div>


      {/* Form Actions */}
      <div className="flex gap-3 justify-end pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className={currentTheme === 'dark' ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : ''}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : (item ? 'Update Item' : 'Create Item')}
        </Button>
      </div>

      {/* Quick Create Dialogs */}
      <QuickCreateCategory
        open={showCategoryDialog}
        onOpenChange={setShowCategoryDialog}
        onCategoryCreated={handleCategoryCreated}
      />
      <QuickCreateSubcategory
        open={showSubcategoryDialog}
        onOpenChange={setShowSubcategoryDialog}
        onSubcategoryCreated={handleSubcategoryCreated}
        categoryId={selectedCategory}
      />
      <QuickCreateUnit
        open={showUnitDialog}
        onOpenChange={setShowUnitDialog}
        onUnitCreated={handleUnitCreated}
      />
    </form>
    </>
  );
};
