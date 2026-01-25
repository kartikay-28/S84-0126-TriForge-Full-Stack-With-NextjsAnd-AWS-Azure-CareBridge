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
const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.string().min(1, 'Please select a role')
})

type SignupForm = z.infer<typeof signupSchema>

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState({ type: 'success' as 'success' | 'error', text: '' })
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isValid }
  } = useForm<SignupForm>({
    mode: 'onChange'
  })

  const watchedRole = watch('role')
  const watchedPassword = watch('password', '')

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text })
    setToastOpen(true)
  }

  const onSubmit = async (data: SignupForm) => {
    // Validate the data manually since we removed zodResolver
    const validation = signupSchema.safeParse(data)
    if (!validation.success) {
      const firstError = validation.error.issues[0]
      showToast('error', firstError.message)
      return
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        showToast('success', `Welcome to CareBridge, ${data.name}! Redirecting to login...`)
        setTimeout(() => router.push('/auth/login'), 2000)
      } else {
        showToast('error', result.error || 'Signup failed. Please try again.')
      }
    } catch (error) {
      showToast('error', 'Network error. Please check your connection and try again.')
    }
  }

  const passwordStrength = watchedPassword.length >= 6 ? 100 : (watchedPassword.length / 6) * 100

  return (
    <AuthFlipWrapper flipKey="signup">
      <Toast.Provider swipeDirection="right">
        <motion.main 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen bg-slate-900 text-white flex items-center justify-center px-6 py-8"
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
              <motion.a
                href="/"
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-3 hover-glow cursor-pointer"
              >
                <Logo size="lg" />
                <span className="text-2xl font-bold">CareBridge</span>
              </motion.a>

              <div className="space-y-6">
                <motion.h1 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-4xl lg:text-5xl font-bold text-emerald-400"
                >
                  Healthcare
                </motion.h1>
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-slate-300 text-lg leading-relaxed max-w-lg"
                >
                  Whether you're a patient taking control of your health records, or a 
                  doctor seeking seamless access to patient data — CareBridge has you 
                  covered.
                </motion.p>
              </div>

              {/* Feature Cards */}
              <motion.div 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="space-y-4 max-w-lg"
              >
                <motion.div 
                  whileHover={{ scale: 1.02, x: 10 }}
                  className="clean-card p-4 flex items-center gap-4"
                >
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-emerald-400">💚</span>
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">Store, manage, and share your health records securely</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.02, x: 10 }}
                  className="clean-card p-4 flex items-center gap-4"
                >
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-emerald-400">🔒</span>
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">Access patient records instantly with their consent</p>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right Side - Signup Form */}
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="max-w-md mx-auto w-full"
            >
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mb-8"
              >
                <p className="text-slate-400 text-center">
                  Start your journey to better health management
                </p>
              </motion.div>

              {/* Role Selection with improved animations */}
              <motion.div 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="grid grid-cols-2 gap-4 mb-8"
              >
                <motion.button
                  type="button"
                  onClick={() => setValue('role', 'PATIENT')}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className={`group p-6 rounded-xl border transition-all duration-300 ${
                    watchedRole === 'PATIENT'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/25'
                      : 'clean-card text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className="text-center">
                    <motion.div 
                      animate={{ rotate: watchedRole === 'PATIENT' ? [0, 10, -10, 0] : 0 }}
                      transition={{ duration: 0.5 }}
                      className="text-3xl mb-3"
                    >
                      💚
                    </motion.div>
                    <p className="font-semibold text-sm mb-1">Manage my records</p>
                    <p className="text-xs opacity-75">Patient Portal</p>
                  </div>
                </motion.button>
                
                <motion.button
                  type="button"
                  onClick={() => setValue('role', 'DOCTOR')}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className={`group p-6 rounded-xl border transition-all duration-300 ${
                    watchedRole === 'DOCTOR'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/25'
                      : 'clean-card text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className="text-center">
                    <motion.div 
                      animate={{ rotate: watchedRole === 'DOCTOR' ? [0, 10, -10, 0] : 0 }}
                      transition={{ duration: 0.5 }}
                      className="text-3xl mb-3"
                    >
                      🔒
                    </motion.div>
                    <p className="font-semibold text-sm mb-1">Access patient records</p>
                    <p className="text-xs opacity-75">Healthcare Provider</p>
                  </div>
                </motion.button>
              </motion.div>
              {errors.role && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm mb-4 text-center"
                >
                  {errors.role.message}
                </motion.p>
              )}

              <motion.form 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                onSubmit={handleSubmit(onSubmit)} 
                className="space-y-4"
              >
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  className="group"
                >
                  <input
                    {...register('name', { 
                      required: 'Name is required',
                      minLength: { value: 2, message: 'Name must be at least 2 characters' }
                    })}
                    placeholder={watchedRole === 'DOCTOR' ? 'Dr. John Doe' : 'John Smith'}
                    className="clean-input"
                    disabled={isSubmitting}
                  />
                  <AnimatePresence>
                    {errors.name && (
                      <motion.p 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-red-400 text-sm mt-1"
                      >
                        {errors.name.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

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
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' }
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
                  
                  {/* Password Strength Indicator */}
                  <div className="flex items-center mt-2">
                    <div className="h-1 flex-1 bg-slate-700 rounded-full mr-2 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${passwordStrength}%` }}
                        transition={{ duration: 0.3 }}
                        className={`h-full transition-colors duration-300 ${
                          passwordStrength >= 100 ? 'bg-emerald-500' : 
                          passwordStrength >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                      />
                    </div>
                    <motion.p 
                      animate={{ 
                        color: passwordStrength >= 100 ? '#10b981' : 
                               passwordStrength >= 50 ? '#eab308' : '#ef4444' 
                      }}
                      className="text-xs"
                    >
                      {passwordStrength >= 100 ? 'Strong ✓' : 
                       passwordStrength >= 50 ? 'Medium' : 'Weak'}
                    </motion.p>
                  </div>
                  
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

                <motion.button 
                  type="submit" 
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSubmitting || !isValid}
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
                        <span>Creating Account...</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="submit"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <span>Create {watchedRole === 'DOCTOR' ? 'Doctor' : 'Patient'} Account</span>
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
                transition={{ delay: 0.8 }}
                className="text-slate-400 text-center mt-6"
              >
                Already have an account?{" "}
                <motion.a
                  href="/auth/login"
                  whileHover={{ scale: 1.05 }}
                  className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
                >
                  Sign in
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