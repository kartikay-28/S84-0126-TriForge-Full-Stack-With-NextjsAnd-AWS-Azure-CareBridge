'use client'

import { useState } from 'react'

interface UseProfileReturn {
  updateBasicProfile: (data: any) => Promise<any>
  updateRecommendedProfile: (data: any) => Promise<any>
  updateAdvancedProfile: (data: any) => Promise<any>
  isLoading: boolean
  error: string | null
}

export function useProfile(): UseProfileReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const makeRequest = async (endpoint: string, data: any) => {
    setIsLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`/api/profile/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Profile update failed')
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Profile update failed'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const updateBasicProfile = async (data: any) => {
    return makeRequest('basic', data)
  }

  const updateRecommendedProfile = async (data: any) => {
    return makeRequest('recommended', data)
  }

  const updateAdvancedProfile = async (data: any) => {
    return makeRequest('advanced', data)
  }

  return {
    updateBasicProfile,
    updateRecommendedProfile,
    updateAdvancedProfile,
    isLoading,
    error
  }
}