'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppLayout } from '@/components/layout/AppLayout';
import { 
  Zap, 
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

export default function FinishingPage() {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - replace with actual API calls
  const finishingProcesses = [
    {
      id: '1',
      batchNumber: 'FIN-001',
      productionOrderNumber: 'PO-2024-001',
      customerName: 'ABC Textiles',
      finishingType: 'stenter',
      status: 'in_progress',
      progress: 70,
      startTime: '2024-01-15T11:00:00Z',
      expectedEndTime: '2024-01-15T20:00:00Z',
      temperature: { planned: 180, actual: 175 },
      efficiency: 82
    },
    {
      id: '2',
      batchNumber: 'FIN-002',
      productionOrderNumber: 'PO-2024-002',
      customerName: 'XYZ Fabrics',
      finishingType: 'coating',
      status: 'completed',
      progress: 100,
      startTime: '2024-01-14T10:00:00Z',
      endTime: '2024-01-14T17:30:00Z',
      temperature: { planned: 160, actual: 158 },
      efficiency: 89
    }
  ];

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

  return (
    <AppLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finishing Process</h1>
          <p className="text-gray-600">Manage and monitor finishing operations (Stenter, Coating)</p>
        </div>
        <Button className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          New Finishing Process
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
                <p className="text-2xl font-bold text-gray-900">16</p>
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
                <p className="text-2xl font-bold text-gray-900">12</p>
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
                <p className="text-2xl font-bold text-gray-900">3</p>
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
                <p className="text-2xl font-bold text-gray-900">85%</p>
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
                <CardTitle>Recent Finishing Processes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {finishingProcesses.map((process) => (
                    <div key={process.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{process.batchNumber}</h3>
                          <Badge className={getStatusColor(process.status)}>
                            {getStatusText(process.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{process.productionOrderNumber} - {process.customerName}</p>
                        <p className="text-sm text-gray-500">Type: {process.finishingType}</p>
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
                        <Button variant="outline" size="sm">
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
                    <span className="text-2xl font-bold text-purple-600">7.5h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Quality Pass Rate</span>
                    <span className="text-2xl font-bold text-green-600">92%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="processes">
          <Card>
            <CardHeader>
              <CardTitle>All Finishing Processes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {finishingProcesses.map((process) => (
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
                        <p className="text-sm text-gray-500">Finishing Type</p>
                        <p className="font-medium">{process.finishingType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Temperature</p>
                        <p className="font-medium">{process.temperature.actual}°C / {process.temperature.planned}°C</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Efficiency</p>
                        <p className="font-medium">{process.efficiency}%</p>
                      </div>
                    </div>

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
              <CardTitle>Finishing Analytics</CardTitle>
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
              <CardTitle>Finishing Settings</CardTitle>
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
