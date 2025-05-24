'use server'

import { db } from '@/lib/db'
import { categories } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const defaultCategories = [
  {
    name: 'Web Development',
    slug: 'web-development',
    description: 'Learn to build websites and web applications',
    image: '/categories/web-development.jpg',
  },
  {
    name: 'Mobile Development',
    slug: 'mobile-development',
    description: 'Build mobile applications for iOS and Android',
    image: '/categories/mobile-development.jpg',
  },
  {
    name: 'Data Science',
    slug: 'data-science',
    description: 'Analyze data and build machine learning models',
    image: '/categories/data-science.jpg',
  },
  {
    name: 'Digital Marketing',
    slug: 'digital-marketing',
    description: 'Master online marketing strategies and tools',
    image: '/categories/digital-marketing.jpg',
  },
  {
    name: 'Design',
    slug: 'design',
    description: 'Learn graphic design, UI/UX, and visual arts',
    image: '/categories/design.jpg',
  },
  {
    name: 'Business',
    slug: 'business',
    description: 'Develop business skills and entrepreneurship',
    image: '/categories/business.jpg',
  },
  {
    name: 'Photography',
    slug: 'photography',
    description: 'Capture and edit stunning photographs',
    image: '/categories/photography.jpg',
  },
  {
    name: 'Music',
    slug: 'music',
    description: 'Learn musical instruments and music production',
    image: '/categories/music.jpg',
  },
  {
    name: 'Language Learning',
    slug: 'language-learning',
    description: 'Master new languages and communication skills',
    image: '/categories/language-learning.jpg',
  },
  {
    name: 'Health & Fitness',
    slug: 'health-fitness',
    description: 'Improve your physical and mental well-being',
    image: '/categories/health-fitness.jpg',
  },
]

export async function seedCategories() {
  try {
    // Check if categories already exist
    const existingCategories = await db.select().from(categories).limit(1)
    
    if (existingCategories.length > 0) {
      return { success: true, message: 'Categories already exist' }
    }

    // Insert default categories
    await db.insert(categories).values(defaultCategories)

    return { success: true, message: 'Categories seeded successfully' }
  } catch (error) {
    console.error('Error seeding categories:', error)
    return { success: false, error: 'Failed to seed categories' }
  }
}

export async function resetCategories() {
  try {
    // Delete all existing categories
    await db.delete(categories)

    // Insert default categories
    await db.insert(categories).values(defaultCategories)

    return { success: true, message: 'Categories reset successfully' }
  } catch (error) {
    console.error('Error resetting categories:', error)
    return { success: false, error: 'Failed to reset categories' }
  }
} 