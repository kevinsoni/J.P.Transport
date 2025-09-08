'use server'

import { createClient } from '@/lib/supabase/server'
import { PartySchema } from '@/lib/validators'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createParty(formData: FormData) {
  const supabase = createClient()

  const rawData = {
    name: formData.get('name') as string,
    type: formData.get('type') as 'consignor' | 'consignee' | 'owner' | 'transport',
    phone: formData.get('phone') as string || null,
    email: formData.get('email') as string || null,
    gstin: formData.get('gstin') as string || null,
    address: formData.get('address') as string || null,
    city: formData.get('city') as string || null,
  }

  // Validate the data
  const validatedData = PartySchema.parse(rawData)

  const { error } = await supabase
    .from('parties')
    .insert([validatedData])

  if (error) {
    console.error('Error creating party:', error)
    throw new Error('Failed to create party')
  }

  revalidatePath('/parties')
  redirect('/parties')
}

export async function getParties() {
  const supabase = createClient()

  try {
    const { data: parties, error } = await supabase
      .from('parties')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return parties || []
  } catch (error) {
    console.error('Error fetching parties:', error)
    return []
  }
}

export async function getPartiesByType() {
  const supabase = createClient()

  try {
    const { data: parties, error } = await supabase
      .from('parties')
      .select('type')

    if (error) {
      throw error
    }

    // Count parties by type
    const counts = parties?.reduce((acc, party) => {
      acc[party.type] = (acc[party.type] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    return {
      consignor: counts.consignor || 0,
      consignee: counts.consignee || 0,
      owner: counts.owner || 0,
      transport: counts.transport || 0,
    }
  } catch (error) {
    console.error('Error fetching party counts:', error)
    return {
      consignor: 0,
      consignee: 0,
      owner: 0,
      transport: 0,
    }
  }
}

export async function getPartyById(id: string) {
  const supabase = createClient()

  try {
    const { data: party, error } = await supabase
      .from('parties')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw error
    }

    return party
  } catch (error) {
    console.error('Error fetching party by ID:', error)
    return null
  }
}

export async function deleteParty(id: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('parties')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting party:', error)
    throw new Error('Failed to delete party')
  }

  revalidatePath('/parties')
}

export async function updateParty(id: string, formData: FormData) {
  const supabase = createClient()

  const rawData = {
    name: formData.get('name') as string,
    type: formData.get('type') as 'consignor' | 'consignee' | 'owner' | 'transport',
    phone: formData.get('phone') as string || null,
    email: formData.get('email') as string || null,
    gstin: formData.get('gstin') as string || null,
    address: formData.get('address') as string || null,
    city: formData.get('city') as string || null,
  }

  const validatedData = PartySchema.parse(rawData)

  const { error } = await supabase
    .from('parties')
    .update(validatedData)
    .eq('id', id)

  if (error) {
    console.error('Error updating party:', error)
    throw new Error('Failed to update party')
  }

  revalidatePath('/parties')
  revalidatePath(`/parties/${id}`)
  redirect(`/parties/${id}`)
}