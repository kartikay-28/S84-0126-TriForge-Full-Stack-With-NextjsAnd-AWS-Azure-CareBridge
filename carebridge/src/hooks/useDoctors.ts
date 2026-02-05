import { useState, useEffect } from 'react'

interface Doctor {
  doctorId: string
  name: string
  degree: string | null
  specialization: string
  yearsOfExperience: number
  hospital: string | null
  consultationMode: string | null
  availability: string | null
  isCurrentlyAssigned: boolean
  matchReason?: string
}

interface DoctorsResponse {
  doctors: Doctor[]
  totalFound: number
  patientProblem?: string
}

interface RecommendedDoctorsResponse {
  recommendedDoctors: Doctor[]
  totalRecommendations: number
  patientConditions: string[]
  matchingCriteria: {
    primaryProblem: string | null
    symptoms: string[]
  }
}

export function useDoctors() {
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([])
  const [recommendedDoctors, setRecommendedDoctors] = useState<Doctor[]>([])
  const [isLoadingAll, setIsLoadingAll] = useState(false)
  const [isLoadingRecommended, setIsLoadingRecommended] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAllDoctors = async () => {
    setIsLoadingAll(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      console.log('Fetching all doctors...')
      const response = await fetch('/api/doctors', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('Doctors API response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Doctors API error:', errorText)
        if (response.status === 403) {
          throw new Error('Please complete your profile to view doctors')
        }
        throw new Error(`Failed to fetch doctors: ${response.status}`)
      }

      const data: DoctorsResponse = await response.json()
      console.log('Doctors API response data:', data)
      setAllDoctors(data.doctors || [])
    } catch (err) {
      console.error('Fetch all doctors error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch doctors')
      setAllDoctors([])
    } finally {
      setIsLoadingAll(false)
    }
  }

  const fetchRecommendedDoctors = async () => {
    setIsLoadingRecommended(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      console.log('Fetching recommended doctors...')
      const response = await fetch('/api/recommended-doctors', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('Recommended doctors API response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Recommended doctors API error:', errorText)
        if (response.status === 403) {
          throw new Error('Please complete your profile to get recommendations')
        }
        if (response.status === 400) {
          throw new Error('Please add medical conditions to your profile')
        }
        throw new Error(`Failed to fetch recommended doctors: ${response.status}`)
      }

      const data: RecommendedDoctorsResponse = await response.json()
      console.log('Recommended doctors API response data:', data)
      setRecommendedDoctors(data.recommendedDoctors || [])
    } catch (err) {
      console.error('Fetch recommended doctors error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch recommended doctors')
      setRecommendedDoctors([])
    } finally {
      setIsLoadingRecommended(false)
    }
  }

  const assignDoctor = async (doctorId: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch('/api/assign-doctor', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ doctorId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to assign doctor')
      }

      const result = await response.json()
      
      // Update local state to reflect assignment
      setAllDoctors(prev => prev.map(doctor => 
        doctor.doctorId === doctorId 
          ? { ...doctor, isCurrentlyAssigned: true }
          : doctor
      ))
      
      setRecommendedDoctors(prev => prev.map(doctor => 
        doctor.doctorId === doctorId 
          ? { ...doctor, isCurrentlyAssigned: true }
          : doctor
      ))

      return result
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to assign doctor')
    }
  }

  return {
    allDoctors,
    recommendedDoctors,
    isLoadingAll,
    isLoadingRecommended,
    error,
    fetchAllDoctors,
    fetchRecommendedDoctors,
    assignDoctor
  }
}