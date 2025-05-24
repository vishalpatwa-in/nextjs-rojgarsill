'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { 
  whiteLabelSettings, 
  customDomains,
  emailTemplates,
  landingPages
} from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import crypto from 'crypto'

// Validation schemas
const whiteLabelSettingsSchema = z.object({
  tenantId: z.string().min(1),
  organizationName: z.string().min(1).max(255),
  domain: z.string().optional(),
  subdomain: z.string().optional(),
  logo: z.string().url().optional().or(z.literal("")),
  logoLight: z.string().url().optional().or(z.literal("")),
  logoDark: z.string().url().optional().or(z.literal("")),
  favicon: z.string().url().optional().or(z.literal("")),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).default('#3b82f6'),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).default('#1e293b'),
  accentColor: z.string().regex(/^#[0-9A-F]{6}$/i).default('#06b6d4'),
  backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i).default('#ffffff'),
  textColor: z.string().regex(/^#[0-9A-F]{6}$/i).default('#1f2937'),
  customCss: z.string().optional(),
  customJs: z.string().optional(),
  headerHtml: z.string().optional(),
  footerHtml: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  socialLinks: z.record(z.string()).optional(),
  contactInfo: z.record(z.string()).optional(),
  currency: z.string().default('INR'),
  timezone: z.string().default('Asia/Kolkata'),
  dateFormat: z.string().default('DD/MM/YYYY'),
  timeFormat: z.enum(['12h', '24h']).default('24h'),
  language: z.string().default('en'),
  taxRate: z.string().default('0.00'),
  taxNumber: z.string().optional(),
  billingAddress: z.record(z.string()).optional(),
  paymentMethods: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  limits: z.record(z.number()).optional(),
})

const customDomainSchema = z.object({
  tenantId: z.string().min(1),
  domain: z.string().min(1),
  subdomain: z.string().optional(),
  verificationMethod: z.enum(['dns', 'file']).default('dns'),
})

const emailTemplateSchema = z.object({
  tenantId: z.string().optional(),
  name: z.string().min(1),
  subject: z.string().min(1),
  htmlContent: z.string().min(1),
  textContent: z.string().optional(),
  variables: z.array(z.string()).optional(),
  type: z.enum(['welcome', 'enrollment', 'completion', 'certificate', 'payment', 'reminder', 'custom']),
})

const landingPageSchema = z.object({
  tenantId: z.string().optional(),
  name: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  content: z.record(z.any()),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  featuredImage: z.string().url().optional().or(z.literal("")),
  isHomepage: z.boolean().default(false),
})

// Helper functions
function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

function generateTenantId(): string {
  return crypto.randomBytes(16).toString('hex')
}

// White Label Settings Actions
export async function createWhiteLabelSettings(formData: FormData) {
  try {
    const data = whiteLabelSettingsSchema.parse({
      tenantId: formData.get('tenantId') || generateTenantId(),
      organizationName: formData.get('organizationName'),
      domain: formData.get('domain') || undefined,
      subdomain: formData.get('subdomain') || undefined,
      logo: formData.get('logo') || undefined,
      logoLight: formData.get('logoLight') || undefined,
      logoDark: formData.get('logoDark') || undefined,
      favicon: formData.get('favicon') || undefined,
      primaryColor: formData.get('primaryColor') || '#3b82f6',
      secondaryColor: formData.get('secondaryColor') || '#1e293b',
      accentColor: formData.get('accentColor') || '#06b6d4',
      backgroundColor: formData.get('backgroundColor') || '#ffffff',
      textColor: formData.get('textColor') || '#1f2937',
      customCss: formData.get('customCss') || undefined,
      customJs: formData.get('customJs') || undefined,
      headerHtml: formData.get('headerHtml') || undefined,
      footerHtml: formData.get('footerHtml') || undefined,
      seoTitle: formData.get('seoTitle') || undefined,
      seoDescription: formData.get('seoDescription') || undefined,
      seoKeywords: formData.get('seoKeywords') || undefined,
      socialLinks: formData.get('socialLinks') ? JSON.parse(formData.get('socialLinks') as string) : undefined,
      contactInfo: formData.get('contactInfo') ? JSON.parse(formData.get('contactInfo') as string) : undefined,
      currency: formData.get('currency') || 'INR',
      timezone: formData.get('timezone') || 'Asia/Kolkata',
      dateFormat: formData.get('dateFormat') || 'DD/MM/YYYY',
      timeFormat: (formData.get('timeFormat') as '12h' | '24h') || '24h',
      language: formData.get('language') || 'en',
      taxRate: formData.get('taxRate') ? String(formData.get('taxRate')) : '0.00',
      taxNumber: formData.get('taxNumber') || undefined,
      billingAddress: formData.get('billingAddress') ? JSON.parse(formData.get('billingAddress') as string) : undefined,
      paymentMethods: formData.get('paymentMethods') ? JSON.parse(formData.get('paymentMethods') as string) : undefined,
      features: formData.get('features') ? JSON.parse(formData.get('features') as string) : undefined,
      limits: formData.get('limits') ? JSON.parse(formData.get('limits') as string) : undefined,
    })

    const [settings] = await db
      .insert(whiteLabelSettings)
      .values({
        ...data,
        socialLinks: data.socialLinks ? JSON.stringify(data.socialLinks) : null,
        contactInfo: data.contactInfo ? JSON.stringify(data.contactInfo) : null,
        billingAddress: data.billingAddress ? JSON.stringify(data.billingAddress) : null,
        paymentMethods: data.paymentMethods ? JSON.stringify(data.paymentMethods) : null,
        features: data.features ? JSON.stringify(data.features) : null,
        limits: data.limits ? JSON.stringify(data.limits) : null,
      })
      .returning()

    revalidatePath('/admin/white-label')
    return { success: true, data: settings }
  } catch (error) {
    console.error('Create white label settings error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create white label settings',
    }
  }
}

export async function updateWhiteLabelSettings(tenantId: string, formData: FormData) {
  try {
    const data = whiteLabelSettingsSchema.parse({
      tenantId,
      organizationName: formData.get('organizationName'),
      domain: formData.get('domain') || undefined,
      subdomain: formData.get('subdomain') || undefined,
      logo: formData.get('logo') || undefined,
      logoLight: formData.get('logoLight') || undefined,
      logoDark: formData.get('logoDark') || undefined,
      favicon: formData.get('favicon') || undefined,
      primaryColor: formData.get('primaryColor') || '#3b82f6',
      secondaryColor: formData.get('secondaryColor') || '#1e293b',
      accentColor: formData.get('accentColor') || '#06b6d4',
      backgroundColor: formData.get('backgroundColor') || '#ffffff',
      textColor: formData.get('textColor') || '#1f2937',
      customCss: formData.get('customCss') || undefined,
      customJs: formData.get('customJs') || undefined,
      headerHtml: formData.get('headerHtml') || undefined,
      footerHtml: formData.get('footerHtml') || undefined,
      seoTitle: formData.get('seoTitle') || undefined,
      seoDescription: formData.get('seoDescription') || undefined,
      seoKeywords: formData.get('seoKeywords') || undefined,
      socialLinks: formData.get('socialLinks') ? JSON.parse(formData.get('socialLinks') as string) : undefined,
      contactInfo: formData.get('contactInfo') ? JSON.parse(formData.get('contactInfo') as string) : undefined,
      currency: formData.get('currency') || 'INR',
      timezone: formData.get('timezone') || 'Asia/Kolkata',
      dateFormat: formData.get('dateFormat') || 'DD/MM/YYYY',
      timeFormat: (formData.get('timeFormat') as '12h' | '24h') || '24h',
      language: formData.get('language') || 'en',
      taxRate: formData.get('taxRate') ? String(formData.get('taxRate')) : '0.00',
      taxNumber: formData.get('taxNumber') || undefined,
      billingAddress: formData.get('billingAddress') ? JSON.parse(formData.get('billingAddress') as string) : undefined,
      paymentMethods: formData.get('paymentMethods') ? JSON.parse(formData.get('paymentMethods') as string) : undefined,
      features: formData.get('features') ? JSON.parse(formData.get('features') as string) : undefined,
      limits: formData.get('limits') ? JSON.parse(formData.get('limits') as string) : undefined,
    })

    const [settings] = await db
      .update(whiteLabelSettings)
      .set({
        ...data,
        socialLinks: data.socialLinks ? JSON.stringify(data.socialLinks) : null,
        contactInfo: data.contactInfo ? JSON.stringify(data.contactInfo) : null,
        billingAddress: data.billingAddress ? JSON.stringify(data.billingAddress) : null,
        paymentMethods: data.paymentMethods ? JSON.stringify(data.paymentMethods) : null,
        features: data.features ? JSON.stringify(data.features) : null,
        limits: data.limits ? JSON.stringify(data.limits) : null,
        updatedAt: new Date(),
      })
      .where(eq(whiteLabelSettings.tenantId, tenantId))
      .returning()

    revalidatePath('/admin/white-label')
    return { success: true, data: settings }
  } catch (error) {
    console.error('Update white label settings error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update white label settings',
    }
  }
}

export async function getWhiteLabelSettings(tenantId: string) {
  try {
    const [settings] = await db
      .select()
      .from(whiteLabelSettings)
      .where(eq(whiteLabelSettings.tenantId, tenantId))

    return { success: true, data: settings }
  } catch (error) {
    console.error('Get white label settings error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get white label settings',
    }
  }
}

// Custom Domain Actions
export async function addCustomDomain(formData: FormData) {
  try {
    const data = customDomainSchema.parse({
      tenantId: formData.get('tenantId'),
      domain: formData.get('domain'),
      subdomain: formData.get('subdomain') || undefined,
      verificationMethod: (formData.get('verificationMethod') as 'dns' | 'file') || 'dns',
    })

    const verificationToken = generateVerificationToken()

    const [domain] = await db
      .insert(customDomains)
      .values({
        ...data,
        status: 'pending',
        verificationToken,
        verificationRecord: data.verificationMethod === 'dns' 
          ? `TXT _verification.${data.domain} ${verificationToken}`
          : `${data.domain}/.well-known/verification.txt`,
      })
      .returning()

    revalidatePath('/admin/domains')
    return { success: true, data: domain }
  } catch (error) {
    console.error('Add custom domain error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add custom domain',
    }
  }
}

export async function verifyCustomDomain(domainId: string) {
  try {
    // In a real implementation, you would verify the DNS record or file
    // For now, we'll simulate successful verification
    const [domain] = await db
      .update(customDomains)
      .set({
        status: 'verified',
        lastVerifiedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(customDomains.id, domainId))
      .returning()

    revalidatePath('/admin/domains')
    return { success: true, data: domain }
  } catch (error) {
    console.error('Verify custom domain error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify custom domain',
    }
  }
}

export async function deleteCustomDomain(domainId: string) {
  try {
    await db
      .delete(customDomains)
      .where(eq(customDomains.id, domainId))

    revalidatePath('/admin/domains')
    return { success: true }
  } catch (error) {
    console.error('Delete custom domain error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete custom domain',
    }
  }
}

export async function getCustomDomains(tenantId: string) {
  try {
    const domains = await db
      .select()
      .from(customDomains)
      .where(eq(customDomains.tenantId, tenantId))
      .orderBy(desc(customDomains.createdAt))

    return { success: true, data: domains }
  } catch (error) {
    console.error('Get custom domains error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get custom domains',
    }
  }
}

// Email Template Actions
export async function createEmailTemplate(formData: FormData) {
  try {
    const data = emailTemplateSchema.parse({
      tenantId: formData.get('tenantId') || undefined,
      name: formData.get('name'),
      subject: formData.get('subject'),
      htmlContent: formData.get('htmlContent'),
      textContent: formData.get('textContent') || undefined,
      variables: formData.get('variables') ? JSON.parse(formData.get('variables') as string) : undefined,
      type: formData.get('type') as 'welcome' | 'enrollment' | 'completion' | 'certificate' | 'payment' | 'reminder' | 'custom',
    })

    const [template] = await db
      .insert(emailTemplates)
      .values({
        ...data,
        variables: data.variables ? JSON.stringify(data.variables) : null,
        isDefault: false,
        isActive: true,
      })
      .returning()

    revalidatePath('/admin/email-templates')
    return { success: true, data: template }
  } catch (error) {
    console.error('Create email template error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create email template',
    }
  }
}

export async function updateEmailTemplate(templateId: string, formData: FormData) {
  try {
    const data = emailTemplateSchema.parse({
      tenantId: formData.get('tenantId') || undefined,
      name: formData.get('name'),
      subject: formData.get('subject'),
      htmlContent: formData.get('htmlContent'),
      textContent: formData.get('textContent') || undefined,
      variables: formData.get('variables') ? JSON.parse(formData.get('variables') as string) : undefined,
      type: formData.get('type') as 'welcome' | 'enrollment' | 'completion' | 'certificate' | 'payment' | 'reminder' | 'custom',
    })

    const [template] = await db
      .update(emailTemplates)
      .set({
        ...data,
        variables: data.variables ? JSON.stringify(data.variables) : null,
        updatedAt: new Date(),
      })
      .where(eq(emailTemplates.id, templateId))
      .returning()

    revalidatePath('/admin/email-templates')
    return { success: true, data: template }
  } catch (error) {
    console.error('Update email template error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update email template',
    }
  }
}

export async function deleteEmailTemplate(templateId: string) {
  try {
    await db
      .delete(emailTemplates)
      .where(eq(emailTemplates.id, templateId))

    revalidatePath('/admin/email-templates')
    return { success: true }
  } catch (error) {
    console.error('Delete email template error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete email template',
    }
  }
}

export async function getEmailTemplates(tenantId?: string) {
  try {
    const templates = await db
      .select()
      .from(emailTemplates)
      .where(tenantId ? eq(emailTemplates.tenantId, tenantId) : eq(emailTemplates.isActive, true))
      .orderBy(emailTemplates.type, emailTemplates.name)

    return { success: true, data: templates }
  } catch (error) {
    console.error('Get email templates error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get email templates',
    }
  }
}

// Landing Page Actions
export async function createLandingPage(formData: FormData) {
  try {
    const data = landingPageSchema.parse({
      tenantId: formData.get('tenantId') || undefined,
      name: formData.get('name'),
      slug: formData.get('slug'),
      title: formData.get('title'),
      description: formData.get('description') || undefined,
      content: JSON.parse(formData.get('content') as string),
      seoTitle: formData.get('seoTitle') || undefined,
      seoDescription: formData.get('seoDescription') || undefined,
      seoKeywords: formData.get('seoKeywords') || undefined,
      featuredImage: formData.get('featuredImage') || undefined,
      isHomepage: formData.get('isHomepage') === 'true',
    })

    // If this is set as homepage, unset others
    if (data.isHomepage && data.tenantId) {
      await db
        .update(landingPages)
        .set({ isHomepage: false })
        .where(and(
          eq(landingPages.tenantId, data.tenantId),
          eq(landingPages.isHomepage, true)
        ))
    }

    const [page] = await db
      .insert(landingPages)
      .values({
        ...data,
        content: JSON.stringify(data.content),
        isPublished: false,
        viewCount: 0,
      })
      .returning()

    revalidatePath('/admin/landing-pages')
    return { success: true, data: page }
  } catch (error) {
    console.error('Create landing page error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create landing page',
    }
  }
}

export async function updateLandingPage(pageId: string, formData: FormData) {
  try {
    const data = landingPageSchema.parse({
      tenantId: formData.get('tenantId') || undefined,
      name: formData.get('name'),
      slug: formData.get('slug'),
      title: formData.get('title'),
      description: formData.get('description') || undefined,
      content: JSON.parse(formData.get('content') as string),
      seoTitle: formData.get('seoTitle') || undefined,
      seoDescription: formData.get('seoDescription') || undefined,
      seoKeywords: formData.get('seoKeywords') || undefined,
      featuredImage: formData.get('featuredImage') || undefined,
      isHomepage: formData.get('isHomepage') === 'true',
    })

    // If this is set as homepage, unset others
    if (data.isHomepage && data.tenantId) {
      await db
        .update(landingPages)
        .set({ isHomepage: false })
        .where(and(
          eq(landingPages.tenantId, data.tenantId),
          eq(landingPages.isHomepage, true)
        ))
    }

    const [page] = await db
      .update(landingPages)
      .set({
        ...data,
        content: JSON.stringify(data.content),
        updatedAt: new Date(),
      })
      .where(eq(landingPages.id, pageId))
      .returning()

    revalidatePath('/admin/landing-pages')
    return { success: true, data: page }
  } catch (error) {
    console.error('Update landing page error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update landing page',
    }
  }
}

export async function deleteLandingPage(pageId: string) {
  try {
    await db
      .delete(landingPages)
      .where(eq(landingPages.id, pageId))

    revalidatePath('/admin/landing-pages')
    return { success: true }
  } catch (error) {
    console.error('Delete landing page error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete landing page',
    }
  }
}

export async function publishLandingPage(pageId: string) {
  try {
    const [page] = await db
      .update(landingPages)
      .set({
        isPublished: true,
        updatedAt: new Date(),
      })
      .where(eq(landingPages.id, pageId))
      .returning()

    revalidatePath('/admin/landing-pages')
    return { success: true, data: page }
  } catch (error) {
    console.error('Publish landing page error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to publish landing page',
    }
  }
}

export async function getLandingPages(tenantId?: string) {
  try {
    const pages = await db
      .select()
      .from(landingPages)
      .where(tenantId ? eq(landingPages.tenantId, tenantId) : undefined)
      .orderBy(desc(landingPages.createdAt))

    return { success: true, data: pages }
  } catch (error) {
    console.error('Get landing pages error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get landing pages',
    }
  }
} 