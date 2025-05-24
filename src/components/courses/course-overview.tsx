"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Clock, 
  Globe, 
  DollarSign, 
  Target, 
  CheckCircle,
  BookOpen,
  Users,
  Star
} from "lucide-react"

interface CourseOverviewProps {
  course: {
    id: string
    title: string
    description?: string | null
    shortDescription?: string | null
    thumbnail?: string | null
    price: string
    discountPrice?: string | null
    currency: string
    duration?: number | null
    level: string
    language: string
    requirements?: string[] | null
    learningOutcomes?: string[] | null
    isPublished: boolean
    createdAt: Date
    updatedAt: Date
  }
}

export function CourseOverview({ course }: CourseOverviewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Course Description */}
        <Card>
          <CardHeader>
            <CardTitle>Course Description</CardTitle>
          </CardHeader>
          <CardContent>
            {course.shortDescription && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Short Description</h4>
                <p className="text-gray-600">{course.shortDescription}</p>
              </div>
            )}
            {course.description && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Full Description</h4>
                <div className="prose max-w-none text-gray-600">
                  {course.description.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-3 last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            )}
            {!course.description && !course.shortDescription && (
              <p className="text-gray-500 italic">No description provided</p>
            )}
          </CardContent>
        </Card>

        {/* Learning Outcomes */}
        {course.learningOutcomes && course.learningOutcomes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                What You'll Learn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {course.learningOutcomes.map((outcome, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{outcome}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Requirements */}
        {course.requirements && course.requirements.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {course.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700">{requirement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Course Thumbnail */}
        <Card>
          <CardContent className="p-6">
            <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mb-4">
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-center">
                  <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No thumbnail</p>
                </div>
              )}
            </div>
            
            {/* Pricing */}
            <div className="text-center mb-4">
              <div className="flex items-center justify-center gap-2">
                {course.discountPrice && parseFloat(course.discountPrice) > 0 ? (
                  <>
                    <span className="text-2xl font-bold text-green-600">
                      {course.currency === 'INR' ? '₹' : '$'}{course.discountPrice}
                    </span>
                    <span className="text-lg text-gray-500 line-through">
                      {course.currency === 'INR' ? '₹' : '$'}{course.price}
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-blue-600">
                    {course.currency === 'INR' ? '₹' : '$'}{course.price}
                  </span>
                )}
              </div>
            </div>

            {/* Course Info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Level:</span>
                <Badge variant="outline" className="capitalize">
                  {course.level}
                </Badge>
              </div>
              
              {course.duration && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Duration:</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {course.duration} hours
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Language:</span>
                <span className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  {course.language}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Students:</span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  0 enrolled
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Rating:</span>
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  No ratings yet
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" variant="outline">
              <BookOpen className="mr-2 h-4 w-4" />
              Preview Course
            </Button>
            <Button className="w-full" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              View Students
            </Button>
            <Button className="w-full" variant="outline">
              <DollarSign className="mr-2 h-4 w-4" />
              View Revenue
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 