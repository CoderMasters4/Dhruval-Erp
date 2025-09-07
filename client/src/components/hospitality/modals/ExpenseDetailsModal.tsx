import React, { useState } from 'react'
import { 
  X, 
  DollarSign, 
  Receipt, 
  FileText, 
  Calendar, 
  MapPin, 
  Users,
  Car,
  Hotel,
  Utensils,
  Gift,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Eye,
  Edit,
  Plus
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { CustomerVisit } from '@/lib/features/hospitality/hospitalityApi'
import { format } from 'date-fns'

interface ExpenseDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  visit: CustomerVisit
  onEdit?: () => void
}

export default function ExpenseDetailsModal({ 
  isOpen, 
  onClose, 
  visit, 
  onEdit 
}: ExpenseDetailsModalProps) {
  const [activeTab, setActiveTab] = useState('summary')

  if (!isOpen) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusBadge = (status: CustomerVisit['approvalStatus']) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected', icon: AlertTriangle },
      reimbursed: { color: 'bg-blue-100 text-blue-800', label: 'Reimbursed', icon: DollarSign }
    }

    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    )
  }

  const tabs = [
    { id: 'summary', label: 'Summary', icon: DollarSign },
    { id: 'accommodation', label: 'Accommodation', icon: Hotel },
    { id: 'food', label: 'Food & Dining', icon: Utensils },
    { id: 'transport', label: 'Transportation', icon: Car },
    { id: 'gifts', label: 'Gifts & Samples', icon: Gift },
    { id: 'other', label: 'Other Expenses', icon: AlertTriangle },
    { id: 'receipts', label: 'Receipts', icon: Receipt }
  ]

  const totalExpenses = visit.totalExpenses?.total || visit.travelExpenses?.total || 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Expense Details</h2>
              <p className="text-sm text-gray-500">
                {visit.partyName} • {format(new Date(visit.visitDate), 'PPP')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {onEdit && (
              <Button
                onClick={onEdit}
                variant="outline"
                size="sm"
                className="flex items-center"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="p-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Summary Tab */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Visit Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Party Name</label>
                    <p className="text-gray-900 font-medium">{visit.partyName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                    <p className="text-gray-900">{visit.contactPerson}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Visit Date</label>
                    <p className="text-gray-900">{format(new Date(visit.visitDate), 'PPP')}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <div>{getStatusBadge(visit.approvalStatus)}</div>
                  </div>
                </div>
              </div>

              {/* Expense Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="bg-white rounded-lg p-3 text-center">
                    <p className="text-sm text-gray-600">Accommodation</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(visit.totalExpenses?.accommodation || visit.travelExpenses?.accommodation || 0)}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <p className="text-sm text-gray-600">Food</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(visit.totalExpenses?.food || visit.travelExpenses?.food || 0)}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <p className="text-sm text-gray-600">Transportation</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(visit.totalExpenses?.transportation || visit.travelExpenses?.transport || 0)}
                    </p>
                  </div>
                                     <div className="bg-white rounded-lg p-3 text-center">
                     <p className="text-sm text-gray-600">Gifts</p>
                     <p className="text-lg font-semibold text-gray-900">
                       {formatCurrency(visit.totalExpenses?.gifts || 0)}
                     </p>
                   </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <p className="text-sm text-gray-600">Other</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(visit.totalExpenses?.other || visit.travelExpenses?.other || 0)}
                    </p>
                  </div>
                  <div className="bg-blue-100 rounded-lg p-3 text-center">
                    <p className="text-sm text-blue-600 font-medium">Total</p>
                    <p className="text-xl font-bold text-blue-900">
                      {formatCurrency(totalExpenses)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Approval Information */}
              {visit.approvalStatus !== 'pending' && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Approval Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <div>{getStatusBadge(visit.approvalStatus)}</div>
                    </div>
                    {visit.approvedAt && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Processed At</label>
                        <p className="text-gray-900">{format(new Date(visit.approvedAt), 'PPp')}</p>
                      </div>
                    )}
                    {visit.reimbursementAmount && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reimbursement Amount</label>
                        <p className="text-lg font-semibold text-green-600">
                          {formatCurrency(visit.reimbursementAmount)}
                        </p>
                      </div>
                    )}
                    {visit.reimbursedAt && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reimbursed At</label>
                        <p className="text-gray-900">{format(new Date(visit.reimbursedAt), 'PPp')}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Accommodation Tab */}
          {activeTab === 'accommodation' && (
            <div className="space-y-4">
              {visit.accommodation ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Accommodation Details</h3>
                  <div className="bg-white rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Name</label>
                        <p className="text-gray-900">{visit.accommodation.hotelName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                        <p className="text-gray-900 capitalize">{visit.accommodation.roomType}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date</label>
                        <p className="text-gray-900">{format(new Date(visit.accommodation.checkInDate), 'PPP')}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date</label>
                        <p className="text-gray-900">{format(new Date(visit.accommodation.checkOutDate), 'PPP')}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Nights</label>
                        <p className="text-gray-900">{visit.accommodation.totalNights}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cost Per Night</label>
                        <p className="text-gray-900">{formatCurrency(visit.accommodation.costPerNight)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Cost</label>
                        <p className="text-lg font-semibold text-gray-900">{formatCurrency(visit.accommodation.totalCost)}</p>
                      </div>
                      {visit.accommodation.bookingReference && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Booking Reference</label>
                          <p className="text-gray-900">{visit.accommodation.bookingReference}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Hotel className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No accommodation details</h3>
                  <p className="text-gray-500">No accommodation information has been recorded for this visit.</p>
                </div>
              )}
            </div>
          )}

          {/* Food Tab */}
          {activeTab === 'food' && (
            <div className="space-y-4">
              {visit.foodExpenses && visit.foodExpenses.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Food Expenses ({visit.foodExpenses.length})</h3>
                    <div className="text-lg font-semibold text-green-600">
                      Total: {formatCurrency(visit.foodExpenses.reduce((sum, exp) => sum + exp.totalCost, 0))}
                    </div>
                  </div>
                  
                  {visit.foodExpenses.map((expense, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">{expense.restaurant}</h4>
                        <span className="text-lg font-semibold text-gray-900">{formatCurrency(expense.totalCost)}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                          <p className="text-gray-900">{format(new Date(expense.date), 'PPP')}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Meal Type</label>
                          <p className="text-gray-900 capitalize">{expense.mealType}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                          <p className="text-gray-900">{expense.location}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Number of People</label>
                          <p className="text-gray-900">{expense.numberOfPeople}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Cost Per Person</label>
                          <p className="text-gray-900">{formatCurrency(expense.costPerPerson)}</p>
                        </div>
                        {expense.billNumber && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bill Number</label>
                            <p className="text-gray-900">{expense.billNumber}</p>
                          </div>
                        )}
                      </div>
                      {expense.description && (
                        <div className="mt-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <p className="text-gray-900 text-sm">{expense.description}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Utensils className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No food expenses</h3>
                  <p className="text-gray-500">No food expenses have been recorded for this visit.</p>
                </div>
              )}
            </div>
          )}

          {/* Transport Tab */}
          {activeTab === 'transport' && (
            <div className="space-y-4">
              {visit.transportationExpenses && visit.transportationExpenses.length > 0 ? (
                <div className="space-y-4">
                                     <div className="flex items-center justify-between">
                     <h3 className="text-lg font-semibold text-gray-900">Transportation Expenses ({visit.transportationExpenses.length})</h3>
                     <div className="text-lg font-semibold text-purple-600">
                       Total: {formatCurrency(visit.transportationExpenses.reduce((sum, exp) => sum + exp.cost, 0))}
                     </div>
                   </div>
                  
                  {visit.transportationExpenses.map((expense, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                                           <div className="flex items-center justify-between mb-3">
                       <h4 className="font-semibold text-gray-900">{expense.type}</h4>
                       <span className="text-lg font-semibold text-gray-900">{formatCurrency(expense.cost)}</span>
                     </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                          <p className="text-gray-900">{format(new Date(expense.date), 'PPP')}</p>
                        </div>
                                                 <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                           <p className="text-gray-900">{expense.from}</p>
                         </div>
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                           <p className="text-gray-900">{expense.to}</p>
                         </div>
                         {expense.billNumber && (
                           <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Bill Number</label>
                             <p className="text-gray-900">{expense.billNumber}</p>
                           </div>
                         )}
                      </div>
                      {expense.description && (
                        <div className="mt-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <p className="text-gray-900 text-sm">{expense.description}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No transportation expenses</h3>
                  <p className="text-gray-500">No transportation expenses have been recorded for this visit.</p>
                </div>
              )}
            </div>
          )}

          {/* Gifts Tab */}
          {activeTab === 'gifts' && (
            <div className="space-y-4">
              {visit.giftsGiven && visit.giftsGiven.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Gifts & Samples ({visit.giftsGiven.length})</h3>
                    <div className="text-lg font-semibold text-pink-600">
                      Total: {formatCurrency(visit.giftsGiven.reduce((sum, gift) => sum + gift.totalCost, 0))}
                    </div>
                  </div>
                  
                  {visit.giftsGiven.map((gift, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">{gift.itemName}</h4>
                        <span className="text-lg font-semibold text-gray-900">{formatCurrency(gift.totalCost)}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Item Type</label>
                          <p className="text-gray-900 capitalize">{gift.itemType.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                          <p className="text-gray-900">{gift.quantity}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost</label>
                          <p className="text-gray-900">{formatCurrency(gift.unitCost)}</p>
                        </div>
                        {gift.recipientName && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Recipient</label>
                            <p className="text-gray-900">{gift.recipientName}</p>
                          </div>
                        )}
                      </div>
                      {gift.description && (
                        <div className="mt-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <p className="text-gray-900 text-sm">{gift.description}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No gifts recorded</h3>
                  <p className="text-gray-500">No gifts or samples have been recorded for this visit.</p>
                </div>
              )}
            </div>
          )}

          {/* Other Expenses Tab */}
          {activeTab === 'other' && (
            <div className="space-y-4">
              {visit.otherExpenses && visit.otherExpenses.length > 0 ? (
                <div className="space-y-4">
                                     <div className="flex items-center justify-between">
                     <h3 className="text-lg font-semibold text-gray-900">Other Expenses ({visit.otherExpenses.length})</h3>
                     <div className="text-lg font-semibold text-gray-600">
                       Total: {formatCurrency(visit.otherExpenses.reduce((sum, exp) => sum + exp.cost, 0))}
                     </div>
                   </div>
                  
                  {visit.otherExpenses.map((expense, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                                           <div className="flex items-center justify-between mb-3">
                       <h4 className="font-semibold text-gray-900">{expense.category}</h4>
                       <span className="text-lg font-semibold text-gray-900">{formatCurrency(expense.cost)}</span>
                     </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                          <p className="text-gray-900">{format(new Date(expense.date), 'PPP')}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                          <p className="text-gray-900 capitalize">{expense.category}</p>
                        </div>
                                                 {expense.billNumber && (
                           <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Bill Number</label>
                             <p className="text-gray-900">{expense.billNumber}</p>
                           </div>
                         )}
                      </div>
                      {expense.description && (
                        <div className="mt-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <p className="text-gray-900 text-sm">{expense.description}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No other expenses</h3>
                  <p className="text-gray-500">No other expenses have been recorded for this visit.</p>
                </div>
              )}
            </div>
          )}

          {/* Receipts Tab */}
          {activeTab === 'receipts' && (
            <div className="space-y-4">
              <div className="text-center py-8">
                <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Receipt Management</h3>
                <p className="text-gray-500 mb-4">Upload and manage receipts for this visit.</p>
                <Button className="flex items-center mx-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Receipt
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
