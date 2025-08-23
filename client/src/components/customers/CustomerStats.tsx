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
}

export default function CustomerStats({ customers, totalCustomers, isLoading }: CustomerStatsProps) {
  // Calculate stats from customers data
  const activeCustomers = customers.filter(customer => customer.isActive).length
  const inactiveCustomers = customers.filter(customer => !customer.isActive).length
  const businessCustomers = customers.filter(customer => customer.customerType === 'business').length
  const individualCustomers = customers.filter(customer => customer.customerType === 'individual').length
  
  // Calculate totals
  const totalOrders = customers.reduce((sum, customer) => sum + (customer.totalOrders || 0), 0)
  const totalRevenue = customers.reduce((sum, customer) => sum + (customer.totalSpent || 0), 0)
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
  
  // Recent customers (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const recentCustomers = customers.filter(customer => 
    new Date(customer.createdAt) > thirtyDaysAgo
  ).length

  // Use provided totalCustomers or calculate from customers array
  const actualTotalCustomers = totalCustomers || customers.length

  const stats = [
    {
      title: 'Total Customers',
      value: actualTotalCustomers,
      icon: Users,
      color: 'bg-sky-500',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-200',
      textColor: 'text-sky-600',
      change: '+12%',
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
      change: '+8%',
      changeColor: 'text-green-600'
    },
    {
      title: 'Business Customers',
      value: businessCustomers,
      icon: Building2,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-600',
      change: '+15%',
      changeColor: 'text-green-600'
    },
    {
      title: 'Total Orders',
      value: totalOrders,
      icon: ShoppingCart,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-600',
      change: '+22%',
      changeColor: 'text-green-600'
    },
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-600',
      change: '+18%',
      changeColor: 'text-green-600'
    },
    {
      title: 'New This Month',
      value: recentCustomers,
      icon: Calendar,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      textColor: 'text-indigo-600',
      change: '+25%',
      changeColor: 'text-green-600'
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
                  {stat.change}
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
