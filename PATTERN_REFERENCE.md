# Quick Pattern Reference

## 1. Credit Card Input

**File:** `/Users/johann/development/worspaces/johann/agentic/form-implementation.tsx` (lines ~140-170)

**Core Pattern:**
```tsx
const formatted = rawValue.replace(/(\d{4})/g, '$1 ').trim()

<input
  type="text"                    // NOT type="number"
  inputMode="numeric"            // Opens numeric keyboard
  value={formatted}              // Show: 4242 4242 4242 4242
  onChange={e => onChange(e.target.value.replace(/\D/g, ''))}  // Store: 4242424242424242
/>
```

**Checklist:**
- [ ] Use `inputMode="numeric"`, not `type="number"`
- [ ] Store raw digits, display formatted
- [ ] `.replace(/\D/g, '')` strips non-digits
- [ ] `.replace(/(\d{4})/g, '$1 ')` adds spacing
- [ ] Max length prevents over-entry

**Key Line:** `value={formatted}` displays visual, `onChange` captures raw

---

## 2. OTP Modal

**File:** `/Users/johann/development/worspaces/johann/agentic/form-implementation.tsx` (lines ~210-330)

### Separate Digit Fields
```tsx
{otp.map((digit, index) => (
  <input
    key={index}
    type="text"
    inputMode="numeric"
    maxLength={1}
    value={digit}
    onChange={e => handleOtpChange(index, e.target.value)}
  />
))}
```

### Auto-Advance
```tsx
if (digit && index < otp.length - 1) {
  otpRefs.current[index + 1]?.focus()
}
```

### Auto-Submit
```tsx
if (newOtp.every(d => d !== '') && !isSubmitting) {
  onSubmit(newOtp.join(''))
}
```

### Paste Support
```tsx
const handlePaste = (e: React.ClipboardEvent) => {
  e.preventDefault()
  const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, otp.length)
  // Fill all fields from pasted digits
  // Auto-submit if complete
}
```

### Backspace Navigation
```tsx
if (e.key === 'Backspace' && !otp[index] && index > 0) {
  otpRefs.current[index - 1]?.focus()
}
```

### Three Modal Closing Methods
```tsx
// Outside click
<div onClick={e => e.target === e.currentTarget && onClose()}>

// Escape key
useEffect(() => {
  const handle = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }
  document.addEventListener('keydown', handle)
}, [])

// X button
<button onClick={onClose}>×</button>
```

**Checklist:**
- [ ] Separate inputs for each digit
- [ ] `inputMode="numeric"`, `maxLength={1}`
- [ ] Auto-advance after entering digit
- [ ] Auto-submit when all digits filled
- [ ] Paste fills all fields + auto-submits
- [ ] Backspace on empty goes to previous field
- [ ] Close on outside click (if not submitting)
- [ ] Close on Escape key (if not submitting)
- [ ] X button always visible

**Key Lines:**
- Auto-advance: `otpRefs.current[index + 1]?.focus()`
- Paste: `e.clipboardData.getData('text')`
- Submit when done: `otp.every(d => d !== '')`

---

## 3. Loading States

**File:** `/Users/johann/development/worspaces/johann/agentic/form-implementation.tsx` (lines ~250-270)

### Duration Guide
```
< 300ms   → No feedback (too fast)
300ms-2s  → Spinner only
> 2s      → Spinner + progressive messages
```

### Implementation for >2s
```tsx
const messages = ['Verifying OTP...', 'Almost there...', 'Finalizing...']
const [msgIndex, setMsgIndex] = useState(0)

useEffect(() => {
  const timer = setInterval(
    () => setMsgIndex(i => Math.min(i + 1, messages.length - 1)),
    1500  // Change message every 1.5s
  )
  return () => clearInterval(timer)
}, [isSubmitting])

// Display
<div className="flex gap-2">
  <Spinner />
  <span>{messages[msgIndex]}</span>
</div>
```

### Spinner Implementation
```tsx
<span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
```

### Disable Button During Loading
```tsx
<button
  type="submit"
  disabled={submission.isLoading}  // Only disable during actual submission
>
  {submission.isLoading ? (
    <>
      <Spinner />
      {submission.loadingMessage}
    </>
  ) : (
    'Continue'
  )}
</button>
```

**Checklist:**
- [ ] No loading state for <300ms operations
- [ ] Spinner for 300ms-2s operations
- [ ] Progressive messages for >2s operations
- [ ] Button disabled ONLY during submission (not on validation)
- [ ] Loading messages are concrete, not generic
- [ ] Progress indicator shows it's working (not stuck)

**Key Lines:**
- Progressive messages: `Math.min(i + 1, messages.length - 1)` prevents overflow
- Timer: `setInterval(..., 1500)` updates every 1.5s
- Disable: `disabled={isLoading}` only

---

## Common Mistakes & Fixes

| Mistake | Wrong | Right |
|---------|-------|-------|
| Card input type | `type="number"` | `inputMode="numeric"` |
| Card formatting | Show raw in input | Show formatted, store raw |
| OTP single field | One input for 6 digits | Six inputs, one per digit |
| OTP no paste | Manual typing only | Paste support + auto-fill |
| Submit button | `disabled={!isValid}` | Always enabled, validate on submit |
| Loading too long | Static spinner | Progressive messages after 2s |
| Modal close | X button only | X + Escape + outside click |
| Feedback | Toast notifications | Inline near the action |

---

## Integration Checklist

- [ ] Credit card input uses correct `inputMode`
- [ ] Card displays `4242 4242 4242 4242`, stores `4242424242424242`
- [ ] OTP has 6 separate fields
- [ ] OTP auto-advances & auto-submits
- [ ] OTP supports paste with auto-fill
- [ ] OTP closes on X, Escape, outside click
- [ ] Form submit button always enabled
- [ ] Form shows inline errors on submit
- [ ] Loading states show spinner + message
- [ ] Long operations show progressive messages
- [ ] All loading indicators disable on submission

---

## Files Reference

| File | Purpose |
|------|---------|
| `/Users/johann/development/worspaces/johann/agentic/form-implementation.tsx` | Complete working implementation (470 lines) |
| `/Users/johann/development/worspaces/johann/agentic/IMPLEMENTATION_GUIDE.md` | Detailed pattern explanation |
| `/Users/johann/development/worspaces/johann/agentic/PATTERN_REFERENCE.md` | This file - quick lookup |
