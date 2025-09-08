import { Download } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart } from '@/components/charts/bar-chart'
import { getReceivablesAging, getRTOSummary, getTruckRevenue, getCurrentMonthRTO } from './actions'

export default async function ReportsPage() {
  const [receivablesData, rtoSummary, truckRevenue, currentMonthRTO] = await Promise.all([
    getReceivablesAging(),
    getRTOSummary(),
    getTruckRevenue(),
    getCurrentMonthRTO()
  ])

  const averageMonthlyRTO = rtoSummary.length > 0 
    ? rtoSummary.reduce((sum, item) => sum + item.value, 0) / rtoSummary.length 
    : 0
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-gray-600">Comprehensive business analytics and insights</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export All Reports
        </Button>
      </div>

      <div className="space-y-8">
        {/* Receivables Aging */}
        <Card>
          <CardHeader>
            <CardTitle>Receivables Aging Analysis</CardTitle>
            <CardDescription>Outstanding amounts by age groups</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                {receivablesData.length > 0 ? (
                  <BarChart data={receivablesData} height={300} />
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    No receivables data available
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {receivablesData.map((item) => (
                    <div key={item.name} className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">{item.name}</div>
                      <div className="text-xl font-semibold">₹{item.value.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
                <Button className="w-full" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Receivables Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RTO Summary */}
        <Card>
          <CardHeader>
            <CardTitle>RTO Charges Summary</CardTitle>
            <CardDescription>Monthly RTO charges analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                {rtoSummary.length > 0 ? (
                  <BarChart data={rtoSummary} height={300} />
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    No RTO data available
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Total RTO This Month</div>
                  <div className="text-2xl font-bold text-orange-600">₹{currentMonthRTO.toLocaleString()}</div>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Average Monthly RTO</div>
                  <div className="text-2xl font-bold text-blue-600">₹{Math.round(averageMonthlyRTO).toLocaleString()}</div>
                </div>
                <Button className="w-full" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export RTO Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue by Truck */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Truck</CardTitle>
            <CardDescription>Top performing vehicles by revenue generation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                {truckRevenue.length > 0 ? (
                  <BarChart data={truckRevenue} height={300} />
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    No truck revenue data available
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  {truckRevenue.slice(0, 3).map((truck, index) => (
                    <div key={truck.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                          index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="font-medium">{truck.name}</span>
                      </div>
                      <span className="text-lg font-semibold">₹{truck.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <Button className="w-full" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Truck Performance Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}