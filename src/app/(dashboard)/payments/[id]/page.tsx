import Link from 'next/link'
import { ArrowLeft, Edit, FileText } from 'lucide-react'
import { notFound } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getPaymentById } from '../actions'
import { formatCurrency, formatDate } from '@/lib/utils'

interface PaymentDetailsPageProps {
  params: { id: string }
}

export default async function PaymentDetailsPage({ params }: PaymentDetailsPageProps) {
  const payment = await getPaymentById(params.id)
  
  if (!payment) {
    notFound()
  }

  const getMethodBadgeVariant = (method: string) => {
    switch (method) {
      case 'CASH': return 'secondary' as const
      case 'UPI': return 'default' as const
      case 'BANK': return 'outline' as const
      case 'OTHER': return 'destructive' as const
      default: return 'secondary' as const
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/payments">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Payment Details</h1>
          <p className="text-gray-600">Payment ID: {params.id}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/payments/${params.id}/edit`}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Payment
            </Link>
          </Button>
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Generate Receipt
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Date</label>
                <p className="text-base">{formatDate(payment.payment_date)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Amount</label>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(payment.amount)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Method</label>
                <div className="mt-1">
                  <Badge variant={getMethodBadgeVariant(payment.method)}>
                    {payment.method}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Reference Number</label>
                <p className="text-base font-mono">{payment.reference_no || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Notes</label>
                <p className="text-base">{payment.notes || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Associated Trip</CardTitle>
            <CardDescription>Trip details for this payment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Trip Reference</label>
                <p className="text-base">
                  {payment.trip?.lr_no || payment.trip?.invoice_no || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Trip Date</label>
                <p className="text-base">
                  {payment.trip?.trip_date ? formatDate(payment.trip.trip_date) : 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Route</label>
                <p className="text-base">
                  {payment.trip?.origin_city && payment.trip?.destination_city 
                    ? `${payment.trip.origin_city} → ${payment.trip.destination_city}`
                    : 'N/A'
                  }
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Truck</label>
                <p className="text-base">{payment.trip?.truck?.truck_no || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Consignor</label>
                <p className="text-base">{payment.trip?.consignor?.name || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}