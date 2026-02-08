import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleMiddlewareError } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

// GET /api/patient/assigned-doctors - Get assigned doctors for patient
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    if (user.role !== 'PATIENT') {
      return NextResponse.json(
        { error: 'Access denied. Patient role required.' },
        { status: 403 }
      )
    }

    const assignments = await prisma.assignment.findMany({
      where: { patientId: user.userId },
      include: {
        doctor: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    const doctors = assignments.map(assignment => assignment.doctor)
    return NextResponse.json({ doctors })
  } catch (error) {
    console.error('Assigned doctors API error:', error)
    return handleMiddlewareError(error)
  }
}
