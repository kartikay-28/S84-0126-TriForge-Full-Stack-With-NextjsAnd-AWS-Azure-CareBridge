import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleMiddlewareError, createErrorResponse } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

const isValidTime = (value: string) => {
  if (!/^\d{2}:\d{2}$/.test(value)) return false
  const [hours, minutes] = value.split(':').map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return false
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59
}

const isValidDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00`)
  return !Number.isNaN(date.getTime())
}

const isValidMeetLink = (value: string) => {
  try {
    const url = new URL(value)
    return url.hostname === 'meet.google.com'
  } catch (error) {
    return false
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const searchParams = request.nextUrl.searchParams
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    let dateFilter: { gte?: Date; lte?: Date } | undefined
    if (from && to && isValidDate(from) && isValidDate(to)) {
      const startDate = new Date(`${from}T00:00:00`)
      const endDate = new Date(`${to}T23:59:59`)
      dateFilter = { gte: startDate, lte: endDate }
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        ...(user.role === 'DOCTOR'
          ? { doctorId: user.userId }
          : { patientId: user.userId }),
        ...(dateFilter ? { scheduledAt: dateFilter } : {})
      },
      include: {
        doctor: { select: { id: true, name: true } },
        patient: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } }
      },
      orderBy: { scheduledAt: 'asc' }
    })

    return NextResponse.json({ appointments })
  } catch (error) {
    console.error('Appointments GET error:', error)
    return handleMiddlewareError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()

    let doctorId = String(body.doctorId || '')
    let patientId = String(body.patientId || '')
    const appointmentDate = String(body.date || '')
    const startTime = String(body.startTime || '')
    const durationMinutes = Number(body.durationMinutes)
    const meetLink = String(body.meetLink || '')
    const notes = typeof body.notes === 'string' ? body.notes.trim() : null

    if (user.role === 'DOCTOR') {
      if (!doctorId) doctorId = user.userId
      if (doctorId !== user.userId) {
        return createErrorResponse('Doctor can only schedule for self', 403)
      }
    }

    if (user.role === 'PATIENT') {
      if (!patientId) patientId = user.userId
      if (patientId !== user.userId) {
        return createErrorResponse('Patient can only schedule for self', 403)
      }
    }

    if (!doctorId || !patientId) {
      return createErrorResponse('Doctor and patient are required', 400)
    }

    if (!isValidDate(appointmentDate)) {
      return createErrorResponse('Invalid appointment date', 400)
    }

    if (!isValidTime(startTime)) {
      return createErrorResponse('Invalid start time', 400)
    }

    if (!Number.isInteger(durationMinutes) || durationMinutes <= 0) {
      return createErrorResponse('Duration must be a positive number', 400)
    }

    if (!meetLink || !isValidMeetLink(meetLink)) {
      return createErrorResponse('Invalid Google Meet link', 400)
    }

    const assignment = await prisma.assignment.findUnique({
      where: {
        patientId_doctorId: {
          patientId,
          doctorId
        }
      }
    })

    if (!assignment) {
      return createErrorResponse('Doctor and patient are not assigned', 403)
    }

    const scheduledAt = new Date(`${appointmentDate}T${startTime}:00`)
    if (Number.isNaN(scheduledAt.getTime())) {
      return createErrorResponse('Invalid appointment date/time', 400)
    }

    if (scheduledAt.getTime() <= Date.now()) {
      return createErrorResponse('Appointment must be in the future', 400)
    }

    const appointment = await prisma.appointment.create({
      data: {
        doctorId,
        patientId,
        scheduledAt,
        durationMinutes,
        meetLink,
        notes: notes || null,
        createdById: user.userId
      },
      include: {
        doctor: { select: { id: true, name: true } },
        patient: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } }
      }
    })

    return NextResponse.json({ appointment })
  } catch (error) {
    console.error('Appointments POST error:', error)
    return handleMiddlewareError(error)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const searchParams = request.nextUrl.searchParams
    const appointmentId = searchParams.get('id')

    if (!appointmentId) {
      return createErrorResponse('Appointment id is required', 400)
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: { id: true, doctorId: true, patientId: true }
    })

    if (!appointment) {
      return createErrorResponse('Appointment not found', 404)
    }

    const isParticipant = appointment.doctorId === user.userId || appointment.patientId === user.userId
    if (!isParticipant) {
      return createErrorResponse('Not allowed to delete this appointment', 403)
    }

    await prisma.appointment.delete({ where: { id: appointmentId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Appointments DELETE error:', error)
    return handleMiddlewareError(error)
  }
}
