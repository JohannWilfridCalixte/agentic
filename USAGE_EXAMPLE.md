# Usage Example & Setup

## Quick Start

### 1. Import the Component

```tsx
import { PaymentForm } from './form-implementation'

export default function Page() {
  return <PaymentForm />
}
```

### 2. CSS Requirements

The implementation uses Tailwind CSS classes. Ensure your project has Tailwind configured:

```json
// tailwind.config.ts
{
  "content": [
    "./src/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}"
  ],
  "theme": {
    "extend": {}
  }
}
```

### 3. Run the Form

```bash
npm run dev
# Open http://localhost:3000
```

---

## What Each Section Does

### Form Section (Payment Details)

```
┌─────────────────────────────────────┐
│         Payment Details             │
├─────────────────────────────────────┤
│ Card Holder Name                    │
│ ┌─────────────────────────────────┐ │
│ │ John Doe                        │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Card Number                         │
│ ┌─────────────────────────────────┐ │
│ │ 4242 4242 4242 4242            │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Month              Year             │
│ ┌──────────────┐ ┌──────────────┐  │
│ │ 12           │ │ 25           │  │
│ └──────────────┘ └──────────────┘  │
│                                     │
│ CVV                                 │
│ ┌─────────────────────────────────┐ │
│ │ 123                             │ │
│ └─────────────────────────────────┘ │
│                                     │
│    [Continue to Verification]      │
└─────────────────────────────────────┘
```

**Features:**
- Real-time inline error display
- Errors clear when user starts typing
- Always-enabled submit button
- Loading spinner + message during submission

### OTP Modal (After Form Submission)

```
┌──────────────────────────────────────┐
│                                  ×   │
│         Verify Payment              │
│                                      │
│ Enter 6-digit code sent to email    │
│                                      │
│    ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐       │
│    │ │ │ │ │ │ │ │ │ │ │ │       │
│    └─┘ └─┘ └─┘ └─┘ └─┘ └─┘       │
│                                      │
│          Paste from clipboard       │
│                                      │
│  ⟲ Verifying OTP...                │
│                                      │
│         [Verify OTP]                │
└──────────────────────────────────────┘
```

**Features:**
- 6 separate digit fields
- Auto-advance after each digit
- Auto-submit when complete
- Paste support for full code
- Progressive loading messages
- Three ways to close (X, Escape, outside)

---

## User Flows

### Happy Path: Typing

1. User fills form fields
2. Clicks "Continue to Verification"
3. Form validates on submit
4. Shows loading spinner: "Validating card..."
5. OTP modal opens
6. User types first digit → focus moves to field 2
7. User types remaining digits → form auto-submits
8. Shows "Verifying OTP..." → "Almost there..." → "Finalizing..."
9. Success!

### Alternative: Paste OTP

1. Form submitted, OTP modal opens
2. User copies code: `123456`
3. User clicks "Paste from clipboard"
4. All 6 fields fill instantly
5. Form auto-submits
6. Success!

### Error Path: Invalid Card

1. User leaves card number empty
2. Clicks "Continue to Verification"
3. Card number field shows: "Valid card number is required"
4. User types card number
5. Error message disappears in real-time
6. Resubmits

### Closing Modal: Escape Key

1. OTP modal is open
2. User presses Escape
3. Modal closes (if not submitting)
4. User is back at form

---

## Component Props & States

### PaymentForm (Main Component)

**Internal State:**
```tsx
formData: {
  cardNumber: string      // Raw digits: "4242424242424242"
  cardName: string        // "John Doe"
  expiryMonth: string     // "12"
  expiryYear: string      // "25"
  cvv: string            // "123"
}

formErrors: Partial<FormData>  // Field-specific errors

submission: {
  isLoading: boolean           // During form submission
  loadingMessage: string       // "Validating card..."
}

otpModal: {
  isOpen: boolean              // Modal visibility
  otp: string[]               // ["1", "2", "3", "4", "5", "6"]
  isSubmitting: boolean       // During OTP verification
  error: string | null        // OTP-specific errors
}
```

### CreditCardInput Component

**Props:**
```tsx
interface CreditCardInputProps {
  value: string          // Raw digits only
  onChange: (value: string) => void
  error?: string        // Error message to display
}
```

### OtpModal Component

**Props:**
```tsx
interface OtpModalProps {
  isOpen: boolean
  otp: string[]                        // 6 digit array
  isSubmitting: boolean
  error: string | null
  onOtpChange: (otp: string[]) => void
  onSubmit: (otp: string) => Promise<void>
  onClose: () => void
}
```

---

## Customization Guide

### Change Card Formatting

```tsx
// Current: 4242 4242 4242 4242 (groups of 4)
const formatted = rawValue.replace(/(\d{4})/g, '$1 ').trim()

// Alternative: 4242-4242-4242-4242 (groups of 4 with dash)
const formatted = rawValue.replace(/(\d{4})/g, '$1-').slice(0, -1)

// Alternative: 4242424242424242 (no spacing)
const formatted = rawValue
```

### Change OTP Length

```tsx
// Current: 6 digits
otp: ['', '', '', '', '', '']

// Change to 4 digits:
otp: ['', '', '', '']

// Change to 8 digits:
otp: ['', '', '', '', '', '', '', '']
```

### Change Loading Messages

```tsx
// Current messages (OTP verification)
const messages = ['Verifying OTP...', 'Almost there...', 'Finalizing...']

// Custom messages
const messages = [
  'Checking your code...',
  'Validating payment...',
  'Finalizing transaction...',
  'Processing...'
]
```

### Change Colors

```tsx
// Current: Blue accent (blue-600, blue-500, etc.)
className="bg-blue-600 hover:bg-blue-700"

// Change to green:
className="bg-green-600 hover:bg-green-700"

// Change accent border:
className="border-blue-500" → "border-green-500"
```

### Change Validation Rules

```tsx
// Current: Card must be 13+ digits
if (!data.cardNumber || data.cardNumber.length < 13) {
  errors.cardNumber = 'Valid card number is required'
}

// Stricter: Exactly 16 digits
if (data.cardNumber.length !== 16) {
  errors.cardNumber = 'Card must be exactly 16 digits'
}
```

---

## Testing the Implementation

### Test Card Numbers

```
Valid: 4242 4242 4242 4242
       3782 822463 10005 (Amex - 15 digits)
```

### Test OTP Codes

```
Single paste: 123456
Paste with spaces: 1 2 3 4 5 6
Paste with dashes: 1-2-3-4-5-6
```

### Keyboard Interactions

```
Tab         → Move to next field
Shift+Tab   → Move to previous field
Escape      → Close OTP modal
Backspace   → Go to previous OTP field
```

---

## Common Issues & Solutions

### Issue: Card input shows as `4242424242424242`

**Problem:** Using `value={rawValue}` instead of `value={formatted}`

**Solution:**
```tsx
// Wrong
<input value={rawValue} ... />

// Right
<input value={formatted} ... />
```

### Issue: OTP doesn't auto-submit

**Problem:** Check condition not triggering

**Solution:**
```tsx
// Debug: log the OTP array
console.log(newOtp, newOtp.every(d => d !== ''))

// Ensure every digit filled:
if (newOtp.every(d => d !== '') && !isSubmitting) {
  onSubmit(newOtp.join(''))
}
```

### Issue: Modal won't close

**Problem:** `isSubmitting` is true

**Solution:** Check that OTP submission completes and sets `isSubmitting: false`

```tsx
const handleOtpSubmit = async (otp: string) => {
  setOtpModal(prev => ({ ...prev, isSubmitting: true }))
  await api.verifyOtp(otp)  // Must complete
  setOtpModal(prev => ({ ...prev, isSubmitting: false, isOpen: false }))
  // Now modal can close
}
```

---

## Performance Considerations

- All state updates are local (no external API calls in demo)
- Refs used for OTP field focus (efficient DOM access)
- Progressive messages use `setInterval` cleared on unmount
- Modal backdrop click delegated (not on every overlay)

### For Production

Replace simulated delays with real API calls:

```tsx
// Form submission
const response = await fetch('/api/initiate-payment', {
  method: 'POST',
  body: JSON.stringify(formData)
})

// OTP verification
const result = await fetch('/api/verify-otp', {
  method: 'POST',
  body: JSON.stringify({ otp: otpString })
})
```

---

## Accessibility Notes

- ✓ All inputs have associated labels
- ✓ Error messages linked to inputs
- ✓ Form semantic HTML (form, input, button elements)
- ✓ Modal has proper focus management
- ✓ Keyboard navigation fully supported
- ✓ Loading state announced (spinner + message text)
- ✓ Color not sole indicator (red text + icon for errors)

---

## Files & Line References

| What | File | Lines |
|------|------|-------|
| Full implementation | `form-implementation.tsx` | 1-470 |
| CreditCardInput | `form-implementation.tsx` | 140-170 |
| OtpModal | `form-implementation.tsx` | 180-330 |
| Loading states | `form-implementation.tsx` | 250-270 |
| Validation | `form-implementation.tsx` | 450-470 |
