import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Truck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getTruckById } from '../actions'

interface TruckDetailPageProps {
  params: {
    id: string
  }
}

export default async function TruckDetailPage({ params }: TruckDetailPageProps) {
  const truck = await getTruckById(params.id)

  if (!truck) {
    notFound()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB')
  }

  const getStatusBadgeVariant = (active: boolean) => {
    return active ? 'default' : 'secondary'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/trucks">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Trucks
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Truck className="w-8 h-8" />
            {truck.truck_no}
          </h1>
        </div>
        <Button asChild>
          <Link href={`/trucks/${truck.id}/edit`}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Truck
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Truck Information</CardTitle>
            <CardDescription>Basic truck details and specifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Truck Number:</span>
              <span className="text-sm font-mono">{truck.truck_no}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Owner:</span>
              <span className="text-sm">
                {truck.owner?.name || 'No Owner Assigned'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Capacity:</span>
              <span className="text-sm">
                {truck.capacity_tons ? `${truck.capacity_tons} tons` : 'Not specified'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status:</span>
              <Badge variant={getStatusBadgeVariant(truck.active)}>
                {truck.active ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Created:</span>
              <span className="text-sm">{formatDate(truck.created_at)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Last Updated:</span>
              <span className="text-sm">{formatDate(truck.updated_at)}</span>
            </div>
          </CardContent>
        </Card>

        {truck.owner && (
          <Card>
            <CardHeader>
              <CardTitle>Owner Information</CardTitle>
              <CardDescription>Details about the truck owner</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Name:</span>
                <span className="text-sm">{truck.owner.name}</span>
              </div>

              {truck.owner.phone && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Phone:</span>
                  <span className="text-sm font-mono">{truck.owner.phone}</span>
                </div>
              )}

              {truck.owner.address && (
                <div className="flex items-start justify-between">
                  <span className="text-sm font-medium">Address:</span>
                  <span className="text-sm text-right max-w-xs">{truck.owner.address}</span>
                </div>
              )}

              {truck.owner.city && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">City:</span>
                  <span className="text-sm">{truck.owner.city}</span>
                </div>
              )}

              <div className="pt-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/parties/${truck.owner_id}`}>
                    View Owner Details
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}