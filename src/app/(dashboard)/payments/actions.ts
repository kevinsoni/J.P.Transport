'use server'

import { createClient } from '@/lib/supabase/server'
import { PaymentSchema } from '@/lib/validators'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPayment(formData: FormData) {
  const supabase = createClient()

  const rawData = {
    trip_id: formData.get('trip_id') as string,
    payment_date: formData.get('payment_date') as string,
    amount: parseFloat(formData.get('amount') as string),
    method: formData.get('method') as 'CASH' | 'UPI' | 'BANK' | 'OTHER',
    reference_no: formData.get('reference_no') as string || null,
    notes: formData.get('notes') as string || null,
  }

  // Validate the data
  const validatedData = PaymentSchema.parse(rawData)

  const { error } = await supabase
    .from('payments')
    .insert([validatedData])

  if (error) {
    console.error('Error creating payment:', error)
    throw new Error('Failed to create payment')
  }

  revalidatePath('/payments')
  redirect('/payments')
}

export async function getPayments() {
  const supabase = createClient()

  try {
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .order('payment_date', { ascending: false })

    if (error) {
      throw error
    }

    return payments || []
  } catch (error) {
    console.error('Error fetching payments:', error)
    return []
  }
}

export async function getTripsForPayment() {
  const supabase = createClient()

  try {
    const { data: trips, error } = await supabase
      .from('trips')
      .select('*')
      .neq('payment_status', 'PAID')
      .order('trip_date', { ascending: false })

    if (error) {
      throw error
    }

    return trips || []
  } catch (error) {
    console.error('Error fetching trips:', error)
    return []
  }
}