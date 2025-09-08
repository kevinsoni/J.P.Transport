import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface EditTripPageProps {
  params: { id: string }
}

export default function EditTripPage({ params }: EditTripPageProps) {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/trips/${params.id}`}>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Trip</h1>
          <p className="text-gray-600">Trip ID: {params.id}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Trip Form</CardTitle>
          <CardDescription>
            Modify trip details with real-time calculations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              The trip editing form will be implemented with server actions.
              This will include all the same features as the creation form plus:
            </p>
            <ul className="text-left text-gray-600 space-y-2 max-w-md mx-auto">
              <li>• Pre-populated form fields</li>
              <li>• Real-time calculation updates</li>
              <li>• Status change tracking</li>
              <li>• Payment history preservation</li>
              <li>• Audit trail for changes</li>
            </ul>
            <div className="flex gap-3 justify-center mt-6">
              <Button asChild>
                <Link href={`/trips/${params.id}`}>
                  Back to Details
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/trips">
                  All Trips
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}