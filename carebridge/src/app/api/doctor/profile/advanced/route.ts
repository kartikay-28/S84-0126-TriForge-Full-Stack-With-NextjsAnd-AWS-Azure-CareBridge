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
    const { licenseDocument, bio } = body

    // Find existing doctor profile
    const existingProfile = await prisma.doctorProfile.findUnique({
      where: { userId: user.userId }
    })

    if (!existingProfile) {
      return NextResponse.json({ 
        error: 'Please complete your basic professional information first' 
      }, { status: 400 })
    }

    // Update doctor profile with advanced fields
    const doctorProfile = await prisma.doctorProfile.update({
      where: { userId: user.userId },
      data: {
        licenseDocument: licenseDocument || null,
        bio: bio || null
      }
    })

    // Check if profile is now complete for level 3
    const hasBasicInfo = existingProfile.specialization && existingProfile.experienceYears !== null && existingProfile.consultationMode
    const hasRecommendedInfo = existingProfile.qualifications && existingProfile.qualifications.length > 0 && existingProfile.clinicName
    const hasAdvancedInfo = (licenseDocument || existingProfile.licenseDocument) && (bio || existingProfile.bio)

    if (hasBasicInfo && hasRecommendedInfo && hasAdvancedInfo && user.profileLevel < 3) {
      await prisma.user.update({
        where: { id: user.userId },
        data: { profileLevel: 3 }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Advanced professional data saved successfully',
      profileLevel: hasBasicInfo && hasRecommendedInfo && hasAdvancedInfo ? 3 : user.profileLevel,
      doctorProfile
    })

  } catch (error) {
    console.error('Doctor advanced profile API error:', error)
    return handleMiddlewareError(error)
  }
}