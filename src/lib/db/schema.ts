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

// === PHASE 6: PAYMENT SYSTEM ===

// Payments table (enhanced)
export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  courseId: uuid('course_id').references(() => courses.id, { onDelete: 'cascade' }),
  subscriptionId: uuid('subscription_id').references(() => subscriptions.id, { onDelete: 'cascade' }),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('INR'),
  paymentMethod: text('payment_method', { enum: ['razorpay', 'cashfree', 'bank_transfer'] }).notNull(),
  paymentId: text('payment_id').notNull(),
  orderId: text('order_id').notNull(),
  status: text('status', { enum: ['pending', 'completed', 'failed', 'refunded', 'partially_refunded'] }).notNull().default('pending'),
  paymentData: jsonb('payment_data'),
  transactionFee: decimal('transaction_fee', { precision: 10, scale: 2 }).default('0.00'),
  netAmount: decimal('net_amount', { precision: 10, scale: 2 }).notNull(),
  invoiceId: uuid('invoice_id').references(() => invoices.id),
  refundedAmount: decimal('refunded_amount', { precision: 10, scale: 2 }).default('0.00'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Invoices table
export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  invoiceNumber: text('invoice_number').notNull().unique(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  courseId: uuid('course_id').references(() => courses.id, { onDelete: 'cascade' }),
  subscriptionId: uuid('subscription_id').references(() => subscriptions.id, { onDelete: 'cascade' }),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal('tax_amount', { precision: 10, scale: 2 }).default('0.00'),
  discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }).default('0.00'),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('INR'),
  status: text('status', { enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'] }).notNull().default('draft'),
  dueDate: timestamp('due_date'),
  paidAt: timestamp('paid_at'),
  notes: text('notes'),
  billingAddress: jsonb('billing_address'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Payment methods table
export const paymentMethods = pgTable('payment_methods', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  provider: text('provider', { enum: ['razorpay', 'cashfree'] }).notNull(),
  type: text('type', { enum: ['card', 'bank_account', 'wallet', 'upi'] }).notNull(),
  lastFour: text('last_four'),
  brand: text('brand'),
  expiryMonth: integer('expiry_month'),
  expiryYear: integer('expiry_year'),
  providerMethodId: text('provider_method_id').notNull(),
  isDefault: boolean('is_default').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Subscriptions table
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  planId: uuid('plan_id').notNull().references(() => subscriptionPlans.id),
  status: text('status', { enum: ['active', 'paused', 'cancelled', 'expired'] }).notNull().default('active'),
  currentPeriodStart: timestamp('current_period_start').notNull(),
  currentPeriodEnd: timestamp('current_period_end').notNull(),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').notNull().default(false),
  cancelledAt: timestamp('cancelled_at'),
  trialStart: timestamp('trial_start'),
  trialEnd: timestamp('trial_end'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Subscription plans table
export const subscriptionPlans = pgTable('subscription_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('INR'),
  interval: text('interval', { enum: ['monthly', 'quarterly', 'yearly'] }).notNull(),
  intervalCount: integer('interval_count').notNull().default(1),
  trialPeriodDays: integer('trial_period_days').default(0),
  features: jsonb('features'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Refunds table
export const refunds = pgTable('refunds', {
  id: uuid('id').primaryKey().defaultRandom(),
  paymentId: uuid('payment_id').notNull().references(() => payments.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('INR'),
  reason: text('reason', { enum: ['requested_by_customer', 'duplicate', 'fraudulent', 'subscription_cancellation'] }).notNull(),
  notes: text('notes'),
  status: text('status', { enum: ['pending', 'processing', 'succeeded', 'failed', 'cancelled'] }).notNull().default('pending'),
  providerRefundId: text('provider_refund_id'),
  refundData: jsonb('refund_data'),
  processedAt: timestamp('processed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Payment webhooks table
export const paymentWebhooks = pgTable('payment_webhooks', {
  id: uuid('id').primaryKey().defaultRandom(),
  provider: text('provider', { enum: ['razorpay', 'cashfree'] }).notNull(),
  eventType: text('event_type').notNull(),
  eventId: text('event_id').notNull(),
  payload: jsonb('payload').notNull(),
  status: text('status', { enum: ['pending', 'processed', 'failed'] }).notNull().default('pending'),
  processedAt: timestamp('processed_at'),
  errorMessage: text('error_message'),
  retryCount: integer('retry_count').default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// === PHASE 7: CERTIFICATE GENERATION ===

// Certificates table (enhanced)
export const certificates = pgTable('certificates', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  templateId: uuid('template_id').references(() => certificateTemplates.id),
  certificateId: text('certificate_id').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  issuedAt: timestamp('issued_at').notNull().defaultNow(),
  completionDate: timestamp('completion_date').notNull(),
  expiryDate: timestamp('expiry_date'),
  attendancePercentage: integer('attendance_percentage'),
  grade: text('grade'),
  certificateUrl: text('certificate_url'),
  digitalSignatureId: uuid('digital_signature_id').references(() => digitalSignatures.id),
  verificationCode: text('verification_code').notNull().unique(),
  blockchainHash: text('blockchain_hash'),
  metadata: jsonb('metadata'),
  status: text('status', { enum: ['issued', 'revoked', 'expired'] }).notNull().default('issued'),
  revokedAt: timestamp('revoked_at'),
  revokedReason: text('revoked_reason'),
  downloadCount: integer('download_count').default(0),
  sharedCount: integer('shared_count').default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Certificate templates table
export const certificateTemplates = pgTable('certificate_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  templateData: jsonb('template_data').notNull(), // Contains design, layout, fonts, etc.
  previewImage: text('preview_image'),
  orientation: text('orientation', { enum: ['portrait', 'landscape'] }).notNull().default('landscape'),
  paperSize: text('paper_size', { enum: ['A4', 'A3', 'Letter'] }).notNull().default('A4'),
  backgroundColor: text('background_color').default('#ffffff'),
  backgroundImage: text('background_image'),
  variables: jsonb('variables'), // Available template variables
  isDefault: boolean('is_default').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Digital signatures table
export const digitalSignatures = pgTable('digital_signatures', {
  id: uuid('id').primaryKey().defaultRandom(),
  signerId: uuid('signer_id').notNull().references(() => users.id),
  signatureType: text('signature_type', { enum: ['image', 'text', 'drawn'] }).notNull(),
  signatureData: text('signature_data').notNull(), // Base64 image or text
  publicKey: text('public_key'),
  privateKeyHash: text('private_key_hash'),
  algorithm: text('algorithm').default('RSA-SHA256'),
  isDefault: boolean('is_default').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Certificate verification logs table
export const certificateVerifications = pgTable('certificate_verifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  certificateId: uuid('certificate_id').notNull().references(() => certificates.id, { onDelete: 'cascade' }),
  verificationCode: text('verification_code').notNull(),
  verifierIp: text('verifier_ip'),
  verifierUserAgent: text('verifier_user_agent'),
  verifiedAt: timestamp('verified_at').notNull().defaultNow(),
  status: text('status', { enum: ['valid', 'invalid', 'expired', 'revoked'] }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// === PHASE 8: WHITE-LABELING ===

// Enhanced white label settings table
export const whiteLabelSettings = pgTable('white_label_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: text('tenant_id').notNull().unique(),
  organizationName: text('organization_name').notNull(),
  domain: text('domain').unique(),
  subdomain: text('subdomain').unique(),
  logo: text('logo'),
  logoLight: text('logo_light'),
  logoDark: text('logo_dark'),
  favicon: text('favicon'),
  primaryColor: text('primary_color').default('#3b82f6'),
  secondaryColor: text('secondary_color').default('#1e293b'),
  accentColor: text('accent_color').default('#06b6d4'),
  backgroundColor: text('background_color').default('#ffffff'),
  textColor: text('text_color').default('#1f2937'),
  customCss: text('custom_css'),
  customJs: text('custom_js'),
  headerHtml: text('header_html'),
  footerHtml: text('footer_html'),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  seoKeywords: text('seo_keywords'),
  socialLinks: jsonb('social_links'),
  contactInfo: jsonb('contact_info'),
  currency: text('currency').notNull().default('INR'),
  timezone: text('timezone').notNull().default('Asia/Kolkata'),
  dateFormat: text('date_format').default('DD/MM/YYYY'),
  timeFormat: text('time_format').default('24h'),
  language: text('language').default('en'),
  taxRate: decimal('tax_rate', { precision: 5, scale: 2 }).default('0.00'),
  taxNumber: text('tax_number'),
  billingAddress: jsonb('billing_address'),
  paymentMethods: jsonb('payment_methods'), // Enabled payment gateways
  features: jsonb('features'), // Enabled platform features
  limits: jsonb('limits'), // Usage limits
  customDomainVerified: boolean('custom_domain_verified').default(false),
  sslEnabled: boolean('ssl_enabled').default(false),
  isActive: boolean('is_active').notNull().default(true),
  subscription: text('subscription', { enum: ['free', 'basic', 'premium', 'enterprise'] }).default('free'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Custom domains table
export const customDomains = pgTable('custom_domains', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: text('tenant_id').notNull().references(() => whiteLabelSettings.tenantId),
  domain: text('domain').notNull().unique(),
  subdomain: text('subdomain'),
  status: text('status', { enum: ['pending', 'verifying', 'verified', 'failed'] }).notNull().default('pending'),
  verificationMethod: text('verification_method', { enum: ['dns', 'file'] }).notNull().default('dns'),
  verificationToken: text('verification_token').notNull(),
  verificationRecord: text('verification_record'),
  sslStatus: text('ssl_status', { enum: ['pending', 'active', 'failed'] }).default('pending'),
  sslCertificate: text('ssl_certificate'),
  sslPrivateKey: text('ssl_private_key'),
  lastVerifiedAt: timestamp('last_verified_at'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Email templates table
export const emailTemplates = pgTable('email_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: text('tenant_id').references(() => whiteLabelSettings.tenantId),
  name: text('name').notNull(),
  subject: text('subject').notNull(),
  htmlContent: text('html_content').notNull(),
  textContent: text('text_content'),
  variables: jsonb('variables'), // Available template variables
  type: text('type', { enum: ['welcome', 'enrollment', 'completion', 'certificate', 'payment', 'reminder', 'custom'] }).notNull(),
  isDefault: boolean('is_default').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Landing page builder table
export const landingPages = pgTable('landing_pages', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: text('tenant_id').references(() => whiteLabelSettings.tenantId),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  content: jsonb('content').notNull(), // Page builder content
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  seoKeywords: text('seo_keywords'),
  featuredImage: text('featured_image'),
  isPublished: boolean('is_published').notNull().default(false),
  isHomepage: boolean('is_homepage').notNull().default(false),
  viewCount: integer('view_count').default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// === PHASE 9: ANALYTICS ===

// Analytics events table
export const analyticsEvents = pgTable('analytics_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: text('tenant_id').references(() => whiteLabelSettings.tenantId),
  userId: uuid('user_id').references(() => users.id),
  sessionId: text('session_id'),
  eventType: text('event_type').notNull(), // page_view, course_view, lesson_start, lesson_complete, etc.
  eventCategory: text('event_category').notNull(), // learning, payment, engagement, etc.
  eventAction: text('event_action').notNull(),
  eventLabel: text('event_label'),
  eventValue: integer('event_value'),
  properties: jsonb('properties'), // Additional event properties
  page: text('page'),
  referrer: text('referrer'),
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  country: text('country'),
  city: text('city'),
  deviceType: text('device_type'),
  browser: text('browser'),
  os: text('os'),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// User activity table
export const userActivity = pgTable('user_activity', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  activityType: text('activity_type').notNull(), // login, logout, course_enroll, lesson_view, etc.
  description: text('description'),
  metadata: jsonb('metadata'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Course analytics table
export const courseAnalytics = pgTable('course_analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  date: timestamp('date').notNull(),
  views: integer('views').default(0),
  enrollments: integer('enrollments').default(0),
  completions: integer('completions').default(0),
  revenue: decimal('revenue', { precision: 10, scale: 2 }).default('0.00'),
  avgRating: decimal('avg_rating', { precision: 3, scale: 2 }),
  totalRatings: integer('total_ratings').default(0),
  avgCompletionTime: integer('avg_completion_time'), // in minutes
  dropoffRate: decimal('dropoff_rate', { precision: 5, scale: 2 }),
  engagementScore: decimal('engagement_score', { precision: 5, scale: 2 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Revenue analytics table
export const revenueAnalytics = pgTable('revenue_analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: text('tenant_id').references(() => whiteLabelSettings.tenantId),
  date: timestamp('date').notNull(),
  period: text('period', { enum: ['daily', 'weekly', 'monthly', 'yearly'] }).notNull(),
  totalRevenue: decimal('total_revenue', { precision: 12, scale: 2 }).default('0.00'),
  courseRevenue: decimal('course_revenue', { precision: 12, scale: 2 }).default('0.00'),
  subscriptionRevenue: decimal('subscription_revenue', { precision: 12, scale: 2 }).default('0.00'),
  refundAmount: decimal('refund_amount', { precision: 12, scale: 2 }).default('0.00'),
  netRevenue: decimal('net_revenue', { precision: 12, scale: 2 }).default('0.00'),
  transactionCount: integer('transaction_count').default(0),
  averageOrderValue: decimal('average_order_value', { precision: 10, scale: 2 }).default('0.00'),
  conversionRate: decimal('conversion_rate', { precision: 5, scale: 2 }),
  currency: text('currency').default('INR'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Learning analytics table
export const learningAnalytics = pgTable('learning_analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  lessonId: uuid('lesson_id').references(() => lessons.id, { onDelete: 'cascade' }),
  date: timestamp('date').notNull(),
  timeSpent: integer('time_spent').default(0), // in seconds
  completionRate: decimal('completion_rate', { precision: 5, scale: 2 }),
  quizScore: integer('quiz_score'),
  assignmentScore: integer('assignment_score'),
  engagementLevel: text('engagement_level', { enum: ['low', 'medium', 'high'] }),
  strugglingTopics: jsonb('struggling_topics'),
  strengths: jsonb('strengths'),
  recommendations: jsonb('recommendations'),
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
  category: text('category', { enum: ['system', 'course', 'payment', 'certificate', 'live_class'] }).notNull().default('system'),
  isRead: boolean('is_read').notNull().default(false),
  actionUrl: text('action_url'),
  metadata: jsonb('metadata'),
  expiresAt: timestamp('expires_at'),
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
  paymentMethods: many(paymentMethods),
  subscriptions: many(subscriptions),
  refunds: many(refunds),
  certificates: many(certificates),
  digitalSignatures: many(digitalSignatures),
  notifications: many(notifications),
  userActivity: many(userActivity),
  learningAnalytics: many(learningAnalytics),
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
  courseAnalytics: many(courseAnalytics),
  learningAnalytics: many(learningAnalytics),
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
  learningAnalytics: many(learningAnalytics),
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

// Payment system relations
export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [payments.courseId],
    references: [courses.id],
  }),
  subscription: one(subscriptions, {
    fields: [payments.subscriptionId],
    references: [subscriptions.id],
  }),
  invoice: one(invoices, {
    fields: [payments.invoiceId],
    references: [invoices.id],
  }),
}))

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  plan: one(subscriptionPlans, {
    fields: [subscriptions.planId],
    references: [subscriptionPlans.id],
  }),
  payments: many(payments),
}))

// Certificate system relations
export const certificatesRelations = relations(certificates, ({ one }) => ({
  user: one(users, {
    fields: [certificates.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [certificates.courseId],
    references: [courses.id],
  }),
  template: one(certificateTemplates, {
    fields: [certificates.templateId],
    references: [certificateTemplates.id],
  }),
  digitalSignature: one(digitalSignatures, {
    fields: [certificates.digitalSignatureId],
    references: [digitalSignatures.id],
  }),
}))

// Analytics relations
export const analyticsEventsRelations = relations(analyticsEvents, ({ one }) => ({
  user: one(users, {
    fields: [analyticsEvents.userId],
    references: [users.id],
  }),
}))

export const learningAnalyticsRelations = relations(learningAnalytics, ({ one }) => ({
  user: one(users, {
    fields: [learningAnalytics.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [learningAnalytics.courseId],
    references: [courses.id],
  }),
  lesson: one(lessons, {
    fields: [learningAnalytics.lessonId],
    references: [lessons.id],
  }),
}))

export const courseAnalyticsRelations = relations(courseAnalytics, ({ one }) => ({
  course: one(courses, {
    fields: [courseAnalytics.courseId],
    references: [courses.id],
  }),
})) 