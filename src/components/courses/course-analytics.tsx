"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  CheckCircle,
  Star,
  DollarSign,
  Eye,
  Download,
  Calendar,
  Target,
  Award,
  PlayCircle,
  BookOpen
} from "lucide-react"

interface CourseAnalyticsProps {
  courseId: string
}

// Mock analytics data - in real app, this would come from API
const mockAnalytics = {
  overview: {
    totalEnrollments: 245,
    activeStudents: 189,
    completionRate: 78,
    averageRating: 4.6,
    totalRevenue: 122500,
    monthlyGrowth: 12.5,
    engagement: 85
  },
  enrollmentTrend: [
    { month: 'Jan', enrollments: 25, revenue: 12500 },
    { month: 'Feb', enrollments: 32, revenue: 16000 },
    { month: 'Mar', enrollments: 28, revenue: 14000 },
    { month: 'Apr', enrollments: 35, revenue: 17500 },
    { month: 'May', enrollments: 42, revenue: 21000 },
    { month: 'Jun', enrollments: 38, revenue: 19000 },
    { month: 'Jul', enrollments: 45, revenue: 22500 }
  ],
  lessonPerformance: [
    { lesson: 'Introduction to Web Development', completionRate: 95, avgTime: 45, engagement: 92 },
    { lesson: 'HTML Fundamentals', completionRate: 89, avgTime: 38, engagement: 88 },
    { lesson: 'CSS Styling', completionRate: 85, avgTime: 52, engagement: 85 },
    { lesson: 'JavaScript Basics', completionRate: 78, avgTime: 67, engagement: 82 },
    { lesson: 'Responsive Design', completionRate: 72, avgTime: 58, engagement: 79 }
  ],
  demographics: {
    regions: [
      { name: 'North America', percentage: 35, students: 85 },
      { name: 'Europe', percentage: 28, students: 68 },
      { name: 'Asia', percentage: 25, students: 61 },
      { name: 'Others', percentage: 12, students: 31 }
    ],
    devices: [
      { name: 'Desktop', percentage: 45, students: 110 },
      { name: 'Mobile', percentage: 35, students: 86 },
      { name: 'Tablet', percentage: 20, students: 49 }
    ]
  },
  reviews: {
    averageRating: 4.6,
    totalReviews: 156,
    distribution: {
      5: 78,
      4: 45,
      3: 23,
      2: 7,
      1: 3
    }
  }
}

export function CourseAnalytics({ courseId }: CourseAnalyticsProps) {
  const [timeRange, setTimeRange] = useState('7d')
  const analytics = mockAnalytics

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStarPercentage = (rating: number) => {
    return (analytics.reviews.distribution[rating as keyof typeof analytics.reviews.distribution] / analytics.reviews.totalReviews) * 100
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Course Analytics</h2>
          <p className="text-gray-600 text-sm">Insights and performance metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalEnrollments}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-xs text-green-600">+{analytics.overview.monthlyGrowth}% this month</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Students</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.activeStudents}</p>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-gray-500">
                    {Math.round((analytics.overview.activeStudents / analytics.overview.totalEnrollments) * 100)}% of total
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.completionRate}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${analytics.overview.completionRate}%` }}
                  ></div>
                </div>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.overview.totalRevenue)}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-xs text-green-600">+15% this month</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-yellow-100">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Enrollment Trend
            </CardTitle>
            <CardDescription>Monthly enrollments and revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.enrollmentTrend.slice(-4).map((data, index) => (
                <div key={data.month} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div>
                    <span className="font-medium">{data.month}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{data.enrollments} enrollments</div>
                    <div className="text-xs text-gray-500">{formatCurrency(data.revenue)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lesson Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PlayCircle className="mr-2 h-5 w-5" />
              Lesson Performance
            </CardTitle>
            <CardDescription>Completion rates and engagement by lesson</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.lessonPerformance.map((lesson, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{lesson.lesson}</span>
                    <span className="text-sm text-gray-600">{lesson.completionRate}%</span>
                  </div>
                  <Progress value={lesson.completionRate} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Avg time: {lesson.avgTime}min</span>
                    <span>Engagement: {lesson.engagement}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Ratings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="mr-2 h-5 w-5" />
              Student Ratings
            </CardTitle>
            <CardDescription>Course ratings and reviews breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-gray-900">{analytics.reviews.averageRating}</div>
              <div className="flex items-center justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`h-4 w-4 ${star <= Math.floor(analytics.reviews.averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
              <div className="text-sm text-gray-600">{analytics.reviews.totalReviews} reviews</div>
            </div>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center space-x-2">
                  <span className="text-sm w-2">{rating}</span>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full" 
                      style={{ width: `${getStarPercentage(rating)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8">
                    {analytics.reviews.distribution[rating as keyof typeof analytics.reviews.distribution]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Geographic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="mr-2 h-5 w-5" />
              Geographic Distribution
            </CardTitle>
            <CardDescription>Student distribution by region</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.demographics.regions.map((region, index) => (
                <div key={region.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-blue-600" style={{ opacity: 1 - (index * 0.2) }}></div>
                    <span className="text-sm font-medium">{region.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{region.percentage}%</div>
                    <div className="text-xs text-gray-500">{region.students} students</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Device Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              Device Usage
            </CardTitle>
            <CardDescription>How students access the course</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.demographics.devices.map((device, index) => (
                <div key={device.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-green-600" style={{ opacity: 1 - (index * 0.25) }}></div>
                    <span className="text-sm font-medium">{device.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{device.percentage}%</div>
                    <div className="text-xs text-gray-500">{device.students} students</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.averageRating}/5</p>
                <div className="flex items-center mt-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="text-xs text-gray-500">Based on {analytics.reviews.totalReviews} reviews</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-yellow-100">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Engagement Score</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.engagement}%</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-xs text-green-600">Above average</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-indigo-100">
                <Eye className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Certificates Issued</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(analytics.overview.totalEnrollments * (analytics.overview.completionRate / 100))}</p>
                <div className="flex items-center mt-1">
                  <Award className="h-4 w-4 text-purple-600 mr-1" />
                  <span className="text-xs text-gray-500">{analytics.overview.completionRate}% completion</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 