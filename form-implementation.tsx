/**
 * Form Implementation with UX Patterns
 *
 * Demonstrates:
 * 1. Credit card input with auto-formatting
 * 2. OTP verification modal with separate digit fields + paste support
 * 3. Loading states during submission
 */

'use client'

import React, { useState, useRef, useEffect } from 'react'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface FormData {
  cardNumber: string
  cardName: string
  expiryMonth: string
  expiryYear: string
  cvv: string
}

interface OtpModalState {
  isOpen: boolean
  otp: string[]
  isSubmitting: boolean
  error: string | null
}

interface SubmissionState {
  isLoading: boolean
  loadingMessage: string
}

// ============================================================================
// MAIN FORM COMPONENT
// ============================================================================

export function PaymentForm() {
  const [formData, setFormData] = useState<FormData>({
    cardNumber: '',
    cardName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
  })

  const [formErrors, setFormErrors] = useState<Partial<FormData>>({})
  const [submission, setSubmission] = useState<SubmissionState>({
    isLoading: false,
    loadingMessage: '',
  })
  const [otpModal, setOtpModal] = useState<OtpModalState>({
    isOpen: false,
    otp: ['', '', '', '', '', ''],
    isSubmitting: false,
    error: null,
  })

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate on submit (keep button always enabled)
    const errors = validateForm(formData)
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    // Clear previous errors and start loading
    setFormErrors({})
    setSubmission({ isLoading: true, loadingMessage: 'Validating card...' })

    // Simulate API call to initiate OTP
    await new Promise(resolve => setTimeout(resolve, 1200))
    setSubmission({ isLoading: false, loadingMessage: '' })

    // Open OTP modal after submission loading complete
    setOtpModal(prev => ({ ...prev, isOpen: true, error: null }))
  }

  const handleFormChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleOtpSubmit = async (otp: string) => {
    setOtpModal(prev => ({ ...prev, isSubmitting: true, error: null }))

    // Simulate OTP verification API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Simulate success (in real app, check actual OTP response)
    setOtpModal(prev => ({ ...prev, isSubmitting: false, isOpen: false }))
    alert('Payment verified! OTP: ' + otp)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Payment Details</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card Holder Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Card Holder Name
            </label>
            <input
              type="text"
              value={formData.cardName}
              onChange={e => handleFormChange('cardName', e.target.value)}
              placeholder="John Doe"
              className={`w-full px-4 py-3 rounded-lg bg-slate-700 text-white placeholder-slate-400 border transition-colors ${
                formErrors.cardName
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-slate-600 focus:border-blue-500'
              } focus:outline-none`}
            />
            {formErrors.cardName && (
              <span className="text-red-400 text-sm mt-1 block">
                {formErrors.cardName}
              </span>
            )}
          </div>

          {/* CREDIT CARD INPUT - Pattern 1 */}
          <CreditCardInput
            value={formData.cardNumber}
            onChange={value => handleFormChange('cardNumber', value)}
            error={formErrors.cardNumber}
          />

          {/* Expiry and CVV Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Expiry */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Month
              </label>
              <select
                value={formData.expiryMonth}
                onChange={e => handleFormChange('expiryMonth', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg bg-slate-700 text-white border transition-colors ${
                  formErrors.expiryMonth
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-slate-600 focus:border-blue-500'
                } focus:outline-none`}
              >
                <option value="">MM</option>
                {Array.from({ length: 12 }, (_, i) =>
                  String(i + 1).padStart(2, '0')
                ).map(month => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
              {formErrors.expiryMonth && (
                <span className="text-red-400 text-sm mt-1 block">
                  {formErrors.expiryMonth}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Year
              </label>
              <select
                value={formData.expiryYear}
                onChange={e => handleFormChange('expiryYear', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg bg-slate-700 text-white border transition-colors ${
                  formErrors.expiryYear
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-slate-600 focus:border-blue-500'
                } focus:outline-none`}
              >
                <option value="">YY</option>
                {Array.from({ length: 10 }, (_, i) =>
                  String(new Date().getFullYear() + i).slice(-2)
                ).map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              {formErrors.expiryYear && (
                <span className="text-red-400 text-sm mt-1 block">
                  {formErrors.expiryYear}
                </span>
              )}
            </div>
          </div>

          {/* CVV */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              CVV
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={formData.cvv}
              onChange={e =>
                handleFormChange('cvv', e.target.value.replace(/\D/g, ''))
              }
              placeholder="123"
              className={`w-full px-4 py-3 rounded-lg bg-slate-700 text-white placeholder-slate-400 border transition-colors ${
                formErrors.cvv
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-slate-600 focus:border-blue-500'
              } focus:outline-none`}
            />
            {formErrors.cvv && (
              <span className="text-red-400 text-sm mt-1 block">
                {formErrors.cvv}
              </span>
            )}
          </div>

          {/* Submit Button - Always Enabled */}
          <button
            type="submit"
            disabled={submission.isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-colors duration-200 mt-8"
          >
            {submission.isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {submission.loadingMessage}
              </div>
            ) : (
              'Continue to Verification'
            )}
          </button>
        </form>

        {/* OTP Modal - Pattern 2 & 3 */}
        <OtpModal
          isOpen={otpModal.isOpen}
          otp={otpModal.otp}
          isSubmitting={otpModal.isSubmitting}
          error={otpModal.error}
          onOtpChange={(otp: string[]) =>
            setOtpModal(prev => ({ ...prev, otp }))
          }
          onSubmit={handleOtpSubmit}
          onClose={() => setOtpModal(prev => ({ ...prev, isOpen: false }))}
        />
      </div>
    </div>
  )
}

// ============================================================================
// CREDIT CARD INPUT COMPONENT - Pattern 1
// ============================================================================

interface CreditCardInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
}

function CreditCardInput({ value, onChange, error }: CreditCardInputProps) {
  // Store raw digits only, display formatted
  const rawValue = value.replace(/\s/g, '')
  const formatted = rawValue.replace(/(\d{4})/g, '$1 ').trim()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    const digits = e.target.value.replace(/\D/g, '').slice(0, 16)
    onChange(digits)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        Card Number
      </label>
      <input
        type="text"
        inputMode="numeric"
        maxLength={19}
        value={formatted}
        onChange={handleChange}
        placeholder="4242 4242 4242 4242"
        className={`w-full px-4 py-3 rounded-lg bg-slate-700 text-white placeholder-slate-400 border transition-colors ${
          error
            ? 'border-red-500 focus:border-red-500'
            : 'border-slate-600 focus:border-blue-500'
        } focus:outline-none`}
      />
      {error && <span className="text-red-400 text-sm mt-1 block">{error}</span>}
      <p className="text-xs text-slate-400 mt-2">
        Test: 4242 4242 4242 4242
      </p>
    </div>
  )
}

// ============================================================================
// OTP MODAL COMPONENT - Pattern 2 & 3
// ============================================================================

interface OtpModalProps {
  isOpen: boolean
  otp: string[]
  isSubmitting: boolean
  error: string | null
  onOtpChange: (otp: string[]) => void
  onSubmit: (otp: string) => Promise<void>
  onClose: () => void
}

function OtpModal({
  isOpen,
  otp,
  isSubmitting,
  error,
  onOtpChange,
  onSubmit,
  onClose,
}: OtpModalProps) {
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])
  const [progressMessage, setProgressMessage] = useState('Verifying OTP...')

  // Progressive loading messages for long operations (>2s)
  useEffect(() => {
    if (!isSubmitting) return

    const messages = ['Verifying OTP...', 'Almost there...', 'Finalizing...']
    const timer = setInterval(() => {
      setProgressMessage(
        prev =>
          messages[Math.min(messages.indexOf(prev) + 1, messages.length - 1)]
      )
    }, 1500)

    return () => clearInterval(timer)
  }, [isSubmitting])

  // Handle individual OTP digit input
  const handleOtpChange = (index: number, value: string) => {
    // Only allow single digit
    const digit = value.replace(/\D/g, '').slice(0, 1)

    const newOtp = [...otp]
    newOtp[index] = digit

    onOtpChange(newOtp)

    // Auto-advance to next field
    if (digit && index < otp.length - 1) {
      otpRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all digits filled
    if (newOtp.every(d => d !== '') && !isSubmitting) {
      onSubmit(newOtp.join(''))
    }
  }

  // Handle backspace to go to previous field
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  // Handle paste - extract digits and fill fields
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()

    const pastedText = e.clipboardData.getData('text')
    const digits = pastedText.replace(/\D/g, '').slice(0, otp.length)

    const newOtp = [...otp]
    digits.split('').forEach((digit, i) => {
      newOtp[i] = digit
    })

    onOtpChange(newOtp)

    // Auto-submit if full
    if (digits.length === otp.length && !isSubmitting) {
      onSubmit(digits)
    }

    // Focus last field
    if (digits.length > 0) {
      otpRefs.current[Math.min(digits.length, otp.length - 1)]?.focus()
    }
  }

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, isSubmitting, onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Modal Backdrop - outside click closes */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={e => {
          if (e.target === e.currentTarget && !isSubmitting) {
            onClose()
          }
        }}
      >
        {/* Modal Content */}
        <div className="bg-slate-800 rounded-lg shadow-2xl p-8 max-w-sm w-full mx-4 border border-slate-700">
          {/* Close Button */}
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="float-right text-slate-400 hover:text-slate-200 text-2xl disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Close modal"
          >
            ×
          </button>

          <h2 className="text-2xl font-bold text-white mb-2">
            Verify Payment
          </h2>
          <p className="text-slate-400 mb-6">
            Enter the 6-digit code sent to your registered email
          </p>

          {/* OTP Input Fields */}
          <div className="flex gap-2 mb-6 justify-center">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => {
                  otpRefs.current[index] = el
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleOtpChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                disabled={isSubmitting}
                autoFocus={index === 0}
                className="w-12 h-12 text-center text-xl font-bold bg-slate-700 text-white border-2 border-slate-600 rounded-lg focus:border-blue-500 focus:outline-none disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
              />
            ))}
          </div>

          {/* Paste Button for Desktop */}
          <button
            type="button"
            onClick={async () => {
              try {
                const text = await navigator.clipboard.readText()
                const digits = text.replace(/\D/g, '').slice(0, otp.length)
                const newOtp = [...otp]
                digits.split('').forEach((d, i) => {
                  newOtp[i] = d
                })
                onOtpChange(newOtp)

                if (digits.length === otp.length && !isSubmitting) {
                  onSubmit(digits)
                }
              } catch {
                // Clipboard permission denied
              }
            }}
            disabled={isSubmitting}
            className="w-full text-sm text-blue-400 hover:text-blue-300 disabled:text-slate-500 mb-4 py-2"
          >
            Paste from clipboard
          </button>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900 bg-opacity-30 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Loading State with Progressive Messages */}
          {isSubmitting && (
            <div className="flex items-center justify-center gap-2 text-slate-300 mb-4">
              <span className="inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">{progressMessage}</span>
            </div>
          )}

          {/* Submit Button - Always visible, disabled during submission */}
          <button
            onClick={() => {
              const fullOtp = otp.join('')
              if (fullOtp.length === otp.length && !isSubmitting) {
                onSubmit(fullOtp)
              }
            }}
            disabled={otp.some(d => !d) || isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors duration-200"
          >
            {isSubmitting ? 'Verifying...' : 'Verify OTP'}
          </button>
        </div>
      </div>
    </>
  )
}

// ============================================================================
// VALIDATION HELPER
// ============================================================================

function validateForm(data: FormData): Partial<FormData> {
  const errors: Partial<FormData> = {}

  if (!data.cardName.trim()) {
    errors.cardName = 'Card holder name is required'
  }

  if (!data.cardNumber || data.cardNumber.length < 13) {
    errors.cardNumber = 'Valid card number is required'
  }

  if (!data.expiryMonth) {
    errors.expiryMonth = 'Expiry month required'
  }

  if (!data.expiryYear) {
    errors.expiryYear = 'Expiry year required'
  }

  if (!data.cvv || data.cvv.length < 3) {
    errors.cvv = 'Valid CVV required'
  }

  return errors
}
