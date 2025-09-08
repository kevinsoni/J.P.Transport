'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createParty } from '@/app/(dashboard)/parties/actions'

export function PartyForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    try {
      await createParty(formData)
    } catch (error) {
      console.error('Party creation failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Party Information</CardTitle>
        <CardDescription>Enter details for the new party</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Party Name *</Label>
              <Input
                type="text"
                name="name"
                placeholder="Enter party name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Party Type *</Label>
              <Select name="type" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select party type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consignor">Consignor (Goods Sender)</SelectItem>
                  <SelectItem value="consignee">Consignee (Goods Receiver)</SelectItem>
                  <SelectItem value="owner">Owner (Vehicle Owner)</SelectItem>
                  <SelectItem value="transport">Transport Company</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                type="tel"
                name="phone"
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                type="email"
                name="email"
                placeholder="Enter email address"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gstin">GSTIN</Label>
              <Input
                type="text"
                name="gstin"
                placeholder="Enter GSTIN number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                type="text"
                name="city"
                placeholder="Enter city"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              type="text"
              name="address"
              placeholder="Enter complete address"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Party...' : 'Create Party'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}