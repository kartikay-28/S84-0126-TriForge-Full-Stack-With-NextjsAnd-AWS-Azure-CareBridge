'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'
import LampToggle from '@/components/LampToggle'
import Logo from '@/components/Logo'
import BackgroundAnimation from '@/components/BackgroundAnimation'

export default function Home() {
  const [scrolled, setScrolled] = useState(false)
  const { scrollY } = useScroll()
  const backgroundY = useTransform(scrollY, [0, 500], [0, -50])
  const heroY = useTransform(scrollY, [0, 300], [0, -30])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen text-slate-900 dark:text-white transition-colors duration-300 relative overflow-hidden" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Interactive Particle Background Animation */}
      <BackgroundAnimation />

      {/* Navigation */}


      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled
            ? 'navbar-scrolled'
            : 'bg-transparent'
          }`}
        style={{
          background: scrolled
            ? 'var(--bg-card)'
            : 'transparent',
          borderBottom: scrolled
            ? '1px solid var(--border-light)'
            : 'none'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center h-12">
            <motion.a
              href="/"
              whileHover={{ scale: 1.02 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center gap-3 hover-glow cursor-pointer group"
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }}
              >
                <Logo size="lg" />
              </motion.div>
              <span className="text-2xl font-bold text-gradient group-hover:text-emerald-400 transition-colors">CareBridge</span>
            </motion.a>

            <div className="flex items-center gap-6 h-full">
              <div className="flex items-center h-full">
                <LampToggle />
              </div>
              <motion.a
                href="/auth/login"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="relative hover:text-emerald-500 transition-all duration-300 font-medium px-4 py-2 group"
                style={{ color: 'var(--text-secondary)' }}
              >
                Sign In
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-500 transition-all duration-300 group-hover:w-full"></span>
              </motion.a>
              <motion.a
                href="/auth/signup"
                whileHover={{
                  scale: 1.05,
                  y: -2,
                  boxShadow: "0 10px 25px rgba(16, 185, 129, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="btn-primary relative overflow-hidden group"
              >
                <span className="relative z-10">Get Started →</span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.a>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <main className="px-6 pt-32 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
            {/* Left Content */}
            <motion.div
              style={{ y: heroY }}
              className="max-w-2xl"
            >
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="inline-flex items-center gap-3 clean-card px-4 py-2 mb-8 hover-glow group cursor-pointer"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-2 h-2 bg-emerald-500 rounded-full"
                ></motion.div>
                <span className="text-sm font-medium group-hover:text-emerald-400 transition-colors" style={{ color: 'var(--text-secondary)' }}>Privacy-First Healthcare</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="heading-xl mb-6"
              >
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  Your Health Records,
                </motion.span>
                <br />
                <motion.span
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="text-emerald-500 text-gradient relative"
                >
                  Unified & Secure
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1, delay: 1.2 }}
                    className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full"
                  ></motion.div>
                </motion.span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.0 }}
                className="text-xl mb-10 leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
              >
                CareBridge solves fragmented medical records by providing
                a secure, interoperable platform where you control who sees
                your health data.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="flex items-center gap-4 mb-12"
              >
                <motion.a
                  href="/auth/signup"
                  whileHover={{
                    scale: 1.05,
                    y: -2,
                    boxShadow: "0 15px 35px rgba(16, 185, 129, 0.4)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary text-lg px-8 py-4 relative overflow-hidden group"
                >
                  <span className="relative z-10">Start for Free</span>
                  <motion.div
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  ></motion.div>
                </motion.a>
                <motion.a
                  href="/auth/login"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-secondary text-lg px-8 py-4 group"
                >
                  <span className="group-hover:text-emerald-400 transition-colors">Sign In</span>
                </motion.a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.4 }}
                className="flex items-center gap-8 text-sm"
              >
                {[
                  { text: "HIPAA Compliant", delay: 0 },
                  { text: "End-to-End Encrypted", delay: 0.2 }
                ].map((item, index) => (
                  <motion.div
                    key={item.text}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 1.6 + item.delay }}
                    className="flex items-center gap-2 hover-scale cursor-pointer group"
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 180, 360]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.5
                      }}
                      className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center group-hover:bg-emerald-400 transition-colors"
                    >
                      <span className="text-xs text-white font-bold">✓</span>
                    </motion.div>
                    <span className="font-medium group-hover:text-emerald-400 transition-colors" style={{ color: 'var(--text-secondary)' }}>{item.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, x: 50, rotateY: 15 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
              className="lg:ml-16 perspective-1000"
            >
              <motion.div
                whileHover={{
                  y: -10,
                  rotateX: 5,
                  rotateY: -5,
                  scale: 1.02
                }}
                transition={{ duration: 0.3 }}
                className="clean-card p-8 hover-lift relative overflow-hidden group"
                style={{
                  background: "linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(59, 130, 246, 0.05))",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)"
                }}
              >
                {/* Floating glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <motion.h3
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 1.2 }}
                      className="heading-md"
                    >
                      Health Dashboard
                    </motion.h3>
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: 1.4 }}
                      className="flex items-center gap-2"
                    >
                      <motion.div
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [1, 0.7, 1]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="w-2 h-2 bg-emerald-500 rounded-full"
                      ></motion.div>
                      <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Live</span>
                    </motion.div>
                  </div>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.6 }}
                    className="text-sm mb-6"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    All your records in one secure place
                  </motion.p>

                  <div className="space-y-3">
                    {[
                      { text: 'Recent Lab Results', icon: '🧪', color: 'emerald' },
                      { text: 'Prescription History', icon: '💊', color: 'blue' },
                      { text: 'Medical Records', icon: '📋', color: 'purple' }
                    ].map((item, index) => (
                      <motion.div
                        key={item.text}
                        initial={{ opacity: 0, x: 20, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{
                          duration: 0.6,
                          delay: 1.8 + index * 0.2,
                          ease: "easeOut"
                        }}
                        whileHover={{
                          scale: 1.02,
                          x: 5,
                          transition: { duration: 0.2 }
                        }}
                        className="flex justify-between items-center p-4 glass-surface rounded-xl hover-glow cursor-pointer group/item"
                      >
                        <div className="flex items-center gap-3">
                          <motion.span
                            whileHover={{ scale: 1.2, rotate: 10 }}
                            className="text-lg"
                          >
                            {item.icon}
                          </motion.span>
                          <span className="text-sm font-medium group-hover/item:text-emerald-400 transition-colors">{item.text}</span>
                        </div>
                        <motion.div
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.7, 1, 0.7]
                          }}
                          transition={{
                            duration: 2 + index * 0.3,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: index * 0.5
                          }}
                          className={`w-2 h-2 bg-${item.color}-500 rounded-full`}
                        ></motion.div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Corner accent */}
                <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-emerald-400/20 to-transparent rounded-full opacity-60"></div>
                <div className="absolute bottom-4 left-4 w-6 h-6 bg-gradient-to-tr from-blue-400/20 to-transparent rounded-full opacity-40"></div>
              </motion.div>
            </motion.div>
          </div>

          {/* How CareBridge Works Section */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.2 }}
            className="mb-32 relative"
          >
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-blue-500/5 rounded-3xl blur-3xl"></div>

            <div className="relative z-10">
              <div className="text-center mb-16">
                <motion.h2
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="heading-lg mb-6"
                >
                  How <span className="text-emerald-500 relative">
                    CareBridge
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      transition={{ duration: 1, delay: 0.8 }}
                      viewport={{ once: true }}
                      className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full origin-left"
                    ></motion.div>
                  </span> Works
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="text-xl max-w-2xl mx-auto"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  A simple three-step process to take control of your health data
                </motion.p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                {/* Connecting lines */}
                <div className="hidden md:block absolute top-1/2 left-1/3 w-1/3 h-0.5 bg-gradient-to-r from-emerald-500/50 to-blue-500/50 transform -translate-y-1/2 z-0">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ duration: 1.5, delay: 1 }}
                    viewport={{ once: true }}
                    className="w-full h-full bg-gradient-to-r from-emerald-500 to-blue-500 origin-left"
                  ></motion.div>
                </div>
                <div className="hidden md:block absolute top-1/2 left-2/3 w-1/3 h-0.5 bg-gradient-to-r from-blue-500/50 to-purple-500/50 transform -translate-y-1/2 z-0">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ duration: 1.5, delay: 1.5 }}
                    viewport={{ once: true }}
                    className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 origin-left"
                  ></motion.div>
                </div>

                {[
                  {
                    step: "01",
                    title: "Create Your Account",
                    description: "Sign up as a patient or healthcare provider. Your data stays encrypted from day one.",
                    icon: "👤",
                    color: "emerald",
                    gradient: "from-emerald-500/20 to-emerald-600/20"
                  },
                  {
                    step: "02",
                    title: "Control Access",
                    description: "Grant or revoke access to specific doctors. You decide who sees your health information.",
                    icon: "🔐",
                    color: "blue",
                    gradient: "from-blue-500/20 to-blue-600/20"
                  },
                  {
                    step: "03",
                    title: "Share Securely",
                    description: "Doctors with consent can view your records instantly. No more lost files or repeated tests.",
                    icon: "📋",
                    color: "purple",
                    gradient: "from-purple-500/20 to-purple-600/20"
                  }
                ].map((item, index) => (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      duration: 0.8,
                      delay: 0.6 + index * 0.2,
                      ease: "easeOut"
                    }}
                    viewport={{ once: true, amount: 0.3 }}
                    whileHover={{
                      y: -10,
                      scale: 1.02,
                      transition: { duration: 0.3 }
                    }}
                    className={`clean-card p-8 text-center relative overflow-hidden group cursor-pointer z-10 bg-gradient-to-br ${item.gradient}`}
                  >
                    {/* Hover glow effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br from-${item.color}-500/10 to-${item.color}-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                    <div className="relative z-10">
                      <div className="flex items-center justify-center gap-4 mb-6">
                        <motion.div
                          whileHover={{
                            scale: 1.1,
                            rotate: [0, -10, 10, 0],
                            transition: { duration: 0.5 }
                          }}
                          className={`w-16 h-16 glass-surface rounded-2xl flex items-center justify-center text-3xl bg-gradient-to-br from-${item.color}-500/20 to-${item.color}-600/20 group-hover:shadow-lg group-hover:shadow-${item.color}-500/25 transition-all duration-300`}
                        >
                          {item.icon}
                        </motion.div>
                        <motion.span
                          initial={{ opacity: 0, scale: 0 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.6, delay: 1 + index * 0.2 }}
                          viewport={{ once: true }}
                          className={`text-${item.color}-500 text-4xl font-bold relative`}
                        >
                          {item.step}
                          <motion.div
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: index * 0.7
                            }}
                            className={`absolute inset-0 text-${item.color}-400 blur-sm`}
                          >
                            {item.step}
                          </motion.div>
                        </motion.span>
                      </div>
                      <motion.h3
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 + index * 0.2 }}
                        viewport={{ once: true }}
                        className="heading-md mb-4 group-hover:text-emerald-400 transition-colors"
                      >
                        {item.title}
                      </motion.h3>
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 1 + index * 0.2 }}
                        viewport={{ once: true }}
                        className="mt-4"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {item.description}
                      </motion.p>
                    </div>

                    {/* Corner decoration */}
                    <div className={`absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-${item.color}-400/30 to-transparent rounded-full opacity-60`}></div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Trust & Security Section */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.2 }}
            className="mb-32 relative"
          >
            {/* Background particles */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [0, -20, 0],
                    x: [0, 10, 0],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{
                    duration: 4 + i,
                    repeat: Infinity,
                    delay: i * 0.8
                  }}
                  className={`absolute w-2 h-2 bg-emerald-500/30 rounded-full blur-sm`}
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${30 + (i % 3) * 20}%`
                  }}
                />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="max-w-xl"
              >
                <motion.h2
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="heading-lg mb-8"
                >
                  Built for <span className="text-emerald-500 relative">
                    Trust & Security
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute -inset-2 bg-emerald-500/20 rounded-lg blur-lg -z-10"
                    ></motion.div>
                  </span>
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  viewport={{ once: true }}
                  className="text-xl mb-12"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  We use enterprise-grade security to protect your
                  most sensitive health information.
                </motion.p>

                <div className="space-y-6">
                  {[
                    {
                      title: "End-to-End Encryption",
                      description: "Your data is encrypted at rest and in transit.",
                      icon: "🔒",
                      delay: 0.8
                    },
                    {
                      title: "Granular Access",
                      description: "Control exactly what each doctor can see and when.",
                      icon: "🎯",
                      delay: 1.0
                    },
                    {
                      title: "Instant Revocation",
                      description: "Remove access instantly from any healthcare provider.",
                      icon: "⚡",
                      delay: 1.2
                    }
                  ].map((feature) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, x: -30, scale: 0.9 }}
                      whileInView={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ duration: 0.8, delay: feature.delay }}
                      viewport={{ once: true }}
                      whileHover={{
                        x: 10,
                        transition: { duration: 0.3 }
                      }}
                      className="flex items-start gap-4 p-4 rounded-xl hover:bg-emerald-500/5 transition-all duration-300 cursor-pointer group"
                    >
                      <motion.div
                        whileHover={{
                          scale: 1.2,
                          rotate: [0, -10, 10, 0]
                        }}
                        transition={{ duration: 0.5 }}
                        className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-xl flex-shrink-0 group-hover:bg-emerald-500/30 group-hover:shadow-lg group-hover:shadow-emerald-500/25 transition-all duration-300"
                      >
                        {feature.icon}
                      </motion.div>
                      <div>
                        <motion.h4
                          className="heading-md mb-2 group-hover:text-emerald-400 transition-colors"
                        >
                          {feature.title}
                        </motion.h4>
                        <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>{feature.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Access Control Preview */}
              <motion.div
                initial={{ opacity: 0, x: 50, rotateY: -15 }}
                whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                viewport={{ once: true }}
                className="lg:ml-16"
              >
                <motion.div
                  whileHover={{
                    y: -5,
                    scale: 1.02,
                    rotateX: 2,
                    rotateY: 2
                  }}
                  transition={{ duration: 0.3 }}
                  className="clean-card p-8 relative overflow-hidden group"
                  style={{
                    background: "linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(59, 130, 246, 0.05))",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                  }}
                >
                  {/* Animated shield background */}
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.1, 0.2, 0.1]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-blue-500/10"
                  ></motion.div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <motion.h3
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                        viewport={{ once: true }}
                        className="heading-md flex items-center gap-3"
                      >
                        <motion.span
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          className="text-2xl"
                        >
                          🛡️
                        </motion.span>
                        Access Control
                      </motion.h3>
                      <motion.span
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 1.0 }}
                        viewport={{ once: true }}
                        className="text-sm font-medium text-emerald-500 bg-emerald-500/20 px-3 py-1 rounded-full"
                      >
                        3 Active
                      </motion.span>
                    </div>

                    <div className="space-y-4">
                      {[
                        { name: "Primary Care Doctor", specialty: "General Practice", color: "bg-emerald-500", status: "active" },
                        { name: "Specialist Doctor", specialty: "Cardiology", color: "bg-blue-500", status: "active" },
                        { name: "Emergency Contact", specialty: "Emergency Care", color: "bg-purple-500", status: "pending" }
                      ].map((doctor, index) => (
                        <motion.div
                          key={doctor.name}
                          initial={{ opacity: 0, y: 20, scale: 0.9 }}
                          whileInView={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.6, delay: 1.2 + index * 0.2 }}
                          viewport={{ once: true }}
                          whileHover={{
                            scale: 1.02,
                            x: 5,
                            transition: { duration: 0.2 }
                          }}
                          className="flex items-center justify-between p-4 glass-surface rounded-xl group/doctor cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              className={`w-12 h-12 ${doctor.color} rounded-xl flex items-center justify-center relative overflow-hidden`}
                            >
                              <span className="text-sm text-white font-bold relative z-10">D{index + 1}</span>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                              ></motion.div>
                            </motion.div>
                            <div>
                              <p className="font-semibold group-hover/doctor:text-emerald-400 transition-colors">{doctor.name}</p>
                              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{doctor.specialty}</p>
                            </div>
                          </div>
                          <motion.div
                            animate={{
                              scale: doctor.status === 'active' ? [1, 1.2, 1] : [1, 1.1, 1],
                              opacity: doctor.status === 'active' ? [1, 0.7, 1] : [0.5, 1, 0.5]
                            }}
                            transition={{
                              duration: doctor.status === 'active' ? 2 : 3,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: index * 0.5
                            }}
                            className={`w-3 h-3 rounded-full ${doctor.status === 'active' ? 'bg-emerald-500' : 'bg-yellow-500'
                              }`}
                          ></motion.div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Security badge */}
                  <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-emerald-400/30 to-blue-400/30 rounded-full flex items-center justify-center">
                    <motion.span
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      className="text-xs"
                    >
                      🔐
                    </motion.span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.section>

          {/* CTA Section */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.2 }}
            className="text-center relative"
          >
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl">
              <motion.div
                animate={{
                  background: [
                    "linear-gradient(45deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1))",
                    "linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))",
                    "linear-gradient(45deg, rgba(147, 51, 234, 0.1), rgba(16, 185, 129, 0.1))"
                  ]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 blur-3xl"
              ></motion.div>

              {/* Floating particles */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [0, -30, 0],
                    x: [0, 15, 0],
                    opacity: [0.2, 0.5, 0.2],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    duration: 5 + i * 0.5,
                    repeat: Infinity,
                    delay: i * 0.8,
                    ease: "easeInOut"
                  }}
                  className="absolute w-1 h-1 bg-emerald-400 rounded-full blur-sm"
                  style={{
                    left: `${10 + i * 10}%`,
                    top: `${20 + (i % 4) * 20}%`
                  }}
                />
              ))}
            </div>

            <motion.div
              whileHover={{
                scale: 1.01,
                y: -5
              }}
              transition={{ duration: 0.3 }}
              className="clean-card p-16 max-w-4xl mx-auto relative overflow-hidden group"
              style={{
                background: "linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(59, 130, 246, 0.05))",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
              }}
            >
              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                <motion.h2
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="heading-lg mb-6"
                >
                  Ready to Take Control of Your{" "}
                  <span className="text-emerald-500 relative">
                    Health Data
                    <motion.div
                      animate={{
                        scaleX: [0, 1, 0],
                        opacity: [0, 1, 0]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full"
                    ></motion.div>
                  </span>
                  ?
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="text-xl mb-12 max-w-2xl mx-auto"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Join thousands of patients and healthcare providers who trust CareBridge for
                  secure, seamless health record management.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  viewport={{ once: true }}
                  className="flex items-center justify-center gap-6 flex-wrap"
                >
                  <motion.a
                    href="/auth/signup"
                    whileHover={{
                      scale: 1.05,
                      y: -3,
                      boxShadow: "0 20px 40px rgba(16, 185, 129, 0.4)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-primary text-lg px-10 py-4 relative overflow-hidden group/btn"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Create Free Account
                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        →
                      </motion.span>
                    </span>
                    <motion.div
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.6 }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    ></motion.div>

                    {/* Pulse effect */}
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0, 0.3, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute inset-0 bg-emerald-500 rounded-lg"
                    ></motion.div>
                  </motion.a>

                  <motion.a
                    href="/auth/login"
                    whileHover={{
                      scale: 1.02,
                      y: -2,
                      borderColor: "rgba(16, 185, 129, 0.5)"
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-secondary text-lg px-10 py-4 group/btn2"
                  >
                    <span className="group-hover/btn2:text-emerald-400 transition-colors">Sign In</span>
                  </motion.a>
                </motion.div>

                {/* Trust indicators */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  viewport={{ once: true }}
                  className="flex items-center justify-center gap-8 mt-12 text-sm opacity-70"
                >
                  {[
                    { icon: "🔒", text: "256-bit Encryption" },
                    { icon: "🏥", text: "HIPAA Compliant" },
                    { icon: "⚡", text: "Instant Access" }
                  ].map((item, index) => (
                    <motion.div
                      key={item.text}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-center gap-2 hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <motion.span
                        whileHover={{ scale: 1.2, rotate: 10 }}
                        className="text-lg"
                      >
                        {item.icon}
                      </motion.span>
                      <span style={{ color: 'var(--text-muted)' }}>{item.text}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Corner decorations */}
              <div className="absolute top-6 right-6 w-12 h-12 bg-gradient-to-br from-emerald-400/20 to-transparent rounded-full opacity-60"></div>
              <div className="absolute bottom-6 left-6 w-8 h-8 bg-gradient-to-tr from-blue-400/20 to-transparent rounded-full opacity-40"></div>
            </motion.div>
          </motion.section>
        </div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="border-t mt-32 py-12 relative overflow-hidden"
        style={{ borderColor: 'var(--border-light)' }}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-blue-500/5 opacity-50"></div>

        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between relative z-10">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.8 }}
            >
              <Logo size="md" />
            </motion.div>
            <span className="text-xl font-bold group-hover:text-emerald-400 transition-colors">CareBridge</span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            © 2026 CareBridge. All rights reserved.{" "}
            <span className="text-emerald-400">Privacy first healthcare.</span>
          </motion.p>
        </div>
      </motion.footer>
    </div>
  );
}
