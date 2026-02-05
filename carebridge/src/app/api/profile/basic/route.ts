import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleMiddlewareError } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

// GET /api/profile/basic - Get current basic profile data
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    if (user.role === 'PATIENT') {
      const patientProfile = await prisma.patientProfile.findUnique({
        where: { userId: user.userId }
      })

      return NextResponse.json({
        profile: patientProfile,
        exists: !!patientProfile
      })
    } else if (user.role === 'DOCTOR') {
      const doctorProfile = await prisma.doctorProfile.findUnique({
        where: { userId: user.userId }
      })

      return NextResponse.json({
        profile: doctorProfile,
        exists: !!doctorProfile
      })
    }

    return NextResponse.json({ profile: null, exists: false })

  } catch (error) {
    console.error('Get basic profile error:', error)
    return handleMiddlewareError(error)
  }
}

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
      const validMedicalConditions = [
        'HEART_DISEASE', 'DIABETES', 'HYPERTENSION', 'ASTHMA', 'ARTHRITIS',
        'DEPRESSION', 'ANXIETY', 'SKIN_CONDITIONS', 'DIGESTIVE_ISSUES',
        'HEADACHES_MIGRAINES', 'BACK_PAIN', 'ALLERGIES', 'RESPIRATORY_ISSUES',
        'KIDNEY_DISEASE', 'LIVER_DISEASE', 'THYROID_DISORDERS', 'CANCER',
        'NEUROLOGICAL_DISORDERS', 'MENTAL_HEALTH', 'WOMENS_HEALTH', 'MENS_HEALTH',
        'PEDIATRIC_CARE', 'GERIATRIC_CARE', 'GENERAL_CHECKUP', 'PREVENTIVE_CARE', 'OTHER'
      ]

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

      if (!validMedicalConditions.includes(primaryProblem)) {
        return NextResponse.json(
          { error: 'Invalid primary problem value' },
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