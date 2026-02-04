import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleMiddlewareError } from '@/lib/middleware'
import { handleFileUpload, validateFileType, validateFileSize } from '@/lib/file-upload'

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

    // Handle file upload with doctor-documents directory
    const { files, fields } = await handleFileUpload(request, `doctor-documents/${user.userId}`)

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

    // Create file URL using public uploads path (same as patient records)
    // This allows direct browser access without authentication
    const fileUrl = `/uploads/doctor-documents/${user.userId}/${file.fileName}`

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