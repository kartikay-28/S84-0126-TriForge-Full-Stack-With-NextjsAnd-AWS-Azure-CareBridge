'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import * as Toast from '@radix-ui/react-toast'
import AuthFlipWrapper from '../AuthFlipWrapper'
import ThemeToggle from '@/components/ThemeToggle'
import Logo from '@/components/Logo'

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState({ type: 'success' as 'success' | 'error', text: '' })
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginForm>({
    mode: 'onChange'
  })

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text })
    setToastOpen(true)
  }

  const onSubmit = async (data: LoginForm) => {
    // Validate the data manually
    const validation = loginSchema.safeParse(data)
    if (!validation.success) {
      const firstError = validation.error.issues[0]
      showToast('error', firstError.message)
      return
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        // Success - store token and user info
        localStorage.setItem('token', result.token)
        localStorage.setItem('userRole', result.role)
        localStorage.setItem('userName', result.name)

        showToast('success', `Welcome back, ${result.name}! Redirecting to your ${result.role.toLowerCase()} dashboard...`)
        
        // Redirect based on role
        setTimeout(() => {
          if (result.role === 'DOCTOR') {
            router.push('/dashboard/doctor')
          } else {
            router.push('/dashboard/patient')
          }
        }, 1500)
      } else {
        showToast('error', result.error || 'Login failed. Please try again.')
      }
    } catch (error) {
      showToast('error', 'Network error. Please check your connection and try again.')
    }
  }

  return (
    <AuthFlipWrapper flipKey="login">
      <Toast.Provider swipeDirection="right">
        <motion.main 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen bg-slate-900 text-white flex items-center justify-center px-6"
          style={{ background: 'var(--background)', color: 'var(--foreground)' }}
        >
          {/* Theme Toggle - Fixed Position */}
          <div className="fixed top-6 right-6 z-50">
            <ThemeToggle />
          </div>
          
          <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Side - Welcome Content */}
            <motion.div 
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              {/* Logo */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-3"
              >
                <Logo size="lg" />
                <span className="text-2xl font-bold">CareBridge</span>
              </motion.div>

              <div className="space-y-6">
                <motion.h1 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-4xl lg:text-5xl font-bold text-white"
                >
                  Welcome back
                </motion.h1>
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-slate-400 text-lg leading-relaxed max-w-md"
                >
                  Sign in to access your health dashboard
                </motion.p>
              </div>

              {/* Feature Cards */}
              <motion.div 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="space-y-4 max-w-md"
              >
                <motion.div 
                  whileHover={{ scale: 1.02, x: 10 }}
                  className="clean-card p-4 flex items-center gap-4"
                >
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-emerald-400">🔒</span>
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">End-to-end encrypted</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.02, x: 10 }}
                  className="clean-card p-4"
                >
                  <p className="text-slate-300 text-sm text-center">
                    Trusted by healthcare professionals worldwide
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right Side - Login Form */}
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="max-w-md mx-auto w-full"
            >
              <motion.form 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                onSubmit={handleSubmit(onSubmit)} 
                className="space-y-6"
              >
                <div className="space-y-4">
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    className="group"
                  >
                    <input
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: { value: /^\S+@\S+$/i, message: 'Please enter a valid email address' }
                      })}
                      type="email"
                      placeholder="you@example.com"
                      className="clean-input"
                      disabled={isSubmitting}
                    />
                    <AnimatePresence>
                      {errors.email && (
                        <motion.p 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-red-400 text-sm mt-1"
                        >
                          {errors.email.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    className="relative group"
                  >
                    <input
                      {...register('password', { 
                        required: 'Password is required'
                      })}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="clean-input pr-12"
                      disabled={isSubmitting}
                    />
                    <motion.button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-emerald-400 transition-all duration-300"
                      disabled={isSubmitting}
                    >
                      <AnimatePresence mode="wait">
                        {showPassword ? (
                          <motion.svg 
                            key="hide"
                            initial={{ opacity: 0, rotate: 180 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, rotate: -180 }}
                            className="w-5 h-5" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          </motion.svg>
                        ) : (
                          <motion.svg 
                            key="show"
                            initial={{ opacity: 0, rotate: 180 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, rotate: -180 }}
                            className="w-5 h-5" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </motion.svg>
                        )}
                      </AnimatePresence>
                    </motion.button>
                    <AnimatePresence>
                      {errors.password && (
                        <motion.p 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-red-400 text-sm mt-1"
                        >
                          {errors.password.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>

                <motion.button 
                  type="submit" 
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSubmitting}
                  className="cta-button w-full"
                >
                  <AnimatePresence mode="wait">
                    {isSubmitting ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <motion.svg 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="h-5 w-5" 
                          fill="none" 
                          viewBox="0 0 24 24"
                        >
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </motion.svg>
                        <span>Signing in...</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="submit"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <span>Sign In</span>
                        <motion.span
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          →
                        </motion.span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </motion.form>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-slate-400 text-center mt-6"
              >
                Don't have an account?{" "}
                <motion.a
                  href="/auth/signup"
                  whileHover={{ scale: 1.05 }}
                  className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
                >
                  Create account
                </motion.a>
              </motion.p>
            </motion.div>
          </div>
        </motion.main>

        {/* Toast Notifications */}
        <Toast.Root
          className={`${
            toastMessage.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          } rounded-xl border p-4 shadow-lg`}
          open={toastOpen}
          onOpenChange={setToastOpen}
        >
          <Toast.Title className="font-semibold mb-1">
            {toastMessage.type === 'success' ? 'Success!' : 'Error'}
          </Toast.Title>
          <Toast.Description className="text-sm">
            {toastMessage.text}
          </Toast.Description>
        </Toast.Root>
        <Toast.Viewport className="fixed bottom-0 right-0 flex flex-col p-6 gap-2 w-96 max-w-[100vw] m-0 list-none z-50" />
      </Toast.Provider>
    </AuthFlipWrapper>
  );
}