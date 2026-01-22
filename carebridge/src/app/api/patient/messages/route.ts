import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/jwt'

// GET /api/patient/messages - Get messages for the patient
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

    const { searchParams } = new URL(request.url)
    const doctorId = searchParams.get('doctorId')
    const limit = parseInt(searchParams.get('limit') || '50')

    const whereClause: any = {
      patientId: payload.userId
    }

    if (doctorId) {
      whereClause.doctorId = doctorId
    }

    const messages = await prisma.message.findMany({
      where: whereClause,
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
        sentAt: 'desc'
      },
      take: limit
    })

    // Get conversation summaries (latest message with each doctor)
    const conversations = await prisma.message.findMany({
      where: {
        patientId: payload.userId
      },
      distinct: ['doctorId'],
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
        sentAt: 'desc'
      }
    })

    // Count unread messages
    const unreadCount = await prisma.message.count({
      where: {
        patientId: payload.userId,
        sentBy: 'DOCTOR',
        readAt: null
      }
    })

    return NextResponse.json({
      messages,
      conversations,
      unreadCount
    })
  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/patient/messages - Send a message to a doctor
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
    const { doctorId, content } = body

    if (!doctorId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: doctorId, content' },
        { status: 400 }
      )
    }

    // Verify the doctor exists and patient has access
    const doctor = await prisma.user.findUnique({
      where: {
        id: doctorId,
        role: 'DOCTOR'
      }
    })

    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      )
    }

    // Check if patient has granted access to this doctor
    const accessGrant = await prisma.accessGrant.findFirst({
      where: {
        patientId: payload.userId,
        doctorId: doctorId,
        status: 'APPROVED'
      }
    })

    if (!accessGrant) {
      return NextResponse.json(
        { error: 'No active access grant with this doctor' },
        { status: 403 }
      )
    }

    const message = await prisma.message.create({
      data: {
        patientId: payload.userId,
        doctorId,
        content,
        sentBy: 'PATIENT'
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
        message: 'Message sent successfully',
        messageData: message
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}