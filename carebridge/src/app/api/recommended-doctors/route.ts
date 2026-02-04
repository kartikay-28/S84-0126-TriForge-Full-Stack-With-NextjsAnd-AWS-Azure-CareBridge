import { NextRequest, NextResponse } from 'next/server'
import { requireProfileLevel, handleMiddlewareError } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

// GET /api/recommended-doctors - Auto-recommend doctors based on patient conditions
export async function GET(request: NextRequest) {
  try {
    // Require profile level 1 (consistent with /api/doctors pattern)
    const user = await requireProfileLevel(1)(request)

    if (user.role !== 'PATIENT') {
      return NextResponse.json(
        { error: 'Access denied. Patient role required.' },
        { status: 403 }
      )
    }

    // Get patient profile data for matching
    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId: user.userId },
      select: { 
        primaryProblem: true,
        symptoms: true
      }
    })

    if (!patientProfile) {
      return NextResponse.json(
        { error: 'Patient profile not found. Please complete your profile first.' },
        { status: 404 }
      )
    }

    // Extract conditions for matching (primaryProblem + symptoms)
    const patientConditions = [
      patientProfile.primaryProblem,
      ...(patientProfile.symptoms || [])
    ].filter(Boolean) as string[] // Remove null/undefined values and cast to string[]

    if (patientConditions.length === 0) {
      return NextResponse.json(
        { error: 'No medical conditions found. Please update your profile with primary problem or symptoms.' },
        { status: 400 }
      )
    }

    // Query doctors using existing logic pattern from /api/doctors
    // Find doctors with profile level >= 1 and matching specializations/conditions
    const recommendedDoctors = await prisma.user.findMany({
      where: {
        role: 'DOCTOR',
        profileLevel: {
          gte: 1 // Only doctors with completed basic profiles
        },
        doctorProfile: {
          OR: buildMatchingConditions(patientConditions)
        }
      },
      select: {
        id: true,
        name: true,
        doctorProfile: {
          select: {
            specialization: true,
            experienceYears: true,
            conditionsTreated: true,
            qualifications: true,
            clinicName: true,
            consultationMode: true,
            availability: true
            // Note: consultationFee not included as per requirements (safe, displayable fields only)
            // Note: licenseDocument not included (internal document)
            // Note: bio could be added if considered safe/displayable
          }
        }
      },
      orderBy: [
        { profileLevel: 'desc' }, // Higher profile level first (reusing existing logic)
        { doctorProfile: { experienceYears: 'desc' } } // More experienced first
      ]
    })

    // Check existing assignments to provide context
    const existingAssignments = await prisma.assignment.findMany({
      where: { patientId: user.userId },
      select: { doctorId: true }
    })
    const assignedDoctorIds = new Set(existingAssignments.map(a => a.doctorId))

    // Format response with safe, displayable fields only
    const formattedDoctors = recommendedDoctors.map(doctor => ({
      doctorId: doctor.id,
      name: doctor.name,
      degree: extractDegreeFromQualifications(doctor.doctorProfile?.qualifications),
      specialization: doctor.doctorProfile?.specialization || 'General Practice',
      yearsOfExperience: doctor.doctorProfile?.experienceYears || 0,
      hospital: doctor.doctorProfile?.clinicName || null, // Using clinicName as hospital/clinic
      consultationMode: doctor.doctorProfile?.consultationMode || null,
      availability: doctor.doctorProfile?.availability || null,
      isCurrentlyAssigned: assignedDoctorIds.has(doctor.id),
      matchReason: getDetailedMatchReason(doctor.doctorProfile, patientConditions)
    }))

    return NextResponse.json({
      recommendedDoctors: formattedDoctors,
      totalRecommendations: formattedDoctors.length,
      patientConditions: patientConditions,
      matchingCriteria: {
        primaryProblem: patientProfile.primaryProblem,
        symptoms: patientProfile.symptoms || []
      }
    })

  } catch (error) {
    console.error('Recommended doctors API error:', error)
    return handleMiddlewareError(error)
  }
}

/**
 * Build matching conditions for doctor query based on patient conditions
 * Enhanced version of existing logic from /api/doctors
 */
function buildMatchingConditions(patientConditions: string[]) {
  const conditions = []

  for (const condition of patientConditions) {
    // Match against doctor specialization (case-insensitive) - existing pattern
    conditions.push({
      specialization: {
        contains: condition,
        mode: 'insensitive' as const
      }
    })

    // Match against conditions treated by doctor - existing pattern
    conditions.push({
      conditionsTreated: {
        hasSome: [condition]
      }
    })
  }

  return conditions
}

/**
 * Extract degree information from qualifications array
 * Returns the highest/most relevant degree found
 */
function extractDegreeFromQualifications(qualifications?: string[]): string | null {
  if (!qualifications || qualifications.length === 0) {
    return null
  }

  // Priority order for medical degrees
  const degreePatterns = [
    /MD|M\.D\.|Doctor of Medicine/i,
    /MBBS|M\.B\.B\.S\./i,
    /DO|D\.O\.|Doctor of Osteopathic Medicine/i,
    /PhD|Ph\.D\.|Doctor of Philosophy/i,
    /MS|M\.S\.|Master of Science/i,
    /MA|M\.A\.|Master of Arts/i
  ]

  for (const pattern of degreePatterns) {
    for (const qualification of qualifications) {
      if (pattern.test(qualification)) {
        return qualification
      }
    }
  }

  // Return first qualification if no specific degree pattern found
  return qualifications[0]
}

/**
 * Get detailed match reason explaining why this doctor was recommended
 * Enhanced version of existing getMatchReason function from /api/doctors
 */
function getDetailedMatchReason(doctorProfile: any, patientConditions: string[]): string {
  const reasons: string[] = []

  // Check specialization matches
  if (doctorProfile?.specialization) {
    for (const condition of patientConditions) {
      if (doctorProfile.specialization.toLowerCase().includes(condition.toLowerCase())) {
        reasons.push(`Specializes in ${doctorProfile.specialization}`)
        break
      }
    }
  }

  // Check conditions treated matches
  if (doctorProfile?.conditionsTreated && doctorProfile.conditionsTreated.length > 0) {
    const matchingConditions = patientConditions.filter(patientCondition =>
      doctorProfile.conditionsTreated.some((treatedCondition: string) =>
        treatedCondition.toLowerCase().includes(patientCondition.toLowerCase()) ||
        patientCondition.toLowerCase().includes(treatedCondition.toLowerCase())
      )
    )
    
    if (matchingConditions.length > 0) {
      reasons.push(`Treats conditions like: ${matchingConditions.join(', ')}`)
    }
  }

  // Fallback reason (consistent with existing pattern)
  if (reasons.length === 0) {
    reasons.push('General match based on your medical profile')
  }

  return reasons.join(' • ')
}