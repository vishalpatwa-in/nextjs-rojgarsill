import { NextResponse } from 'next/server'
import { getAllCourses } from '@/lib/actions/courses'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://rojgarskill.com'

// Define types for better type safety
interface Course {
  id: string
  title: string
  slug: string
  description: string | null
  thumbnail: string | null
  price: string
  level: string
  isPublished: boolean
  createdAt: Date
  updatedAt: Date | null
  category: {
    id: string
    name: string
  } | null
}

// Static pages with their priorities and change frequencies
const staticPages = [
  {
    url: '',
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1.0,
  },
  {
    url: '/auth/signin',
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  },
  {
    url: '/dashboard',
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  },
  {
    url: '/dashboard/courses',
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  },
  {
    url: '/dashboard/live-classes',
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  },
  {
    url: '/dashboard/payments',
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  },
]

async function generateSitemap() {
  try {
    // Get all courses from database
    const courses = await getAllCourses()
    
    // Generate course URLs
    const courseUrls = courses.map((course: Course) => ({
      url: `/dashboard/courses/${course.id}`,
      lastModified: course.updatedAt || course.createdAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    const allUrls = [...staticPages, ...courseUrls]

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" 
        xmlns:xhtml="http://www.w3.org/1999/xhtml" 
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0" 
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" 
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${allUrls
  .map(
    ({ url, lastModified, changeFrequency, priority }) => `
  <url>
    <loc>${BASE_URL}${url}</loc>
    <lastmod>${lastModified.toISOString()}</lastmod>
    <changefreq>${changeFrequency}</changefreq>
    <priority>${priority}</priority>
  </url>`
  )
  .join('')}
</urlset>`

    return sitemap.trim()
  } catch (error) {
    console.error('Error generating sitemap:', error)
    
    // Fallback sitemap with static pages only
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages
  .map(
    ({ url, lastModified, changeFrequency, priority }) => `
  <url>
    <loc>${BASE_URL}${url}</loc>
    <lastmod>${lastModified.toISOString()}</lastmod>
    <changefreq>${changeFrequency}</changefreq>
    <priority>${priority}</priority>
  </url>`
  )
  .join('')}
</urlset>`

    return fallbackSitemap.trim()
  }
}

export async function GET() {
  try {
    const sitemap = await generateSitemap()
    
    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate',
      },
    })
  } catch (error) {
    console.error('Sitemap generation error:', error)
    return new NextResponse('Error generating sitemap', { status: 500 })
  }
} 