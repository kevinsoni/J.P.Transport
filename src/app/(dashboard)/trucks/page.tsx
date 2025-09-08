import Link from 'next/link'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrucksTable } from '@/components/tables/trucks-table'
import { getTrucks } from './actions'

export default async function TrucksPage() {
  const trucks = await getTrucks()
  
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trucks</h1>
          <p className="text-gray-600">Manage your fleet of vehicles</p>
        </div>
        <Button asChild>
          <Link href="/trucks/new">
            <Plus className="w-4 h-4 mr-2" />
            Add Truck
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Truck Fleet</CardTitle>
          <CardDescription>
            {trucks.length > 0 
              ? `Showing ${trucks.length} truck${trucks.length === 1 ? '' : 's'}`
              : 'No trucks registered yet'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TrucksTable trucks={trucks} />
        </CardContent>
      </Card>
    </div>
  )
}