import React from 'react'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/Button'
import { Calendar, Filter, X } from 'lucide-react'

interface AdvancedFiltersProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  statusFilter: string
  setStatusFilter: (status: string) => void
  purposeFilter: string
  setPurposeFilter: (purpose: string) => void
  dateFrom: string
  setDateFrom: (date: string) => void
  dateTo: string
  setDateTo: (date: string) => void
  onClearFilters: () => void
  onApplyFilters: () => void
}

export default function AdvancedFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  purposeFilter,
  setPurposeFilter,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  onClearFilters,
  onApplyFilters
}: AdvancedFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-lg border space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Advanced Filters
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-4 h-4 mr-1" />
          Clear All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="text-sm font-medium text-gray-600 mb-1 block">
            Search
          </label>
          <Input
            placeholder="Search gate passes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Status Filter */}
        <div>
          <label className="text-sm font-medium text-gray-600 mb-1 block">
            Status
          </label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
              <SelectItem value="all" className="bg-white hover:bg-gray-50">All Status</SelectItem>
              <SelectItem value="active" className="bg-white hover:bg-gray-50">Active</SelectItem>
              <SelectItem value="completed" className="bg-white hover:bg-gray-50">Completed</SelectItem>
              <SelectItem value="expired" className="bg-white hover:bg-gray-50">Expired</SelectItem>
              <SelectItem value="cancelled" className="bg-white hover:bg-gray-50">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Purpose Filter */}
        <div>
          <label className="text-sm font-medium text-gray-600 mb-1 block">
            Purpose
          </label>
          <Select value={purposeFilter} onValueChange={setPurposeFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Purpose" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
              <SelectItem value="all" className="bg-white hover:bg-gray-50">All Purpose</SelectItem>
              <SelectItem value="delivery" className="bg-white hover:bg-gray-50">Delivery</SelectItem>
              <SelectItem value="pickup" className="bg-white hover:bg-gray-50">Pickup</SelectItem>
              <SelectItem value="maintenance" className="bg-white hover:bg-gray-50">Maintenance</SelectItem>
              <SelectItem value="other" className="bg-white hover:bg-gray-50">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range */}
        <div>
          <label className="text-sm font-medium text-gray-600 mb-1 block">
            Date Range
          </label>
          <div className="flex gap-2">
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="flex-1"
              placeholder="From"
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="flex-1"
              placeholder="To"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={onApplyFilters} className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Apply Filters
        </Button>
      </div>
    </div>
  )
}
