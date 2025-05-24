import { NextResponse } from 'next/server'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://rojgarskill.com'

export async function GET() {
  const robotsTxt = `# Robots.txt for RojgarSkill E-Learning Platform
# Generated automatically

User-agent: *
Allow: /

# Disallow private/admin areas
Disallow: /dashboard/
Disallow: /admin/
Disallow: /api/
Disallow: /auth/

# Allow specific public pages
Allow: /
Allow: /courses
Allow: /about
Allow: /contact
Allow: /privacy
Allow: /terms

# Sitemap location
Sitemap: ${BASE_URL}/sitemap.xml

# Crawl delay for better server performance
Crawl-delay: 1

# Google-specific directives
User-agent: Googlebot
Allow: /
Disallow: /dashboard/
Disallow: /admin/
Disallow: /api/auth/
Crawl-delay: 1

# Bing-specific directives
User-agent: Bingbot
Allow: /
Disallow: /dashboard/
Disallow: /admin/
Disallow: /api/auth/
Crawl-delay: 1

# Block known bad bots
User-agent: AhrefsBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: DotBot
Disallow: /

User-agent: SemrushBot
Disallow: /

# Cache directive
# This robots.txt file is cached for performance
`

  return new NextResponse(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, s-maxage=86400',
    },
  })
} 