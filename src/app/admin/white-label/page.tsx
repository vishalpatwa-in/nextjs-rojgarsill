import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { WhiteLabelSettings } from '@/components/admin/white-label-settings'
import { getWhiteLabelSettings } from '@/lib/actions/white-label'
import { Skeleton } from '@/components/ui/skeleton'

async function WhiteLabelContent() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/auth/signin')
  }

  // For demo purposes, we'll use a default tenant ID
  // In production, this would come from the session or URL
  const tenantId = 'default-tenant'
  
  let initialData = null
  try {
    const result = await getWhiteLabelSettings(tenantId)
    if (result.success) {
      initialData = result.data
    }
  } catch (error) {
    console.error('Failed to load white-label settings:', error)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">White-Label Settings</h1>
        <p className="text-muted-foreground mt-2">
          Customize your platform's branding, domain, and configuration settings.
        </p>
      </div>
      
      <WhiteLabelSettings 
        initialData={initialData} 
        tenantId={tenantId}
      />
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </div>
  )
}

export default function WhiteLabelPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <WhiteLabelContent />
    </Suspense>
  )
} 