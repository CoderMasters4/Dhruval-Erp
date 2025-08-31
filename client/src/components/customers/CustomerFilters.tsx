import React from 'react'
import {
  Search,
  Filter,
  RotateCcw,
  Plus,
  Users
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface CustomerFilters {
  search: string
  customerType: string
  status: string
  companyId: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

interface CustomerFiltersProps {
  filters: CustomerFilters
  onFilterChange: (filters: Partial<CustomerFilters>) => void
  onReset: () => void
  onCreateNew: () => void
  isLoading: boolean
  companies?: Array<{ _id: string; companyCode: string; companyName: string }>
  isSuperAdmin?: boolean
}

export default function CustomerFilters({
  filters,
  onFilterChange,
  onReset,
  onCreateNew,
  isLoading,
  companies = [],
  isSuperAdmin = false
}: CustomerFiltersProps) {
  const hasActiveFilters = filters.search || filters.customerType !== 'all' || filters.status !== 'all' || filters.companyId !== 'all'

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-sky-200 p-6 mb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-100 rounded-xl">
            <Filter className="w-5 h-5 text-sky-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-black">Filter Customers</h3>
            <p className="text-sm text-gray-600">Search and filter customer accounts</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <Button
              onClick={onReset}
              disabled={isLoading}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium transition-colors"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          )}
          
          <Button
            onClick={onCreateNew}
            disabled={isLoading}
            className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Search Customers
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or company..."
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              disabled={isLoading}
              className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Customer Type Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Customer Type
          </label>
          <select
            value={filters.customerType}
            onChange={(e) => onFilterChange({ customerType: e.target.value })}
            disabled={isLoading}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
          >
            <option value="all">All Types</option>
            <option value="individual">Individual</option>
            <option value="business">Business</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value })}
            disabled={isLoading}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Company Filter - Only for Super Admins */}
        {isSuperAdmin && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Company
            </label>
            <select
              value={filters.companyId}
              onChange={(e) => onFilterChange({ companyId: e.target.value })}
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
            >
              <option value="all">All Companies</option>
              {companies.map((company) => (
                <option key={company._id} value={company._id}>
                  {company.companyName} ({company.companyCode})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Sort */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Sort By
          </label>
          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-')
              onFilterChange({ sortBy, sortOrder: sortOrder as 'asc' | 'desc' })
            }}
            disabled={isLoading}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="email-asc">Email (A-Z)</option>
            <option value="email-desc">Email (Z-A)</option>
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="totalSpent-desc">Highest Spender</option>
            <option value="totalSpent-asc">Lowest Spender</option>
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-600">Active filters:</span>
            
            {filters.search && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-800 border border-sky-200">
                Search: "{filters.search}"
              </span>
            )}
            
            {filters.customerType !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                Type: {filters.customerType.charAt(0).toUpperCase() + filters.customerType.slice(1)}
              </span>
            )}
            
            {filters.status !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                Status: {filters.status.charAt(0).toUpperCase() + filters.status.slice(1)}
              </span>
            )}
            
            {filters.companyId !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                Company: {companies.find(c => c._id === filters.companyId)?.companyName || filters.companyId}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
