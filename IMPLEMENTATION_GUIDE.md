# Form Implementation with UX Patterns

Complete implementation applying three critical UX patterns from `ux-patterns` skill.

## Overview

This implementation demonstrates:
1. **Credit Card Input** - Auto-formatting with `inputMode="numeric"`
2. **OTP Modal** - Separate digit fields with paste support & auto-submit
3. **Loading States** - Progressive messages for operations >2s

Full code: `/Users/johann/development/worspaces/johann/agentic/form-implementation.tsx`

---

## Pattern 1: Credit Card Input

**What it does:** Formats user input automatically with spaces while storing raw digits.

### Key Implementation

```tsx
function CreditCardInput({ value, onChange, error }: CreditCardInputProps) {
  // Store raw digits only, display formatted
  const rawValue = value.replace(/\s/g, '')
  const formatted = rawValue.replace(/(\d{4})/g, '$1 ').trim()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits, max 16
    const digits = e.target.value.replace(/\D/g, '').slice(0, 16)
    onChange(digits)
  }

  return (
    <input
      type="text"
      inputMode="numeric"        // ✓ NOT type="number"
      maxLength={19}
      value={formatted}          // Display formatted
      onChange={handleChange}    // Store raw
      placeholder="4242 4242 4242 4242"
    />
  )
}
```

### Applied Patterns

| Pattern | Applied |
|---------|---------|
| `inputMode="numeric"` | ✓ Opens numeric keyboard on mobile |
| Store raw, display formatted | ✓ Raw `4242424242424242`, display `4242 4242 4242 4242` |
| Only digits allowed | ✓ `.replace(/\D/g, '')` |
| Max length validation | ✓ `.slice(0, 16)` |

### Why This Works

- `type="number"` breaks spacing (becomes raw number)
- `inputMode="numeric"` opens correct keyboard without side effects
- User sees helpful spacing; backend gets clean data
- Maximum length prevents incomplete entries

---

## Pattern 2: OTP Modal

**What it does:** Six separate digit fields with paste support, auto-advance, and auto-submit.

### Key Implementation

#### Individual Digit Input with Auto-Advance

```tsx
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

  // Auto-submit when complete
  if (newOtp.every(d => d !== '') && !isSubmitting) {
    onSubmit(newOtp.join(''))
  }
}
```

#### Paste Support

```tsx
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
}
```

#### Backspace Navigation

```tsx
const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
  if (e.key === 'Backspace' && !otp[index] && index > 0) {
    otpRefs.current[index - 1]?.focus()
  }
}
```

#### Modal Closing (Three Methods)

```tsx
// Outside click closes (but not during submission)
<div
  onClick={e => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose()
    }
  }}
>

// Escape key closes
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

// X button closes
<button onClick={onClose} disabled={isSubmitting}>
  ×
</button>
```

### Applied Patterns

| Pattern | Applied |
|---------|---------|
| Separate digit fields | ✓ Array of 6 inputs, one per digit |
| Paste support | ✓ `handlePaste` extracts & fills all digits |
| Auto-advance | ✓ Focus next field after digit entered |
| Auto-submit | ✓ Submit when all 6 digits filled |
| Close on X | ✓ Button with onClick handler |
| Close on Escape | ✓ keydown listener |
| Close on outside click | ✓ Modal backdrop handler |
| Paste button (desktop) | ✓ Clipboard API button below fields |

### Why This Works

- Users can type naturally and see auto-advance
- Paste works seamlessly (no "code" field pasting only part)
- Multiple closing methods (accessibility + UX)
- Backspace goes back, not just clears current
- Submit disabled only during actual submission

---

## Pattern 3: Loading States

**What it does:** Show appropriate feedback based on operation duration.

### Implementation

#### Progressive Messages for Long Operations (>2s)

```tsx
const [progressMessage, setProgressMessage] = useState('Verifying OTP...')

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
```

#### Loading States in UI

```tsx
// Form submit button loading state
<button type="submit" disabled={submission.isLoading}>
  {submission.isLoading ? (
    <div className="flex items-center justify-center gap-2">
      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      {submission.loadingMessage}
    </div>
  ) : (
    'Continue to Verification'
  )}
</button>

// OTP modal loading with spinner + message
{isSubmitting && (
  <div className="flex items-center justify-center gap-2 text-slate-300 mb-4">
    <span className="inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    <span className="text-sm">{progressMessage}</span>
  </div>
)}
```

### Applied Patterns

| Duration | Pattern | Applied |
|----------|---------|---------|
| <300ms | Nothing | ✓ Fast API calls skip state |
| 300ms-2s | Spinner | ✓ Form submission shows spinner |
| >2s | Progressive messages | ✓ OTP verification shows 3 messages |

### Why This Works

- No loading feedback for fast operations (reduces noise)
- Spinner for medium operations (tells user something's happening)
- Progressive messages for long operations (reassures user it's not stuck)

---

## Form Structure Summary

### Validation Strategy

**Keep submit button always enabled**, validate on submit:

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  // Validate ON submit, not on state change
  const errors = validateForm(formData)
  if (Object.keys(errors).length > 0) {
    setFormErrors(errors)
    return
  }

  // Only disable button during actual submission
  setSubmission({ isLoading: true, loadingMessage: 'Validating card...' })
}
```

### Error Display

Inline errors near fields, not floating toasts:

```tsx
{formErrors.cardNumber && (
  <span className="text-red-400 text-sm mt-1 block">
    {formErrors.cardNumber}
  </span>
)}
```

### Component Hierarchy

```
PaymentForm (main form)
├── CreditCardInput (pattern 1)
├── Form fields (name, expiry, CVV)
├── Submit button with loading state (pattern 3)
└── OtpModal (pattern 2 & 3)
    ├── OTP digit inputs (separate fields)
    ├── Paste button
    └── Verify button with loading state
```

---

## Testing Checklist

- [ ] Credit card: Type digits, see auto-formatting
- [ ] Credit card: Paste full number, auto-formats
- [ ] OTP: Type digit, focus advances to next field
- [ ] OTP: Type 6 digits, auto-submits
- [ ] OTP: Paste code, all fields fill + auto-submit
- [ ] OTP: Backspace on empty field, goes to previous
- [ ] OTP: Click outside modal, closes (unless submitting)
- [ ] OTP: Press Escape, closes (unless submitting)
- [ ] OTP: Click X button, closes (unless submitting)
- [ ] Form: Submit with empty fields, shows inline errors
- [ ] Form: Submit button enabled always (never disabled by validation)
- [ ] Form: Loading state shows spinner + message
- [ ] OTP: Long operation shows progressive messages

---

## Key Decisions

1. **No disabled button on invalid form** - Better UX, inline errors on submit
2. **Progressive messages over skeleton** - More reassuring for OTP verification
3. **Three modal close methods** - Covers all user expectations
4. **Paste button on desktop** - Fallback if clipboard permission issues
5. **Raw card storage** - Easier backend processing, cleaner data
6. **Auto-advance/submit on OTP** - Feels fast, no manual button click
7. **Inline feedback** - Context-aware, no toast spam
