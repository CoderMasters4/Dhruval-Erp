'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppLayout } from '@/components/layout/AppLayout';
import { CrudModal } from '@/components/ui/CrudModal';
import { 
  useGetPreProcessingBatchesQuery,
  useUpdatePreProcessingStatusMutation,
  useCreatePreProcessingBatchMutation,
  PreProcessingBatch,
  CreatePreProcessingBatchRequest
} from '@/lib/api/preProcessingApi';
import { useGetCompaniesQuery } from '@/lib/api/greyFabricInwardApi';
import { 
  Settings, 
  Play, 
  Pause, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Eye,
  BarChart3,
  Factory,
  Package,
  Truck,
  Droplets,
  RefreshCw,
  Activity,
  Plus
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function PreProcessingPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<{
    companyId?: string;
    productionOrderId?: string;
    productionOrderNumber?: string;
    greyFabricInwardId?: string;
    grnNumber?: string;
    processType?: string;
    processName?: string;
    processDescription?: string;
    'inputMaterial.fabricType'?: string;
    'inputMaterial.fabricGrade'?: string;
    'inputMaterial.gsm'?: string;
    'inputMaterial.width'?: string;
    'inputMaterial.quantity'?: string;
    'inputMaterial.unit'?: string;
    'timing.plannedStartTime'?: string;
    'timing.plannedEndTime'?: string;
    notes?: string;
  }>({});

  // Use RTK Query hooks
  const { 
    data: batchesResponse, 
    isLoading: loading, 
    error,
    refetch 
  } = useGetPreProcessingBatchesQuery();
  
  const [updateStatus] = useUpdatePreProcessingStatusMutation();
  const [createBatch, { isLoading: creating }] = useCreatePreProcessingBatchMutation();
  const { data: companies = [] } = useGetCompaniesQuery();

  const batches = batchesResponse?.data || [];

  // Form submission handler
  const handleCreateBatch = async () => {
    try {
      if (!formData.processType || !formData.processName || !formData.companyId) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Transform form data to match API structure
      const batchData: CreatePreProcessingBatchRequest = {
        productionOrderId: formData.productionOrderId || '',
        productionOrderNumber: formData.productionOrderNumber || '',
        greyFabricInwardId: formData.greyFabricInwardId || '',
        grnNumber: formData.grnNumber || '',
        processType: (formData.processType as 'desizing' | 'bleaching' | 'scouring' | 'mercerizing' | 'combined') || 'desizing',
        processName: formData.processName || '',
        processDescription: formData.processDescription || '',
        inputMaterial: {
          fabricId: formData.greyFabricInwardId || '',
          fabricType: formData['inputMaterial.fabricType'] || '',
          fabricGrade: formData['inputMaterial.fabricGrade'] || '',
          gsm: Number(formData['inputMaterial.gsm']) || 0,
          width: Number(formData['inputMaterial.width']) || 0,
          color: 'Grey', // Default color for pre-processing
          quantity: Number(formData['inputMaterial.quantity']) || 0,
          unit: (formData['inputMaterial.unit'] as 'meters' | 'yards' | 'pieces') || 'meters',
          weight: Number(formData['inputMaterial.quantity']) * 0.5 || 0, // Estimate weight
        },
        chemicalRecipe: {
          recipeName: `${formData.processType} Recipe`,
          recipeVersion: '1.0',
          chemicals: [],
          totalRecipeCost: 0,
        },
        processParameters: {
          temperature: {
            min: 80,
            max: 120,
            actual: 100,
            unit: 'celsius',
          },
          pressure: {
            min: 1,
            max: 3,
            actual: 2,
            unit: 'bar',
          },
          ph: {
            min: 6,
            max: 8,
            actual: 7,
          },
          time: {
            planned: 120,
            unit: 'minutes',
          },
          speed: {
            planned: 50,
            unit: 'm/min',
          },
        },
        machineAssignment: {
          machineId: 'MACH-001',
          machineName: 'Pre-Processing Machine 1',
          machineType: 'Pre-Processing',
          capacity: 1000,
          efficiency: 85,
        },
        workerAssignment: {
          workers: [],
          supervisorId: 'SUP-001',
          supervisorName: 'Supervisor Name',
        },
        timing: {
          plannedStartTime: formData['timing.plannedStartTime'] ? new Date(formData['timing.plannedStartTime']).toISOString() : new Date().toISOString(),
          plannedEndTime: formData['timing.plannedEndTime'] ? new Date(formData['timing.plannedEndTime']).toISOString() : new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          plannedDuration: 120,
          setupTime: 30,
          cleaningTime: 15,
          downtime: 0,
        },
        qualityControl: {
          preProcessCheck: {
            fabricCondition: 'good',
            defects: [],
            notes: '',
            checkedBy: 'QC-001',
            checkedByName: 'Quality Checker',
            checkDate: new Date().toISOString(),
          },
          inProcessCheck: {
            temperature: 100,
            ph: 7,
            color: 'White',
            consistency: 'good',
            notes: '',
            checkedBy: 'QC-001',
            checkedByName: 'Quality Checker',
            checkTime: new Date().toISOString(),
          },
          postProcessCheck: {
            whiteness: 95,
            absorbency: 'good',
            strength: 100,
            shrinkage: 2,
            defects: [],
            qualityGrade: 'A',
            notes: '',
            checkedBy: 'QC-001',
            checkedByName: 'Quality Checker',
            checkDate: new Date().toISOString(),
          },
        },
        outputMaterial: {
          quantity: Number(formData['inputMaterial.quantity']) || 0,
          unit: (formData['inputMaterial.unit'] as 'meters' | 'yards' | 'pieces') || 'meters',
          weight: Number(formData['inputMaterial.quantity']) * 0.5 || 0,
          gsm: Number(formData['inputMaterial.gsm']) || 0,
          width: Number(formData['inputMaterial.width']) || 0,
          color: 'White',
          quality: 'A',
          defects: [],
          location: {
            warehouseId: 'WH-001',
            warehouseName: 'Main Warehouse',
          },
        },
        wasteManagement: {
          wasteGenerated: [],
          totalWasteCost: 0,
          environmentalCompliance: true,
        },
        costs: {
          chemicalCost: 0,
          laborCost: 0,
          machineCost: 0,
          utilityCost: 0,
          wasteDisposalCost: 0,
          totalCost: 0,
          costPerUnit: 0,
        },
        notes: formData.notes || '',
      };

      const response = await createBatch(batchData);
      
      if (response.data?.success) {
        toast.success('Pre-processing batch created successfully!');
        setShowCreateForm(false);
        setFormData({});
        refetch();
      } else {
        toast.error('Failed to create batch');
      }
    } catch (error) {
      console.error('Error creating batch:', error);
      toast.error('Failed to create batch');
    }
  };

  // Form fields configuration
  const formFields = [
    {
      name: 'companyId',
      label: 'Company',
      type: 'select' as const,
      required: true,
      options: companies.map(company => ({
        value: company._id,
        label: `${company.companyName} (${company.companyCode})`
      }))
    },
    {
      name: 'productionOrderId',
      label: 'Production Order ID (Optional)',
      type: 'text' as const,
      required: false,
      placeholder: 'Enter production order ID if available'
    },
    {
      name: 'productionOrderNumber',
      label: 'Production Order Number (Optional)',
      type: 'text' as const,
      required: false,
      placeholder: 'Enter production order number if available'
    },
    {
      name: 'greyFabricInwardId',
      label: 'Grey Fabric Inward ID (Optional)',
      type: 'text' as const,
      required: false,
      placeholder: 'Enter grey fabric inward ID if available'
    },
    {
      name: 'grnNumber',
      label: 'GRN Number (Optional)',
      type: 'text' as const,
      required: false,
      placeholder: 'Enter GRN number if available'
    },
    {
      name: 'processType',
      label: 'Process Type',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'desizing', label: 'Desizing' },
        { value: 'bleaching', label: 'Bleaching' },
        { value: 'scouring', label: 'Scouring' },
        { value: 'mercerizing', label: 'Mercerizing' },
        { value: 'combined', label: 'Combined Process' },
      ]
    },
    {
      name: 'processName',
      label: 'Process Name',
      type: 'text' as const,
      required: true,
      placeholder: 'Enter process name'
    },
    {
      name: 'processDescription',
      label: 'Process Description',
      type: 'textarea' as const,
      required: false,
      placeholder: 'Enter process description',
      rows: 3
    },
    {
      name: 'inputMaterial.fabricType',
      label: 'Fabric Type',
      type: 'text' as const,
      required: true,
      placeholder: 'e.g., Cotton, Polyester, Linen'
    },
    {
      name: 'inputMaterial.fabricGrade',
      label: 'Fabric Grade',
      type: 'text' as const,
      required: true,
      placeholder: 'e.g., Grade A, Grade B'
    },
    {
      name: 'inputMaterial.gsm',
      label: 'GSM (Grams per Square Meter)',
      type: 'number' as const,
      required: true,
      placeholder: 'Enter GSM value'
    },
    {
      name: 'inputMaterial.width',
      label: 'Fabric Width (inches)',
      type: 'number' as const,
      required: true,
      placeholder: 'Enter width in inches'
    },
    {
      name: 'inputMaterial.quantity',
      label: 'Quantity',
      type: 'number' as const,
      required: true,
      placeholder: 'Enter quantity'
    },
    {
      name: 'inputMaterial.unit',
      label: 'Unit',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'meters', label: 'Meters' },
        { value: 'yards', label: 'Yards' },
        { value: 'pieces', label: 'Pieces' },
      ]
    },
    {
      name: 'timing.plannedStartTime',
      label: 'Planned Start Time',
      type: 'datetime-local' as const,
      required: true,
      placeholder: 'Select start date and time'
    },
    {
      name: 'timing.plannedEndTime',
      label: 'Planned End Time',
      type: 'datetime-local' as const,
      required: true,
      placeholder: 'Select end date and time'
    },
    {
      name: 'notes',
      label: 'Notes',
      type: 'textarea' as const,
      required: false,
      placeholder: 'Enter any additional notes',
      rows: 3
    }
  ];

  const handleStatusToggle = async (batchId: string, currentStatus: string) => {
    try {
      setUpdatingStatus(batchId);
      
      // Determine next status based on current status
      let nextStatus: string;
      switch (currentStatus) {
        case 'pending':
          nextStatus = 'in_progress';
          break;
        case 'in_progress':
          nextStatus = 'completed';
          break;
        case 'completed':
          nextStatus = 'pending';
          break;
        case 'on_hold':
          nextStatus = 'in_progress';
          break;
        default:
          nextStatus = 'in_progress';
      }

      const response = await updateStatus({
        id: batchId,
        data: {
        status: nextStatus as any,
        notes: `Status changed from ${currentStatus} to ${nextStatus} via toggle`,
        changeReason: `Toggle status change from ${currentStatus} to ${nextStatus}`
      }
      });

      if (response.data?.success) {
        toast.success(`Status updated to ${getStatusText(nextStatus)}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'quality_hold': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in_progress': return 'In Progress';
      case 'pending': return 'Pending';
      case 'on_hold': return 'On Hold';
      case 'cancelled': return 'Cancelled';
      case 'quality_hold': return 'Quality Hold';
      default: return 'Unknown';
    }
  };

  const getProcessTypeColor = (processType: string) => {
    switch (processType) {
      case 'desizing': return 'bg-blue-100 text-blue-800';
      case 'bleaching': return 'bg-yellow-100 text-yellow-800';
      case 'scouring': return 'bg-green-100 text-green-800';
      case 'mercerizing': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };


  return (
    <AppLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pre-Processing</h1>
          <p className="text-gray-600">Desizing and bleaching operations</p>
        </div>
        <Button 
          className="flex items-center gap-2"
          onClick={() => setShowCreateForm(true)}
        >
          <Plus className="h-4 w-4" />
          Create New Batch
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Factory className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Batches</p>
                <p className="text-2xl font-bold text-gray-900">{batches.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {batches.filter(b => b.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {batches.filter(b => b.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Efficiency</p>
                <p className="text-2xl font-bold text-gray-900">
                  {batches.length > 0 
                    ? Math.round(batches.reduce((sum, b) => sum + (b.machineAssignment?.efficiency || 0), 0) / batches.length)
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="batches">Batches</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Batches */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Recent Pre-Processing Batches
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => refetch()}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-500">Loading batches...</span>
                  </div>
                ) : (
                <div className="space-y-4">
                    {batches.slice(0, 5).map((batch) => (
                      <div key={batch._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{batch.batchNumber}</h3>
                          <Badge className={getStatusColor(batch.status)}>
                            {getStatusText(batch.status)}
                          </Badge>
                          <Badge className={getProcessTypeColor(batch.processType)}>
                            {batch.processType}
                          </Badge>
                        </div>
                          <p className="text-sm text-gray-600">{batch.productionOrderNumber}</p>
                          <p className="text-sm text-gray-500">
                            Temperature: {batch.processParameters?.temperature?.actual || 0}°C / {batch.processParameters?.temperature?.max || 0}°C
                          </p>
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{batch.progress}%</span>
                          </div>
                          <Progress value={batch.progress} className="h-2" />
                        </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Status:</span>
                            <Switch
                              checked={batch.status === 'in_progress' || batch.status === 'completed'}
                              onCheckedChange={() => handleStatusToggle(batch._id, batch.status)}
                              disabled={updatingStatus === batch._id}
                            />
                            {updatingStatus === batch._id && (
                              <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />
                            )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                          </div>
                      </div>
                    </div>
                  ))}
                    {batches.length === 0 && (
                      <div className="text-center py-8">
                        <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No pre-processing batches found</p>
                        <Button className="mt-4" onClick={() => {/* Add new batch logic */}}>
                          Create First Batch
                        </Button>
                      </div>
                    )}
                </div>
                )}
              </CardContent>
            </Card>

            {/* Process Status */}
            <Card>
              <CardHeader>
                <CardTitle>Process Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Active Batches</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {batches.filter(b => b.status === 'in_progress').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Completed Today</span>
                    <span className="text-2xl font-bold text-green-600">
                      {batches.filter(b => {
                        const today = new Date().toDateString();
                        return b.status === 'completed' && 
                               new Date(b.updatedAt).toDateString() === today;
                      }).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Pending Batches</span>
                    <span className="text-2xl font-bold text-yellow-600">
                      {batches.filter(b => b.status === 'pending').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">On Hold</span>
                    <span className="text-2xl font-bold text-orange-600">
                      {batches.filter(b => b.status === 'on_hold').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="batches">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                All Pre-Processing Batches
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => refetch()}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-500">Loading batches...</span>
                </div>
              ) : (
              <div className="space-y-4">
                  {batches.map((batch) => (
                    <div key={batch._id} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{batch.batchNumber}</h3>
                          <p className="text-gray-600">{batch.productionOrderNumber}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Status:</span>
                            <Switch
                              checked={batch.status === 'in_progress' || batch.status === 'completed'}
                              onCheckedChange={() => handleStatusToggle(batch._id, batch.status)}
                              disabled={updatingStatus === batch._id}
                            />
                            {updatingStatus === batch._id && (
                              <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />
                            )}
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getStatusColor(batch.status)}>
                          {getStatusText(batch.status)}
                        </Badge>
                        <Badge className={getProcessTypeColor(batch.processType)}>
                          {batch.processType}
                        </Badge>
                          </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Process Type</p>
                        <p className="font-medium">{batch.processType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Temperature</p>
                          <p className="font-medium">
                            {batch.processParameters?.temperature?.actual || 0}°C / {batch.processParameters?.temperature?.max || 0}°C
                          </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Efficiency</p>
                          <p className="font-medium">{batch.machineAssignment?.efficiency || 0}%</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex-1 mr-4">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{batch.progress}%</span>
                        </div>
                        <Progress value={batch.progress} className="h-2" />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                      {/* Status Change Log */}
                      {batch.statusChangeLog && batch.statusChangeLog.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Status History</h4>
                          <div className="space-y-1">
                            {batch.statusChangeLog.slice(-3).map((log, index) => (
                              <div key={index} className="text-xs text-gray-500">
                                <span className="font-medium">{log.changedByName}</span> changed status from{' '}
                                <span className="font-medium">{log.fromStatus}</span> to{' '}
                                <span className="font-medium">{log.toStatus}</span> on{' '}
                                <span className="font-medium">
                                  {new Date(log.changeDate).toLocaleString()}
                                </span>
                                {log.notes && (
                                  <span className="block text-gray-400 mt-1">{log.notes}</span>
                                )}
                  </div>
                ))}
              </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {batches.length === 0 && (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No pre-processing batches found</p>
                      <Button className="mt-4" onClick={() => {/* Add new batch logic */}}>
                        Create First Batch
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Pre-Processing Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Analytics charts will be implemented here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Pre-Processing Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Settings configuration will be implemented here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create New Batch Modal */}
      <CrudModal
        isOpen={showCreateForm}
        onClose={() => {
          setShowCreateForm(false);
          setFormData({});
        }}
        title="Create New Pre-Processing Batch"
        fields={formFields}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleCreateBatch}
        isLoading={creating}
        submitText="Create Batch"
      />
      </div>
    </AppLayout>
  );
}
