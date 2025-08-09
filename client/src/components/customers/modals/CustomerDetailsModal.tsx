import React from 'react'
import {
  X,
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Globe,
  Calendar,
  Edit,
  CheckCircle,
  XCircle,
  DollarSign,
  ShoppingCart,
  FileText,
  Tag
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Customer } from '@/lib/features/customers/customersApi'
import { useModals } from '@/hooks/useModals'
import clsx from 'clsx'

interface CustomerDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  customer: Customer
  onEdit?: () => void
}

export default function CustomerDetailsModal({
  isOpen,
  onClose,
  customer,
  onEdit
}: CustomerDetailsModalProps) {
  const { openCustomerForm } = useModals()

  if (!isOpen) return null

  const handleEdit = () => {
    if (onEdit) {
      onEdit()
    } else {
      onClose()
      openCustomerForm({ customer })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`
  }

  return (
    <div className="fixed inset-0 bg-white bg-opacity-30 backdrop-blur-md flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-blue-500 p-6 relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-white bg-opacity-20 rounded-full"></div>
          <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-white bg-opacity-10 rounded-full"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="h-16 w-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center border-4 border-white border-opacity-30">
                  <span className="text-white font-bold text-2xl">
                    {customer.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {customer.name}
                </h2>
                <div className="flex items-center gap-3">
                  {customer.customerCode && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-white bg-opacity-20 text-white border border-white border-opacity-30">
                      {customer.customerCode}
                    </span>
                  )}
                  
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-white bg-opacity-20 text-white border border-white border-opacity-30">
                    <Building2 className="w-4 h-4 mr-1" />
                    {customer.customerType.charAt(0).toUpperCase() + customer.customerType.slice(1)}
                  </span>
                  
                  <span className={clsx(
                    'inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border border-white border-opacity-30',
                    customer.isActive
                      ? 'bg-green-500 bg-opacity-80 text-white'
                      : 'bg-red-500 bg-opacity-80 text-white'
                  )}>
                    {customer.isActive ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 mr-1" />
                        Inactive
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
            
            <Button
              onClick={onClose}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-xl transition-colors bg-transparent border-0"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Contact Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Email</p>
                    <p className="text-black font-semibold">{customer.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Phone</p>
                    <p className="text-black font-semibold">{customer.phone}</p>
                  </div>
                </div>
                
                {customer.company && (
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Company</p>
                      <p className="text-black font-semibold">{customer.company}</p>
                    </div>
                  </div>
                )}
                
                {customer.contactPerson && (
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100">
                    <User className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Contact Person</p>
                      <p className="text-black font-semibold">{customer.contactPerson}</p>
                    </div>
                  </div>
                )}
                
                {customer.website && (
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100">
                    <Globe className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Website</p>
                      <a 
                        href={customer.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 font-semibold hover:underline break-all"
                      >
                        {customer.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Address Information */}
            {customer.address && (
              <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-yellow-600" />
                  Address Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-lg border border-yellow-100">
                    <h4 className="font-semibold text-black mb-2">Primary Address</h4>
                    <div className="text-sm text-gray-700 space-y-1">
                      {customer.address.street && <p>{customer.address.street}</p>}
                      <p>
                        {[customer.address.city, customer.address.state].filter(Boolean).join(', ')}
                        {customer.address.zipCode && ` - ${customer.address.zipCode}`}
                      </p>
                      {customer.address.country && <p>{customer.address.country}</p>}
                    </div>
                  </div>
                  
                  {customer.billingAddress && (
                    <div className="p-4 bg-white rounded-lg border border-yellow-100">
                      <h4 className="font-semibold text-black mb-2">Billing Address</h4>
                      <div className="text-sm text-gray-700 space-y-1">
                        {customer.billingAddress.street && <p>{customer.billingAddress.street}</p>}
                        <p>
                          {[customer.billingAddress.city, customer.billingAddress.state].filter(Boolean).join(', ')}
                          {customer.billingAddress.zipCode && ` - ${customer.billingAddress.zipCode}`}
                        </p>
                        {customer.billingAddress.country && <p>{customer.billingAddress.country}</p>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Business Statistics */}
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2 text-green-600" />
                Business Statistics
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-green-100">
                  <ShoppingCart className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-black">{customer.totalOrders || 0}</p>
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-green-100">
                  <DollarSign className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-black">{formatCurrency(customer.totalSpent || 0)}</p>
                    <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-green-100">
                  <DollarSign className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-black">{formatCurrency(customer.averageOrderValue || 0)}</p>
                    <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-gray-600" />
                Account Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Created</p>
                    <p className="text-black font-semibold">{formatDate(customer.createdAt)}</p>
                  </div>
                </div>
                
                {customer.lastOrderDate && (
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                    <ShoppingCart className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Last Order</p>
                      <p className="text-black font-semibold">{formatDate(customer.lastOrderDate)}</p>
                    </div>
                  </div>
                )}
                
                {customer.creditLimit && (
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                    <DollarSign className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Credit Limit</p>
                      <p className="text-black font-semibold">{formatCurrency(customer.creditLimit)}</p>
                    </div>
                  </div>
                )}
                
                {customer.paymentTerms && (
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Payment Terms</p>
                      <p className="text-black font-semibold">{customer.paymentTerms}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information */}
            {(customer.notes || customer.tags?.length) && (
              <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-purple-600" />
                  Additional Information
                </h3>
                
                <div className="space-y-4">
                  {customer.notes && (
                    <div className="p-4 bg-white rounded-lg border border-purple-100">
                      <h4 className="font-semibold text-black mb-2">Notes</h4>
                      <p className="text-gray-700 whitespace-pre-wrap">{customer.notes}</p>
                    </div>
                  )}
                  
                  {customer.tags && customer.tags.length > 0 && (
                    <div className="p-4 bg-white rounded-lg border border-purple-100">
                      <h4 className="font-semibold text-black mb-2 flex items-center">
                        <Tag className="w-4 h-4 mr-1" />
                        Tags
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {customer.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
            <Button
              onClick={handleEdit}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Customer
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
