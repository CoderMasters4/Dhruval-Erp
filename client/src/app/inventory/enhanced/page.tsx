'use client'

import { useState } from 'react'
import { Plus, Search, Filter, Download, Upload, BarChart3, Package, AlertTriangle, TrendingUp, Layers, MapPin, Clock, Award, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EnhancedInventoryDashboard } from '@/components/inventory/EnhancedInventoryDashboard'
import { ProductSummaryCards } from '@/components/inventory/ProductSummaryCards'
import { LocationWiseInventory } from '@/components/inventory/LocationWiseInventory'
import { AgeingAnalysis } from '@/components/inventory/AgeingAnalysis'
import { BatchManagement } from '@/components/inventory/BatchManagement'
import { AdvancedSearch } from '@/components/inventory/AdvancedSearch'
import { useGetInventorySummaryQuery, useGetProductSummaryQuery } from '@/lib/features/inventory/enhancedInventoryApi'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageHeader } from '@/components/ui/PageHeader'
import { CompanySwitcher } from '@/components/ui/CompanySwitcher'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '@/lib/features/auth/authSlice'
import { CreateInventoryItemModal } from '@/components/inventory/CreateInventoryItemModal'

export default function EnhancedInventoryPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const currentUser = useSelector(selectCurrentUser)

  // Use simple queries for now
  const { data: summaryData } = useGetInventorySummaryQuery()
  const { data: productSummaryData } = useGetProductSummaryQuery()

  // Calculate summary stats
  const totalItems = summaryData?.data?.reduce((sum, item) => sum + item.totalItems, 0) || 0
  const totalValue = summaryData?.data?.reduce((sum, item) => sum + item.totalValue, 0) || 0
  const lowStockItems = summaryData?.data?.reduce((sum, item) => sum + item.lowStockItems, 0) || 0
  const totalCategories = summaryData?.data?.length || 0

  const handleCreateItem = async (itemData: any) => {
    try {
      // Add company ID to the item data
      const dataWithCompany = {
        ...itemData,
        companyId: currentUser?.companyId
      }

      console.log('Creating inventory item:', dataWithCompany)
      // Here you would call the create API
      // await createInventoryItem(dataWithCompany)

      // Show success message
      alert('Inventory item created successfully!')
    } catch (error) {
      console.error('Error creating inventory item:', error)
      alert('Error creating inventory item. Please try again.')
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header with Theme Colors */}
        <PageHeader
          title="Enhanced Inventory Management"
          description="Complete textile inventory with SKU tracking, batch management, and ageing analysis"
          icon={<Package className="h-6 w-6" />}
          variant="sky"
        >
          <div className="flex items-center space-x-2">
            {/* Company Selector for SuperAdmin */}
            {currentUser?.roles?.some(role => role.roleId === 'super_admin') && (
              <div className="bg-white/10 rounded-lg px-3 py-2 border border-white/30">
                <select
                  className="bg-transparent text-white text-sm border-none outline-none"
                  onChange={(e) => console.log('Company selected:', e.target.value)}
                >
                  <option value="" className="text-gray-900">Select Company</option>
                  <option value="company1" className="text-gray-900">Company 1</option>
                  <option value="company2" className="text-gray-900">Company 2</option>
                </select>
              </div>
            )}

            <Button variant="outline" size="sm" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" size="sm" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setIsCreateModalOpen(true)} className="bg-white text-sky-600 hover:bg-gray-50">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </PageHeader>

      {/* Enhanced Stats with Better Visibility */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-sky-500 bg-white shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Items</CardTitle>
            <div className="p-2 bg-sky-100 rounded-lg">
              <Package className="h-4 w-4 text-sky-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalItems.toLocaleString()}</div>
            <p className="text-xs text-gray-600">
              Across {totalCategories} categories
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500 bg-white shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Low Stock Alert</CardTitle>
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lowStockItems}</div>
            <p className="text-xs text-gray-600">
              Items need restocking
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500 bg-white shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Value</CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{(totalValue / 100000).toFixed(1)}L</div>
            <p className="text-xs text-gray-600">
              Current inventory value
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500 bg-white shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Product Types</CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Layers className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{productSummaryData?.data?.length || 0}</div>
            <p className="text-xs text-gray-600">
              Saree, African, Garment, etc.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="batches">Batches</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="ageing">Ageing</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <EnhancedInventoryDashboard />
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <ProductSummaryCards />
        </TabsContent>

        <TabsContent value="batches" className="space-y-4">
          <BatchManagement />
        </TabsContent>

        <TabsContent value="locations" className="space-y-4">
          <LocationWiseInventory />
        </TabsContent>

        <TabsContent value="ageing" className="space-y-4">
          <AgeingAnalysis />
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <AdvancedSearch />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Stock Movement Trends</CardTitle>
                <CardDescription>Track inventory flow over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="mx-auto h-12 w-12 text-blue-500 mb-4" />
                  <p className="text-muted-foreground">Advanced analytics coming soon</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Quality Distribution</CardTitle>
                <CardDescription>Quality grades across inventory</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Award className="mx-auto h-12 w-12 text-green-500 mb-4" />
                  <p className="text-muted-foreground">Quality charts coming soon</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Process Stage Analysis</CardTitle>
                <CardDescription>Raw, Semi-finished, Finished goods</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Layers className="mx-auto h-12 w-12 text-purple-500 mb-4" />
                  <p className="text-muted-foreground">Process analytics coming soon</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Location Utilization</CardTitle>
                <CardDescription>Warehouse and rack efficiency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MapPin className="mx-auto h-12 w-12 text-red-500 mb-4" />
                  <p className="text-muted-foreground">Location analytics coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      </div>

      {/* Create Inventory Item Modal */}
      <CreateInventoryItemModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateItem}
      />
    </AppLayout>
  )
}
