'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface BasicProfileFormProps {
  userRole: 'PATIENT' | 'DOCTOR'
  onSubmit: (data: any) => Promise<void>
  isLoading: boolean
}

export default function BasicProfileForm({ userRole, onSubmit, isLoading }: BasicProfileFormProps) {
  const [formData, setFormData] = useState<any>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  if (userRole === 'PATIENT') {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <h3 className="text-xl font-bold text-white mb-6">Complete Your Basic Profile</h3>
        
        {/* Age */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Age *</label>
          <input
            type="number"
            min="1"
            max="120"
            value={formData.age || ''}
            onChange={(e) => updateField('age', e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Gender *</label>
          <select
            value={formData.gender || ''}
            onChange={(e) => updateField('gender', e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          >
            <option value="">Select gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
            <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
          </select>
        </div>

        {/* Primary Problem */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Primary Health Concern *</label>
          <input
            type="text"
            value={formData.primaryProblem || ''}
            onChange={(e) => updateField('primaryProblem', e.target.value)}
            placeholder="e.g., diabetes, hypertension, anxiety"
            className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>

        {/* Symptoms */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Main Symptoms (up to 3) *</label>
          <div className="space-y-2">
            {[0, 1, 2].map((index) => (
              <input
                key={index}
                type="text"
                value={formData.symptoms?.[index] || ''}
                onChange={(e) => {
                  const symptoms = [...(formData.symptoms || [])]
                  symptoms[index] = e.target.value
                  updateField('symptoms', symptoms.filter(s => s.trim()))
                }}
                placeholder={`Symptom ${index + 1}${index === 0 ? ' (required)' : ' (optional)'}`}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required={index === 0}
              />
            ))}
          </div>
        </div>

        {/* Consultation Preference */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Preferred Consultation Method *</label>
          <select
            value={formData.consultationPreference || ''}
            onChange={(e) => updateField('consultationPreference', e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          >
            <option value="">Select preference</option>
            <option value="IN_PERSON">In-person visits</option>
            <option value="VIDEO_CALL">Video calls</option>
            <option value="PHONE_CALL">Phone calls</option>
            <option value="CHAT">Text/chat</option>
          </select>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading}
          className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-600 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          {isLoading ? 'Saving...' : 'Complete Basic Profile'}
        </motion.button>
      </form>
    )
  }

  // Doctor form
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-xl font-bold text-white mb-6">Complete Your Doctor Profile</h3>
      
      {/* Specialization */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Specialization *</label>
        <input
          type="text"
          value={formData.specialization || ''}
          onChange={(e) => updateField('specialization', e.target.value)}
          placeholder="e.g., Cardiology, Endocrinology, General Medicine"
          className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
      </div>

      {/* Experience Years */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Years of Experience *</label>
        <input
          type="number"
          min="0"
          max="50"
          value={formData.experienceYears || ''}
          onChange={(e) => updateField('experienceYears', e.target.value)}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
      </div>

      {/* Conditions Treated */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Conditions You Treat *</label>
        <div className="space-y-2">
          {[0, 1, 2, 3, 4].map((index) => (
            <input
              key={index}
              type="text"
              value={formData.conditionsTreated?.[index] || ''}
              onChange={(e) => {
                const conditions = [...(formData.conditionsTreated || [])]
                conditions[index] = e.target.value
                updateField('conditionsTreated', conditions.filter(c => c.trim()))
              }}
              placeholder={`Condition ${index + 1}${index === 0 ? ' (required)' : ' (optional)'}`}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required={index === 0}
            />
          ))}
        </div>
      </div>

      {/* Consultation Mode */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Consultation Mode *</label>
        <select
          value={formData.consultationMode || ''}
          onChange={(e) => updateField('consultationMode', e.target.value)}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        >
          <option value="">Select mode</option>
          <option value="IN_PERSON_ONLY">In-person only</option>
          <option value="ONLINE_ONLY">Online only</option>
          <option value="BOTH">Both in-person and online</option>
        </select>
      </div>

      {/* Availability */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Availability *</label>
        <textarea
          value={formData.availability || ''}
          onChange={(e) => updateField('availability', e.target.value)}
          placeholder="e.g., Monday-Friday 9AM-5PM, Weekends by appointment"
          rows={3}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={isLoading}
        className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-600 text-white font-semibold py-3 rounded-lg transition-colors"
      >
        {isLoading ? 'Saving...' : 'Complete Basic Profile'}
      </motion.button>
    </form>
  )
}