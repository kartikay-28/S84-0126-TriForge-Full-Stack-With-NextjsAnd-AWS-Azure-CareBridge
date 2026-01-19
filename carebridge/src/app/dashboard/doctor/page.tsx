'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  name: string
  role: string
}

export default function DoctorDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Middleware now handles authentication.
  useEffect(() => {
    // Middleware now handles authentication.
    // We only need to get user info for display purposes.
    const userName = localStorage.getItem('userName')
    const userRole = localStorage.getItem('userRole')

    // The middleware should have already redirected if the role is incorrect.
    if (userRole !== 'DOCTOR') {
      // This is a fallback, in case of inconsistent state.
      router.push('/auth/login')
      return
    }

    setUser({ name: userName || 'Doctor', role: userRole })
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userName')
    localStorage.removeItem('userRole')
    router.push('/auth/login')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="auth-gradient" aria-hidden />
      
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-sm font-bold">Dr</span>
            </div>
            <div>
              <h1 className="font-semibold">Welcome back, Dr. {user.name}</h1>
              <p className="text-sm text-slate-400">Doctor Dashboard</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 rounded-lg border border-white/10 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Patients Card */}
          <div className="glass-card border border-white/10 p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <h3 className="font-semibold">Patients</h3>
            </div>
            <p className="text-slate-300 text-sm mb-4">Manage your patient roster</p>
            <button className="w-full py-2 px-4 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg border border-emerald-500/30 transition-colors">
              View Patients
            </button>
          </div>

          {/* Appointments Card */}
          <div className="glass-card border border-white/10 p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-semibold">Schedule</h3>
            </div>
            <p className="text-slate-300 text-sm mb-4">Today's appointments</p>
            <button className="w-full py-2 px-4 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg border border-blue-500/30 transition-colors">
              View Schedule
            </button>
          </div>

          {/* Medical Records Card */}
          <div className="glass-card border border-white/10 p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold">Records</h3>
            </div>
            <p className="text-slate-300 text-sm mb-4">Patient medical records</p>
            <button className="w-full py-2 px-4 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg border border-purple-500/30 transition-colors">
              View Records
            </button>
          </div>

          {/* Analytics Card */}
          <div className="glass-card border border-white/10 p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <svg className="h-5 w-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold">Analytics</h3>
            </div>
            <p className="text-slate-300 text-sm mb-4">Practice insights</p>
            <button className="w-full py-2 px-4 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg border border-orange-500/30 transition-colors">
              View Analytics
            </button>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="mt-8 glass-card border border-white/10 p-6 rounded-2xl">
          <h3 className="font-semibold mb-4">Today's Schedule</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
                <div>
                  <p className="font-medium">Welcome to CareBridge!</p>
                  <p className="text-sm text-slate-400">Set up your practice profile and start managing patients</p>
                </div>
              </div>
              <span className="text-sm text-slate-400">Just now</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}