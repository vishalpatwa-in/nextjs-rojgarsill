import Head from 'next/head'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product' | 'course'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  course?: {
    title: string
    description: string
    instructor: string
    price: number
    currency: string
    category: string
    level: string
    duration: number
    rating?: number
    reviewCount?: number
  }
  noIndex?: boolean
  noFollow?: boolean
}

const defaultSEO = {
  title: 'RojgarSkill - Professional E-Learning Platform',
  description: 'Master new skills with RojgarSkill. Comprehensive online courses, live classes, expert instructors, and industry-recognized certificates. Start your learning journey today.',
  keywords: [
    'online learning',
    'e-learning platform',
    'online courses',
    'skill development',
    'professional training',
    'certification',
    'live classes',
    'career development',
    'digital skills',
    'programming courses',
    'business courses',
    'technology training'
  ],
  image: '/images/og-image.jpg',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://rojgarskill.com',
}

export function SEOHead({
  title,
  description,
  keywords = [],
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  course,
  noIndex = false,
  noFollow = false,
}: SEOProps) {
  const seoTitle = title ? `${title} | RojgarSkill` : defaultSEO.title
  const seoDescription = description || defaultSEO.description
  const seoKeywords = [...defaultSEO.keywords, ...keywords].join(', ')
  const seoImage = image || defaultSEO.image
  const seoUrl = url || defaultSEO.url
  const fullImageUrl = seoImage.startsWith('http') ? seoImage : `${defaultSEO.url}${seoImage}`

  const robotsContent = [
    noIndex ? 'noindex' : 'index',
    noFollow ? 'nofollow' : 'follow',
    'max-snippet:-1',
    'max-image-preview:large',
    'max-video-preview:-1'
  ].join(', ')

  // Generate structured data for courses
  const generateCourseStructuredData = () => {
    if (!course) return null

    return {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: course.title,
      description: course.description,
      provider: {
        '@type': 'Organization',
        name: 'RojgarSkill',
        url: defaultSEO.url,
      },
      instructor: {
        '@type': 'Person',
        name: course.instructor,
      },
      offers: {
        '@type': 'Offer',
        price: course.price,
        priceCurrency: course.currency,
        availability: 'https://schema.org/InStock',
      },
      courseMode: 'online',
      educationalLevel: course.level,
      timeRequired: `PT${course.duration}H`,
      about: course.category,
      ...(course.rating && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: course.rating,
          reviewCount: course.reviewCount || 1,
        },
      }),
    }
  }

  // Generate organization structured data
  const organizationStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'RojgarSkill',
    url: defaultSEO.url,
    logo: `${defaultSEO.url}/images/logo.png`,
    description: 'Professional E-Learning Platform for Skill Development',
    sameAs: [
      'https://facebook.com/rojgarskill',
      'https://twitter.com/rojgarskill',
      'https://linkedin.com/company/rojgarskill',
      'https://instagram.com/rojgarskill',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-1234567890',
      contactType: 'customer service',
      email: 'support@rojgarskill.com',
    },
  }

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords} />
      <meta name="author" content={author || 'RojgarSkill'} />
      <meta name="robots" content={robotsContent} />
      <link rel="canonical" href={seoUrl} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:url" content={seoUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="RojgarSkill" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@rojgarskill" />
      <meta name="twitter:creator" content="@rojgarskill" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={fullImageUrl} />

      {/* Article specific tags */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#3b82f6" />
      <meta name="msapplication-TileColor" content="#3b82f6" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* Favicon and Icons */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/manifest.json" />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationStructuredData),
        }}
      />
      
      {course && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateCourseStructuredData()),
          }}
        />
      )}

      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://analytics.google.com" />
      <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
    </Head>
  )
} 