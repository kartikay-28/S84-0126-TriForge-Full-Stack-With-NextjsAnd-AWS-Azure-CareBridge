import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleMiddlewareError } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

// GET /api/patient/assigned-doctor - Get assigned doctor for patient
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    if (user.role !== 'PATIENT') {
      return NextResponse.json({ error: 'Access denied. Patient role required.' }, { status: 403 })
    }
    // Find assignment for this patient
    const assignment = await prisma.assignment.findFirst({
      where: { patientId: user.userId },
      include: {
        doctor: {
          select: { id: true, name: true, email: true }
        }
      }
    })
    if (!assignment) {
      return NextResponse.json({ doctor: null })
    }
    return NextResponse.json({ doctor: assignment.doctor })
  } catch (error) {
    console.error('Assigned doctor API error:', error)
    return handleMiddlewareError(error)
  }
}
