'use client'

import { useState, useCallback } from 'react'

interface UseProfileReturn {
  fetchBasicProfile: () => Promise<any>
  fetchRecommendedProfile: () => Promise<any>
  fetchAdvancedProfile: () => Promise<any>
  updateBasicProfile: (data: any) => Promise<any>
  updateRecommendedProfile: (data: any) => Promise<any>
  updateAdvancedProfile: (data: any) => Promise<any>
  isLoading: boolean
  error: string | null
}

export function useProfile(): UseProfileReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const makeRequest = useCallback(async (endpoint: string, method: 'GET' | 'POST' = 'POST', data?: any) => {
    setIsLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const options: RequestInit = {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }

      if (method === 'POST' && data) {
        options.headers = {
          ...options.headers,
          'Content-Type': 'application/json'
        }
        options.body = JSON.stringify(data)
      }

      const response = await fetch(`/api/profile/${endpoint}`, options)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Request failed')
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Request failed'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchBasicProfile = useCallback(async () => {
    return makeRequest('basic', 'GET')
  }, [makeRequest])

  const fetchRecommendedProfile = useCallback(async () => {
    return makeRequest('recommended', 'GET')
  }, [makeRequest])

  const fetchAdvancedProfile = useCallback(async () => {
    return makeRequest('advanced', 'GET')
  }, [makeRequest])

  const updateBasicProfile = useCallback(async (data: any) => {
    return makeRequest('basic', 'POST', data)
  }, [makeRequest])

  const updateRecommendedProfile = useCallback(async (data: any) => {
    return makeRequest('recommended', 'POST', data)
  }, [makeRequest])

  const updateAdvancedProfile = useCallback(async (data: any) => {
    return makeRequest('advanced', 'POST', data)
  }, [makeRequest])

  return {
    fetchBasicProfile,
    fetchRecommendedProfile,
    fetchAdvancedProfile,
    updateBasicProfile,
    updateRecommendedProfile,
    updateAdvancedProfile,
    isLoading,
    error
  }
}