import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { TripForm } from '@/components/forms/trip-form'
import { getTripById, getTrucksForTrip, getPartiesForTrip } from '../../actions'

interface EditTripPageProps {
  params: { id: string }
}

export default async function EditTripPage({ params }: EditTripPageProps) {
  const [trip, trucks, parties] = await Promise.all([
    getTripById(params.id),
    getTrucksForTrip(),
    getPartiesForTrip()
  ])

  if (!trip) {
    notFound()
  }
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

      <TripForm trucks={trucks} parties={parties} editData={trip} tripId={params.id} />
    </div>
  )
}