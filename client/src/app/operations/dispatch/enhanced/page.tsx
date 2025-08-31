'use client'

import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { 
  Truck, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit,
  MapPin,
  Clock,
  Package,
  User,
  Phone,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Navigation,
  Calendar,
  BarChart3,
  TrendingUp,
  Download,
  Upload,
  RefreshCw,
  Settings,
  Globe,
  Route,
  Timer,
  PackageCheck,
  AlertCircle,
  FileText,
  Hash,
  Car,
  Plane,
  Ship,
  Train
} from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageHeader } from '@/components/ui/PageHeader'
import { selectCurrentUser, selectIsSuperAdmin } from '@/lib/features/auth/authSlice'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import clsx from 'clsx'

// Enhanced Dispatch Interfaces
interface DispatchItem {
  _id: string
  orderNumber: string
  customerName: string
  customerAddress: string
  packageCount: number
  packageWeight: number
  packageDimensions: {
    length: number
    width: number
    height: number
  }
  dispatchDate: string
  courierName: string
  courierTrackingNumber?: string
  awbNumber?: string
  lrNumber?: string
  vehicleNumber?: string
  driverName?: string
  driverPhone?: string
  estimatedDeliveryDate: string
  actualDeliveryDate?: string
  deliveryStatus: 'pending' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned'
  deliveryNotes?: string
  proofOfDelivery?: string[]
  currentLocation?: string
  lastUpdate?: string
  companyId: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

interface CourierCompany {
  _id: string
  name: string
  code: string
  contactPerson: string
  phone: string
  email: string
  address: string
  serviceType: 'domestic' | 'international' | 'both'
  rating: number
  activeOrders: number
  companyId: string
}

interface DispatchStats {
  totalDispatches: number
  pendingDispatches: number
  inTransitDispatches: number
  deliveredDispatches: number
  failedDeliveries: number
  returnedDispatches: number
  totalRevenue: number
  averageDeliveryTime: number
  onTimeDeliveries: number
  delayedDeliveries: number
  dispatchesByCourier: Array<{
    courierName: string
    count: number
    percentage: number
  }>
  dispatchesByStatus: Array<{
    status: string
    count: number
    percentage: number
  }>
}

// Mock data for enhanced dispatch
const mockDispatchData = {
  stats: {
    totalDispatches: 156,
    pendingDispatches: 23,
    inTransitDispatches: 89,
    deliveredDispatches: 38,
    failedDeliveries: 3,
    returnedDispatches: 3,
    totalRevenue: 1250000,
    averageDeliveryTime: 2.5,
    onTimeDeliveries: 35,
    delayedDeliveries: 3,
    dispatchesByCourier: [
      { courierName: 'Blue Dart Express', count: 45, percentage: 29 },
      { courierName: 'DTDC Express', count: 32, percentage: 21 },
      { courierName: 'FedEx', count: 28, percentage: 18 },
      { courierName: 'DHL', count: 25, percentage: 16 },
      { courierName: 'Others', count: 26, percentage: 16 }
    ],
    dispatchesByStatus: [
      { status: 'pending', count: 23, percentage: 15 },
      { status: 'in_transit', count: 89, percentage: 57 },
      { status: 'delivered', count: 38, percentage: 24 },
      { status: 'failed', count: 3, percentage: 2 },
      { status: 'returned', count: 3, percentage: 2 }
    ]
  },
  dispatches: [
    {
      _id: 'DISP-001',
      orderNumber: 'ORD-2024-001',
      customerName: 'ABC Textiles Ltd.',
      customerAddress: 'Mumbai, Maharashtra',
      packageCount: 5,
      packageWeight: 250,
      packageDimensions: { length: 100, width: 80, height: 60 },
      dispatchDate: '2024-01-15T10:00:00Z',
      courierName: 'Blue Dart Express',
      courierTrackingNumber: 'BD123456789',
      awbNumber: 'AWB123456789',
      lrNumber: 'LR987654321',
      vehicleNumber: 'MH01AB1234',
      driverName: 'Rajesh Kumar',
      driverPhone: '+91-9876543210',
      estimatedDeliveryDate: '2024-01-17T18:00:00Z',
      deliveryStatus: 'in_transit' as const,
      currentLocation: 'Pune, Maharashtra',
      lastUpdate: '2024-01-16T14:30:00Z',
      companyId: 'company-001',
      createdBy: 'user-001',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-16T14:30:00Z'
    },
    {
      _id: 'DISP-002',
      orderNumber: 'ORD-2024-002',
      customerName: 'XYZ Fabrics Pvt. Ltd.',
      customerAddress: 'Delhi, NCR',
      packageCount: 3,
      packageWeight: 180,
      packageDimensions: { length: 90, width: 70, height: 50 },
      dispatchDate: '2024-01-14T14:00:00Z',
      courierName: 'DTDC Express',
      courierTrackingNumber: 'DT123456789',
      awbNumber: 'AWB987654321',
      lrNumber: 'LR123456789',
      vehicleNumber: 'DL02CD5678',
      driverName: 'Amit Singh',
      driverPhone: '+91-9876543211',
      estimatedDeliveryDate: '2024-01-16T18:00:00Z',
      deliveryStatus: 'delivered' as const,
      actualDeliveryDate: '2024-01-16T16:30:00Z',
      deliveryNotes: 'Delivered successfully to reception',
      companyId: 'company-001',
      createdBy: 'user-001',
      createdAt: '2024-01-14T14:00:00Z',
      updatedAt: '2024-01-16T16:30:00Z'
    }
  ],
  couriers: [
    {
      _id: 'COUR-001',
      name: 'Blue Dart Express',
      code: 'BLUEDART',
      contactPerson: 'Vikram Mehta',
      phone: '+91-22-2389 1111',
      email: 'info@bluedart.com',
      address: 'Mumbai, Maharashtra',
      serviceType: 'both',
      rating: 4.5,
      activeOrders: 45,
      companyId: 'company-001'
    },
    {
      _id: 'COUR-002',
      name: 'DTDC Express',
      code: 'DTDC',
      contactPerson: 'Sanjay Patel',
      phone: '+91-80-2222 3333',
      email: 'info@dtdc.com',
      address: 'Bangalore, Karnataka',
      serviceType: 'domestic',
      rating: 4.2,
      activeOrders: 32,
      companyId: 'company-001'
    }
  ]
}

export default function EnhancedDispatchPage() {
  const user = useSelector(selectCurrentUser)
  const isSuperAdmin = useSelector(selectIsSuperAdmin)
  
  // State management
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [courierFilter, setCourierFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedDispatch, setSelectedDispatch] = useState<DispatchItem | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update time every minute for real-time tracking
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  const stats = mockDispatchData.stats
  const dispatches = mockDispatchData.dispatches
  const couriers = mockDispatchData.couriers

  // Filter dispatches based on search and filters
  const filteredDispatches = dispatches.filter(dispatch => {
    const matchesSearch = !searchTerm || 
      dispatch.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispatch.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispatch.courierName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || dispatch.deliveryStatus === statusFilter
    const matchesCourier = courierFilter === 'all' || dispatch.courierName === courierFilter
    
    return matchesSearch && matchesStatus && matchesCourier
  })

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full flex items-center"
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'in_transit':
        return `${baseClasses} bg-blue-100 text-blue-800`
      case 'out_for_delivery':
        return `${baseClasses} bg-orange-100 text-orange-800`
      case 'delivered':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'failed':
        return `${baseClasses} bg-red-100 text-red-800`
      case 'returned':
        return `${baseClasses} bg-pink-100 text-pink-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'in_transit':
        return <Truck className="h-4 w-4" />
      case 'out_for_delivery':
        return <Navigation className="h-4 w-4" />
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />
      case 'failed':
        return <XCircle className="h-4 w-4" />
      case 'returned':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getCourierIcon = (courierName: string) => {
    if (courierName.toLowerCase().includes('air') || courierName.toLowerCase().includes('plane')) {
      return <Plane className="h-4 w-4" />
    } else if (courierName.toLowerCase().includes('ship') || courierName.toLowerCase().includes('sea')) {
      return <Ship className="h-4 w-4" />
    } else if (courierName.toLowerCase().includes('train') || courierName.toLowerCase().includes('rail')) {
      return <Train className="h-4 w-4" />
    } else {
      return <Truck className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const getDeliveryProgress = (dispatch: DispatchItem) => {
    const dispatchDate = new Date(dispatch.dispatchDate)
    const estimatedDate = new Date(dispatch.estimatedDeliveryDate)
    const now = currentTime
    
    if (dispatch.deliveryStatus === 'delivered') return 100
    if (dispatch.deliveryStatus === 'failed' || dispatch.deliveryStatus === 'returned') return 0
    
    const totalTime = estimatedDate.getTime() - dispatchDate.getTime()
    const elapsedTime = now.getTime() - dispatchDate.getTime()
    
    if (totalTime <= 0) return 0
    return Math.min(Math.max((elapsedTime / totalTime) * 100, 0), 100)
  }

  const getDeliveryStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600'
      case 'in_transit':
        return 'text-blue-600'
      case 'out_for_delivery':
        return 'text-orange-600'
      case 'delivered':
        return 'text-green-600'
      case 'failed':
        return 'text-red-600'
      case 'returned':
        return 'text-pink-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <AppLayout>
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Enhanced Dispatch Management"
          description={`Comprehensive dispatch tracking and courier management (${dispatches.length} dispatches)`}
          icon={<Truck className="h-6 w-6 text-white" />}
          showRefresh={true}
          onRefresh={() => window.location.reload()}
        >
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              onClick={() => {/* Export functionality */}}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-white text-emerald-600 hover:bg-emerald-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Dispatch
            </Button>
          </div>
        </PageHeader>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-2 border-sky-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Dispatches</p>
                  <p className="text-2xl font-bold text-sky-600">{stats.totalDispatches}</p>
                </div>
                <Truck className="h-8 w-8 text-sky-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Transit</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.inTransitDispatches}</p>
                </div>
                <Navigation className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Delivered</p>
                  <p className="text-2xl font-bold text-green-600">{stats.deliveredDispatches}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Delivery Time</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.averageDeliveryTime} days</p>
                </div>
                <Timer className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tracking">Live Tracking</TabsTrigger>
            <TabsTrigger value="couriers">Courier Management</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Filters */}
            <Card className="border-2 border-sky-500">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                    <input
                      type="text"
                      placeholder="Search dispatches..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="in_transit">In Transit</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="failed">Failed</option>
                      <option value="returned">Returned</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Courier</label>
                    <select
                      value={courierFilter}
                      onChange={(e) => setCourierFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="all">All Couriers</option>
                      {couriers.map(courier => (
                        <option key={courier._id} value={courier.name}>{courier.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dispatches Table */}
            <Card className="border-2 border-sky-500">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Dispatch Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-sky-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-sky-800 uppercase tracking-wider">Order</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-sky-800 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-sky-800 uppercase tracking-wider">Courier</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-sky-800 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-sky-800 uppercase tracking-wider">Progress</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-sky-800 uppercase tracking-wider">ETA</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-sky-800 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredDispatches.map((dispatch) => (
                        <tr key={dispatch._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{dispatch.orderNumber}</div>
                              <div className="text-sm text-gray-500">{formatDate(dispatch.dispatchDate)}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{dispatch.customerName}</div>
                              <div className="text-sm text-gray-500">{dispatch.customerAddress}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              {getCourierIcon(dispatch.courierName)}
                              <div>
                                <div className="text-sm font-medium text-gray-900">{dispatch.courierName}</div>
                                {dispatch.courierTrackingNumber && (
                                  <div className="text-xs text-gray-500">#{dispatch.courierTrackingNumber}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(dispatch.deliveryStatus)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span>{Math.round(getDeliveryProgress(dispatch))}%</span>
                              </div>
                              <Progress value={getDeliveryProgress(dispatch)} className="h-2" />
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatDate(dispatch.estimatedDeliveryDate)}
                            </div>
                            {dispatch.currentLocation && (
                              <div className="text-xs text-gray-500">
                                📍 {dispatch.currentLocation}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedDispatch(dispatch)
                                  setShowEditModal(true)
                                }}
                                className="text-sky-600 hover:text-sky-900"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedDispatch(dispatch)
                                  setShowEditModal(true)
                                }}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Live Tracking Tab */}
          <TabsContent value="tracking" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Shipments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Navigation className="h-5 w-5" />
                    <span>Active Shipments</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dispatches.filter(d => d.deliveryStatus === 'in_transit').map((dispatch) => (
                      <div key={dispatch._id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">{dispatch.orderNumber}</h4>
                          {getStatusBadge(dispatch.deliveryStatus)}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{dispatch.customerName}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{Math.round(getDeliveryProgress(dispatch))}%</span>
                          </div>
                          <Progress value={getDeliveryProgress(dispatch)} />
                        </div>
                        <div className="mt-3 text-sm text-gray-500">
                          <p>📍 Current: {dispatch.currentLocation}</p>
                          <p>🕒 Last Update: {dispatch.lastUpdate ? formatTime(dispatch.lastUpdate) : 'N/A'}</p>
                          <p>🚚 ETA: {formatDate(dispatch.estimatedDeliveryDate)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Updates */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Recent Updates</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dispatches.slice(0, 5).map((dispatch) => (
                      <div key={dispatch._id} className="p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center">
                              {getStatusIcon(dispatch.deliveryStatus)}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {dispatch.orderNumber} - {dispatch.customerName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {dispatch.deliveryStatus.replace('_', ' ')} • {formatTime(dispatch.lastUpdate || dispatch.updatedAt || dispatch.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Courier Management Tab */}
          <TabsContent value="couriers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Truck className="h-5 w-5" />
                  <span>Courier Companies</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {couriers.map((courier) => (
                    <div key={courier._id} className="p-4 border rounded-lg">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
                          {getCourierIcon(courier.name)}
                        </div>
                        <div>
                          <h4 className="font-medium">{courier.name}</h4>
                          <p className="text-sm text-gray-500">{courier.code}</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Contact:</span> {courier.contactPerson}</p>
                        <p><span className="font-medium">Phone:</span> {courier.phone}</p>
                        <p><span className="font-medium">Email:</span> {courier.email}</p>
                        <p><span className="font-medium">Service:</span> {courier.serviceType}</p>
                        <p><span className="font-medium">Rating:</span> ⭐ {courier.rating}/5</p>
                        <p><span className="font-medium">Active Orders:</span> {courier.activeOrders}</p>
                      </div>
                      <div className="mt-3 flex space-x-2">
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm" variant="outline">View Orders</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Delivery Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">On-Time Deliveries</span>
                      <span className="font-medium text-green-600">{stats.onTimeDeliveries}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Delayed Deliveries</span>
                      <span className="font-medium text-orange-600">{stats.delayedDeliveries}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Failed Deliveries</span>
                      <span className="font-medium text-red-600">{stats.failedDeliveries}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Returns</span>
                      <span className="font-medium text-pink-600">{stats.returnedDispatches}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Courier Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Courier Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.dispatchesByCourier?.map((courier, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{courier.courierName}</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{courier.count}</span>
                          <span className="text-xs text-gray-500">({courier.percentage}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Dispatch Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default Courier
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                        <option>Select Default Courier</option>
                        {couriers.map(courier => (
                          <option key={courier._id} value={courier._id}>{courier.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Auto-Update Interval (minutes)
                      </label>
                      <input
                        type="number"
                        defaultValue="30"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <Button>Save Settings</Button>
                    <Button variant="outline">Reset to Default</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modals would go here */}
        {/* Create/Edit Dispatch Modal */}
        {/* Tracking Details Modal */}
        {/* Courier Management Modal */}
      </div>
    </AppLayout>
  )
}
