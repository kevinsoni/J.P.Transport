import Link from 'next/link'
import { ArrowLeft, Edit, Phone, Mail, MapPin } from 'lucide-react'
import { notFound } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getPartyById } from '../actions'

interface PartyDetailsPageProps {
  params: { id: string }
}

export default async function PartyDetailsPage({ params }: PartyDetailsPageProps) {
  const party = await getPartyById(params.id)
  
  if (!party) {
    notFound()
  }

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'consignor': return 'default' as const
      case 'consignee': return 'secondary' as const
      case 'owner': return 'outline' as const
      case 'transport': return 'destructive' as const
      default: return 'secondary' as const
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'consignor': return 'Consignor'
      case 'consignee': return 'Consignee'
      case 'owner': return 'Owner'
      case 'transport': return 'Transport'
      default: return type
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/parties">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Party Details</h1>
          <p className="text-gray-600">Party ID: {params.id}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/parties/${params.id}/edit`}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Party
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {party.name}
              <Badge variant={getTypeBadgeVariant(party.type)}>
                {getTypeLabel(party.type)}
              </Badge>
            </CardTitle>
            <CardDescription>Party information and contact details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {party.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="text-base">{party.phone}</p>
                  </div>
                </div>
              )}
              
              {party.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-base">{party.email}</p>
                  </div>
                </div>
              )}
              
              {party.address && (
                <div className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Address</p>
                    <p className="text-base">{party.address}</p>
                    {party.city && (
                      <p className="text-sm text-gray-600">{party.city}</p>
                    )}
                  </div>
                </div>
              )}

              {party.gstin && (
                <div>
                  <p className="text-sm font-medium text-gray-500">GSTIN</p>
                  <p className="text-base font-mono">{party.gstin}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href={`/parties/${params.id}/edit`}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Party Details
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/trips/new">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Create Trip with this Party
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}