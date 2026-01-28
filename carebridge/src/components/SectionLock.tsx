'use client'

import { motion } from 'framer-motion'

interface SectionLockProps {
  title: string
  message: string
  onUnlock: () => void
  icon?: React.ReactNode
}

export default function SectionLock({ title, message, onUnlock, icon }: SectionLockProps) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 hover-lift">
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
          {icon || (
            <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          )}
        </div>
        <h4 className="font-medium text-white mb-2">{title}</h4>
        <p className="text-slate-400 text-sm mb-6 max-w-md">{message}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onUnlock}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors"
        >
          Complete Profile to Unlock
        </motion.button>
      </div>
    </div>
  )
}