'use server'

import { createClient } from '@/lib/supabase/server'

export async function getDashboardKPIs() {
  const supabase = createClient()

  try {
    // Get total due amount (unpaid and partial trips)
    const { data: totalDueData, error: totalDueError } = await supabase
      .from('trips')
      .select('balance_due')
      .in('payment_status', ['UNPAID', 'PARTIAL'])

    if (totalDueError) throw totalDueError

    const totalDue = totalDueData?.reduce((sum, trip) => sum + (trip.balance_due || 0), 0) || 0

    // Get total received this month
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format
    const { data: receivedData, error: receivedError } = await supabase
      .from('payments')
      .select('amount')
      .gte('payment_date', `${currentMonth}-01`)
      .lt('payment_date', `${new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().slice(0, 10)}`)

    if (receivedError) throw receivedError

    const totalReceived = receivedData?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0

    // Get total RTO charges this month
    const { data: rtoData, error: rtoError } = await supabase
      .from('trips')
      .select('rto_charges')
      .gte('trip_date', `${currentMonth}-01`)
      .lt('trip_date', `${new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().slice(0, 10)}`)

    if (rtoError) throw rtoError

    const totalRTO = rtoData?.reduce((sum, trip) => sum + (trip.rto_charges || 0), 0) || 0

    // Get trips today
    const today = new Date().toISOString().split('T')[0]
    const { data: todayTripsData, error: todayTripsError } = await supabase
      .from('trips')
      .select('id')
      .eq('trip_date', today)

    if (todayTripsError) throw todayTripsError

    const tripsToday = todayTripsData?.length || 0

    // Get open trips (IN or OUT status)
    const { data: openTripsData, error: openTripsError } = await supabase
      .from('trips')
      .select('id')
      .in('status', ['IN', 'OUT'])

    if (openTripsError) throw openTripsError

    const openTrips = openTripsData?.length || 0

    return {
      totalDue,
      totalReceived,
      totalRTO,
      tripsToday,
      openTrips,
    }
  } catch (error) {
    console.error('Error fetching dashboard KPIs:', error)
    return {
      totalDue: 0,
      totalReceived: 0,
      totalRTO: 0,
      tripsToday: 0,
      openTrips: 0,
    }
  }
}

export async function getMonthlyPayments() {
  const supabase = createClient()

  try {
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const { data: payments, error } = await supabase
      .from('payments')
      .select('payment_date, amount')
      .gte('payment_date', sixMonthsAgo.toISOString().split('T')[0])
      .order('payment_date')

    if (error) throw error

    // Group payments by month
    const monthlyData: { [key: string]: number } = {}
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    payments?.forEach(payment => {
      const date = new Date(payment.payment_date)
      const monthKey = `${months[date.getMonth()]} ${date.getFullYear().toString().slice(-2)}`
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + payment.amount
    })

    return Object.entries(monthlyData).map(([name, value]) => ({ name, value })).slice(-6)
  } catch (error) {
    console.error('Error fetching monthly payments:', error)
    return []
  }
}

export async function getTopConsignees() {
  const supabase = createClient()

  try {
    const { data: trips, error } = await supabase
      .from('trips')
      .select(`
        total_amount,
        consignee1:parties!trips_consignee1_id_fkey(name)
      `)
      .not('consignee1_id', 'is', null)

    if (error) throw error

    // Group by consignee and sum amounts
    const consigneeData: { [key: string]: number } = {}

    trips?.forEach(trip => {
      const consigneeName = trip.consignee1?.[0]?.name
      if (consigneeName) {
        consigneeData[consigneeName] = (consigneeData[consigneeName] || 0) + trip.total_amount
      }
    })

    return Object.entries(consigneeData)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  } catch (error) {
    console.error('Error fetching top consignees:', error)
    return []
  }
}

export async function getTripsForPayment() {
  const supabase = createClient()

  try {
    const { data: trips, error } = await supabase
      .from('trips')
      .select(`
        *,
        truck:trucks(truck_no),
        consignor:parties!consignor_id(name),
        consignee1:parties!consignee1_id(name)
      `)
      .neq('payment_status', 'PAID')
      .order('trip_date', { ascending: false })

    if (error) throw error
    return trips || []
  } catch (error) {
    console.error('Error fetching trips for payment:', error)
    return []
  }
}