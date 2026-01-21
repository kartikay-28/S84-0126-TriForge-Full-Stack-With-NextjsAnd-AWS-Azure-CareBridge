'use client'

import { motion } from 'framer-motion'

export default function Home() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-slate-900 text-white"
    >
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex justify-between items-center px-6 py-6 max-w-7xl mx-auto"
      >
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <span className="text-2xl font-bold">CareBridge</span>
        </motion.div>
        <div className="flex items-center gap-6">
          <motion.a
            href="/auth/login"
            whileHover={{ scale: 1.05 }}
            className="text-emerald-400 hover:text-emerald-300 transition font-medium"
          >
            Sign In
          </motion.a>
          <motion.a
            href="/auth/signup"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-xl transition !text-white hover:shadow-lg hover:shadow-emerald-500/25"
          >
            Get Started →
          </motion.a>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <main className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
            {/* Left Content */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-3 bg-slate-800/50 border border-slate-700/50 rounded-full px-5 py-3 mb-8">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-300 font-medium">Privacy-First Healthcare</span>
              </div>

              <h1 className="text-6xl lg:text-7xl font-bold leading-[0.9] mb-8">
                Your Health<br />
                Records, <span className="text-emerald-400">Unified &<br />
                Secure</span>
              </h1>

              <p className="text-xl text-slate-400 mb-10 leading-relaxed max-w-lg">
                CareBridge solves fragmented medical records by providing
                a secure, interoperable platform where you control who sees
                your health data.
              </p>

              <div className="flex items-center gap-6 mb-12">
                <a
                  href="/auth/signup"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-4 rounded-xl transition flex items-center gap-3 !text-white text-lg"
                >
                  Start for Free
                  <span className="text-xl">→</span>
                </a>
                <a
                  href="/auth/login"
                  className="text-slate-300 hover:text-white font-semibold px-8 py-4 transition text-lg"
                >
                  Sign In
                </a>
              </div>

              <div className="flex items-center gap-12 text-sm text-slate-500">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">✓</span>
                  </div>
                  <span className="font-medium">HIPAA Compliant</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">✓</span>
                  </div>
                  <span className="font-medium">End-to-End Encrypted</span>
                </div>
              </div>
            </div>

            {/* Right Dashboard Preview */}
            <div className="relative lg:ml-16">
              <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-semibold">Health Dashboard</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-slate-400 font-medium">Consent Active</span>
                  </div>
                </div>
                <p className="text-slate-500 text-sm mb-8">All your records in one place</p>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-slate-900/60 rounded-xl border border-slate-700/30">
                    <span className="text-sm font-medium">Recent Lab Results</span>
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-900/60 rounded-xl border border-slate-700/30">
                    <span className="text-sm font-medium">Prescription History</span>
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-900/60 rounded-xl border border-slate-700/30">
                    <span className="text-sm font-medium">Medical Records</span>
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* How CareBridge Works Section */}
          <section className="mb-32">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold mb-6">
                How <span className="text-emerald-400">CareBridge</span> Works
              </h2>
              <p className="text-slate-400 text-xl max-w-2xl mx-auto">
                A simple three-step process to take control of your health data
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-10 relative group hover:bg-slate-800/70 transition-all duration-300">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-16 h-16 bg-slate-700/50 rounded-2xl flex items-center justify-center group-hover:bg-slate-600/50 transition-colors">
                    <span className="text-emerald-400 text-2xl">👤</span>
                  </div>
                  <span className="text-emerald-400 text-4xl font-bold">01</span>
                </div>
                <h3 className="text-2xl font-bold mb-6">Create Your Account</h3>
                <p className="text-slate-400 leading-relaxed text-lg">
                  Sign up as a patient or healthcare provider.
                  Your data stays encrypted from day one.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-10 relative group hover:bg-slate-800/70 transition-all duration-300">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-16 h-16 bg-slate-700/50 rounded-2xl flex items-center justify-center group-hover:bg-slate-600/50 transition-colors">
                    <span className="text-emerald-400 text-2xl">🔐</span>
                  </div>
                  <span className="text-emerald-400 text-4xl font-bold">02</span>
                </div>
                <h3 className="text-2xl font-bold mb-6">Control Access</h3>
                <p className="text-slate-400 leading-relaxed text-lg">
                  Grant or revoke access to specific doctors.
                  You decide who sees your health information.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-10 relative group hover:bg-slate-800/70 transition-all duration-300">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-16 h-16 bg-slate-700/50 rounded-2xl flex items-center justify-center group-hover:bg-slate-600/50 transition-colors">
                    <span className="text-emerald-400 text-2xl">📋</span>
                  </div>
                  <span className="text-emerald-400 text-4xl font-bold">03</span>
                </div>
                <h3 className="text-2xl font-bold mb-6">Share Securely</h3>
                <p className="text-slate-400 leading-relaxed text-lg">
                  Doctors with consent can view your records
                  instantly. No more lost files or repeated tests.
                </p>
              </div>
            </div>
          </section>

          {/* Trust & Security Section */}
          <section className="mb-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="max-w-xl">
                <h2 className="text-5xl font-bold mb-8">
                  Built for <span className="text-emerald-400">Trust & Security</span>
                </h2>
                <p className="text-slate-400 text-xl mb-12 leading-relaxed">
                  We use enterprise-grade security to protect your
                  most sensitive health information.
                </p>

                <div className="space-y-8">
                  <div className="flex items-start gap-6">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center mt-2 flex-shrink-0">
                      <span className="text-sm text-white font-bold">✓</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-3">End-to-End Encryption</h4>
                      <p className="text-slate-400 text-lg">Your data is encrypted at rest and in transit.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-6">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center mt-2 flex-shrink-0">
                      <span className="text-sm text-white font-bold">✓</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-3">Granular Access</h4>
                      <p className="text-slate-400 text-lg">Control exactly what each doctor can see and when.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-6">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center mt-2 flex-shrink-0">
                      <span className="text-sm text-white font-bold">✓</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-3">Instant Revocation</h4>
                      <p className="text-slate-400 text-lg">Remove access instantly from any healthcare provider.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Access Control Preview */}
              <div className="lg:ml-16">
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold">Access Control</h3>
                    <span className="text-sm text-slate-400 font-medium">3 Active</span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-5 bg-slate-900/60 rounded-xl border border-slate-700/30">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
                          <span className="text-sm text-white font-bold">D1</span>
                        </div>
                        <div>
                          <p className="text-base font-semibold">Primary Care Doctor</p>
                          <p className="text-sm text-slate-400">General Practice</p>
                        </div>
                      </div>
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    </div>

                    <div className="flex items-center justify-between p-5 bg-slate-900/60 rounded-xl border border-slate-700/30">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-sm text-white font-bold">D2</span>
                        </div>
                        <div>
                          <p className="text-base font-semibold">Specialist Doctor</p>
                          <p className="text-sm text-slate-400">Cardiology</p>
                        </div>
                      </div>
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    </div>

                    <div className="flex items-center justify-between p-5 bg-slate-900/60 rounded-xl border border-slate-700/30">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-sm text-white font-bold">D3</span>
                        </div>
                        <div>
                          <p className="text-base font-semibold">Emergency Contact</p>
                          <p className="text-sm text-slate-400">Emergency Care</p>
                        </div>
                      </div>
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center">
            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-16 max-w-5xl mx-auto">
              <h2 className="text-5xl font-bold mb-6">
                Ready to Take Control of Your <span className="text-emerald-400">Health Data</span>?
              </h2>
              <p className="text-slate-400 text-xl mb-12 max-w-3xl mx-auto leading-relaxed">
                Join thousands of patients and healthcare providers who trust CareBridge for
                secure, seamless health record management.
              </p>

              <div className="flex items-center justify-center gap-6">
                <a
                  href="/auth/signup"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-10 py-5 rounded-xl transition !text-white text-lg"
                >
                  Create Free Account
                </a>
                <a
                  href="/auth/login"
                  className="border border-slate-600 hover:border-slate-400 px-10 py-5 rounded-xl transition text-lg font-semibold"
                >
                  Sign In
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 mt-32 py-12">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-sm font-bold">C</span>
            </div>
            <span className="text-xl font-bold">CareBridge</span>
          </div>
          <p className="text-slate-500 text-sm">
            © 2026 CareBridge. All rights reserved. Privacy first healthcare.
          </p>
        </div>
      </footer>
    </motion.div>
  );
}
