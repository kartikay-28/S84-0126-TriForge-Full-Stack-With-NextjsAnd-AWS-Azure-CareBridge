'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useProfile } from '@/hooks/useProfile'
import { useDashboard } from '@/hooks/useDashboard'
import LampToggle from '@/components/LampToggle'


interface User {
  name: string
  role: string
}

interface ProfileData {
  // Level 1 - Must Fill
  age?: number
  gender?: string
  primaryProblem?: string
  symptoms?: string[]
  consultationPreference?: string
  
  // Level 2 - Recommended
  medicalHistory?: string
  currentMedications?: string[]
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  lifestyle?: {
    smoking: string
    drinking: string
    exercise: string
  }
  
  // Level 3 - Advanced
  healthMetrics?: any[]
  medicalReports?: any[]
}

export default function PatientProfile() {
  const [user, setUser] = useState<User | null>(null)
  const [profileData, setProfileData] = useState<ProfileData>({})
  const [activeLevel, setActiveLevel] = useState(1)
  const [completionPercentage, setCompletionPercentage] = useState(0)
  const router = useRouter()

  // Profile hooks
  const { fetchBasicProfile, fetchRecommendedProfile, fetchAdvancedProfile, updateBasicProfile, updateRecommendedProfile, updateAdvancedProfile, isLoading, error } = useProfile()
  const { dashboardData, refetch } = useDashboard()

  // Track if profile data exists (for showing Update vs Save)
  const [profileExists, setProfileExists] = useState({
    basic: false,
    recommended: false,
    advanced: false
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userName = localStorage.getItem('userName')
    const userRole = localStorage.getItem('userRole')

    if (!token || userRole !== 'PATIENT') {
      router.push('/auth/login')
      return
    }

    setUser({ name: userName || 'Patient', role: userRole })
  }, [router])

  useEffect(() => {
    if (dashboardData) {
      setCompletionPercentage(Math.round((dashboardData.profileLevel / 3) * 100))
    }
  }, [dashboardData])

  // Fetch existing profile data when component mounts (only once)
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return

      try {
        // Fetch basic profile data
        const basicResult = await fetchBasicProfile()
        if (basicResult.exists && basicResult.profile) {
          const profile = basicResult.profile
          setProfileData(prev => ({
            ...prev,
            age: profile.age,
            gender: profile.gender,
            primaryProblem: profile.primaryProblem,
            symptoms: profile.symptoms || [],
            consultationPreference: profile.consultationPreference
          }))
          setProfileExists(prev => ({ ...prev, basic: true }))
        }

        // Fetch recommended profile data
        const recommendedResult = await fetchRecommendedProfile()
        if (recommendedResult.exists && recommendedResult.profile) {
          const profile = recommendedResult.profile
          setProfileData(prev => ({
            ...prev,
            medicalHistory: profile.medicalHistory?.[0] || '',
            currentMedications: profile.currentMedications || [],
            emergencyContact: {
              name: profile.emergencyContactName || '',
              phone: profile.emergencyContactPhone || '',
              relationship: ''
            }
          }))
          setProfileExists(prev => ({ ...prev, recommended: true }))
        }

        // Fetch advanced profile data
        const advancedResult = await fetchAdvancedProfile()
        if (advancedResult.exists && advancedResult.profile) {
          const profile = advancedResult.profile
          setProfileData(prev => ({
            ...prev,
            healthMetrics: profile.healthMetrics || [],
            medicalReports: profile.medicalReports || []
          }))
          setProfileExists(prev => ({ ...prev, advanced: true }))
        }
      } catch (error) {
        console.error('Failed to fetch profile data:', error)
      }
    }

    // Only fetch once when user is available
    fetchProfileData()
  }, [user]) // Remove the fetch functions from dependencies to prevent infinite loop

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userName')
    localStorage.removeItem('userRole')
    router.push('/auth/login')
  }

  const updateProfileData = (field: string, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveBasic = async () => {
    try {
      const basicData = {
        age: profileData.age,
        gender: profileData.gender,
        primaryProblem: profileData.primaryProblem,
        symptoms: profileData.symptoms || [],
        consultationPreference: profileData.consultationPreference
      }

      await updateBasicProfile(basicData)
      await refetch() // Refresh dashboard data
      setProfileExists(prev => ({ ...prev, basic: true }))
      alert('Basic profile saved successfully!')
    } catch (error) {
      console.error('Failed to save basic profile:', error)
      alert('Failed to save profile. Please try again.')
    }
  }

  const handleSaveRecommended = async () => {
    try {
      const recommendedData = {
        medicalHistory: profileData.medicalHistory ? [profileData.medicalHistory] : [],
        currentMedications: profileData.currentMedications || [],
        emergencyContactName: profileData.emergencyContact?.name,
        emergencyContactPhone: profileData.emergencyContact?.phone
      }

      await updateRecommendedProfile(recommendedData)
      await refetch() // Refresh dashboard data
      setProfileExists(prev => ({ ...prev, recommended: true }))
      alert('Medical details saved successfully!')
    } catch (error) {
      console.error('Failed to save recommended profile:', error)
      alert('Failed to save profile. Please try again.')
    }
  }

  const handleSaveAdvanced = async () => {
    try {
      const advancedData = {
        healthMetrics: profileData.healthMetrics,
        medicalReports: profileData.medicalReports
      }

      await updateAdvancedProfile(advancedData)
      await refetch() // Refresh dashboard data
      setProfileExists(prev => ({ ...prev, advanced: true }))
      alert('Advanced data saved successfully!')
    } catch (error) {
      console.error('Failed to save advanced profile:', error)
      alert('Failed to save profile. Please try again.')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/dashboard/patient')}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </motion.button>
            <div>
              <h1 className="text-2xl font-bold text-emerald-400">Profile Settings</h1>
              <p className="text-slate-400">Complete your profile for better healthcare experience</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LampToggle />
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-300">Profile Completion</span>
            <span className="text-sm font-medium text-emerald-400">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <motion.div
              className="bg-emerald-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-400">
            <span>Basic Info</span>
            <span>Medical Details</span>
            <span>Advanced Data</span>
          </div>
        </div>

        {/* Level Tabs */}
        <div className="flex gap-4 mb-8">
          {[
            { level: 1, title: 'Essential Info', color: 'emerald', required: true },
            { level: 2, title: 'Medical Details', color: 'yellow', required: false },
            { level: 3, title: 'Advanced Data', color: 'blue', required: false }
          ].map(({ level, title, color, required }) => (
            <motion.button
              key={level}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveLevel(level)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeLevel === level
                  ? `bg-${color}-500/20 text-${color}-400 border border-${color}-500/30`
                  : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <div className="flex items-center gap-2">
                {required && <span className="w-2 h-2 bg-red-500 rounded-full" />}
                {title}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Level 1 - Essential Info */}
        {activeLevel === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-emerald-400 font-bold">1</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Essential Information</h3>
                  <p className="text-slate-400 text-sm">Required to unlock dashboard and doctor assignment • Takes &lt; 1 minute</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Age */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Age <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={profileData.age || ''}
                    onChange={(e) => updateProfileData('age', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Enter your age"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Gender <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={profileData.gender || ''}
                    onChange={(e) => updateProfileData('gender', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="">Select gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                    <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                  </select>
                </div>

                {/* Primary Problem */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Primary Health Concern <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={profileData.primaryProblem || ''}
                    onChange={(e) => updateProfileData('primaryProblem', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="e.g., Diabetes management, Heart condition, General checkup"
                  />
                </div>

                {/* Symptoms */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Current Symptoms <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={profileData.symptoms?.join(', ') || ''}
                    onChange={(e) => updateProfileData('symptoms', e.target.value.split(', ').filter(s => s.trim()))}
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="e.g., Headaches, Fatigue, Chest pain (separate with commas, max 3)"
                  />
                  <p className="text-xs text-slate-500 mt-1">List up to 3 symptoms, separated by commas</p>
                </div>

                {/* Consultation Preference */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Consultation Preference <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {[
                      { value: 'IN_PERSON', label: 'In-person' },
                      { value: 'VIDEO_CALL', label: 'Video call' },
                      { value: 'PHONE_CALL', label: 'Phone call' },
                      { value: 'CHAT', label: 'Chat/Messaging' }
                    ].map((option) => (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => updateProfileData('consultationPreference', option.value)}
                        className={`p-3 rounded-lg border transition-all ${
                          profileData.consultationPreference === option.value
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                            : 'bg-slate-900 border-slate-600 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        {option.label}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-400">
                    🔓 Unlocks: Doctor listing, Assignment, Dashboard access
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSaveBasic}
                    disabled={isLoading}
                    className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                  >
                    {isLoading ? 'Saving...' : profileExists.basic ? 'Update Essential Info' : 'Save Essential Info'}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Level 2 - Medical Details */}
        {activeLevel === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-400 font-bold">2</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Medical Details</h3>
                  <p className="text-slate-400 text-sm">Better matching + better care • You can complete this later</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Medical History */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Medical History
                  </label>
                  <textarea
                    value={profileData.medicalHistory || ''}
                    onChange={(e) => updateProfileData('medicalHistory', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="Previous surgeries, chronic conditions, allergies, family history..."
                  />
                </div>

                {/* Current Medications */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Current Medications
                  </label>
                  <textarea
                    value={profileData.currentMedications?.join(', ') || ''}
                    onChange={(e) => updateProfileData('currentMedications', e.target.value.split(', ').filter(m => m.trim()))}
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="e.g., Metformin 500mg, Lisinopril 10mg, Aspirin 81mg (separate with commas)"
                  />
                </div>

                {/* Emergency Contact */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Emergency Contact
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      value={profileData.emergencyContact?.name || ''}
                      onChange={(e) => updateProfileData('emergencyContact', {
                        ...profileData.emergencyContact,
                        name: e.target.value
                      })}
                      placeholder="Full name"
                      className="px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                    <input
                      type="tel"
                      value={profileData.emergencyContact?.phone || ''}
                      onChange={(e) => updateProfileData('emergencyContact', {
                        ...profileData.emergencyContact,
                        phone: e.target.value
                      })}
                      placeholder="Phone number"
                      className="px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                    <select 
                      value={profileData.emergencyContact?.relationship || ''}
                      onChange={(e) => updateProfileData('emergencyContact', {
                        ...profileData.emergencyContact,
                        relationship: e.target.value
                      })}
                      className="px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    >
                      <option value="">Relationship</option>
                      <option value="spouse">Spouse</option>
                      <option value="parent">Parent</option>
                      <option value="child">Child</option>
                      <option value="sibling">Sibling</option>
                      <option value="friend">Friend</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Lifestyle */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Lifestyle Information
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <span className="text-sm text-slate-400">Smoking</span>
                      <div className="flex gap-2">
                        {['Yes', 'No', 'Occasionally'].map((option) => (
                          <button
                            key={option}
                            onClick={() => updateProfileData('lifestyle', {
                              ...profileData.lifestyle,
                              smoking: option
                            })}
                            className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                              profileData.lifestyle?.smoking === option
                                ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
                                : 'bg-slate-900 border-slate-600 text-slate-300 hover:border-slate-500'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm text-slate-400">Drinking</span>
                      <div className="flex gap-2">
                        {['Yes', 'No', 'Socially'].map((option) => (
                          <button
                            key={option}
                            onClick={() => updateProfileData('lifestyle', {
                              ...profileData.lifestyle,
                              drinking: option
                            })}
                            className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                              profileData.lifestyle?.drinking === option
                                ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
                                : 'bg-slate-900 border-slate-600 text-slate-300 hover:border-slate-500'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm text-slate-400">Exercise</span>
                      <select 
                        value={profileData.lifestyle?.exercise || ''}
                        onChange={(e) => updateProfileData('lifestyle', {
                          ...profileData.lifestyle,
                          exercise: e.target.value
                        })}
                        className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      >
                        <option value="">Select frequency</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="rarely">Rarely</option>
                        <option value="never">Never</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-400">
                    Optional but recommended for better care
                  </div>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
                      Complete Later
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSaveRecommended}
                      disabled={isLoading}
                      className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                    >
                      {isLoading ? 'Saving...' : profileExists.recommended ? 'Update Details' : 'Save Details'}
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Level 3 - Advanced Data */}
        {activeLevel === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-blue-400 font-bold">3</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Advanced Data</h3>
                  <p className="text-slate-400 text-sm">AI insights, reports, analytics • Context-driven</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Health Metrics */}
                <div className="bg-slate-900/60 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <h4 className="font-semibold text-white">Health Metrics</h4>
                  </div>
                  <p className="text-slate-400 text-sm mb-4">Track vital signs and health indicators</p>
                  <div className="space-y-3">
                    {['Blood Pressure', 'Blood Sugar', 'Weight', 'Heart Rate'].map((metric) => (
                      <div key={metric} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                        <span className="text-slate-300">{metric}</span>
                        <button className="text-blue-400 text-sm hover:text-blue-300">Add</button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Medical Reports */}
                <div className="bg-slate-900/60 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h4 className="font-semibold text-white">Medical Reports</h4>
                  </div>
                  <p className="text-slate-400 text-sm mb-4">Upload lab results, scans, and reports</p>
                  <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
                    <svg className="w-8 h-8 text-slate-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-slate-400 text-sm">Drop files here or click to upload</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-400">
                    🧠 Enables AI insights and detailed analytics
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSaveAdvanced}
                    disabled={isLoading}
                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                  >
                    {isLoading ? 'Saving...' : profileExists.advanced ? 'Update Advanced Data' : 'Save Advanced Data'}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
