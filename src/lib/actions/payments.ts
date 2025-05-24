'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { 
  payments, 
  invoices, 
  subscriptions, 
  subscriptionPlans, 
  refunds, 
  paymentWebhooks,
  courses
} from '@/lib/db/schema'
import { eq, desc, sql } from 'drizzle-orm'
import Razorpay from 'razorpay'
import { Cashfree } from 'cashfree-pg'
import crypto from 'crypto'

// Types
interface PaymentProvider {
  createOrder(data: any): Promise<any>
  verifyPayment(data: any): Promise<boolean>
  createRefund(data: any): Promise<any>
}

// Initialize payment providers
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
})

const cashfree = new Cashfree({
  appId: process.env.CASHFREE_APP_ID || '',
  secretKey: process.env.CASHFREE_SECRET_KEY || '',
  env: process.env.NODE_ENV === 'production' ? 'PROD' : 'SANDBOX'
} as any)

// Validation schemas
const createPaymentSchema = z.object({
  userId: z.string().uuid(),
  courseId: z.string().uuid().optional(),
  subscriptionId: z.string().uuid().optional(),
  amount: z.number().positive(),
  currency: z.string().default('INR'),
  paymentMethod: z.enum(['razorpay', 'cashfree']),
  metadata: z.record(z.any()).optional(),
})

const verifyPaymentSchema = z.object({
  paymentId: z.string(),
  orderId: z.string(),
  signature: z.string(),
  provider: z.enum(['razorpay', 'cashfree']),
})

const createRefundSchema = z.object({
  paymentId: z.string().uuid(),
  amount: z.number().positive(),
  reason: z.enum(['requested_by_customer', 'duplicate', 'fraudulent', 'subscription_cancellation']),
  notes: z.string().optional(),
})

const subscriptionSchema = z.object({
  userId: z.string().uuid(),
  planId: z.string().uuid(),
  paymentMethod: z.enum(['razorpay', 'cashfree']),
})

// Payment Providers Implementation
class RazorpayProvider implements PaymentProvider {
  async createOrder(data: any) {
    const options = {
      amount: data.amount * 100, // Convert to paise
      currency: data.currency,
      receipt: `receipt_${Date.now()}`,
      notes: data.metadata || {},
    }
    
    return await razorpay.orders.create(options)
  }

  async verifyPayment(data: any): Promise<boolean> {
    const body = data.razorpay_order_id + '|' + data.razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body.toString())
      .digest('hex')
    
    return expectedSignature === data.razorpay_signature
  }

  async createRefund(data: any) {
    return await razorpay.payments.refund(data.paymentId, {
      amount: data.amount * 100,
      notes: { reason: data.reason },
    })
  }
}

class CashfreeProvider implements PaymentProvider {
  async createOrder(data: any) {
    const orderRequest = {
      order_amount: data.amount,
      order_currency: data.currency,
      order_id: `order_${Date.now()}`,
      customer_details: {
        customer_id: data.userId,
        customer_name: data.customerName || 'User',
        customer_email: data.customerEmail || 'user@example.com',
        customer_phone: data.customerPhone || '9999999999',
      },
      order_meta: {
        notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/cashfree`,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
      },
    }
    
    return await (cashfree as any).PGCreateOrder('2023-08-01', orderRequest)
  }

  async verifyPayment(data: any): Promise<boolean> {
    try {
      const response = await (cashfree as any).PGOrderFetchPayments('2023-08-01', data.orderId)
      return response.length > 0 && response[0].payment_status === 'SUCCESS'
    } catch (error) {
      console.error('Payment verification error:', error)
      return false
    }
  }

  async createRefund(data: any) {
    const refundRequest = {
      refund_amount: data.amount,
      refund_id: `refund_${Date.now()}`,
      refund_note: data.reason,
    }
    
    return await (cashfree as any).PGOrderCreateRefund('2023-08-01', data.orderId, refundRequest)
  }
}

// Helper functions
function getPaymentProvider(provider: string): PaymentProvider {
  switch (provider) {
    case 'razorpay':
      return new RazorpayProvider()
    case 'cashfree':
      return new CashfreeProvider()
    default:
      throw new Error(`Unsupported payment provider: ${provider}`)
  }
}

async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const month = String(new Date().getMonth() + 1).padStart(2, '0')
  
  const lastInvoice = await db
    .select({ invoiceNumber: invoices.invoiceNumber })
    .from(invoices)
    .where(sql`${invoices.invoiceNumber} LIKE ${`INV-${year}${month}-%`}`)
    .orderBy(desc(invoices.createdAt))
    .limit(1)
  
  let sequenceNumber = 1
  if (lastInvoice.length > 0) {
    const lastNumber = lastInvoice[0].invoiceNumber.split('-')[2]
    sequenceNumber = parseInt(lastNumber) + 1
  }
  
  return `INV-${year}${month}-${String(sequenceNumber).padStart(4, '0')}`
}

// Server Actions
export async function createPayment(formData: FormData) {
  try {
    const data = createPaymentSchema.parse({
      userId: formData.get('userId'),
      courseId: formData.get('courseId') || undefined,
      subscriptionId: formData.get('subscriptionId') || undefined,
      amount: Number(formData.get('amount')),
      currency: formData.get('currency') || 'INR',
      paymentMethod: formData.get('paymentMethod'),
      metadata: formData.get('metadata') ? JSON.parse(formData.get('metadata') as string) : undefined,
    })

    // Create invoice first
    const invoiceNumber = await generateInvoiceNumber()
    const taxRate = 0.18 // 18% GST
    const subtotal = data.amount
    const taxAmount = subtotal * taxRate
    const totalAmount = subtotal + taxAmount

    const [invoice] = await db
      .insert(invoices)
      .values({
        invoiceNumber,
        userId: data.userId,
        courseId: data.courseId,
        subscriptionId: data.subscriptionId,
        subtotal: subtotal.toString(),
        taxAmount: taxAmount.toString(),
        totalAmount: totalAmount.toString(),
        currency: data.currency,
        status: 'draft',
      })
      .returning()

    // Create payment order with provider
    const provider = getPaymentProvider(data.paymentMethod)
    const orderData = {
      ...data,
      amount: totalAmount,
      invoiceId: invoice.id,
    }
    
    const order = await provider.createOrder(orderData)
    
    // Create payment record
    const [payment] = await db
      .insert(payments)
      .values({
        userId: data.userId,
        courseId: data.courseId,
        subscriptionId: data.subscriptionId,
        amount: totalAmount.toString(),
        currency: data.currency,
        paymentMethod: data.paymentMethod,
        paymentId: order.id,
        orderId: order.id,
        status: 'pending',
        paymentData: JSON.stringify(order),
        transactionFee: '0.00',
        netAmount: totalAmount.toString(),
        invoiceId: invoice.id,
      })
      .returning()

    return {
      success: true,
      data: {
        payment,
        order,
        invoice,
      },
    }
  } catch (error) {
    console.error('Create payment error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create payment',
    }
  }
}

export async function verifyPayment(formData: FormData) {
  try {
    const data = verifyPaymentSchema.parse({
      paymentId: formData.get('paymentId'),
      orderId: formData.get('orderId'),
      signature: formData.get('signature'),
      provider: formData.get('provider'),
    })

    // Get payment record
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.orderId, data.orderId))

    if (!payment) {
      throw new Error('Payment not found')
    }

    // Verify payment with provider
    const provider = getPaymentProvider(data.provider)
    const isValid = await provider.verifyPayment(data)

    if (!isValid) {
      throw new Error('Payment verification failed')
    }

    // Update payment status
    await db
      .update(payments)
      .set({
        status: 'completed',
        paymentData: JSON.stringify(data),
        updatedAt: new Date(),
      })
      .where(eq(payments.id, payment.id))

    // Update invoice status
    if (payment.invoiceId) {
      await db
        .update(invoices)
        .set({
          status: 'paid',
          paidAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, payment.invoiceId))
    }

    revalidatePath('/dashboard')
    return { success: true, data: payment }
  } catch (error) {
    console.error('Verify payment error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment verification failed',
    }
  }
}

export async function createRefund(formData: FormData) {
  try {
    const data = createRefundSchema.parse({
      paymentId: formData.get('paymentId'),
      amount: Number(formData.get('amount')),
      reason: formData.get('reason'),
      notes: formData.get('notes') || undefined,
    })

    // Get payment record
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, data.paymentId))

    if (!payment) {
      throw new Error('Payment not found')
    }

    if (payment.status !== 'completed') {
      throw new Error('Cannot refund incomplete payment')
    }

    // Create refund with provider
    const provider = getPaymentProvider(payment.paymentMethod)
    const refundResponse = await provider.createRefund({
      paymentId: payment.paymentId,
      orderId: payment.orderId,
      amount: data.amount,
      reason: data.reason,
    })

    // Create refund record
    const [refund] = await db
      .insert(refunds)
      .values({
        paymentId: payment.id,
        userId: payment.userId,
        amount: data.amount.toString(),
        currency: payment.currency,
        reason: data.reason,
        notes: data.notes,
        status: 'pending',
        providerRefundId: refundResponse.id,
        refundData: JSON.stringify(refundResponse),
      })
      .returning()

    // Update payment refunded amount
    const currentRefunded = parseFloat(payment.refundedAmount || '0') || 0
    const newRefundedAmount = currentRefunded + data.amount
    
    await db
      .update(payments)
      .set({
        refundedAmount: newRefundedAmount.toString(),
        status: newRefundedAmount >= parseFloat(payment.amount) ? 'refunded' : 'partially_refunded',
        updatedAt: new Date(),
      })
      .where(eq(payments.id, payment.id))

    revalidatePath('/dashboard/payments')
    return { success: true, data: refund }
  } catch (error) {
    console.error('Create refund error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create refund',
    }
  }
}

export async function createSubscription(formData: FormData) {
  try {
    const data = subscriptionSchema.parse({
      userId: formData.get('userId'),
      planId: formData.get('planId'),
      paymentMethod: formData.get('paymentMethod'),
    })

    // Get subscription plan
    const [plan] = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, data.planId))

    if (!plan) {
      throw new Error('Subscription plan not found')
    }

    // Calculate period dates
    const now = new Date()
    const periodEnd = new Date(now)
    
    switch (plan.interval) {
      case 'monthly':
        periodEnd.setMonth(periodEnd.getMonth() + plan.intervalCount)
        break
      case 'quarterly':
        periodEnd.setMonth(periodEnd.getMonth() + (3 * plan.intervalCount))
        break
      case 'yearly':
        periodEnd.setFullYear(periodEnd.getFullYear() + plan.intervalCount)
        break
    }

    // Create subscription
    const [subscription] = await db
      .insert(subscriptions)
      .values({
        userId: data.userId,
        planId: data.planId,
        status: 'active',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        trialStart: (plan.trialPeriodDays || 0) > 0 ? now : null,
        trialEnd: (plan.trialPeriodDays || 0) > 0 ? new Date(now.getTime() + (plan.trialPeriodDays || 0) * 24 * 60 * 60 * 1000) : null,
      })
      .returning()

    // Create initial payment if not in trial
    if ((plan.trialPeriodDays || 0) === 0) {
      const paymentData = new FormData()
      paymentData.append('userId', data.userId)
      paymentData.append('subscriptionId', subscription.id)
      paymentData.append('amount', plan.price)
      paymentData.append('currency', plan.currency)
      paymentData.append('paymentMethod', data.paymentMethod)
      
      const paymentResult = await createPayment(paymentData)
      return { success: true, data: { subscription, payment: paymentResult.data } }
    }

    revalidatePath('/dashboard/subscriptions')
    return { success: true, data: subscription }
  } catch (error) {
    console.error('Create subscription error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create subscription',
    }
  }
}

export async function cancelSubscription(subscriptionId: string) {
  try {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, subscriptionId))

    if (!subscription) {
      throw new Error('Subscription not found')
    }

    await db
      .update(subscriptions)
      .set({
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelAtPeriodEnd: true,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, subscriptionId))

    revalidatePath('/dashboard/subscriptions')
    return { success: true }
  } catch (error) {
    console.error('Cancel subscription error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel subscription',
    }
  }
}

export async function handleWebhook(provider: string, payload: any) {
  try {
    // Log webhook
    const [webhook] = await db
      .insert(paymentWebhooks)
      .values({
        provider: provider as 'razorpay' | 'cashfree',
        eventType: payload.event,
        eventId: payload.event_id || payload.id,
        payload: JSON.stringify(payload),
        status: 'pending',
      })
      .returning()

    // Process webhook based on event type
    switch (payload.event) {
      case 'payment.captured':
      case 'payment.success':
        await processPaymentSuccess(payload)
        break
      case 'payment.failed':
        await processPaymentFailed(payload)
        break
      case 'refund.processed':
        await processRefundSuccess(payload)
        break
      default:
        console.log(`Unhandled webhook event: ${payload.event}`)
    }

    // Mark webhook as processed
    await db
      .update(paymentWebhooks)
      .set({
        status: 'processed',
        processedAt: new Date(),
      })
      .where(eq(paymentWebhooks.id, webhook.id))

    return { success: true }
  } catch (error) {
    console.error('Webhook processing error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Webhook processing failed',
    }
  }
}

async function processPaymentSuccess(payload: any) {
  const orderId = payload.order_id || payload.order.id
  
  await db
    .update(payments)
    .set({
      status: 'completed',
      paymentData: JSON.stringify(payload),
      updatedAt: new Date(),
    })
    .where(eq(payments.orderId, orderId))
}

async function processPaymentFailed(payload: any) {
  const orderId = payload.order_id || payload.order.id
  
  await db
    .update(payments)
    .set({
      status: 'failed',
      paymentData: JSON.stringify(payload),
      updatedAt: new Date(),
    })
    .where(eq(payments.orderId, orderId))
}

async function processRefundSuccess(payload: any) {
  const refundId = payload.refund_id || payload.id
  
  await db
    .update(refunds)
    .set({
      status: 'succeeded',
      processedAt: new Date(),
      refundData: JSON.stringify(payload),
      updatedAt: new Date(),
    })
    .where(eq(refunds.providerRefundId, refundId))
}

// Get payment history
export async function getPaymentHistory(userId: string) {
  try {
    const paymentHistory = await db
      .select({
        payment: payments,
        course: courses,
        invoice: invoices,
      })
      .from(payments)
      .leftJoin(courses, eq(payments.courseId, courses.id))
      .leftJoin(invoices, eq(payments.invoiceId, invoices.id))
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.createdAt))

    return { success: true, data: paymentHistory }
  } catch (error) {
    console.error('Get payment history error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get payment history',
    }
  }
}

// Get subscription plans
export async function getSubscriptionPlans() {
  try {
    const plans = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.isActive, true))
      .orderBy(subscriptionPlans.price)

    return { success: true, data: plans }
  } catch (error) {
    console.error('Get subscription plans error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get subscription plans',
    }
  }
} 