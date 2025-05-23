import { pgTable, text, timestamp, uuid, integer, boolean, decimal, jsonb, varchar } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  avatar: text('avatar'),
  role: text('role', { enum: ['student', 'instructor', 'admin'] }).notNull().default('student'),
  isActive: boolean('is_active').notNull().default(true),
  emailVerified: timestamp('email_verified'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// User profiles table
export const userProfiles = pgTable('user_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  bio: text('bio'),
  phone: text('phone'),
  address: text('address'),
  dateOfBirth: timestamp('date_of_birth'),
  skills: jsonb('skills'),
  socialLinks: jsonb('social_links'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Categories table
export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  image: text('image'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Courses table
export const courses = pgTable('courses', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  shortDescription: text('short_description'),
  thumbnail: text('thumbnail'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  discountPrice: decimal('discount_price', { precision: 10, scale: 2 }),
  currency: text('currency').notNull().default('INR'),
  duration: integer('duration'), // in hours
  level: text('level', { enum: ['beginner', 'intermediate', 'advanced'] }).notNull(),
  language: text('language').notNull().default('English'),
  requirements: jsonb('requirements'),
  learningOutcomes: jsonb('learning_outcomes'),
  instructorId: uuid('instructor_id').notNull().references(() => users.id),
  categoryId: uuid('category_id').notNull().references(() => categories.id),
  isPublished: boolean('is_published').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Course modules table
export const courseModules = pgTable('course_modules', {
  id: uuid('id').primaryKey().defaultRandom(),
  courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  order: integer('order').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Lessons table
export const lessons = pgTable('lessons', {
  id: uuid('id').primaryKey().defaultRandom(),
  moduleId: uuid('module_id').notNull().references(() => courseModules.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  content: text('content'),
  videoUrl: text('video_url'),
  duration: integer('duration'), // in minutes
  order: integer('order').notNull(),
  type: text('type', { enum: ['video', 'text', 'quiz', 'assignment', 'live'] }).notNull(),
  isPreview: boolean('is_preview').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Live classes table
export const liveClasses = pgTable('live_classes', {
  id: uuid('id').primaryKey().defaultRandom(),
  courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  instructorId: uuid('instructor_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  description: text('description'),
  scheduledAt: timestamp('scheduled_at').notNull(),
  duration: integer('duration').notNull(), // in minutes
  meetingUrl: text('meeting_url'),
  meetingId: text('meeting_id'),
  platform: text('platform', { enum: ['zoom', 'google_meet', 'custom'] }).notNull(),
  recordingUrl: text('recording_url'),
  status: text('status', { enum: ['scheduled', 'live', 'completed', 'cancelled'] }).notNull().default('scheduled'),
  maxAttendees: integer('max_attendees'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Enrollments table
export const enrollments = pgTable('enrollments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  enrolledAt: timestamp('enrolled_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
  progress: integer('progress').notNull().default(0), // percentage
  status: text('status', { enum: ['active', 'completed', 'dropped'] }).notNull().default('active'),
  certificateIssued: boolean('certificate_issued').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Lesson progress table
export const lessonProgress = pgTable('lesson_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  lessonId: uuid('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
  isCompleted: boolean('is_completed').notNull().default(false),
  watchTime: integer('watch_time').default(0), // in seconds
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Assignments table
export const assignments = pgTable('assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  lessonId: uuid('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  instructions: text('instructions'),
  dueDate: timestamp('due_date'),
  maxScore: integer('max_score').notNull().default(100),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Assignment submissions table
export const assignmentSubmissions = pgTable('assignment_submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  assignmentId: uuid('assignment_id').notNull().references(() => assignments.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content'),
  attachments: jsonb('attachments'),
  score: integer('score'),
  feedback: text('feedback'),
  status: text('status', { enum: ['submitted', 'graded', 'returned'] }).notNull().default('submitted'),
  submittedAt: timestamp('submitted_at').notNull().defaultNow(),
  gradedAt: timestamp('graded_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Quizzes table
export const quizzes = pgTable('quizzes', {
  id: uuid('id').primaryKey().defaultRandom(),
  lessonId: uuid('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  timeLimit: integer('time_limit'), // in minutes
  maxAttempts: integer('max_attempts').default(1),
  passingScore: integer('passing_score').notNull().default(70),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Quiz questions table
export const quizQuestions = pgTable('quiz_questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  quizId: uuid('quiz_id').notNull().references(() => quizzes.id, { onDelete: 'cascade' }),
  question: text('question').notNull(),
  type: text('type', { enum: ['multiple_choice', 'true_false', 'short_answer'] }).notNull(),
  options: jsonb('options'),
  correctAnswer: text('correct_answer').notNull(),
  explanation: text('explanation'),
  points: integer('points').notNull().default(1),
  order: integer('order').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Quiz attempts table
export const quizAttempts = pgTable('quiz_attempts', {
  id: uuid('id').primaryKey().defaultRandom(),
  quizId: uuid('quiz_id').notNull().references(() => quizzes.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  answers: jsonb('answers'),
  score: integer('score'),
  totalQuestions: integer('total_questions').notNull(),
  correctAnswers: integer('correct_answers'),
  timeSpent: integer('time_spent'), // in seconds
  status: text('status', { enum: ['in_progress', 'completed', 'abandoned'] }).notNull().default('in_progress'),
  startedAt: timestamp('started_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Payments table
export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('INR'),
  paymentMethod: text('payment_method', { enum: ['razorpay', 'cashfree'] }).notNull(),
  paymentId: text('payment_id').notNull(),
  orderId: text('order_id').notNull(),
  status: text('status', { enum: ['pending', 'completed', 'failed', 'refunded'] }).notNull().default('pending'),
  paymentData: jsonb('payment_data'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Certificates table
export const certificates = pgTable('certificates', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  certificateId: text('certificate_id').notNull().unique(),
  issuedAt: timestamp('issued_at').notNull().defaultNow(),
  completionDate: timestamp('completion_date').notNull(),
  attendancePercentage: integer('attendance_percentage'),
  certificateUrl: text('certificate_url'),
  verificationCode: text('verification_code').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Notifications table
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type', { enum: ['info', 'success', 'warning', 'error'] }).notNull().default('info'),
  isRead: boolean('is_read').notNull().default(false),
  actionUrl: text('action_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// White label settings table
export const whiteLabelSettings = pgTable('white_label_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationName: text('organization_name').notNull(),
  domain: text('domain').unique(),
  logo: text('logo'),
  favicon: text('favicon'),
  primaryColor: text('primary_color').default('#000000'),
  secondaryColor: text('secondary_color').default('#ffffff'),
  customCss: text('custom_css'),
  emailTemplates: jsonb('email_templates'),
  currency: text('currency').notNull().default('INR'),
  timezone: text('timezone').notNull().default('Asia/Kolkata'),
  taxRate: decimal('tax_rate', { precision: 5, scale: 2 }).default('0.00'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Define relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  courses: many(courses),
  enrollments: many(enrollments),
  liveClasses: many(liveClasses),
  payments: many(payments),
  certificates: many(certificates),
  notifications: many(notifications),
}))

export const coursesRelations = relations(courses, ({ one, many }) => ({
  instructor: one(users, {
    fields: [courses.instructorId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [courses.categoryId],
    references: [categories.id],
  }),
  modules: many(courseModules),
  enrollments: many(enrollments),
  liveClasses: many(liveClasses),
  payments: many(payments),
  certificates: many(certificates),
}))

export const courseModulesRelations = relations(courseModules, ({ one, many }) => ({
  course: one(courses, {
    fields: [courseModules.courseId],
    references: [courses.id],
  }),
  lessons: many(lessons),
}))

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  module: one(courseModules, {
    fields: [lessons.moduleId],
    references: [courseModules.id],
  }),
  progress: many(lessonProgress),
  assignments: many(assignments),
  quizzes: many(quizzes),
}))

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  user: one(users, {
    fields: [enrollments.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id],
  }),
})) 