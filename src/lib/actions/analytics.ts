'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { 
  analyticsEvents,
  userActivity,
  courseAnalytics,
  revenueAnalytics,
  learningAnalytics,
  notifications,
  users,
  courses,
  enrollments,
  payments,
  lessonProgress
} from '@/lib/db/schema'
import { eq, and, desc, gte, lte, sql, count, avg, sum } from 'drizzle-orm'

// Validation schemas
const analyticsEventSchema = z.object({
  tenantId: z.string().optional(),
  userId: z.string().uuid().optional(),
  sessionId: z.string().optional(),
  eventType: z.string().min(1),
  eventCategory: z.string().min(1),
  eventAction: z.string().min(1),
  eventLabel: z.string().optional(),
  eventValue: z.number().optional(),
  properties: z.record(z.any()).optional(),
  page: z.string().optional(),
  referrer: z.string().optional(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  deviceType: z.string().optional(),
  browser: z.string().optional(),
  os: z.string().optional(),
})

const userActivitySchema = z.object({
  userId: z.string().uuid(),
  activityType: z.string().min(1),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
})

const notificationSchema = z.object({
  userId: z.string().uuid(),
  title: z.string().min(1),
  message: z.string().min(1),
  type: z.enum(['info', 'success', 'warning', 'error']).default('info'),
  category: z.enum(['system', 'course', 'payment', 'certificate', 'live_class']).default('system'),
  actionUrl: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  expiresAt: z.date().optional(),
})

// Analytics Event Actions
export async function trackAnalyticsEvent(formData: FormData) {
  try {
    const data = analyticsEventSchema.parse({
      tenantId: formData.get('tenantId') || undefined,
      userId: formData.get('userId') || undefined,
      sessionId: formData.get('sessionId') || undefined,
      eventType: formData.get('eventType'),
      eventCategory: formData.get('eventCategory'),
      eventAction: formData.get('eventAction'),
      eventLabel: formData.get('eventLabel') || undefined,
      eventValue: formData.get('eventValue') ? Number(formData.get('eventValue')) : undefined,
      properties: formData.get('properties') ? JSON.parse(formData.get('properties') as string) : undefined,
      page: formData.get('page') || undefined,
      referrer: formData.get('referrer') || undefined,
      userAgent: formData.get('userAgent') || undefined,
      ipAddress: formData.get('ipAddress') || undefined,
      country: formData.get('country') || undefined,
      city: formData.get('city') || undefined,
      deviceType: formData.get('deviceType') || undefined,
      browser: formData.get('browser') || undefined,
      os: formData.get('os') || undefined,
    })

    const [event] = await db
      .insert(analyticsEvents)
      .values({
        ...data,
        properties: data.properties ? JSON.stringify(data.properties) : null,
        timestamp: new Date(),
      })
      .returning()

    return { success: true, data: event }
  } catch (error) {
    console.error('Track analytics event error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to track analytics event',
    }
  }
}

export async function trackUserActivity(formData: FormData) {
  try {
    const data = userActivitySchema.parse({
      userId: formData.get('userId'),
      activityType: formData.get('activityType'),
      description: formData.get('description') || undefined,
      metadata: formData.get('metadata') ? JSON.parse(formData.get('metadata') as string) : undefined,
      ipAddress: formData.get('ipAddress') || undefined,
      userAgent: formData.get('userAgent') || undefined,
    })

    const [activity] = await db
      .insert(userActivity)
      .values({
        ...data,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        timestamp: new Date(),
      })
      .returning()

    return { success: true, data: activity }
  } catch (error) {
    console.error('Track user activity error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to track user activity',
    }
  }
}

// Analytics Retrieval Functions
export async function getAnalyticsOverview(tenantId?: string, dateRange?: { start: Date; end: Date }) {
  try {
    const startDate = dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
    const endDate = dateRange?.end || new Date()

    // Get basic counts
    const totalUsers = await db
      .select({ count: count() })
      .from(users)
      .where(gte(users.createdAt, startDate))

    const totalCourses = await db
      .select({ count: count() })
      .from(courses)
      .where(gte(courses.createdAt, startDate))

    const totalEnrollments = await db
      .select({ count: count() })
      .from(enrollments)
      .where(gte(enrollments.enrolledAt, startDate))

    const totalRevenue = await db
      .select({ 
        total: sql`COALESCE(SUM(CAST(${payments.amount} AS DECIMAL)), 0)` 
      })
      .from(payments)
      .where(and(
        eq(payments.status, 'completed'),
        gte(payments.createdAt, startDate)
      ))

    // Get page views
    const pageViews = await db
      .select({ count: count() })
      .from(analyticsEvents)
      .where(and(
        eq(analyticsEvents.eventType, 'page_view'),
        gte(analyticsEvents.timestamp, startDate),
        tenantId ? eq(analyticsEvents.tenantId, tenantId) : sql`true`
      ))

    // Get course completions
    const courseCompletions = await db
      .select({ count: count() })
      .from(enrollments)
      .where(and(
        eq(enrollments.status, 'completed'),
        gte(enrollments.enrolledAt, startDate)
      ))

    return {
      success: true,
      data: {
        totalUsers: totalUsers[0]?.count || 0,
        totalCourses: totalCourses[0]?.count || 0,
        totalEnrollments: totalEnrollments[0]?.count || 0,
        totalRevenue: Number(totalRevenue[0]?.total) || 0,
        pageViews: pageViews[0]?.count || 0,
        courseCompletions: courseCompletions[0]?.count || 0,
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
    const enrollments = await db
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
        enrollments: enrollments[0] || { total: 0, completed: 0, active: 0, avgProgress: 0 },
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

    // Get top courses by revenue
    const topCourses = await db
      .select({
        course: courses,
        revenue: sql`COALESCE(SUM(CAST(${payments.amount} AS DECIMAL)), 0)`,
        enrollments: count(),
      })
      .from(payments)
      .innerJoin(courses, eq(payments.courseId, courses.id))
      .where(and(
        eq(payments.status, 'completed'),
        gte(payments.createdAt, startDate),
        lte(payments.createdAt, endDate)
      ))
      .groupBy(courses.id)
      .orderBy(sql`COALESCE(SUM(CAST(${payments.amount} AS DECIMAL)), 0) DESC`)
      .limit(10)

    return {
      success: true,
      data: {
        overview: revenueOverview[0] || { totalRevenue: 0, totalTransactions: 0, avgOrderValue: 0 },
        revenueTrend,
        revenueByMethod,
        topCourses,
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

    // Get page views and user sessions
    const engagementOverview = await db
      .select({
        pageViews: sql`COUNT(CASE WHEN ${analyticsEvents.eventType} = 'page_view' THEN 1 END)`,
        uniqueUsers: sql`COUNT(DISTINCT ${analyticsEvents.userId})`,
        avgSessionDuration: sql`AVG(CAST(${analyticsEvents.eventValue} AS DECIMAL))`,
        bounceRate: sql`(COUNT(CASE WHEN ${analyticsEvents.eventType} = 'bounce' THEN 1 END) * 100.0 / COUNT(CASE WHEN ${analyticsEvents.eventType} = 'page_view' THEN 1 END))`,
      })
      .from(analyticsEvents)
      .where(and(
        gte(analyticsEvents.timestamp, startDate),
        lte(analyticsEvents.timestamp, endDate),
        tenantId ? eq(analyticsEvents.tenantId, tenantId) : sql`true`
      ))

    // Get daily engagement trend
    const engagementTrend = await db
      .select({
        date: sql`DATE(${analyticsEvents.timestamp})`,
        pageViews: sql`COUNT(CASE WHEN ${analyticsEvents.eventType} = 'page_view' THEN 1 END)`,
        uniqueUsers: sql`COUNT(DISTINCT ${analyticsEvents.userId})`,
        events: count(),
      })
      .from(analyticsEvents)
      .where(and(
        gte(analyticsEvents.timestamp, startDate),
        lte(analyticsEvents.timestamp, endDate),
        tenantId ? eq(analyticsEvents.tenantId, tenantId) : sql`true`
      ))
      .groupBy(sql`DATE(${analyticsEvents.timestamp})`)
      .orderBy(sql`DATE(${analyticsEvents.timestamp})`)

    // Get top pages
    const topPages = await db
      .select({
        page: analyticsEvents.page,
        views: count(),
        uniqueViews: sql`COUNT(DISTINCT ${analyticsEvents.userId})`,
      })
      .from(analyticsEvents)
      .where(and(
        eq(analyticsEvents.eventType, 'page_view'),
        gte(analyticsEvents.timestamp, startDate),
        lte(analyticsEvents.timestamp, endDate),
        tenantId ? eq(analyticsEvents.tenantId, tenantId) : sql`true`
      ))
      .groupBy(analyticsEvents.page)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(10)

    // Get device/browser analytics
    const deviceAnalytics = await db
      .select({
        deviceType: analyticsEvents.deviceType,
        browser: analyticsEvents.browser,
        os: analyticsEvents.os,
        count: count(),
      })
      .from(analyticsEvents)
      .where(and(
        gte(analyticsEvents.timestamp, startDate),
        lte(analyticsEvents.timestamp, endDate),
        tenantId ? eq(analyticsEvents.tenantId, tenantId) : sql`true`
      ))
      .groupBy(analyticsEvents.deviceType, analyticsEvents.browser, analyticsEvents.os)
      .orderBy(sql`COUNT(*) DESC`)

    return {
      success: true,
      data: {
        overview: engagementOverview[0] || { pageViews: 0, uniqueUsers: 0, avgSessionDuration: 0, bounceRate: 0 },
        engagementTrend,
        topPages,
        deviceAnalytics,
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

// Notification Actions
export async function createNotification(formData: FormData) {
  try {
    const data = notificationSchema.parse({
      userId: formData.get('userId'),
      title: formData.get('title'),
      message: formData.get('message'),
      type: (formData.get('type') as any) || 'info',
      category: (formData.get('category') as any) || 'system',
      actionUrl: formData.get('actionUrl') || undefined,
      metadata: formData.get('metadata') ? JSON.parse(formData.get('metadata') as string) : undefined,
      expiresAt: formData.get('expiresAt') ? new Date(formData.get('expiresAt') as string) : undefined,
    })

    const [notification] = await db
      .insert(notifications)
      .values({
        ...data,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        isRead: false,
      })
      .returning()

    return { success: true, data: notification }
  } catch (error) {
    console.error('Create notification error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create notification',
    }
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const [notification] = await db
      .update(notifications)
      .set({
        isRead: true,
        updatedAt: new Date(),
      })
      .where(eq(notifications.id, notificationId))
      .returning()

    return { success: true, data: notification }
  } catch (error) {
    console.error('Mark notification as read error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark notification as read',
    }
  }
}

export async function getUserNotifications(userId: string, limit: number = 20) {
  try {
    const userNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)

    const unreadCount = await db
      .select({ count: count() })
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ))

    return {
      success: true,
      data: {
        notifications: userNotifications,
        unreadCount: unreadCount[0]?.count || 0,
      },
    }
  } catch (error) {
    console.error('Get user notifications error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get user notifications',
    }
  }
}

// Export Functions
export async function exportAnalyticsData(type: string, tenantId?: string, dateRange?: { start: Date; end: Date }) {
  try {
    const startDate = dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const endDate = dateRange?.end || new Date()

    let data: any[] = []
    
    switch (type) {
      case 'users':
        data = await db
          .select()
          .from(users)
          .where(and(
            gte(users.createdAt, startDate),
            lte(users.createdAt, endDate)
          ))
        break
      
      case 'enrollments':
        data = await db
          .select({
            enrollment: enrollments,
            course: courses,
            user: users,
          })
          .from(enrollments)
          .innerJoin(courses, eq(enrollments.courseId, courses.id))
          .innerJoin(users, eq(enrollments.userId, users.id))
          .where(and(
            gte(enrollments.enrolledAt, startDate),
            lte(enrollments.enrolledAt, endDate)
          ))
        break
      
      case 'revenue':
        data = await db
          .select({
            payment: payments,
            course: courses,
            user: users,
          })
          .from(payments)
          .leftJoin(courses, eq(payments.courseId, courses.id))
          .innerJoin(users, eq(payments.userId, users.id))
          .where(and(
            eq(payments.status, 'completed'),
            gte(payments.createdAt, startDate),
            lte(payments.createdAt, endDate)
          ))
        break
      
      case 'events':
        data = await db
          .select()
          .from(analyticsEvents)
          .where(and(
            gte(analyticsEvents.timestamp, startDate),
            lte(analyticsEvents.timestamp, endDate),
            tenantId ? eq(analyticsEvents.tenantId, tenantId) : sql`true`
          ))
        break
      
      default:
        throw new Error('Invalid export type')
    }

    return {
      success: true,
      data: {
        type,
        records: data,
        count: data.length,
        dateRange: { start: startDate, end: endDate },
      },
    }
  } catch (error) {
    console.error('Export analytics data error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export analytics data',
    }
  }
} 