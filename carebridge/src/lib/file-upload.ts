import { NextRequest } from 'next/server'

export interface UploadedFile {
  fileName: string
  originalName: string
  mimeType: string
  size: number
  fileUrl: string
}

export async function handleFileUpload(request: NextRequest): Promise<{
  files: UploadedFile[]
  fields: Record<string, string>
}> {
  try {
    const formData = await request.formData()
    const files: UploadedFile[] = []
    const fields: Record<string, string> = {}

    // Check if we're in production (Vercel) or development
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        const file = value as File
        
        // Generate unique filename
        const timestamp = Date.now()
        const randomString = Math.random().toString(36).substring(2, 15)
        const fileExtension = file.name.split('.').pop() || ''
        const fileName = `${timestamp}-${randomString}.${fileExtension}`

        if (isProduction) {
          // Use Vercel Blob in production
          const { put } = await import('@vercel/blob')
          const blob = await put(fileName, file, {
            access: 'public',
            addRandomSuffix: false
          })

          files.push({
            fileName,
            originalName: file.name,
            mimeType: file.type,
            size: file.size,
            fileUrl: blob.url
          })
        } else {
          // Use local file system in development
          const { writeFile, mkdir } = await import('fs/promises')
          const { existsSync } = await import('fs')
          const path = await import('path')

          const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'medical-records')
          if (!existsSync(uploadsDir)) {
            await mkdir(uploadsDir, { recursive: true })
          }

          const bytes = await file.arrayBuffer()
          const buffer = Buffer.from(bytes)
          const filePath = path.join(uploadsDir, fileName)
          const fileUrl = `/uploads/medical-records/${fileName}`

          await writeFile(filePath, buffer)

          files.push({
            fileName,
            originalName: file.name,
            mimeType: file.type,
            size: file.size,
            fileUrl
          })
        }
      } else {
        // Handle form fields
        fields[key] = value.toString()
      }
    }

    return { files, fields }
  } catch (error) {
    console.error('File upload error:', error)
    throw new Error('Failed to process file upload: ' + (error instanceof Error ? error.message : 'Unknown error'))
  }
}

export function validateFileType(mimeType: string): boolean {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
  return allowedTypes.includes(mimeType)
}

export function validateFileSize(size: number): boolean {
  const maxSize = 10 * 1024 * 1024 // 10MB
  return size <= maxSize
}