import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Define protected routes
const protectedRoutes = [
  '/dashboard',
  '/admin',
  '/api/courses',
  '/api/payments',
  '/api/certificates',
  '/api/analytics',
  '/api/white-label'
]

const adminRoutes = [
  '/admin',
  '/api/admin',
  '/dashboard/admin'
]

const apiRoutes = [
  '/api/courses',
  '/api/payments',
  '/api/certificates',
  '/api/analytics',
  '/api/white-label',
  '/api/live-classes'
]

// Rate limiting storage (in production, use Redis or similar)
const rateLimitMap = new Map()

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Security headers for all requests
  const response = NextResponse.next()
  
  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // Content Security Policy
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https://*.unsplash.com https://*.cloudinary.com;
    font-src 'self' https://fonts.gstatic.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim()
  
  response.headers.set('Content-Security-Policy', cspHeader)

  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               '127.0.0.1'
    const limit = 100 // requests per window
    const windowMs = 15 * 60 * 1000 // 15 minutes
    
    const key = `${ip}:${Math.floor(Date.now() / windowMs)}`
    const current = rateLimitMap.get(key) ?? 0
    
    if (current >= limit) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': '900', // 15 minutes
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(Date.now() + windowMs).toISOString(),
        },
      })
    }
    
    rateLimitMap.set(key, current + 1)
    
    // Clean up old entries
    if (rateLimitMap.size > 1000) {
      const currentWindow = Math.floor(Date.now() / windowMs)
      for (const [key] of rateLimitMap.entries()) {
        const keyWindow = parseInt(key.split(':')[1])
        if (keyWindow < currentWindow - 1) {
          rateLimitMap.delete(key)
        }
      }
    }
    
    response.headers.set('X-RateLimit-Limit', limit.toString())
    response.headers.set('X-RateLimit-Remaining', (limit - current - 1).toString())
  }

  // Skip auth check for public routes
  if (
    pathname === '/' ||
    pathname === '/auth/signin' ||
    pathname === '/auth/signup' ||
    pathname === '/api/auth/signin' ||
    pathname === '/api/auth/callback' ||
    pathname === '/api/auth/session' ||
    pathname === '/api/webhooks/razorpay' ||
    pathname === '/api/webhooks/cashfree' ||
    pathname === '/sitemap.xml' ||
    pathname === '/robots.txt' ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/icons/')
  ) {
    return response
  }

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))
  const isApiRoute = apiRoutes.some(route => pathname.startsWith(route))

  if (isProtectedRoute || isApiRoute) {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    })

    // If no token, redirect to signin
    if (!token) {
      const signInUrl = new URL('/auth/signin', request.url)
      signInUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(signInUrl)
    }

    // Check admin access
    if (isAdminRoute && token.role !== 'admin') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    // Add user info to headers for API routes
    if (isApiRoute) {
      response.headers.set('X-User-ID', token.sub || '')
      response.headers.set('X-User-Role', token.role || 'student')
      response.headers.set('X-User-Email', token.email || '')
    }
  }

  // Additional security checks for sensitive operations
  if (pathname.startsWith('/api/payments') || pathname.startsWith('/api/certificates')) {
    // Ensure HTTPS in production
    if (process.env.NODE_ENV === 'production' && request.headers.get('x-forwarded-proto') !== 'https') {
      return new NextResponse('HTTPS Required', { status: 400 })
    }

    // Check for proper content type on POST/PUT/PATCH
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      const contentType = request.headers.get('content-type')
      if (!contentType || (!contentType.includes('application/json') && !contentType.includes('multipart/form-data'))) {
        return new NextResponse('Invalid Content Type', { status: 400 })
      }
    }
  }

  // Webhook signature verification
  if (pathname.startsWith('/api/webhooks/')) {
    const signature = request.headers.get('x-razorpay-signature') || request.headers.get('x-verify')
    if (!signature) {
      return new NextResponse('Missing Signature', { status: 400 })
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 