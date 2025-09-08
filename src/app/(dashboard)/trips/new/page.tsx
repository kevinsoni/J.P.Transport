import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function NewTripPage() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/trips">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Trip</h1>
          <p className="text-gray-600">Add a new transport trip to the system</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trip Form</CardTitle>
          <CardDescription>
            Comprehensive trip creation form ready for implementation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              The trip creation form will be implemented with server actions.
              This will include:
            </p>
            <ul className="text-left text-gray-600 space-y-2 max-w-md mx-auto">
              <li>• Trip details (date, status, route)</li>
              <li>• Truck and driver selection</li>
              <li>• Consignor/consignee selection</li>
              <li>• Cargo and transport details</li>
              <li>• Amount calculation with live updates</li>
              <li>• Material type and documentation</li>
            </ul>
            <Button className="mt-6" asChild>
              <Link href="/trips">
                Back to Trips
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}