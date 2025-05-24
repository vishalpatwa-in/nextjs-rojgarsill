'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { courses, courseModules, lessons, categories } from '@/lib/db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { z } from 'zod'

// Validation schemas
const createCourseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  slug: z.string().min(1, 'Slug is required').max(255),
  description: z.string().optional(),
  shortDescription: z.string().max(500).optional(),
  thumbnail: z.string().url().optional(),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, 'Price must be a valid number'),
  discountPrice: z.string().optional(),
  currency: z.string().default('INR'),
  duration: z.string().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  language: z.string().default('English'),
  requirements: z.array(z.string()).optional(),
  learningOutcomes: z.array(z.string()).optional(),
  categoryId: z.string().uuid('Invalid category ID'),
  instructorId: z.string().uuid('Invalid instructor ID'),
})

const createModuleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  courseId: z.string().uuid('Invalid course ID'),
  order: z.number().int().min(1),
})

const createLessonSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  content: z.string().optional(),
  videoUrl: z.string().url().optional(),
  duration: z.number().int().min(1).optional(),
  moduleId: z.string().uuid('Invalid module ID'),
  order: z.number().int().min(1),
  type: z.enum(['video', 'text', 'quiz', 'assignment', 'live']),
  isPreview: z.boolean().default(false),
})

// Course actions
export async function createCourse(formData: FormData) {
  try {
    const data = Object.fromEntries(formData.entries())
    
    // Parse requirements and learning outcomes if they exist
    const requirements = data.requirements ? JSON.parse(data.requirements as string) : []
    const learningOutcomes = data.learningOutcomes ? JSON.parse(data.learningOutcomes as string) : []
    
    const validatedData = createCourseSchema.parse({
      ...data,
      requirements,
      learningOutcomes,
      duration: data.duration ? parseInt(data.duration as string) : undefined,
    })

    // Generate slug if not provided
    let slug = validatedData.slug
    if (!slug) {
      slug = validatedData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }

    // Check if slug already exists
    const existingCourse = await db.select().from(courses).where(eq(courses.slug, slug)).limit(1)
    if (existingCourse.length > 0) {
      slug = `${slug}-${Date.now()}`
    }

    const [course] = await db.insert(courses).values({
      title: validatedData.title,
      slug,
      description: validatedData.description,
      shortDescription: validatedData.shortDescription,
      thumbnail: validatedData.thumbnail,
      price: validatedData.price,
      discountPrice: validatedData.discountPrice || null,
      currency: validatedData.currency,
      duration: validatedData.duration,
      level: validatedData.level,
      language: validatedData.language,
      requirements: validatedData.requirements,
      learningOutcomes: validatedData.learningOutcomes,
      categoryId: validatedData.categoryId,
      instructorId: validatedData.instructorId,
      isPublished: false,
    }).returning()

    revalidatePath('/dashboard/courses')
    return { success: true, course }
  } catch (error) {
    console.error('Error creating course:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: 'Failed to create course' }
  }
}

export async function updateCourse(courseId: string, formData: FormData) {
  try {
    const data = Object.fromEntries(formData.entries())
    
    const requirements = data.requirements ? JSON.parse(data.requirements as string) : []
    const learningOutcomes = data.learningOutcomes ? JSON.parse(data.learningOutcomes as string) : []
    
    const validatedData = createCourseSchema.partial().parse({
      ...data,
      requirements,
      learningOutcomes,
      duration: data.duration ? parseInt(data.duration as string) : undefined,
    })

    const [updatedCourse] = await db
      .update(courses)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(courses.id, courseId))
      .returning()

    revalidatePath('/dashboard/courses')
    revalidatePath(`/dashboard/courses/${courseId}`)
    return { success: true, course: updatedCourse }
  } catch (error) {
    console.error('Error updating course:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: 'Failed to update course' }
  }
}

export async function deleteCourse(courseId: string) {
  try {
    await db.delete(courses).where(eq(courses.id, courseId))
    
    revalidatePath('/dashboard/courses')
    return { success: true }
  } catch (error) {
    console.error('Error deleting course:', error)
    return { success: false, error: 'Failed to delete course' }
  }
}

export async function publishCourse(courseId: string) {
  try {
    const [updatedCourse] = await db
      .update(courses)
      .set({
        isPublished: true,
        updatedAt: new Date(),
      })
      .where(eq(courses.id, courseId))
      .returning()

    revalidatePath('/dashboard/courses')
    revalidatePath(`/dashboard/courses/${courseId}`)
    return { success: true, course: updatedCourse }
  } catch (error) {
    console.error('Error publishing course:', error)
    return { success: false, error: 'Failed to publish course' }
  }
}

export async function unpublishCourse(courseId: string) {
  try {
    const [updatedCourse] = await db
      .update(courses)
      .set({
        isPublished: false,
        updatedAt: new Date(),
      })
      .where(eq(courses.id, courseId))
      .returning()

    revalidatePath('/dashboard/courses')
    revalidatePath(`/dashboard/courses/${courseId}`)
    return { success: true, course: updatedCourse }
  } catch (error) {
    console.error('Error unpublishing course:', error)
    return { success: false, error: 'Failed to unpublish course' }
  }
}

// Module actions
export async function createModule(formData: FormData) {
  try {
    const data = Object.fromEntries(formData.entries())
    const validatedData = createModuleSchema.parse({
      ...data,
      order: parseInt(data.order as string),
    })

    const [module] = await db.insert(courseModules).values(validatedData).returning()

    revalidatePath(`/dashboard/courses/${validatedData.courseId}`)
    return { success: true, module }
  } catch (error) {
    console.error('Error creating module:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: 'Failed to create module' }
  }
}

export async function updateModule(moduleId: string, formData: FormData) {
  try {
    const data = Object.fromEntries(formData.entries())
    const validatedData = createModuleSchema.partial().parse({
      ...data,
      order: data.order ? parseInt(data.order as string) : undefined,
    })

    const [updatedModule] = await db
      .update(courseModules)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(courseModules.id, moduleId))
      .returning()

    revalidatePath(`/dashboard/courses/${updatedModule.courseId}`)
    return { success: true, module: updatedModule }
  } catch (error) {
    console.error('Error updating module:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: 'Failed to update module' }
  }
}

export async function deleteModule(moduleId: string) {
  try {
    const [deletedModule] = await db
      .delete(courseModules)
      .where(eq(courseModules.id, moduleId))
      .returning()

    revalidatePath(`/dashboard/courses/${deletedModule.courseId}`)
    return { success: true }
  } catch (error) {
    console.error('Error deleting module:', error)
    return { success: false, error: 'Failed to delete module' }
  }
}

// Lesson actions
export async function createLesson(formData: FormData) {
  try {
    const data = Object.fromEntries(formData.entries())
    const validatedData = createLessonSchema.parse({
      ...data,
      order: parseInt(data.order as string),
      duration: data.duration ? parseInt(data.duration as string) : undefined,
      isPreview: data.isPreview === 'true',
    })

    const [lesson] = await db.insert(lessons).values(validatedData).returning()

    // Get the module to revalidate the course page
    const [module] = await db
      .select()
      .from(courseModules)
      .where(eq(courseModules.id, validatedData.moduleId))
      .limit(1)

    if (module) {
      revalidatePath(`/dashboard/courses/${module.courseId}`)
    }

    return { success: true, lesson }
  } catch (error) {
    console.error('Error creating lesson:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: 'Failed to create lesson' }
  }
}

export async function updateLesson(lessonId: string, formData: FormData) {
  try {
    const data = Object.fromEntries(formData.entries())
    const validatedData = createLessonSchema.partial().parse({
      ...data,
      order: data.order ? parseInt(data.order as string) : undefined,
      duration: data.duration ? parseInt(data.duration as string) : undefined,
      isPreview: data.isPreview === 'true',
    })

    const [updatedLesson] = await db
      .update(lessons)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(lessons.id, lessonId))
      .returning()

    // Get the module to revalidate the course page
    const [module] = await db
      .select()
      .from(courseModules)
      .where(eq(courseModules.id, updatedLesson.moduleId))
      .limit(1)

    if (module) {
      revalidatePath(`/dashboard/courses/${module.courseId}`)
    }

    return { success: true, lesson: updatedLesson }
  } catch (error) {
    console.error('Error updating lesson:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: 'Failed to update lesson' }
  }
}

export async function deleteLesson(lessonId: string) {
  try {
    const [deletedLesson] = await db
      .delete(lessons)
      .where(eq(lessons.id, lessonId))
      .returning()

    // Get the module to revalidate the course page
    const [module] = await db
      .select()
      .from(courseModules)
      .where(eq(courseModules.id, deletedLesson.moduleId))
      .limit(1)

    if (module) {
      revalidatePath(`/dashboard/courses/${module.courseId}`)
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting lesson:', error)
    return { success: false, error: 'Failed to delete lesson' }
  }
}

// Utility functions
export async function getCoursesByInstructor(instructorId: string) {
  try {
    const instructorCourses = await db
      .select({
        id: courses.id,
        title: courses.title,
        slug: courses.slug,
        thumbnail: courses.thumbnail,
        price: courses.price,
        level: courses.level,
        isPublished: courses.isPublished,
        createdAt: courses.createdAt,
        category: {
          id: categories.id,
          name: categories.name,
        },
      })
      .from(courses)
      .leftJoin(categories, eq(courses.categoryId, categories.id))
      .where(eq(courses.instructorId, instructorId))
      .orderBy(desc(courses.createdAt))

    return { success: true, courses: instructorCourses }
  } catch (error) {
    console.error('Error fetching instructor courses:', error)
    return { success: false, error: 'Failed to fetch courses' }
  }
}

export async function getCourseWithModules(courseId: string) {
  try {
    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1)

    if (!course) {
      return { success: false, error: 'Course not found' }
    }

    const modules = await db
      .select()
      .from(courseModules)
      .where(eq(courseModules.courseId, courseId))
      .orderBy(courseModules.order)

    const lessonsData = await db
      .select()
      .from(lessons)
      .where(eq(lessons.moduleId, modules[0]?.id || ''))

    // Group lessons by module
    const modulesWithLessons = await Promise.all(
      modules.map(async (module) => {
        const moduleLessons = await db
          .select()
          .from(lessons)
          .where(eq(lessons.moduleId, module.id))
          .orderBy(lessons.order)

        return {
          ...module,
          lessons: moduleLessons,
        }
      })
    )

    return {
      success: true,
      course: {
        ...course,
        modules: modulesWithLessons,
      },
    }
  } catch (error) {
    console.error('Error fetching course with modules:', error)
    return { success: false, error: 'Failed to fetch course details' }
  }
}

export async function getCategories() {
  try {
    const allCategories = await db
      .select()
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(categories.name)

    return { success: true, categories: allCategories }
  } catch (error) {
    console.error('Error fetching categories:', error)
    return { success: false, error: 'Failed to fetch categories' }
  }
}

export async function getAllCourses() {
  try {
    const allCourses = await db
      .select({
        id: courses.id,
        title: courses.title,
        slug: courses.slug,
        description: courses.description,
        thumbnail: courses.thumbnail,
        price: courses.price,
        level: courses.level,
        isPublished: courses.isPublished,
        createdAt: courses.createdAt,
        updatedAt: courses.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
        },
      })
      .from(courses)
      .leftJoin(categories, eq(courses.categoryId, categories.id))
      .where(eq(courses.isPublished, true))
      .orderBy(desc(courses.createdAt))

    return allCourses
  } catch (error) {
    console.error('Error fetching all courses:', error)
    return []
  }
} 