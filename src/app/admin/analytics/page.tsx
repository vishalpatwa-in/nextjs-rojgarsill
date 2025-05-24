import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { AnalyticsOverview } from '@/components/analytics/analytics-overview'
import { Skeleton } from '@/components/ui/skeleton'

async function AnalyticsContent() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'instructor')) {
    redirect('/auth/signin')
  }

  // For demo purposes, we'll use a default tenant ID
  // In production, this would come from the session or URL
  const tenantId = session.user.role === 'admin' ? undefined : 'default-tenant'

  return (
    <div className="container mx-auto py-8">
      <AnalyticsOverview tenantId={tenantId} />
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-64" />
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
      
      <div className="space-y-4">
        <Skeleton className="h-10 w-96" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <AnalyticsContent />
    </Suspense>
  )
} 