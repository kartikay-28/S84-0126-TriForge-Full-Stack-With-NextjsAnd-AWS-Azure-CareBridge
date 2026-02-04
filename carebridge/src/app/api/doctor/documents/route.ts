import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleMiddlewareError } from '@/lib/middleware'
import { handleFileUploadToBlob, validateFileType, validateFileSize } from '@/lib/file-upload'
import { prisma } from '@/lib/prisma'

// GET /api/doctor/documents - Get doctor's uploaded documents
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    if (user.role !== 'DOCTOR') {
      return NextResponse.json(
        { error: 'Access denied. Doctor role required.' },
        { status: 403 }
      )
    }

    // Get all documents from doctor profile (currently stored in licenseDocument field)
    // In the future, consider creating a separate DoctorDocument table for multiple files
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: user.userId },
      select: { licenseDocument: true }
    })

    const documents = []

    if (doctorProfile?.licenseDocument) {
      documents.push({
        id: 'license-document',
        title: 'Medical License',
        recordType: 'MEDICAL_LICENSE',
        fileUrl: doctorProfile.licenseDocument,
        uploadedAt: new Date().toISOString() // Note: actual upload date not tracked, using now
      })
    }

    return NextResponse.json({
      documents,
      count: documents.length
    })

  } catch (error) {
    console.error('Get doctor documents error:', error)
    return handleMiddlewareError(error)
  }
}

// POST /api/doctor/documents - Upload doctor documents (license, certificates, etc.)
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    if (user.role !== 'DOCTOR') {
      return NextResponse.json(
        { error: 'Access denied. Doctor role required.' },
        { status: 403 }
      )
    }

    // Handle file upload with Vercel Blob (always, not just in production)
    const { files, fields } = await handleFileUploadToBlob(request)

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    const file = files[0]
    const { title, description, recordType } = fields

    if (!title || !recordType) {
      return NextResponse.json(
        { error: 'Title and record type are required' },
        { status: 400 }
      )
    }

    // Validate file
    if (!validateFileType(file.mimeType)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: PDF, JPG, PNG, DOC, DOCX, TXT' },
        { status: 400 }
      )
    }

    if (!validateFileSize(file.size)) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }

    // Use the fileUrl from handleFileUpload (handles both local and Vercel Blob)
    const fileUrl = file.fileUrl

    // Save the license document URL to doctor profile (similar to how patient records work)
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: user.userId }
    })

    if (!doctorProfile) {
      return NextResponse.json(
        { error: 'Please complete your basic professional information first' },
        { status: 400 }
      )
    }

    // Update doctor profile with the license document URL
    await prisma.doctorProfile.update({
      where: { userId: user.userId },
      data: {
        licenseDocument: fileUrl
      }
    })

    // Return the upload result
    const result = {
      success: true,
      message: 'Document uploaded successfully',
      record: {
        id: file.fileName,
        title,
        description,
        recordType,
        fileName: file.fileName,
        fileSize: file.size,
        fileUrl: fileUrl,
        uploadedAt: new Date().toISOString()
      }
    }

    return NextResponse.json(result, { status: 201 })

  } catch (error) {
    console.error('Doctor document upload error:', error)
    return handleMiddlewareError(error)
  }
}