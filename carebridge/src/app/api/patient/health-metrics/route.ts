import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/jwt'

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
}