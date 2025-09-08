import Link from 'next/link'
import { ArrowLeft, Edit, CreditCard, FileText } from 'lucide-react'
import { notFound } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getTripById } from '../actions'
import { formatCurrency, formatDate } from '@/lib/utils'

interface TripDetailsPageProps {
  params: { id: string }
}

export default async function TripDetailsPage({ params }: TripDetailsPageProps) {
  const trip = await getTripById(params.id)
  
  if (!trip) {
    notFound()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'default'
      case 'IN': return 'secondary'
      case 'OUT': return 'destructive'
      case 'CANCELLED': return 'outline'
      default: return 'secondary'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'default'
      case 'PARTIAL': return 'secondary'
      case 'UNPAID': return 'destructive'
      default: return 'outline'
    }
  }
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/trips">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Trip Details</h1>
          <p className="text-gray-600">Trip ID: {params.id}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/payments/new?tripId=${params.id}`}>
              <CreditCard className="w-4 h-4 mr-2" />
              Add Payment
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/trips/${params.id}/edit`}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Trip
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Trip Information
                <div className="flex gap-2">
                  <Badge variant={getStatusColor(trip.status)}>{trip.status}</Badge>
                  <Badge variant={getPaymentStatusColor(trip.payment_status)}>{trip.payment_status}</Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date</label>
                    <p className="text-base">{formatDate(trip.trip_date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Truck</label>
                    <p className="text-base">{trip.truck?.truck_no || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Driver</label>
                    <p className="text-base">
                      {trip.driver_name || 'N/A'}
                      {trip.driver_phone && ` (${trip.driver_phone})`}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">LR Number</label>
                    <p className="text-base">{trip.lr_no || 'N/A'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Route</label>
                    <p className="text-base">
                      {trip.origin_city && trip.destination_city 
                        ? `${trip.origin_city} → ${trip.destination_city}`
                        : trip.center_city || 'N/A'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Cargo</label>
                    <p className="text-base">
                      {trip.cargo_details || trip.material_type || 'N/A'}
                      {trip.weight_mt && ` (${trip.weight_mt} MT)`}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Packages</label>
                    <p className="text-base">{trip.no_of_packages ? `${trip.no_of_packages} packages` : 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Invoice</label>
                    <p className="text-base">{trip.invoice_no || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>All payments received for this trip</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {trip.payments && trip.payments.length > 0 ? (
                  trip.payments.map((payment: any) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{formatDate(payment.payment_date)}</p>
                        <p className="text-sm text-gray-600">
                          {payment.method} Payment
                          {payment.reference_no && ` - ${payment.reference_no}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(payment.amount)}</p>
                        <p className="text-sm text-green-600">{payment.notes || 'Payment'}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No payments recorded yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Freight Amount</span>
                <span>{formatCurrency(trip.freight_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span>RTO Charges</span>
                <span>{formatCurrency(trip.rto_charges)}</span>
              </div>
              <div className="flex justify-between">
                <span>Toll Charges</span>
                <span>{formatCurrency(trip.toll_charges)}</span>
              </div>
              <div className="flex justify-between">
                <span>Loading/Unloading</span>
                <span>{formatCurrency(trip.loading_unloading)}</span>
              </div>
              <div className="flex justify-between">
                <span>Other Charges</span>
                <span>{formatCurrency(trip.other_charges)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Diesel Advance</span>
                <span>-{formatCurrency(trip.diesel_advance)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(trip.freight_amount + trip.rto_charges + trip.toll_charges + trip.loading_unloading + trip.other_charges - trip.diesel_advance)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({trip.tax_percent}%)</span>
                  <span>{formatCurrency((trip.freight_amount + trip.rto_charges + trip.toll_charges + trip.loading_unloading + trip.other_charges - trip.diesel_advance) * trip.tax_percent / 100)}</span>
                </div>
              </div>
              <div className="border-t pt-2 font-semibold">
                <div className="flex justify-between text-lg">
                  <span>Total Amount</span>
                  <span>{formatCurrency(trip.total_amount)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Amount Received</span>
                  <span>{formatCurrency(trip.amount_received)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Balance Due</span>
                  <span>{formatCurrency(trip.balance_due)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href={`/trips/${params.id}/edit`}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Trip Details
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href={`/payments/new?tripId=${params.id}`}>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Record Payment
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Generate Invoice
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}