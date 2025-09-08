import Link from 'next/link'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function PaymentsPage() {
  
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
          <CardTitle>Payment Management</CardTitle>
          <CardDescription>
            This feature is ready for implementation with server actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            The payments table and functionality will be implemented when server actions are added.
            The database schema and types are already prepared.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}