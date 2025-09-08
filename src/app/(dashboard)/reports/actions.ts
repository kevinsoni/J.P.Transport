'use server'

import { createClient } from '@/lib/supabase/server'

export async function getReceivablesAging() {
  const supabase = createClient()

  try {
    const { data: trips, error } = await supabase
      .from('trips')
      .select('balance_due, due_date')
      .gt('balance_due', 0)

    if (error) throw error

    const today = new Date()
    const aging = {
      '0-30 Days': 0,
      '31-60 Days': 0,
      '61-90 Days': 0,
      '90+ Days': 0,
    }

    trips?.forEach(trip => {
      if (trip.due_date) {
        const dueDate = new Date(trip.due_date)
        const daysPastDue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysPastDue <= 30) {
          aging['0-30 Days'] += trip.balance_due || 0
        } else if (daysPastDue <= 60) {
          aging['31-60 Days'] += trip.balance_due || 0
        } else if (daysPastDue <= 90) {
          aging['61-90 Days'] += trip.balance_due || 0
        } else {
          aging['90+ Days'] += trip.balance_due || 0
        }
      } else {
        // If no due date, assume current
        aging['0-30 Days'] += trip.balance_due || 0
      }
    })

    return Object.entries(aging).map(([name, value]) => ({ name, value }))
  } catch (error) {
    console.error('Error fetching receivables aging:', error)
    return []
  }
}

export async function getRTOSummary() {
  const supabase = createClient()

  try {
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const { data: trips, error } = await supabase
      .from('trips')
      .select('trip_date, rto_charges')
      .gte('trip_date', sixMonthsAgo.toISOString().split('T')[0])
      .order('trip_date')

    if (error) throw error

    // Group RTO charges by month
    const monthlyData: { [key: string]: number } = {}
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    trips?.forEach(trip => {
      const date = new Date(trip.trip_date)
      const monthKey = `${months[date.getMonth()]} ${date.getFullYear().toString().slice(-2)}`
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + (trip.rto_charges || 0)
    })

    return Object.entries(monthlyData).map(([name, value]) => ({ name, value })).slice(-6)
  } catch (error) {
    console.error('Error fetching RTO summary:', error)
    return []
  }
}

export async function getTruckRevenue() {
  const supabase = createClient()

  try {
    const { data: trips, error } = await supabase
      .from('trips')
      .select(`
        total_amount,
        truck:trucks(truck_no)
      `)
      .not('truck_id', 'is', null)

    if (error) throw error

    // Group revenue by truck
    const truckData: { [key: string]: number } = {}

    trips?.forEach(trip => {
      const truckNo = trip.truck?.[0]?.truck_no
      if (truckNo) {
        truckData[truckNo] = (truckData[truckNo] || 0) + trip.total_amount
      }
    })

    return Object.entries(truckData)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10) // Top 10 trucks
  } catch (error) {
    console.error('Error fetching truck revenue:', error)
    return []
  }
}

export async function getCurrentMonthRTO() {
  const supabase = createClient()

  try {
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format
    const { data: trips, error } = await supabase
      .from('trips')
      .select('rto_charges')
      .gte('trip_date', `${currentMonth}-01`)
      .lt('trip_date', `${new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().slice(0, 10)}`)

    if (error) throw error

    const totalRTO = trips?.reduce((sum, trip) => sum + (trip.rto_charges || 0), 0) || 0
    return totalRTO
  } catch (error) {
    console.error('Error fetching current month RTO:', error)
    return 0
  }
}