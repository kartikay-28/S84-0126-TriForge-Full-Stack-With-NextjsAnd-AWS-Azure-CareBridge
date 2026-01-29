import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleMiddlewareError } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // Verify authentication
    const user = await requireAuth(request)

    // Get file path from URL parameters
    const resolvedParams = await params
    const filePath = resolvedParams.path.join('/')
    
    // Security check - ensure path doesn't contain directory traversal
    if (filePath.includes('..') || filePath.includes('\\')) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 })
    }

    // Construct full file path
    const fullPath = join(process.cwd(), 'public', 'uploads', filePath)

    // Check if file exists
    if (!existsSync(fullPath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // For medical records, verify the user has access
    if (filePath.startsWith('medical-records/')) {
      // Check if this file belongs to the user
      const fileName = filePath.split('/').pop()
      
      if (user.role === 'PATIENT') {
        // Patients can access their own files
        const record = await prisma.medicalRecord.findFirst({
          where: {
            patientId: user.userId,
            fileName: { contains: fileName }
          }
        })

        if (!record) {
          return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }
      } else if (user.role === 'DOCTOR') {
        // Doctors can access files of patients who granted them access
        // TODO: Implement doctor access verification
        return NextResponse.json({ error: 'Doctor file access not implemented yet' }, { status: 403 })
      }
    }

    // Read and serve the file
    const fileBuffer = await readFile(fullPath)
    const mimeType = getMimeType(filePath)
    const fileName = filePath.split('/').pop()

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `inline; filename="${fileName}"`,
        'Cache-Control': 'private, max-age=3600'
      }
    })

  } catch (error) {
    console.error('File serving error:', error)
    return handleMiddlewareError(error)
  }
}

function getMimeType(filePath: string): string {
  const extension = filePath.split('.').pop()?.toLowerCase()
  
  switch (extension) {
    case 'pdf': return 'application/pdf'
    case 'jpg':
    case 'jpeg': return 'image/jpeg'
    case 'png': return 'image/png'
    case 'gif': return 'image/gif'
    case 'doc': return 'application/msword'
    case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    case 'txt': return 'text/plain'
    default: return 'application/octet-stream'
  }
}