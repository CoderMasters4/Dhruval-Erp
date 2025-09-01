'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/Modal';
import { Plus, Edit, Trash2, Eye, Search, Package } from 'lucide-react';
import { selectCurrentUser, selectIsSuperAdmin } from '@/lib/features/auth/authSlice';
import { AppLayout } from '@/components/layout/AppLayout';
import { 
  useGetDispatchesQuery,
  useCreateDispatchMutation,
  useUpdateDispatchMutation,
  useDeleteDispatchMutation,
  useGetCompaniesQuery,
  useGetUsersQuery,
  type Dispatch,
  type CreateDispatchRequest,
  type UpdateDispatchRequest,
  type Company,
  type User
} from '@/lib/api/enhancedDispatchApi';
import toast from 'react-hot-toast';

// Using types from RTK Query API

const EnhancedDispatchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDispatch, setSelectedDispatch] = useState<Dispatch | null>(null);
  const [formData, setFormData] = useState<CreateDispatchRequest>({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    assignedTo: '',
    companyId: '',
    dueDate: '',
    location: '',
    vehicleId: '',
    vehicleNumber: ''
  });

  const user = useSelector(selectCurrentUser);
  const isSuperAdmin = useSelector(selectIsSuperAdmin);

  // RTK Query hooks
  const { data: dispatches = [], isLoading: dispatchesLoading } = useGetDispatchesQuery({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    priority: priorityFilter !== 'all' ? priorityFilter : undefined,
    search: searchTerm || undefined
  });
  
  const { data: companies = [] } = useGetCompaniesQuery();
  const { data: users = [] } = useGetUsersQuery();
  
  const [createDispatch, { isLoading: creating }] = useCreateDispatchMutation();
  const [updateDispatch, { isLoading: updating }] = useUpdateDispatchMutation();
  const [deleteDispatch, { isLoading: deleting }] = useDeleteDispatchMutation();

  // Auto-fill company ID for non-superadmin users
  useEffect(() => {
    if (user && !isSuperAdmin && user.companyId) {
      setFormData(prev => ({ ...prev, companyId: user.companyId || '' }));
    }
  }, [user, isSuperAdmin]);

  const handleCreate = async () => {
    try {
      await createDispatch(formData).unwrap();
      toast.success('Dispatch created successfully');
      setShowCreateModal(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.data?.message || 'Failed to create dispatch');
    }
  };

  const handleUpdate = async () => {
    if (!selectedDispatch) return;

    try {
      await updateDispatch({
        id: selectedDispatch._id,
        ...formData
      }).unwrap();
      toast.success('Dispatch updated successfully');
      setShowEditModal(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.data?.message || 'Failed to update dispatch');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDispatch(id).unwrap();
      toast.success('Dispatch deleted successfully');
    } catch (error: any) {
      toast.error(error.data?.message || 'Failed to delete dispatch');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      assignedTo: '',
      companyId: '',
      dueDate: '',
      location: '',
      vehicleId: '',
      vehicleNumber: ''
    });
  };

  const openEditModal = (dispatch: Dispatch) => {
    setSelectedDispatch(dispatch);
    setFormData({
      title: dispatch.title,
      description: dispatch.description,
      status: dispatch.status,
      priority: dispatch.priority,
      assignedTo: typeof dispatch.assignedTo === 'string' ? dispatch.assignedTo : dispatch.assignedTo._id,
      companyId: typeof dispatch.companyId === 'string' ? dispatch.companyId : dispatch.companyId._id,
      dueDate: dispatch.dueDate,
      location: dispatch.location,
      vehicleId: dispatch.vehicleId || '',
      vehicleNumber: dispatch.vehicleNumber || ''
    });
    setShowEditModal(true);
  };

  const openViewModal = (dispatch: Dispatch) => {
    setSelectedDispatch(dispatch);
    setShowViewModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredDispatches = dispatches.filter(dispatch => {
    const matchesSearch = dispatch.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dispatch.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dispatch.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || dispatch.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || dispatch.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (dispatchesLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dispatches...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Enhanced Dispatch Operations</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Manage and track dispatch operations with advanced features</p>
          </div>
          <Button onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Create Dispatch
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search dispatches..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Dispatch List */}
        <div className="grid gap-4">
          {filteredDispatches.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium">No dispatches found</h3>
                  <p className="text-sm">Create your first dispatch to get started</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredDispatches.map((dispatch) => (
              <Card key={dispatch._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{dispatch.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{dispatch.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Location: {dispatch.location}</span>
                        <span>Due: {new Date(dispatch.dueDate).toLocaleDateString()}</span>
                        {dispatch.vehicleNumber && <span>Vehicle: {dispatch.vehicleNumber}</span>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(dispatch.status)}>
                        {dispatch.status}
                      </Badge>
                      <Badge className={getPriorityColor(dispatch.priority)}>
                        {dispatch.priority}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                                         <div className="text-sm text-gray-500">
                       Assigned to: {typeof dispatch.assignedTo === 'string' ? users.find(u => u._id === dispatch.assignedTo)?.name || 'Unknown' : dispatch.assignedTo.name}
                       {isSuperAdmin && (
                         <span className="ml-4">Company: {typeof dispatch.companyId === 'string' ? companies.find(c => c._id === dispatch.companyId)?.name || 'Unknown' : dispatch.companyId.name}</span>
                       )}
                     </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openViewModal(dispatch)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openEditModal(dispatch)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this dispatch?')) {
                            handleDelete(dispatch._id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Create Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Dispatch"
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter dispatch title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as Dispatch['priority'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              {isSuperAdmin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <select
                    value={formData.companyId}
                    onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                                       <option value="">Select company</option>
                   {companies.map((company) => (
                     <option key={company._id} value={company._id}>
                       {company.name}
                     </option>
                   ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                <select
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select user</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <Input
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Enter location"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle ID</label>
                <Input
                  value={formData.vehicleId}
                  onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                  placeholder="Enter vehicle ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
                <Input
                  value={formData.vehicleNumber}
                  onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                  placeholder="Enter vehicle number"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter dispatch description"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate}>Create Dispatch</Button>
            </div>
          </div>
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Dispatch"
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as Dispatch['priority'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Dispatch['status'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                <select
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select user</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <Input
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle ID</label>
                <Input
                  value={formData.vehicleId}
                  onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
                <Input
                  value={formData.vehicleNumber}
                  onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate}>Update Dispatch</Button>
            </div>
          </div>
        </Modal>

        {/* View Modal */}
        <Modal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          title="Dispatch Details"
          size="lg"
        >
          {selectedDispatch && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <p className="text-gray-900">{selectedDispatch.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-gray-900">{selectedDispatch.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <Badge className={getStatusColor(selectedDispatch.status)}>
                    {selectedDispatch.status}
                  </Badge>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <Badge className={getPriorityColor(selectedDispatch.priority)}>
                    {selectedDispatch.priority}
                  </Badge>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                  <p className="text-gray-900">{typeof selectedDispatch.assignedTo === 'string' ? users.find(u => u._id === selectedDispatch.assignedTo)?.name || 'Unknown' : selectedDispatch.assignedTo.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <p className="text-gray-900">{new Date(selectedDispatch.dueDate).toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <p className="text-gray-900">{selectedDispatch.location}</p>
                </div>
                {selectedDispatch.vehicleNumber && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
                    <p className="text-gray-900">{selectedDispatch.vehicleNumber}</p>
                  </div>
                )}
                {isSuperAdmin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                    <p className="text-gray-900">{typeof selectedDispatch.companyId === 'string' ? companies.find(c => c._id === selectedDispatch.companyId)?.name || 'Unknown' : selectedDispatch.companyId.name}</p>
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-500">
                <p>Created: {new Date(selectedDispatch.createdAt).toLocaleString()}</p>
                <p>Updated: {new Date(selectedDispatch.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AppLayout>
  );
};

export default EnhancedDispatchPage;
