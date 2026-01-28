import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleMiddlewareError } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await requireAuth(request)

    // Ensure user is a doctor
    if (user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Access denied. Doctor role required.' }, { status: 403 })
    }

    const body = await request.json()
    const { specialization, experienceYears, conditionsTreated, consultationMode, availability } = body

    // Validate required fields
    if (!specialization || experienceYears === undefined || !conditionsTreated || !consultationMode || !availability) {
      return NextResponse.json({ 
        error: 'Missing required fields: specialization, experienceYears, conditionsTreated, consultationMode, availability' 
      }, { status: 400 })
    }

    // Create or update doctor profile
    const doctorProfile = await prisma.doctorProfile.upsert({
      where: { userId: user.userId },
      update: {
        specialization,
        experienceYears: parseInt(experienceYears),
        conditionsTreated: Array.isArray(conditionsTreated) ? conditionsTreated : [conditionsTreated],
        consultationMode: consultationMode === 'IN_PERSON_ONLY' ? 'IN_PERSON_ONLY' : 
                         consultationMode === 'ONLINE_ONLY' ? 'ONLINE_ONLY' : 
                         consultationMode === 'BOTH' ? 'BOTH' : 'IN_PERSON_ONLY',
        availability
      },
      create: {
        userId: user.userId,
        specialization,
        experienceYears: parseInt(experienceYears),
        conditionsTreated: Array.isArray(conditionsTreated) ? conditionsTreated : [conditionsTreated],
        consultationMode: consultationMode === 'IN_PERSON_ONLY' ? 'IN_PERSON_ONLY' : 
                         consultationMode === 'ONLINE_ONLY' ? 'ONLINE_ONLY' : 
                         consultationMode === 'BOTH' ? 'BOTH' : 'IN_PERSON_ONLY',
        availability
      }
    })

    // Update user profile level to 1 if it was 0
    if (user.profileLevel === 0) {
      await prisma.user.update({
        where: { id: user.userId },
        data: { profileLevel: 1 }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Basic professional information saved successfully',
      profileLevel: Math.max(user.profileLevel, 1),
      doctorProfile
    })

  } catch (error) {
    console.error('Doctor basic profile API error:', error)
    return handleMiddlewareError(error)
  }
}