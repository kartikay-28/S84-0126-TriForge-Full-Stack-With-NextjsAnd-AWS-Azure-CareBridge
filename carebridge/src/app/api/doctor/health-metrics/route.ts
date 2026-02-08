import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleMiddlewareError } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

// GET /api/doctor/health-metrics - Get a patient's health metrics (read-only)
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

    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId: patientId },
      select: {
        vitalsBp: true,
        vitalsSugar: true,
        vitalsHeartRate: true,
        vitalsOxygen: true,
        updatedAt: true
      }
    })

    if (!patientProfile) {
      return NextResponse.json(
        { error: 'Patient profile not found' },
        { status: 404 }
      )
    }

    const metrics = [] as Array<{
      id: string
      type: string
      value: string
      unit: string
      recordedAt: Date | null
      status: string
    }>

    if (patientProfile.vitalsBp) {
      const bpMatch = patientProfile.vitalsBp.match(/(\d+)\/(\d+)/)
      let status = 'normal'
      if (bpMatch) {
        const systolic = parseInt(bpMatch[1])
        const diastolic = parseInt(bpMatch[2])
        if (systolic >= 140 || diastolic >= 90) status = 'high'
        else if (systolic < 90 || diastolic < 60) status = 'low'
      }

      metrics.push({
        id: 'bp',
        type: 'Blood Pressure',
        value: patientProfile.vitalsBp,
        unit: 'mmHg',
        recordedAt: patientProfile.updatedAt,
        status
      })
    }

    if (patientProfile.vitalsSugar) {
      const sugarMatch = patientProfile.vitalsSugar.match(/(\d+)/)
      let status = 'normal'
      if (sugarMatch) {
        const sugar = parseInt(sugarMatch[1])
        if (sugar >= 126) status = 'high'
        else if (sugar < 70) status = 'low'
      }

      metrics.push({
        id: 'sugar',
        type: 'Blood Sugar',
        value: patientProfile.vitalsSugar,
        unit: '',
        recordedAt: patientProfile.updatedAt,
        status
      })
    }

    if (patientProfile.vitalsHeartRate) {
      const heartRate = patientProfile.vitalsHeartRate
      let status = 'normal'
      if (heartRate > 100) status = 'high'
      else if (heartRate < 60) status = 'low'

      metrics.push({
        id: 'heart_rate',
        type: 'Heart Rate',
        value: heartRate.toString(),
        unit: 'BPM',
        recordedAt: patientProfile.updatedAt,
        status
      })
    }

    if (patientProfile.vitalsOxygen) {
      const oxygen = patientProfile.vitalsOxygen
      let status = 'normal'
      if (oxygen < 95) status = 'low'
      else if (oxygen > 100) status = 'high'

      metrics.push({
        id: 'oxygen',
        type: 'Oxygen Saturation',
        value: oxygen.toString(),
        unit: '%',
        recordedAt: patientProfile.updatedAt,
        status
      })
    }

    return NextResponse.json({
      success: true,
      metrics,
      lastUpdated: patientProfile.updatedAt
    })
  } catch (error) {
    console.error('Get patient health metrics error:', error)
    return handleMiddlewareError(error)
  }
}
