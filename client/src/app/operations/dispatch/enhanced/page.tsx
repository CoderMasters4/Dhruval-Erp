'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { DispatchList } from '@/components/dispatch/DispatchList';
import { DispatchCreateModal } from '@/components/dispatch/DispatchCreateModal';
import { DispatchViewModal } from '@/components/dispatch/DispatchViewModal';
import { DispatchFilters } from '@/components/dispatch/DispatchFilters';
import { Plus, Truck, TrendingUp } from 'lucide-react';
import { useGetDispatchesQuery, useDeleteDispatchMutation } from '@/lib/api/enhancedDispatchApi';
import { useGetAllCompaniesQuery } from '@/lib/features/companies/companiesApi';
import { Dispatch } from '@/lib/api/enhancedDispatchApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import toast from 'react-hot-toast';

const EnhancedDispatchPage = () => {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDispatch, setSelectedDispatch] = useState<Dispatch | null>(null);

  // User data
  const user = useSelector((state: RootState) => state.auth.user);

  // RTK Query hooks
  const { data: dispatchesData, isLoading: dispatchesLoading, refetch } = useGetDispatchesQuery({
    search: searchTerm,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    priority: priorityFilter !== 'all' ? priorityFilter : undefined,
    companyId: user?.companyId,
    assignedTo: undefined
  });

  const { data: companiesData } = useGetAllCompaniesQuery();
  const [deleteDispatch] = useDeleteDispatchMutation();

  const dispatches = dispatchesData || [];
  const companies = companiesData?.data || [];

  // Filter dispatches based on search and filters
  const filteredDispatches = dispatches.filter((dispatch: Dispatch) => {
    const matchesSearch = searchTerm === '' || 
      dispatch.dispatchNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispatch.dispatchType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispatch.source?.warehouseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispatch.destination?.destinationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispatch.createdBy?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || dispatch.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || dispatch.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Event handlers
  const handleViewDispatch = (dispatch: Dispatch) => {
    setSelectedDispatch(dispatch);
    setShowViewModal(true);
  };

  const handleEditDispatch = (dispatch: Dispatch) => {
    // For now, just show the view modal
    // TODO: Implement edit functionality
    setSelectedDispatch(dispatch);
    setShowViewModal(true);
  };

  const handleDeleteDispatch = async (id: string) => {
    try {
      await deleteDispatch(id).unwrap();
      toast.success('Dispatch deleted successfully');
      refetch();
    } catch (error) {
      console.error('Failed to delete dispatch:', error);
      toast.error('Failed to delete dispatch');
    }
  };

  const handleCreateSuccess = (dispatch: Dispatch) => {
    toast.success(`Dispatch ${dispatch.dispatchNumber} created successfully!`);
    refetch();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Truck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Enhanced Dispatch Operations
                  </h1>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Manage and track dispatch operations with advanced features and real-time monitoring
                </p>
              </div>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 h-12 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="h-5 w-5" />
                Create Dispatch
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Dispatches</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{dispatches.length}</p>
                </div>
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Dispatches</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dispatches.filter(d => d.status === 'pending' || d.status === 'in-progress').length}
                  </p>
                </div>
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₹{dispatches.reduce((sum, d) => sum + (d.totalValue || 0), 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="mb-8">
            <DispatchFilters
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              priorityFilter={priorityFilter}
              onSearchChange={setSearchTerm}
              onStatusFilterChange={setStatusFilter}
              onPriorityFilterChange={setPriorityFilter}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Dispatch List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <DispatchList
              dispatches={filteredDispatches}
              companies={companies}
              onView={handleViewDispatch}
              onEdit={handleEditDispatch}
              onDelete={handleDeleteDispatch}
              isLoading={dispatchesLoading}
            />
          </div>

          {/* Create Modal */}
          <DispatchCreateModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSuccess={handleCreateSuccess}
            userCompanyId={user?.companyId}
          />

          {/* View Modal */}
          <DispatchViewModal
            isOpen={showViewModal}
            onClose={() => {
              setShowViewModal(false);
              setSelectedDispatch(null);
            }}
            dispatch={selectedDispatch}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default EnhancedDispatchPage;
