import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'

// DELETE /api/patient/records/[recordId] - Delete a medical record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ recordId: string }> }
) {
  try {
    const { recordId } = await params
    
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    
    let payload
    try {
      payload = verifyToken(token)
    } catch (error) {
      console.error('Token verification failed:', error)
      return NextResponse.json(
        { error: 'Invalid or expired token. Please login again.' },
        { status: 401 }
      )
    }

    if (payload.role !== 'PATIENT') {
      return NextResponse.json(
        { error: 'Access denied. Patient role required.' },
        { status: 403 }
      )
    }

    // Find the record to delete
    const record = await prisma.medicalRecord.findFirst({
      where: {
        id: recordId,
        patientId: payload.userId
      }
    })

    if (!record) {
      return NextResponse.json(
        { error: 'Record not found or access denied' },
        { status: 404 }
      )
    }

    // Delete the file from storage
    await deleteFileFromStorage(record.fileUrl)

    // Delete the record from database
    await prisma.medicalRecord.delete({
      where: {
        id: recordId
      }
    })

    return NextResponse.json({
      message: 'Medical record deleted successfully'
    })
  } catch (error) {
    console.error('Delete record error:', error)
    return NextResponse.json(
      { error: 'Failed to delete medical record' },
      { status: 500 }
    )
  }
}

// Helper function to delete file from storage
async function deleteFileFromStorage(fileUrl: string) {
  try {
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL

    if (isProduction && fileUrl.includes('blob.vercel-storage.com')) {
      // Delete from Vercel Blob
      const { del } = await import('@vercel/blob')
      await del(fileUrl)
      console.log('File deleted from Vercel Blob:', fileUrl)
    } else if (fileUrl.startsWith('/uploads/')) {
      // Delete from local file system
      const { unlink } = await import('fs/promises')
      const path = await import('path')
      
      const filePath = path.join(process.cwd(), 'public', fileUrl)
      try {
        await unlink(filePath)
        console.log('File deleted from local storage:', filePath)
      } catch (error) {
        console.warn('Could not delete local file:', filePath, error)
        // Don't throw error if file doesn't exist locally
      }
    }
  } catch (error) {
    console.error('Error deleting file from storage:', error)
    // Don't throw error - we still want to delete the database record
  }
}