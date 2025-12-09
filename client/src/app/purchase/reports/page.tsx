'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { DashboardHeader } from '@/components/ui/DashboardHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '@/lib/features/auth/authSlice'
import {
  FileText,
  Download,
  Calendar,
  Building2,
  Package,
  TrendingUp,
  Filter,
  RefreshCw,
  Search
} from 'lucide-react'
import {
  useGetVendorWiseSummaryQuery,
  useGetItemWiseReportQuery,
  useGetCategoryWiseReportQuery,
  useGetDateRangeReportQuery,
  useExportReportMutation,
  ReportFilters
} from '@/lib/api/purchaseReportsApi'
import toast from 'react-hot-toast'

export default function PurchaseReportsPage() {
  const user = useSelector(selectCurrentUser)
  const companyId = user?.companyAccess?.[0]?.companyId

  // State
  const [activeTab, setActiveTab] = useState<'vendor-wise' | 'item-wise' | 'category-wise' | 'date-range'>('vendor-wise')
  const [filters, setFilters] = useState<ReportFilters>({
    companyId,
    dateFrom: '',
    dateTo: '',
    vendorId: undefined,
    itemId: undefined,
    category: undefined
  })

  // Date range defaults to last 30 days
  const defaultDateFrom = new Date()
  defaultDateFrom.setDate(defaultDateFrom.getDate() - 30)
  const defaultDateTo = new Date()

  const [dateFrom, setDateFrom] = useState(
    filters.dateFrom || defaultDateFrom.toISOString().split('T')[0]
  )
  const [dateTo, setDateTo] = useState(
    filters.dateTo || defaultDateTo.toISOString().split('T')[0]
  )

  // Queries
  const vendorWiseQuery = useGetVendorWiseSummaryQuery(
    { ...filters, dateFrom, dateTo },
    { skip: activeTab !== 'vendor-wise' || !companyId }
  )

  const itemWiseQuery = useGetItemWiseReportQuery(
    { ...filters, dateFrom, dateTo },
    { skip: activeTab !== 'item-wise' || !companyId }
  )

  const categoryWiseQuery = useGetCategoryWiseReportQuery(
    { ...filters, dateFrom, dateTo },
    { skip: activeTab !== 'category-wise' || !companyId }
  )

  const dateRangeQuery = useGetDateRangeReportQuery(
    { ...filters, dateFrom, dateTo },
    { skip: activeTab !== 'date-range' || !companyId || !dateFrom || !dateTo }
  )

  const [exportReport, { isLoading: exportLoading }] = useExportReportMutation()

  // Handlers
  const handleFilterChange = (key: keyof ReportFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value || undefined }))
  }

  const handleExport = async (format: 'xlsx' | 'pdf') => {
    try {
      const result = await exportReport({
        reportType: activeTab,
        format,
        filters: { ...filters, companyId, dateFrom, dateTo }
      }).unwrap()

      if (result.data?.downloadUrl) {
        window.open(result.data.downloadUrl, '_blank')
        toast.success(`Report exported successfully as ${format.toUpperCase()}`)
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to export report')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <AppLayout>
      <div className="space-y-6 p-4 sm:p-6">
        {/* Header */}
        <DashboardHeader
          title="Purchase Reports"
          description="Generate and download comprehensive purchase reports"
          icon={<FileText className="h-6 w-6 text-white" />}
          actions={
            <div className="flex gap-2">
              <Button
                onClick={() => handleExport('xlsx')}
                disabled={exportLoading}
                variant="outline"
                size="sm"
                className="border-green-300 dark:border-green-600 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-800"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
              <Button
                onClick={() => handleExport('pdf')}
                disabled={exportLoading}
                variant="outline"
                size="sm"
                className="border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-800"
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          }
        />

        {/* Filters */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">From Date</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">To Date</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                />
              </div>
              {activeTab === 'vendor-wise' && (
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300">Vendor ID (Optional)</Label>
                  <Input
                    value={filters.vendorId || ''}
                    onChange={(e) => handleFilterChange('vendorId', e.target.value)}
                    placeholder="Enter vendor ID"
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  />
                </div>
              )}
              {activeTab === 'item-wise' && (
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300">Category (Optional)</Label>
                  <Input
                    value={filters.category || ''}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    placeholder="Enter category"
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Report Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <TabsTrigger value="vendor-wise" className="data-[state=active]:bg-sky-500 data-[state=active]:text-white">
              Vendor-wise
            </TabsTrigger>
            <TabsTrigger value="item-wise" className="data-[state=active]:bg-sky-500 data-[state=active]:text-white">
              Item-wise
            </TabsTrigger>
            <TabsTrigger value="category-wise" className="data-[state=active]:bg-sky-500 data-[state=active]:text-white">
              Category-wise
            </TabsTrigger>
            <TabsTrigger value="date-range" className="data-[state=active]:bg-sky-500 data-[state=active]:text-white">
              Date Range
            </TabsTrigger>
          </TabsList>

          {/* Vendor-wise Report */}
          <TabsContent value="vendor-wise" className="space-y-4">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Vendor-wise Purchase Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {vendorWiseQuery.isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <LoadingSpinner />
                  </div>
                ) : vendorWiseQuery.error ? (
                  <div className="text-center py-12 text-red-600 dark:text-red-400">
                    Error loading report
                  </div>
                ) : vendorWiseQuery.data?.data && vendorWiseQuery.data.data.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left p-2 text-gray-900 dark:text-white">Vendor Name</th>
                          <th className="text-left p-2 text-gray-900 dark:text-white">Contact</th>
                          <th className="text-left p-2 text-gray-900 dark:text-white">Total Purchases</th>
                          <th className="text-left p-2 text-gray-900 dark:text-white">Total Orders</th>
                          <th className="text-left p-2 text-gray-900 dark:text-white">Avg Order Value</th>
                          <th className="text-left p-2 text-gray-900 dark:text-white">Items</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vendorWiseQuery.data.data.map((vendor) => (
                          <tr key={vendor.vendorId} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="p-2 text-gray-900 dark:text-white">
                              <div>
                                <div className="font-medium">{vendor.vendorName}</div>
                                {vendor.gstin && <div className="text-sm text-gray-500 dark:text-gray-400">GST: {vendor.gstin}</div>}
                              </div>
                            </td>
                            <td className="p-2 text-gray-900 dark:text-white">
                              <div className="text-sm">
                                {vendor.contactPerson && <div>{vendor.contactPerson}</div>}
                                {vendor.contactNumber && <div>{vendor.contactNumber}</div>}
                                {vendor.email && <div className="text-gray-500 dark:text-gray-400">{vendor.email}</div>}
                              </div>
                            </td>
                            <td className="p-2 text-gray-900 dark:text-white font-medium">
                              {formatCurrency(vendor.totalPurchases)}
                            </td>
                            <td className="p-2 text-gray-900 dark:text-white">{vendor.totalOrders}</td>
                            <td className="p-2 text-gray-900 dark:text-white">
                              {formatCurrency(vendor.averageOrderValue)}
                            </td>
                            <td className="p-2 text-gray-900 dark:text-white">
                              <div className="text-sm">
                                {vendor.items.length} item(s)
                                <div className="text-gray-500 dark:text-gray-400 mt-1">
                                  Qty: {vendor.totalQuantity}
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    No vendor data found for selected filters
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Item-wise Report */}
          <TabsContent value="item-wise" className="space-y-4">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Item-wise Purchase Report</CardTitle>
              </CardHeader>
              <CardContent>
                {itemWiseQuery.isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <LoadingSpinner />
                  </div>
                ) : itemWiseQuery.error ? (
                  <div className="text-center py-12 text-red-600 dark:text-red-400">
                    Error loading report
                  </div>
                ) : itemWiseQuery.data?.data && itemWiseQuery.data.data.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left p-2 text-gray-900 dark:text-white">Item Name</th>
                          <th className="text-left p-2 text-gray-900 dark:text-white">Category</th>
                          <th className="text-left p-2 text-gray-900 dark:text-white">Total Qty</th>
                          <th className="text-left p-2 text-gray-900 dark:text-white">Total Amount</th>
                          <th className="text-left p-2 text-gray-900 dark:text-white">Avg Rate</th>
                          <th className="text-left p-2 text-gray-900 dark:text-white">Purchases</th>
                        </tr>
                      </thead>
                      <tbody>
                        {itemWiseQuery.data.data.map((item) => (
                          <tr key={item.itemId} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="p-2 text-gray-900 dark:text-white">
                              <div>
                                <div className="font-medium">{item.itemName}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Code: {item.itemCode}</div>
                              </div>
                            </td>
                            <td className="p-2 text-gray-900 dark:text-white">
                              {item.category || 'N/A'}
                            </td>
                            <td className="p-2 text-gray-900 dark:text-white">{item.totalQuantity}</td>
                            <td className="p-2 text-gray-900 dark:text-white font-medium">
                              {formatCurrency(item.totalAmount)}
                            </td>
                            <td className="p-2 text-gray-900 dark:text-white">
                              {formatCurrency(item.averageRate)}
                            </td>
                            <td className="p-2 text-gray-900 dark:text-white">
                              {item.purchaseCount} purchase(s)
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    No item data found for selected filters
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Category-wise Report */}
          <TabsContent value="category-wise" className="space-y-4">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Category-wise Purchase Report</CardTitle>
              </CardHeader>
              <CardContent>
                {categoryWiseQuery.isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <LoadingSpinner />
                  </div>
                ) : categoryWiseQuery.error ? (
                  <div className="text-center py-12 text-red-600 dark:text-red-400">
                    Error loading report
                  </div>
                ) : categoryWiseQuery.data?.data && categoryWiseQuery.data.data.length > 0 ? (
                  <div className="space-y-6">
                    {categoryWiseQuery.data.data.map((category) => (
                      <div key={category.category} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {category.category || 'Uncategorized'}
                          </h3>
                          <div className="text-right">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Total Purchases</div>
                            <div className="text-xl font-bold text-gray-900 dark:text-white">
                              {formatCurrency(category.totalPurchases)}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Total Orders</div>
                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                              {category.totalOrders}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Total Quantity</div>
                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                              {category.totalQuantity}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Avg Order Value</div>
                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(category.averageOrderValue)}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                          Items: {category.items.length} | Vendors: {category.vendors.length}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    No category data found for selected filters
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Date Range Report */}
          <TabsContent value="date-range" className="space-y-4">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Date Range Purchase Report</CardTitle>
              </CardHeader>
              <CardContent>
                {dateRangeQuery.isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <LoadingSpinner />
                  </div>
                ) : dateRangeQuery.error ? (
                  <div className="text-center py-12 text-red-600 dark:text-red-400">
                    Error loading report. Please ensure date range is selected.
                  </div>
                ) : dateRangeQuery.data?.data ? (
                  <div className="space-y-6">
                    {/* Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Amount</div>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {formatCurrency(dateRangeQuery.data.data.totalAmount)}
                        </div>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Orders</div>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {dateRangeQuery.data.data.totalOrders}
                        </div>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Quantity</div>
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {dateRangeQuery.data.data.totalQuantity}
                        </div>
                      </div>
                      <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Avg Order Value</div>
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          {formatCurrency(dateRangeQuery.data.data.averageOrderValue)}
                        </div>
                      </div>
                    </div>

                    {/* PO Entries */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Purchase Orders</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                              <th className="text-left p-2 text-gray-900 dark:text-white">PO Number</th>
                              <th className="text-left p-2 text-gray-900 dark:text-white">Date</th>
                              <th className="text-left p-2 text-gray-900 dark:text-white">Vendor</th>
                              <th className="text-left p-2 text-gray-900 dark:text-white">Amount</th>
                              <th className="text-left p-2 text-gray-900 dark:text-white">Items</th>
                              <th className="text-left p-2 text-gray-900 dark:text-white">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dateRangeQuery.data.data.poEntries.map((po, idx) => (
                              <tr key={idx} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="p-2 text-gray-900 dark:text-white font-medium">{po.poNumber}</td>
                                <td className="p-2 text-gray-900 dark:text-white">{formatDate(po.poDate)}</td>
                                <td className="p-2 text-gray-900 dark:text-white">{po.vendorName}</td>
                                <td className="p-2 text-gray-900 dark:text-white font-medium">
                                  {formatCurrency(po.totalAmount)}
                                </td>
                                <td className="p-2 text-gray-900 dark:text-white">{po.itemCount} items</td>
                                <td className="p-2 text-gray-900 dark:text-white">{po.status}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    Please select date range to view report
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}

