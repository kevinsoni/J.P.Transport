'use server'

import { createClient } from '@/lib/supabase/server'
import { TripSchema } from '@/lib/validators'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createTrip(formData: FormData) {
  const supabase = createClient()

  // Convert form data to proper types
  const rawData = {
    trip_date: formData.get('trip_date') as string,
    status: formData.get('status') as 'IN' | 'OUT' | 'COMPLETED' | 'CANCELLED',
    truck_id: formData.get('truck_id') as string,
    center_city: formData.get('center_city') as string || null,
    origin_city: formData.get('origin_city') as string || null,
    destination_city: formData.get('destination_city') as string || null,
    cargo_details: formData.get('cargo_details') as string || null,
    transport_details: formData.get('transport_details') as string || null,
    consignor_id: formData.get('consignor_id') as string,
    consignee1_id: formData.get('consignee1_id') as string,
    consignee2_id: formData.get('consignee2_id') as string || null,
    lr_no: formData.get('lr_no') as string || null,
    invoice_no: formData.get('invoice_no') as string || null,
    driver_name: formData.get('driver_name') as string || null,
    driver_phone: formData.get('driver_phone') as string || null,
    weight_mt: formData.get('weight_mt') ? parseFloat(formData.get('weight_mt') as string) : null,
    no_of_packages: formData.get('no_of_packages') ? parseInt(formData.get('no_of_packages') as string) : null,
    route_notes: formData.get('route_notes') as string || null,
    remarks: formData.get('remarks') as string || null,
    freight_amount: parseFloat(formData.get('freight_amount') as string) || 0,
    rto_charges: parseFloat(formData.get('rto_charges') as string) || 0,
    toll_charges: parseFloat(formData.get('toll_charges') as string) || 0,
    loading_unloading: parseFloat(formData.get('loading_unloading') as string) || 0,
    diesel_advance: parseFloat(formData.get('diesel_advance') as string) || 0,
    other_charges: parseFloat(formData.get('other_charges') as string) || 0,
    tax_percent: parseFloat(formData.get('tax_percent') as string) || 0,
    material_type: formData.get('material_type') as string || null,
    e_way_bill_no: formData.get('e_way_bill_no') as string || null,
    payment_terms: formData.get('payment_terms') as string || null,
    due_date: formData.get('due_date') as string || null,
    km_distance: formData.get('km_distance') ? parseInt(formData.get('km_distance') as string) : null,
    settlement_party_id: formData.get('settlement_party_id') as string || null,
    rto_details: formData.get('rto_details') as string || null,
  }

  // Validate the data
  const validatedData = TripSchema.parse(rawData)

  const { error } = await supabase
    .from('trips')
    .insert([validatedData])

  if (error) {
    console.error('Error creating trip:', error)
    throw new Error('Failed to create trip')
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
          truck_no,
          capacity_tons
        ),
        consignor:parties!consignor_id(name, phone, address, city),
        consignee1:parties!consignee1_id(name, phone, address, city),
        consignee2:parties!consignee2_id(name, phone, address, city),
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

export async function updateTrip(id: string, formData: FormData) {
  const supabase = createClient()

  // Convert form data to proper types (similar to createTrip but for updates)
  const rawData = {
    trip_date: formData.get('trip_date') as string,
    status: formData.get('status') as 'IN' | 'OUT' | 'COMPLETED' | 'CANCELLED',
    truck_id: formData.get('truck_id') as string,
    center_city: formData.get('center_city') as string || null,
    origin_city: formData.get('origin_city') as string || null,
    destination_city: formData.get('destination_city') as string || null,
    cargo_details: formData.get('cargo_details') as string || null,
    transport_details: formData.get('transport_details') as string || null,
    consignor_id: formData.get('consignor_id') as string,
    consignee1_id: formData.get('consignee1_id') as string,
    consignee2_id: formData.get('consignee2_id') as string || null,
    lr_no: formData.get('lr_no') as string || null,
    invoice_no: formData.get('invoice_no') as string || null,
    driver_name: formData.get('driver_name') as string || null,
    driver_phone: formData.get('driver_phone') as string || null,
    weight_mt: formData.get('weight_mt') ? parseFloat(formData.get('weight_mt') as string) : null,
    no_of_packages: formData.get('no_of_packages') ? parseInt(formData.get('no_of_packages') as string) : null,
    route_notes: formData.get('route_notes') as string || null,
    remarks: formData.get('remarks') as string || null,
    freight_amount: parseFloat(formData.get('freight_amount') as string) || 0,
    rto_charges: parseFloat(formData.get('rto_charges') as string) || 0,
    toll_charges: parseFloat(formData.get('toll_charges') as string) || 0,
    loading_unloading: parseFloat(formData.get('loading_unloading') as string) || 0,
    diesel_advance: parseFloat(formData.get('diesel_advance') as string) || 0,
    other_charges: parseFloat(formData.get('other_charges') as string) || 0,
    tax_percent: parseFloat(formData.get('tax_percent') as string) || 0,
    material_type: formData.get('material_type') as string || null,
    e_way_bill_no: formData.get('e_way_bill_no') as string || null,
    payment_terms: formData.get('payment_terms') as string || null,
    due_date: formData.get('due_date') as string || null,
    km_distance: formData.get('km_distance') ? parseInt(formData.get('km_distance') as string) : null,
    settlement_party_id: formData.get('settlement_party_id') as string || null,
    rto_details: formData.get('rto_details') as string || null,
  }

  // Validate the data
  const validatedData = TripSchema.parse(rawData)

  const { error } = await supabase
    .from('trips')
    .update(validatedData)
    .eq('id', id)

  if (error) {
    console.error('Error updating trip:', error)
    throw new Error('Failed to update trip')
  }

  revalidatePath(`/trips/${id}`)
  redirect(`/trips/${id}`)
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