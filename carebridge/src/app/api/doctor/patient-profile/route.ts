import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleMiddlewareError } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

// GET /api/doctor/patient-profile - Get a patient's profile details (read-only)
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    if (user.role !== 'DOCTOR') {
      return NextResponse.json(
        { error: 'Access denied. Doctor role required.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')

    if (!patientId) {
      return NextResponse.json(
        { error: 'Missing required query parameter: patientId' },
        { status: 400 }
      )
    }

    const now = new Date()
    const accessGrant = await prisma.accessGrant.findFirst({
      where: {
        doctorId: user.userId,
        patientId,
        status: 'APPROVED',
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }]
      }
    })

    if (!accessGrant) {
      return NextResponse.json(
        { error: 'Access not approved for this patient' },
        { status: 403 }
      )
    }

    const patient = await prisma.user.findUnique({
      where: { id: patientId },
      select: { name: true, email: true }
    })

    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId: patientId },
      select: {
        age: true,
        gender: true,
        symptoms: true,
        consultationPreference: true,
        medicalHistory: true,
        currentMedications: true,
        emergencyContactName: true,
        emergencyContactPhone: true,
        emergencyContactRelationship: true,
        primaryProblem: true,
        lifestyleDrinking: true,
        lifestyleExercise: true,
        lifestyleSmoking: true,
        updatedAt: true
      }
    })

    if (!patientProfile) {
      return NextResponse.json(
        { error: 'Patient profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      patient,
      profile: patientProfile
    })
  } catch (error) {
    console.error('Get patient profile error:', error)
    return handleMiddlewareError(error)
  }
}
