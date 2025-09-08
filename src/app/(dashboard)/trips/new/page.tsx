import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { TripForm } from '@/components/forms/trip-form'
import { getTrucksForTrip, getPartiesForTrip } from '../actions'

export default async function NewTripPage() {
  const [trucks, parties] = await Promise.all([
    getTrucksForTrip(),
    getPartiesForTrip()
  ])

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

      <TripForm trucks={trucks} parties={parties} />
    </div>
  )
}