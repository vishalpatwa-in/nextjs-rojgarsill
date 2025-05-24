'use client'

import { useMemo } from 'react'
import { format, subDays, startOfDay } from 'date-fns'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface PaymentStatsProps {
  paymentHistory: any[]
}

export function PaymentStats({ paymentHistory }: PaymentStatsProps) {
  const chartData = useMemo(() => {
    // Generate data for the last 30 days
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = startOfDay(subDays(new Date(), 29 - i))
      return {
        date,
        dateStr: format(date, 'MMM dd'),
        payments: 0,
        amount: 0,
      }
    })

    // Aggregate payment data by day
    paymentHistory.forEach((item) => {
      const paymentDate = startOfDay(new Date(item.payment.createdAt))
      const dayData = last30Days.find(day => day.date.getTime() === paymentDate.getTime())
      
      if (dayData && item.payment.status === 'completed') {
        dayData.payments += 1
        dayData.amount += parseFloat(item.payment.amount)
      }
    })

    return last30Days.map(({ dateStr, payments, amount }) => ({
      date: dateStr,
      payments,
      amount: Math.round(amount),
    }))
  }, [paymentHistory])

  const paymentMethodData = useMemo(() => {
    const methodCounts = paymentHistory.reduce((acc, item) => {
      if (item.payment.status === 'completed') {
        acc[item.payment.paymentMethod] = (acc[item.payment.paymentMethod] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    return Object.entries(methodCounts).map(([method, count]) => ({
      name: method === 'razorpay' ? 'Razorpay' : 'Cashfree',
      value: count,
      color: method === 'razorpay' ? '#3b82f6' : '#06b6d4',
    }))
  }, [paymentHistory])

  const statusData = useMemo(() => {
    const statusCounts = paymentHistory.reduce((acc, item) => {
      acc[item.payment.status] = (acc[item.payment.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const statusColors: Record<string, string> = {
      completed: '#10b981',
      pending: '#f59e0b',
      failed: '#ef4444',
      refunded: '#6b7280',
      partially_refunded: '#f97316',
    }

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.replace('_', ' '),
      value: count,
      color: statusColors[status] || '#6b7280',
    }))
  }, [paymentHistory])

  const totalRevenue = paymentHistory
    .filter(item => item.payment.status === 'completed')
    .reduce((sum, item) => sum + parseFloat(item.payment.amount), 0)

  const averageOrderValue = paymentHistory.length > 0 
    ? totalRevenue / paymentHistory.filter(item => item.payment.status === 'completed').length 
    : 0

  const successRate = paymentHistory.length > 0
    ? (paymentHistory.filter(item => item.payment.status === 'completed').length / paymentHistory.length) * 100
    : 0

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">₹{totalRevenue.toFixed(2)}</div>
          <div className="text-sm text-muted-foreground">Total Revenue</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">₹{averageOrderValue.toFixed(2)}</div>
          <div className="text-sm text-muted-foreground">Avg Order Value</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{successRate.toFixed(1)}%</div>
          <div className="text-sm text-muted-foreground">Success Rate</div>
        </div>
      </div>

      {/* Payment Trends Chart */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Payment Trends (Last 30 Days)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
            />
            <Tooltip 
              formatter={[
                (value: number, name: string) => [
                  name === 'amount' ? `₹${value}` : value,
                  name === 'amount' ? 'Revenue' : 'Payments'
                ]
              ]}
              labelStyle={{ color: '#374151' }}
              contentStyle={{ 
                backgroundColor: '#f9fafb', 
                border: '1px solid #e5e7eb',
                borderRadius: '6px'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="amount" 
              stroke="#3b82f6" 
              fill="#3b82f680" 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Payment Methods & Status Distribution */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Payment Methods */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
          {paymentMethodData.length > 0 ? (
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [value, 'Payments']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              No payment method data available
            </div>
          )}
          
          {/* Legend */}
          <div className="flex justify-center gap-4 mt-4">
            {paymentMethodData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Status */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Payment Status</h3>
          {statusData.length > 0 ? (
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [value, 'Payments']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              No payment status data available
            </div>
          )}
          
          {/* Legend */}
          <div className="space-y-2 mt-4">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm capitalize">{item.name}</span>
                </div>
                <span className="text-sm font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 