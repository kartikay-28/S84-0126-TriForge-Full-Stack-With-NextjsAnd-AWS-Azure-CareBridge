import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/jwt'

// GET /api/patient/access - Get all access grants for the patient
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

    const accessGrants = await prisma.accessGrant.findMany({
      where: {
        patientId: payload.userId
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

    const activeConsents = accessGrants.filter(grant => grant.status === 'APPROVED')
    const pendingRequests = accessGrants.filter(grant => grant.status === 'PENDING')

    return NextResponse.json({
      activeConsents,
      pendingRequests,
      totalGrants: accessGrants.length
    })
  } catch (error) {
    console.error('Get access grants error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/patient/access - Grant access to a doctor
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
    const { doctorEmail, expiresInDays } = body

    if (!doctorEmail) {
      return NextResponse.json(
        { error: 'Doctor email is required' },
        { status: 400 }
      )
    }

    // Find the doctor by email
    const doctor = await prisma.user.findUnique({
      where: {
        email: doctorEmail,
        role: 'DOCTOR'
      }
    })

    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found with this email' },
        { status: 404 }
      )
    }

    // Check if access already exists
    const existingAccess = await prisma.accessGrant.findUnique({
      where: {
        patientId_doctorId: {
          patientId: payload.userId,
          doctorId: doctor.id
        }
      }
    })

    if (existingAccess) {
      if (existingAccess.status === 'APPROVED') {
        return NextResponse.json(
          { error: 'Access already granted to this doctor' },
          { status: 409 }
        )
      } else if (existingAccess.status === 'PENDING') {
        return NextResponse.json(
          { error: 'Access request already pending for this doctor' },
          { status: 409 }
        )
      }
    }

    // Calculate expiration date
    const expiresAt = expiresInDays 
      ? new Date(Date.now() + (expiresInDays * 24 * 60 * 60 * 1000))
      : null

    // Create or update access grant
    const accessGrant = await prisma.accessGrant.upsert({
      where: {
        patientId_doctorId: {
          patientId: payload.userId,
          doctorId: doctor.id
        }
      },
      update: {
        status: 'APPROVED',
        grantedAt: new Date(),
        expiresAt,
        updatedAt: new Date()
      },
      create: {
        patientId: payload.userId,
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}