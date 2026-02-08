'use client'

import { useState, useEffect } from 'react'

interface DoctorDashboardData {
  profileLevel: number
  sectionVisibility: {
    [key: string]: {
      visible: boolean
      message: string | null
    }
  }
  nextRecommendedStep: string
  sections: any
  recentRecords?: any[]
}

interface UseDoctorDashboardReturn {
  dashboardData: DoctorDashboardData | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  refetchSilent: () => Promise<void>
}

export function useDoctorDashboard(): UseDoctorDashboardReturn {
  const [dashboardData, setDashboardData] = useState<DoctorDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboard = async (setLoading: boolean) => {
    try {
      if (setLoading) {
        setIsLoading(true)
      }
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch('/api/doctor/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch dashboard data')
      }

      setDashboardData(result)
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data'
      setError(errorMessage)
      console.error('Doctor dashboard fetch error:', err)
    } finally {
      if (setLoading) {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchDashboard(true)
  }, [])

  const refetch = async () => {
    setIsLoading(true)
    await fetchDashboard(false)
    setIsLoading(false)
  }

  const refetchSilent = async () => {
    await fetchDashboard(false)
  }

  return {
    dashboardData,
    isLoading,
    error,
    refetch,
    refetchSilent
  }
}