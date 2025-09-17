import React from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { 
  Eye, 
  Edit, 
  Trash2, 
  Car, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Printer,
  Download,
  RefreshCw
} from 'lucide-react'
import { GatePass } from '@/lib/features/gatepasses/gatepassesApi'
import { generateGatePassPDF, GatePassPDFData } from '@/utils/gatePassPDFSimple'

interface GatePassTableProps {
  gatePasses: GatePass[]
  selectedGatePasses: string[]
  onSelectGatePass: (id: string) => void
  onSelectAll: () => void
  onView: (gatePass: GatePass) => void
  onEdit: (gatePass: GatePass) => void
  onDelete: (id: string) => void
  onComplete: (id: string) => void
  onCancel: (id: string) => void
  onPrint: (id: string) => void
  isLoading: boolean
  isCompleting: boolean
  isCancelling: boolean
  isDeleting: boolean
  isPrinting: boolean
}

export default function GatePassTable({
  gatePasses,
  selectedGatePasses,
  onSelectGatePass,
  onSelectAll,
  onView,
  onEdit,
  onDelete,
  onComplete,
  onCancel,
  onPrint,
  isLoading,
  isCompleting,
  isCancelling,
  isDeleting,
  isPrinting
}: GatePassTableProps) {
  // Debug logging
  console.log('GatePassTable - gatePasses:', gatePasses)
  console.log('GatePassTable - gatePasses length:', gatePasses?.length)
  console.log('GatePassTable - isLoading:', isLoading)
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      completed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      expired: { color: 'bg-red-100 text-red-800', icon: XCircle },
      cancelled: { color: 'bg-gray-100 text-gray-800', icon: XCircle }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active
    const Icon = config.icon
    
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getPurposeBadge = (purpose: string) => {
    const purposeConfig = {
      delivery: { color: 'bg-blue-100 text-blue-800' },
      pickup: { color: 'bg-green-100 text-green-800' },
      maintenance: { color: 'bg-yellow-100 text-yellow-800' },
      other: { color: 'bg-gray-100 text-gray-800' }
    }
    
    const config = purposeConfig[purpose as keyof typeof purposeConfig] || purposeConfig.other
    
    return (
      <Badge className={config.color}>
        {purpose.charAt(0).toUpperCase() + purpose.slice(1)}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <RefreshCw className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading gate passes...</span>
      </div>
    )
  }

  // Additional debugging
  if (!gatePasses || gatePasses.length === 0) {
    console.log('GatePassTable: No gate passes data available')
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="mb-4">
          <Car className="w-12 h-12 mx-auto text-gray-300" />
        </div>
        <p>No gate passes found</p>
        <p className="text-sm text-gray-400 mt-2">
          {isLoading ? 'Loading...' : 'Try adjusting your filters or create a new gate pass'}
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 w-12">
              <input
                type="checkbox"
                checked={selectedGatePasses.length === gatePasses.length && gatePasses.length > 0}
                onChange={onSelectAll}
                className="rounded border-gray-300"
              />
            </th>
            <th className="text-left py-3 px-4">Gate Pass #</th>
            <th className="text-left py-3 px-4">Vehicle</th>
            <th className="text-left py-3 px-4">Driver</th>
            <th className="text-left py-3 px-4">Purpose</th>
            <th className="text-left py-3 px-4">Status</th>
            <th className="text-left py-3 px-4">Time In</th>
            <th className="text-left py-3 px-4">Time Out</th>
            <th className="text-left py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {gatePasses.map((gatePass) => {
            console.log('GatePassTable: Rendering gate pass:', gatePass)
            return (
              <tr key={gatePass._id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4">
                <input
                  type="checkbox"
                  checked={selectedGatePasses.includes(gatePass._id)}
                  onChange={() => onSelectGatePass(gatePass._id)}
                  className="rounded border-gray-300"
                />
              </td>
              <td className="py-3 px-4">
                <div className="font-medium">{gatePass.gatePassNumber}</div>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-gray-400" />
                  <span>{gatePass.vehicleNumber}</span>
                </div>
              </td>
              <td className="py-3 px-4">
                <div>
                  <div className="font-medium">{gatePass.driverName}</div>
                  <div className="text-sm text-gray-500">{gatePass.driverPhone}</div>
                </div>
              </td>
              <td className="py-3 px-4">
                {getPurposeBadge(gatePass.purpose)}
              </td>
              <td className="py-3 px-4">
                {getStatusBadge(gatePass.status)}
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">
                    {new Date(gatePass.timeIn).toLocaleString()}
                  </span>
                </div>
              </td>
              <td className="py-3 px-4">
                {gatePass.timeOut ? (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">
                      {new Date(gatePass.timeOut).toLocaleString()}
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(gatePass)}
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(gatePass)}
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {gatePass.status === 'active' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onComplete(gatePass._id)}
                        disabled={isCompleting}
                        title="Complete"
                        className="text-green-600 hover:text-green-700"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCancel(gatePass._id)}
                        disabled={isCancelling}
                        title="Cancel"
                        className="text-orange-600 hover:text-orange-700"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPrint(gatePass._id)}
                    disabled={isPrinting}
                    title="Print"
                  >
                    <Printer className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      try {
                        generateGatePassPDF(gatePass as GatePassPDFData, 'Dhruval Exim Pvt. Ltd.');
                        // You can add a toast notification here if needed
                      } catch (error) {
                        console.error('Error generating PDF:', error);
                      }
                    }}
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(gatePass._id)}
                    disabled={isDeleting}
                    title="Delete"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
            )
          })}
        </tbody>
      </table>
      
      {gatePasses.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No gate passes found
        </div>
      )}
    </div>
  )
}
