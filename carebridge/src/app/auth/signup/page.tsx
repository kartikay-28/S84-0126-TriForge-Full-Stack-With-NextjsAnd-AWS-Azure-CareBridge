'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    // Basic validation
    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      setMessage({ type: 'error', text: 'Please fill in all fields.' })
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' })
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        // Success
        setMessage({ 
          type: 'success', 
          text: `Account created successfully! Welcome to CareBridge, ${formData.name}. Redirecting to login...` 
        })
        
        // Redirect to login after success
        setTimeout(() => {
          router.push('/auth/login')
        }, 2000)
      } else {
        // Error
        setMessage({ type: 'error', text: data.error || 'Signup failed. Please try again.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please check your connection and try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <AuthFlipWrapper flipKey="signup">
      <main className="min-h-screen relative overflow-hidden bg-slate-950 text-white flex items-center justify-center px-4 py-12">
        <div className="auth-gradient" aria-hidden />
        <div className="floating-dots" aria-hidden />

        <div className="relative w-full max-w-5xl grid lg:grid-cols-2 gap-10 items-center glass-card border border-white/10 shadow-2xl px-6 py-8 md:px-10 md:py-12">
          {/* Left */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 text-emerald-300 px-3 py-1 text-xs font-semibold border border-emerald-500/20">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Fast onboarding
            </div>

            <h1 className="text-3xl md:text-4xl font-bold">
              Create your CareBridge account
            </h1>

            <p className="text-slate-300 text-sm md:text-base">
              Secure collaboration between doctors and patients — built for
              real-world healthcare.
            </p>
          </div>
        </div>

        <div className="space-y-6 rounded-2xl bg-slate-900/50 border border-white/10 p-6 md:p-8 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Sign up</h2>
            <div className="shimmer-badge">Live sync</div>
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
              <label className="text-sm text-slate-200">Full Name</label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe" 
                className="fancy-input"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-200">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="user@carebridge.com"
                className="fancy-input"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-200">Role</label>
              <select 
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="fancy-input"
                required
                disabled={loading}
              >
                <option value="">Select role</option>
                <option value="PATIENT">Patient</option>
                <option value="DOCTOR">Doctor</option>
              </select>
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
                minLength={6}
              />
              <p className="text-xs text-slate-400">Minimum 6 characters</p>
            </div>

            <button 
              type="submit" 
              className="cta-button"
              disabled={loading}
            >
              <span>{loading ? 'Creating account...' : 'Sign up'}</span>
              <span className="cta-glow" aria-hidden />
            </button>
          </form>

            <p className="text-sm text-slate-400 text-center">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-emerald-300 hover:underline"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </main>
    </AuthFlipWrapper>
  );
}