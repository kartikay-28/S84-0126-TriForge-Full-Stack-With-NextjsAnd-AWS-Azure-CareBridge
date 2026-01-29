import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleMiddlewareError } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

// GET /api/profile/advanced - Get current advanced profile data
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
    console.error('Get advanced profile error:', error)
    return handleMiddlewareError(error)
  }
}

// POST /api/profile/advanced - Update LEVEL 3 profile fields
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()

    if (user.role === 'PATIENT') {
      // Validate LEVEL 3 patient fields (vitals)
      const {
        vitalsBp,
        vitalsSugar,
        vitalsHeartRate,
        vitalsOxygen
      } = body

      // Validate vitals (optional but if provided must be valid)
      if (vitalsHeartRate && (isNaN(vitalsHeartRate) || vitalsHeartRate < 30 || vitalsHeartRate > 200)) {
        return NextResponse.json(
          { error: 'vitalsHeartRate must be between 30-200 bpm' },
          { status: 400 }
        )
      }

      if (vitalsOxygen && (isNaN(vitalsOxygen) || vitalsOxygen < 70 || vitalsOxygen > 100)) {
        return NextResponse.json(
          { error: 'vitalsOxygen must be between 70-100%' },
          { status: 400 }
        )
      }

      // Update patient profile (must exist from previous levels)
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
          vitalsBp,
          vitalsSugar,
          vitalsHeartRate: vitalsHeartRate ? parseInt(vitalsHeartRate) : null,
          vitalsOxygen: vitalsOxygen ? parseInt(vitalsOxygen) : null
        }
      })

    } else if (user.role === 'DOCTOR') {
      // Validate LEVEL 3 doctor fields
      const {
        licenseDocument,
        bio
      } = body

      // Validate license document URL (optional but if provided must be valid URL)
      if (licenseDocument) {
        try {
          new URL(licenseDocument)
        } catch {
          return NextResponse.json(
            { error: 'licenseDocument must be a valid URL' },
            { status: 400 }
          )
        }
      }

      // Update doctor profile (must exist from previous levels)
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
          licenseDocument,
          bio
        }
      })
    }

    // Update user profile level to 3 (if not already)
    const currentUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { profileLevel: true }
    })

    if (currentUser && currentUser.profileLevel < 3) {
      await prisma.user.update({
        where: { id: user.userId },
        data: { profileLevel: 3 }
      })
    }

    return NextResponse.json({
      message: 'Advanced profile updated successfully',
      profileLevel: 3
    })

  } catch (error) {
    console.error('Advanced profile update error:', error)
    return handleMiddlewareError(error)
  }
}