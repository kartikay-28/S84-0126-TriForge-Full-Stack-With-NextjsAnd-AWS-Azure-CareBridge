import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleMiddlewareError } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

// GET /api/patient/access - Get all access grants for the patient
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    if (user.role !== 'PATIENT') {
      return NextResponse.json(
        { error: 'Access denied. Patient role required.' },
        { status: 403 }
      )
    }

    const accessGrants = await prisma.accessGrant.findMany({
      where: {
        patientId: user.userId
      },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        requestedAt: 'desc'
      }
    })

    const now = new Date()
    const activeConsents = accessGrants.filter(grant => {
      if (grant.status !== 'APPROVED') return false
      if (!grant.expiresAt) return true
      return grant.expiresAt > now
    })
    const pendingRequests = accessGrants.filter(grant => grant.status === 'PENDING')

    return NextResponse.json({
      activeConsents,
      pendingRequests,
      totalGrants: accessGrants.length
    })
  } catch (error) {
    console.error('Get access grants error:', error)
    return handleMiddlewareError(error)
  }
}

// POST /api/patient/access - Grant access to a doctor
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    if (user.role !== 'PATIENT') {
      return NextResponse.json(
        { error: 'Access denied. Patient role required.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { doctorEmail, doctorId, expiresInDays } = body

    if (!doctorEmail && !doctorId) {
      return NextResponse.json(
        { error: 'Doctor identifier is required' },
        { status: 400 }
      )
    }

    const doctor = doctorId
      ? await prisma.user.findFirst({
        where: {
          id: doctorId,
          role: 'DOCTOR'
        }
      })
      : await prisma.user.findFirst({
        where: {
          email: doctorEmail,
          role: 'DOCTOR'
        }
      })

    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      )
    }

    const assignment = await prisma.assignment.findFirst({
      where: {
        patientId: user.userId,
        doctorId: doctor.id
      }
    })

    if (!assignment) {
      return NextResponse.json(
        { error: 'Access can only be granted to assigned doctors' },
        { status: 403 }
      )
    }

    const existingAccess = await prisma.accessGrant.findUnique({
      where: {
        patientId_doctorId: {
          patientId: user.userId,
          doctorId: doctor.id
        }
      }
    })

    const now = new Date()
    const isActive = existingAccess?.status === 'APPROVED' && (!existingAccess.expiresAt || existingAccess.expiresAt > now)
    if (isActive) {
      return NextResponse.json(
        { error: 'Access already granted to this doctor' },
        { status: 409 }
      )
    }

    const expiresAt = expiresInDays
      ? new Date(Date.now() + (Number(expiresInDays) * 24 * 60 * 60 * 1000))
      : null

    const accessGrant = await prisma.accessGrant.upsert({
      where: {
        patientId_doctorId: {
          patientId: user.userId,
          doctorId: doctor.id
        }
      },
      update: {
        status: 'APPROVED',
        grantedAt: new Date(),
        expiresAt
      },
      create: {
        patientId: user.userId,
        doctorId: doctor.id,
        status: 'APPROVED',
        grantedAt: new Date(),
        expiresAt
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

    return NextResponse.json(
      {
        message: 'Access granted successfully',
        accessGrant
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Grant access error:', error)
    return handleMiddlewareError(error)
  }
}
