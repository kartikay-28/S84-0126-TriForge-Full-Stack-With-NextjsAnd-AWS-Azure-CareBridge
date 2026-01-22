// TEMPORARILY COMMENTED OUT - Missing database models
// These routes will be enabled once the required database models are added

import { NextRequest, NextResponse } from 'next/server'

export async function PUT(_request: NextRequest, { params: _params }: { params: Promise<{ grantId: string }> }) {
  return NextResponse.json(
    { error: 'Access API temporarily unavailable' },
    { status: 503 }
  )
}

export async function DELETE(_request: NextRequest, { params: _params }: { params: Promise<{ grantId: string }> }) {
  return NextResponse.json(
    { error: 'Access API temporarily unavailable' },
    { status: 503 }
  )
}

/*

// PUT /api/patient/access/[grantId] - Update access grant status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ grantId: string }> }
) {
  try {
    const { grantId } = await params
    
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
    const { status } = body

    if (!['APPROVED', 'DENIED', 'REVOKED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be APPROVED, DENIED, or REVOKED' },
        { status: 400 }
      )
    }

    // Verify the access grant belongs to the patient
    const accessGrant = await prisma.accessGrant.findFirst({
      where: {
        id: grantId,
        patientId: payload.userId
      }
    })

    if (!accessGrant) {
      return NextResponse.json(
        { error: 'Access grant not found' },
        { status: 404 }
      )
    }

    // Update the access grant
    const updatedGrant = await prisma.accessGrant.update({
      where: {
        id: grantId
      },
      data: {
        status,
        grantedAt: status === 'APPROVED' ? new Date() : accessGrant.grantedAt,
        updatedAt: new Date()
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

    return NextResponse.json({
      message: `Access ${status.toLowerCase()} successfully`,
      accessGrant: updatedGrant
    })
  } catch (error) {
    console.error('Update access grant error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/patient/access/[grantId] - Revoke access grant
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ grantId: string }> }
) {
  try {
    const { grantId } = await params
    
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

    // Verify the access grant belongs to the patient
    const accessGrant = await prisma.accessGrant.findFirst({
      where: {
        id: grantId,
        patientId: payload.userId
      }
    })

    if (!accessGrant) {
      return NextResponse.json(
        { error: 'Access grant not found' },
        { status: 404 }
      )
    }

    // Update status to REVOKED instead of deleting
    await prisma.accessGrant.update({
      where: {
        id: grantId
      },
      data: {
        status: 'REVOKED',
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      message: 'Access revoked successfully'
    })
  } catch (error) {
    console.error('Revoke access error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}*/
