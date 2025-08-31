'use client'

import { 
  X, 
  Edit, 
  Trash2, 
  Package, 
  MapPin, 
  Calendar,
  User,
  FileText,
  ArrowDown,
  ArrowUp,
  RefreshCw,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'

interface StockMovementDetailsProps {
  movement: any
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
  canEdit?: boolean
  canDelete?: boolean
}

export function StockMovementDetails({ 
  movement, 
  onClose, 
  onEdit, 
  onDelete, 
  canEdit = true, 
  canDelete = true 
}: StockMovementDetailsProps) {
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'inward':
        return <ArrowDown className="w-5 h-5 text-green-500" />
      case 'outward':
        return <ArrowUp className="w-5 h-5 text-red-500" />
      case 'transfer':
        return <RefreshCw className="w-5 h-5 text-blue-500" />
      case 'adjustment':
        return <ArrowUpDown className="w-5 h-5 text-purple-500" />
      default:
        return <Package className="w-5 h-5 text-gray-500" />
    }
  }

  const getMovementBadge = (type: string) => {
    const baseClasses = "px-3 py-1 text-sm font-medium rounded-full flex items-center space-x-2"
    switch (type) {
      case 'inward':
        return `${baseClasses} bg-green-100 text-green-700 border border-green-200`
      case 'outward':
        return `${baseClasses} bg-red-100 text-red-700 border border-red-200`
      case 'transfer':
        return `${baseClasses} bg-blue-100 text-blue-700 border border-blue-200`
      case 'adjustment':
        return `${baseClasses} bg-purple-100 text-purple-700 border border-purple-200`
      default:
        return `${baseClasses} bg-gray-100 text-gray-700 border border-gray-200`
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 text-sm font-medium rounded-full flex items-center space-x-2"
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-green-100 text-green-700 border border-green-200`
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-700 border border-yellow-200`
      case 'cancelled':
        return `${baseClasses} bg-red-100 text-red-700 border border-red-200`
      case 'in_progress':
        return `${baseClasses} bg-blue-100 text-blue-700 border border-blue-200`
      default:
        return `${baseClasses} bg-gray-100 text-gray-700 border border-gray-200`
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'in_progress':
        return <TrendingUp className="w-4 h-4 text-blue-600" />
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />
    }
  }

  const getPriorityBadge = (priority: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full"
    switch (priority) {
      case 'urgent':
        return `${baseClasses} bg-red-100 text-red-700 border border-red-200`
      case 'high':
        return `${baseClasses} bg-orange-100 text-orange-700 border border-orange-200`
      case 'normal':
        return `${baseClasses} bg-blue-100 text-blue-700 border border-blue-200`
      case 'low':
        return `${baseClasses} bg-gray-100 text-gray-700 border border-gray-200`
      default:
        return `${baseClasses} bg-gray-100 text-gray-700 border border-gray-200`
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Stock Movement Details</h2>
              <p className="text-sm text-gray-600">Movement #{movement.movementNumber}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {canEdit && (
              <Button
                onClick={onEdit}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </Button>
            )}
            {canDelete && (
              <Button
                onClick={onDelete}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </Button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Movement Overview */}
          <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl p-6 border border-sky-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                  {getMovementIcon(movement.movementType)}
                </div>
                <div className={getMovementBadge(movement.movementType)}>
                  {getMovementIcon(movement.movementType)}
                  <span className="capitalize">{movement.movementType}</span>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {movement.quantity}
                </div>
                <p className="text-sm text-gray-600">
                  {movement.unit || 'PCS'} {movement.movementType === 'outward' ? 'Moved Out' : 'Moved In'}
                </p>
              </div>

              <div className="text-center">
                <div className={getStatusBadge(movement.status)}>
                  {getStatusIcon(movement.status)}
                  <span className="capitalize">{movement.status.replace('_', ' ')}</span>
                </div>
                {movement.priority && (
                  <div className="mt-2">
                    <span className={getPriorityBadge(movement.priority)}>
                      {movement.priority} Priority
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Item Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Package className="w-5 h-5 text-sky-600" />
              <span>Item Information</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Item Name</label>
                <p className="text-gray-900 font-medium">{movement.itemName || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Item Code</label>
                <p className="text-gray-900 font-medium">{movement.companyItemCode || movement.itemCode || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Category</label>
                <p className="text-gray-900">{movement.category?.primary || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Unit</label>
                <p className="text-gray-900">{movement.stock?.unit || movement.unit || 'PCS'}</p>
              </div>
            </div>
          </div>

          {/* Movement Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <ArrowUpDown className="w-5 h-5 text-blue-600" />
              <span>Movement Details</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">From Location</label>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900 font-medium">{movement.fromLocation}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">To Location</label>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900 font-medium">{movement.toLocation}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Movement Date</label>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{formatDate(movement.movementDate)}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Created Date</label>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{formatDate(movement.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reference Document */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-purple-600" />
              <span>Reference Document</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Document Type</label>
                <p className="text-gray-900 capitalize">
                  {movement.referenceDocument?.type?.replace('_', ' ') || 'Manual Entry'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Reference Number</label>
                <p className="text-gray-900 font-medium">
                  {movement.referenceDocument?.number || 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Document Date</label>
                <p className="text-gray-900">
                  {movement.referenceDocument?.date ? formatDate(movement.referenceDocument.date) : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Approval & Status */}
          {(movement.requiresApproval || movement.approval) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Approval & Status</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Approval Required</label>
                  <p className="text-gray-900">
                    {movement.requiresApproval ? 'Yes' : 'No'}
                  </p>
                </div>
                {movement.approval && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Approval Status</label>
                      <div className={getStatusBadge(movement.approval.status)}>
                        {getStatusIcon(movement.approval.status)}
                        <span className="capitalize">{movement.approval.status}</span>
                      </div>
                    </div>
                    {movement.approval.approvedBy && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Approved By</label>
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <p className="text-gray-900">{movement.approval.approvedBy}</p>
                        </div>
                      </div>
                    )}
                    {movement.approval.approvedAt && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Approved At</label>
                        <p className="text-gray-900">{formatDate(movement.approval.approvedAt)}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {movement.notes && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h3>
              <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{movement.notes}</p>
            </div>
          )}

          {/* Audit Information */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Audit Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Created By</label>
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{movement.createdBy || 'System'}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Last Updated</label>
                <p className="text-gray-900">
                  {movement.updatedAt ? formatDate(movement.updatedAt) : 'Never'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
