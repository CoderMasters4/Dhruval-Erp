'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { AppLayout } from '@/components/layout/AppLayout';
import { 
  ArrowLeft,
  Settings, 
  Play, 
  Pause, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  BarChart3,
  Factory,
  Package,
  Droplets,
  RefreshCw,
  Activity,
  Edit,
  Save,
  X,
  Eye,
  Calendar,
  Users,
  Thermometer,
  Gauge,
  Timer,
  Zap,
  Target,
  TrendingUp,
  DollarSign,
  FileText,
  Image,
  Tag
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import ComprehensiveStatusManagement from '@/components/production/ComprehensiveStatusManagement';

interface BatchDetails {
  _id: string;
  batchNumber: string;
  processType: string;
  processName: string;
  processDescription: string;
  status: string;
  progress: number;
  inputMaterials: any[];
  chemicalRecipe: any;
  processParameters: any;
  machineAssignment: any;
  workerAssignment: any;
  timing: any;
  qualityControl: any;
  outputMaterial: any;
  wasteManagement: any;
  costs: any;
  notes: string;
  images: string[];
  documents: string[];
  tags: string[];
  statusChangeLog?: Array<{
    fromStatus: string;
    toStatus: string;
    changedBy: string;
    changedByName: string;
    changeDate: string;
    notes?: string;
    processData?: any;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function DyeingBatchDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const batchId = params.batchId as string;
  
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [formData, setFormData] = useState<any>({});

  // Mock data for now - replace with actual RTK Query when dyeing API is ready
  const [batch, setBatch] = useState<BatchDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Status options
  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
    { value: 'on_hold', label: 'On Hold', color: 'bg-orange-100 text-orange-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
    { value: 'quality_hold', label: 'Quality Hold', color: 'bg-purple-100 text-purple-800' }
  ];

  // Update form data when batch data changes
  useEffect(() => {
    if (batch) {
      setFormData(batch);
    }
  }, [batch]);

  const handleStatusChange = async (newStatus: string, notes?: string, processData?: any) => {
    try {
      // Mock status update - replace with actual RTK Query mutation
      setBatch(prev => prev ? { ...prev, status: newStatus } : null);
      toast.success(`Status updated to ${statusOptions.find(s => s.value === newStatus)?.label}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleSave = async () => {
    try {
      // Mock batch update - replace with actual RTK Query mutation
      setBatch(formData);
      setEditing(false);
      toast.success('Batch updated successfully');
    } catch (error) {
      console.error('Error updating batch:', error);
      toast.error('Failed to update batch');
    }
  };

  const getStatusColor = (status: string) => {
    return statusOptions.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'in_progress': return <Play className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'on_hold': return <Pause className="h-4 w-4" />;
      case 'cancelled': return <X className="h-4 w-4" />;
      case 'quality_hold': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  // Mock data for demonstration
  useEffect(() => {
    setBatch({
      _id: batchId,
      batchNumber: `DY-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-001`,
      processType: 'dyeing',
      processName: 'Cotton Dyeing Process',
      processDescription: 'Reactive dyeing process for cotton fabric',
      status: 'pending',
      progress: 0,
      inputMaterials: [],
      chemicalRecipe: { recipeName: 'Reactive Dye Recipe', recipeVersion: '1.0', chemicals: [], totalRecipeCost: 0 },
      processParameters: {},
      machineAssignment: {},
      workerAssignment: {},
      timing: { plannedStartTime: new Date().toISOString(), plannedEndTime: new Date().toISOString(), plannedDuration: 120 },
      qualityControl: {},
      outputMaterial: {},
      wasteManagement: {},
      costs: {},
      notes: '',
      images: [],
      documents: [],
      tags: [],
      statusChangeLog: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }, [batchId]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading batch details...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
            <p className="text-gray-600">Failed to load batch details</p>
            <Button onClick={() => router.push('/production/dyeing')} className="mt-4">
              Back to Dyeing
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!batch) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
            <p className="text-gray-600">Batch not found</p>
            <Button onClick={() => router.push('/production/dyeing')} className="mt-4">
              Back to Dyeing
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/production/dyeing')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{batch.batchNumber}</h1>
              <p className="text-gray-600">{batch.processName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={`${getStatusColor(batch.status)} flex items-center gap-1`}>
              {getStatusIcon(batch.status)}
              {statusOptions.find(s => s.value === batch.status)?.label}
            </Badge>
            {editing ? (
              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button onClick={() => setEditing(true)} className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{batch.progress}%</span>
              </div>
              <Progress value={batch.progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Comprehensive Status Management */}
        <ComprehensiveStatusManagement
          currentStatus={batch.status}
          processType="dyeing"
          batchId={batch._id}
          onStatusChange={handleStatusChange}
          statusChangeLog={batch.statusChangeLog || []}
        />

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="process">Process</TabsTrigger>
            <TabsTrigger value="quality">Quality</TabsTrigger>
            <TabsTrigger value="costs">Costs</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Process Type</Label>
                    <p className="text-sm">{batch.processType}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Process Name</Label>
                    <p className="text-sm">{batch.processName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Description</Label>
                    <p className="text-sm">{batch.processDescription || 'No description'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Timing Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Timing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Planned Start</Label>
                    <p className="text-sm">{new Date(batch.timing.plannedStartTime).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Planned End</Label>
                    <p className="text-sm">{new Date(batch.timing.plannedEndTime).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Duration</Label>
                    <p className="text-sm">{batch.timing.plannedDuration} minutes</p>
                  </div>
                </CardContent>
              </Card>

              {/* Machine Assignment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Factory className="h-5 w-5" />
                    Machine Assignment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Machine Name</Label>
                    <p className="text-sm">Dyeing Machine #1</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Machine Type</Label>
                    <p className="text-sm">Jet Dyeing Machine</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Capacity</Label>
                    <p className="text-sm">500 kg</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Other tabs content would go here */}
          <TabsContent value="materials">
            <Card>
              <CardHeader>
                <CardTitle>Materials</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Materials information will be displayed here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="process">
            <Card>
              <CardHeader>
                <CardTitle>Process Parameters</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Process parameters will be displayed here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quality">
            <Card>
              <CardHeader>
                <CardTitle>Quality Control</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Quality control information will be displayed here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="costs">
            <Card>
              <CardHeader>
                <CardTitle>Cost Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Cost analysis will be displayed here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle>Process Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Process timeline will be displayed here</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
