import { TruckForm } from '@/components/forms/truck-form'
import { getOwnersForTruck } from '../actions'

export default async function NewTruckPage() {
  const owners = await getOwnersForTruck()

  return <TruckForm owners={owners} />
}