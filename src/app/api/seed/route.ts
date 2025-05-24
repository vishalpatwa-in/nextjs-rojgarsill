import { NextResponse } from 'next/server'
import { seedCategories } from '@/lib/actions/seed'

export async function POST() {
  try {
    const result = await seedCategories()
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: result.message 
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Seed API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
} 