'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Edit, CreditCard, FileText } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PaymentPopup } from '@/components/forms/payment-popup'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { TripWithRelations } from '@/types/db'

interface TripDetailsClientProps {
  params: { id: string }
  trip: TripWithRelations
}

export default function TripDetailsClient({ params, trip }: TripDetailsClientProps) {
  const [isPaymentPopupOpen, setIsPaymentPopupOpen] = useState(false)

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
          <Button onClick={() => setIsPaymentPopupOpen(true)}>
            <CreditCard className="w-4 h-4 mr-2" />
            Add Payment
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
                    <label className="text-sm font-medium text-gray-500">Truck Number</label>
                    <p className="text-base">{trip.truck?.truck_no || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Center</label>
                    <p className="text-base">{trip.center_city || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Cargo</label>
                    <p className="text-base">{trip.cargo_details || 'N/A'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Loading Weight</label>
                    <p className="text-base">{trip.loading_weight ? `${trip.loading_weight} MT` : 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Payment Weight</label>
                    <p className="text-base">{trip.payment_weight ? `${trip.payment_weight} MT` : 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">L/R Number</label>
                    <p className="text-base">{trip.lr_no || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">L/R Name</label>
                    <p className="text-base">{trip.lr_name || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Parties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Consignor</label>
                    <p className="text-base">{trip.consignor?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Consignee</label>
                    <p className="text-base">{trip.consignee1?.name || 'N/A'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Truck Owner</label>
                    <p className="text-base">{trip.settlement_party?.name || 'N/A'}</p>
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
              <div className="flex justify-between text-lg font-bold">
                <span>Bill Amount</span>
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
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => setIsPaymentPopupOpen(true)}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Record Payment
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Generate Invoice
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <PaymentPopup
        trip={trip}
        isOpen={isPaymentPopupOpen}
        onClose={() => setIsPaymentPopupOpen(false)}
        onSuccess={() => window.location.reload()}
      />
    </div>
  )
}