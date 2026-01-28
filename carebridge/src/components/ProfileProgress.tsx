'use client'

import { motion } from 'framer-motion'

interface ProfileProgressProps {
  profileLevel: number
  nextStep: string
  onStartProfile: () => void
}

export default function ProfileProgress({ profileLevel, nextStep, onStartProfile }: ProfileProgressProps) {
  const steps = [
    { level: 0, title: 'Get Started', description: 'Create your account' },
    { level: 1, title: 'Basic Profile', description: 'Essential information' },
    { level: 2, title: 'Recommended', description: 'Medical history & contacts' },
    { level: 3, title: 'Advanced', description: 'Complete health profile' }
  ]

  const getStepStatus = (stepLevel: number) => {
    if (stepLevel <= profileLevel) return 'completed'
    if (stepLevel === profileLevel + 1) return 'current'
    return 'upcoming'
  }

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500'
      case 'current': return 'bg-blue-500'
      default: return 'bg-slate-600'
    }
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Profile Completion</h3>
          <p className="text-slate-400 text-sm">{nextStep}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-emerald-400">{Math.round((profileLevel / 3) * 100)}%</div>
          <div className="text-xs text-slate-500">Complete</div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="space-y-4 mb-6">
        {steps.map((step) => {
          const status = getStepStatus(step.level)
          return (
            <div key={step.level} className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStepColor(status)}`}>
                {status === 'completed' ? (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-white text-sm font-medium">{step.level}</span>
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium text-white">{step.title}</div>
                <div className="text-sm text-slate-400">{step.description}</div>
              </div>
              {status === 'current' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onStartProfile}
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
                >
                  Continue
                </motion.button>
              )}
            </div>
          )
        })}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-700 rounded-full h-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(profileLevel / 3) * 100}%` }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full"
        />
      </div>
    </div>
  )
}