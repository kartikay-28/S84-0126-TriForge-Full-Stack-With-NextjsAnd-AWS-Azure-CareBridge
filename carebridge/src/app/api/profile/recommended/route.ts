import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleMiddlewareError } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

// POST /api/profile/recommended - Update LEVEL 2 profile fields
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()

    if (user.role === 'PATIENT') {
      // Validate LEVEL 2 patient fields
      const {
        medicalHistory,
        currentMedications,
        emergencyContactName,
        emergencyContactPhone
      } = body

      // Validate arrays (optional but if provided must be arrays)
      if (medicalHistory && !Array.isArray(medicalHistory)) {
        return NextResponse.json(
          { error: 'medicalHistory must be an array' },
          { status: 400 }
        )
      }

      if (currentMedications && !Array.isArray(currentMedications)) {
        return NextResponse.json(
          { error: 'currentMedications must be an array' },
          { status: 400 }
        )
      }

      // Update patient profile (must exist from level 1)
      const profile = await prisma.patientProfile.findUnique({
        where: { userId: user.userId }
      })

      if (!profile) {
        return NextResponse.json(
          { error: 'Please complete basic profile first' },
          { status: 400 }
        )
      }

      await prisma.patientProfile.update({
        where: { userId: user.userId },
        data: {
          medicalHistory: medicalHistory || [],
          currentMedications: currentMedications || [],
          emergencyContactName,
          emergencyContactPhone
        }
      })

    } else if (user.role === 'DOCTOR') {
      // Validate LEVEL 2 doctor fields
      const {
        qualifications,
        clinicName,
        consultationFee
      } = body

      // Validate arrays (optional but if provided must be arrays)
      if (qualifications && !Array.isArray(qualifications)) {
        return NextResponse.json(
          { error: 'qualifications must be an array' },
          { status: 400 }
        )
      }

      // Validate consultation fee (optional but if provided must be positive number)
      if (consultationFee && (isNaN(consultationFee) || consultationFee < 0)) {
        return NextResponse.json(
          { error: 'consultationFee must be a positive number' },
          { status: 400 }
        )
      }

      // Update doctor profile (must exist from level 1)
      const profile = await prisma.doctorProfile.findUnique({
        where: { userId: user.userId }
      })

      if (!profile) {
        return NextResponse.json(
          { error: 'Please complete basic profile first' },
          { status: 400 }
        )
      }

      await prisma.doctorProfile.update({
        where: { userId: user.userId },
        data: {
          qualifications: qualifications || [],
          clinicName,
          consultationFee: consultationFee ? parseFloat(consultationFee) : null
        }
      })
    }

    // Update user profile level to 2 (if not already higher)
    const currentUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { profileLevel: true }
    })

    if (currentUser && currentUser.profileLevel < 2) {
      await prisma.user.update({
        where: { id: user.userId },
        data: { profileLevel: 2 }
      })
    }

    return NextResponse.json({
      message: 'Recommended profile updated successfully',
      profileLevel: Math.max(user.profileLevel, 2)
    })

  } catch (error) {
    console.error('Recommended profile update error:', error)
    return handleMiddlewareError(error)
  }
}