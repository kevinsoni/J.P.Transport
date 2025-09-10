'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X } from 'lucide-react'

interface PaymentFiltersProps {
  onFiltersChange: (filters: PaymentFilters) => void
}

export interface PaymentFilters {
  dateFrom: string
  dateTo: string
  method: string
  minAmount: string
  maxAmount: string
  truckNo: string
}

export function PaymentFilters({ onFiltersChange }: PaymentFiltersProps) {
  const [filters, setFilters] = useState<PaymentFilters>({
    dateFrom: '',
    dateTo: '',
    method: 'ALL',
    minAmount: '',
    maxAmount: '',
    truckNo: ''
  })

  const handleFilterChange = (key: keyof PaymentFilters, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    const emptyFilters: PaymentFilters = {
      dateFrom: '',
      dateTo: '',
      method: 'ALL',
      minAmount: '',
      maxAmount: '',
      truckNo: ''
    }
    setFilters(emptyFilters)
    onFiltersChange(emptyFilters)
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== '')

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dateFrom">From Date</Label>
            <Input
              type="date"
              id="dateFrom"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dateTo">To Date</Label>
            <Input
              type="date"
              id="dateTo"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">Payment Method</Label>
            <Select value={filters.method} onValueChange={(value) => handleFilterChange('method', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All methods</SelectItem>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="BANK">Bank Transfer</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="minAmount">Min Amount</Label>
            <Input
              type="number"
              id="minAmount"
              placeholder="0"
              value={filters.minAmount}
              onChange={(e) => handleFilterChange('minAmount', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxAmount">Max Amount</Label>
            <Input
              type="number"
              id="maxAmount"
              placeholder="No limit"
              value={filters.maxAmount}
              onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="truckNo">Truck Number</Label>
            <Input
              id="truckNo"
              placeholder="Search truck..."
              value={filters.truckNo}
              onChange={(e) => handleFilterChange('truckNo', e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}