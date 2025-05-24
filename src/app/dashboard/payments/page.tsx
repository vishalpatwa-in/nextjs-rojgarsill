import { Suspense } from 'react'
import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getPaymentHistory, getSubscriptionPlans } from '@/lib/actions/payments'
import { PaymentHistory } from '@/components/payments/payment-history'
import { PaymentStats } from '@/components/payments/payment-stats'
import { SubscriptionPlans } from '@/components/payments/subscription-plans'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { CreditCard, Receipt, DollarSign, Repeat } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Payments - RojgarSkill',
  description: 'Manage your payments, invoices, and subscriptions',
}

export default async function PaymentsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const [paymentHistoryResult, subscriptionPlansResult] = await Promise.all([
    getPaymentHistory(session.user.id),
    getSubscriptionPlans(),
  ])

  const paymentHistory = paymentHistoryResult.success ? paymentHistoryResult.data : []
  const subscriptionPlans = subscriptionPlansResult.success ? subscriptionPlansResult.data : []

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Payments</h2>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                                <div className="text-2xl font-bold">                  ₹{(paymentHistory || []).reduce((sum, item) => sum + parseFloat(item.payment.amount), 0).toFixed(2)}                </div>
                <p className="text-xs text-muted-foreground">
                  +20.1% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Successful Payments</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                                <div className="text-2xl font-bold">                  {(paymentHistory || []).filter(item => item.payment.status === 'completed').length}                </div>
                                  <p className="text-xs text-muted-foreground">                    {(((paymentHistory || []).filter(item => item.payment.status === 'completed').length / (paymentHistory || []).length) * 100 || 0).toFixed(1)}% success rate                  </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                <Repeat className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">
                  Next billing in 15 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1</div>
                <p className="text-xs text-muted-foreground">
                  ₹2,999 total due
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Payments</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                              <Suspense fallback={<div>Loading payment stats...</div>}>                <PaymentStats paymentHistory={paymentHistory || []} />              </Suspense>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Manage your payment methods and subscriptions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 rounded-md border p-4">
                    <CreditCard className="h-6 w-6" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Payment Methods
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Manage your saved cards and payment options
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 rounded-md border p-4">
                    <Receipt className="h-6 w-6" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Download Invoices
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Get PDF copies of your payment receipts
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 rounded-md border p-4">
                    <Repeat className="h-6 w-6" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Subscription Settings
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Upgrade, downgrade, or cancel subscriptions
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>
                View all your payment transactions and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
                          <Suspense fallback={<div>Loading payment history...</div>}>              <PaymentHistory paymentHistory={paymentHistory || []} />            </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Current Subscriptions</CardTitle>
                <CardDescription>
                  Manage your active subscriptions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">Premium Plan</h4>
                      <p className="text-sm text-muted-foreground">
                        Next billing: January 15, 2024
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">₹999/month</div>
                      <p className="text-sm text-green-600">Active</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">Course Bundle</h4>
                      <p className="text-sm text-muted-foreground">
                        Next billing: February 1, 2024
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">₹1,999/quarter</div>
                      <p className="text-sm text-green-600">Active</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Available Plans</CardTitle>
                <CardDescription>
                  Upgrade or subscribe to new plans
                </CardDescription>
              </CardHeader>
              <CardContent>
                                <Suspense fallback={<div>Loading subscription plans...</div>}>                  <SubscriptionPlans plans={subscriptionPlans || []} userId={session.user.id} />                </Suspense>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>
                Download and manage your invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
                            <div className="space-y-4">                {(paymentHistory || [])                  .filter(item => item.invoice)                  .map((item) => (
                    <div key={item.payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Receipt className="h-6 w-6 text-muted-foreground" />
                        <div>
                          <h4 className="font-semibold">{item.invoice?.invoiceNumber}</h4>
                          <p className="text-sm text-muted-foreground">
                            {item.course?.title || 'Subscription Payment'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(item.payment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="font-semibold">₹{item.payment.amount}</div>
                          <p className={`text-sm ${
                            item.invoice?.status === 'paid' ? 'text-green-600' : 'text-orange-600'
                          }`}>
                            {item.invoice?.status}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 