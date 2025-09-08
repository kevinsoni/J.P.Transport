import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { getPartyById, updateParty } from '../../actions'

interface EditPartyPageProps {
  params: { id: string }
}

export default async function EditPartyPage({ params }: EditPartyPageProps) {
  const party = await getPartyById(params.id)
  
  if (!party) {
    notFound()
  }

  const updatePartyWithId = updateParty.bind(null, params.id)

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/parties/${params.id}`}>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Party</h1>
          <p className="text-gray-600">Update party details</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Party Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updatePartyWithId} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input 
                  type="text" 
                  id="name" 
                  name="name" 
                  defaultValue={party.name}
                  placeholder="Enter party name" 
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select name="type" defaultValue={party.type} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select party type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consignor">Consignor</SelectItem>
                    <SelectItem value="consignee">Consignee</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="transport">Transport</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  type="tel" 
                  id="phone" 
                  name="phone" 
                  defaultValue={party.phone || ''}
                  placeholder="Enter phone number" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  type="email" 
                  id="email" 
                  name="email" 
                  defaultValue={party.email || ''}
                  placeholder="Enter email address" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gstin">GSTIN</Label>
                <Input 
                  type="text" 
                  id="gstin" 
                  name="gstin" 
                  defaultValue={party.gstin || ''}
                  placeholder="Enter GSTIN number" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input 
                  type="text" 
                  id="city" 
                  name="city" 
                  defaultValue={party.city || ''}
                  placeholder="Enter city" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea 
                id="address" 
                name="address" 
                defaultValue={party.address || ''}
                placeholder="Enter complete address"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button variant="outline" asChild>
                <Link href={`/parties/${params.id}`}>Cancel</Link>
              </Button>
              <Button type="submit">Update Party</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}