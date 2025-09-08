import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getTruckById, updateTruck, getOwnersForTruck } from '../../actions'

interface TruckEditPageProps {
  params: {
    id: string
  }
}

export default async function TruckEditPage({ params }: TruckEditPageProps) {
  const [truck, owners] = await Promise.all([
    getTruckById(params.id),
    getOwnersForTruck()
  ])

  if (!truck) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/trucks/${truck.id}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Truck
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Truck</h1>
          <p className="text-gray-600">Update truck information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Truck Details</CardTitle>
          <CardDescription>Update the truck information below</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateTruck.bind(null, truck.id)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="truck_no">Truck Number*</Label>
                <Input
                  id="truck_no"
                  name="truck_no"
                  type="text"
                  defaultValue={truck.truck_no}
                  placeholder="Enter truck number"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity_tons">Capacity (Tons)</Label>
                <Input
                  id="capacity_tons"
                  name="capacity_tons"
                  type="number"
                  step="0.1"
                  min="0"
                  defaultValue={truck.capacity_tons || ''}
                  placeholder="Enter capacity in tons"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="owner_id">Owner</Label>
                <Select name="owner_id" defaultValue={truck.owner_id || 'none'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select owner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Owner</SelectItem>
                    {owners.map((owner) => (
                      <SelectItem key={owner.id} value={owner.id}>
                        {owner.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="active">Status</Label>
                <Select name="active" defaultValue={truck.active.toString()}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit">Update Truck</Button>
              <Button type="button" variant="outline" asChild>
                <Link href={`/trucks/${truck.id}`}>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}