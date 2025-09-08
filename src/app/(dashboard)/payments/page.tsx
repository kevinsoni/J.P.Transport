import Link from 'next/link'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PaymentsTable } from '@/components/tables/payments-table'
import { getPayments } from './actions'

export default async function PaymentsPage() {
  const payments = await getPayments()
  
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

      <Card>
        <CardHeader>
          <CardTitle>Payment Records</CardTitle>
          <CardDescription>
            {payments.length > 0 
              ? `Showing ${payments.length} payment record${payments.length === 1 ? '' : 's'}`
              : 'No payments recorded yet'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentsTable payments={payments} />
        </CardContent>
      </Card>
    </div>
  )
}