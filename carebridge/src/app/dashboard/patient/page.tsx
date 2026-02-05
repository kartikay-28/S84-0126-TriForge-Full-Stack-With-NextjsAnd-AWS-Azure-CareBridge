'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import * as Dialog from '@radix-ui/react-dialog'
import { createPortal } from 'react-dom'
import LampToggle from '@/components/LampToggle'
import Logo from '@/components/Logo'
import FileUpload from '@/components/FileUpload'
import { useFileUpload } from '@/hooks/useFileUpload'
import { useDashboard } from '@/hooks/useDashboard'
import { useDoctors } from '@/hooks/useDoctors'
import ProfileCompletionCard from '@/components/ProfileCompletionCard'
import SectionLock from '@/components/SectionLock'

interface User {
  name: string
  role: string
}

export default function PatientDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [showGrantAccessModal, setShowGrantAccessModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [doctorEmail, setDoctorEmail] = useState('')
  const [mounted, setMounted] = useState(false)
  const [records, setRecords] = useState<any[]>([])
  const [recordsLoading, setRecordsLoading] = useState(false)
  const [healthMetrics, setHealthMetrics] = useState<any[]>([])
  const [metricsLoading, setMetricsLoading] = useState(false)
  const [showUpdateBanner, setShowUpdateBanner] = useState(false)
  const router = useRouter()

  // File upload hook
  const { uploadFile, deleteFile, isUploading, isDeleting, error: uploadError } = useFileUpload()

  // Dashboard hook to get profile level and section visibility
  const { dashboardData, isLoading: dashboardLoading } = useDashboard()

  // Doctors hook to get all doctors and recommendations
  const { 
    allDoctors, 
    recommendedDoctors, 
    isLoadingAll, 
    isLoadingRecommended, 
    error: doctorsError,
    fetchAllDoctors,
    fetchRecommendedDoctors,
    assignDoctor
  } = useDoctors()

  useEffect(() => {
    setMounted(true)
    
    // Check if user has acknowledged the profile update
    const acknowledged = localStorage.getItem('profileUpdateAcknowledged')
    if (!acknowledged) {
      setShowUpdateBanner(true)
    }
  }, [])

  useEffect(() => {
    // Get user data from localStorage
    const token = localStorage.getItem('token')
    const userName = localStorage.getItem('userName')
    const userRole = localStorage.getItem('userRole')

    if (!token || userRole !== 'PATIENT') {
      router.push('/auth/login')
      return
    }

    setUser({ name: userName || 'Patient', role: userRole })

    // Only fetch records if user has sufficient profile level
    // We'll fetch records after dashboard data is loaded to check profile level
  }, [router])

  // Fetch records only when dashboard data is available and user has profile level 1+
  useEffect(() => {
    if (dashboardData && dashboardData.profileLevel >= 1) {
      fetchRecords()
    }
  }, [dashboardData])

  // Fetch health metrics when user has Level 3 profile
  useEffect(() => {
    if (dashboardData && dashboardData.profileLevel >= 3) {
      fetchHealthMetrics()
    }
  }, [dashboardData])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userName')
    localStorage.removeItem('userRole')
    router.push('/auth/login')
  }

  const handleGrantAccess = () => {
    // TODO: Implement grant access functionality
    console.log('Granting access to:', doctorEmail)
    setDoctorEmail('')
    setShowGrantAccessModal(false)
  }

  const handleDeleteRecord = async (recordId: string, recordTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${recordTitle}"? This action cannot be undone.`)) {
      return
    }

    try {
      await deleteFile(recordId)

      // Remove the record from local state
      setRecords(prev => prev.filter(record => record.id !== recordId))

      // Also refresh from server to ensure consistency
      await fetchRecords()

      alert('Medical record deleted successfully!')
    } catch (error) {
      console.error('Delete failed:', error)
      alert('Delete failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const fetchRecords = async () => {
    setRecordsLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('No token found')
        return
      }

      const response = await fetch('/api/patient/records', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setRecords(data.records || [])
      } else if (response.status === 403) {
        // Profile level not sufficient - this is expected for new users
        console.log('Records access requires higher profile level')
        setRecords([])
      } else {
        console.error('Failed to fetch records:', response.statusText)
        setRecords([])
      }
    } catch (error) {
      console.error('Error fetching records:', error)
      setRecords([])
    } finally {
      setRecordsLoading(false)
    }
  }

  const fetchHealthMetrics = async () => {
    setMetricsLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('No token found')
        return
      }

      const response = await fetch('/api/patient/health-metrics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setHealthMetrics(data.metrics || [])
      } else if (response.status === 403) {
        console.log('Health metrics access requires Level 3 profile')
        setHealthMetrics([])
      } else {
        console.error('Failed to fetch health metrics:', response.statusText)
        setHealthMetrics([])
      }
    } catch (error) {
      console.error('Error fetching health metrics:', error)
      setHealthMetrics([])
    } finally {
      setMetricsLoading(false)
    }
  }

  const handleUploadRecord = async (file: File, metadata: { title: string; description: string; recordType: string }) => {
    try {
      // Check if user has required profile level for uploading
      if (dashboardData && dashboardData.profileLevel < 1) {
        alert('Please complete your basic profile to upload medical records.')
        return
      }

      const result = await uploadFile(file, metadata)
      setShowUploadModal(false)

      // Add the new record to the local state immediately
      if (result.record) {
        setRecords(prev => [result.record, ...prev])
      }

      // Also refresh the records from server to ensure consistency
      await fetchRecords()

      alert('Medical record uploaded successfully!')
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
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
    <div className="min-h-screen bg-slate-900 text-white flex dashboard-container page-transition" style={{ position: 'relative', overflow: 'visible' }}>
      {/* Sidebar */}
      <div className="w-64 bg-slate-800/50 border-r border-slate-700/50 flex flex-col sidebar animate-slide-in-left">
        {/* Logo */}
        <div className="p-6 border-b border-slate-700/50">
          <motion.a
            href="/"
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3 hover-glow cursor-pointer"
          >
            <Logo size="md" />
            <span className="text-xl font-bold">CareBridge</span>
          </motion.a>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'dashboard'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
                Dashboard
              </motion.button>
            </li>
            <li>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('records')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'records'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                My Records
              </motion.button>
            </li>
            <li>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setActiveTab('doctors')
                  if (dashboardData && dashboardData.profileLevel >= 1) {
                    fetchAllDoctors()
                    fetchRecommendedDoctors()
                  }
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'doctors'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                All Doctors
              </motion.button>
            </li>
            <li>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('access')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'access'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
                Manage Access
              </motion.button>
            </li>
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-700/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">{user.name.charAt(0).toUpperCase()}</span>
            </div>
            <span className="font-medium">{user.name}</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 btn-secondary hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:text-red-400 dark:hover:border-red-800/30"
          >
            Logout
          </motion.button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col main-content animate-slide-in-right">
        {/* Header */}
        <header className="p-6 border-b border-slate-700/50 relative" style={{ zIndex: 1000 }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-emerald-400">{user.name}</h1>
              <p className="text-slate-400">Manage your health records and control who can access them</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center h-12">
                <LampToggle />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowGrantAccessModal(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Grant Access
              </motion.button>
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center"
                >
                  <span className="text-white font-bold">{user.name.charAt(0).toUpperCase()}</span>
                </motion.button>
              </div>

              {/* Profile Dropdown Portal - Renders at document body level */}
              {mounted && showProfileMenu && createPortal(
                <div
                  className="fixed inset-0"
                  style={{
                    zIndex: 999999,
                    pointerEvents: 'auto'
                  }}
                >
                  {/* Backdrop */}
                  <div
                    className="absolute inset-0"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}
                    onClick={() => setShowProfileMenu(false)}
                  />

                  {/* Dropdown Menu */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-48 py-2"
                    style={{
                      top: '80px',
                      right: '24px',
                      zIndex: 1000000,
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      backgroundColor: 'rgba(30, 41, 59, 0.98)',
                      border: '1px solid rgba(148, 163, 184, 0.2)'
                    }}
                  >
                    <div className="px-4 py-3 border-b border-slate-700">
                      <p className="font-semibold text-white">{user?.name || 'Patient'}</p>
                      <p className="text-xs text-slate-400 uppercase tracking-wide">{user?.role || 'PATIENT'}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false)
                          router.push('/dashboard/patient/profile')
                        }}
                        className="w-full text-left px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile Settings
                      </button>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false)
                          handleLogout()
                        }}
                        className="w-full text-left px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </motion.div>
                </div>,
                document.body
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6">
          {/* Profile Update Banner - Show only if not acknowledged and user has profile */}
          {showUpdateBanner && dashboardData && dashboardData.profileLevel > 0 && (
            <div className="mb-6 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-white">Profile Updated Successfully!</h3>
                  <p className="text-xs text-slate-300">Your profile has been updated with the new medical condition system. You can now access all features including doctor recommendations.</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    localStorage.setItem('profileUpdateAcknowledged', 'true')
                    setShowUpdateBanner(false)
                  }}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Got it!
                </motion.button>
              </div>
            </div>
          )}
          {activeTab === 'dashboard' && (
            <>
              {dashboardLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-3 text-slate-400">Loading dashboard...</span>
                </div>
              ) : !dashboardData || dashboardData.profileLevel === 0 ? (
                /* Profile Setup Required */
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-12 h-12 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">Welcome to CareBridge!</h2>
                  <p className="text-xl text-slate-300 mb-2">Please update your profile settings to get access to your full dashboard</p>
                  <p className="text-slate-400 mb-8 max-w-md">Complete your basic information to unlock features like doctor matching, health metrics, and secure messaging.</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push('/dashboard/patient/profile')}
                    className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors text-lg"
                  >
                    Complete Profile Setup
                  </motion.button>

                  <div className="mt-8 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <p className="text-sm text-slate-400">
                      ✨ Takes less than 2 minutes • Unlock all dashboard features
                    </p>
                  </div>
                </div>
              ) : (
                /* Full Dashboard - Profile Level 1+ */
                <>
                  {/* Profile Completion Card - Only show if not fully complete */}
                  {dashboardData.profileLevel < 3 && (
                    <div className="mb-8 animate-fade-in">
                      <ProfileCompletionCard
                        userType="patient"
                        completionPercentage={Math.round((dashboardData.profileLevel / 3) * 100)}
                        onComplete={() => router.push('/dashboard/patient/profile')}
                      />
                    </div>
                  )}

                  {/* Health Metrics */}
                  <div className="mb-8 animate-fade-in">
                    {dashboardData?.sectionVisibility?.healthMetrics?.visible ? (
                      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover-lift card-entrance">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center animate-pulse">
                            <span className="text-emerald-400">💚</span>
                          </div>
                          <h3 className="text-lg font-semibold text-white">Your latest health metrics</h3>
                          {metricsLoading && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500"></div>
                          )}
                        </div>

                        {metricsLoading ? (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="bg-slate-900/60 rounded-lg p-4 animate-pulse">
                                <div className="h-4 bg-slate-700 rounded mb-2"></div>
                                <div className="h-6 bg-slate-700 rounded"></div>
                              </div>
                            ))}
                          </div>
                        ) : healthMetrics.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {healthMetrics.map((metric, index) => (
                              <div key={metric.id} className={`bg-slate-900/60 rounded-lg p-4 hover-lift hover-glow animate-stagger-${index + 1}`}>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm text-slate-400">{metric.type}</span>
                                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    metric.status === 'normal' ? 'bg-green-500/20 text-green-400' :
                                    metric.status === 'high' ? 'bg-red-500/20 text-red-400' :
                                    metric.status === 'low' ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-slate-500/20 text-slate-400'
                                  }`}>
                                    {metric.status === 'normal' ? 'Healthy Range' :
                                     metric.status === 'high' ? 'Above Normal' :
                                     metric.status === 'low' ? 'Below Normal' :
                                     'No Status'}
                                  </div>
                                </div>
                                <p className="text-lg font-semibold text-white">
                                  {metric.value} {metric.unit}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                  Updated {new Date(metric.recordedAt).toLocaleDateString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                              <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                            </div>
                            <h4 className="font-medium text-white mb-2">No Health Metrics Yet</h4>
                            <p className="text-slate-400 text-sm mb-4">Complete your advanced profile to add vital signs</p>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => router.push('/dashboard/patient/profile')}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                            >
                              Add Vitals
                            </motion.button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <SectionLock
                        title="Health Metrics Locked"
                        message={dashboardData?.sectionVisibility?.healthMetrics?.message || "Complete your basic profile to unlock health metrics tracking"}
                        onUnlock={() => router.push('/dashboard/patient/profile')}
                        icon={
                          <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        }
                      />
                    )}
                  </div>

                  {/* Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Medical Records */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover-lift"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <h3 className="font-semibold text-white">Medical Records</h3>
                      </div>
                      <div className="mb-4">
                        <div className="text-2xl font-bold text-white mb-1">{records.length}</div>
                        <p className="text-slate-400 text-sm">Total records stored</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          if (dashboardData && dashboardData.profileLevel < 1) {
                            alert('Please complete your basic profile to upload medical records.')
                          } else {
                            setShowUploadModal(true)
                          }
                        }}
                        className={`w-full text-sm font-medium py-2 rounded-lg transition-colors ${dashboardData && dashboardData.profileLevel >= 1
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                          : 'bg-slate-600 hover:bg-slate-500 text-slate-300'
                          }`}
                      >
                        {dashboardData && dashboardData.profileLevel >= 1 ? 'Upload Record' : 'Complete Basic Profile to Upload'}
                      </motion.button>
                    </motion.div>

                    {/* Active Consents */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover-lift"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                          <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                        </div>
                        <h3 className="font-semibold text-white">Active Consents</h3>
                      </div>
                      <div className="mb-4">
                        <div className="text-2xl font-bold text-white mb-1">0</div>
                        <p className="text-slate-400 text-sm">Doctors with access</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveTab('access')}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                      >
                        Manage Access
                      </motion.button>
                    </motion.div>

                    {/* Pending Requests */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover-lift"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                          </svg>
                        </div>
                        <h3 className="font-semibold text-white">Pending Requests</h3>
                      </div>
                      <div className="mb-4">
                        <div className="text-2xl font-bold text-white mb-1">0</div>
                        <p className="text-slate-400 text-sm">Awaiting your approval</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                      >
                        Review Requests
                      </motion.button>
                    </motion.div>
                  </div>

                  {/* Bottom Sections */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Messages */}
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover-lift">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-semibold text-white">Messages</h3>
                        <a href="#" className="text-emerald-400 text-sm hover:text-emerald-300">View All →</a>
                      </div>

                      {dashboardData?.sectionVisibility?.messages?.visible ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </div>
                          <h4 className="font-medium text-white mb-2">No messages yet</h4>
                          <p className="text-slate-400 text-sm">Messages from your healthcare providers will appear here</p>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowGrantAccessModal(true)}
                            className="mt-4 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm transition-colors"
                          >
                            Grant Access to Doctors
                          </motion.button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </div>
                          <h4 className="font-medium text-white mb-2">Messages Locked</h4>
                          <p className="text-slate-400 text-sm">{dashboardData?.sectionVisibility?.messages?.message || "Complete your profile to unlock messaging with healthcare providers"}</p>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.push('/dashboard/patient/profile')}
                            className="mt-4 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm transition-colors"
                          >
                            Complete Profile
                          </motion.button>
                        </div>
                      )}
                    </div>

                    {/* Records */}
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover-lift">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-semibold text-white">Recent Records</h3>
                        <button
                          onClick={() => setActiveTab('records')}
                          className="text-emerald-400 text-sm hover:text-emerald-300"
                        >
                          View All →
                        </button>
                      </div>

                      {records.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <h4 className="font-medium text-white mb-2">No records yet</h4>
                          <p className="text-slate-400 text-sm">Your medical records will appear here</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {records.slice(0, 3).map((record, index) => (
                            <div key={record.id || index} className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-lg hover:bg-slate-900/80 transition-colors">
                              <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-white text-sm truncate">{record.title}</p>
                                <p className="text-slate-400 text-xs">
                                  {record.recordType?.replace('_', ' ') || 'Unknown Type'} • {
                                    record.uploadedAt
                                      ? new Date(record.uploadedAt).toLocaleDateString()
                                      : 'Recently uploaded'
                                  }
                                </p>
                              </div>
                              {record.fileUrl && (
                                <a
                                  href={record.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-400 hover:text-emerald-300 text-xs"
                                >
                                  View
                                </a>
                              )}
                            </div>
                          ))}
                          {records.length > 3 && (
                            <button
                              onClick={() => setActiveTab('records')}
                              className="w-full text-center py-2 text-emerald-400 hover:text-emerald-300 text-sm transition-colors"
                            >
                              View {records.length - 3} more records →
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {activeTab === 'records' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">My Medical Records</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowUploadModal(true)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Upload Record
                </motion.button>
              </div>

              {recordsLoading ? (
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 hover-lift">
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-400">Loading your records...</p>
                  </div>
                </div>
              ) : records.length === 0 ? (
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 hover-lift">
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mb-6">
                      <svg className="w-10 h-10 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">No medical records uploaded yet</h3>
                    <p className="text-slate-400 mb-6 max-w-md">Upload your medical records to keep them secure and easily accessible to authorized healthcare providers.</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowUploadModal(true)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                    >
                      Upload Your First Record
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {records.map((record, index) => (
                    <motion.div
                      key={record.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover-lift"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-white mb-1">{record.title}</h4>
                            {record.description && (
                              <p className="text-slate-400 text-sm mb-2">{record.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <span className="bg-slate-700 px-2 py-1 rounded">
                                {record.recordType?.replace('_', ' ') || 'Unknown Type'}
                              </span>
                              <span>{record.fileName}</span>
                              {record.fileSize && (
                                <span>{Math.round(record.fileSize / 1024)} KB</span>
                              )}
                              <span>
                                {record.uploadedAt
                                  ? new Date(record.uploadedAt).toLocaleDateString()
                                  : 'Recently uploaded'
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {record.fileUrl && (
                            <motion.a
                              href={record.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-sm rounded-lg transition-colors"
                            >
                              View
                            </motion.a>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
                          >
                            Share
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeleteRecord(record.id, record.title)}
                            disabled={isDeleting}
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors"
                          >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'access' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Manage Access</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowGrantAccessModal(true)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Grant New Access
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover-lift">
                  <h3 className="text-lg font-semibold text-white mb-4">Active Consents</h3>
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="font-medium text-white mb-2">No active consents</h4>
                    <p className="text-slate-400 text-sm">Doctors you've granted access to will appear here</p>
                  </div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover-lift">
                  <h3 className="text-lg font-semibold text-white mb-4">Pending Requests</h3>
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="font-medium text-white mb-2">No pending requests</h4>
                    <p className="text-slate-400 text-sm">Access requests from doctors will appear here</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'doctors' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">All Doctors</h2>
                <div className="text-sm text-slate-400">
                  {allDoctors.length} doctors available
                </div>
              </div>

              {dashboardData && dashboardData.profileLevel < 1 ? (
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 hover-lift">
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mb-6">
                      <svg className="w-10 h-10 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">Complete Your Profile</h3>
                    <p className="text-slate-400 mb-6 max-w-md">Please complete your basic profile to view and connect with doctors.</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => router.push('/dashboard/patient/profile')}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                    >
                      Complete Profile
                    </motion.button>
                  </div>
                </div>
              ) : (isLoadingAll || isLoadingRecommended) ? (
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 hover-lift">
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-400">Loading doctors...</p>
                  </div>
                </div>
              ) : doctorsError ? (
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 hover-lift">
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                      <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">Error Loading Doctors</h3>
                    <p className="text-slate-400 mb-6">{doctorsError}</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        fetchAllDoctors()
                        fetchRecommendedDoctors()
                      }}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                    >
                      Try Again
                    </motion.button>
                  </div>
                </div>
              ) : allDoctors.length === 0 ? (
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 hover-lift">
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mb-6">
                      <svg className="w-10 h-10 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">No Doctors Available</h3>
                    <p className="text-slate-400 mb-6">No doctors with completed profiles are currently available.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Recommended Doctors Section */}
                  {recommendedDoctors.length > 0 && (
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-white">Recommended for You</h3>
                        <div className="text-sm text-slate-400">
                          {recommendedDoctors.length} recommendations
                        </div>
                      </div>
                      <div className="bg-slate-800/30 border border-emerald-500/20 rounded-xl p-4 mb-6">
                        <p className="text-sm text-slate-300">
                          <span className="text-emerald-400 font-medium">✨ Personalized matches:</span> These doctors specialize in your medical conditions and are available to accept new patients.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {recommendedDoctors.map((doctor, index) => (
                          <DoctorCard 
                            key={doctor.doctorId} 
                            doctor={doctor} 
                            onAssign={assignDoctor}
                            index={index}
                            isRecommended={true}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* All Doctors Section */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-6 h-6 bg-slate-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-white">All Available Doctors</h3>
                      <div className="text-sm text-slate-400">
                        {allDoctors.length} doctors
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {allDoctors.map((doctor, index) => {
                        // Check if this doctor is in the recommended list
                        const isRecommended = recommendedDoctors.some(rec => rec.doctorId === doctor.doctorId)
                        return (
                          <DoctorCard 
                            key={doctor.doctorId} 
                            doctor={doctor} 
                            onAssign={assignDoctor}
                            index={index + recommendedDoctors.length}
                            isRecommended={isRecommended}
                          />
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Grant Access Modal */}
        <Dialog.Root open={showGrantAccessModal} onOpenChange={setShowGrantAccessModal}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
            <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md">
              <Dialog.Title className="text-xl font-bold text-white mb-4">
                Grant Doctor Access
              </Dialog.Title>
              <Dialog.Description className="text-slate-400 mb-6">
                Enter your doctor's email address to grant them access to your medical records.
              </Dialog.Description>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Doctor's Email
                  </label>
                  <input
                    type="email"
                    value={doctorEmail}
                    onChange={(e) => setDoctorEmail(e.target.value)}
                    placeholder="doctor@example.com"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGrantAccess}
                    disabled={!doctorEmail}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
                  >
                    Grant Access
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowGrantAccessModal(false)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-lg transition-colors"
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        {/* Upload Record Modal */}
        <Dialog.Root open={showUploadModal} onOpenChange={setShowUploadModal}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
            <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <Dialog.Title className="text-xl font-bold text-white mb-4">
                Upload Medical Record
              </Dialog.Title>
              <Dialog.Description className="text-slate-400 mb-6">
                Upload a new medical record to your secure health profile.
              </Dialog.Description>

              {/* Upload Error Display */}
              {uploadError && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-300 text-sm">{uploadError}</p>
                </div>
              )}

              {/* File Upload Component */}
              <FileUpload onUpload={handleUploadRecord} isUploading={isUploading} />

              {/* Cancel Button */}
              <div className="mt-6 pt-4 border-t border-slate-700">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowUploadModal(false)}
                  disabled={isUploading}
                  className="w-full bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Cancel
                </motion.button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </div>
  )
}

// Doctor Card Component
interface DoctorCardProps {
  doctor: {
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
  onAssign: (doctorId: string) => Promise<any>
  index: number
  isRecommended?: boolean
}

function DoctorCard({ doctor, onAssign, index, isRecommended = false }: DoctorCardProps) {
  const [isAssigning, setIsAssigning] = useState(false)

  const handleAssign = async () => {
    if (doctor.isCurrentlyAssigned) return
    
    setIsAssigning(true)
    try {
      await onAssign(doctor.doctorId)
      alert(`Successfully assigned to Dr. ${doctor.name}!`)
    } catch (error) {
      alert(`Failed to assign doctor: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsAssigning(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`bg-slate-800/50 border rounded-xl p-6 hover-lift ${
        isRecommended 
          ? 'border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-slate-800/50' 
          : 'border-slate-700/50'
      }`}
    >
      {isRecommended && (
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <span className="text-xs font-medium text-emerald-400">RECOMMENDED</span>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
            <span className="text-emerald-400 font-bold text-lg">
              {doctor.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-1">
              Dr. {doctor.name}
              {doctor.degree && (
                <span className="text-slate-400 text-sm font-normal ml-2">
                  {doctor.degree}
                </span>
              )}
            </h4>
            <p className="text-emerald-400 text-sm font-medium">{doctor.specialization}</p>
          </div>
        </div>
        
        {doctor.isCurrentlyAssigned && (
          <div className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full">
            Assigned
          </div>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{doctor.yearsOfExperience} years experience</span>
        </div>
        
        {doctor.hospital && (
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span>{doctor.hospital}</span>
          </div>
        )}
        
        {doctor.consultationMode && (
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>{doctor.consultationMode.replace('_', ' ')}</span>
          </div>
        )}
      </div>

      {doctor.matchReason && (
        <div className="mb-4 p-3 bg-slate-900/60 rounded-lg">
          <p className="text-xs text-slate-400 mb-1">Why recommended:</p>
          <p className="text-sm text-slate-300">{doctor.matchReason}</p>
        </div>
      )}

      <motion.button
        whileHover={{ scale: doctor.isCurrentlyAssigned ? 1 : 1.02 }}
        whileTap={{ scale: doctor.isCurrentlyAssigned ? 1 : 0.98 }}
        onClick={handleAssign}
        disabled={doctor.isCurrentlyAssigned || isAssigning}
        className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
          doctor.isCurrentlyAssigned
            ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
            : isAssigning
            ? 'bg-emerald-600 text-white cursor-wait'
            : 'bg-emerald-500 hover:bg-emerald-600 text-white'
        }`}
      >
        {doctor.isCurrentlyAssigned 
          ? 'Already Assigned' 
          : isAssigning 
          ? 'Assigning...' 
          : 'Assign Doctor'
        }
      </motion.button>
    </motion.div>
  )
}