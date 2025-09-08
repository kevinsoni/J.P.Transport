import { Suspense } from 'react'
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
import { formatCurrency } from '@/lib/utils'

// Mock data - replace with real data from server actions
const kpiData = {
  totalDue: 1250000,
  totalReceived: 850000,
  totalRTO: 125000,
  tripsToday: 8,
  openTrips: 23,
}

const monthlyPayments = [
  { name: 'Jan', value: 650000 },
  { name: 'Feb', value: 750000 },
  { name: 'Mar', value: 580000 },
  { name: 'Apr', value: 920000 },
  { name: 'May', value: 850000 },
  { name: 'Jun', value: 1100000 },
]

const topConsignees = [
  { name: 'ABC Industries', value: 350000 },
  { name: 'XYZ Corp', value: 280000 },
  { name: 'PQR Ltd', value: 220000 },
  { name: 'LMN Enterprises', value: 180000 },
  { name: 'DEF Company', value: 150000 },
]

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
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">
              {format === 'currency' ? formatCurrency(value) : value.toLocaleString()}
            </p>
          </div>
          <div className={`p-3 rounded-lg ${bgColor}`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function DashboardHeader() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-gray-600">Overview of your transport operations</p>
      </div>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/payments/new">
            <Plus className="w-4 h-4 mr-2" />
            Record Payment
          </Link>
        </Button>
        <Button asChild variant="outline">
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
  return (
    <div>
      <DashboardHeader />
      
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
        <Card>
          <CardHeader>
            <CardTitle>Monthly Payments</CardTitle>
            <CardDescription>Payment collection over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="h-[300px] bg-gray-100 rounded animate-pulse" />}>
              <LineChart data={monthlyPayments} />
            </Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Consignees by Revenue</CardTitle>
            <CardDescription>Highest revenue generating customers</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="h-[300px] bg-gray-100 rounded animate-pulse" />}>
              <BarChart data={topConsignees} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}