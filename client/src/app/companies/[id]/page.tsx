'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useGetCompanyByIdQuery, useUpdateCompanyMutation } from '@/lib/features/companies/companiesApi';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentCompanyId, switchCompany } from '@/lib/features/auth/authSlice';
import { AppLayout } from '@/components/layout/AppLayout';
import { CompanyHeader } from '@/components/companies/CompanyHeader';
import { CompanyOverview } from '@/components/companies/CompanyOverview';
import { CompanyContact } from '@/components/companies/CompanyContact';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, MapPin, Factory, Warehouse, Settings, TrendingUp, Banknote, Shield } from 'lucide-react';

// =============================================
// TYPES AND INTERFACES
// =============================================
interface EditableField {
  [key: string]: boolean;
}

interface CompanyData {
  _id: string;
  companyCode: string;
  companyName: string;
  legalName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  registrationDetails?: {
    gstin?: string;
    pan?: string;
    cin?: string;
    registrationDate?: string;
  };
  addresses?: {
    registeredOffice?: {
      street?: string;
      area?: string;
      city?: string;
      state?: string;
      pincode?: string;
      country?: string;
    };
    factoryAddress?: {
      street?: string;
      area?: string;
      city?: string;
      state?: string;
      pincode?: string;
      country?: string;
    };
    warehouseAddresses?: Array<{
      warehouseName: string;
      street: string;
      area: string;
      city: string;
      state: string;
      pincode: string;
    }>;
  };
  contactInfo?: {
    phones?: Array<{
      type: string;
      label: string;
    }>;
    emails?: Array<{
      type: string;
      label: string;
    }>;
    website?: string;
    socialMedia?: {
      linkedin?: string;
    };
  };
  businessConfig?: {
    workingHours?: {
      start?: string;
      end?: string;
      breakStart?: string;
      breakEnd?: string;
    };
    gstRates?: {
      defaultRate?: number;
      rawMaterialRate?: number;
      finishedGoodsRate?: number;
    };
    currency?: string;
    timezone?: string;
    fiscalYearStart?: string;
    workingDays?: string[];
  };
  productionCapabilities?: {
    productTypes?: string[];
    printingMethods?: string[];
    qualityCertifications?: string[];
  };
  bankAccounts?: Array<{
    bankName: string;
    branchName: string;
    accountNumber: string;
    ifscCode: string;
    accountType: string;
    accountHolderName: string;
    currentBalance: number;
    isActive: boolean;
    isPrimary: boolean;
  }>;
  licenses?: Array<{
    name?: string;
    status?: string;
  }>;
}

// =============================================
// COMPONENT
// =============================================
export default function CompanyDetailsPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const currentCompanyId = useSelector(selectCurrentCompanyId);
  const { data: companyResponse, isLoading, error } = useGetCompanyByIdQuery(id as string);
  const [updateCompany] = useUpdateCompanyMutation();
  
  // State for inline editing
  const [editingFields, setEditingFields] = useState<EditableField>({});
  const [editData, setEditData] = useState<CompanyData | null>(null);

  // Extract company data from response - handle both direct and nested data structures
  const company: CompanyData | null = companyResponse || null;
  
  // Debug logging
  console.log("companyResponse:", companyResponse);
  console.log("company:", company);
  console.log("isLoading:", isLoading);
  console.log("error:", error);

  // Set the current company ID for superadmin users if not already set
  useEffect(() => {
    if (id && currentCompanyId !== id) {
      const tempCompany = { _id: id as string, companyName: 'Loading...', companyCode: '', legalName: '', isActive: true };
      dispatch(switchCompany(tempCompany));
    }
  }, [id, currentCompanyId, dispatch]);

  // Initialize edit data when company data loads
  useEffect(() => {
    if (company) {
      setEditData(company);
    }
  }, [company]);

  // =============================================
  // LOADING AND ERROR STATES
  // =============================================
  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading company details...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !company) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Building2 className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Company Not Found</h2>
            <p className="text-gray-600">The company you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // =============================================
  // HELPER FUNCTIONS
  // =============================================
  const startEditing = (field: string) => {
    setEditingFields((prev: EditableField) => ({ ...prev, [field]: true }));
  };

  const cancelEditing = (field: string) => {
    setEditingFields((prev: EditableField) => ({ ...prev, [field]: false }));
    setEditData(company); // Reset to original data
  };

  const saveField = async (field: string) => {
    if (!editData) return;
    
    try {
      await updateCompany({ id: company._id, company: editData as any });
      setEditingFields((prev: EditableField) => ({ ...prev, [field]: false }));
    } catch (error) {
      console.error('Error updating company:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (!editData) return;
    setEditData({ ...editData, [field]: value });
  };

  const handleNestedChange = (parentField: string, childField: string, value: any) => {
    if (!editData) return;
    setEditData({
      ...editData,
      [parentField]: {
        ...(editData[parentField as keyof CompanyData] as any),
        [childField]: value
      }
    } as CompanyData);
  };

  const handleEditCompany = () => {
    // TODO: Implement edit company modal
    console.log('Edit company clicked');
  };

  const handleViewUsers = () => {
    // TODO: Navigate to users page or open users modal
    console.log('View users clicked');
  };

  // =============================================
  // MAIN RENDER
  // =============================================
  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Beautiful Header */}
        <CompanyHeader 
          company={company}
          onEdit={handleEditCompany}
          onViewUsers={handleViewUsers}
        />

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-white shadow-lg border-0 rounded-2xl p-1">
              <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Overview
              </TabsTrigger>
              <TabsTrigger value="contact" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Contact
              </TabsTrigger>
              <TabsTrigger value="addresses" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Addresses
              </TabsTrigger>
              <TabsTrigger value="business" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Business
              </TabsTrigger>
              <TabsTrigger value="financial" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Financial
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <CompanyOverview 
                company={company}
                editingFields={editingFields}
                editData={editData}
                onStartEditing={startEditing}
                onCancelEditing={cancelEditing}
                onSaveField={saveField}
                onInputChange={handleInputChange}
                onNestedChange={handleNestedChange}
              />
            </TabsContent>

            {/* Contact Tab */}
            <TabsContent value="contact" className="space-y-6">
              <CompanyContact 
                company={company}
                editingFields={editingFields}
                editData={editData}
                onStartEditing={startEditing}
                onCancelEditing={cancelEditing}
                onSaveField={saveField}
                onNestedChange={handleNestedChange}
              />
            </TabsContent>

            {/* Addresses Tab */}
            <TabsContent value="addresses" className="space-y-6">
              <div className="text-center py-12">
                <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Addresses Management</h3>
                <p className="text-gray-600">Address management functionality coming soon...</p>
              </div>
            </TabsContent>

            {/* Business Tab */}
            <TabsContent value="business" className="space-y-6">
              <div className="text-center py-12">
                <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Business Configuration</h3>
                <p className="text-gray-600">Business configuration management coming soon...</p>
              </div>
            </TabsContent>

            {/* Financial Tab */}
            <TabsContent value="financial" className="space-y-6">
              <div className="text-center py-12">
                <Banknote className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Financial Management</h3>
                <p className="text-gray-600">Financial management functionality coming soon...</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
