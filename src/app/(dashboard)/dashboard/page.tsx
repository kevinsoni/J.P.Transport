'use client'

import { Suspense, useState, useEffect } from 'react'
import { 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  Calendar,
  Route,
  Plus
} from 'lucide-react'
import Link from 'next/link'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart } from '@/components/charts/bar-chart'
import { LineChart } from '@/components/charts/line-chart'
import { PaymentPopup } from '@/components/forms/payment-popup'
import { TripSelectionPopup } from '@/components/forms/trip-selection-popup'
import { formatCurrency } from '@/lib/utils'
import { getDashboardKPIs, getMonthlyPayments, getTopConsignees, getTripsForPayment } from './actions'
import type { TripWithRelations } from '@/types/db'

function KPICard({ 
  title, 
  value, 
  icon: Icon, 
  color = 'text-blue-600',
  bgColor = 'bg-blue-50',
  format = 'currency'
}: {
  title: string
  value: number
  icon: any
  color?: string
  bgColor?: string
  format?: 'currency' | 'number'
}) {
  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/60 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">
              {format === 'currency' ? formatCurrency(value) : value.toLocaleString()}
            </p>
          </div>
          <div className={`p-3 rounded-xl ${bgColor} shadow-sm`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function DashboardHeader({ trips, setIsTripSelectionOpen }: { trips: any[], setIsTripSelectionOpen: (open: boolean) => void }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-blue-600 bg-clip-text text-transparent mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 text-lg">Overview of your transport operations</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => setIsTripSelectionOpen(true)}
          disabled={trips.length === 0}
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Record Payment
        </Button>
        <Button asChild variant="outline" className="border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 shadow-md hover:shadow-lg transition-all duration-200">
          <Link href="/trips/new">
            <Plus className="w-4 h-4 mr-2" />
            New Trip
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [kpiData, setKpiData] = useState<any>(null)
  const [monthlyPayments, setMonthlyPayments] = useState<any[]>([])
  const [topConsignees, setTopConsignees] = useState<any[]>([])
  const [trips, setTrips] = useState<TripWithRelations[]>([])
  const [isTripSelectionOpen, setIsTripSelectionOpen] = useState(false)
  const [isPaymentPopupOpen, setIsPaymentPopupOpen] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState<TripWithRelations | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [kpis, payments, consignees, tripsData] = await Promise.all([
          getDashboardKPIs(),
          getMonthlyPayments(),
          getTopConsignees(),
          getTripsForPayment()
        ])
        setKpiData(kpis)
        setMonthlyPayments(payments)
        setTopConsignees(consignees)
        setTrips(tripsData)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div>
      <DashboardHeader trips={trips} setIsTripSelectionOpen={setIsTripSelectionOpen} />
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <KPICard
          title="Total Due"
          value={kpiData.totalDue}
          icon={DollarSign}
          color="text-red-600"
          bgColor="bg-red-50"
        />
        <KPICard
          title="Total Received (This Month)"
          value={kpiData.totalReceived}
          icon={TrendingUp}
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <KPICard
          title="Total RTO (This Month)"
          value={kpiData.totalRTO}
          icon={AlertCircle}
          color="text-orange-600"
          bgColor="bg-orange-50"
        />
        <KPICard
          title="Trips Today"
          value={kpiData.tripsToday}
          icon={Calendar}
          format="number"
        />
        <KPICard
          title="Open Trips"
          value={kpiData.openTrips}
          icon={Route}
          format="number"
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-800">Monthly Payments</CardTitle>
            <CardDescription className="text-gray-600">Payment collection over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="h-[300px] bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl animate-pulse" />}>
              {monthlyPayments.length > 0 ? (
                <LineChart data={monthlyPayments} />
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500 bg-gray-50/50 rounded-xl">
                  No payment data available yet
                </div>
              )}
            </Suspense>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-800">Top Consignees by Revenue</CardTitle>
            <CardDescription className="text-gray-600">Highest revenue generating customers</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="h-[300px] bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl animate-pulse" />}>
              {topConsignees.length > 0 ? (
                <BarChart data={topConsignees} />
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500 bg-gray-50/50 rounded-xl">
                  No consignee data available yet
                </div>
              )}
            </Suspense>
          </CardContent>
        </Card>
      </div>

      <TripSelectionPopup
        trips={trips}
        isOpen={isTripSelectionOpen}
        onClose={() => setIsTripSelectionOpen(false)}
        onSelectTrip={(trip) => {
          setSelectedTrip(trip)
          setIsTripSelectionOpen(false)
          setIsPaymentPopupOpen(true)
        }}
      />

      {selectedTrip && (
        <PaymentPopup
          trip={selectedTrip}
          isOpen={isPaymentPopupOpen}
          onClose={() => {
            setIsPaymentPopupOpen(false)
            setSelectedTrip(null)
          }}
          onSuccess={() => {
            setIsPaymentPopupOpen(false)
            setSelectedTrip(null)
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}