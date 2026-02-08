import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleMiddlewareError } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

// GET /api/doctor/patient-records - Get a patient's medical records (read-only)
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

    const records = await prisma.medicalRecord.findMany({
      where: { patientId },
      orderBy: { uploadedAt: 'desc' }
    })

    return NextResponse.json({ records })
  } catch (error) {
    console.error('Get patient records error:', error)
    return handleMiddlewareError(error)
  }
}
