"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  BookOpen,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Users,
  Clock,
  PlayCircle,
  Copy,
  Download,
  Settings
} from "lucide-react"
import { deleteCourse, publishCourse, unpublishCourse } from "@/lib/actions/courses"
import { toast } from "sonner"

interface Course {
  id: string
  title: string
  slug: string
  thumbnail?: string | null
  price: string
  level: string
  isPublished: boolean
  createdAt: Date
  category?: {
    id: string
    name: string
  } | null
}

interface CourseCardProps {
  course: Course
  showManageActions?: boolean
}

export function CourseCard({ course, showManageActions = false }: CourseCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handlePublishToggle = async () => {
    setIsLoading(true)
    try {
      const result = course.isPublished 
        ? await unpublishCourse(course.id)
        : await publishCourse(course.id)

      if (result.success) {
        toast.success(
          course.isPublished 
            ? "Course unpublished successfully" 
            : "Course published successfully"
        )
      } else {
        toast.error(result.error || "Failed to update course")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const result = await deleteCourse(course.id)
      if (result.success) {
        toast.success("Course deleted successfully")
        setShowDeleteDialog(false)
      } else {
        toast.error(result.error || "Failed to delete course")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date))
  }

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        {/* Course Thumbnail */}
        <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center relative">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <PlayCircle className="h-12 w-12 text-blue-600" />
          )}
          <div className="absolute top-3 left-3">
            <Badge variant={course.isPublished ? "default" : "secondary"}>
              {course.isPublished ? "Published" : "Draft"}
            </Badge>
          </div>
          {showManageActions && (
            <div className="absolute top-3 right-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/courses/${course.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/courses/${course.id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Course
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/courses/${course.id}/settings`}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handlePublishToggle} disabled={isLoading}>
                    {course.isPublished ? (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Unpublish
                      </>
                    ) : (
                      <>
                        <Eye className="mr-2 h-4 w-4" />
                        Publish
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="w-fit">
              {course.level}
            </Badge>
            <div className="text-lg font-bold text-blue-600">
              ₹{course.price}
            </div>
          </div>
          <CardTitle className="line-clamp-2">
            <Link 
              href={`/dashboard/courses/${course.id}`}
              className="hover:text-blue-600 transition-colors"
            >
              {course.title}
            </Link>
          </CardTitle>
          {course.category && (
            <CardDescription>
              Category: {course.category.name}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center">
              <Clock className="mr-1 h-4 w-4" />
              Created {formatDate(course.createdAt)}
            </div>
            <div className="flex items-center">
              <Users className="mr-1 h-4 w-4" />
              0 students {/* Mock data - will be replaced with actual enrollment count */}
            </div>
          </div>

          {showManageActions && (
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link href={`/dashboard/courses/${course.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Manage
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link href={`/dashboard/courses/${course.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the course
              "{course.title}" and all its associated content including modules, lessons,
              and student progress.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? "Deleting..." : "Delete Course"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 