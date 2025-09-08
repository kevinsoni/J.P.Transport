import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function NewPaymentPage() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/payments">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Record Payment</h1>
          <p className="text-gray-600">Add a new payment to the system</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Form</CardTitle>
          <CardDescription>
            Comprehensive payment recording form ready for implementation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              The payment form will be implemented with server actions.
              This will include:
            </p>
            <ul className="text-left text-gray-600 space-y-2 max-w-md mx-auto">
              <li>• Trip selection and details</li>
              <li>• Payment amount and date</li>
              <li>• Payment method (CASH, UPI, BANK, OTHER)</li>
              <li>• Reference number for tracking</li>
              <li>• Payment notes and remarks</li>
              <li>• Automatic balance calculation</li>
            </ul>
            <Button className="mt-6" asChild>
              <Link href="/payments">
                Back to Payments
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}