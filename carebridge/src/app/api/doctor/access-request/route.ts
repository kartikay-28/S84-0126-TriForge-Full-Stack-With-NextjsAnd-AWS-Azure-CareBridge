import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleMiddlewareError } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

// GET /api/doctor/access-request - Get access requests for this doctor
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    if (user.role !== 'DOCTOR') {
      return NextResponse.json(
        { error: 'Access denied. Doctor role required.' },
        { status: 403 }
      )
    }

    const accessGrants = await prisma.accessGrant.findMany({
      where: { doctorId: user.userId },
      include: {
        patient: { select: { id: true, name: true, email: true } }
      },
      orderBy: { requestedAt: 'desc' }
    })

    const pendingRequests = accessGrants.filter(grant => grant.status === 'PENDING')
    const approvedRequests = accessGrants.filter(grant => grant.status === 'APPROVED')

    return NextResponse.json({
      pendingRequests,
      approvedRequests,
      totalRequests: accessGrants.length
    })
  } catch (error) {
    console.error('Get access requests error:', error)
    return handleMiddlewareError(error)
  }
}

// POST /api/doctor/access-request - Request access to a patient
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    if (user.role !== 'DOCTOR') {
      return NextResponse.json(
        { error: 'Access denied. Doctor role required.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { patientEmail, patientId } = body

    if (!patientEmail && !patientId) {
      return NextResponse.json(
        { error: 'Patient identifier is required' },
        { status: 400 }
      )
    }

    const patient = patientId
      ? await prisma.user.findFirst({
        where: {
          id: patientId,
          role: 'PATIENT'
        }
      })
      : await prisma.user.findFirst({
        where: {
          email: patientEmail,
          role: 'PATIENT'
        }
      })

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      )
    }

    const assignment = await prisma.assignment.findFirst({
      where: { doctorId: user.userId, patientId: patient.id }
    })

    if (!assignment) {
      return NextResponse.json(
        { error: 'Access requests are limited to your assigned patients' },
        { status: 403 }
      )
    }

    const existingAccess = await prisma.accessGrant.findUnique({
      where: {
        patientId_doctorId: {
          patientId: patient.id,
          doctorId: user.userId
        }
      }
    })

    if (existingAccess?.status === 'APPROVED') {
      return NextResponse.json(
        { error: 'Access already approved for this patient' },
        { status: 409 }
      )
    }

    if (existingAccess?.status === 'PENDING') {
      return NextResponse.json(
        { error: 'Access request already pending for this patient' },
        { status: 409 }
      )
    }

    const accessGrant = await prisma.accessGrant.upsert({
      where: {
        patientId_doctorId: {
          patientId: patient.id,
          doctorId: user.userId
        }
      },
      update: {
        status: 'PENDING',
        grantedAt: null,
        expiresAt: null,
        requestedAt: new Date()
      },
      create: {
        patientId: patient.id,
        doctorId: user.userId,
        status: 'PENDING'
      }
    })

    return NextResponse.json(
      {
        message: 'Access request sent successfully',
        accessGrant
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Request access error:', error)
    return handleMiddlewareError(error)
  }
}
