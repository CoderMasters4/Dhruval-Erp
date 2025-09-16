'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppLayout } from '@/components/layout/AppLayout';
import { 
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
  Plus,
  Eye,
  ExternalLink,
  Zap
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function DyeingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for demonstration
  const batches = [
    {
      _id: 'dye-001',
      batchNumber: 'DY-20250916-001',
      processName: 'Cotton Reactive Dyeing',
      status: 'pending',
      progress: 0,
      processType: 'dyeing',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'dye-002',
      batchNumber: 'DY-20250916-002',
      processName: 'Polyester Disperse Dyeing',
      status: 'in_progress',
      progress: 45,
      processType: 'dyeing',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'dye-003',
      batchNumber: 'DY-20250916-003',
      processName: 'Cotton Vat Dyeing',
      status: 'completed',
      progress: 100,
      processType: 'dyeing',
      createdAt: new Date().toISOString()
    }
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
    { value: 'on_hold', label: 'On Hold', color: 'bg-orange-100 text-orange-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
    { value: 'quality_hold', label: 'Quality Hold', color: 'bg-purple-100 text-purple-800' }
  ];

  const getStatusColor = (status: string) => {
    return statusOptions.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    return statusOptions.find(s => s.value === status)?.label || status;
  };

  const getProcessTypeColor = (type: string) => {
    switch (type) {
      case 'dyeing': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewDetails = (batch: any) => {
    router.push(`/production/dyeing/${batch._id}`);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dyeing Process</h1>
            <p className="text-gray-600">Manage dyeing batches and processes</p>
          </div>
          <Button
            onClick={() => toast.success('Create new dyeing batch')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create New Batch
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Batches</p>
                  <p className="text-2xl font-bold text-gray-900">{batches.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Droplets className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {batches.filter(b => b.status === 'in_progress').length}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Play className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {batches.filter(b => b.status === 'completed').length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">On Hold</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {batches.filter(b => b.status === 'on_hold').length}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Pause className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="batches">Batches</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {batches.slice(0, 3).map((batch) => (
                      <div key={batch._id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="p-2 bg-purple-100 rounded-full">
                          <Zap className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{batch.batchNumber}</p>
                          <p className="text-xs text-gray-500">{batch.processName}</p>
                        </div>
                        <Badge className={getStatusColor(batch.status)}>
                          {getStatusText(batch.status)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Process Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Process Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Pending Batches</span>
                      <span className="font-bold text-yellow-600">
                        {batches.filter(b => b.status === 'pending').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Batches</span>
                      <span className="font-bold text-blue-600">
                        {batches.filter(b => b.status === 'in_progress').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Completed Today</span>
                      <span className="font-bold text-green-600">
                        {batches.filter(b => b.status === 'completed').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Quality Issues</span>
                      <span className="font-bold text-red-600">
                        {batches.filter(b => b.status === 'quality_hold').length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Batches Tab */}
          <TabsContent value="batches" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Dyeing Batches</h2>
              <Button
                onClick={() => toast.success('Create new batch')}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Batch
              </Button>
            </div>

            {batches.length > 0 ? (
              <div className="space-y-4">
                {batches.map((batch) => (
                  <Card key={batch._id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
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
                          <p className="text-gray-600 mb-2">{batch.processName}</p>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>Created: {new Date(batch.createdAt).toLocaleDateString()}</span>
                            <span>Progress: {batch.progress}%</span>
                          </div>
                          <div className="mt-2">
                            <Progress value={batch.progress} className="h-2" />
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(batch)}
                            className="flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Droplets className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Dyeing Batches</h3>
                    <p className="text-gray-500 mb-4">Get started by creating your first dyeing batch</p>
                    <Button
                      onClick={() => toast.success('Create new batch')}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Create First Batch
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Dyeing Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Coming Soon</h3>
                  <p className="text-gray-500">Detailed analytics and reports will be available here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}