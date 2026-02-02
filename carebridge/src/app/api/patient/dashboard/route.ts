// DASHBOARD API - Always returns data, never blocks based on profile level
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleMiddlewareError } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

// GET /api/patient/dashboard - Get dashboard data (NEVER BLOCKS)
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    // Get user profile data
    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      include: {
        patientProfile: true,
        doctorProfile: true,
        patientAssignments: {
          include: {
            doctor: {
              select: {
                id: true,
                name: true,
                email: true,
                doctorProfile: {
                  select: {
                    specialization: true,
                    experienceYears: true
                  }
                }
              }
            }
          }
        },
        doctorAssignments: {
          include: {
            patient: {
              select: {
                id: true,
                name: true,
                email: true,
                patientProfile: {
                  select: {
                    primaryProblem: true,
                    age: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Define section visibility based on profile level
    const sectionVisibility = getSectionVisibility(userData.profileLevel, user.role)
    
    // Get next recommended step
    const nextRecommendedStep = getNextRecommendedStep(userData.profileLevel, user.role)

    // Get counts for visible sections
    const dashboardData: any = {
      profileLevel: userData.profileLevel,
      sectionVisibility,
      nextRecommendedStep,
      sections: {}
    }

    // Doctor Assigned section (visible at level 1+)
    if (sectionVisibility.doctorAssigned.visible) {
      if (user.role === 'PATIENT') {
        dashboardData.sections.doctorAssigned = {
          assigned: userData.patientAssignments.length > 0,
          doctor: userData.patientAssignments[0]?.doctor || null,
          assignedAt: userData.patientAssignments[0]?.assignedAt || null
        }
      } else {
        dashboardData.sections.doctorAssigned = {
          patientsCount: userData.doctorAssignments.length,
          recentPatients: userData.doctorAssignments.slice(0, 5).map(a => a.patient)
        }
      }
    }

    // Medical Records section (visible at level 1+)
    if (sectionVisibility.medicalRecords.visible) {
      const recordsCount = await prisma.medicalRecord.count({
        where: { patientId: user.role === 'PATIENT' ? user.userId : undefined }
      })
      
      dashboardData.sections.medicalRecords = {
        totalRecords: recordsCount,
        recentRecords: user.role === 'PATIENT' ? await prisma.medicalRecord.findMany({
          where: { patientId: user.userId },
          orderBy: { uploadedAt: 'desc' },
          take: 3,
          select: {
            id: true,
            title: true,
            recordType: true,
            uploadedAt: true
          }
        }) : []
      }
    }

    // Health Metrics section (visible at level 3+)
    if (sectionVisibility.healthMetrics.visible) {
      dashboardData.sections.healthMetrics = {
        vitals: user.role === 'PATIENT' ? {
          bloodPressure: userData.patientProfile?.vitalsBp || null,
          bloodSugar: userData.patientProfile?.vitalsSugar || null,
          heartRate: userData.patientProfile?.vitalsHeartRate || null,
          oxygen: userData.patientProfile?.vitalsOxygen || null
        } : null,
        lastUpdated: userData.patientProfile?.updatedAt || null
      }
    }

    // AI Insights section (visible at level 3+)
    if (sectionVisibility.aiInsights.visible) {
      dashboardData.sections.aiInsights = {
        available: true,
        insights: [
          // Mock insights for now
          {
            type: 'health_trend',
            message: 'Your health metrics show stable patterns',
            confidence: 0.85
          }
        ]
      }
    }

    // Appointments section (visible at level 1+)
    if (sectionVisibility.appointments.visible) {
      dashboardData.sections.appointments = {
        upcoming: 0, // Mock data - implement when appointment system is ready
        recent: 0,
        nextAppointment: null
      }
    }

    return NextResponse.json(dashboardData)

  } catch (error) {
    console.error('Dashboard error:', error)
    return handleMiddlewareError(error)
  }
}

/**
 * Get section visibility based on profile level and role
 */
function getSectionVisibility(profileLevel: number, _role: string) {
  const baseMessage = "Please complete your profile to view these records"
  
  return {
    doctorAssigned: {
      visible: profileLevel >= 1,
      message: profileLevel < 1 ? baseMessage : null
    },
    medicalRecords: {
      visible: profileLevel >= 1,
      message: profileLevel < 1 ? "Complete basic profile to access medical records" : null
    },
    healthMetrics: {
      visible: profileLevel >= 3,
      message: profileLevel < 3 ? "Complete advanced profile to access health metrics" : null
    },
    aiInsights: {
      visible: profileLevel >= 3,
      message: profileLevel < 3 ? "Complete advanced profile to access AI insights" : null
    },
    messages: {
      visible: profileLevel >= 1,
      message: profileLevel < 1 ? "Complete basic profile to access secure messaging" : null
    },
    appointments: {
      visible: profileLevel >= 1,
      message: profileLevel < 1 ? baseMessage : null
    }
  }
}

/**
 * Get next recommended step based on profile level
 */
function getNextRecommendedStep(profileLevel: number, role: string): string {
  switch (profileLevel) {
    case 0:
      return `Complete your basic ${role.toLowerCase()} profile to get started`
    case 1:
      return `Add recommended information to unlock health metrics and AI insights`
    case 2:
      return `Complete advanced profile to access all features including AI insights`
    case 3:
      return `Your profile is complete! Explore all available features`
    default:
      return `Update your profile information`
  }
}