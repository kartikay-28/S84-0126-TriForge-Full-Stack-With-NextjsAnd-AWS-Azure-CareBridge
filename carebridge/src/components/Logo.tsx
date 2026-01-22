'use client'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-10 h-10'
  }

  return (
    <div className={`${sizeClasses[size]} rounded-xl flex items-center justify-center overflow-hidden ${className}`}>
      <img 
        src="/Gemini_Generated_Image_qit73rqit73rqit7.png" 
        alt="CareBridge Logo" 
        className="w-full h-full object-cover rounded-xl"
      />
    </div>
  )
}