'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Package, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  useGetGreyFabricInwardsQuery,
  useDeleteGreyFabricInwardMutation,
  useMarkAsReceivedMutation,
  GreyFabricInward
} from '@/lib/api/greyFabricInwardApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectCurrentCompanyId } from '@/lib/features/auth/authSlice';
import { GreyFabricInwardForm } from './GreyFabricInwardForm';
import { GreyFabricInwardDetails } from './GreyFabricInwardDetails';
import { GreyFabricInwardAnalytics } from './GreyFabricInwardAnalytics';

interface GreyFabricInwardDashboardProps {
  onRefresh?: () => void;
}

export default function GreyFabricInwardDashboard({ onRefresh }: GreyFabricInwardDashboardProps) {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [filters, setFilters] = useState({
    status: 'all',
    quality: 'all',
    fabricType: '',
    search: ''
  });
  const [selectedGrn, setSelectedGrn] = useState<GreyFabricInward | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Get user and company info
  const user = useSelector(selectCurrentUser);
  const companyId = useSelector(selectCurrentCompanyId);

  // RTK Query hooks
  const {
    data: grnData,
    isLoading,
    error,
    refetch
  } = useGetGreyFabricInwardsQuery({
    page,
    limit,
    filters: {
      ...filters,
      status: filters.status === 'all' ? '' : filters.status,
      quality: filters.quality === 'all' ? '' : filters.quality
    }
  });

  const [deleteGrn] = useDeleteGreyFabricInwardMutation();
  const [markAsReceived] = useMarkAsReceivedMutation();

  const handleRefresh = () => {
    refetch();
    onRefresh?.();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this GRN entry?')) {
      try {
        await deleteGrn(id).unwrap();
        handleRefresh();
      } catch (error) {
        console.error('Error deleting GRN:', error);
      }
    }
  };

  const handleMarkAsReceived = async (id: string) => {
    // Check authentication
    if (!user || !companyId) {
      alert('Authentication required. Please login again.');
      return;
    }

    try {
      await markAsReceived({
        id,
        receivedAt: new Date().toISOString()
      }).unwrap();
      handleRefresh();
    } catch (error: any) {
      console.error('Error marking as received:', error);
      
      // Show user-friendly error message
      const errorMessage = error?.data?.message || 
                          error?.message || 
                          'Failed to mark GRN as received. Please try again.';
      
      alert(`Error: ${errorMessage}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received': return 'bg-green-100 text-green-800';
      case 'in_transit': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'received': return 'Received';
      case 'in_transit': return 'In Transit';
      case 'pending': return 'Pending';
      case 'rejected': return 'Rejected';
      default: return 'Unknown';
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'A+': return 'bg-green-100 text-green-800';
      case 'A': return 'bg-green-100 text-green-800';
      case 'B+': return 'bg-blue-100 text-blue-800';
      case 'B': return 'bg-blue-100 text-blue-800';
      case 'C': return 'bg-yellow-100 text-yellow-800';
      case 'D': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Error loading GRN data</p>
          <Button onClick={handleRefresh} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Grey Fabric Inward</h1>
            <p className="text-blue-100 text-lg mb-4">GRN Entry and fabric inspection management</p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Live System</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span className="text-sm">{grnData?.total || 0} Total GRNs</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">{grnData?.data?.filter(grn => grn.status === 'received').length || 0} Received</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-200"
            >
              <Download className="h-4 w-4" />
              Analytics
            </Button>
            <Button 
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 shadow-lg transition-all duration-200 hover:scale-105"
            >
              <Plus className="h-4 w-4" />
              New GRN Entry
            </Button>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      {showAnalytics && (
        <GreyFabricInwardAnalytics />
      )}

      {/* Enhanced Filters */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-gray-50 to-blue-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Filter className="h-5 w-5 text-blue-600" />
            Advanced Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search GRN, PO, Customer..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Quality</label>
              <Select
                value={filters.quality}
                onValueChange={(value) => setFilters(prev => ({ ...prev, quality: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Quality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Quality</SelectItem>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="C">C</SelectItem>
                  <SelectItem value="D">D</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Fabric Type</label>
              <Input
                placeholder="Fabric Type"
                value={filters.fabricType}
                onChange={(e) => setFilters(prev => ({ ...prev, fabricType: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* GRN List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>GRN Entries ({grnData?.total || 0})</CardTitle>
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {grnData?.data?.map((grn) => (
              <div key={grn._id} className="border-0 rounded-xl p-6 hover:shadow-xl transition-all duration-300 bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 group">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                      {grn.grnNumber?.slice(-2) || 'GR'}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{grn.grnNumber}</h3>
                      <p className="text-gray-600 font-medium">{grn.productionOrderNumber} - {grn.customerName}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        Supplier: {grn.supplierName}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={`${getStatusColor(grn.status)} px-3 py-1 font-medium shadow-sm`}>
                      {getStatusText(grn.status)}
                    </Badge>
                    <Badge className={`${getQualityColor(grn.quality)} px-3 py-1 font-medium shadow-sm`}>
                      Grade: {grn.quality}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4 group-hover:bg-blue-50 transition-colors">
                    <p className="text-sm text-gray-500 mb-1">Fabric Type</p>
                    <p className="font-semibold text-gray-900">{grn.fabricType}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 group-hover:bg-green-50 transition-colors">
                    <p className="text-sm text-gray-500 mb-1">Quantity</p>
                    <p className="font-semibold text-gray-900">{typeof grn.quantity === 'number' ? grn.quantity : grn.quantity.receivedQuantity} {grn.unit}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 group-hover:bg-purple-50 transition-colors">
                    <p className="text-sm text-gray-500 mb-1">Total Value</p>
                    <p className="font-semibold text-gray-900">₹{grn.costBreakdown?.totalCost?.toLocaleString() || '0'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 group-hover:bg-yellow-50 transition-colors">
                    <p className="text-sm text-gray-500 mb-1">Expected/Received</p>
                    <p className="font-semibold text-gray-900">
                      {grn.status === 'received' && grn.receivedAt
                        ? new Date(grn.receivedAt).toLocaleDateString()
                        : grn.expectedAt
                        ? new Date(grn.expectedAt).toLocaleDateString()
                        : 'N/A'
                      }
                    </p>
                  </div>
                </div>

                {grn.remarks && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">Remarks</p>
                    <p className="text-sm text-gray-700">{grn.remarks}</p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedGrn(grn);
                        setShowDetails(true);
                      }}
                      className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all duration-200"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedGrn(grn);
                        setShowForm(true);
                      }}
                      className="flex items-center gap-2 hover:bg-green-50 hover:border-green-300 hover:text-green-600 transition-all duration-200"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    {grn.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAsReceived(grn._id)}
                        className="flex items-center gap-2 hover:bg-green-50 hover:border-green-300 hover:text-green-600 transition-all duration-200"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Mark Received
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(grn._id)}
                      className="flex items-center gap-2 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {grnData?.data?.length === 0 && (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No GRN entries found</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {grnData && grnData.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-700">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, grnData.total)} of {grnData.total} entries
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(prev => Math.min(grnData.totalPages, prev + 1))}
                  disabled={page === grnData.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {showForm && (
        <GreyFabricInwardForm
          grn={selectedGrn}
          onClose={() => {
            setShowForm(false);
            setSelectedGrn(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setSelectedGrn(null);
            handleRefresh();
          }}
        />
      )}

      {showDetails && selectedGrn && (
        <GreyFabricInwardDetails
          grn={selectedGrn}
          onClose={() => {
            setShowDetails(false);
            setSelectedGrn(null);
          }}
          onEdit={() => {
            setShowDetails(false);
            setShowForm(true);
          }}
        />
      )}
    </div>
  );
}
