import React from 'react'
import {
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  User,
  DollarSign,
  ShoppingCart
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Customer } from '@/lib/features/customers/customersApi'
import clsx from 'clsx'

interface CustomerListProps {
  customers: Customer[]
  isLoading: boolean
  onView: (customer: Customer) => void
  onEdit: (customer: Customer) => void
  onDelete: (customer: Customer) => void
}

export default function CustomerList({
  customers,
  isLoading,
  onView,
  onEdit,
  onDelete
}: CustomerListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`
  }

  const getCustomerTypeColor = (type: string) => {
    switch (type) {
      case 'business':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'individual':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCustomerTypeIcon = (type: string) => {
    switch (type) {
      case 'business':
        return Building2
      case 'individual':
        return User
      default:
        return Users
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
              <div className="flex gap-2">
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (customers.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
        <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Customers Found</h3>
        <p className="text-gray-600">No customers match your current filters. Try adjusting your search criteria.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {customers.map((customer) => {
        const TypeIcon = getCustomerTypeIcon(customer.customerType)
        
        return (
          <div
            key={customer._id}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300 group overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center border-2 border-blue-200">
                      <span className="text-white font-semibold text-lg">
                        {customer.name?.charAt(0)?.toUpperCase() || 'C'}
                      </span>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-black truncate">
                        {customer.name || 'Unnamed Customer'}
                      </h3>
                      
                      {customer.customerCode && (
                        <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded-full border border-blue-200 flex-shrink-0">
                          {customer.customerCode}
                        </span>
                      )}
                      
                      {/* Type Badge */}
                      <span className={clsx(
                        'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border',
                        getCustomerTypeColor(customer.customerType)
                      )}>
                        <TypeIcon className="w-3 h-3 mr-1" />
                        {customer.customerType?.charAt(0)?.toUpperCase() + customer.customerType?.slice(1) || 'Unknown'}
                      </span>

                      {/* Status Badge */}
                      <div className={clsx(
                        'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border',
                        customer.isActive
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : 'bg-red-100 text-red-800 border-red-200'
                      )}>
                        {customer.isActive ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        <span className="truncate max-w-xs">{customer.email}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        <span>{customer.phone}</span>
                      </div>
                      
                      {customer.company && (
                        <div className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          <span className="truncate max-w-xs">{customer.company}</span>
                        </div>
                      )}
                      
                      {customer.address?.city && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{customer.address.city}, {customer.address.state}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Joined {formatDate(customer.createdAt)}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-1 text-purple-600">
                        <ShoppingCart className="w-4 h-4" />
                        <span className="font-semibold text-black">{customer.totalOrders || 0}</span>
                        <span className="text-gray-600">orders</span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-green-600">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-semibold text-black">{formatCurrency(customer.totalSpent || 0)}</span>
                        <span className="text-gray-600">spent</span>
                      </div>
                      
                      {customer.averageOrderValue && (
                        <div className="flex items-center gap-1 text-yellow-600">
                          <span className="text-gray-600">Avg:</span>
                          <span className="font-semibold text-black">{formatCurrency(customer.averageOrderValue)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                  <Button
                    onClick={() => onView(customer)}
                    className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    onClick={() => onEdit(customer)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-lg transition-colors"
                    title="Edit Customer"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    onClick={() => onDelete(customer)}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                    title="Delete Customer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
