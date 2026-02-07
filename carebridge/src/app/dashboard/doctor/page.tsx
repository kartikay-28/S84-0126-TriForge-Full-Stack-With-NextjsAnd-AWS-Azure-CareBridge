'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import * as Dialog from '@radix-ui/react-dialog'
import { createPortal } from 'react-dom'
import LampToggle from '@/components/LampToggle'
import Logo from '@/components/Logo'
import { useDoctorDashboard } from '@/hooks/useDoctorDashboard'
import ProfileCompletionCard from '@/components/ProfileCompletionCard'

interface User {
  name: string
  role: string
}

export default function DoctorDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [showAddPatientModal, setShowAddPatientModal] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [patientEmail, setPatientEmail] = useState('')
  const [mounted, setMounted] = useState(false)
  const [assignedPatients, setAssignedPatients] = useState<any[]>([])
  const [patientsLoading, setPatientsLoading] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [doctorMessages, setDoctorMessages] = useState<any[]>([])
  const [doctorMessagesLoading, setDoctorMessagesLoading] = useState(false)
  const [doctorMessageInput, setDoctorMessageInput] = useState('')
  const [doctorMessagesError, setDoctorMessagesError] = useState<string | null>(null)
  const router = useRouter()

  // Dashboard hook to get profile level and section visibility
  const { dashboardData, isLoading: dashboardLoading } = useDoctorDashboard()

  const fetchAssignedPatients = async () => {
    setPatientsLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      const response = await fetch('/api/doctor/assigned-patients', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!response.ok) {
        setAssignedPatients([])
        return
      }
      const data = await response.json()
      setAssignedPatients(data.patients || [])
    } catch (err) {
      setAssignedPatients([])
    } finally {
      setPatientsLoading(false)
    }
  }

  // Fetch assigned patients on load and when switching tabs
  useEffect(() => {
    if (user && user.role === 'DOCTOR') {
      fetchAssignedPatients()
    }
  }, [user, activeTab])

  useEffect(() => {
    if (!selectedPatient && assignedPatients.length > 0) {
      setSelectedPatient(assignedPatients[0])
    }
  }, [assignedPatients, selectedPatient])

  const fetchDoctorMessages = async () => {
    if (!selectedPatient) return
    setDoctorMessagesLoading(true)
    setDoctorMessagesError(null)
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      const response = await fetch(`/api/doctor/messages?patientId=${selectedPatient.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!response.ok) {
        const errorData = await response.json()
        setDoctorMessagesError(errorData.error || 'Failed to fetch messages')
        setDoctorMessages([])
        return
      }
      const data = await response.json()
      setDoctorMessages(data.messages || [])
    } catch (err) {
      setDoctorMessagesError('Failed to fetch messages')
      setDoctorMessages([])
    } finally {
      setDoctorMessagesLoading(false)
    }
  }

  const handleSendDoctorMessage = async () => {
    const trimmed = doctorMessageInput.trim()
    if (!trimmed || !selectedPatient) return
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      setDoctorMessageInput('')
      const response = await fetch('/api/doctor/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ patientId: selectedPatient.id, content: trimmed })
      })
      if (!response.ok) {
        const errorData = await response.json()
        setDoctorMessagesError(errorData.error || 'Failed to send message')
        return
      }
      await fetchDoctorMessages()
    } catch (err) {
      setDoctorMessagesError('Failed to send message')
    }
  }

  useEffect(() => {
    if (!selectedPatient) {
      setDoctorMessages([])
      return
    }
    fetchDoctorMessages()
    const interval = setInterval(fetchDoctorMessages, 5000)
    return () => clearInterval(interval)
  }, [selectedPatient])

  useEffect(() => {
    setMounted(true)
  }, [])

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

  const handleLogout = () => {
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('userName')
      localStorage.removeItem('userRole')
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
      router.push('/auth/login')
    }
  }

  const handleRequestAccess = () => {
    // TODO: Implement patient access request
    console.log('Requesting access for:', patientEmail)
    setPatientEmail('')
    setShowRequestModal(false)
  }

  const handleAddPatient = () => {
    // TODO: Implement add patient functionality
    console.log('Adding patient:', patientEmail)
    setPatientEmail('')
    setShowAddPatientModal(false)
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center loading-screen">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white flex dashboard-container" style={{ position: 'relative', overflow: 'visible', background: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Sidebar */}
      <div className="w-64 glass-surface border-r flex flex-col" style={{ borderColor: 'var(--border-light)' }}>
        {/* Logo */}
        <div className="p-6 border-b" style={{ borderColor: 'var(--border-light)' }}>
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
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'dashboard' 
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
                onClick={() => setActiveTab('patients')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'patients' 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
                My Patients
              </motion.button>
            </li>
            <li>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('messages')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'messages' 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Messages
              </motion.button>
            </li>
            <li>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('records')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'records' 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Medical Records
              </motion.button>
            </li>
            <li>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('requests')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'requests' 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Consent Requests
              </motion.button>
            </li>
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">{user.name.charAt(0).toUpperCase()}</span>
            </div>
            <span className="font-medium">{user.name}</span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 btn-secondary hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:text-red-400 dark:hover:border-red-800/30"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="p-6 border-b" style={{ borderColor: 'var(--border-light)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-emerald-400">{user.name}</h1>
              <p className="text-slate-400">Here's an overview of your patients and recent activity</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center h-12">
                <LampToggle />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowRequestModal(true)}
                className="cta-button flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Request Access
              </motion.button>
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    console.log('Profile menu toggle clicked, current state:', showProfileMenu)
                    setShowProfileMenu(!showProfileMenu)
                  }}
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
                    onClick={() => {
                      console.log('Backdrop clicked, closing menu')
                      setShowProfileMenu(false)
                    }}
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
                      <p className="font-semibold text-white">Dr. {user?.name || 'Doctor'}</p>
                      <p className="text-xs text-slate-400 uppercase tracking-wide">{user?.role || 'DOCTOR'}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          console.log('Profile Settings clicked')
                          setShowProfileMenu(false)
                          router.push('/dashboard/doctor/profile')
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
                          console.log('Logout clicked')
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">Welcome to CareBridge, Doctor!</h2>
                  <p className="text-xl text-slate-300 mb-2">Please update your profile settings to get access to your full dashboard</p>
                  <p className="text-slate-400 mb-8 max-w-md">Complete your professional information to start accepting patients, accessing medical records, and managing appointments.</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push('/dashboard/doctor/profile')}
                    className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors text-lg"
                  >
                    Complete Professional Profile
                  </motion.button>
                  
                  <div className="mt-8 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <p className="text-sm text-slate-400">
                      🏥 Build credibility • Accept patients • Access medical records
                    </p>
                  </div>
                </div>
              ) : (
                /* Full Dashboard - Profile Level 1+ */
                <>
                  {/* Profile Completion Card - Only show if not fully complete */}
                  {dashboardData.profileLevel < 3 && (
                    <div className="mb-8">
                      <ProfileCompletionCard
                        userType="doctor"
                        completionPercentage={Math.round((dashboardData.profileLevel / 3) * 100)}
                        onComplete={() => router.push('/dashboard/doctor/profile')}
                      />
                    </div>
                  )}

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {/* Active Patients */}
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="stats-card p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-emerald-400 text-lg">👥</span>
                    </div>
                    <h3 className="font-semibold text-white">Active Patients</h3>
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">
                    {patientsLoading ? '...' : assignedPatients.length}
                  </p>
                  <p className="text-slate-400 text-sm">Assigned to you</p>
                  <button 
                    onClick={() => setActiveTab('patients')}
                    className="mt-3 text-emerald-400 text-sm hover:text-emerald-300 transition-colors"
                  >
                    View All →
                  </button>
                </motion.div>

                {/* Pending Requests */}
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="stats-card p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                    </div>
                    <h3 className="font-semibold text-white">Pending Requests</h3>
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">0</p>
                  <p className="text-slate-400 text-sm">Awaiting approval</p>
                  <button 
                    onClick={() => setActiveTab('requests')}
                    className="mt-3 text-yellow-400 text-sm hover:text-yellow-300 transition-colors"
                  >
                    Review →
                  </button>
                </motion.div>

                {/* Total Consents */}
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="stats-card p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-white">Total Consents</h3>
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">0</p>
                  <p className="text-slate-400 text-sm">Active access grants</p>
                  <button className="mt-3 text-blue-400 text-sm hover:text-blue-300 transition-colors">
                    Manage →
                  </button>
                </motion.div>

                {/* Recent Records */}
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="stats-card p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-white">Recent Records</h3>
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">0</p>
                  <p className="text-slate-400 text-sm">Accessed this week</p>
                  <button 
                    onClick={() => setActiveTab('records')}
                    className="mt-3 text-purple-400 text-sm hover:text-purple-300 transition-colors"
                  >
                    View Records →
                  </button>
                </motion.div>
              </div>

              {/* Bottom Sections */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Messages */}
                <div className="dashboard-card messages-card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-white">Recent Messages</h3>
                    <button 
                      onClick={() => setActiveTab('messages')}
                      className="text-emerald-400 text-sm hover:text-emerald-300"
                    >
                      View All →
                    </button>
                  </div>
                  
                  {doctorMessagesLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 empty-state-icon rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <h4 className="font-medium text-white mb-2">Loading messages...</h4>
                    </div>
                  ) : doctorMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 empty-state-icon rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <h4 className="font-medium text-white mb-2">No messages yet</h4>
                      <p className="text-slate-400 text-sm">Patient messages will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {doctorMessages.slice(-3).map((message) => (
                        <div key={message.id} className="flex items-start gap-3 p-3 bg-slate-900/60 rounded-lg">
                          <div className="w-9 h-9 bg-emerald-500/20 rounded-full flex items-center justify-center">
                            <span className="text-emerald-400 text-xs font-semibold">
                              {message.sentBy === 'DOCTOR'
                                ? 'ME'
                                : (selectedPatient?.name?.charAt(0).toUpperCase() || 'P')}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-slate-300 text-xs mb-1">
                              {message.sentBy === 'PATIENT'
                                ? `${selectedPatient?.name || 'Patient'} sent you a message`
                                : `You to ${selectedPatient?.name || 'patient'}`}
                            </p>
                            <p className="text-white text-sm truncate">{message.content}</p>
                            {message.createdAt && (
                              <p className="text-slate-400 text-xs mt-1">
                                {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Patients */}
                <div className="dashboard-card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-white">Recent Patients</h3>
                    <button 
                      onClick={() => setActiveTab('patients')}
                      className="text-emerald-400 text-sm hover:text-emerald-300"
                    >
                      View All →
                    </button>
                  </div>
                  
                  {patientsLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 empty-state-icon rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                        </svg>
                      </div>
                      <h4 className="font-medium text-white mb-2">Loading patients...</h4>
                    </div>
                  ) : assignedPatients.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 empty-state-icon rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                        </svg>
                      </div>
                      <h4 className="font-medium text-white mb-2">No patients yet</h4>
                      <p className="text-slate-400 text-sm">Patients will appear here when they grant you access</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {assignedPatients.slice(0, 3).map(patient => (
                        <div key={patient.id} className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-lg">
                          <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                            <span className="text-emerald-400 font-semibold">
                              {patient.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-white text-sm font-medium truncate">{patient.name}</p>
                            <p className="text-slate-400 text-xs truncate">{patient.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Records */}
                <div className="dashboard-card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-white">Recent Records</h3>
                    <button 
                      onClick={() => setActiveTab('records')}
                      className="text-emerald-400 text-sm hover:text-emerald-300"
                    >
                      View All →
                    </button>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 empty-state-icon rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h4 className="font-medium text-white mb-2">No records accessed yet</h4>
                    <p className="text-slate-400 text-sm">Patient records will appear here</p>
                  </div>
                </div>
              </div>

              {/* Appointments Section */}
              <div className="dashboard-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-white">Appointments</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-3 py-1 rounded-lg transition-colors"
                    >
                      Schedule New
                    </motion.button>
                  </div>
                </div>
                
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-16 h-16 empty-state-icon rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h4 className="font-medium text-white mb-2">No appointments scheduled</h4>
                  <p className="text-slate-400 text-sm mb-4">Your upcoming appointments will appear here</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-slate-700 hover:bg-slate-600 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                  >
                    Create Appointment
                  </motion.button>
                </div>
              </div>
                </>
              )}
            </>
          )}

          {activeTab === 'patients' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">My Patients</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowRequestModal(true)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Request Access
                </motion.button>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8">
                {patientsLoading ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mb-6">
                      <svg className="w-10 h-10 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">Loading patients...</h3>
                  </div>
                ) : assignedPatients.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mb-6">
                      <svg className="w-10 h-10 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">No patients assigned yet</h3>
                    <p className="text-slate-400 mb-6 max-w-md">Request access to patient records to view them here. Patients will receive a notification to approve your request.</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowRequestModal(true)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                    >
                      Request Patient Access
                    </motion.button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assignedPatients.map(patient => (
                      <div key={patient.id} className="bg-slate-900/60 rounded-lg p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                          <span className="text-emerald-400 font-bold text-lg">{patient.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-white mb-1">{patient.name}</h4>
                          <p className="text-slate-400 text-sm">{patient.email}</p>
                        </div>
                        <span className="bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full px-2 py-1">Assigned</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="messages-shell space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Messages</h2>
                  <p className="text-slate-400 text-sm">Coordinate care and follow-ups from one inbox</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Live updates
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Conversations List */}
                <div className="messages-panel messages-sidebar bg-slate-900/40 border border-slate-700/50 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Patients</h3>
                    <span className="text-xs text-slate-400">{assignedPatients.length} total</span>
                  </div>
                  {patientsLoading ? (
                    <p className="text-slate-400 text-sm">Loading patients...</p>
                  ) : assignedPatients.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <h4 className="font-medium text-white mb-2">No conversations yet</h4>
                      <p className="text-slate-400 text-sm">Assigned patients will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {assignedPatients.map(patient => (
                        <button
                          key={patient.id}
                          onClick={() => setSelectedPatient(patient)}
                          className={`w-full text-left p-3 rounded-xl border transition-colors ${selectedPatient?.id === patient.id
                            ? 'bg-emerald-500/15 border-emerald-500/40'
                            : 'bg-slate-900/60 border-slate-700/60 hover:bg-slate-900/80'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                              <span className="text-emerald-300 font-semibold">{patient.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-white text-sm font-medium truncate">{patient.name}</p>
                              <p className="text-slate-400 text-xs truncate">{patient.email}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Message Area */}
                <div className="messages-panel messages-thread lg:col-span-2 bg-slate-900/40 border border-slate-700/50 rounded-2xl overflow-hidden">
                  {!selectedPatient ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mb-6">
                        <svg className="w-10 h-10 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h2m-4 9h10a2 2 0 002-2V9a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-3">Select a patient to chat</h3>
                      <p className="text-slate-400 mb-6 max-w-md">Choose a patient from the left to start messaging.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col h-full">
                      <div className="messages-header flex items-center justify-between px-6 py-4 border-b border-slate-700/60 bg-slate-900/60">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                            <span className="text-emerald-300 font-semibold">{selectedPatient.name.charAt(0).toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="text-white font-semibold">{selectedPatient.name}</p>
                            <p className="text-slate-400 text-xs">{selectedPatient.email}</p>
                          </div>
                        </div>
                        <div className="text-xs text-slate-400">Auto-refreshing</div>
                      </div>
                      <div className="messages-scroll px-6 py-4 h-[420px] max-h-[420px] overflow-y-auto bg-gradient-to-b from-slate-900/40 to-slate-900/80">
                        {doctorMessagesLoading && doctorMessages.length === 0 ? (
                          <p className="text-slate-400 text-sm">Loading messages...</p>
                        ) : doctorMessages.length === 0 ? (
                          <div className="text-center py-10">
                            <p className="text-slate-300">No messages yet. Say hello!</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {doctorMessages.map((msg) => (
                              <div
                                key={msg.id}
                                className={`flex ${msg.sentBy === 'DOCTOR' ? 'justify-end' : 'justify-start'}`}
                              >
                                <div className={`message-bubble max-w-[75%] rounded-2xl px-4 py-3 text-sm ${msg.sentBy === 'DOCTOR'
                                  ? 'message-bubble-out bg-emerald-500/20 text-emerald-100 border border-emerald-500/30'
                                  : 'message-bubble-in bg-slate-800/80 text-slate-200 border border-slate-700/60'}`}
                                >
                                  <p>{msg.content}</p>
                                  {msg.createdAt && (
                                    <p className="messages-muted text-[10px] text-slate-400 mt-2">
                                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {doctorMessagesError && (
                        <p className="text-rose-400 text-xs px-6 pt-2">{doctorMessagesError}</p>
                      )}
                      <div className="messages-header px-6 py-4 border-t border-slate-700/60 bg-slate-900/60">
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            value={doctorMessageInput}
                            onChange={(e) => setDoctorMessageInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleSendDoctorMessage()
                              }
                            }}
                            placeholder="Type your message..."
                            className="messages-input flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handleSendDoctorMessage}
                            className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm transition-colors"
                          >
                            Send
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'records' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Medical Records</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowRequestModal(true)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search Records
                </motion.button>
              </div>
              
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8">
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">No medical records available</h3>
                  <p className="text-slate-400 mb-6 max-w-md">Medical records from patients who have granted you access will appear here. Request access to view patient records.</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowRequestModal(true)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                  >
                    Request Patient Access
                  </motion.button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Consent Requests</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowRequestModal(true)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Request
                </motion.button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Pending Requests</h3>
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="font-medium text-white mb-2">No pending requests</h4>
                    <p className="text-slate-400 text-sm">Your access requests to patients will appear here</p>
                  </div>
                </div>
                
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Approved Requests</h3>
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="font-medium text-white mb-2">No approved requests</h4>
                    <p className="text-slate-400 text-sm">Approved patient access will appear here</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Request Access Modal */}
        <Dialog.Root open={showRequestModal} onOpenChange={setShowRequestModal}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
            <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md">
              <Dialog.Title className="text-xl font-bold text-white mb-4">
                Request Patient Access
              </Dialog.Title>
              <Dialog.Description className="text-slate-400 mb-6">
                Enter the patient's email address to request access to their medical records.
              </Dialog.Description>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Patient Email
                  </label>
                  <input
                    type="email"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    placeholder="patient@example.com"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRequestAccess}
                    disabled={!patientEmail}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
                  >
                    Send Request
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowRequestModal(false)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-lg transition-colors"
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        {/* Add Patient Modal */}
        <Dialog.Root open={showAddPatientModal} onOpenChange={setShowAddPatientModal}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
            <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md">
              <Dialog.Title className="text-xl font-bold text-white mb-4">
                Add New Patient
              </Dialog.Title>
              <Dialog.Description className="text-slate-400 mb-6">
                Add a patient to your practice. They will receive an invitation to connect their records.
              </Dialog.Description>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Patient Email
                  </label>
                  <input
                    type="email"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    placeholder="patient@example.com"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddPatient}
                    disabled={!patientEmail}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
                  >
                    Add Patient
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAddPatientModal(false)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-lg transition-colors"
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </div>
  )
}