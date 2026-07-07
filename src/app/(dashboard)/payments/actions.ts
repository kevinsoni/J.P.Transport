'use server'

import { createClient } from '@/lib/supabase/server'
import { PaymentSchema } from '@/lib/validators'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

function parsePaymentFormData(formData: FormData) {
  const amountRaw = formData.get('amount') as string
  const amountNum = amountRaw ? parseFloat(amountRaw) : NaN
  return {
    trip_id: formData.get('trip_id') as string,
    payment_date: formData.get('payment_date') as string,
    // Payments are recorded as whole rupees.
    amount: Number.isFinite(amountNum) ? Math.round(amountNum) : NaN,
    method: formData.get('method') as 'CASH' | 'UPI' | 'BANK' | 'OTHER',
    reference_no: formData.get('reference_no') as string || null,
    notes: formData.get('notes') as string || null,
  }
}

// Does not redirect: callers (new-payment page, in-trip popup) decide what to do next.
export async function createPayment(formData: FormData): Promise<{ error?: string }> {
  const supabase = createClient()

  const parsed = PaymentSchema.safeParse(parsePaymentFormData(formData))
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || 'Please check the payment details.' }
  }

  const { error } = await supabase
    .from('payments')
    .insert([parsed.data])

  if (error) {
    console.error('Error creating payment:', error)
    return { error: 'Failed to record payment. Please try again.' }
  }

  revalidatePath('/payments')
  revalidatePath('/trips')
  return {}
}

export async function getPayments() {
  const supabase = createClient()

  try {
    const { data: payments, error } = await supabase
      .from('payments')
      .select(`
        *,
        trip:trips(
          lr_no,
          trip_date,
          center_city,
          consignor:parties!consignor_id(name),
          consignee1:parties!consignee1_id(name),
          truck:trucks(truck_no)
        )
      `)
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

export async function getPaymentById(id: string) {
  const supabase = createClient()

  try {
    const { data: payment, error } = await supabase
      .from('payments')
      .select(`
        *,
        trip:trips(
          lr_no,
          trip_date,
          center_city,
          consignor:parties!consignor_id(name),
          consignee1:parties!consignee1_id(name),
          truck:trucks(truck_no)
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      throw error
    }

    return payment
  } catch (error) {
    console.error('Error fetching payment by ID:', error)
    return null
  }
}

export async function deletePayment(id: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting payment:', error)
    throw new Error('Failed to delete payment')
  }

  revalidatePath('/payments')
}

export async function updatePayment(id: string, formData: FormData): Promise<{ error: string } | void> {
  const supabase = createClient()

  const parsed = PaymentSchema.safeParse(parsePaymentFormData(formData))
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || 'Please check the payment details.' }
  }

  const { error } = await supabase
    .from('payments')
    .update(parsed.data)
    .eq('id', id)

  if (error) {
    console.error('Error updating payment:', error)
    return { error: 'Failed to update payment. Please try again.' }
  }

  revalidatePath('/payments')
  revalidatePath('/trips')
  revalidatePath(`/payments/${id}`)
  redirect(`/payments/${id}`)
}