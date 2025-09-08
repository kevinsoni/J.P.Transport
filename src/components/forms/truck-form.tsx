'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createTruck } from '@/app/(dashboard)/trucks/actions'
import { Party } from '@/types/db'

interface TruckFormProps {
  owners: Party[]
}

export function TruckForm({ owners }: TruckFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [ownerId, setOwnerId] = useState<string>('none')
  const [active, setActive] = useState<string>('true')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    
    const formData = new FormData(event.currentTarget)
    
    // Ensure Select values are properly set in FormData
    formData.set('owner_id', ownerId)
    formData.set('active', active)
    
    console.log('FormData contents:')
    for (const [key, value] of formData.entries()) {
      console.log(key, value)
    }
    
    try {
      await createTruck(formData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create truck'
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Truck</h1>
          <p className="text-gray-600">Register a new truck in the system</p>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="text-red-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Truck Details</CardTitle>
          <CardDescription>Enter the truck information below</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="truck_no">Truck Number*</Label>
                <Input
                  id="truck_no"
                  name="truck_no"
                  type="text"
                  placeholder="Enter truck number"
                  required
                />
                <p className="text-xs text-gray-500">
                  Example: MH-12-AB-1234 or GJ-01-CD-5678
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity_tons">Capacity (Tons)</Label>
                <Input
                  id="capacity_tons"
                  name="capacity_tons"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="Enter capacity in tons"
                />
                <p className="text-xs text-gray-500">
                  Leave blank if not specified
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="owner_id">Owner</Label>
                <Select name="owner_id" value={ownerId} onValueChange={setOwnerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select owner (optional)" />
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
                <p className="text-xs text-gray-500">
                  Select the truck owner from registered parties
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="active">Status</Label>
                <Select name="active" value={active} onValueChange={setActive}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Set truck status
                </p>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating Truck...' : 'Create Truck'}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/trucks">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-2">
          <p>• Truck number should be unique in the system</p>
          <p>• Owner can be assigned later by editing the truck</p>
          <p>• Capacity helps in planning cargo loads</p>
          <p>• Only active trucks appear in trip assignments</p>
        </CardContent>
      </Card>
    </div>
  )
}