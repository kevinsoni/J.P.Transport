export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type PartyType = 'consignor' | 'consignee' | 'owner' | 'transport'
export type TripStatus = 'IN' | 'OUT' | 'COMPLETED' | 'CANCELLED'
export type PaymentMethod = 'CASH' | 'UPI' | 'BANK' | 'OTHER'
export type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID'

export interface Database {
  public: {
    Tables: {
      parties: {
        Row: {
          id: string
          name: string
          type: PartyType
          phone: string | null
          email: string | null
          gstin: string | null
          address: string | null
          city: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type: PartyType
          phone?: string | null
          email?: string | null
          gstin?: string | null
          address?: string | null
          city?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: PartyType
          phone?: string | null
          email?: string | null
          gstin?: string | null
          address?: string | null
          city?: string | null
          created_at?: string
        }
      }
      trucks: {
        Row: {
          id: string
          truck_no: string
          owner_id: string | null
          capacity_tons: number | null
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          truck_no: string
          owner_id?: string | null
          capacity_tons?: number | null
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          truck_no?: string
          owner_id?: string | null
          capacity_tons?: number | null
          active?: boolean
          created_at?: string
        }
      }
      trips: {
        Row: {
          id: string
          trip_date: string
          status: TripStatus
          truck_id: string
          center_city: string | null
          origin_city: string | null
          destination_city: string | null
          cargo_details: string | null
          transport_details: string | null
          consignor_id: string
          consignee1_id: string
          consignee2_id: string | null
          lr_no: string | null
          invoice_no: string | null
          driver_name: string | null
          driver_phone: string | null
          weight_mt: number | null
          no_of_packages: number | null
          route_notes: string | null
          remarks: string | null
          freight_amount: number
          rto_charges: number
          toll_charges: number
          loading_unloading: number
          diesel_advance: number
          other_charges: number
          tax_percent: number
          total_amount: number
          amount_received: number
          balance_due: number
          payment_status: PaymentStatus
          material_type: string | null
          e_way_bill_no: string | null
          payment_terms: string | null
          due_date: string | null
          km_distance: number | null
          settlement_party_id: string | null
          rto_details: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          trip_date: string
          status?: TripStatus
          truck_id: string
          center_city?: string | null
          origin_city?: string | null
          destination_city?: string | null
          cargo_details?: string | null
          transport_details?: string | null
          consignor_id: string
          consignee1_id: string
          consignee2_id?: string | null
          lr_no?: string | null
          invoice_no?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          weight_mt?: number | null
          no_of_packages?: number | null
          route_notes?: string | null
          remarks?: string | null
          freight_amount?: number
          rto_charges?: number
          toll_charges?: number
          loading_unloading?: number
          diesel_advance?: number
          other_charges?: number
          tax_percent?: number
          total_amount?: number
          amount_received?: number
          balance_due?: number
          payment_status?: PaymentStatus
          material_type?: string | null
          e_way_bill_no?: string | null
          payment_terms?: string | null
          due_date?: string | null
          km_distance?: number | null
          settlement_party_id?: string | null
          rto_details?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          trip_date?: string
          status?: TripStatus
          truck_id?: string
          center_city?: string | null
          origin_city?: string | null
          destination_city?: string | null
          cargo_details?: string | null
          transport_details?: string | null
          consignor_id?: string
          consignee1_id?: string
          consignee2_id?: string | null
          lr_no?: string | null
          invoice_no?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          weight_mt?: number | null
          no_of_packages?: number | null
          route_notes?: string | null
          remarks?: string | null
          freight_amount?: number
          rto_charges?: number
          toll_charges?: number
          loading_unloading?: number
          diesel_advance?: number
          other_charges?: number
          tax_percent?: number
          total_amount?: number
          amount_received?: number
          balance_due?: number
          payment_status?: PaymentStatus
          material_type?: string | null
          e_way_bill_no?: string | null
          payment_terms?: string | null
          due_date?: string | null
          km_distance?: number | null
          settlement_party_id?: string | null
          rto_details?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          trip_id: string
          payment_date: string
          amount: number
          method: PaymentMethod
          reference_no: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          payment_date: string
          amount: number
          method: PaymentMethod
          reference_no?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          payment_date?: string
          amount?: number
          method?: PaymentMethod
          reference_no?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      attachments: {
        Row: {
          id: string
          trip_id: string | null
          file_url: string
          label: string | null
          created_at: string
        }
        Insert: {
          id?: string
          trip_id?: string | null
          file_url: string
          label?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string | null
          file_url?: string
          label?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      party_type: PartyType
      trip_status: TripStatus
      payment_method: PaymentMethod
      pay_status: PaymentStatus
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Party = Database['public']['Tables']['parties']['Row']
export type Truck = Database['public']['Tables']['trucks']['Row']
export type Trip = Database['public']['Tables']['trips']['Row']
export type Payment = Database['public']['Tables']['payments']['Row']
export type Attachment = Database['public']['Tables']['attachments']['Row']

export type TripWithRelations = Trip & {
  truck: Truck
  consignor: Party
  consignee1: Party
  consignee2?: Party
  settlement_party?: Party
  owner?: Party
  payments: Payment[]
}

export type DashboardKPI = {
  totalDue: number
  totalReceived: number
  totalRTO: number
  tripsToday: number
  openTrips: number
}