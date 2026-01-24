'use client'

import { useState } from 'react'

interface UploadMetadata {
    title: string
    description: string
    recordType: string
}

interface UseFileUploadReturn {
    uploadFile: (file: File, metadata: UploadMetadata) => Promise<any>
    deleteFile: (recordId: string) => Promise<void>
    isUploading: boolean
    isDeleting: boolean
    error: string | null
    success: boolean
}

export function useFileUpload(): UseFileUploadReturn {
    const [isUploading, setIsUploading] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const uploadFile = async (file: File, metadata: UploadMetadata) => {
        setIsUploading(true)
        setError(null)
        setSuccess(false)

        try {
            const token = localStorage.getItem('token')
            if (!token) {
                throw new Error('No authentication token found')
            }

            // Create FormData
            const formData = new FormData()
            formData.append('file', file)
            formData.append('title', metadata.title)
            formData.append('description', metadata.description)
            formData.append('recordType', metadata.recordType)

            // Upload to API
            const response = await fetch('/api/patient/records', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Upload failed')
            }

            setSuccess(true)
            return result
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Upload failed'
            setError(errorMessage)
            throw err
        } finally {
            setIsUploading(false)
        }
    }

    const deleteFile = async (recordId: string) => {
        setIsDeleting(true)
        setError(null)

        try {
            const token = localStorage.getItem('token')
            if (!token) {
                throw new Error('No authentication token found')
            }

            const response = await fetch(`/api/patient/records/${recordId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Delete failed')
            }

            return result
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Delete failed'
            setError(errorMessage)
            throw err
        } finally {
            setIsDeleting(false)
        }
    }

    return {
        uploadFile,
        deleteFile,
        isUploading,
        isDeleting,
        error,
        success
    }
}

// Test upload hook for debugging
export function useTestUpload() {
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const testUpload = async (file: File, metadata: UploadMetadata) => {
        setIsUploading(true)
        setError(null)

        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('title', metadata.title)
            formData.append('description', metadata.description)
            formData.append('recordType', metadata.recordType)

            const response = await fetch('/api/test-upload', {
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Test upload failed')
            }

            console.log('Test upload result:', result)
            return result
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Test upload failed'
            setError(errorMessage)
            console.error('Test upload error:', err)
            throw err
        } finally {
            setIsUploading(false)
        }
    }

    return {
        testUpload,
        isUploading,
        error
    }
}