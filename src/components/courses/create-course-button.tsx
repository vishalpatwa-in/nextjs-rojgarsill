"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export function CreateCourseButton() {
  return (
    <Button asChild>
      <Link href="/dashboard/courses/new">
        <Plus className="mr-2 h-4 w-4" />
        Create Course
      </Link>
    </Button>
  )
} 