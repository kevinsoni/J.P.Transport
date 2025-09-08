import { formatCurrency, formatDate } from './utils'

export function downloadCSV(data: any[], filename: string) {
  if (data.length === 0) return

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        // Handle values that contain commas, quotes, or newlines
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}_${formatDate(new Date()).replace(/\//g, '-')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

export function exportTripsToCSV(trips: any[]) {
  const csvData = trips.map(trip => ({
    'Date': formatDate(trip.trip_date),
    'Truck No': trip.truck?.truck_no || '',
    'Status': trip.status,
    'Origin': trip.origin_city || '',
    'Destination': trip.destination_city || '',
    'Center': trip.center_city || '',
    'Consignor': trip.consignor?.name || '',
    'Consignee': trip.consignee1?.name || '',
    'LR No': trip.lr_no || '',
    'Invoice No': trip.invoice_no || '',
    'Driver': trip.driver_name || '',
    'Weight (MT)': trip.weight_mt || '',
    'Packages': trip.no_of_packages || '',
    'Freight': formatCurrency(trip.freight_amount || 0),
    'RTO': formatCurrency(trip.rto_charges || 0),
    'Toll': formatCurrency(trip.toll_charges || 0),
    'Loading': formatCurrency(trip.loading_unloading || 0),
    'Diesel Adv': formatCurrency(trip.diesel_advance || 0),
    'Other': formatCurrency(trip.other_charges || 0),
    'Tax %': trip.tax_percent || 0,
    'Total': formatCurrency(trip.total_amount || 0),
    'Received': formatCurrency(trip.amount_received || 0),
    'Balance': formatCurrency(trip.balance_due || 0),
    'Payment Status': trip.payment_status,
    'Material': trip.material_type || '',
    'E-Way Bill': trip.e_way_bill_no || '',
    'KM': trip.km_distance || '',
    'Remarks': trip.remarks || '',
  }))

  downloadCSV(csvData, 'trips')
}

export function exportPaymentsToCSV(payments: any[]) {
  const csvData = payments.map(payment => ({
    'Date': formatDate(payment.payment_date),
    'Trip Date': formatDate(payment.trip?.trip_date || ''),
    'Truck No': payment.trip?.truck?.truck_no || '',
    'Consignee': payment.trip?.consignee1?.name || '',
    'Amount': formatCurrency(payment.amount),
    'Method': payment.method,
    'Reference': payment.reference_no || '',
    'Notes': payment.notes || '',
  }))

  downloadCSV(csvData, 'payments')
}

export function exportPartiestoCSV(parties: any[]) {
  const csvData = parties.map(party => ({
    'Name': party.name,
    'Type': party.type,
    'Phone': party.phone || '',
    'Email': party.email || '',
    'GSTIN': party.gstin || '',
    'City': party.city || '',
    'Address': party.address || '',
  }))

  downloadCSV(csvData, 'parties')
}