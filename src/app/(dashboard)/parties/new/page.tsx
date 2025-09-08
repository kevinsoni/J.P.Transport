import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { PartyForm } from '@/components/forms/party-form'

export default function NewPartyPage() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/parties">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Party</h1>
          <p className="text-gray-600">Create a new party (consignor, consignee, owner, or transport)</p>
        </div>
      </div>

      <PartyForm />
    </div>
  )
}