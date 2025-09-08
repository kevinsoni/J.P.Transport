import type { PaymentStatus, Trip, Payment } from '@/types/db'

export interface TripCalculationInput {
  freight_amount: number
  rto_charges: number
  toll_charges: number
  loading_unloading: number
  diesel_advance: number
  other_charges: number
  tax_percent: number
}

export interface TripCalculationResult {
  subtotal: number
  tax_amount: number
  total_amount: number
}

export function computeTripTotals(input: TripCalculationInput): TripCalculationResult {
  const subtotal = 
    input.freight_amount + 
    input.rto_charges + 
    input.toll_charges + 
    input.loading_unloading + 
    input.other_charges - 
    input.diesel_advance

  const tax_amount = (subtotal * input.tax_percent) / 100
  const total_amount = subtotal + tax_amount

  return {
    subtotal,
    tax_amount,
    total_amount,
  }
}

export function derivePaymentStatus(total_amount: number, amount_received: number): PaymentStatus {
  if (amount_received === 0) {
    return 'UNPAID'
  }
  
  if (amount_received >= total_amount) {
    return 'PAID'
  }
  
  return 'PARTIAL'
}

export function calculateTripAmounts(
  trip: Pick<Trip, 'freight_amount' | 'rto_charges' | 'toll_charges' | 'loading_unloading' | 'diesel_advance' | 'other_charges' | 'tax_percent'>,
  payments: Payment[] = []
): {
  subtotal: number
  tax_amount: number
  total_amount: number
  amount_received: number
  balance_due: number
  payment_status: PaymentStatus
} {
  const { subtotal, tax_amount, total_amount } = computeTripTotals(trip)
  const amount_received = payments.reduce((sum, payment) => sum + payment.amount, 0)
  const balance_due = total_amount - amount_received
  const payment_status = derivePaymentStatus(total_amount, amount_received)

  return {
    subtotal,
    tax_amount,
    total_amount,
    amount_received,
    balance_due,
    payment_status,
  }
}

export function formatCurrencyInput(value: string): string {
  // Remove all non-numeric characters except decimal point
  const numericValue = value.replace(/[^0-9.]/g, '')
  
  // Ensure only one decimal point
  const parts = numericValue.split('.')
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('')
  }
  
  return numericValue
}

export function parseCurrencyInput(value: string): number {
  const cleaned = value.replace(/[^0-9.]/g, '')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}