'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PaymentsTable } from '@/components/tables/payments-table'
import { PaymentFilters, type PaymentFilters as PaymentFiltersType } from '@/components/filters/payment-filters'
import { getPayments } from './actions'

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [filters, setFilters] = useState<PaymentFiltersType>({
    dateFrom: '',
    dateTo: '',
    method: 'ALL',
    minAmount: '',
    maxAmount: '',
    truckNo: ''
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const data = await getPayments()
        setPayments(data)
      } catch (error) {
        console.error('Error fetching payments:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPayments()
  }, [])
  
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-gray-600">Track and manage payment records</p>
        </div>
        <Button asChild>
          <Link href="/payments/new">
            <Plus className="w-4 h-4 mr-2" />
            Record Payment
          </Link>
        </Button>
      </div>

      <div className="space-y-6">
        <PaymentFilters onFiltersChange={setFilters} />
        
        <Card>
          <CardHeader>
            <CardTitle>Payment Records</CardTitle>
            <CardDescription>
              {loading ? 'Loading...' : payments.length > 0 
                ? `Showing ${payments.length} payment record${payments.length === 1 ? '' : 's'}`
                : 'No payments recorded yet'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : (
              <PaymentsTable payments={payments} filters={filters} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}