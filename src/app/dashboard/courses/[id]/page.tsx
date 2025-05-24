import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BookOpen, 
  Edit, 
  Plus, 
  Users, 
  Clock, 
  Eye,
  PlayCircle,
  FileText,
  Settings,
  BarChart3,
  Calendar
} from "lucide-react"
import { getCourseWithModules } from "@/lib/actions/courses"
import { CourseOverview } from "@/components/courses/course-overview"
import { CourseModules } from "@/components/courses/course-modules"
import { CourseStudents } from "@/components/courses/course-students"
import { CourseAnalytics } from "@/components/courses/course-analytics"

interface CoursePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { id } = await params
  const { success, course, error } = await getCourseWithModules(id)

  if (!success || !course) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-3">
          <Link href="/dashboard/courses">
            <Button variant="outline" size="sm">
              ← Back to Courses
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant={course.isPublished ? "default" : "secondary"}>
                {course.isPublished ? "Published" : "Draft"}
              </Badge>
              <Badge variant="outline">{course.level}</Badge>
              <span className="text-sm text-gray-500">
                Created {new Date(course.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/courses/${course.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Course
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/courses/${course.id}/settings`}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      {/* Course Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Students</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
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
                <p className="text-sm font-medium text-gray-600">Modules</p>
                <p className="text-2xl font-bold text-gray-900">{course.modules.length}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Lessons</p>
                <p className="text-2xl font-bold text-gray-900">
                  {course.modules.reduce((total, module) => total + module.lessons.length, 0)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <PlayCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹0</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100">
                <BarChart3 className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="curriculum" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Curriculum
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Students
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <CourseOverview course={{
            ...course,
            requirements: Array.isArray(course.requirements) ? course.requirements : [],
            learningOutcomes: Array.isArray(course.learningOutcomes) ? course.learningOutcomes : [],
          }} />
        </TabsContent>

        <TabsContent value="curriculum" className="space-y-6">
          <CourseModules course={course} />
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <CourseStudents courseId={course.id} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <CourseAnalytics courseId={course.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
} 