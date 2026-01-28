import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleMiddlewareError } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

// POST /api/profile/basic - Update LEVEL 1 profile fields
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()

    if (user.role === 'PATIENT') {
      // Validate LEVEL 1 patient fields
      const {
        age,
        gender,
        primaryProblem,
        symptoms,
        consultationPreference
      } = body

      // Validate required fields
      if (!age || !gender || !primaryProblem || !symptoms || !consultationPreference) {
        return NextResponse.json(
          { error: 'Missing required fields: age, gender, primaryProblem, symptoms, consultationPreference' },
          { status: 400 }
        )
      }

      // Validate symptoms array (max 3)
      if (!Array.isArray(symptoms) || symptoms.length === 0 || symptoms.length > 3) {
        return NextResponse.json(
          { error: 'Symptoms must be an array with 1-3 items' },
          { status: 400 }
        )
      }

      // Validate enums
      const validGenders = ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']
      const validConsultationPrefs = ['IN_PERSON', 'VIDEO_CALL', 'PHONE_CALL', 'CHAT']

      if (!validGenders.includes(gender)) {
        return NextResponse.json(
          { error: 'Invalid gender value' },
          { status: 400 }
        )
      }

      if (!validConsultationPrefs.includes(consultationPreference)) {
        return NextResponse.json(
          { error: 'Invalid consultation preference' },
          { status: 400 }
        )
      }

      // Create or update patient profile
      await prisma.patientProfile.upsert({
        where: { userId: user.userId },
        update: {
          age: parseInt(age),
          gender,
          primaryProblem,
          symptoms,
          consultationPreference
        },
        create: {
          userId: user.userId,
          age: parseInt(age),
          gender,
          primaryProblem,
          symptoms,
          consultationPreference
        }
      })

    } else if (user.role === 'DOCTOR') {
      // Validate LEVEL 1 doctor fields
      const {
        specialization,
        experienceYears,
        conditionsTreated,
        consultationMode,
        availability
      } = body

      // Validate required fields
      if (!specialization || !experienceYears || !conditionsTreated || !consultationMode || !availability) {
        return NextResponse.json(
          { error: 'Missing required fields: specialization, experienceYears, conditionsTreated, consultationMode, availability' },
          { status: 400 }
        )
      }

      // Validate arrays
      if (!Array.isArray(conditionsTreated) || conditionsTreated.length === 0) {
        return NextResponse.json(
          { error: 'conditionsTreated must be a non-empty array' },
          { status: 400 }
        )
      }

      // Validate enums
      const validConsultationModes = ['IN_PERSON_ONLY', 'ONLINE_ONLY', 'BOTH']
      if (!validConsultationModes.includes(consultationMode)) {
        return NextResponse.json(
          { error: 'Invalid consultation mode' },
          { status: 400 }
        )
      }

      // Create or update doctor profile
      await prisma.doctorProfile.upsert({
        where: { userId: user.userId },
        update: {
          specialization,
          experienceYears: parseInt(experienceYears),
          conditionsTreated,
          consultationMode,
          availability
        },
        create: {
          userId: user.userId,
          specialization,
          experienceYears: parseInt(experienceYears),
          conditionsTreated,
          consultationMode,
          availability
        }
      })
    }

    // Update user profile level to 1
    await prisma.user.update({
      where: { id: user.userId },
      data: { profileLevel: 1 }
    })

    return NextResponse.json({
      message: 'Basic profile updated successfully',
      profileLevel: 1
    })

  } catch (error) {
    console.error('Basic profile update error:', error)
    return handleMiddlewareError(error)
  }
}