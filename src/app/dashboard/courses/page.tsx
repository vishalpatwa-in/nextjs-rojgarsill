import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  BookOpen, 
  Plus, 
  Search,
  Eye,
  Edit,
  Trash2,
  Users,
  DollarSign,
  TrendingUp,
  Filter
} from "lucide-react"
import { getCoursesByInstructor } from "@/lib/actions/courses"
import { CourseCard } from "@/components/courses/course-card"
import { CreateCourseButton } from "@/components/courses/create-course-button"

// Mock data for now - will be replaced with actual user session
const MOCK_INSTRUCTOR_ID = "instructor-123"

export default async function CoursesPage() {
  const { success, courses, error } = await getCoursesByInstructor(MOCK_INSTRUCTOR_ID)

  if (!success) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load courses</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  const stats = {
    totalCourses: courses?.length || 0,
    publishedCourses: courses?.filter(course => course.isPublished).length || 0,
    draftCourses: courses?.filter(course => !course.isPublished).length || 0,
    totalRevenue: "₹24,500", // Mock data
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-600 mt-1">Manage and track your course content</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <CreateCourseButton />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-bold text-gray-900">{stats.publishedCourses}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Drafts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.draftCourses}</p>
              </div>
              <div className="p-3 rounded-full bg-orange-100">
                <Edit className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRevenue}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search courses..."
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="sm:w-auto">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Courses Grid */}
      {courses && courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              showManageActions
            />
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
            <p className="text-gray-600 mb-6">
              Get started by creating your first course
            </p>
            <CreateCourseButton />
          </CardContent>
        </Card>
      )}
    </div>
  )
} 