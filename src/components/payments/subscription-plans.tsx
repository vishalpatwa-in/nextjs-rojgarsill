'use client'

import { useState, useTransition } from 'react'
import { Check, Star, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createSubscription } from '@/lib/actions/payments'
import { toast } from 'sonner'

interface SubscriptionPlansProps {
  plans: any[]
  userId: string
}

export function SubscriptionPlans({ plans, userId }: SubscriptionPlansProps) {
  const [isPending, startTransition] = useTransition()
  const [selectedPlan, setSelectedPlan] = useState<string>('')

  const handleSubscribe = async (planId: string) => {
    setSelectedPlan(planId)
    
    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append('userId', userId)
        formData.append('planId', planId)
        formData.append('paymentMethod', 'razorpay') // Default to Razorpay

        const result = await createSubscription(formData)

        if (result.success) {
          toast.success('Subscription created successfully!')
        } else {
          toast.error(result.error || 'Failed to create subscription')
        }
      } catch (error) {
        toast.error('Failed to create subscription')
      } finally {
        setSelectedPlan('')
      }
    })
  }

  const getPlanIcon = (planName: string) => {
    if (planName.toLowerCase().includes('premium') || planName.toLowerCase().includes('pro')) {
      return <Star className="h-5 w-5" />
    }
    if (planName.toLowerCase().includes('enterprise') || planName.toLowerCase().includes('business')) {
      return <Zap className="h-5 w-5" />
    }
    return <Check className="h-5 w-5" />
  }

  const getPlanColor = (planName: string) => {
    if (planName.toLowerCase().includes('premium') || planName.toLowerCase().includes('pro')) {
      return 'bg-gradient-to-br from-purple-500 to-pink-600'
    }
    if (planName.toLowerCase().includes('enterprise') || planName.toLowerCase().includes('business')) {
      return 'bg-gradient-to-br from-blue-600 to-purple-600'
    }
    return 'bg-gradient-to-br from-blue-500 to-cyan-600'
  }

  const formatInterval = (interval: string, intervalCount: number) => {
    const unit = interval === 'monthly' ? 'month' : interval === 'yearly' ? 'year' : 'quarter'
    return intervalCount === 1 ? `per ${unit}` : `per ${intervalCount} ${unit}s`
  }

  const getFeatures = (features: any) => {
    if (!features) return []
    return Array.isArray(features) ? features : Object.values(features)
  }

  if (plans.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No subscription plans available at the moment.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
      {plans.map((plan) => {
        const features = getFeatures(plan.features)
        const isPopular = plan.name.toLowerCase().includes('premium') || plan.name.toLowerCase().includes('pro')
        
        return (
          <Card key={plan.id} className={`relative ${isPopular ? 'ring-2 ring-purple-500' : ''}`}>
            {isPopular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-purple-500 text-white">Most Popular</Badge>
              </div>
            )}
            
            <CardHeader className="text-center">
              <div className={`w-12 h-12 rounded-full ${getPlanColor(plan.name)} text-white flex items-center justify-center mx-auto mb-4`}>
                {getPlanIcon(plan.name)}
              </div>
              
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              
              <CardDescription className="text-sm">
                {plan.description || 'Perfect for getting started with premium features'}
              </CardDescription>
              
              <div className="mt-4">
                <div className="flex items-baseline justify-center">
                  <span className="text-3xl font-bold">₹{parseFloat(plan.price).toFixed(0)}</span>
                  <span className="text-sm text-muted-foreground ml-1">
                    /{formatInterval(plan.interval, plan.intervalCount)}
                  </span>
                </div>
                
                {plan.trialPeriodDays > 0 && (
                  <p className="text-sm text-green-600 mt-2">
                    {plan.trialPeriodDays} days free trial
                  </p>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {features.length > 0 && (
                <div className="space-y-2">
                  {features.slice(0, 5).map((feature: string, index: number) => (
                    <div key={index} className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                  
                  {features.length > 5 && (
                    <p className="text-sm text-muted-foreground pl-7">
                      + {features.length - 5} more features
                    </p>
                  )}
                </div>
              )}
              
              {features.length === 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Access to all courses</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Live class recordings</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Certificate of completion</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">24/7 support</span>
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter>
              <Button
                className="w-full"
                size="lg"
                onClick={() => handleSubscribe(plan.id)}
                disabled={isPending && selectedPlan === plan.id}
                variant={isPopular ? "default" : "outline"}
              >
                {isPending && selectedPlan === plan.id ? (
                  'Creating Subscription...'
                ) : plan.trialPeriodDays > 0 ? (
                  'Start Free Trial'
                ) : (
                  'Subscribe Now'
                )}
              </Button>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
} 