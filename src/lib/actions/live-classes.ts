'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { liveClasses } from '@/lib/db/schema'
import { eq, desc, and, gte, lte } from 'drizzle-orm'
import { z } from 'zod'

// Validation schemas
const createLiveClassSchema = z.object({
  courseId: z.string().uuid('Invalid course ID'),
  instructorId: z.string().uuid('Invalid instructor ID'),
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  scheduledAt: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
  duration: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Duration must be a positive number'),
  platform: z.enum(['zoom', 'google_meet', 'custom']),
  meetingUrl: z.string().url().optional(),
  maxAttendees: z.string().optional(),
})

// Mock Zoom API functions - replace with actual Zoom SDK
class ZoomAPI {
  static async createMeeting(options: {
    topic: string
    type: number
    start_time: string
    duration: number
    settings: {
      host_video: boolean
      participant_video: boolean
      join_before_host: boolean
      mute_upon_entry: boolean
      waiting_room: boolean
      auto_recording: string
    }
  }) {
    // Mock response - implement actual Zoom API call
    return {
      id: Math.random().toString(36).substr(2, 9),
      join_url: `https://zoom.us/j/${Math.random().toString().substr(2, 10)}`,
      start_url: `https://zoom.us/s/${Math.random().toString().substr(2, 10)}`,
      password: Math.random().toString(36).substr(2, 6),
      topic: options.topic,
      duration: options.duration,
      created_at: new Date().toISOString(),
    }
  }

  static async deleteMeeting(meetingId: string) {
    // Mock implementation
    return { success: true }
  }

  static async updateMeeting(meetingId: string, options: any) {
    // Mock implementation
    return { success: true }
  }

  static async getRecordings(meetingId: string) {
    // Mock implementation
    return {
      recording_files: [
        {
          id: 'rec_' + Math.random().toString(36).substr(2, 9),
          download_url: `https://zoom.us/recording/download/rec_${Math.random().toString(36).substr(2, 9)}`,
          file_type: 'MP4',
          file_size: 104857600, // 100MB
          recording_type: 'shared_screen_with_speaker_view'
        }
      ]
    }
  }
}

// Mock Google Meet API functions - replace with actual Google Meet API
class GoogleMeetAPI {
  static async createMeeting(options: {
    summary: string
    description?: string
    start: { dateTime: string; timeZone: string }
    end: { dateTime: string; timeZone: string }
    conferenceData: {
      createRequest: {
        requestId: string
        conferenceSolutionKey: { type: string }
      }
    }
  }) {
    // Mock response - implement actual Google Calendar/Meet API call
    return {
      id: Math.random().toString(36).substr(2, 9),
      hangoutLink: `https://meet.google.com/${Math.random().toString(36).substr(2, 10)}`,
      summary: options.summary,
      start: options.start,
      end: options.end,
      created: new Date().toISOString(),
    }
  }

  static async deleteMeeting(eventId: string) {
    // Mock implementation
    return { success: true }
  }

  static async updateMeeting(eventId: string, options: any) {
    // Mock implementation
    return { success: true }
  }
}

export async function createLiveClass(formData: FormData) {
  try {
    const data = Object.fromEntries(formData.entries())
    
    const validatedData = createLiveClassSchema.parse({
      ...data,
      duration: data.duration ? parseInt(data.duration as string) : undefined,
      maxAttendees: data.maxAttendees ? parseInt(data.maxAttendees as string) : undefined,
    })

    const scheduledAt = new Date(validatedData.scheduledAt)
    const duration = parseInt(validatedData.duration)

    let meetingUrl = validatedData.meetingUrl || ''
    let meetingId = ''
    let meetingData: any = {}

    // Create meeting based on platform
    if (validatedData.platform === 'zoom') {
      try {
        const zoomMeeting = await ZoomAPI.createMeeting({
          topic: validatedData.title,
          type: 2, // Scheduled meeting
          start_time: scheduledAt.toISOString(),
          duration: duration,
          settings: {
            host_video: true,
            participant_video: true,
            join_before_host: false,
            mute_upon_entry: true,
            waiting_room: true,
            auto_recording: 'cloud'
          }
        })

        meetingUrl = zoomMeeting.join_url
        meetingId = zoomMeeting.id
        meetingData = {
          zoom_meeting_id: zoomMeeting.id,
          start_url: zoomMeeting.start_url,
          password: zoomMeeting.password
        }
      } catch (error) {
        console.error('Error creating Zoom meeting:', error)
        return { success: false, error: 'Failed to create Zoom meeting' }
      }
    } else if (validatedData.platform === 'google_meet') {
      try {
        const endTime = new Date(scheduledAt.getTime() + duration * 60000)
        
        const meetEvent = await GoogleMeetAPI.createMeeting({
          summary: validatedData.title,
          description: validatedData.description,
          start: {
            dateTime: scheduledAt.toISOString(),
            timeZone: 'Asia/Kolkata'
          },
          end: {
            dateTime: endTime.toISOString(),
            timeZone: 'Asia/Kolkata'
          },
          conferenceData: {
            createRequest: {
              requestId: Math.random().toString(36).substr(2, 9),
              conferenceSolutionKey: { type: 'hangoutsMeet' }
            }
          }
        })

        meetingUrl = meetEvent.hangoutLink
        meetingId = meetEvent.id
        meetingData = {
          google_event_id: meetEvent.id,
          calendar_link: `https://calendar.google.com/calendar/event?eid=${meetEvent.id}`
        }
      } catch (error) {
        console.error('Error creating Google Meet:', error)
        return { success: false, error: 'Failed to create Google Meet' }
      }
    }

    const [liveClass] = await db.insert(liveClasses).values({
      courseId: validatedData.courseId,
      instructorId: validatedData.instructorId,
      title: validatedData.title,
      description: validatedData.description,
      scheduledAt: scheduledAt,
      duration: duration,
      meetingUrl: meetingUrl,
      meetingId: meetingId,
      platform: validatedData.platform,
      maxAttendees: validatedData.maxAttendees ? parseInt(validatedData.maxAttendees) : null,
      status: 'scheduled'
    }).returning()

    revalidatePath('/dashboard/live-classes')
    revalidatePath(`/dashboard/courses/${validatedData.courseId}`)
    
    return { success: true, liveClass: { ...liveClass, meetingData } }
  } catch (error) {
    console.error('Error creating live class:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: 'Failed to create live class' }
  }
}

export async function updateLiveClass(liveClassId: string, formData: FormData) {
  try {
    const data = Object.fromEntries(formData.entries())
    
    const validatedData = createLiveClassSchema.partial().parse({
      ...data,
      duration: data.duration ? parseInt(data.duration as string) : undefined,
      maxAttendees: data.maxAttendees ? parseInt(data.maxAttendees as string) : undefined,
    })

    // Get existing live class
    const [existingClass] = await db
      .select()
      .from(liveClasses)
      .where(eq(liveClasses.id, liveClassId))
      .limit(1)

    if (!existingClass) {
      return { success: false, error: 'Live class not found' }
    }

    let updateData: any = {
      ...validatedData,
      updatedAt: new Date(),
    }

    // Update meeting if platform-specific data changed
    if (validatedData.title || validatedData.scheduledAt || validatedData.duration) {
      if (existingClass.platform === 'zoom' && existingClass.meetingId) {
        try {
          await ZoomAPI.updateMeeting(existingClass.meetingId, {
            topic: validatedData.title || existingClass.title,
            start_time: validatedData.scheduledAt ? new Date(validatedData.scheduledAt).toISOString() : existingClass.scheduledAt.toISOString(),
            duration: validatedData.duration || existingClass.duration
          })
        } catch (error) {
          console.error('Error updating Zoom meeting:', error)
          // Continue with database update even if Zoom update fails
        }
      } else if (existingClass.platform === 'google_meet' && existingClass.meetingId) {
        try {
          const scheduledAt = validatedData.scheduledAt ? new Date(validatedData.scheduledAt) : existingClass.scheduledAt;
          
          // Ensure duration is a number by converting both possible sources
          let durationMinutes: number;
          if (validatedData.duration) {
            durationMinutes = parseInt(String(validatedData.duration), 10);
          } else {
            durationMinutes = parseInt(String(existingClass.duration), 10);
          }
          
          // Convert minutes to milliseconds for the date calculation
          const durationMs = durationMinutes * 60 * 1000;
          const endTime = new Date(scheduledAt.getTime() + durationMs);

          await GoogleMeetAPI.updateMeeting(existingClass.meetingId, {
            summary: validatedData.title || existingClass.title,
            start: {
              dateTime: scheduledAt.toISOString(),
              timeZone: 'Asia/Kolkata'
            },
            end: {
              dateTime: endTime.toISOString(),
              timeZone: 'Asia/Kolkata'
            }
          })
        } catch (error) {
          console.error('Error updating Google Meet:', error)
          // Continue with database update even if Google Meet update fails
        }
      }
    }

    const [updatedClass] = await db
      .update(liveClasses)
      .set(updateData)
      .where(eq(liveClasses.id, liveClassId))
      .returning()

    revalidatePath('/dashboard/live-classes')
    revalidatePath(`/dashboard/courses/${existingClass.courseId}`)
    
    return { success: true, liveClass: updatedClass }
  } catch (error) {
    console.error('Error updating live class:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: 'Failed to update live class' }
  }
}

export async function deleteLiveClass(liveClassId: string) {
  try {
    const [existingClass] = await db
      .select()
      .from(liveClasses)
      .where(eq(liveClasses.id, liveClassId))
      .limit(1)

    if (!existingClass) {
      return { success: false, error: 'Live class not found' }
    }

    // Delete meeting from platform
    if (existingClass.meetingId) {
      if (existingClass.platform === 'zoom') {
        try {
          await ZoomAPI.deleteMeeting(existingClass.meetingId)
        } catch (error) {
          console.error('Error deleting Zoom meeting:', error)
          // Continue with database deletion even if Zoom deletion fails
        }
      } else if (existingClass.platform === 'google_meet') {
        try {
          await GoogleMeetAPI.deleteMeeting(existingClass.meetingId)
        } catch (error) {
          console.error('Error deleting Google Meet:', error)
          // Continue with database deletion even if Google Meet deletion fails
        }
      }
    }

    await db.delete(liveClasses).where(eq(liveClasses.id, liveClassId))

    revalidatePath('/dashboard/live-classes')
    revalidatePath(`/dashboard/courses/${existingClass.courseId}`)
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting live class:', error)
    return { success: false, error: 'Failed to delete live class' }
  }
}

export async function startLiveClass(liveClassId: string) {
  try {
    const [updatedClass] = await db
      .update(liveClasses)
      .set({
        status: 'live',
        updatedAt: new Date(),
      })
      .where(eq(liveClasses.id, liveClassId))
      .returning()

    revalidatePath('/dashboard/live-classes')
    
    return { success: true, liveClass: updatedClass }
  } catch (error) {
    console.error('Error starting live class:', error)
    return { success: false, error: 'Failed to start live class' }
  }
}

export async function endLiveClass(liveClassId: string) {
  try {
    const [existingClass] = await db
      .select()
      .from(liveClasses)
      .where(eq(liveClasses.id, liveClassId))
      .limit(1)

    if (!existingClass) {
      return { success: false, error: 'Live class not found' }
    }

    // Get recording if available
    let recordingUrl = null
    if (existingClass.platform === 'zoom' && existingClass.meetingId) {
      try {
        const recordings = await ZoomAPI.getRecordings(existingClass.meetingId)
        if (recordings.recording_files && recordings.recording_files.length > 0) {
          recordingUrl = recordings.recording_files[0].download_url
        }
      } catch (error) {
        console.error('Error fetching Zoom recording:', error)
      }
    }

    const [updatedClass] = await db
      .update(liveClasses)
      .set({
        status: 'completed',
        recordingUrl: recordingUrl,
        updatedAt: new Date(),
      })
      .where(eq(liveClasses.id, liveClassId))
      .returning()

    revalidatePath('/dashboard/live-classes')
    
    return { success: true, liveClass: updatedClass }
  } catch (error) {
    console.error('Error ending live class:', error)
    return { success: false, error: 'Failed to end live class' }
  }
}

export async function getLiveClassesByInstructor(instructorId: string) {
  try {
    const instructorClasses = await db
      .select()
      .from(liveClasses)
      .where(eq(liveClasses.instructorId, instructorId))
      .orderBy(desc(liveClasses.scheduledAt))

    return { success: true, liveClasses: instructorClasses }
  } catch (error) {
    console.error('Error fetching instructor live classes:', error)
    return { success: false, error: 'Failed to fetch live classes' }
  }
}

export async function getLiveClassesByCourse(courseId: string) {
  try {
    const courseClasses = await db
      .select()
      .from(liveClasses)
      .where(eq(liveClasses.courseId, courseId))
      .orderBy(desc(liveClasses.scheduledAt))

    return { success: true, liveClasses: courseClasses }
  } catch (error) {
    console.error('Error fetching course live classes:', error)
    return { success: false, error: 'Failed to fetch live classes' }
  }
}

export async function getUpcomingLiveClasses(instructorId?: string) {
  try {
    const now = new Date()
    const upcoming = await db
      .select()
      .from(liveClasses)
      .where(
        and(
          gte(liveClasses.scheduledAt, now),
          instructorId ? eq(liveClasses.instructorId, instructorId) : undefined
        )
      )
      .orderBy(liveClasses.scheduledAt)

    return { success: true, liveClasses: upcoming }
  } catch (error) {
    console.error('Error fetching upcoming live classes:', error)
    return { success: false, error: 'Failed to fetch upcoming live classes' }
  }
} 