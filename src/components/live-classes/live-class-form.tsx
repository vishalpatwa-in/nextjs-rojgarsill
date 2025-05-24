"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Clock,
  Users,
  Video,
  Globe,
  Settings,
  Info
} from "lucide-react"
import { toast } from "sonner"
import { createLiveClass } from "@/lib/actions/live-classes"

const liveClassSchema = z.object({
  courseId: z.string().min(1, 'Please select a course'),
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  description: z.string().optional(),
  scheduledAt: z.string().min(1, 'Please select date and time'),
  duration: z.string().min(1, 'Duration is required').refine((val) => {
    const num = parseInt(val)
    return !isNaN(num) && num > 0 && num <= 480
  }, 'Duration must be between 1 and 480 minutes'),
  platform: z.enum(['zoom', 'google_meet', 'custom'], {
    required_error: 'Please select a platform'
  }),
  meetingUrl: z.string().url().optional().or(z.literal('')),
  maxAttendees: z.string().optional(),
})

type LiveClassFormData = z.infer<typeof liveClassSchema>

interface LiveClassFormProps {
  onSuccess?: () => void
}

// Mock courses data - in real app, this would come from API
const mockCourses = [
  { id: '1', title: 'Complete Web Development Bootcamp' },
  { id: '2', title: 'React.js Masterclass' },
  { id: '3', title: 'Node.js Backend Development' },
  { id: '4', title: 'Python for Data Science' },
]

export function LiveClassForm({ onSuccess }: LiveClassFormProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const form = useForm<LiveClassFormData>({
    resolver: zodResolver(liveClassSchema),
    defaultValues: {
      courseId: '',
      title: '',
      description: '',
      scheduledAt: '',
      duration: '60',
      platform: 'zoom',
      meetingUrl: '',
      maxAttendees: '',
    },
  })

  const selectedPlatform = form.watch('platform')

  const onSubmit = (data: LiveClassFormData) => {
    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append('instructorId', 'instructor-123') // Mock instructor ID
        formData.append('courseId', data.courseId)
        formData.append('title', data.title)
        if (data.description) formData.append('description', data.description)
        formData.append('scheduledAt', data.scheduledAt)
        formData.append('duration', data.duration)
        formData.append('platform', data.platform)
        if (data.meetingUrl) formData.append('meetingUrl', data.meetingUrl)
        if (data.maxAttendees) formData.append('maxAttendees', data.maxAttendees)

        const result = await createLiveClass(formData)

        if (result.success) {
          toast.success('Live class scheduled successfully!')
          form.reset()
          onSuccess?.()
          router.refresh()
        } else {
          toast.error(result.error || 'Failed to schedule live class')
        }
      } catch (error) {
        toast.error('An unexpected error occurred')
      }
    })
  }

  const generateDateTime = () => {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(10, 0, 0, 0) // Set to 10:00 AM tomorrow
    
    // Format as datetime-local input value
    const year = tomorrow.getFullYear()
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0')
    const day = String(tomorrow.getDate()).padStart(2, '0')
    const hours = String(tomorrow.getHours()).padStart(2, '0')
    const minutes = String(tomorrow.getMinutes()).padStart(2, '0')
    
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const getPlatformInfo = (platform: string) => {
    switch (platform) {
      case 'zoom':
        return {
          name: 'Zoom',
          description: 'Professional video conferencing with recording capabilities',
          features: ['HD Video & Audio', 'Screen Sharing', 'Cloud Recording', 'Waiting Room'],
          icon: '📹'
        }
      case 'google_meet':
        return {
          name: 'Google Meet',
          description: 'Google\'s video conferencing integrated with Calendar',
          features: ['HD Video & Audio', 'Screen Sharing', 'Calendar Integration', 'Live Captions'],
          icon: '🎥'
        }
      case 'custom':
        return {
          name: 'Custom Platform',
          description: 'Use your own meeting platform or URL',
          features: ['Custom URL', 'External Platform', 'Manual Setup', 'Flexible Options'],
          icon: '🔗'
        }
      default:
        return null
    }
  }

  const platformInfo = getPlatformInfo(selectedPlatform)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Course Selection */}
        <FormField
          control={form.control}
          name="courseId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {mockCourses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Choose the course this live class belongs to
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Basic Details */}
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Class Title</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., Introduction to React Hooks" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  A clear, descriptive title for your live class
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe what you'll cover in this live session..."
                    className="resize-none"
                    rows={3}
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Help students understand what they'll learn
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Scheduling */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="scheduledAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Date & Time
                </FormLabel>
                <FormControl>
                  <Input 
                    type="datetime-local" 
                    min={generateDateTime()}
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  When should this class start?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Duration (minutes)
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="180">3 hours</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  How long will this class last?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Platform Selection */}
        <FormField
          control={form.control}
          name="platform"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                <Video className="mr-2 h-4 w-4" />
                Platform
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="zoom">📹 Zoom</SelectItem>
                  <SelectItem value="google_meet">🎥 Google Meet</SelectItem>
                  <SelectItem value="custom">🔗 Custom Platform</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Choose your preferred video conferencing platform
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Platform Info */}
        {platformInfo && (
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center">
                <span className="mr-2 text-lg">{platformInfo.icon}</span>
                {platformInfo.name}
              </CardTitle>
              <CardDescription>{platformInfo.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                {platformInfo.features.map((feature, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
              {selectedPlatform === 'custom' && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start">
                    <Info className="h-4 w-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium">Custom Platform Selected</p>
                      <p>You'll need to provide a meeting URL below. The meeting will not be automatically created.</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Custom URL for custom platform */}
        {selectedPlatform === 'custom' && (
          <FormField
            control={form.control}
            name="meetingUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  <Globe className="mr-2 h-4 w-4" />
                  Meeting URL
                </FormLabel>
                <FormControl>
                  <Input 
                    type="url"
                    placeholder="https://your-platform.com/meeting-room" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Provide the URL where students can join the live class
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Additional Settings */}
        <FormField
          control={form.control}
          name="maxAttendees"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                Max Attendees (Optional)
              </FormLabel>
              <FormControl>
                <Input 
                  type="number"
                  min="1"
                  max="1000"
                  placeholder="Leave empty for unlimited" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Limit the number of students who can join this session
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onSuccess?.()}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Scheduling...' : 'Schedule Live Class'}
          </Button>
        </div>
      </form>
    </Form>
  )
} 