'use server'

import { createClient } from '@/lib/supabase/server'
import { TripSchema } from '@/lib/validators'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

function parseExtraCharges(raw: FormDataEntryValue | null) {
  if (typeof raw !== 'string' || raw.trim() === '') return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((item: any) => ({
        label: String(item?.label ?? '').trim(),
        amount: Number(item?.amount) || 0,
        sign: item?.sign === '-' ? ('-' as const) : ('+' as const),
        // Default to included unless explicitly set to false.
        include: item?.include !== false,
      }))
      .filter((item) => item.label !== '' && item.amount > 0)
  } catch {
    return []
  }
}

function parseTripFormData(formData: FormData) {
  return {
    trip_date: formData.get('trip_date') as string,
    status: (formData.get('status') as 'IN' | 'OUT' | 'COMPLETED' | 'CANCELLED') || 'OUT',
    truck_id: formData.get('truck_id') as string,
    center_city: formData.get('center_city') as string || null,
    cargo_details: formData.get('cargo_details') as string || null,
    consignor_id: formData.get('consignor_id') as string,
    consignor2_id: formData.get('consignor2_id') as string || null,
    consignee1_id: formData.get('consignee1_id') as string,
    lr_no: formData.get('lr_no') as string || null,
    lr_name: formData.get('lr_name') as string || null,
    party_payment_name: formData.get('party_payment_name') as string || null,
    loading_weight: formData.get('loading_weight') ? parseFloat(formData.get('loading_weight') as string) : null,
    payment_weight: formData.get('payment_weight') ? parseFloat(formData.get('payment_weight') as string) : null,
    rate: parseFloat(formData.get('rate') as string) || 0,
    tp_charge_consignor1: parseFloat(formData.get('tp_charge_consignor1') as string) || 0,
    tp_charge_consignor2: parseFloat(formData.get('tp_charge_consignor2') as string) || 0,
    rto_charge_gujarat: parseFloat(formData.get('rto_charge_gujarat') as string) || 0,
    rto_charge_maharashtra: parseFloat(formData.get('rto_charge_maharashtra') as string) || 0,
    lr_amount: Math.round(parseFloat(formData.get('lr_amount') as string) || 0),
    driver_cash_received: Math.round(parseFloat(formData.get('driver_cash_received') as string) || 0),
    extra_charges: parseExtraCharges(formData.get('extra_charges')),
    settlement_party_id: formData.get('settlement_party_id') as string || null,
    remarks: formData.get('remarks') as string || null,
  }
}

export async function createTrip(formData: FormData): Promise<{ error: string } | void> {
  const supabase = createClient()

  const parsed = TripSchema.safeParse(parseTripFormData(formData))
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || 'Please check the form values.' }
  }

  const { error } = await supabase
    .from('trips')
    .insert([parsed.data])

  if (error) {
    console.error('Error creating trip:', error)
    return { error: `Failed to create trip: ${error.message}` }
  }

  revalidatePath('/trips')
  redirect('/trips')
}

export async function getTrucksForTrip() {
  const supabase = createClient()

  try {
    const { data: trucks, error } = await supabase
      .from('trucks')
      .select(`
        *
      `)
      .eq('active', true)
      .order('truck_no')

    if (error) {
      throw error
    }

    return trucks || []
  } catch (error) {
    console.error('Error fetching trucks:', error)
    return []
  }
}

export async function getPartiesForTrip() {
  const supabase = createClient()

  try {
    const { data: parties, error } = await supabase
      .from('parties')
      .select('*')
      .order('name')

    if (error) {
      throw error
    }

    return parties || []
  } catch (error) {
    console.error('Error fetching parties:', error)
    return []
  }
}

export async function getTrips() {
  const supabase = createClient()

  try {
    const { data: trips, error } = await supabase
      .from('trips')
      .select(`
        *,
        truck:trucks(truck_no),
        consignor:parties!consignor_id(name),
        consignee1:parties!consignee1_id(name),
        consignee2:parties!consignee2_id(name)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return trips || []
  } catch (error) {
    console.error('Error fetching trips:', error)
    return []
  }
}

export async function getTripById(id: string) {
  const supabase = createClient()

  try {
    const { data: trip, error } = await supabase
      .from('trips')
      .select(`
        *,
        truck:trucks(
          id,
          truck_no,
          capacity_tons
        ),
        consignor:parties!consignor_id(id, name, phone, address, city),
        consignee1:parties!consignee1_id(id, name, phone, address, city),
        settlement_party:parties!settlement_party_id(id, name, phone, address, city),
        payments(
          id,
          payment_date,
          amount,
          method,
          reference_no,
          notes
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      throw error
    }

    return trip
  } catch (error) {
    console.error('Error fetching trip by ID:', error)
    return null
  }
}

export async function updateTrip(id: string, formData: FormData): Promise<{ error: string } | void> {
  const supabase = createClient()

  const parsed = TripSchema.safeParse(parseTripFormData(formData))
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || 'Please check the form values.' }
  }

  const { error } = await supabase
    .from('trips')
    .update(parsed.data)
    .eq('id', id)

  if (error) {
    console.error('Error updating trip:', error)
    return { error: `Failed to update trip: ${error.message}` }
  }

  revalidatePath('/trips')
  redirect('/trips')
}

export async function deleteTrip(id: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('trips')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting trip:', error)
    throw new Error('Failed to delete trip')
  }

  revalidatePath('/trips')
}