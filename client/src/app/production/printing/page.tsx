'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppLayout } from '@/components/layout/AppLayout';
import { 
  Printer, 
  Play, 
  Pause, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Eye,
  Settings,
  BarChart3,
  Factory,
  Package,
  Truck
} from 'lucide-react';
import { useGetProductionOrdersQuery } from '@/lib/api/productionApi';
import { 
  useStartStageMutation,
  useCompleteStageMutation,
  useHoldStageMutation,
  useResumeStageMutation
} from '@/lib/api/productionFlowApi';

export default function PrintingPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [startStage] = useStartStageMutation();
  const [completeStage] = useCompleteStageMutation();
  const [holdStage] = useHoldStageMutation();
  const [resumeStage] = useResumeStageMutation();

  const { data: ordersResp, isLoading, error, refetch } = useGetProductionOrdersQuery({ page: 1, limit: 50 });
  const orders = ordersResp?.data || [];

  // Derive printing processes from production orders (expects productionStages present on each order)
  const printingProcesses = (orders as any[]).flatMap((order: any) => {
    const stages: any[] = order?.productionStages || [];
    const printingStage = stages.find((s) => s.processType === 'printing');
    if (!printingStage) return [];
    return [{
      id: printingStage.stageId || `${order._id}-printing` ,
      batchNumber: printingStage.batchNumber || printingStage.stageName || 'Printing',
      productionOrderNumber: order.productionOrderNumber || order.orderNumber || order._id,
      productionOrderId: order._id,
      customerName: order.customerName || '',
      printingType: printingStage.printingType || printingStage.stageName || 'printing',
      status: printingStage.status,
      progress: printingStage.progress || 0,
      startTime: printingStage.timing?.actualStartTime || printingStage.timing?.plannedStartTime,
      expectedEndTime: printingStage.timing?.plannedEndTime,
      endTime: printingStage.timing?.actualEndTime,
      design: printingStage.design || '',
      colors: printingStage.colors || [],
      efficiency: printingStage.efficiency || 0,
    }];
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in_progress': return 'In Progress';
      case 'pending': return 'Pending';
      case 'on_hold': return 'On Hold';
      case 'rejected': return 'Rejected';
      default: return 'Unknown';
    }
  };

  const mirrorToProductionFlow = async (proc: any, nextStatus: string) => {
    const orderId = proc?.productionOrderId;
    if (!orderId) return;
    try {
      if (nextStatus === 'in_progress') {
        await resumeStage({ productionOrderId: orderId, stageNumber: 4, data: {} }).unwrap().catch(async () => {
          await startStage({ productionOrderId: orderId, stageNumber: 4, data: {} }).unwrap();
        });
      } else if (nextStatus === 'completed') {
        await completeStage({ productionOrderId: orderId, stageNumber: 4, data: {} }).unwrap();
      } else if (nextStatus === 'on_hold' || nextStatus === 'quality_hold') {
        await holdStage({ productionOrderId: orderId, stageNumber: 4, data: { reason: nextStatus } }).unwrap();
      }
    } catch (e) {
      console.error('Failed to sync printing stage', e);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64 text-gray-600">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 animate-spin" /> Loading printing data...
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64 text-red-600">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 mx-auto mb-3" />
              Failed to load printing data
              <div>
                <Button onClick={() => refetch()} variant="outline" className="mt-3">Retry</Button>
              </div>
            </div>
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Printing Process</h1>
          <p className="text-gray-600">Manage and monitor printing operations</p>
        </div>
        <Button className="flex items-center gap-2">
          <Printer className="h-4 w-4" />
          New Printing Process
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
                <p className="text-sm font-medium text-gray-600">Total Processes</p>
                <p className="text-2xl font-bold text-gray-900">{printingProcesses.length}</p>
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
                <p className="text-2xl font-bold text-gray-900">{printingProcesses.filter(p => p.status === 'completed').length}</p>
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
                <p className="text-2xl font-bold text-gray-900">{printingProcesses.filter(p => p.status === 'in_progress').length}</p>
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
                <p className="text-2xl font-bold text-gray-900">86%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="processes">Processes</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Processes */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Printing Processes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {printingProcesses.map((process) => (
                    <div key={process.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{process.batchNumber}</h3>
                          <Badge className={getStatusColor(process.status)}>
                            {getStatusText(process.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{process.productionOrderNumber} - {process.customerName}</p>
                        <p className="text-sm text-gray-500">Type: {process.printingType} | Design: {process.design}</p>
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{process.progress}%</span>
                          </div>
                          <Progress value={process.progress} className="h-2" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => mirrorToProductionFlow(process, process.status === 'pending' ? 'in_progress' : process.status === 'in_progress' ? 'completed' : 'pending')}>
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
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
                    <span className="text-sm font-medium">Active Processes</span>
                    <span className="text-2xl font-bold text-blue-600">3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Completed Today</span>
                    <span className="text-2xl font-bold text-green-600">2</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Average Cycle Time</span>
                    <span className="text-2xl font-bold text-purple-600">6.5h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Quality Pass Rate</span>
                    <span className="text-2xl font-bold text-green-600">96%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="processes">
          <Card>
            <CardHeader>
              <CardTitle>All Printing Processes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {printingProcesses.map((process) => (
                  <div key={process.id} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{process.batchNumber}</h3>
                        <p className="text-gray-600">{process.productionOrderNumber} - {process.customerName}</p>
                      </div>
                      <Badge className={getStatusColor(process.status)}>
                        {getStatusText(process.status)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Printing Type</p>
                        <p className="font-medium">{process.printingType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Design</p>
                        <p className="font-medium">{process.design}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Efficiency</p>
                        <p className="font-medium">{process.efficiency}%</p>
                      </div>
                    </div>

                    {(process.colors && process.colors.length > 0) && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-2">Colors</p>
                      <div className="flex gap-2">
                        {(process.colors || []).map((color: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {color}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex-1 mr-4">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{process.progress}%</span>
                        </div>
                        <Progress value={process.progress} className="h-2" />
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Printing Analytics</CardTitle>
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
              <CardTitle>Printing Settings</CardTitle>
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
      </div>
    </AppLayout>
  );
}
