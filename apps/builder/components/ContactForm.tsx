'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle2, Loader2 } from 'lucide-react'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60, 'Name must be under 60 characters'),
  email: z.string().email('Please enter a valid email address'),
  business_type: z.enum([
    'Coffee Shop', 'Bakery', 'Clothing Brand', 'Fitness',
    'Handmade Products', 'Restaurant', 'Beauty', 'Other'
  ], {
    required_error: 'Please select a business type'
  }),
  message: z.string().min(20, 'Message must be at least 20 characters').max(1000, 'Message must be under 1000 characters')
})

type ContactFormData = z.infer<typeof contactSchema>

export default function ContactForm() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      business_type: 'Other',
      message: ''
    }
  })

  const onSubmit = async (data: ContactFormData) => {
    setSubmitError(null)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const resData = await res.json()
      if (!res.ok) {
        throw new Error(resData.error || 'Something went wrong. Please try again.')
      }

      setIsSubmitted(true)
      reset()
    } catch (err: any) {
      setSubmitError(err?.message || 'Something went wrong. Please try again.')
    }
  }

  if (isSubmitted) {
    return (
      <div 
        className="mx-auto w-full max-w-[560px] rounded-2xl p-8 text-center transition-all animate-in fade-in zoom-in duration-300"
        style={{ 
          backgroundColor: 'var(--bg-surface)', 
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div className="flex justify-center">
          <CheckCircle2 size={48} className="text-[#16A34A] animate-bounce" />
        </div>
        <h3 className="mt-4 text-lg font-medium text-[var(--text-primary)]">
          Message sent!
        </h3>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          We&apos;ll get back to you within 24 hours.
        </p>
        <button
          onClick={() => setIsSubmitted(false)}
          className="mt-6 text-xs font-semibold underline underline-offset-4 hover:opacity-80 transition-opacity"
          style={{ color: 'var(--accent)' }}
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <div 
      className="mx-auto w-full max-w-[560px] rounded-2xl p-8 transition-all"
      style={{ 
        backgroundColor: 'var(--bg-surface)', 
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <div className="text-center mb-6">
        <h2 className="font-serif text-[28px] leading-tight font-bold text-[var(--text-primary)]">
          Talk to the founder
        </h2>
        <p className="mt-2 text-[15px] text-[var(--text-secondary)]">
          Have a question, idea, or just want to say hi? We read every message.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-xs font-semibold mb-1.5 text-[var(--text-primary)]">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            placeholder="Shubranshu Shekhar"
            {...register('name')}
            disabled={isSubmitting}
            className="w-full rounded-[10px] px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--text-primary)]"
            style={{ 
              backgroundColor: 'var(--bg-subtle)', 
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)'
            }}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-xs font-semibold mb-1.5 text-[var(--text-primary)]">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            placeholder="founder@mybrand.com"
            {...register('email')}
            disabled={isSubmitting}
            className="w-full rounded-[10px] px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--text-primary)]"
            style={{ 
              backgroundColor: 'var(--bg-subtle)', 
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)'
            }}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="business_type" className="block text-xs font-semibold mb-1.5 text-[var(--text-primary)]">
            Business type <span className="text-red-500">*</span>
          </label>
          <select
            id="business_type"
            {...register('business_type')}
            disabled={isSubmitting}
            className="w-full rounded-[10px] px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--text-primary)] cursor-pointer"
            style={{ 
              backgroundColor: 'var(--bg-subtle)', 
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)'
            }}
          >
            <option value="Coffee Shop">Coffee Shop</option>
            <option value="Bakery">Bakery</option>
            <option value="Clothing Brand">Clothing Brand</option>
            <option value="Fitness">Fitness</option>
            <option value="Handmade Products">Handmade Products</option>
            <option value="Restaurant">Restaurant</option>
            <option value="Beauty">Beauty</option>
            <option value="Other">Other</option>
          </select>
          {errors.business_type && (
            <p className="mt-1 text-xs text-red-500">{errors.business_type.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="message" className="block text-xs font-semibold mb-1.5 text-[var(--text-primary)]">
            Message <span className="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            rows={4}
            placeholder="Share your thoughts, feedback or product questions here..."
            {...register('message')}
            disabled={isSubmitting}
            className="w-full rounded-[10px] px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--text-primary)] resize-none"
            style={{ 
              backgroundColor: 'var(--bg-subtle)', 
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)'
            }}
          />
          {errors.message && (
            <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-[10px] py-3 text-sm font-semibold transition-opacity flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
          style={{ 
            backgroundColor: 'var(--bg-inverse)', 
            color: 'var(--text-inverse)'
          }}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Sending...
            </>
          ) : (
            'Send message'
          )}
        </button>

        {submitError && (
          <p className="text-center text-xs text-red-500 mt-2">
            {submitError}
          </p>
        )}
      </form>
    </div>
  )
}
