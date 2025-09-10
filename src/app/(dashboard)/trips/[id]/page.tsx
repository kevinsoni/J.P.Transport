import { getTripById } from '../actions'
import { notFound } from 'next/navigation'
import TripDetailsClient from './trip-details-client'

interface TripDetailsPageProps {
  params: { id: string }
}

export default async function TripDetailsPage({ params }: TripDetailsPageProps) {
  const trip = await getTripById(params.id)
  
  if (!trip) {
    notFound()
  }

  return <TripDetailsClient params={params} trip={trip} />
}