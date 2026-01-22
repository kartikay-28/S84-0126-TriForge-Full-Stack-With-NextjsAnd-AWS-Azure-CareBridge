import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/jwt'

// GET /api/patient/dashboard - Get dashboard summary for patient
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

    // Get counts and summaries
    const [
      recordsCount,
      activeConsentsCount,
      pendingRequestsCount,
      unreadMessagesCount,
      latestHealthMetrics,
      recentRecords,
      recentMessages
    ] = await Promise.all([
      // Total medical records
      prisma.medicalRecord.count({
        where: { patientId: payload.userId }
      }),

      // Active consents (approved access grants)
      prisma.accessGrant.count({
        where: {
          patientId: payload.userId,
          status: 'APPROVED'
        }
      }),

      // Pending access requests
      prisma.accessGrant.count({
        where: {
          patientId: payload.userId,
          status: 'PENDING'
        }
      }),

      // Unread messages from doctors
      prisma.message.count({
        where: {
          patientId: payload.userId,
          sentBy: 'DOCTOR',
          readAt: null
        }
      }),

      // Latest health metrics (one per type)
      prisma.healthMetric.findMany({
        where: { patientId: payload.userId },
        distinct: ['metricType'],
        orderBy: { recordedAt: 'desc' },
        take: 5
      }),

      // Recent medical records
      prisma.medicalRecord.findMany({
        where: { patientId: payload.userId },
        orderBy: { uploadedAt: 'desc' },
        take: 3,
        select: {
          id: true,
          title: true,
          recordType: true,
          uploadedAt: true
        }
      }),

      // Recent messages
      prisma.message.findMany({
        where: { patientId: payload.userId },
        include: {
          doctor: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { sentAt: 'desc' },
        take: 3
      })
    ])

    // Get active doctors (those with approved access)
    const activeDoctors = await prisma.accessGrant.findMany({
      where: {
        patientId: payload.userId,
        status: 'APPROVED'
      },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Process health metrics for dashboard display
    const healthMetricsForDashboard = latestHealthMetrics.reduce((acc, metric) => {
      let displayValue = metric.value
      let status = 'normal'

      // Simple status logic (can be enhanced)
      try {
        const parsedValue = JSON.parse(metric.value)
        if (typeof parsedValue === 'object') {
          displayValue = parsedValue
        }
      } catch {
        // Value is already a string
      }

      acc[metric.metricType] = {
        value: displayValue,
        unit: metric.unit,
        recordedAt: metric.recordedAt,
        status
      }
      return acc
    }, {} as Record<string, any>)

    return NextResponse.json({
      summary: {
        totalRecords: recordsCount,
        activeConsents: activeConsentsCount,
        pendingRequests: pendingRequestsCount,
        unreadMessages: unreadMessagesCount
      },
      healthMetrics: healthMetricsForDashboard,
      recentRecords,
      recentMessages,
      activeDoctors: activeDoctors.map(grant => grant.doctor),
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Get dashboard error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}