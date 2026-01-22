import { NextRequest } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

export interface UploadedFile {
  fileName: string
  originalName: string
  mimeType: string
  size: number
  filePath: string
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

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'medical-records')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        // Handle file upload
        const file = value as File
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Generate unique filename
        const timestamp = Date.now()
        const randomString = Math.random().toString(36).substring(2, 15)
        const fileExtension = path.extname(file.name)
        const fileName = `${timestamp}-${randomString}${fileExtension}`
        const filePath = path.join(uploadsDir, fileName)
        const fileUrl = `/uploads/medical-records/${fileName}`

        // Write file to disk
        await writeFile(filePath, buffer)

        files.push({
          fileName,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          filePath,
          fileUrl
        })
      } else {
        // Handle form fields
        fields[key] = value.toString()
      }
    }

    return { files, fields }
  } catch (error) {
    console.error('File upload error:', error)
    throw new Error('Failed to process file upload')
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