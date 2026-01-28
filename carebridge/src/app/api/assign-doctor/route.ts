import { NextRequest, NextResponse } from 'next/server'
import { requireProfileLevel, handleMiddlewareError } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

// POST /api/assign-doctor - Assign a doctor to patient
export async function POST(request: NextRequest) {
  try {
    // Require profile level 1 to assign doctor
    const user = await requireProfileLevel(1)(request)

    if (user.role !== 'PATIENT') {
      return NextResponse.json(
        { error: 'Access denied. Patient role required.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { doctorId } = body

    if (!doctorId) {
      return NextResponse.json(
        { error: 'Doctor ID is required' },
        { status: 400 }
      )
    }

    // Validate doctor exists and has profile level >= 1
    const doctor = await prisma.user.findUnique({
      where: {
        id: doctorId,
        role: 'DOCTOR'
      },
      select: {
        id: true,
        name: true,
        profileLevel: true,
        doctorProfile: {
          select: {
            specialization: true,
            experienceYears: true
          }
        }
      }
    })

    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      )
    }

    if (doctor.profileLevel < 1) {
      return NextResponse.json(
        { error: 'Doctor profile is incomplete. Please choose another doctor.' },
        { status: 400 }
      )
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.assignment.findUnique({
      where: {
        patientId_doctorId: {
          patientId: user.userId,
          doctorId: doctorId
        }
      }
    })

    if (existingAssignment) {
      return NextResponse.json(
        { error: 'You are already assigned to this doctor' },
        { status: 409 }
      )
    }

    // Create new assignment
    const assignment = await prisma.assignment.create({
      data: {
        patientId: user.userId,
        doctorId: doctorId
      },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            email: true,
            doctorProfile: {
              select: {
                specialization: true,
                experienceYears: true,
                consultationMode: true,
                clinicName: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Doctor assigned successfully',
      assignment: {
        id: assignment.id,
        assignedAt: assignment.assignedAt,
        doctor: assignment.doctor
      }
    })

  } catch (error) {
    console.error('Assign doctor error:', error)
    return handleMiddlewareError(error)
  }
}