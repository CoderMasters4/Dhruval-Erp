'use client'

import { useState } from 'react'
import { useSelector } from 'react-redux'
import {
  Factory,
  Plus,
  Search,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Clock,
  Target,
  BarChart3,
  Settings
} from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { OperationsHeader } from '@/components/ui/PageHeader'
import { selectCurrentUser, selectIsSuperAdmin } from '@/lib/features/auth/authSlice'
import clsx from 'clsx'

// Mock production data
const mockProductionLines = [
  {
    id: 'line-001',
    name: 'Production Line A',
    status: 'running',
    currentProduct: 'Cotton Fabric',
    targetOutput: 1000,
    currentOutput: 750,
    efficiency: 94.5,
    operators: 8,
    shift: 'Day Shift',
    startTime: '06:00',
    endTime: '14:00'
  },
  {
    id: 'line-002',
    name: 'Production Line B',
    status: 'maintenance',
    currentProduct: 'Silk Blend',
    targetOutput: 800,
    currentOutput: 0,
    efficiency: 0,
    operators: 0,
    shift: 'Maintenance',
    startTime: '10:00',
    endTime: '12:00'
  },
  {
    id: 'line-003',
    name: 'Production Line C',
    status: 'running',
    currentProduct: 'Polyester Mix',
    targetOutput: 1200,
    currentOutput: 1150,
    efficiency: 98.2,
    operators: 10,
    shift: 'Day Shift',
    startTime: '06:00',
    endTime: '14:00'
  }
]

const mockQualityMetrics = {
  passRate: 98.2,
  defectRate: 1.8,
  pendingQC: 8,
  completedQC: 45,
  rejectedBatches: 2
}

export default function ProductionPage() {
  const user = useSelector(selectCurrentUser)
  const isSuperAdmin = useSelector(selectIsSuperAdmin)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredLines = mockProductionLines.filter(line => {
    const matchesSearch = line.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         line.currentProduct.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || line.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 text-sm font-medium rounded-full flex items-center"
    switch (status) {
      case 'running':
        return `${baseClasses} bg-green-100 text-green-600`
      case 'paused':
        return `${baseClasses} bg-yellow-100 text-yellow-600`
      case 'maintenance':
        return `${baseClasses} bg-red-100 text-red-600`
      case 'idle':
        return `${baseClasses} bg-gray-100 text-gray-600`
      default:
        return `${baseClasses} bg-gray-100 text-gray-600`
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Play className="h-4 w-4 mr-1" />
      case 'paused':
        return <Pause className="h-4 w-4 mr-1" />
      case 'maintenance':
        return <Settings className="h-4 w-4 mr-1" />
      default:
        return <AlertCircle className="h-4 w-4 mr-1" />
    }
  }

  const totalOutput = mockProductionLines.reduce((sum, line) => sum + line.currentOutput, 0)
  const totalTarget = mockProductionLines.reduce((sum, line) => sum + line.targetOutput, 0)
  const overallEfficiency = totalTarget > 0 ? (totalOutput / totalTarget) * 100 : 0
  const activeLines = mockProductionLines.filter(line => line.status === 'running').length

  return (
    <AppLayout>
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
        {/* New Header */}
        <OperationsHeader
          title="Production Management"
          description="Monitor production lines and track manufacturing progress"
          icon={<Factory className="h-6 w-6 text-white" />}
          showRefresh={true}
          onRefresh={() => window.location.reload()}
        >
          <button className="flex items-center px-4 py-2 bg-white text-emerald-600 rounded-lg hover:bg-emerald-50 border border-white transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            New Work Order
          </button>
        </OperationsHeader>

        {/* Production Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border-2 border-sky-500 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">Active Lines</p>
                <p className="text-2xl font-bold text-green-600">{activeLines}/{mockProductionLines.length}</p>
              </div>
              <Factory className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl border-2 border-sky-500 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">Today's Output</p>
                <p className="text-2xl font-bold text-sky-600">{totalOutput.toLocaleString()}</p>
              </div>
              <Target className="h-8 w-8 text-sky-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl border-2 border-sky-500 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">Efficiency</p>
                <p className="text-2xl font-bold text-green-600">{overallEfficiency.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl border-2 border-sky-500 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">Quality Rate</p>
                <p className="text-2xl font-bold text-green-600">{mockQualityMetrics.passRate}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Quality Metrics */}
        <div className="bg-white rounded-xl border-2 border-sky-500 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-black mb-4">Quality Control Metrics</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{mockQualityMetrics.passRate}%</p>
              <p className="text-sm text-black opacity-75">Pass Rate</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{mockQualityMetrics.defectRate}%</p>
              <p className="text-sm text-black opacity-75">Defect Rate</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{mockQualityMetrics.pendingQC}</p>
              <p className="text-sm text-black opacity-75">Pending QC</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{mockQualityMetrics.completedQC}</p>
              <p className="text-sm text-black opacity-75">Completed QC</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{mockQualityMetrics.rejectedBatches}</p>
              <p className="text-sm text-black opacity-75">Rejected</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border-2 border-sky-500 p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sky-500" />
                <input
                  type="text"
                  placeholder="Search production lines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-sky-200 rounded-lg focus:outline-none focus:border-sky-500 bg-white text-black"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border-2 border-sky-200 rounded-lg focus:outline-none focus:border-sky-500 bg-white text-black"
              >
                <option value="all">All Status</option>
                <option value="running">Running</option>
                <option value="paused">Paused</option>
                <option value="maintenance">Maintenance</option>
                <option value="idle">Idle</option>
              </select>
            </div>
          </div>
        </div>

        {/* Production Lines */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {filteredLines.map((line) => (
            <div key={line.id} className="bg-white rounded-xl border-2 border-sky-500 p-6">
              {/* Line Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-black">{line.name}</h3>
                  <p className="text-sm text-black opacity-75">{line.currentProduct}</p>
                </div>
                <span className={getStatusBadge(line.status)}>
                  {getStatusIcon(line.status)}
                  {line.status}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-black mb-1">
                  <span>Progress</span>
                  <span>{line.currentOutput} / {line.targetOutput}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-sky-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((line.currentOutput / line.targetOutput) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-sky-50 rounded-lg">
                  <p className="text-lg font-bold text-sky-600">{line.efficiency}%</p>
                  <p className="text-xs text-black opacity-75">Efficiency</p>
                </div>
                <div className="text-center p-3 bg-sky-50 rounded-lg">
                  <p className="text-lg font-bold text-black">{line.operators}</p>
                  <p className="text-xs text-black opacity-75">Operators</p>
                </div>
              </div>

              {/* Shift Info */}
              <div className="flex items-center justify-between text-sm text-black opacity-75">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{line.shift}</span>
                </div>
                <span>{line.startTime} - {line.endTime}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-sky-200">
                {line.status === 'running' ? (
                  <button className="flex items-center px-3 py-1 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition-colors text-sm">
                    <Pause className="h-3 w-3 mr-1" />
                    Pause
                  </button>
                ) : line.status === 'paused' ? (
                  <button className="flex items-center px-3 py-1 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors text-sm">
                    <Play className="h-3 w-3 mr-1" />
                    Resume
                  </button>
                ) : null}
                
                <button className="flex items-center px-3 py-1 bg-sky-100 text-sky-600 rounded-lg hover:bg-sky-200 transition-colors text-sm">
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Details
                </button>
                
                <button className="flex items-center px-3 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                  <Settings className="h-3 w-3 mr-1" />
                  Settings
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredLines.length === 0 && (
          <div className="bg-white rounded-xl border-2 border-sky-500 p-6 text-center">
            <Factory className="h-12 w-12 text-sky-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-black mb-2">No Production Lines Found</h3>
            <p className="text-black opacity-75">
              {searchTerm || statusFilter !== 'all'
                ? 'No production lines match your search criteria.'
                : 'No production lines have been set up yet.'}
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
