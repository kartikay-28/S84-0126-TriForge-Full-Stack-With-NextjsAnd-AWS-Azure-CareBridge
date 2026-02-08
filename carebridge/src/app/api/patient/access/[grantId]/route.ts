import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleMiddlewareError } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

// PUT /api/patient/access/[grantId] - Update access grant status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ grantId: string }> }
) {
  try {
    const { grantId } = await params
    const user = await requireAuth(request)

    if (user.role !== 'PATIENT') {
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

    const accessGrant = await prisma.accessGrant.findFirst({
      where: {
        id: grantId,
        patientId: user.userId
      }
    })

    if (!accessGrant) {
      return NextResponse.json(
        { error: 'Access grant not found' },
        { status: 404 }
      )
    }

    const updatedGrant = await prisma.accessGrant.update({
      where: {
        id: grantId
      },
      data: {
        status,
        grantedAt: status === 'APPROVED' ? new Date() : accessGrant.grantedAt
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
    return handleMiddlewareError(error)
  }
}

// DELETE /api/patient/access/[grantId] - Revoke access grant
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ grantId: string }> }
) {
  try {
    const { grantId } = await params
    const user = await requireAuth(request)

    if (user.role !== 'PATIENT') {
      return NextResponse.json(
        { error: 'Access denied. Patient role required.' },
        { status: 403 }
      )
    }

    const accessGrant = await prisma.accessGrant.findFirst({
      where: {
        id: grantId,
        patientId: user.userId
      }
    })

    if (!accessGrant) {
      return NextResponse.json(
        { error: 'Access grant not found' },
        { status: 404 }
      )
    }

    await prisma.accessGrant.update({
      where: {
        id: grantId
      },
      data: {
        status: 'REVOKED'
      }
    })

    return NextResponse.json({
      message: 'Access revoked successfully'
    })
  } catch (error) {
    console.error('Revoke access error:', error)
    return handleMiddlewareError(error)
  }
}
