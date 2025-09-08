import Link from 'next/link'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PartiesTable } from '@/components/tables/parties-table'
import { getParties, getPartiesByType } from './actions'

export default async function PartiesPage() {
  const [parties, partyCounts] = await Promise.all([
    getParties(),
    getPartiesByType()
  ])
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Parties</h1>
          <p className="text-gray-600">Manage consignors, consignees, and transport parties</p>
        </div>
        <Button asChild>
          <Link href="/parties/new">
            <Plus className="w-4 h-4 mr-2" />
            Add Party
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Consignors</CardTitle>
            <CardDescription>Goods senders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{partyCounts.consignor}</div>
            <p className="text-sm text-gray-600">Active consignors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Consignees</CardTitle>
            <CardDescription>Goods receivers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{partyCounts.consignee}</div>
            <p className="text-sm text-gray-600">Active consignees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Owners</CardTitle>
            <CardDescription>Vehicle owners</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{partyCounts.owner}</div>
            <p className="text-sm text-gray-600">Truck owners</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Transport</CardTitle>
            <CardDescription>Transport companies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{partyCounts.transport}</div>
            <p className="text-sm text-gray-600">Transport partners</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>All Parties</CardTitle>
          <CardDescription>
            {parties.length > 0 
              ? `Showing ${parties.length} registered ${parties.length === 1 ? 'party' : 'parties'}`
              : 'No parties registered yet'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PartiesTable parties={parties} />
        </CardContent>
      </Card>
    </div>
  )
}