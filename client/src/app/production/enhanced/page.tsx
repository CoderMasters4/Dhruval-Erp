'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { DashboardHeader } from '@/components/ui/DashboardHeader'
import { ResponsiveContainer, ResponsiveGrid } from '@/components/ui/ResponsiveLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/badge'
import { 
  Factory, 
  Play, 
  Pause, 
  CheckCircle, 
  Clock,
  Search,
  Filter,
  Download,
  Eye,
  Plus,
  AlertCircle,
  Printer,
  Droplets,
  Scissors,
  Palette,
  Users,
  Building,
  Activity
} from 'lucide-react'

// Mock data for enhanced production tracking
const productionData = {
  stats: {
    activeJobs: 12,
    completedToday: 8,
    totalMachines: 15,
    efficiency: 87
  },
  realTimePrinting: [
    {
      id: 'PRINT-001',
      machine: 'Table Print Station 1',
      type: 'table',
      item: 'Floral Saree Design',
      batch: 'BATCH-2024-001',
      quantity: 100,
      completed: 65,
      operator: 'Ramesh Kumar',
      startTime: '09:30 AM',
      estimatedCompletion: '02:30 PM',
      status: 'printing'
    },
    {
      id: 'PRINT-002',
      machine: 'Digital Print Machine A',
      type: 'machine',
      item: 'African Cotton Pattern',
      batch: 'BATCH-2024-002',
      quantity: 500,
      completed: 320,
      operator: 'Suresh Patel',
      startTime: '08:00 AM',
      estimatedCompletion: '04:00 PM',
      status: 'printing'
    }
  ],
  jobWorkTracking: [
    {
      id: 'JOB-001',
      type: 'in_house',
      process: 'stitching',
      item: 'Saree Blouses',
      quantity: 200,
      completed: 150,
      worker: 'Tailoring Unit A',
      startDate: '2024-01-14',
      dueDate: '2024-01-18',
      status: 'in_progress'
    },
    {
      id: 'JOB-002',
      type: 'third_party',
      process: 'washing',
      item: 'Printed Fabrics',
      quantity: 1000,
      completed: 800,
      worker: 'Gujarat Wash House',
      startDate: '2024-01-12',
      dueDate: '2024-01-16',
      status: 'in_progress'
    }
  ],
  dailyProduction: [
    {
      unit: 'Unit 1',
      machine: 'Table Print 1',
      items: 45,
      target: 50,
      efficiency: 90
    },
    {
      unit: 'Unit 2',
      machine: 'Digital Print A',
      items: 320,
      target: 400,
      efficiency: 80
    },
    {
      unit: 'Unit 3',
      machine: 'Table Print 2',
      items: 38,
      target: 45,
      efficiency: 84
    }
  ]
}

export default function EnhancedProductionPage() {
  const [activeTab, setActiveTab] = useState('realtime')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'printing': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'delayed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'table': return <Palette className="h-4 w-4" />
      case 'machine': return <Printer className="h-4 w-4" />
      case 'in_house': return <Building className="h-4 w-4" />
      case 'third_party': return <Users className="h-4 w-4" />
      default: return <Factory className="h-4 w-4" />
    }
  }

  return (
    <AppLayout>
      <ResponsiveContainer className="space-y-6">
        {/* Header */}
        <DashboardHeader
          title="Enhanced Production Tracking"
          description={`Real-time production monitoring - ${currentTime.toLocaleTimeString()}`}
          icon={<Factory className="h-6 w-6 text-white" />}
        />

        {/* Stats Cards */}
        <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 4 }} gap="md">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {productionData.stats.activeJobs}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed Today</p>
                  <p className="text-2xl font-bold text-green-600">
                    {productionData.stats.completedToday}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Machines</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {productionData.stats.totalMachines}
                  </p>
                </div>
                <Factory className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Efficiency</p>
                  <p className="text-2xl font-bold text-green-600">
                    {productionData.stats.efficiency}%
                  </p>
                </div>
                <Activity className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </ResponsiveGrid>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('realtime')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'realtime'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Activity className="h-4 w-4 inline mr-2" />
            Real-time Printing
          </button>
          <button
            onClick={() => setActiveTab('jobwork')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'jobwork'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="h-4 w-4 inline mr-2" />
            Job Work Tracking
          </button>
          <button
            onClick={() => setActiveTab('daily')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'daily'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Factory className="h-4 w-4 inline mr-2" />
            Daily Summary
          </button>
        </div>

        {/* Tab Content */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {activeTab === 'realtime' && 'Real-time Printing Status'}
                {activeTab === 'jobwork' && 'Job Work Tracking'}
                {activeTab === 'daily' && 'Daily Production Summary'}
              </CardTitle>
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Real-time Printing Tab */}
            {activeTab === 'realtime' && (
              <div className="space-y-4">
                {productionData.realTimePrinting.map((job) => (
                  <div key={job.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getTypeIcon(job.type)}
                        <div>
                          <p className="font-medium text-gray-900">{job.machine}</p>
                          <p className="text-sm text-gray-600">{job.item}</p>
                          <p className="text-xs text-gray-500">Operator: {job.operator}</p>
                          <Badge className={getStatusColor(job.status)}>
                            {job.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{job.completed}/{job.quantity}</p>
                        <p className="text-sm text-gray-600">Started: {job.startTime}</p>
                        <p className="text-xs text-gray-500">ETA: {job.estimatedCompletion}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{Math.round((job.completed / job.quantity) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(job.completed / job.quantity) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Job Work Tracking Tab */}
            {activeTab === 'jobwork' && (
              <div className="space-y-4">
                {productionData.jobWorkTracking.map((job) => (
                  <div key={job.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getTypeIcon(job.type)}
                        <div>
                          <p className="font-medium text-gray-900">{job.process.toUpperCase()}</p>
                          <p className="text-sm text-gray-600">{job.item}</p>
                          <p className="text-xs text-gray-500">Worker: {job.worker}</p>
                          <Badge className={getStatusColor(job.status)}>
                            {job.type === 'in_house' ? 'In-house' : 'Third Party'}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{job.completed}/{job.quantity}</p>
                        <p className="text-sm text-gray-600">Due: {job.dueDate}</p>
                        <p className="text-xs text-gray-500">Started: {job.startDate}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{Math.round((job.completed / job.quantity) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${(job.completed / job.quantity) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Daily Summary Tab */}
            {activeTab === 'daily' && (
              <div className="space-y-4">
                {productionData.dailyProduction.map((unit, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Factory className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">{unit.unit}</p>
                        <p className="text-sm text-gray-600">{unit.machine}</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-gray-900">{unit.items}/{unit.target}</p>
                      <p className="text-sm text-gray-600">Target Achievement</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${unit.efficiency >= 85 ? 'text-green-600' : 'text-orange-600'}`}>
                        {unit.efficiency}%
                      </p>
                      <p className="text-sm text-gray-600">Efficiency</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </ResponsiveContainer>
    </AppLayout>
  )
}
