import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleMiddlewareError } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

// GET /api/doctor/messages - Get messages for a patient (or list assigned patients)
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    if (user.role !== 'DOCTOR') {
      return NextResponse.json(
        { error: 'Access denied. Doctor role required.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!patientId) {
      const assignments = await prisma.assignment.findMany({
        where: { doctorId: user.userId },
        include: {
          patient: { select: { id: true, name: true, email: true } }
        }
      })

      const patients = assignments.map(a => a.patient)
      return NextResponse.json({ patients })
    }

    const assignment = await prisma.assignment.findFirst({
      where: { doctorId: user.userId, patientId }
    })

    if (!assignment) {
      return NextResponse.json(
        { error: 'No assignment found with this patient' },
        { status: 403 }
      )
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user.userId, receiverId: patientId },
          { senderId: patientId, receiverId: user.userId }
        ]
      },
      orderBy: { createdAt: 'asc' },
      take: limit
    })

    const normalizedMessages = messages.map(message => ({
      ...message,
      sentBy: message.senderId === user.userId ? 'DOCTOR' : 'PATIENT'
    }))

    return NextResponse.json({ messages: normalizedMessages })
  } catch (error) {
    console.error('Get doctor messages error:', error)
    return handleMiddlewareError(error)
  }
}

// POST /api/doctor/messages - Send a message to a patient
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
    const { patientId, content } = body

    if (!patientId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: patientId, content' },
        { status: 400 }
      )
    }

    const assignment = await prisma.assignment.findFirst({
      where: { doctorId: user.userId, patientId }
    })

    if (!assignment) {
      return NextResponse.json(
        { error: 'No assignment found with this patient' },
        { status: 403 }
      )
    }

    const message = await prisma.message.create({
      data: {
        senderId: user.userId,
        receiverId: patientId,
        content
      }
    })

    return NextResponse.json(
      {
        message: 'Message sent successfully',
        messageData: {
          ...message,
          sentBy: 'DOCTOR'
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Send doctor message error:', error)
    return handleMiddlewareError(error)
  }
}
