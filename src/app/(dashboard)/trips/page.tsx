import { TripsPageClient } from '@/components/pages/trips-page-client'
import { getTrips } from './actions'
export default async function TripsPage() {
  const trips = await getTrips()
  
  return <TripsPageClient trips={trips} />
}