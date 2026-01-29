import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleMiddlewareError } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

// GET /api/doctor/profile/recommended - Get current recommended doctor profile data
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    if (user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Access denied. Doctor role required.' }, { status: 403 })
    }

    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: user.userId }
    })

    return NextResponse.json({
      profile: doctorProfile,
      exists: !!doctorProfile
    })

  } catch (error) {
    console.error('Get doctor recommended profile error:', error)
    return handleMiddlewareError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await requireAuth(request)

    // Ensure user is a doctor
    if (user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Access denied. Doctor role required.' }, { status: 403 })
    }

    const body = await request.json()
    const { qualifications, clinicName, consultationFee } = body

    // Find existing doctor profile
    const existingProfile = await prisma.doctorProfile.findUnique({
      where: { userId: user.userId }
    })

    if (!existingProfile) {
      return NextResponse.json({ 
        error: 'Please complete your basic professional information first' 
      }, { status: 400 })
    }

    // Update doctor profile with recommended fields
    const doctorProfile = await prisma.doctorProfile.update({
      where: { userId: user.userId },
      data: {
        qualifications: Array.isArray(qualifications) ? qualifications.filter(q => q.trim()) : [],
        clinicName: clinicName || null,
        consultationFee: consultationFee ? parseFloat(consultationFee) : null
      }
    })

    // Update user profile level to 2 if conditions are met
    const hasBasicInfo = existingProfile.specialization && existingProfile.experienceYears !== null && existingProfile.consultationMode
    const hasRecommendedInfo = (qualifications && qualifications.length > 0) && clinicName

    if (hasBasicInfo && hasRecommendedInfo && user.profileLevel < 2) {
      await prisma.user.update({
        where: { id: user.userId },
        data: { profileLevel: 2 }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Practice details saved successfully',
      profileLevel: hasBasicInfo && hasRecommendedInfo ? Math.max(user.profileLevel, 2) : user.profileLevel,
      doctorProfile
    })

  } catch (error) {
    console.error('Doctor recommended profile API error:', error)
    return handleMiddlewareError(error)
  }
}