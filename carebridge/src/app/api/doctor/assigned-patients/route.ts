import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleMiddlewareError } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

// GET /api/doctor/assigned-patients - Get patients assigned to this doctor
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    if (user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Access denied. Doctor role required.' }, { status: 403 })
    }
    // Find all assignments for this doctor
    const assignments = await prisma.assignment.findMany({
      where: { doctorId: user.userId },
      include: {
        patient: {
          select: { id: true, name: true, email: true }
        }
      }
    })
    const patients = assignments.map(a => a.patient)
    return NextResponse.json({ patients })
  } catch (error) {
    console.error('Assigned patients API error:', error)
    return handleMiddlewareError(error)
  }
}
