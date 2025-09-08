import { Download } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart } from '@/components/charts/bar-chart'

const receivablesData = [
  { name: '0-30 Days', value: 250000 },
  { name: '31-60 Days', value: 180000 },
  { name: '61-90 Days', value: 120000 },
  { name: '90+ Days', value: 85000 },
]

const rtoSummary = [
  { name: 'Jan', value: 15000 },
  { name: 'Feb', value: 22000 },
  { name: 'Mar', value: 18000 },
  { name: 'Apr', value: 25000 },
  { name: 'May', value: 20000 },
  { name: 'Jun', value: 28000 },
]

const truckRevenue = [
  { name: 'MH12AB1234', value: 450000 },
  { name: 'KA05CD5678', value: 380000 },
  { name: 'TN09EF9012', value: 320000 },
  { name: 'DL01GH3456', value: 280000 },
  { name: 'UP16IJ7890', value: 250000 },
]

export default function ReportsPage() {
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
                <BarChart data={receivablesData} height={300} />
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
                <BarChart data={rtoSummary} height={300} />
              </div>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Total RTO This Month</div>
                  <div className="text-2xl font-bold text-orange-600">₹28,000</div>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Average Monthly RTO</div>
                  <div className="text-2xl font-bold text-blue-600">₹21,333</div>
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
                <BarChart data={truckRevenue} height={300} />
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