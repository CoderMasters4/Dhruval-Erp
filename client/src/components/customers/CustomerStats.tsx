import React from 'react'
import {
  Users,
  UserCheck,
  UserX,
  Building2,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Calendar
} from 'lucide-react'
import { Customer } from '@/lib/features/customers/customersApi'

interface CustomerStatsProps {
  customers: Customer[]
  totalCustomers?: number
  isLoading: boolean
  currentCompany?: string
  isSuperAdmin?: boolean
}

export default function CustomerStats({ customers, totalCustomers, isLoading, currentCompany, isSuperAdmin }: CustomerStatsProps) {
  // Ensure customers is an array
  const customersArray = Array.isArray(customers) ? customers : []
  
  // Basic counts
  const activeCustomers = customersArray.filter(customer => customer.isActive).length
  const inactiveCustomers = customersArray.filter(customer => !customer.isActive).length
  
  // Business type analysis
  const businessTypes = customersArray.reduce((acc, customer) => {
    const type = customer.businessInfo?.businessType || 'unknown'
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const privateLimited = businessTypes['private_limited'] || 0
  const publicLimited = businessTypes['public_limited'] || 0
  const proprietorship = businessTypes['proprietorship'] || 0
  const partnership = businessTypes['partnership'] || 0
  const individual = businessTypes['individual'] || 0
  
  // Industry analysis
  const industries = customersArray.reduce((acc, customer) => {
    const industry = customer.businessInfo?.industry || 'Unknown'
    acc[industry] = (acc[industry] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const topIndustries = Object.entries(industries)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 3)
    .map(([industry, count]) => ({ industry, count }))
  
  // Financial analysis
  const totalOrders = customersArray.reduce((sum, customer) => 
    sum + (customer.purchaseHistory?.totalOrders || 0), 0
  )
  const totalOrderValue = customersArray.reduce((sum, customer) => 
    sum + (customer.purchaseHistory?.totalOrderValue || 0), 0
  )
  const averageOrderValue = totalOrders > 0 ? totalOrderValue / totalOrders : 0
  
  // Customer relationship analysis
  const customerTypes = customersArray.reduce((acc, customer) => {
    const type = customer.relationship?.customerType || 'unknown'
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const prospects = customerTypes['prospect'] || 0
  const regular = customerTypes['regular'] || 0
  const vip = customerTypes['vip'] || 0
  
  // Compliance analysis
  const kycPending = customersArray.filter(customer => 
    customer.compliance?.kycStatus === 'pending'
  ).length
  const kycCompleted = customersArray.filter(customer => 
    customer.compliance?.kycStatus === 'completed'
  ).length
  
  // Recent customers (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const recentCustomers = customersArray.filter(customer => 
    new Date(customer.createdAt) > thirtyDaysAgo
  ).length

  // Company-specific stats
  const companyCustomers = currentCompany && !isSuperAdmin 
    ? customersArray.filter(customer => customer.company === currentCompany)
    : customersArray
  
  // Use provided totalCustomers or calculate from customers array
  const actualTotalCustomers = totalCustomers || companyCustomers.length

  const stats = [
    {
      title: isSuperAdmin ? 'Total Customers' : 'Company Customers',
      value: actualTotalCustomers,
      icon: Users,
      color: 'bg-sky-500',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-200',
      textColor: 'text-sky-600',
      change: `${activeCustomers > 0 ? Math.round((activeCustomers / actualTotalCustomers) * 100) : 0}%`,
      changeColor: 'text-green-600'
    },
    {
      title: 'Active Customers',
      value: activeCustomers,
      icon: UserCheck,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-600',
      change: `${recentCustomers > 0 ? Math.round((recentCustomers / actualTotalCustomers) * 100) : 0}%`,
      changeColor: 'text-green-600'
    },
    {
      title: 'Private Limited',
      value: privateLimited,
      icon: Building2,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-600',
      change: `${privateLimited > 0 ? Math.round((privateLimited / actualTotalCustomers) * 100) : 0}%`,
      changeColor: 'text-blue-600'
    },
    {
      title: 'Total Orders',
      value: totalOrders,
      icon: ShoppingCart,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-600',
      change: `${totalOrders > 0 ? Math.round((totalOrders / actualTotalCustomers)) : 0}`,
      changeColor: 'text-purple-600'
    },
    {
      title: 'Order Value',
      value: `₹${totalOrderValue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-600',
      change: `₹${averageOrderValue.toLocaleString()}`,
      changeColor: 'text-yellow-600'
    },
    {
      title: 'KYC Pending',
      value: kycPending,
      icon: Calendar,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-600',
      change: `${kycPending > 0 ? Math.round((kycPending / actualTotalCustomers) * 100) : 0}%`,
      changeColor: 'text-orange-600'
    }
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-lg border border-sky-200 p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
              <div className="w-8 h-4 bg-gray-200 rounded"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div
            key={index}
            className={`bg-white rounded-2xl shadow-lg ${stat.borderColor} border p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 ${stat.bgColor} rounded-xl`}>
                <Icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
              <div className="flex items-center">
                <TrendingUp className={`w-4 h-4 ${stat.changeColor} mr-1`} />
                <span className={`text-sm font-semibold ${stat.changeColor}`}>
                  {stat.title === 'Total Customers' ? 'Active Rate' : 
                   stat.title === 'Active Customers' ? 'New This Month' :
                   stat.title === 'Private Limited' ? 'Company Share' :
                   stat.title === 'Total Orders' ? 'Per Customer' :
                   stat.title === 'Order Value' ? 'Avg Order' :
                   'Pending Rate'}
                </span>
              </div>
            </div>
            
            <div className="mb-2">
              <p className="text-2xl font-bold text-black">
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </p>
            </div>
            
            <p className="text-sm font-medium text-gray-600">
              {stat.title}
            </p>
          </div>
        )
      })}
    </div>
  )
}
