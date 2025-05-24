import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { handleWebhook } from '@/lib/actions/payments'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const timestamp = request.headers.get('x-webhook-timestamp')
    const signature = request.headers.get('x-webhook-signature')

    if (!signature || !timestamp) {
      return NextResponse.json({ error: 'Missing signature or timestamp' }, { status: 400 })
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.CASHFREE_WEBHOOK_SECRET || '')
      .update(timestamp + '.' + body)
      .digest('base64')

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const payload = JSON.parse(body)
    
    // Process webhook
    const result = await handleWebhook('cashfree', payload)
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cashfree webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
} 