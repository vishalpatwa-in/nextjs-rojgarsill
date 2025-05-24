import { Suspense } from "react"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getCategories } from "@/lib/actions/courses"
import { CourseForm } from "@/components/courses/course-form"
import { BookOpen } from "lucide-react"

// Mock data for now - will be replaced with actual user session
const MOCK_INSTRUCTOR_ID = "instructor-123"

export default async function NewCoursePage() {
  const { success, categories, error } = await getCategories()

  if (!success) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load categories</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <BookOpen className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Course</h1>
          <p className="text-gray-600">Fill in the details to create your course</p>
        </div>
      </div>

      {/* Course Form */}
      <Card>
        <CardHeader>
          <CardTitle>Course Information</CardTitle>
          <CardDescription>
            Provide the basic information about your course. You can always edit these details later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CourseForm 
            categories={categories || []}
            instructorId={MOCK_INSTRUCTOR_ID}
          />
        </CardContent>
      </Card>
    </div>
  )
} 