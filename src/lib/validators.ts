import { z } from 'zod'

export const PartySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  type: z.enum(['consignor', 'consignee', 'owner', 'transport']),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  gstin: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
})

export const TruckSchema = z.object({
  id: z.string().optional(),
  truck_no: z.string().min(1, 'Truck number is required'),
  owner_id: z.string().optional().nullable(),
  capacity_tons: z.number().min(0).optional().nullable(),
  active: z.boolean().default(true),
})

export const ExtraChargeSchema = z.object({
  label: z.string().trim().min(1, 'Label is required').max(120, 'Label is too long'),
  amount: z.number().min(0, 'Amount must be positive'),
  sign: z.enum(['+', '-']).default('+'),
  // When false, the item is saved as a note but not counted in the bill.
  include: z.boolean().default(true),
})

export const TripSchema = z.object({
  id: z.string().optional(),
  trip_date: z.string().min(1, 'Trip date is required'),
  status: z.enum(['IN', 'OUT', 'COMPLETED', 'CANCELLED']).optional().default('OUT'),
  truck_id: z.string().min(1, 'Truck is required'),
  center_city: z.string().optional().nullable(),
  cargo_details: z.string().optional().nullable(),
  consignor_id: z.string().min(1, 'Consignor is required'),

  consignor2_id: z.string().optional().nullable(),
  consignee1_id: z.string().min(1, 'Consignee is required'),
  lr_no: z.string().optional().nullable(),
  lr_name: z.string().optional().nullable(),
  party_payment_name: z.string().optional().nullable(),
  loading_weight: z.number().min(0).optional().nullable(),
  payment_weight: z.number().min(0).optional().nullable(),
  rate: z.number().min(0).default(0),
  tp_charge_consignor1: z.number().min(0).default(0),
  tp_charge_consignor2: z.number().min(0).default(0),
  rto_charge_gujarat: z.number().min(0).default(0),
  rto_charge_maharashtra: z.number().min(0).default(0),
  lr_amount: z.number().min(0).default(0),
  driver_cash_received: z.number().min(0).default(0),
  extra_charges: z.array(ExtraChargeSchema).optional().default([]),
  settlement_party_id: z.string().optional().nullable(),
  remarks: z.string().optional().nullable(),
})

export const PaymentSchema = z.object({
  id: z.string().optional(),
  trip_id: z.string().min(1, 'Please select a trip'),
  payment_date: z.string().min(1, 'Please choose a payment date'),
  amount: z
    .number({ invalid_type_error: 'Please enter a valid amount' })
    .positive('Amount must be greater than 0'),
  method: z.enum(['CASH', 'UPI', 'BANK', 'OTHER'], {
    errorMap: () => ({ message: 'Please select a payment method' }),
  }),
  reference_no: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export const FiltersSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  city: z.string().optional(),
  truckNo: z.string().optional(),
  consignee: z.string().optional(),
  status: z.enum(['IN', 'OUT', 'COMPLETED', 'CANCELLED']).optional(),
  paymentStatus: z.enum(['UNPAID', 'PARTIAL', 'PAID']).optional(),
})

export type ExtraChargeData = z.infer<typeof ExtraChargeSchema>
export type PartyFormData = z.infer<typeof PartySchema>
export type TruckFormData = z.infer<typeof TruckSchema>
export type TripFormData = z.infer<typeof TripSchema>
export type PaymentFormData = z.infer<typeof PaymentSchema>
export type LoginFormData = z.infer<typeof LoginSchema>
export type RegisterFormData = z.infer<typeof RegisterSchema>
export type FiltersData = z.infer<typeof FiltersSchema>