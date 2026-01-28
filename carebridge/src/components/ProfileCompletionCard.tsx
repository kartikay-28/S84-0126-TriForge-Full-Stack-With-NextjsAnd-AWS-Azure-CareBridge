'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

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
      className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-xl p-6 hover-lift"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
            {getIcon()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{getTitle()}</h3>
            <p className="text-slate-400 text-sm">{getDescription()}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className={`text-2xl font-bold ${getStatusColor()}`}>
              {completionPercentage}%
            </div>
            <div className="text-xs text-slate-400">Complete</div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleComplete}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors"
          >
            {getButtonText()}
          </motion.button>
        </div>
      </div>
      <div className="mt-4">
        <div className="w-full bg-slate-700 rounded-full h-2">
          <motion.div
            className={`h-2 rounded-full ${getProgressColor()}`}
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-400">
          <span>Basic Info</span>
          <span>Details</span>
          <span>Advanced</span>
        </div>
      </div>
    </motion.div>
  )
}