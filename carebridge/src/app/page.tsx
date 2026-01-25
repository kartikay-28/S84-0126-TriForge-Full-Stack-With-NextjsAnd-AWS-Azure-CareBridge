'use client'

import { motion } from 'framer-motion'
import LampToggle from '@/components/LampToggle'
import Logo from '@/components/Logo'

export default function Home() {
  return (
    <div className="min-h-screen text-slate-900 dark:text-white transition-colors duration-300 page-transition animate-fade-in" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Navigation */}
      <nav className="nav-clean sticky top-0 z-50 animate-slide-in-up">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center h-12">
            <motion.a
              href="/"
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3 hover-glow cursor-pointer"
            >
              <Logo size="lg" />
              <span className="text-2xl font-bold text-gradient">CareBridge</span>
            </motion.a>
            
            <div className="flex items-center gap-4 h-full">
              <div className="flex items-center h-full">
                <LampToggle />
              </div>
              <motion.a
                href="/auth/login"
                whileHover={{ scale: 1.02 }}
                className="hover:text-emerald-500 transition font-medium px-4 py-2 hover-glow micro-bounce"
                style={{ color: 'var(--text-secondary)' }}
              >
                Sign In
              </motion.a>
              <motion.a
                href="/auth/signup"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary hover-glow micro-bounce"
              >
                Get Started →
              </motion.a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl animate-slide-in-left"
            >
              <div className="inline-flex items-center gap-3 clean-card px-4 py-2 mb-8 hover-glow animate-bounce">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Privacy-First Healthcare</span>
              </div>

              <h1 className="heading-xl mb-6 animate-fade-in">
                Your Health Records, 
                <span className="text-emerald-500 text-gradient animate-pulse"> Unified & Secure</span>
              </h1>

              <p className="text-xl mb-10 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                CareBridge solves fragmented medical records by providing
                a secure, interoperable platform where you control who sees
                your health data.
              </p>

              <div className="flex items-center gap-4 mb-12 animate-stagger-1">
                <motion.a
                  href="/auth/signup"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary text-lg px-8 py-4 hover-glow micro-bounce"
                >
                  Start for Free
                </motion.a>
                <motion.a
                  href="/auth/login"
                  whileHover={{ scale: 1.02 }}
                  className="btn-secondary text-lg px-8 py-4 hover-glow micro-bounce"
                >
                  Sign In
                </motion.a>
              </div>

              <div className="flex items-center gap-8 text-sm animate-stagger-2">
                <div className="flex items-center gap-2 hover-scale">
                  <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                    <span className="text-xs text-white font-bold">✓</span>
                  </div>
                  <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>HIPAA Compliant</span>
                </div>
                <div className="flex items-center gap-2 hover-scale">
                  <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                    <span className="text-xs text-white font-bold">✓</span>
                  </div>
                  <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>End-to-End Encrypted</span>
                </div>
              </div>
            </motion.div>

            {/* Right Dashboard Preview */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:ml-16 animate-slide-in-right"
            >
              <div className="clean-card p-8 hover-lift hover-glow card-entrance">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="heading-md">Health Dashboard</h3>
                  <div className="flex items-center gap-2 animate-pulse">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Live</span>
                  </div>
                </div>
                
                <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>All your records in one secure place</p>

                <div className="space-y-3">
                  {['Recent Lab Results', 'Prescription History', 'Medical Records'].map((item, index) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex justify-between items-center p-4 glass-surface rounded-xl hover-glow hover-scale"
                    >
                      <span className="text-sm font-medium">{item}</span>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* How CareBridge Works Section */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: false, amount: 0.3 }}
            className="mb-32"
          >
            <div className="text-center mb-16">
              <h2 className="heading-lg mb-6">
                How <span className="text-emerald-500">CareBridge</span> Works
              </h2>
                <p className="text-xl max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                A simple three-step process to take control of your health data
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Create Your Account",
                  description: "Sign up as a patient or healthcare provider. Your data stays encrypted from day one.",
                  icon: "👤"
                },
                {
                  step: "02", 
                  title: "Control Access",
                  description: "Grant or revoke access to specific doctors. You decide who sees your health information.",
                  icon: "🔐"
                },
                {
                  step: "03",
                  title: "Share Securely", 
                  description: "Doctors with consent can view your records instantly. No more lost files or repeated tests.",
                  icon: "📋"
                }
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: false, amount: 0.5 }}
                  className="clean-card p-8 hover-lift text-center"
                >
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="w-12 h-12 glass-surface rounded-xl flex items-center justify-center text-2xl">
                      {item.icon}
                    </div>
                    <span className="text-emerald-500 text-3xl font-bold">{item.step}</span>
                  </div>
                  <h3 className="heading-md mb-4">{item.title}</h3>
                  <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>{item.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Trust & Security Section */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: false, amount: 0.3 }}
            className="mb-32"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="max-w-xl">
                <h2 className="heading-lg mb-8">
                  Built for <span className="text-emerald-500">Trust & Security</span>
                </h2>
                <p className="text-xl mb-12" style={{ color: 'var(--text-secondary)' }}>
                  We use enterprise-grade security to protect your
                  most sensitive health information.
                </p>

                <div className="space-y-6">
                  {[
                    {
                      title: "End-to-End Encryption",
                      description: "Your data is encrypted at rest and in transit."
                    },
                    {
                      title: "Granular Access",
                      description: "Control exactly what each doctor can see and when."
                    },
                    {
                      title: "Instant Revocation", 
                      description: "Remove access instantly from any healthcare provider."
                    }
                  ].map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: false, amount: 0.5 }}
                      className="flex items-start gap-4"
                    >
                      <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                        <span className="text-sm text-white font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="heading-md mb-2">{feature.title}</h4>
                        <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>{feature.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Access Control Preview */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: false, amount: 0.3 }}
                className="lg:ml-16"
              >
                <div className="clean-card p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="heading-md">Access Control</h3>
                    <span className="text-sm font-medium text-emerald-500">3 Active</span>
                  </div>

                  <div className="space-y-4">
                    {[
                      { name: "Primary Care Doctor", specialty: "General Practice", color: "bg-emerald-500" },
                      { name: "Specialist Doctor", specialty: "Cardiology", color: "bg-blue-500" },
                      { name: "Emergency Contact", specialty: "Emergency Care", color: "bg-purple-500" }
                    ].map((doctor, index) => (
                      <motion.div
                        key={doctor.name}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        viewport={{ once: false, amount: 0.5 }}
                        className="flex items-center justify-between p-4 glass-surface rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${doctor.color} rounded-full flex items-center justify-center`}>
                            <span className="text-sm text-white font-bold">D{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-semibold">{doctor.name}</p>
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{doctor.specialty}</p>
                          </div>
                        </div>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* CTA Section */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: false, amount: 0.3 }}
            className="text-center"
          >
            <div className="clean-card p-16 max-w-4xl mx-auto">
              <h2 className="heading-lg mb-6">
                Ready to Take Control of Your <span className="text-emerald-500">Health Data</span>?
              </h2>
              <p className="text-xl mb-12 max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                Join thousands of patients and healthcare providers who trust CareBridge for
                secure, seamless health record management.
              </p>

              <div className="flex items-center justify-center gap-4">
                <motion.a
                  href="/auth/signup"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary text-lg px-8 py-4"
                >
                  Create Free Account
                </motion.a>
                <motion.a
                  href="/auth/login"
                  whileHover={{ scale: 1.02 }}
                  className="btn-secondary text-lg px-8 py-4"
                >
                  Sign In
                </motion.a>
              </div>
            </div>
          </motion.section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-32 py-12" style={{ borderColor: 'var(--border-light)' }}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="md" />
            <span className="text-xl font-bold">CareBridge</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            © 2026 CareBridge. All rights reserved. Privacy first healthcare.
          </p>
        </div>
      </footer>
    </div>
  );
}
