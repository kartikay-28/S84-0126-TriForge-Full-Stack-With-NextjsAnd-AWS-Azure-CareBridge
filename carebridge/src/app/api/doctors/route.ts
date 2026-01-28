import { NextRequest, NextResponse } from 'next/server'
import { requireProfileLevel, handleMiddlewareError } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

// GET /api/doctors - Get filtered doctors based on patient's primary problem
export async function GET(request: NextRequest) {
  try {
    // Require profile level 1 to access doctors
    const user = await requireProfileLevel(1)(request)

    if (user.role !== 'PATIENT') {
      return NextResponse.json(
        { error: 'Access denied. Patient role required.' },
        { status: 403 }
      )
    }

    // Get patient's primary problem for filtering
    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId: user.userId },
      select: { primaryProblem: true }
    })

    if (!patientProfile?.primaryProblem) {
      return NextResponse.json(
        { error: 'Please complete your profile with primary problem first' },
        { status: 400 }
      )
    }

    // Get doctors with profile level >= 1 and matching specialization
    const doctors = await prisma.user.findMany({
      where: {
        role: 'DOCTOR',
        profileLevel: {
          gte: 1
        },
        doctorProfile: {
          OR: [
            {
              specialization: {
                contains: patientProfile.primaryProblem,
                mode: 'insensitive'
              }
            },
            {
              conditionsTreated: {
                hasSome: [patientProfile.primaryProblem]
              }
            }
          ]
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        profileLevel: true,
        doctorProfile: {
          select: {
            specialization: true,
            experienceYears: true,
            conditionsTreated: true,
            consultationMode: true,
            availability: true,
            qualifications: true,
            clinicName: true,
            consultationFee: true,
            bio: true
          }
        }
      },
      orderBy: [
        { profileLevel: 'desc' }, // Higher profile level first
        { doctorProfile: { experienceYears: 'desc' } } // More experienced first
      ]
    })

    // Check existing assignments to mark assigned doctors
    const existingAssignments = await prisma.assignment.findMany({
      where: { patientId: user.userId },
      select: { doctorId: true }
    })

    const assignedDoctorIds = new Set(existingAssignments.map(a => a.doctorId))

    // Add assignment status to each doctor
    const doctorsWithStatus = doctors.map(doctor => ({
      ...doctor,
      isAssigned: assignedDoctorIds.has(doctor.id),
      matchReason: getMatchReason(doctor.doctorProfile, patientProfile.primaryProblem!)
    }))

    return NextResponse.json({
      doctors: doctorsWithStatus,
      patientProblem: patientProfile.primaryProblem,
      totalFound: doctors.length
    })

  } catch (error) {
    console.error('Get doctors error:', error)
    return handleMiddlewareError(error)
  }
}

/**
 * Get match reason for why this doctor was recommended
 */
function getMatchReason(doctorProfile: any, primaryProblem: string): string {
  if (doctorProfile?.specialization?.toLowerCase().includes(primaryProblem.toLowerCase())) {
    return `Specializes in ${doctorProfile.specialization}`
  }
  
  if (doctorProfile?.conditionsTreated?.some((condition: string) => 
    condition.toLowerCase().includes(primaryProblem.toLowerCase())
  )) {
    return `Treats ${primaryProblem}`
  }
  
  return 'General match based on your condition'
}