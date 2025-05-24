'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CreditCard, Wallet, Building2, Smartphone, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createPayment, verifyPayment } from '@/lib/actions/payments'
import { toast } from 'sonner'

const paymentFormSchema = z.object({
  paymentMethod: z.enum(['razorpay', 'cashfree']),
  savePaymentMethod: z.boolean().optional(),
  billingName: z.string().min(2, 'Name must be at least 2 characters'),
  billingEmail: z.string().email('Invalid email address'),
  billingPhone: z.string().min(10, 'Phone number must be at least 10 digits'),
  billingAddress: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State must be at least 2 characters'),
  pincode: z.string().min(6, 'Pincode must be 6 digits'),
})

type PaymentFormData = z.infer<typeof paymentFormSchema>

interface PaymentFormProps {
  userId: string
  courseId?: string
  subscriptionId?: string
  amount: number
  currency?: string
  courseName?: string
  onSuccess?: (payment: any) => void
  onError?: (error: string) => void
}

declare global {
  interface Window {
    Razorpay: any
    Cashfree: any
  }
}

export function PaymentForm({
  userId,
  courseId,
  subscriptionId,
  amount,
  currency = 'INR',
  courseName,
  onSuccess,
  onError,
}: PaymentFormProps) {
  const [isPending, startTransition] = useTransition()
  const [paymentStep, setPaymentStep] = useState<'form' | 'processing' | 'success'>('form')
  const [paymentError, setPaymentError] = useState<string>('')

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      paymentMethod: 'razorpay',
      savePaymentMethod: false,
      billingName: '',
      billingEmail: '',
      billingPhone: '',
      billingAddress: '',
      city: '',
      state: '',
      pincode: '',
    },
  })

  const taxAmount = amount * 0.18 // 18% GST
  const totalAmount = amount + taxAmount

  const paymentMethods = [
    {
      value: 'razorpay',
      label: 'Razorpay',
      description: 'Pay with Credit/Debit Cards, UPI, Net Banking, Wallets',
      icon: CreditCard,
      features: ['Cards', 'UPI', 'Net Banking', 'Wallets'],
    },
    {
      value: 'cashfree',
      label: 'Cashfree',
      description: 'Secure payments with multiple options',
      icon: Wallet,
      features: ['Cards', 'UPI', 'Net Banking', 'EMI'],
    },
  ]

  const loadPaymentScript = (provider: string) => {
    return new Promise((resolve) => {
      if (provider === 'razorpay') {
        if (window.Razorpay) {
          resolve(true)
          return
        }
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.onload = () => resolve(true)
        script.onerror = () => resolve(false)
        document.body.appendChild(script)
      } else if (provider === 'cashfree') {
        if (window.Cashfree) {
          resolve(true)
          return
        }
        const script = document.createElement('script')
        script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js'
        script.onload = () => resolve(true)
        script.onerror = () => resolve(false)
        document.body.appendChild(script)
      }
    })
  }

  const processRazorpayPayment = async (orderData: any, formData: PaymentFormData) => {
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: orderData.order.amount,
      currency: orderData.order.currency,
      name: 'RojgarSkill',
      description: courseName || 'Course Payment',
      order_id: orderData.order.id,
      prefill: {
        name: formData.billingName,
        email: formData.billingEmail,
        contact: formData.billingPhone,
      },
      theme: {
        color: '#3b82f6',
      },
      handler: async (response: any) => {
        try {
          const verifyData = new FormData()
          verifyData.append('paymentId', response.razorpay_payment_id)
          verifyData.append('orderId', response.razorpay_order_id)
          verifyData.append('signature', response.razorpay_signature)
          verifyData.append('provider', 'razorpay')

          const result = await verifyPayment(verifyData)
          
          if (result.success) {
            setPaymentStep('success')
            toast.success('Payment completed successfully!')
            onSuccess?.(result.data)
          } else {
            throw new Error(result.error)
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Payment verification failed'
          setPaymentError(errorMessage)
          onError?.(errorMessage)
          toast.error(errorMessage)
        }
      },
      modal: {
        ondismiss: () => {
          setPaymentStep('form')
          toast.error('Payment cancelled')
        },
      },
    }

    const razorpay = new window.Razorpay(options)
    razorpay.open()
  }

  const processCashfreePayment = async (orderData: any, formData: PaymentFormData) => {
    const cashfree = window.Cashfree({
      mode: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
    })

    const checkoutOptions = {
      paymentSessionId: orderData.order.payment_session_id,
      redirectTarget: '_modal',
    }

    cashfree.checkout(checkoutOptions).then((result: any) => {
      if (result.error) {
        setPaymentError(result.error.message)
        onError?.(result.error.message)
        toast.error(result.error.message)
      }
      if (result.redirect) {
        // Payment is pending, will be confirmed via webhook
        toast.info('Payment is being processed...')
      }
      if (result.paymentDetails) {
        setPaymentStep('success')
        toast.success('Payment completed successfully!')
        onSuccess?.(result.paymentDetails)
      }
    })
  }

  const onSubmit = async (data: PaymentFormData) => {
    setPaymentError('')
    setPaymentStep('processing')

    startTransition(async () => {
      try {
        // Load payment script
        const scriptLoaded = await loadPaymentScript(data.paymentMethod)
        if (!scriptLoaded) {
          throw new Error('Failed to load payment gateway')
        }

        // Create payment order
        const formData = new FormData()
        formData.append('userId', userId)
        if (courseId) formData.append('courseId', courseId)
        if (subscriptionId) formData.append('subscriptionId', subscriptionId)
        formData.append('amount', amount.toString())
        formData.append('currency', currency)
        formData.append('paymentMethod', data.paymentMethod)
        formData.append('metadata', JSON.stringify({
          billingDetails: {
            name: data.billingName,
            email: data.billingEmail,
            phone: data.billingPhone,
            address: data.billingAddress,
            city: data.city,
            state: data.state,
            pincode: data.pincode,
          },
        }))

        const result = await createPayment(formData)

        if (!result.success) {
          throw new Error(result.error)
        }

        // Process payment with selected provider
        if (data.paymentMethod === 'razorpay') {
          await processRazorpayPayment(result.data, data)
        } else if (data.paymentMethod === 'cashfree') {
          await processCashfreePayment(result.data, data)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Payment failed'
        setPaymentError(errorMessage)
        setPaymentStep('form')
        onError?.(errorMessage)
        toast.error(errorMessage)
      }
    })
  }

  if (paymentStep === 'success') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">Payment Successful!</h3>
              <p className="text-sm text-muted-foreground">
                Your payment has been processed successfully.
              </p>
            </div>
            <div className="text-2xl font-bold">
              ₹{totalAmount.toFixed(2)}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {courseName && (
            <div className="flex justify-between">
              <span>Course: {courseName}</span>
              <span>₹{amount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>GST (18%)</span>
            <span>₹{taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg border-t pt-4">
            <span>Total Amount</span>
            <span>₹{totalAmount.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
          <CardDescription>
            Choose your preferred payment method and complete your purchase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Payment Method Selection */}
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-1 gap-4"
                      >
                        {paymentMethods.map((method) => (
                          <div key={method.value}>
                            <RadioGroupItem
                              value={method.value}
                              id={method.value}
                              className="peer sr-only"
                            />
                            <label
                              htmlFor={method.value}
                              className="flex items-center space-x-4 rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                            >
                              <method.icon className="h-6 w-6" />
                              <div className="flex-1">
                                <div className="font-medium">{method.label}</div>
                                <div className="text-sm text-muted-foreground">
                                  {method.description}
                                </div>
                                <div className="flex gap-2 mt-2">
                                  {method.features.map((feature) => (
                                    <Badge key={feature} variant="secondary" className="text-xs">
                                      {feature}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Billing Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Billing Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="billingName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="billingEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your email" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="billingPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="billingAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City *</FormLabel>
                        <FormControl>
                          <Input placeholder="City" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State *</FormLabel>
                        <FormControl>
                          <Input placeholder="State" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pincode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pincode *</FormLabel>
                        <FormControl>
                          <Input placeholder="Pincode" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {paymentError && (
                <Alert variant="destructive">
                  <AlertDescription>{paymentError}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isPending || paymentStep === 'processing'}
              >
                {paymentStep === 'processing' ? (
                  'Processing Payment...'
                ) : (
                  `Pay ₹${totalAmount.toFixed(2)}`
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
} 