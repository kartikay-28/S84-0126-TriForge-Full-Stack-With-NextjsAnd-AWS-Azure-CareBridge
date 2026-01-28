import { NextRequest, NextResponse } from 'next/server'
import { requireProfileLevel, handleMiddlewareError } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

// GET /api/ai-insights - Get AI-powered health insights (requires level 3)
export async function GET(request: NextRequest) {
  try {
    // Require profile level 3 to access AI insights
    const user = await requireProfileLevel(3)(request)

    if (user.role !== 'PATIENT') {
      return NextResponse.json(
        { error: 'Access denied. Patient role required.' },
        { status: 403 }
      )
    }

    // Get patient profile and medical records for analysis
    const patientData = await prisma.user.findUnique({
      where: { id: user.userId },
      include: {
        patientProfile: true,
        medicalRecords: {
          orderBy: { uploadedAt: 'desc' },
          take: 10 // Last 10 records for analysis
        }
      }
    })

    if (!patientData?.patientProfile) {
      return NextResponse.json(
        { error: 'Patient profile not found' },
        { status: 404 }
      )
    }

    // Generate AI insights based on available data
    const insights = generateHealthInsights(patientData.patientProfile, patientData.medicalRecords)

    return NextResponse.json({
      insights,
      analysisDate: new Date().toISOString(),
      dataPoints: {
        profileCompleteness: calculateProfileCompleteness(patientData.patientProfile),
        recordsAnalyzed: patientData.medicalRecords.length,
        vitalsAvailable: hasVitalsData(patientData.patientProfile)
      }
    })

  } catch (error) {
    console.error('AI insights error:', error)
    return handleMiddlewareError(error)
  }
}

/**
 * Generate health insights based on patient data
 */
function generateHealthInsights(profile: any, records: any[]) {
  const insights = []

  // Health trend analysis
  if (profile.vitalsBp || profile.vitalsSugar || profile.vitalsHeartRate) {
    insights.push({
      type: 'vitals_analysis',
      title: 'Vital Signs Assessment',
      message: analyzeVitals(profile),
      priority: 'medium',
      confidence: 0.85,
      recommendations: getVitalsRecommendations(profile)
    })
  }

  // Medical history analysis
  if (profile.medicalHistory && profile.medicalHistory.length > 0) {
    insights.push({
      type: 'medical_history',
      title: 'Medical History Insights',
      message: `Based on your medical history of ${profile.medicalHistory.join(', ')}, we recommend regular monitoring.`,
      priority: 'medium',
      confidence: 0.75,
      recommendations: ['Schedule regular check-ups', 'Monitor symptoms closely']
    })
  }

  // Medication analysis
  if (profile.currentMedications && profile.currentMedications.length > 0) {
    insights.push({
      type: 'medication_review',
      title: 'Medication Management',
      message: `You are currently taking ${profile.currentMedications.length} medication(s). Regular review is recommended.`,
      priority: 'low',
      confidence: 0.90,
      recommendations: ['Discuss with your doctor during next visit', 'Keep medication list updated']
    })
  }

  // Records analysis
  if (records.length > 0) {
    const recentRecords = records.filter(r => {
      const uploadDate = new Date(r.uploadedAt)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return uploadDate > thirtyDaysAgo
    })

    if (recentRecords.length > 0) {
      insights.push({
        type: 'records_activity',
        title: 'Recent Health Activity',
        message: `You've uploaded ${recentRecords.length} medical record(s) in the last 30 days. Great job staying organized!`,
        priority: 'low',
        confidence: 1.0,
        recommendations: ['Continue regular health monitoring', 'Share relevant records with your assigned doctor']
      })
    }
  }

  // Age-based recommendations
  if (profile.age) {
    insights.push({
      type: 'age_based_care',
      title: 'Age-Appropriate Care',
      message: getAgeBasedRecommendations(profile.age),
      priority: 'medium',
      confidence: 0.80,
      recommendations: getAgeBasedActions(profile.age)
    })
  }

  // Default insight if no specific data available
  if (insights.length === 0) {
    insights.push({
      type: 'general_wellness',
      title: 'General Health Guidance',
      message: 'Complete your health profile to receive personalized insights and recommendations.',
      priority: 'low',
      confidence: 1.0,
      recommendations: ['Update your vital signs', 'Add medical history', 'Upload recent medical records']
    })
  }

  return insights
}

/**
 * Analyze vital signs
 */
function analyzeVitals(profile: any): string {
  const vitals = []
  
  if (profile.vitalsBp) {
    vitals.push(`blood pressure (${profile.vitalsBp})`)
  }
  
  if (profile.vitalsHeartRate) {
    const hr = profile.vitalsHeartRate
    const hrStatus = hr < 60 ? 'low' : hr > 100 ? 'elevated' : 'normal'
    vitals.push(`heart rate (${hr} bpm - ${hrStatus})`)
  }
  
  if (profile.vitalsOxygen) {
    const o2 = profile.vitalsOxygen
    const o2Status = o2 < 95 ? 'low' : 'normal'
    vitals.push(`oxygen saturation (${o2}% - ${o2Status})`)
  }

  return `Your recorded vitals include ${vitals.join(', ')}. Regular monitoring helps track your health trends.`
}

/**
 * Get vitals-based recommendations
 */
function getVitalsRecommendations(profile: any): string[] {
  const recommendations = []
  
  if (profile.vitalsHeartRate > 100) {
    recommendations.push('Consider discussing elevated heart rate with your doctor')
  }
  
  if (profile.vitalsOxygen && profile.vitalsOxygen < 95) {
    recommendations.push('Low oxygen levels should be evaluated by a healthcare provider')
  }
  
  recommendations.push('Update vitals regularly for better health tracking')
  
  return recommendations
}

/**
 * Get age-based health recommendations
 */
function getAgeBasedRecommendations(age: number): string {
  if (age < 30) {
    return 'Focus on establishing healthy lifestyle habits and preventive care.'
  } else if (age < 50) {
    return 'Regular health screenings become more important. Consider annual check-ups.'
  } else if (age < 65) {
    return 'Increased focus on chronic disease prevention and regular monitoring is recommended.'
  } else {
    return 'Comprehensive geriatric care and frequent health monitoring are beneficial.'
  }
}

/**
 * Get age-based action items
 */
function getAgeBasedActions(age: number): string[] {
  if (age < 30) {
    return ['Maintain healthy diet', 'Regular exercise', 'Avoid smoking and excessive alcohol']
  } else if (age < 50) {
    return ['Annual physical exams', 'Blood pressure monitoring', 'Cholesterol screening']
  } else if (age < 65) {
    return ['Diabetes screening', 'Cancer screenings', 'Bone density tests']
  } else {
    return ['Comprehensive geriatric assessment', 'Fall prevention', 'Medication review']
  }
}

/**
 * Calculate profile completeness percentage
 */
function calculateProfileCompleteness(profile: any): number {
  const fields = [
    'age', 'gender', 'primaryProblem', 'symptoms', 'consultationPreference',
    'medicalHistory', 'currentMedications', 'emergencyContactName',
    'vitalsBp', 'vitalsSugar', 'vitalsHeartRate', 'vitalsOxygen'
  ]
  
  const completedFields = fields.filter(field => {
    const value = profile[field]
    return value !== null && value !== undefined && 
           (Array.isArray(value) ? value.length > 0 : value !== '')
  }).length
  
  return Math.round((completedFields / fields.length) * 100)
}

/**
 * Check if vitals data is available
 */
function hasVitalsData(profile: any): boolean {
  return !!(profile.vitalsBp || profile.vitalsSugar || profile.vitalsHeartRate || profile.vitalsOxygen)
}