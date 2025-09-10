import { getTripById } from '../actions'
import TripDetailsPage from './page'
import { notFound } from 'next/navigation'

interface TripDetailsWrapperProps {
  params: { id: string }
}

export default async function TripDetailsWrapper({ params }: TripDetailsWrapperProps) {
  const trip = await getTripById(params.id)
  
  if (!trip) {
    notFound()
  }

  return <TripDetailsPage params={params} trip={trip} />
}