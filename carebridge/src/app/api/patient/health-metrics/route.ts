import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleMiddlewareError } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

// GET /api/patient/health-metrics - Get health metrics for the patient
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    if (user.role !== 'PATIENT') {
      return NextResponse.json(
        { error: 'Access denied. Patient role required.' },
        { status: 403 }
      )
    }

    // Check if user has Level 3 profile to access health metrics
    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { profileLevel: true }
    })

    if (!userData || userData.profileLevel < 3) {
      return NextResponse.json(
        { error: 'Complete advanced profile to access health metrics' },
        { status: 403 }
      )
    }

    // Get patient profile with vitals data
    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId: user.userId },
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

    // Format the vitals data as health metrics
    const metrics = []
    
    if (patientProfile.vitalsBp) {
      // Parse blood pressure (e.g., "120/80")
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
      // Parse blood sugar value
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
      else if (oxygen > 100) status = 'high' // Though this is rare

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
    console.error('Get health metrics error:', error)
    return handleMiddlewareError(error)
  }
}

/*

// GET /api/patient/health-metrics - Get health metrics for the patient
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)

    if (payload.role !== 'PATIENT') {
      return NextResponse.json(
        { error: 'Access denied. Patient role required.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const metricType = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '10')

    const whereClause: any = {
      patientId: payload.userId
    }

    if (metricType) {
      whereClause.metricType = metricType
    }

    const metrics = await prisma.healthMetric.findMany({
      where: whereClause,
      orderBy: {
        recordedAt: 'desc'
      },
      take: limit
    })

    // Group metrics by type for easier frontend consumption
    const groupedMetrics = metrics.reduce((acc, metric) => {
      if (!acc[metric.metricType]) {
        acc[metric.metricType] = []
      }
      acc[metric.metricType].push(metric)
      return acc
    }, {} as Record<string, typeof metrics>)

    // Get latest metrics for dashboard
    const latestMetrics = await prisma.healthMetric.findMany({
      where: {
        patientId: payload.userId
      },
      distinct: ['metricType'],
      orderBy: {
        recordedAt: 'desc'
      }
    })

    return NextResponse.json({
      metrics,
      groupedMetrics,
      latestMetrics
    })
  } catch (error) {
    console.error('Get health metrics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/patient/health-metrics - Add a new health metric
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)

    if (payload.role !== 'PATIENT') {
      return NextResponse.json(
        { error: 'Access denied. Patient role required.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { metricType, value, unit, recordedAt } = body

    if (!metricType || !value) {
      return NextResponse.json(
        { error: 'Missing required fields: metricType, value' },
        { status: 400 }
      )
    }

    // Validate metric type
    const validMetricTypes = [
      'blood_pressure',
      'heart_rate',
      'weight',
      'height',
      'temperature',
      'blood_sugar',
      'cholesterol',
      'bmi'
    ]

    if (!validMetricTypes.includes(metricType)) {
      return NextResponse.json(
        { error: 'Invalid metric type' },
        { status: 400 }
      )
    }

    const metric = await prisma.healthMetric.create({
      data: {
        patientId: payload.userId,
        metricType,
        value: typeof value === 'string' ? value : JSON.stringify(value),
        unit: unit || null,
        recordedAt: recordedAt ? new Date(recordedAt) : new Date()
      }
    })

    return NextResponse.json(
      {
        message: 'Health metric added successfully',
        metric
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Add health metric error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}*/
