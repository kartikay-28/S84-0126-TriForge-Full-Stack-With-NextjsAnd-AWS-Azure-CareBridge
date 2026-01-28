'use client'

import { useState, useEffect } from 'react'

interface DashboardData {
  profileLevel: number
  sectionVisibility: {
    [key: string]: {
      visible: boolean
      message: string | null
    }
  }
  nextRecommendedStep: string
  sections: any
}

interface UseDashboardReturn {
  dashboardData: DashboardData | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useDashboard(): UseDashboardReturn {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch('/api/patient/dashboard', {
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
      console.error('Dashboard fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  const refetch = async () => {
    setIsLoading(true)
    await fetchDashboard()
  }

  return {
    dashboardData,
    isLoading,
    error,
    refetch
  }
}