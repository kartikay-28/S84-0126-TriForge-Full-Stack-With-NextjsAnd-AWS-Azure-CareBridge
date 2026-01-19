'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthFlipWrapper from '../AuthFlipWrapper'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        // Success - store token and user info
        localStorage.setItem('token', data.token)
        localStorage.setItem('userRole', data.role)
        localStorage.setItem('userName', data.name)

        setMessage({ type: 'success', text: `Welcome back, ${data.name}! Redirecting to your ${data.role.toLowerCase()} dashboard...` })
        
        // Redirect based on role
        setTimeout(() => {
          if (data.role === 'DOCTOR') {
            router.push('/dashboard/doctor')
          } else {
            router.push('/dashboard/patient')
          }
        }, 1500)
      } else {
        // Error
        setMessage({ type: 'error', text: data.error || 'Login failed. Please try again.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please check your connection and try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <AuthFlipWrapper flipKey="login">
      <main className="min-h-screen relative overflow-hidden bg-slate-950 text-white flex items-center justify-center px-4 py-12">
      <div className="auth-gradient" aria-hidden />
      <div className="floating-dots" aria-hidden />

      <div className="relative w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center glass-card border border-white/10 shadow-2xl px-6 py-8 md:px-10 md:py-12">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 text-emerald-300 px-3 py-1 text-xs font-semibold border border-emerald-500/20">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Secure & HIPAA-ready
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Welcome back to CareBridge
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Access your appointments, patient charts, and care teams in a
              beautifully simple workspace. Your data is protected with
              end-to-end security.
            </p>
          </div>
        </div>

        <div className="space-y-6 rounded-2xl bg-slate-900/50 border border-white/10 p-6 md:p-8 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Login</h2>
            <div className="shimmer-badge">New UI</div>
          </div>

          {/* Success/Error Message */}
          {message && (
            <div className={`p-4 rounded-lg border ${
              message.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}>
              <div className="flex items-center gap-2">
                {message.type === 'success' ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                <span className="text-sm">{message.text}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm text-slate-200">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="doctor@carebridge.com"
                className="fancy-input"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-200">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="fancy-input"
                required
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              className="cta-button"
              disabled={loading}
            >
              <span>{loading ? 'Logging in...' : 'Login'}</span>
              <span className="cta-glow" aria-hidden />
            </button>
          </form>

          <p className="text-sm text-slate-400 text-center">
            Don't have an account?{" "}
            <a
              href="/auth/signup"
              className="text-emerald-300 hover:text-emerald-200 underline-offset-4 hover:underline transition-colors"
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </main>
    </AuthFlipWrapper>
  );
}