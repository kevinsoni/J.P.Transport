'use server'

import { createClient } from '@/lib/supabase/server'
import { TruckSchema } from '@/lib/validators'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createTruck(formData: FormData) {
  const supabase = createClient()

  try {
    const ownerIdValue = formData.get('owner_id') as string
    const rawData = {
      truck_no: formData.get('truck_no') as string,
      owner_id: ownerIdValue === 'none' ? null : ownerIdValue || null,
      capacity_tons: formData.get('capacity_tons') ? parseFloat(formData.get('capacity_tons') as string) : null,
      active: formData.get('active') === 'true',
    }
    
    const validatedData = TruckSchema.parse(rawData)

    const { error } = await supabase
      .from('trucks')
      .insert([validatedData])

    if (error) {
      console.error('Supabase error creating truck:', error)
      
      // Handle specific error types
      if (error.code === '23505' && error.message.includes('trucks_truck_no_key')) {
        throw new Error('A truck with this number already exists. Please use a different truck number.')
      }
      throw new Error(`Failed to create truck: ${error.message}`)
    }

    revalidatePath('/trucks')
    redirect('/trucks')
  } catch (error) {
    console.error('Error in createTruck:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to create truck: Unknown error')
  }
}

export async function getTrucks() {
  const supabase = createClient()

  try {
    const { data: trucks, error } = await supabase
      .from('trucks')
      .select(`
        *,
        owner:parties!owner_id(name)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return trucks || []
  } catch (error) {
    console.error('Error fetching trucks:', error)
    return []
  }
}

export async function getTruckById(id: string) {
  const supabase = createClient()

  try {
    const { data: truck, error } = await supabase
      .from('trucks')
      .select(`
        *,
        owner:parties!owner_id(name, phone, address, city)
      `)
      .eq('id', id)
      .single()

    if (error) {
      throw error
    }

    return truck
  } catch (error) {
    console.error('Error fetching truck by ID:', error)
    return null
  }
}

export async function deleteTruck(id: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('trucks')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting truck:', error)
    throw new Error('Failed to delete truck')
  }

  revalidatePath('/trucks')
}

export async function updateTruck(id: string, formData: FormData) {
  const supabase = createClient()

  const ownerIdValue = formData.get('owner_id') as string
  const rawData = {
    truck_no: formData.get('truck_no') as string,
    owner_id: ownerIdValue === 'none' ? null : ownerIdValue || null,
    capacity_tons: formData.get('capacity_tons') ? parseFloat(formData.get('capacity_tons') as string) : null,
    active: formData.get('active') === 'true',
  }

  const validatedData = TruckSchema.parse(rawData)

  const { error } = await supabase
    .from('trucks')
    .update(validatedData)
    .eq('id', id)

  if (error) {
    console.error('Error updating truck:', error)
    throw new Error('Failed to update truck')
  }

  revalidatePath('/trucks')
  revalidatePath(`/trucks/${id}`)
  redirect(`/trucks/${id}`)
}

export async function getOwnersForTruck() {
  const supabase = createClient()

  try {
    const { data: owners, error } = await supabase
      .from('parties')
      .select('*')
      .eq('type', 'owner')
      .order('name')

    if (error) {
      throw error
    }

    return owners || []
  } catch (error) {
    console.error('Error fetching owners:', error)
    return []
  }
}