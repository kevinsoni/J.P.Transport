'use client'

import { useEffect, useState } from 'react'
import { Filter, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { FiltersData } from '@/lib/validators'

interface FilterBarProps {
  filters: FiltersData
  onFiltersChange: (filters: FiltersData) => void
  showExpanded?: boolean
  onToggleExpanded?: () => void
  hideHeader?: boolean
}

export function FilterBar({
  filters,
  onFiltersChange,
  showExpanded = false,
  onToggleExpanded,
  hideHeader = false,
}: FilterBarProps) {
  const [localFilters, setLocalFilters] = useState(filters)

  // Keep local inputs in sync when the parent resets/changes filters (e.g. "Clear all").
  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const updateFilter = (key: keyof FiltersData, value: string | undefined) => {
    const newFilters = { ...localFilters, [key]: value || undefined }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    const emptyFilters: FiltersData = {}
    setLocalFilters(emptyFilters)
    onFiltersChange(emptyFilters)
  }

  const hasActiveFilters = Object.values(localFilters).some(value => value !== undefined && value !== '')

  return (
    <div>
      {!hideHeader && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Filter className="h-4 w-4" />
            </div>
            <span className="font-semibold text-gray-800">Filters</span>
            {hasActiveFilters && (
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600">
                {Object.values(localFilters).filter(v => v).length} active
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button onClick={clearFilters} variant="ghost" size="sm" className="text-gray-500 hover:text-red-600">
                <X className="mr-1 h-4 w-4" />
                Clear
              </Button>
            )}
            {onToggleExpanded && (
              <Button onClick={onToggleExpanded} variant="outline" size="sm">
                {showExpanded ? 'Simple' : 'Advanced'}
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="dateFrom" className="text-sm font-medium">From Date</Label>
            <Input
              id="dateFrom"
              type="date"
              value={localFilters.dateFrom || ''}
              onChange={(e) => updateFilter('dateFrom', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="dateTo" className="text-sm font-medium">To Date</Label>
            <Input
              id="dateTo"
              type="date"
              value={localFilters.dateTo || ''}
              onChange={(e) => updateFilter('dateTo', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="status" className="text-sm font-medium">Status</Label>
            <Select
              value={localFilters.status || undefined}
              onValueChange={(value) => updateFilter('status', value === 'all' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="IN">IN</SelectItem>
                <SelectItem value="OUT">OUT</SelectItem>
                <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                <SelectItem value="CANCELLED">CANCELLED</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="paymentStatus" className="text-sm font-medium">Payment Status</Label>
            <Select
              value={localFilters.paymentStatus || undefined}
              onValueChange={(value) => updateFilter('paymentStatus', value === 'all' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All payment statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment Statuses</SelectItem>
                <SelectItem value="UNPAID">UNPAID</SelectItem>
                <SelectItem value="PARTIAL">PARTIAL</SelectItem>
                <SelectItem value="PAID">PAID</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {showExpanded && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-4 pt-4 border-t">
            <div>
              <Label htmlFor="city" className="text-sm font-medium">City</Label>
              <Input
                id="city"
                placeholder="Enter city name"
                value={localFilters.city || ''}
                onChange={(e) => updateFilter('city', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="truckNo" className="text-sm font-medium">Truck No.</Label>
              <Input
                id="truckNo"
                placeholder="Enter truck number"
                value={localFilters.truckNo || ''}
                onChange={(e) => updateFilter('truckNo', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="consignee" className="text-sm font-medium">Consignee</Label>
              <Input
                id="consignee"
                placeholder="Enter consignee name"
                value={localFilters.consignee || ''}
                onChange={(e) => updateFilter('consignee', e.target.value)}
              />
            </div>
          </div>
        )}
    </div>
  )
}