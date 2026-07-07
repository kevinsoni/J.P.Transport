import type { PaymentStatus, Trip, Payment } from '@/types/db'

export interface TripCalculationInput {
  rate: number
  payment_weight?: number | null
  tp_charge_consignor1: number
  tp_charge_consignor2: number
  rto_charge_gujarat: number
  rto_charge_maharashtra: number
  lr_amount: number
  driver_cash_received: number
}

export interface TripCalculationResult {
  rate_amount: number
  total_charges: number
  bill_amount: number
}

export function computeTripTotals(input: TripCalculationInput): TripCalculationResult {
  // Rate is a per-MT rate; multiply by payment weight (fallback to 1 when weight is 0/absent).
  const weightMultiplier = input.payment_weight && input.payment_weight > 0 ? input.payment_weight : 1
  const rate_amount = input.rate * weightMultiplier

  const total_charges =
    rate_amount +
    input.tp_charge_consignor1 +
    input.tp_charge_consignor2 +
    input.rto_charge_gujarat +
    input.rto_charge_maharashtra

  // Net bill owed by the customer.
  const bill_amount = total_charges - input.lr_amount - input.driver_cash_received

  return {
    rate_amount,
    total_charges,
    bill_amount,
  }
}

// Legacy function for backward compatibility
export interface LegacyTripCalculationInput {
  freight_amount: number
  rto_charges: number
  toll_charges: number
  loading_unloading: number
  diesel_advance: number
  other_charges: number
  tax_percent: number
}

export interface LegacyTripCalculationResult {
  subtotal: number
  tax_amount: number
  total_amount: number
}

export function computeLegacyTripTotals(input: LegacyTripCalculationInput): LegacyTripCalculationResult {
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
  trip: Pick<Trip, 'rate' | 'payment_weight' | 'tp_charge_consignor1' | 'tp_charge_consignor2' | 'rto_charge_gujarat' | 'rto_charge_maharashtra' | 'lr_amount' | 'driver_cash_received'>,
  payments: Payment[] = []
): {
  rate_amount: number
  total_charges: number
  bill_amount: number
  amount_received: number
  balance_due: number
  payment_status: PaymentStatus
} {
  const { rate_amount, total_charges, bill_amount } = computeTripTotals(trip)
  const amount_received = payments.reduce((sum, payment) => sum + payment.amount, 0)
  const balance_due = bill_amount - amount_received
  const payment_status = derivePaymentStatus(bill_amount, amount_received)

  return {
    rate_amount,
    total_charges,
    bill_amount,
    amount_received,
    balance_due,
    payment_status,
  }
}

// Legacy function for backward compatibility
export function calculateLegacyTripAmounts(
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
  const { subtotal, tax_amount, total_amount } = computeLegacyTripTotals(trip)
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