"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { 
  users, userProfiles, courses, enrollments, lessons,
  courseModules, lessonProgress, payments, analyticsEvents,
  notifications, liveClasses, courseAnalytics, revenueAnalytics,
  learningAnalytics, userActivity
} from "@/lib/db/schema"
import { 
  eq, and, or, gte, lte, 
  count, avg, sum, max, min, 
  sql 
} from "drizzle-orm"

interface AnalyticsEvent {
  eventName: string
  userId?: string
  courseId?: string
  lessonId?: string
  properties?: Record<string, any>
  timestamp: Date
}

interface UserActivity {
  userId: string
  activityType: string
  resourceId?: string
  resourceType?: string
  details?: Record<string, any>
  timestamp: Date
}

interface Notification {
  userId: string
  title: string
  message: string
  type: string
  isRead: boolean
  linkUrl?: string
  timestamp: Date
}

export async function trackEvent(event: AnalyticsEvent) {
  try {
    // Convert AnalyticsEvent to database schema format with only valid fields
    await db.insert(analyticsEvents).values({
      eventType: event.eventName, // Map eventName to eventType
      eventCategory: event.properties?.category || 'general', // Default category
      eventAction: event.properties?.action || event.eventName, // Default action
      eventLabel: event.properties?.label || '',
      eventValue: event.properties?.value ? Number(event.properties.value) : undefined,
      userId: event.userId, // This is a valid field
      // Store courseId and lessonId in properties JSON
      properties: {
        ...(event.properties || {}),
        courseId: event.courseId,
        lessonId: event.lessonId
      },
      timestamp: event.timestamp
    })
    return { success: true }
  } catch (error) {
    console.error('Error tracking event:', error)
    return { success: false, error }
  }
}

export async function trackUserActivity(activity: UserActivity) {
  try {
    // Convert UserActivity to database schema format with only valid fields
    await db.insert(userActivity).values({
      userId: activity.userId,
      activityType: activity.activityType,
      description: activity.resourceType || '',
      // Store additional data in metadata JSON
      metadata: {
        resourceId: activity.resourceId,
        resourceType: activity.resourceType,
        details: activity.details
      },
      timestamp: activity.timestamp
    })
    
    return { success: true }
  } catch (error) {
    console.error('Error tracking user activity:', error)
    return { success: false, error }
  }
}

export async function getAnalyticsOverview(tenantId?: string, dateRange?: { start: Date; end: Date }) {
  try {
    const startDate = dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const endDate = dateRange?.end || new Date()

    // Get active users count
    const activeUsersCount = await db
      .select({ count: count() })
      .from(userActivity)
      .where(and(
        gte(userActivity.timestamp, startDate),
        lte(userActivity.timestamp, endDate)
      ))
      .groupBy(userActivity.userId)
      .then(result => result.length)

    // Get course enrollment stats
    const enrollmentStats = await db
      .select({
        totalEnrollments: count(),
        totalCourses: sql`COUNT(DISTINCT ${enrollments.courseId})`,
        totalStudents: sql`COUNT(DISTINCT ${enrollments.userId})`,
      })
      .from(enrollments)
      .where(and(
        gte(enrollments.enrolledAt, startDate),
        lte(enrollments.enrolledAt, endDate)
      ))

    // Get course completion rate
    const completionStats = await db
      .select({
        total: count(),
        completed: sql`COUNT(CASE WHEN ${enrollments.status} = 'completed' THEN 1 END)`,
      })
      .from(enrollments)
      .where(and(
        gte(enrollments.enrolledAt, startDate),
        lte(enrollments.enrolledAt, endDate)
      ))

    // Get revenue stats
    const revenueStats = await db
      .select({
        totalRevenue: sql`COALESCE(SUM(CAST(${payments.amount} AS DECIMAL)), 0)`,
        transactions: count(),
      })
      .from(payments)
      .where(and(
        eq(payments.status, 'completed'),
        gte(payments.createdAt, startDate),
        lte(payments.createdAt, endDate)
      ))

    // Calculate completion rate
    const completionRate = completionStats[0]?.total 
      ? (Number(completionStats[0]?.completed || 0) / Number(completionStats[0]?.total || 1)) * 100 
      : 0

    return {
      success: true,
      data: {
        activeUsers: activeUsersCount,
        enrollments: enrollmentStats[0] || { totalEnrollments: 0, totalCourses: 0, totalStudents: 0 },
        completionRate: parseFloat(completionRate.toFixed(2)),
        revenue: revenueStats[0] || { totalRevenue: 0, transactions: 0 },
        dateRange: { start: startDate, end: endDate },
      },
    }
  } catch (error) {
    console.error('Get analytics overview error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get analytics overview',
    }
  }
}

export async function getCourseAnalytics(courseId: string, dateRange?: { start: Date; end: Date }) {
  try {
    const startDate = dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const endDate = dateRange?.end || new Date()

    // Get course basic info
    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, courseId))

    if (!course) {
      throw new Error('Course not found')
    }

    // Get enrollments data
    const enrollmentStats = await db
      .select({
        total: count(),
        completed: sql`COUNT(CASE WHEN ${enrollments.status} = 'completed' THEN 1 END)`,
        active: sql`COUNT(CASE WHEN ${enrollments.status} = 'active' THEN 1 END)`,
        avgProgress: avg(enrollments.progress),
      })
      .from(enrollments)
      .where(and(
        eq(enrollments.courseId, courseId),
        gte(enrollments.enrolledAt, startDate)
      ))

    // Get revenue data
    const revenue = await db
      .select({
        total: sql`COALESCE(SUM(CAST(${payments.amount} AS DECIMAL)), 0)`,
        count: count(),
      })
      .from(payments)
      .where(and(
        eq(payments.courseId, courseId),
        eq(payments.status, 'completed'),
        gte(payments.createdAt, startDate)
      ))

    // Get lesson progress
    const lessonStats = await db
      .select({
        totalLessons: count(),
        completedLessons: sql`COUNT(CASE WHEN ${lessonProgress.isCompleted} = true THEN 1 END)`,
        avgWatchTime: avg(lessonProgress.watchTime),
      })
      .from(lessonProgress)
      .innerJoin(enrollments, eq(lessonProgress.userId, enrollments.userId))
      .where(and(
        eq(enrollments.courseId, courseId),
        gte(lessonProgress.createdAt, startDate)
      ))

    // Get daily enrollment trend
    const enrollmentTrend = await db
      .select({
        date: sql`DATE(${enrollments.enrolledAt})`,
        count: count(),
      })
      .from(enrollments)
      .where(and(
        eq(enrollments.courseId, courseId),
        gte(enrollments.enrolledAt, startDate),
        lte(enrollments.enrolledAt, endDate)
      ))
      .groupBy(sql`DATE(${enrollments.enrolledAt})`)
      .orderBy(sql`DATE(${enrollments.enrolledAt})`)

    return {
      success: true,
      data: {
        course,
        enrollments: enrollmentStats[0] || { total: 0, completed: 0, active: 0, avgProgress: 0 },
        revenue: revenue[0] || { total: 0, count: 0 },
        lessonStats: lessonStats[0] || { totalLessons: 0, completedLessons: 0, avgWatchTime: 0 },
        enrollmentTrend,
        dateRange: { start: startDate, end: endDate },
      },
    }
  } catch (error) {
    console.error('Get course analytics error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get course analytics',
    }
  }
}

export async function getUserLearningAnalytics(userId: string, dateRange?: { start: Date; end: Date }) {
  try {
    const startDate = dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const endDate = dateRange?.end || new Date()

    // Get user enrollments
    const userEnrollments = await db
      .select({
        enrollment: enrollments,
        course: courses,
      })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(and(
        eq(enrollments.userId, userId),
        gte(enrollments.enrolledAt, startDate)
      ))

    // Get study time
    const studyTime = await db
      .select({
        totalTime: sql`COALESCE(SUM(${lessonProgress.watchTime}), 0)`,
        sessionsCount: count(),
      })
      .from(lessonProgress)
      .where(and(
        eq(lessonProgress.userId, userId),
        gte(lessonProgress.createdAt, startDate)
      ))

    // Get learning activity
    const learningActivity = await db
      .select({
        date: sql`DATE(${lessonProgress.createdAt})`,
        watchTime: sql`SUM(${lessonProgress.watchTime})`,
        lessonsCompleted: sql`COUNT(CASE WHEN ${lessonProgress.isCompleted} = true THEN 1 END)`,
      })
      .from(lessonProgress)
      .where(and(
        eq(lessonProgress.userId, userId),
        gte(lessonProgress.createdAt, startDate),
        lte(lessonProgress.createdAt, endDate)
      ))
      .groupBy(sql`DATE(${lessonProgress.createdAt})`)
      .orderBy(sql`DATE(${lessonProgress.createdAt})`)

    // Get completion stats
    const completionStats = await db
      .select({
        total: count(),
        completed: sql`COUNT(CASE WHEN ${enrollments.status} = 'completed' THEN 1 END)`,
        inProgress: sql`COUNT(CASE WHEN ${enrollments.status} = 'active' THEN 1 END)`,
        avgProgress: avg(enrollments.progress),
      })
      .from(enrollments)
      .where(and(
        eq(enrollments.userId, userId),
        gte(enrollments.enrolledAt, startDate)
      ))

    return {
      success: true,
      data: {
        enrollments: userEnrollments,
        studyTime: studyTime[0] || { totalTime: 0, sessionsCount: 0 },
        learningActivity,
        completionStats: completionStats[0] || { total: 0, completed: 0, inProgress: 0, avgProgress: 0 },
        dateRange: { start: startDate, end: endDate },
      },
    }
  } catch (error) {
    console.error('Get user learning analytics error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get user learning analytics',
    }
  }
}

export async function getRevenueAnalytics(tenantId?: string, dateRange?: { start: Date; end: Date }) {
  try {
    const startDate = dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const endDate = dateRange?.end || new Date()

    // Get revenue overview
    const revenueOverview = await db
      .select({
        totalRevenue: sql`COALESCE(SUM(CAST(${payments.amount} AS DECIMAL)), 0)`,
        totalTransactions: count(),
        avgOrderValue: sql`COALESCE(AVG(CAST(${payments.amount} AS DECIMAL)), 0)`,
      })
      .from(payments)
      .where(and(
        eq(payments.status, 'completed'),
        gte(payments.createdAt, startDate),
        lte(payments.createdAt, endDate)
      ))

    // Get daily revenue trend
    const revenueTrend = await db
      .select({
        date: sql`DATE(${payments.createdAt})`,
        revenue: sql`COALESCE(SUM(CAST(${payments.amount} AS DECIMAL)), 0)`,
        transactions: count(),
      })
      .from(payments)
      .where(and(
        eq(payments.status, 'completed'),
        gte(payments.createdAt, startDate),
        lte(payments.createdAt, endDate)
      ))
      .groupBy(sql`DATE(${payments.createdAt})`)
      .orderBy(sql`DATE(${payments.createdAt})`)

    // Get revenue by payment method
    const revenueByMethod = await db
      .select({
        method: payments.paymentMethod,
        revenue: sql`COALESCE(SUM(CAST(${payments.amount} AS DECIMAL)), 0)`,
        transactions: count(),
      })
      .from(payments)
      .where(and(
        eq(payments.status, 'completed'),
        gte(payments.createdAt, startDate),
        lte(payments.createdAt, endDate)
      ))
      .groupBy(payments.paymentMethod)

    // Get revenue by course
    const revenueByCourse = await db
      .select({
        courseId: payments.courseId,
        courseTitle: courses.title,
        revenue: sql`COALESCE(SUM(CAST(${payments.amount} AS DECIMAL)), 0)`,
        transactions: count(),
      })
      .from(payments)
      .leftJoin(courses, eq(payments.courseId, courses.id))
      .where(and(
        eq(payments.status, 'completed'),
        gte(payments.createdAt, startDate),
        lte(payments.createdAt, endDate)
      ))
      .groupBy(payments.courseId, courses.title)
      .orderBy(sql`COALESCE(SUM(CAST(${payments.amount} AS DECIMAL)), 0) DESC`)

    return {
      success: true,
      data: {
        overview: revenueOverview[0] || { totalRevenue: 0, totalTransactions: 0, avgOrderValue: 0 },
        trend: revenueTrend,
        byMethod: revenueByMethod,
        byCourse: revenueByCourse,
        dateRange: { start: startDate, end: endDate },
      },
    }
  } catch (error) {
    console.error('Get revenue analytics error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get revenue analytics',
    }
  }
}

export async function getEngagementAnalytics(tenantId?: string, dateRange?: { start: Date; end: Date }) {
  try {
    const startDate = dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const endDate = dateRange?.end || new Date()

    // Get session stats
    const sessionStats = await db
      .select({
        totalSessions: count(),
        uniqueUsers: sql`COUNT(DISTINCT ${userActivity.userId})`,
      })
      .from(userActivity)
      .where(and(
        eq(userActivity.activityType, 'session'),
        gte(userActivity.timestamp, startDate),
        lte(userActivity.timestamp, endDate)
      ))

    // Get daily active users
    const dailyActiveUsers = await db
      .select({
        date: sql`DATE(${userActivity.timestamp})`,
        count: sql`COUNT(DISTINCT ${userActivity.userId})`,
      })
      .from(userActivity)
      .where(and(
        gte(userActivity.timestamp, startDate),
        lte(userActivity.timestamp, endDate)
      ))
      .groupBy(sql`DATE(${userActivity.timestamp})`)
      .orderBy(sql`DATE(${userActivity.timestamp})`)

    // Get most active courses
    const activeCourses = await db
      .select({
        courseId: analyticsEvents.properties, // Access courseId from properties
        courseTitle: courses.title,
        views: count(),
        uniqueUsers: sql`COUNT(DISTINCT ${analyticsEvents.userId})`,
      })
      .from(analyticsEvents)
      .leftJoin(courses, eq(sql`${analyticsEvents.properties}->>'courseId'`, courses.id))
      .where(and(
        gte(analyticsEvents.timestamp, startDate),
        lte(analyticsEvents.timestamp, endDate),
        eq(sql`${analyticsEvents.properties}->>'type'`, 'view_course')
      ))
      .groupBy(sql`${analyticsEvents.properties}->>'courseId'`, courses.title)
      .orderBy(count(), sql`desc`)
      .limit(10)

    // Get most viewed lessons
    const activeLessons = await db
      .select({
        lessonId: analyticsEvents.properties, // Access lessonId from properties
        lessonTitle: lessons.title,
        views: count(),
        uniqueUsers: sql`COUNT(DISTINCT ${analyticsEvents.userId})`,
      })
      .from(analyticsEvents)
      .leftJoin(lessons, eq(sql`${analyticsEvents.properties}->>'lessonId'`, lessons.id))
      .where(and(
        gte(analyticsEvents.timestamp, startDate),
        lte(analyticsEvents.timestamp, endDate),
        eq(sql`${analyticsEvents.properties}->>'type'`, 'view_lesson')
      ))
      .groupBy(sql`${analyticsEvents.properties}->>'lessonId'`, lessons.title)
      .orderBy(count(), sql`desc`)
      .limit(10)

    // Get top search terms
    const searchTerms = await db
      .select({
        term: sql`${analyticsEvents.properties}->>'query'`,
        count: count(),
      })
      .from(analyticsEvents)
      .where(and(
        gte(analyticsEvents.timestamp, startDate),
        lte(analyticsEvents.timestamp, endDate),
        eq(sql`${analyticsEvents.properties}->>'type'`, 'search')
      ))
      .groupBy(sql`${analyticsEvents.properties}->>'query'`)
      .orderBy(count(), sql`desc`)
      .limit(10)

    return {
      success: true,
      data: {
        sessionStats: sessionStats[0] || { totalSessions: 0, uniqueUsers: 0 },
        dailyActiveUsers,
        activeCourses,
        activeLessons,
        searchTerms,
        dateRange: { start: startDate, end: endDate },
      },
    }
  } catch (error) {
    console.error('Get engagement analytics error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get engagement analytics',
    }
  }
}

export async function createNotification(formData: FormData) {
  try {
    const userId = formData.get('userId') as string
    const title = formData.get('title') as string
    const message = formData.get('message') as string
    const type = formData.get('type') as string
    const linkUrl = formData.get('linkUrl') as string | undefined
    
    if (!userId || !title || !message || !type) {
      throw new Error('User ID, title, message, and type are required')
    }
    
    const notification: Notification = {
      userId,
      title,
      message,
      type,
      linkUrl,
      isRead: false,
      timestamp: new Date()
    }

    // Check if the type value is valid for the enum
    const validTypes = ['info', 'success', 'warning', 'error']
    const notificationType = validTypes.includes(type) ? type : 'info'

    await db.insert(notifications).values({
      userId: notification.userId,
      title: notification.title,
      message: notification.message,
      type: notificationType as 'info' | 'success' | 'warning' | 'error',
      category: 'system',
      isRead: notification.isRead,
      actionUrl: notification.linkUrl,
      createdAt: notification.timestamp,
      updatedAt: notification.timestamp
    })

    return {
      success: true,
      message: 'Notification created successfully'
    }
  } catch (error) {
    console.error('Create notification error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create notification'
    }
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId))

    return {
      success: true,
      message: 'Notification marked as read'
    }
  } catch (error) {
    console.error('Mark notification as read error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark notification as read'
    }
  }
}

export async function getUserNotifications(userId: string, limit: number = 20) {
  try {
    const userNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(notifications.createdAt, sql`desc`)
      .limit(limit)

    const unreadCount = await db
      .select({ count: count() })
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ))
      .then(result => result[0]?.count || 0)

    return {
      success: true,
      data: {
        notifications: userNotifications,
        unreadCount
      }
    }
  } catch (error) {
    console.error('Get user notifications error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get user notifications'
    }
  }
}

export async function exportAnalyticsData(type: string, tenantId?: string, dateRange?: { start: Date; end: Date }) {
  try {
    let data
    
    switch (type) {
      case 'revenue':
        const revenueResult = await getRevenueAnalytics(tenantId, dateRange)
        data = revenueResult.success ? revenueResult.data : null
        break
      case 'engagement':
        const engagementResult = await getEngagementAnalytics(tenantId, dateRange)
        data = engagementResult.success ? engagementResult.data : null
        break
      case 'overview':
        const overviewResult = await getAnalyticsOverview(tenantId, dateRange)
        data = overviewResult.success ? overviewResult.data : null
        break
      default:
        throw new Error('Invalid export type')
    }
    
    if (!data) {
      throw new Error('Failed to fetch data for export')
    }
    
    // In a real implementation, you would format the data as CSV or Excel
    // and return a download URL or the file data
    return {
      success: true,
      data: {
        exportType: type,
        exportData: data,
        exportDate: new Date(),
        downloadUrl: `/api/analytics/export/${type}`
      }
    }
  } catch (error) {
    console.error('Export analytics data error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export analytics data'
    }
  }
}

export async function trackAnalyticsEvent(formData: FormData) {
  try {
    const eventName = formData.get('eventName') as string
    const userId = formData.get('userId') as string | undefined
    const courseId = formData.get('courseId') as string | undefined
    const lessonId = formData.get('lessonId') as string | undefined
    const propertiesJson = formData.get('properties') as string | undefined
    
    if (!eventName) {
      throw new Error('Event name is required')
    }

    const properties = propertiesJson ? JSON.parse(propertiesJson) : undefined
    
    const event: AnalyticsEvent = {
      eventName,
      userId,
      courseId,
      lessonId,
      properties,
      timestamp: new Date()
    }

    // Use the trackEvent function internally
    const result = await trackEvent(event)

    return {
      success: result.success,
      message: result.success ? 'Event tracked successfully' : 'Failed to track event',
      error: result.error
    }
  } catch (error) {
    console.error('Track analytics event error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to track event'
    }
  }
}

export async function trackUserActivityForm(formData: FormData) {
  try {
    const userId = formData.get('userId') as string
    const activityType = formData.get('activityType') as string
    const resourceId = formData.get('resourceId') as string | undefined
    const resourceType = formData.get('resourceType') as string | undefined
    const detailsJson = formData.get('details') as string | undefined
    
    if (!userId || !activityType) {
      throw new Error('User ID and activity type are required')
    }

    const details = detailsJson ? JSON.parse(detailsJson) : undefined
    
    const activity: UserActivity = {
      userId,
      activityType,
      resourceId,
      resourceType,
      details,
      timestamp: new Date()
    }

    // Use the trackUserActivity function internally
    const result = await trackUserActivity(activity)

    return {
      success: result.success,
      message: result.success ? 'Activity tracked successfully' : 'Failed to track activity',
      error: result.error
    }
  } catch (error) {
    console.error('Track user activity error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to track activity'
    }
  }
} 