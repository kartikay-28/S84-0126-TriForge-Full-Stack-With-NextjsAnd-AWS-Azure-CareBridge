import { NextRequest, NextResponse } from 'next/server'
import { handleFileUpload } from '@/lib/file-upload'

// POST /api/test-upload - Test file upload functionality
export async function POST(request: NextRequest) {
  try {
    console.log('Test upload endpoint called')
    
    const { files, fields } = await handleFileUpload(request)
    
    console.log('Files uploaded:', files)
    console.log('Form fields:', fields)

    return NextResponse.json({
      message: 'Test upload successful',
      files: files.map(file => ({
        fileName: file.fileName,
        originalName: file.originalName,
        size: file.size,
        mimeType: file.mimeType,
        fileUrl: file.fileUrl
      })),
      fields
    })
  } catch (error) {
    console.error('Test upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}

// GET /api/test-upload - Test endpoint info
export async function GET() {
  return NextResponse.json({
    message: 'Test upload endpoint',
    usage: 'POST multipart/form-data with file and form fields',
    maxFileSize: '10MB',
    allowedTypes: ['PDF', 'Images', 'Word documents', 'Text files']
  })
}