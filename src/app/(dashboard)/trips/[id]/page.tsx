import Link from 'next/link'
import { ArrowLeft, Edit, CreditCard, FileText } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface TripDetailsPageProps {
  params: { id: string }
}

export default function TripDetailsPage({ params }: TripDetailsPageProps) {
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
                  <Badge>COMPLETED</Badge>
                  <Badge variant="secondary">PAID</Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date</label>
                    <p className="text-base">January 15, 2024</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Truck</label>
                    <p className="text-base">MH12AB1234</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Driver</label>
                    <p className="text-base">Ravi Kumar (9876543210)</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">LR Number</label>
                    <p className="text-base">LR001</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Route</label>
                    <p className="text-base">Mumbai → Delhi</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Cargo</label>
                    <p className="text-base">Electronics (15.5 MT)</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Packages</label>
                    <p className="text-base">100 packages</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Invoice</label>
                    <p className="text-base">INV001</p>
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
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">January 20, 2024</p>
                    <p className="text-sm text-gray-600">UPI Payment - UPI123456</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹58,950</p>
                    <p className="text-sm text-green-600">Full Payment</p>
                  </div>
                </div>
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
                <span>₹50,000</span>
              </div>
              <div className="flex justify-between">
                <span>RTO Charges</span>
                <span>₹2,000</span>
              </div>
              <div className="flex justify-between">
                <span>Toll Charges</span>
                <span>₹1,500</span>
              </div>
              <div className="flex justify-between">
                <span>Loading/Unloading</span>
                <span>₹1,000</span>
              </div>
              <div className="flex justify-between">
                <span>Other Charges</span>
                <span>₹500</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Diesel Advance</span>
                <span>-₹5,000</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹50,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (18%)</span>
                  <span>₹8,950</span>
                </div>
              </div>
              <div className="border-t pt-2 font-semibold">
                <div className="flex justify-between text-lg">
                  <span>Total Amount</span>
                  <span>₹58,950</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Amount Received</span>
                  <span>₹58,950</span>
                </div>
                <div className="flex justify-between">
                  <span>Balance Due</span>
                  <span>₹0</span>
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