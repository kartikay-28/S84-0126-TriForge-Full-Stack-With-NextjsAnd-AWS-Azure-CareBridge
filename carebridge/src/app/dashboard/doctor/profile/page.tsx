'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import * as Dialog from '@radix-ui/react-dialog'
import LampToggle from '@/components/LampToggle'
import { useDoctorProfile } from '@/hooks/useDoctorProfile'
import { useDoctorDashboard } from '@/hooks/useDoctorDashboard'
import { useDoctorFileUpload } from '@/hooks/useDoctorFileUpload'
import DoctorFileUpload from '@/components/DoctorFileUpload'

interface User {
  name: string
  role: string
}

interface DoctorProfileData {
  // Level 1 - Must Fill
  specialization?: string
  experience?: number
  conditionsTreated?: string[]
  consultationMode?: string[]
  availability?: string

  // Level 2 - Recommended
  qualifications?: string[]
  clinicInfo?: {
    name: string
    address: string
    phone: string
  }
  consultationFee?: number
  languagesSpoken?: string[]

  // Level 3 - Advanced
  licenseDocument?: string
  bio?: string
}

export default function DoctorProfile() {
  const [user, setUser] = useState<User | null>(null)
  const [profileData, setProfileData] = useState<DoctorProfileData>({})
  const [activeLevel, setActiveLevel] = useState(1)
  const [completionPercentage, setCompletionPercentage] = useState(0)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadedLicenseFile, setUploadedLicenseFile] = useState<string | null>(null)
  const router = useRouter()

  // Profile hooks
  const { fetchBasicProfile, fetchRecommendedProfile, fetchAdvancedProfile, updateBasicProfile, updateRecommendedProfile, updateAdvancedProfile, isLoading, error } = useDoctorProfile()
  const { dashboardData, refetch } = useDoctorDashboard()

  // File upload hook
  const { uploadFile, isUploading } = useDoctorFileUpload()

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

    if (!token || userRole !== 'DOCTOR') {
      router.push('/auth/login')
      return
    }

    setUser({ name: userName || 'Doctor', role: userRole })
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
            specialization: profile.specialization,
            experience: profile.experienceYears,
            conditionsTreated: profile.conditionsTreated || [],
            consultationMode: profile.consultationMode ? [profile.consultationMode] : [],
            availability: profile.availability
          }))
          setProfileExists(prev => ({ ...prev, basic: true }))
        }

        // Fetch recommended profile data
        const recommendedResult = await fetchRecommendedProfile()
        if (recommendedResult.exists && recommendedResult.profile) {
          const profile = recommendedResult.profile
          setProfileData(prev => ({
            ...prev,
            qualifications: profile.qualifications || [],
            clinicInfo: {
              name: profile.clinicName || '',
              address: profile.clinicAddress || '',
              phone: profile.clinicPhone || ''
            },
            consultationFee: profile.consultationFee,
            languagesSpoken: profile.languagesSpoken || []
          }))
          setProfileExists(prev => ({ ...prev, recommended: true }))
        }

        // Fetch advanced profile data
        const advancedResult = await fetchAdvancedProfile()
        if (advancedResult.exists && advancedResult.profile) {
          const profile = advancedResult.profile
          setProfileData(prev => ({
            ...prev,
            licenseDocument: profile.licenseDocument || '',
            bio: profile.bio || ''
          }))

          // If there's a license document URL, extract the filename for display
          if (profile.licenseDocument) {
            const fileName = profile.licenseDocument.split('/').pop() || 'License Document'
            setUploadedLicenseFile(fileName)
          }

          setProfileExists(prev => ({ ...prev, advanced: true }))
        }
      } catch (error) {
        console.error('Failed to fetch profile data:', error)
      }
    }

    // Only fetch once when user is available
    fetchProfileData()
  }, [user]) // Remove the fetch functions from dependencies to prevent infinite loop

  const updateProfileData = (field: string, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveBasic = async () => {
    try {
      const basicData = {
        specialization: profileData.specialization,
        experienceYears: profileData.experience,
        conditionsTreated: profileData.conditionsTreated,
        consultationMode: profileData.consultationMode?.[0] || 'IN_PERSON', // Take first selected mode
        availability: profileData.availability
      }

      await updateBasicProfile(basicData)
      await refetch() // Refresh dashboard data
      setProfileExists(prev => ({ ...prev, basic: true }))
      alert('Professional information saved successfully!')
    } catch (error) {
      console.error('Failed to save basic profile:', error)
      alert('Failed to save profile. Please try again.')
    }
  }

  const handleSaveRecommended = async () => {
    try {
      const recommendedData = {
        qualifications: profileData.qualifications,
        clinicName: profileData.clinicInfo?.name,
        clinicAddress: profileData.clinicInfo?.address,
        clinicPhone: profileData.clinicInfo?.phone,
        consultationFee: profileData.consultationFee,
        languagesSpoken: profileData.languagesSpoken
      }

      await updateRecommendedProfile(recommendedData)
      await refetch() // Refresh dashboard data
      setProfileExists(prev => ({ ...prev, recommended: true }))
      alert('Practice details saved successfully!')
    } catch (error) {
      console.error('Failed to save recommended profile:', error)
      alert('Failed to save profile. Please try again.')
    }
  }

  const handleSaveAdvanced = async () => {
    try {
      const advancedData = {
        licenseDocument: profileData.licenseDocument,
        bio: profileData.bio
      }

      await updateAdvancedProfile(advancedData)
      await refetch() // Refresh dashboard data
      setProfileExists(prev => ({ ...prev, advanced: true }))
      alert('Advanced professional data saved successfully!')
    } catch (error) {
      console.error('Failed to save advanced profile:', error)
      alert('Failed to save profile. Please try again.')
    }
  }

  const handleUploadLicense = async (file: File, metadata: { title: string; description: string; recordType: string }) => {
    try {
      const result = await uploadFile(file, {
        ...metadata,
        recordType: 'license_document'
      })

      if (result.record && result.record.fileUrl) {
        // Update the license document URL in profile data
        setProfileData(prev => ({
          ...prev,
          licenseDocument: result.record.fileUrl
        }))
        setUploadedLicenseFile(result.record.fileName || file.name)
        setShowUploadModal(false)
        alert('License document uploaded successfully!')
      }
    } catch (error) {
      console.error('Failed to upload license:', error)
      alert('Failed to upload license document. Please try again.')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userName')
    localStorage.removeItem('userRole')
    router.push('/auth/login')
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
              onClick={() => router.push('/dashboard/doctor')}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </motion.button>
            <div>
              <h1 className="text-2xl font-bold text-emerald-400">Doctor Profile</h1>
              <p className="text-slate-400">Complete your professional profile to connect with patients</p>
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
            <span>Professional Info</span>
            <span>Practice Details</span>
            <span>Advanced Data</span>
          </div>
        </div>

        {/* Level Tabs */}
        <div className="flex gap-4 mb-8">
          {[
            { level: 1, title: 'Professional Info', color: 'emerald', required: true },
            { level: 2, title: 'Practice Details', color: 'yellow', required: false },
            { level: 3, title: 'Advanced Data', color: 'blue', required: false }
          ].map(({ level, title, color, required }) => (
            <motion.button
              key={level}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveLevel(level)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${activeLevel === level
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

        {/* Level 1 - Professional Info */}
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
                  <h3 className="text-lg font-semibold text-white">Professional Information</h3>
                  <p className="text-slate-400 text-sm">Required to unlock patient assignment and dashboard • Takes &lt; 1 minute</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Specialization */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Specialization <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={profileData.specialization || ''}
                    onChange={(e) => updateProfileData('specialization', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="">Select specialization</option>
                    <option value="general-medicine">General Medicine</option>
                    <option value="cardiology">Cardiology</option>
                    <option value="dermatology">Dermatology</option>
                    <option value="endocrinology">Endocrinology</option>
                    <option value="gastroenterology">Gastroenterology</option>
                    <option value="neurology">Neurology</option>
                    <option value="orthopedics">Orthopedics</option>
                    <option value="pediatrics">Pediatrics</option>
                    <option value="psychiatry">Psychiatry</option>
                    <option value="pulmonology">Pulmonology</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Years of Experience <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={profileData.experience || ''}
                    onChange={(e) => updateProfileData('experience', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Years of practice"
                  />
                </div>

                {/* Conditions Treated */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Conditions Treated <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={profileData.conditionsTreated?.join(', ') || ''}
                    onChange={(e) => updateProfileData('conditionsTreated', e.target.value.split(', '))}
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="e.g., Diabetes, Hypertension, Heart Disease, Anxiety, Depression (separate with commas)"
                  />
                </div>

                {/* Consultation Mode */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Consultation Modes <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { value: 'IN_PERSON_ONLY', label: 'In-person Only' },
                      { value: 'ONLINE_ONLY', label: 'Online Only' },
                      { value: 'BOTH', label: 'Both In-person & Online' }
                    ].map((mode) => (
                      <motion.button
                        key={mode.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => updateProfileData('consultationMode', [mode.value])}
                        className={`p-3 rounded-lg border transition-all ${profileData.consultationMode?.includes(mode.value)
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                          : 'bg-slate-900 border-slate-600 text-slate-300 hover:border-slate-500'
                          }`}
                      >
                        {mode.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    General Availability <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={profileData.availability || ''}
                    onChange={(e) => updateProfileData('availability', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="">Select availability</option>
                    <option value="weekdays">Weekdays (Mon-Fri)</option>
                    <option value="weekends">Weekends (Sat-Sun)</option>
                    <option value="all-week">All week</option>
                    <option value="flexible">Flexible schedule</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-400">
                    🔓 Unlocks: Patient assignment, Dashboard access, Doctor listing
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSaveBasic}
                    disabled={isLoading}
                    className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                  >
                    {isLoading ? 'Saving...' : profileExists.basic ? 'Update Professional Info' : 'Save Professional Info'}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Level 2 - Practice Details */}
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
                  <h3 className="text-lg font-semibold text-white">Practice Details</h3>
                  <p className="text-slate-400 text-sm">Better patient matching + professional credibility • You can complete this later</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Qualifications */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Qualifications & Certifications
                  </label>
                  <textarea
                    value={profileData.qualifications?.join('\n') || ''}
                    onChange={(e) => updateProfileData('qualifications', e.target.value.split('\n'))}
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="MBBS, MD, Board certifications, etc. (one per line)"
                  />
                </div>

                {/* Clinic Information */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Clinic/Hospital Information
                  </label>
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={profileData.clinicInfo?.name || ''}
                      onChange={(e) => updateProfileData('clinicInfo', { ...profileData.clinicInfo, name: e.target.value })}
                      placeholder="Clinic/Hospital name"
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                    <textarea
                      value={profileData.clinicInfo?.address || ''}
                      onChange={(e) => updateProfileData('clinicInfo', { ...profileData.clinicInfo, address: e.target.value })}
                      placeholder="Full address"
                      rows={2}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                    <input
                      type="tel"
                      value={profileData.clinicInfo?.phone || ''}
                      onChange={(e) => updateProfileData('clinicInfo', { ...profileData.clinicInfo, phone: e.target.value })}
                      placeholder="Clinic phone number"
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  </div>
                </div>

                {/* Consultation Fee */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Consultation Fee (USD)
                    </label>
                    <input
                      type="number"
                      value={profileData.consultationFee || ''}
                      onChange={(e) => updateProfileData('consultationFee', parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="e.g., 100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Languages Spoken
                    </label>
                    <input
                      type="text"
                      value={profileData.languagesSpoken?.join(', ') || ''}
                      onChange={(e) => updateProfileData('languagesSpoken', e.target.value.split(', '))}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="e.g., English, Spanish, French"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-400">
                    Optional but recommended for professional credibility
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
                  <h3 className="text-lg font-semibold text-white">Advanced Professional Data</h3>
                  <p className="text-slate-400 text-sm">Complete your professional credentials and detailed information</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* License Document Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Medical License Document
                  </label>

                  {profileData.licenseDocument || uploadedLicenseFile ? (
                    <div className="bg-slate-900 border border-slate-600 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div>
                            <p className="text-white font-medium">
                              {uploadedLicenseFile || 'License Document'}
                            </p>
                            <p className="text-slate-400 text-sm">Document uploaded successfully</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {profileData.licenseDocument && (
                            <motion.a
                              href={profileData.licenseDocument}
                              target="_blank"
                              rel="noopener noreferrer"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded text-sm transition-colors"
                            >
                              View
                            </motion.a>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowUploadModal(true)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            Replace
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => setShowUploadModal(true)}
                      className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-slate-500 transition-colors"
                    >
                      <svg className="w-12 h-12 text-slate-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-slate-300 font-medium mb-2">Upload Medical License</p>
                      <p className="text-slate-400 text-sm">Click to upload your medical license document</p>
                      <p className="text-slate-500 text-xs mt-2">Supported formats: PDF, JPG, PNG (Max 10MB)</p>
                    </div>
                  )}

                  <p className="text-xs text-slate-500 mt-2">Upload your medical license document for professional verification</p>
                </div>

                {/* Professional Bio */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Professional Biography
                  </label>
                  <textarea
                    value={profileData.bio || ''}
                    onChange={(e) => updateProfileData('bio', e.target.value)}
                    rows={8}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Write a detailed professional biography including your medical background, areas of expertise, approach to patient care, research interests, achievements, and any other relevant professional information..."
                  />
                  <p className="text-xs text-slate-500 mt-1">This will be visible to patients when they view your profile</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-400">
                    🩺 Enables advanced patient management and professional verification
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSaveAdvanced}
                    disabled={isLoading}
                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                  >
                    {isLoading ? 'Saving...' : profileExists.advanced ? 'Update Professional Data' : 'Save Professional Data'}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* License Upload Modal */}
      <Dialog.Root open={showUploadModal} onOpenChange={setShowUploadModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <Dialog.Title className="text-xl font-bold text-white mb-4">
              Upload Medical License
            </Dialog.Title>
            <Dialog.Description className="text-slate-400 mb-6">
              Upload your medical license document for professional verification
            </Dialog.Description>

            {/* File Upload Component */}
            <DoctorFileUpload onUpload={handleUploadLicense} isUploading={isUploading} />

            {/* Cancel Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowUploadModal(false)}
              disabled={isUploading}
              className="w-full bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white font-semibold py-3 rounded-lg transition-colors mt-4"
            >
              Cancel
            </motion.button>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
