import { NextRequest, NextResponse } from 'next/server'
import { requireProfileLevel, handleMiddlewareError } from '@/lib/middleware'
import { handleFileUpload, validateFileType, validateFileSize } from '@/lib/file-upload'
import { prisma } from '@/lib/prisma'

// GET /api/patient/records - Get all medical records for the patient (requires level 1)
export async function GET(request: NextRequest) {
  try {
    // Require profile level 1 to access medical records
    const user = await requireProfileLevel(1)(request)

    if (user.role !== 'PATIENT') {
      return NextResponse.json(
        { error: 'Access denied. Patient role required.' },
        { status: 403 }
      )
    }

    // Get records from database
    const records = await prisma.medicalRecord.findMany({
      where: {
        patientId: user.userId
      },
      orderBy: {
        uploadedAt: 'desc'
      }
    })
    
    return NextResponse.json({ 
      records,
      message: "Records loaded from database"
    })
  } catch (error) {
    console.error('Get records error:', error)
    return handleMiddlewareError(error)
  }
}

// POST /api/patient/records - Upload a new medical record with file (requires level 1)
export async function POST(request: NextRequest) {
  try {
    // Require profile level 1 to upload records (basic info completed)
    const user = await requireProfileLevel(1)(request)

    if (user.role !== 'PATIENT') {
      return NextResponse.json(
        { error: 'Access denied. Patient role required.' },
        { status: 403 }
      )
    }

    // Handle file upload and form data
    const { files, fields } = await handleFileUpload(request)

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    const uploadedFile = files[0] // Take the first file
    const { title, description, recordType } = fields

    // Validate required fields
    if (!title || !recordType) {
      return NextResponse.json(
        { error: 'Missing required fields: title, recordType' },
        { status: 400 }
      )
    }

    // Validate record type
    const validTypes = ['LAB_RESULTS', 'PRESCRIPTION', 'IMAGING', 'CONSULTATION', 'OTHER']
    if (!validTypes.includes(recordType)) {
      return NextResponse.json(
        { error: 'Invalid record type' },
        { status: 400 }
      )
    }

    // Validate file type and size
    if (!validateFileType(uploadedFile.mimeType)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: PDF, Images, Word documents, Text files' },
        { status: 400 }
      )
    }

    if (!validateFileSize(uploadedFile.size)) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB' },
        { status: 400 }
      )
    }

    // Save to database
    const record = await prisma.medicalRecord.create({
      data: {
        title,
        description: description || null,
        recordType: recordType as any,
        fileName: uploadedFile.originalName,
        fileUrl: uploadedFile.fileUrl,
        fileSize: uploadedFile.size,
        mimeType: uploadedFile.mimeType,
        patientId: user.userId
      }
    })

    return NextResponse.json(
      { 
        message: 'Medical record uploaded successfully',
        record
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Upload record error:', error)
    return handleMiddlewareError(error)
  }
}
