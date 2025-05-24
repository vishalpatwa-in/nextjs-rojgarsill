'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { 
  certificates, 
  certificateTemplates,
  digitalSignatures,
  certificateVerifications,
  courses,
  users,
  enrollments
} from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import crypto from 'crypto'
import jsPDF from 'jspdf'

// Validation schemas
const createCertificateSchema = z.object({
  userId: z.string().uuid(),
  courseId: z.string().uuid(),
  templateId: z.string().uuid().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  grade: z.string().optional(),
  attendancePercentage: z.number().min(0).max(100).optional(),
})

const createTemplateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  orientation: z.enum(['portrait', 'landscape']),
  paperSize: z.enum(['A4', 'A3', 'Letter']),
  backgroundColor: z.string().default('#ffffff'),
  backgroundImage: z.string().optional(),
  templateData: z.object({
    layout: z.object({
      title: z.object({
        text: z.string(),
        fontSize: z.number(),
        fontFamily: z.string(),
        color: z.string(),
        x: z.number(),
        y: z.number(),
      }),
      subtitle: z.object({
        text: z.string(),
        fontSize: z.number(),
        fontFamily: z.string(),
        color: z.string(),
        x: z.number(),
        y: z.number(),
      }).optional(),
      studentName: z.object({
        fontSize: z.number(),
        fontFamily: z.string(),
        color: z.string(),
        x: z.number(),
        y: z.number(),
      }),
      courseName: z.object({
        fontSize: z.number(),
        fontFamily: z.string(),
        color: z.string(),
        x: z.number(),
        y: z.number(),
      }),
      completionDate: z.object({
        fontSize: z.number(),
        fontFamily: z.string(),
        color: z.string(),
        x: z.number(),
        y: z.number(),
      }),
      certificateId: z.object({
        fontSize: z.number(),
        fontFamily: z.string(),
        color: z.string(),
        x: z.number(),
        y: z.number(),
      }),
      signature: z.object({
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number(),
      }).optional(),
    }),
  }),
  variables: z.array(z.string()).optional(),
  createdBy: z.string().uuid(),
})

const createDigitalSignatureSchema = z.object({
  signerId: z.string().uuid(),
  signatureType: z.enum(['image', 'text', 'drawn']),
  signatureData: z.string(),
})

// Helper functions
function generateCertificateId(): string {
  const timestamp = Date.now().toString(36)
  const randomBytes = crypto.randomBytes(4).toString('hex')
  return `CERT-${timestamp}-${randomBytes}`.toUpperCase()
}

function generateVerificationCode(): string {
  return crypto.randomBytes(16).toString('hex').toUpperCase()
}

async function generateCertificatePDF(certificateData: any, template: any, user: any, course: any): Promise<Buffer> {
  const pdf = new jsPDF({
    orientation: template.orientation === 'landscape' ? 'landscape' : 'portrait',
    unit: 'mm',
    format: template.paperSize.toLowerCase(),
  })

  // Set background color
  if (template.backgroundColor && template.backgroundColor !== '#ffffff') {
    pdf.setFillColor(template.backgroundColor)
    pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight(), 'F')
  }

  // Add background image if exists
  if (template.backgroundImage) {
    try {
      pdf.addImage(
        template.backgroundImage, 
        'JPEG', 
        0, 
        0, 
        pdf.internal.pageSize.getWidth(), 
        pdf.internal.pageSize.getHeight()
      )
    } catch (error) {
      console.warn('Failed to add background image:', error)
    }
  }

  const layout = template.templateData.layout

  // Add title
  pdf.setFontSize(layout.title.fontSize)
  pdf.setTextColor(layout.title.color)
  pdf.setFont(layout.title.fontFamily, 'bold')
  pdf.text(layout.title.text, layout.title.x, layout.title.y, { align: 'center' })

  // Add subtitle if exists
  if (layout.subtitle) {
    pdf.setFontSize(layout.subtitle.fontSize)
    pdf.setTextColor(layout.subtitle.color)
    pdf.setFont(layout.subtitle.fontFamily, 'normal')
    pdf.text(layout.subtitle.text, layout.subtitle.x, layout.subtitle.y, { align: 'center' })
  }

  // Add student name
  pdf.setFontSize(layout.studentName.fontSize)
  pdf.setTextColor(layout.studentName.color)
  pdf.setFont(layout.studentName.fontFamily, 'bold')
  pdf.text(user.name, layout.studentName.x, layout.studentName.y, { align: 'center' })

  // Add course name
  pdf.setFontSize(layout.courseName.fontSize)
  pdf.setTextColor(layout.courseName.color)
  pdf.setFont(layout.courseName.fontFamily, 'normal')
  pdf.text(course.title, layout.courseName.x, layout.courseName.y, { align: 'center' })

  // Add completion date
  pdf.setFontSize(layout.completionDate.fontSize)
  pdf.setTextColor(layout.completionDate.color)
  pdf.setFont(layout.completionDate.fontFamily, 'normal')
  pdf.text(
    new Date(certificateData.completionDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    layout.completionDate.x,
    layout.completionDate.y,
    { align: 'center' }
  )

  // Add certificate ID
  pdf.setFontSize(layout.certificateId.fontSize)
  pdf.setTextColor(layout.certificateId.color)
  pdf.setFont(layout.certificateId.fontFamily, 'normal')
  pdf.text(
    `Certificate ID: ${certificateData.certificateId}`,
    layout.certificateId.x,
    layout.certificateId.y,
    { align: 'center' }
  )

  // Add digital signature if exists
  if (layout.signature && certificateData.digitalSignature) {
    try {
      pdf.addImage(
        certificateData.digitalSignature.signatureData,
        'PNG',
        layout.signature.x,
        layout.signature.y,
        layout.signature.width,
        layout.signature.height
      )
    } catch (error) {
      console.warn('Failed to add digital signature:', error)
    }
  }

  // Add verification URL
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/certificates/verify/${certificateData.verificationCode}`
  pdf.setFontSize(8)
  pdf.setTextColor('#666666')
  pdf.text(
    `Verify at: ${verificationUrl}`,
    pdf.internal.pageSize.getWidth() / 2,
    pdf.internal.pageSize.getHeight() - 10,
    { align: 'center' }
  )

  return Buffer.from(pdf.output('arraybuffer'))
}

// Server Actions
export async function createCertificate(formData: FormData) {
  try {
    const data = createCertificateSchema.parse({
      userId: formData.get('userId'),
      courseId: formData.get('courseId'),
      templateId: formData.get('templateId') || undefined,
      title: formData.get('title'),
      description: formData.get('description') || undefined,
      grade: formData.get('grade') || undefined,
      attendancePercentage: formData.get('attendancePercentage') ? Number(formData.get('attendancePercentage')) : undefined,
    })

    // Check if user has completed the course
    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(and(
        eq(enrollments.userId, data.userId),
        eq(enrollments.courseId, data.courseId),
        eq(enrollments.status, 'completed')
      ))

    if (!enrollment) {
      throw new Error('User has not completed this course')
    }

    // Check if certificate already exists
    const existingCertificate = await db
      .select()
      .from(certificates)
      .where(and(
        eq(certificates.userId, data.userId),
        eq(certificates.courseId, data.courseId),
        eq(certificates.status, 'issued')
      ))

    if (existingCertificate.length > 0) {
      throw new Error('Certificate already exists for this user and course')
    }

    // Get user and course data
    const [user] = await db.select().from(users).where(eq(users.id, data.userId))
    const [course] = await db.select().from(courses).where(eq(courses.id, data.courseId))

    if (!user || !course) {
      throw new Error('User or course not found')
    }

    // Get or create template
    let template
    if (data.templateId) {
      [template] = await db
        .select()
        .from(certificateTemplates)
        .where(eq(certificateTemplates.id, data.templateId))
    } else {
      // Use default template
      [template] = await db
        .select()
        .from(certificateTemplates)
        .where(eq(certificateTemplates.isDefault, true))
    }

    if (!template) {
      throw new Error('No certificate template found')
    }

    // Generate certificate data
    const certificateId = generateCertificateId()
    const verificationCode = generateVerificationCode()

    // Get digital signature if available
    const [digitalSignature] = await db
      .select()
      .from(digitalSignatures)
      .where(and(
        eq(digitalSignatures.signerId, course.instructorId),
        eq(digitalSignatures.isDefault, true),
        eq(digitalSignatures.isActive, true)
      ))

    // Create certificate record
    const [certificate] = await db
      .insert(certificates)
      .values({
        userId: data.userId,
        courseId: data.courseId,
        templateId: template.id,
        certificateId,
        title: data.title,
        description: data.description,
        completionDate: enrollment.completedAt || new Date(),
        attendancePercentage: data.attendancePercentage,
        grade: data.grade,
        digitalSignatureId: digitalSignature?.id,
        verificationCode,
        status: 'issued',
      })
      .returning()

    // Generate PDF
    const pdfBuffer = await generateCertificatePDF(
      { ...certificate, digitalSignature },
      template,
      user,
      course
    )

    // Save PDF to storage (implement your storage logic here)
    const certificateUrl = `/certificates/${certificate.id}.pdf`
    
    // Update certificate with URL
    await db
      .update(certificates)
      .set({ certificateUrl })
      .where(eq(certificates.id, certificate.id))

    // Update enrollment to mark certificate as issued
    await db
      .update(enrollments)
      .set({ certificateIssued: true })
      .where(eq(enrollments.id, enrollment.id))

    revalidatePath('/dashboard/certificates')
    return {
      success: true,
      data: { ...certificate, certificateUrl, pdfBuffer },
    }
  } catch (error) {
    console.error('Create certificate error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create certificate',
    }
  }
}

export async function createCertificateTemplate(formData: FormData) {
  try {
    const templateDataString = formData.get('templateData') as string
    const variablesString = formData.get('variables') as string

    const data = createTemplateSchema.parse({
      name: formData.get('name'),
      description: formData.get('description') || undefined,
      orientation: formData.get('orientation'),
      paperSize: formData.get('paperSize'),
      backgroundColor: formData.get('backgroundColor') || '#ffffff',
      backgroundImage: formData.get('backgroundImage') || undefined,
      templateData: JSON.parse(templateDataString),
      variables: variablesString ? JSON.parse(variablesString) : undefined,
      createdBy: formData.get('createdBy') as string,
    })

    const [template] = await db
      .insert(certificateTemplates)
      .values({
        name: data.name,
        description: data.description,
        templateData: JSON.stringify(data.templateData),
        orientation: data.orientation,
        paperSize: data.paperSize,
        backgroundColor: data.backgroundColor,
        backgroundImage: data.backgroundImage,
        variables: data.variables ? JSON.stringify(data.variables) : null,
        createdBy: data.createdBy,
        isDefault: false,
        isActive: true,
      })
      .returning()

    revalidatePath('/dashboard/certificates/templates')
    return { success: true, data: template }
  } catch (error) {
    console.error('Create template error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create template',
    }
  }
}

export async function createDigitalSignature(formData: FormData) {
  try {
    const data = createDigitalSignatureSchema.parse({
      signerId: formData.get('signerId'),
      signatureType: formData.get('signatureType'),
      signatureData: formData.get('signatureData'),
    })

    // Set all other signatures as non-default for this user
    await db
      .update(digitalSignatures)
      .set({ isDefault: false })
      .where(eq(digitalSignatures.signerId, data.signerId))

    const [signature] = await db
      .insert(digitalSignatures)
      .values({
        signerId: data.signerId,
        signatureType: data.signatureType,
        signatureData: data.signatureData,
        isDefault: true,
        isActive: true,
      })
      .returning()

    revalidatePath('/dashboard/certificates/signatures')
    return { success: true, data: signature }
  } catch (error) {
    console.error('Create signature error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create digital signature',
    }
  }
}

export async function verifyCertificate(verificationCode: string) {
  try {
    const [certificate] = await db
      .select({
        certificate: certificates,
        user: users,
        course: courses,
        template: certificateTemplates,
      })
      .from(certificates)
      .leftJoin(users, eq(certificates.userId, users.id))
      .leftJoin(courses, eq(certificates.courseId, courses.id))
      .leftJoin(certificateTemplates, eq(certificates.templateId, certificateTemplates.id))
      .where(eq(certificates.verificationCode, verificationCode))

    if (!certificate) {
      throw new Error('Certificate not found')
    }

    if (certificate.certificate.status !== 'issued') {
      throw new Error('Certificate is not valid')
    }

    // Log verification
    await db
      .insert(certificateVerifications)
      .values({
        certificateId: certificate.certificate.id,
        verificationCode,
        status: 'valid',
      })

    return {
      success: true,
      data: {
        certificate: certificate.certificate,
        user: certificate.user,
        course: certificate.course,
        template: certificate.template,
        isValid: true,
        verifiedAt: new Date(),
      },
    }
  } catch (error) {
    console.error('Verify certificate error:', error)
    
    // Log failed verification
    try {
      await db
        .insert(certificateVerifications)
        .values({
          certificateId: '',
          verificationCode,
          status: 'invalid',
        })
    } catch (logError) {
      console.error('Failed to log verification attempt:', logError)
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Certificate verification failed',
    }
  }
}

export async function getUserCertificates(userId: string) {
  try {
    const userCertificates = await db
      .select({
        certificate: certificates,
        course: courses,
        template: certificateTemplates,
      })
      .from(certificates)
      .leftJoin(courses, eq(certificates.courseId, courses.id))
      .leftJoin(certificateTemplates, eq(certificates.templateId, certificateTemplates.id))
      .where(and(
        eq(certificates.userId, userId),
        eq(certificates.status, 'issued')
      ))
      .orderBy(desc(certificates.issuedAt))

    return { success: true, data: userCertificates }
  } catch (error) {
    console.error('Get user certificates error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get certificates',
    }
  }
}

export async function getCertificateTemplates() {
  try {
    const templates = await db
      .select()
      .from(certificateTemplates)
      .where(eq(certificateTemplates.isActive, true))
      .orderBy(certificateTemplates.isDefault, certificateTemplates.name)

    return { success: true, data: templates }
  } catch (error) {
    console.error('Get templates error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get templates',
    }
  }
}

export async function getDigitalSignatures(signerId: string) {
  try {
    const signatures = await db
      .select()
      .from(digitalSignatures)
      .where(and(
        eq(digitalSignatures.signerId, signerId),
        eq(digitalSignatures.isActive, true)
      ))
      .orderBy(digitalSignatures.isDefault, digitalSignatures.createdAt)

    return { success: true, data: signatures }
  } catch (error) {
    console.error('Get signatures error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get digital signatures',
    }
  }
}

export async function revokeCertificate(certificateId: string, reason: string) {
  try {
    await db
      .update(certificates)
      .set({
        status: 'revoked',
        revokedAt: new Date(),
        revokedReason: reason,
      })
      .where(eq(certificates.id, certificateId))

    revalidatePath('/dashboard/certificates')
    return { success: true }
  } catch (error) {
    console.error('Revoke certificate error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to revoke certificate',
    }
  }
} 