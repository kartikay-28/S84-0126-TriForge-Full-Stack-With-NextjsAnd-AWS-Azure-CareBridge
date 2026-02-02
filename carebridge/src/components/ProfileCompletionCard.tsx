'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ProfileCompletionCardProps {
  userType: 'patient' | 'doctor'
  completionPercentage: number
  onComplete?: () => void
}

export default function ProfileCompletionCard({ 
  userType, 
  completionPercentage, 
  onComplete 
}: ProfileCompletionCardProps) {
  const router = useRouter()

  useEffect(() => {
    // Force animations to be enabled regardless of system settings
    // Add a small delay to ensure component is mounted
    const timer = setTimeout(() => {
      // Animations are now always enabled
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  const handleComplete = () => {
    if (onComplete) {
      onComplete()
    } else {
      router.push(`/dashboard/${userType}/profile`)
    }
  }

  const getTitle = () => {
    return userType === 'doctor' 
      ? 'Complete Your Professional Profile'
      : 'Complete Your Profile'
  }

  const getDescription = () => {
    return userType === 'doctor'
      ? 'Attract more patients and build professional credibility'
      : 'Get better healthcare recommendations and doctor matching'
  }

  const getIcon = () => {
    if (userType === 'doctor') {
      return (
        <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
    return (
      <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )
  }

  const getStatusColor = () => {
    if (completionPercentage >= 80) return 'text-green-400'
    if (completionPercentage >= 50) return 'text-yellow-400'
    return 'text-emerald-400'
  }

  const getProgressColor = () => {
    if (completionPercentage >= 80) return 'bg-green-500'
    if (completionPercentage >= 50) return 'bg-yellow-500'
    return 'bg-emerald-500'
  }

  const getButtonText = () => {
    if (completionPercentage >= 80) return 'View Profile'
    if (completionPercentage >= 50) return 'Complete Profile'
    return 'Complete Now'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="profile-completion-card-enhanced relative bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-xl p-6 hover-lift overflow-hidden backdrop-blur-sm"
      style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1))',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {/* Force Animated Gloss Effects - Always show */}
      {/* Primary Diagonal Gloss */}
      <motion.div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: 'linear-gradient(45deg, transparent 20%, rgba(255, 255, 255, 0.6) 50%, transparent 80%)',
        }}
        animate={{
          x: ['-200%', '200%'],
          y: ['-200%', '200%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          repeatDelay: 0.5
        }}
      />
      
      {/* Secondary Horizontal Shimmer */}
      <motion.div 
        className="absolute inset-0 pointer-events-none z-0 opacity-60"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
        }}
        animate={{
          x: ['-150%', '150%'],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
          repeatDelay: 1
        }}
      />

      {/* Pulsing Background Glow */}
      <motion.div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.1), transparent 70%)',
        }}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="icon-container w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center border border-white/20 relative overflow-hidden backdrop-blur-sm">
              {/* Icon Rotating Gloss */}
              <motion.div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.8), transparent)',
                }}
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                  delay: 0.5
                }}
              />
              <div className="relative z-10">
                {getIcon()}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white drop-shadow-sm">{getTitle()}</h3>
              <p className="text-slate-400 text-sm">{getDescription()}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <motion.div 
                className={`text-2xl font-bold ${getStatusColor()} drop-shadow-sm`}
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {completionPercentage}%
              </motion.div>
              <div className="text-xs text-slate-400">Complete</div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleComplete}
              className="button-glass relative px-4 py-2 bg-emerald-500/80 hover:bg-emerald-600/80 text-white font-medium rounded-lg transition-colors border border-white/20 overflow-hidden backdrop-blur-sm"
            >
              {/* Button Sweep Animation */}
              <motion.div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(110deg, transparent, rgba(255, 255, 255, 0.8), transparent)',
                }}
                animate={{
                  x: ['-200%', '200%'],
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.2,
                  repeatDelay: 2
                }}
              />
              <span className="relative z-10 drop-shadow-sm">{getButtonText()}</span>
            </motion.button>
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-slate-700/30 rounded-full h-2 border border-white/10 overflow-hidden backdrop-blur-sm">
            <motion.div
              className={`progress-bar h-2 rounded-full ${getProgressColor()} relative overflow-hidden`}
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Progress Bar Gloss */}
              <motion.div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.6))',
                }}
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.8,
                  repeatDelay: 1.5
                }}
              />
            </motion.div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-400">
            <span>Basic Info</span>
            <span>Details</span>
            <span>Advanced</span>
          </div>
        </div>
      </div>
      
      {/* Animated Corner highlights */}
      <motion.div 
        className="absolute top-2 right-2 w-8 h-8 bg-gradient-to-br from-white/30 to-transparent rounded-full"
        animate={{
          opacity: [0.6, 1, 0.6],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div 
        className="absolute bottom-2 left-2 w-6 h-6 bg-gradient-to-tr from-emerald-400/30 to-transparent rounded-full"
        animate={{
          opacity: [0.4, 0.8, 0.4],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      {/* Debug indicator - shows if animations are running */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-1 left-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Animations Active" />
      )}
    </motion.div>
  )
}