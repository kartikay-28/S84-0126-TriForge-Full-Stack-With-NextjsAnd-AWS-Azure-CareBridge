'use client'

import { useState, useEffect } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'

export default function LampToggle() {
  const { theme, toggleTheme } = useTheme()
  const [isOn, setIsOn] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  
  // Motion values for dragging in both X and Y directions
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  // Calculate cord length based on distance from center
  const cordLength = useTransform([x, y], (values: number[]) => {
    const [xVal, yVal] = values
    const distance = Math.sqrt(xVal * xVal + yVal * yVal)
    return Math.max(20, Math.min(70, 20 + distance * 0.8))
  })
  
  // Calculate cord angle based on position
  const cordAngle = useTransform([x, y], (values: number[]) => {
    const [xVal, yVal] = values
    return Math.atan2(xVal, yVal) * (180 / Math.PI)
  })
  
  useEffect(() => {
    setIsOn(theme === 'light')
  }, [theme])

  const handleDragEnd = () => {
    setIsDragging(false)
    // Calculate total distance pulled
    const distance = Math.sqrt(x.get() * x.get() + y.get() * y.get())
    
    // If pulled far enough, toggle theme
    if (distance > 30) {
      toggleTheme()
    }
    
    // Smoothly animate back to original position
    animate(x, 0, {
      type: "spring",
      stiffness: 300,
      damping: 30
    })
    animate(y, 0, {
      type: "spring",
      stiffness: 300,
      damping: 30
    })
  }

  return (
    <div className="lamp-toggle-container">
      <div className="relative flex flex-col items-center scale-50 origin-center">
        {/* Lamp Structure */}
        <div className="relative">
          {/* Lamp Top/Ceiling Mount */}
          <div className="w-12 h-3 bg-gradient-to-b from-slate-300 to-slate-400 rounded-full shadow-sm mx-auto"></div>
          
          {/* Lamp Arm */}
          <div className="w-2 h-12 bg-gradient-to-r from-slate-400 to-slate-500 mx-auto rounded-full shadow-sm"></div>
          
          {/* Lamp Shade */}
          <motion.div
            className={`w-20 h-12 rounded-b-full relative transition-all duration-500 ${
              isOn 
                ? 'bg-gradient-to-b from-yellow-100 to-yellow-200 shadow-yellow-300/60' 
                : 'bg-gradient-to-b from-slate-300 to-slate-400 shadow-slate-400/30'
            }`}
            style={{
              boxShadow: isOn 
                ? '0 0 20px rgba(253, 224, 71, 0.6), 0 0 40px rgba(253, 224, 71, 0.3)' 
                : '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
          >
            {/* Inner Lamp Shade */}
            <div className={`absolute inset-1 rounded-b-full ${
              isOn ? 'bg-gradient-to-b from-yellow-50 to-yellow-100' : 'bg-gradient-to-b from-slate-200 to-slate-300'
            }`}></div>
            
            {/* Lamp Shade Rim */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-400 via-slate-300 to-slate-400 rounded-b-full"></div>
            
            {/* Light Bulb Visible Inside */}
            <div className={`absolute top-2 left-1/2 transform -translate-x-1/2 w-4 h-5 rounded-full ${
              isOn ? 'bg-yellow-200 shadow-yellow-300/80' : 'bg-slate-300'
            }`}>
              <div className={`w-3 h-4 mx-auto mt-0.5 rounded-full ${
                isOn ? 'bg-yellow-100' : 'bg-slate-200'
              }`}></div>
            </div>

            {/* Cord Attachment Point */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0.5 h-1 bg-slate-600"></div>
          </motion.div>

          {/* Pull Cord */}
          <motion.div
            className="absolute top-full left-1/2 transform -translate-x-1/2 flex flex-col items-center"
            style={{ marginTop: '1px' }}
          >
            {/* Cord Thread - now rotates based on pull direction */}
            <motion.div
              className="w-0.5 bg-slate-600 origin-top"
              style={{ 
                height: cordLength,
                rotate: cordAngle,
                transformOrigin: 'top center'
              }}
            />
            
            {/* Draggable Pull Handle - can move in any direction */}
            <motion.div
              drag
              dragConstraints={{ top: -50, bottom: 50, left: -50, right: 50 }}
              dragElastic={0.2}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={handleDragEnd}
              style={{ x, y }}
              className={`w-4 h-6 rounded-full cursor-grab active:cursor-grabbing transition-all duration-200 ${
                isDragging 
                  ? 'bg-gradient-to-b from-emerald-400 to-emerald-500 shadow-emerald-400/50 scale-110' 
                  : 'bg-gradient-to-b from-slate-500 to-slate-600 hover:from-slate-400 hover:to-slate-500'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Pull Handle Details */}
              <div className="w-full h-0.5 bg-black/20 rounded-full mt-1"></div>
              <div className="w-full h-0.5 bg-black/20 rounded-full mt-0.5"></div>
              <div className="w-full h-0.5 bg-black/20 rounded-full mt-0.5"></div>
              <div className="w-full h-0.5 bg-white/20 rounded-full mt-0.5"></div>
            </motion.div>
          </motion.div>

          {/* Light Beam Effect */}
          {isOn && (
            <motion.div
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ 
                opacity: [0, 0.3, 0.2], 
                scaleY: [0, 1, 1],
                scaleX: [0.8, 1.2, 1]
              }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute top-full left-1/2 transform -translate-x-1/2 w-24 h-20 bg-gradient-to-b from-yellow-200/30 to-transparent pointer-events-none"
              style={{
                clipPath: 'polygon(45% 0%, 55% 0%, 85% 100%, 15% 100%)',
                filter: 'blur(1px)'
              }}
            />
          )}
        </div>

        {/* Status Text - Hidden in nav to save space */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isDragging ? 1 : 0 }}
          className="absolute -bottom-8 text-center whitespace-nowrap"
        >
          <motion.p
            className={`text-xs font-medium transition-colors duration-300 ${
              isDragging ? 'text-emerald-500' : 'text-slate-400'
            }`}
          >
            {isDragging ? 'Release to switch!' : ''}
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}