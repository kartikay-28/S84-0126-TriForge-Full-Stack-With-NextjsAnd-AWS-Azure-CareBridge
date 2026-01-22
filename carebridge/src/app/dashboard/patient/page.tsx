'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import * as Dialog from '@radix-ui/react-dialog'
import { createPortal } from 'react-dom'
import ThemeToggle from '@/components/ThemeToggle'
import Logo from '@/components/Logo'
import FileUpload from '@/components/FileUpload'
import { useFileUpload } from '@/hooks/useFileUpload'

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
  const router = useRouter()

  // File upload hook
  const { uploadFile, isUploading, error: uploadError } = useFileUpload()

  useEffect(() => {
    setMounted(true)
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
  }, [router])

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

  const handleUploadRecord = async (file: File, metadata: { title: string; description: string; recordType: string }) => {
    try {
      await uploadFile(file, metadata)
      setShowUploadModal(false)
      // TODO: Refresh records list
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
    <div className="min-h-screen bg-slate-900 text-white flex dashboard-container" style={{ position: 'relative', overflow: 'visible' }}>
      {/* Sidebar */}
      <div className="w-64 bg-slate-800/50 border-r border-slate-700/50 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <Logo size="md" />
            <span className="text-xl font-bold">CareBridge</span>
          </div>
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
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="p-6 border-b border-slate-700/50 relative" style={{ zIndex: 1000 }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-emerald-400">{user.name}</h1>
              <p className="text-slate-400">Manage your health records and control who can access them</p>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
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
                          // TODO: Navigate to profile settings
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
          {activeTab === 'dashboard' && (
            <>
              {/* Health Metrics */}
              <div className="mb-8">
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-emerald-400">💚</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white">Your latest health metrics</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-900/60 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-400">Blood Pressure</span>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      </div>
                      <p className="text-lg font-semibold text-white">Normal</p>
                    </div>

                    <div className="bg-slate-900/60 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-400">Heart Rate</span>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      </div>
                      <p className="text-lg font-semibold text-white">Normal</p>
                    </div>

                    <div className="bg-slate-900/60 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-400">Last Checkup</span>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      </div>
                      <p className="text-lg font-semibold text-white">2024</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Medical Records */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-white">Medical Records</h3>
                  </div>
                  <p className="text-slate-400 text-sm mb-4">Total records stored</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowUploadModal(true)}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                  >
                    Upload Record
                  </motion.button>
                </motion.div>

                {/* Active Consents */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    </div>
                    <h3 className="font-semibold text-white">Active Consents</h3>
                  </div>
                  <p className="text-slate-400 text-sm mb-4">Doctors with access</p>
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
                  className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-white">Pending Requests</h3>
                  </div>
                  <p className="text-slate-400 text-sm mb-4">Awaiting your approval</p>
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
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-white">Messages</h3>
                    <a href="#" className="text-emerald-400 text-sm hover:text-emerald-300">View All →</a>
                  </div>

                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h4 className="font-medium text-white mb-2">No access granted yet</h4>
                    <p className="text-slate-400 text-sm">Grant access to doctors to share your records</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowGrantAccessModal(true)}
                      className="mt-4 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm transition-colors"
                    >
                      Grant Access
                    </motion.button>
                  </div>
                </div>

                {/* Records */}
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-white">View All</h3>
                    <button
                      onClick={() => setActiveTab('records')}
                      className="text-emerald-400 text-sm hover:text-emerald-300"
                    >
                      View All →
                    </button>
                  </div>

                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h4 className="font-medium text-white mb-2">No records yet</h4>
                    <p className="text-slate-400 text-sm">Your medical records will appear here</p>
                  </div>
                </div>
              </div>
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

              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8">
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
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
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

                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
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