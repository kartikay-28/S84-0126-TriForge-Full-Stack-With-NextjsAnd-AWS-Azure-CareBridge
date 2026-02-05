import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleMiddlewareError } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await requireAuth(request)

    // Ensure user is a doctor
    if (user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Access denied. Doctor role required.' }, { status: 403 })
    }

    // Get doctor profile to determine profile level
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: user.userId }
    })

    // Determine profile level based on completed fields
    let profileLevel = 0
    
    if (doctorProfile) {
      // Level 1: Basic professional info
      if (doctorProfile.specialization && doctorProfile.experienceYears !== null && doctorProfile.consultationMode) {
        profileLevel = 1
      }
      
      // Level 2: Extended professional info
      if (profileLevel === 1 && doctorProfile.qualifications && doctorProfile.qualifications.length > 0 && doctorProfile.clinicName) {
        profileLevel = 2
      }
      
      // Level 3: Complete profile
      if (profileLevel === 2 && doctorProfile.consultationFee !== null && doctorProfile.licenseDocument) {
        profileLevel = 3
      }
    }

    // Define section visibility based on profile level
    const sectionVisibility = {
      patients: {
        visible: profileLevel >= 3, // Require 100% completed profile to access patients
        message: profileLevel < 3 ? "Complete your full professional profile (including consultation fees and license document) to start accepting patients" : null
      },
      messages: {
        visible: profileLevel >= 3, // Require 100% completed profile for messaging
        message: profileLevel < 3 ? "Complete your full professional profile to enable messaging with patients" : null
      },
      records: {
        visible: profileLevel >= 3, // Require 100% completed profile to access patient records
        message: profileLevel < 3 ? "Complete your full professional profile to access patient medical records" : null
      },
      appointments: {
        visible: profileLevel >= 3, // Require 100% completed profile for appointments
        message: profileLevel < 3 ? "Complete your full professional profile to manage appointments" : null
      },
      analytics: {
        visible: profileLevel >= 3,
        message: profileLevel < 3 ? "Complete your full professional profile to access advanced analytics and insights" : null
      }
    }

    // Determine next recommended step
    let nextRecommendedStep = "Complete your basic professional information"
    if (profileLevel === 1) {
      nextRecommendedStep = "Add your qualifications and clinic information"
    } else if (profileLevel === 2) {
      nextRecommendedStep = "Set your consultation fees and upload license document"
    } else if (profileLevel === 3) {
      nextRecommendedStep = "Your profile is complete!"
    }

    // Get dashboard sections data
    const sections = {
      activePatients: 0, // TODO: Count patients with active consent
      pendingRequests: 0, // TODO: Count pending access requests
      totalConsents: 0, // TODO: Count total consents
      recentRecords: 0 // TODO: Count recently accessed records
    }

    return NextResponse.json({
      profileLevel,
      sectionVisibility,
      nextRecommendedStep,
      sections,
      doctorProfile: doctorProfile ? {
        specialization: doctorProfile.specialization,
        experienceYears: doctorProfile.experienceYears,
        conditionsTreated: doctorProfile.conditionsTreated,
        consultationMode: doctorProfile.consultationMode,
        availability: doctorProfile.availability,
        qualifications: doctorProfile.qualifications,
        clinicName: doctorProfile.clinicName,
        consultationFee: doctorProfile.consultationFee,
        licenseDocument: doctorProfile.licenseDocument,
        bio: doctorProfile.bio
      } : null
    })

  } catch (error) {
    console.error('Doctor dashboard API error:', error)
    return handleMiddlewareError(error)
  }
}