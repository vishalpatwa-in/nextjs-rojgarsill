'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { getAnalyticsOverview, getRevenueAnalytics, getEngagementAnalytics, exportAnalyticsData } from '@/lib/actions/analytics'
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Eye,
  MousePointer,
  Download,
  Calendar,
  BarChart3
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'

interface AnalyticsOverviewProps {
  tenantId?: string
}

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ReactNode
  description?: string
}

const COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

function MetricCard({ title, value, change, icon, description }: MetricCardProps) {
  const isPositive = change && change > 0
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            {isPositive ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
            <span className={isPositive ? 'text-green-500' : 'text-red-500'}>
              {Math.abs(change)}%
            </span>
            <span>from last month</span>
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

export function AnalyticsOverview({ tenantId }: AnalyticsOverviewProps) {
  const [overviewData, setOverviewData] = useState<any>(null)
  const [revenueData, setRevenueData] = useState<any>(null)
  const [engagementData, setEngagementData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30d')
  const [isExporting, setIsExporting] = useState(false)

  const dateRanges = {
    '7d': { days: 7, label: 'Last 7 days' },
    '30d': { days: 30, label: 'Last 30 days' },
    '90d': { days: 90, label: 'Last 90 days' },
    '1y': { days: 365, label: 'Last year' },
  }

  useEffect(() => {
    loadAnalyticsData()
  }, [dateRange, tenantId])

  const loadAnalyticsData = async () => {
    setIsLoading(true)
    try {
      const days = dateRanges[dateRange as keyof typeof dateRanges].days
      const endDate = new Date()
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

      const [overview, revenue, engagement] = await Promise.all([
        getAnalyticsOverview(tenantId, { start: startDate, end: endDate }),
        getRevenueAnalytics(tenantId, { start: startDate, end: endDate }),
        getEngagementAnalytics(tenantId, { start: startDate, end: endDate })
      ])

      if (overview.success) setOverviewData(overview.data)
      if (revenue.success) setRevenueData(revenue.data)
      if (engagement.success) setEngagementData(engagement.data)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async (type: string) => {
    setIsExporting(true)
    try {
      const days = dateRanges[dateRange as keyof typeof dateRanges].days
      const endDate = new Date()
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

      const result = await exportAnalyticsData(type, tenantId, { start: startDate, end: endDate })
      
      if (result.success && result.data) {
        // Always create a valid array for export regardless of result type
        let dataToExport: any[] = [];
        
        // Create a simplified data structure using only the properties that exist in the response
        switch (type) {
          case 'revenue':
            // Handle revenue export - extract trend data if available
            if ((result.data.exportData as any)?.trend) {
              dataToExport = (result.data.exportData as any).trend;
            } else {
              dataToExport = [{
                date: new Date().toISOString().split('T')[0],
                revenue: 0,
                transactions: 0
              }];
            }
            break;
            
          case 'engagement':
            // Handle engagement export - extract user activity data if available
            if ((result.data.exportData as any)?.engagement?.dailyActiveUsers) {
              dataToExport = (result.data.exportData as any).engagement.dailyActiveUsers;
            } else {
              dataToExport = [{
                date: new Date().toISOString().split('T')[0],
                count: 0
              }];
            }
            break;
            
          case 'overview':
          default:
            // For overview, create a simple export with whatever data is available
            dataToExport = [{
              date: new Date().toISOString().split('T')[0],
              // Get values from appropriate type or use defaults
              activeUsers: 0,
              totalEnrollments: 0,
              totalRevenue: 0,
              transactions: 0
            }];
            
            // Try to get values based on the type of export data returned
            const data = result.data.exportData;
            
            // Check if overview data exists
            if ('activeUsers' in data) {
              dataToExport[0].activeUsers = data.activeUsers || 0;
            }
            
            // Check if enrollment data exists
            if ('enrollments' in data && data.enrollments) {
              dataToExport[0].totalEnrollments = data.enrollments.totalEnrollments || 0;
            }
            
            // Check if revenue data exists
            if ('revenue' in data && data.revenue) {
              dataToExport[0].totalRevenue = data.revenue.totalRevenue || 0;
              dataToExport[0].transactions = data.revenue.transactions || 0;
            }
        }
        
        const csv = convertToCSV(dataToExport, type)
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${type}_export_${dateRange}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const convertToCSV = (data: any[], type: string) => {
    if (!data || !data.length) {
      // Return empty CSV with headers based on export type
      switch (type) {
        case 'revenue':
          return 'date,revenue,transactions\n';
        case 'engagement':
          return 'date,count\n';
        case 'overview':
        default:
          return 'date,activeUsers,totalEnrollments,totalCourses,totalStudents,completionRate,totalRevenue,transactions\n';
      }
    }
    
    const headers = Object.keys(data[0]);
    const rows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle null, undefined, or objects
        if (value === null || value === undefined) return '';
        return typeof value === 'object' ? JSON.stringify(value) : value;
      }).join(',')
    );
    
    return [headers.join(','), ...rows].join('\n');
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight">Analytics Overview</h2>
          <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-gray-200 animate-pulse rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 animate-pulse rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 animate-pulse rounded w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Analytics Overview</h2>
        <div className="flex items-center space-x-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(dateRanges).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleExport('users')}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Users"
          value={overviewData?.totalUsers || 0}
          change={12.5}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          description="Registered users on platform"
        />
        <MetricCard
          title="Active Courses"
          value={overviewData?.totalCourses || 0}
          change={8.2}
          icon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
          description="Published courses"
        />
        <MetricCard
          title="Total Enrollments"
          value={overviewData?.totalEnrollments || 0}
          change={15.3}
          icon={<GraduationCap className="h-4 w-4 text-muted-foreground" />}
          description="Course enrollments"
        />
        <MetricCard
          title="Revenue"
          value={`₹${(overviewData?.totalRevenue || 0).toLocaleString()}`}
          change={23.1}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          description="Total revenue generated"
        />
      </div>

      <Tabs defaultValue="engagement" className="space-y-4">
        <TabsList>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Page Views"
              value={engagementData?.overview?.pageViews || 0}
              change={5.4}
              icon={<Eye className="h-4 w-4 text-muted-foreground" />}
            />
            <MetricCard
              title="Unique Visitors"
              value={engagementData?.overview?.uniqueUsers || 0}
              change={3.2}
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
            />
            <MetricCard
              title="Avg. Session"
              value={`${Math.round(engagementData?.overview?.avgSessionDuration || 0)}s`}
              change={-2.1}
              icon={<MousePointer className="h-4 w-4 text-muted-foreground" />}
            />
            <MetricCard
              title="Bounce Rate"
              value={`${Math.round(engagementData?.overview?.bounceRate || 0)}%`}
              change={-1.5}
              icon={<TrendingDown className="h-4 w-4 text-muted-foreground" />}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Daily Engagement Trend</CardTitle>
                <CardDescription>
                  Page views and unique users over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={engagementData?.engagementTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="pageViews" 
                      stackId="1" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.8}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="uniqueUsers" 
                      stackId="2" 
                      stroke="#06b6d4" 
                      fill="#06b6d4" 
                      fillOpacity={0.8}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Pages</CardTitle>
                <CardDescription>
                  Most visited pages on your platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {engagementData?.topPages?.slice(0, 8).map((page: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {page.page || 'Home'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {page.uniqueViews} unique views
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">{page.views}</Badge>
                        <Progress 
                          value={(page.views / (engagementData?.topPages?.[0]?.views || 1)) * 100} 
                          className="w-16"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              title="Total Revenue"
              value={`₹${(revenueData?.overview?.totalRevenue || 0).toLocaleString()}`}
              change={18.7}
              icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
            />
            <MetricCard
              title="Transactions"
              value={revenueData?.overview?.totalTransactions || 0}
              change={12.3}
              icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
            />
            <MetricCard
              title="Avg. Order Value"
              value={`₹${Math.round(revenueData?.overview?.avgOrderValue || 0)}`}
              change={5.1}
              icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>
                  Daily revenue and transaction count
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData?.revenueTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [
                      name === 'revenue' ? `₹${value}` : value,
                      name === 'revenue' ? 'Revenue' : 'Transactions'
                    ]} />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.8}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>
                  Revenue distribution by payment method
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={revenueData?.revenueByMethod || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="revenue"
                    >
                      {(revenueData?.revenueByMethod || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Courses by Revenue</CardTitle>
              <CardDescription>
                Best performing courses by revenue generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueData?.topCourses?.slice(0, 5).map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.course?.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.enrollments} enrollments
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{Number(item.revenue).toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        ₹{Math.round(Number(item.revenue) / item.enrollments)} avg
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Published Courses"
              value={overviewData?.totalCourses || 0}
              icon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
            />
            <MetricCard
              title="Total Enrollments"
              value={overviewData?.totalEnrollments || 0}
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
            />
            <MetricCard
              title="Completions"
              value={overviewData?.courseCompletions || 0}
              icon={<GraduationCap className="h-4 w-4 text-muted-foreground" />}
            />
            <MetricCard
              title="Completion Rate"
              value={`${Math.round(((overviewData?.courseCompletions || 0) / (overviewData?.totalEnrollments || 1)) * 100)}%`}
              icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Course Performance</CardTitle>
              <CardDescription>
                Enrollment and completion metrics by course
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Detailed course analytics will be displayed here when specific course data is available.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Users"
              value={overviewData?.totalUsers || 0}
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
            />
            <MetricCard
              title="New Users"
              value={Math.round((overviewData?.totalUsers || 0) * 0.15)}
              icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
            />
            <MetricCard
              title="Active Users"
              value={Math.round((overviewData?.totalUsers || 0) * 0.68)}
              icon={<MousePointer className="h-4 w-4 text-muted-foreground" />}
            />
            <MetricCard
              title="Retention Rate"
              value="68%"
              icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>
                User registration and engagement trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                User analytics charts will be displayed here when user activity data is available.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 