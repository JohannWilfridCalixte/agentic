---
name: agentic:skill:ux-patterns
description: Use when implementing forms, inputs, modals, loading states, or user feedback. Covers OTP verification, credit card inputs, dropdowns, toast vs inline feedback, skeleton loading.
---

# UX Good Patterns

## Quick Reference

| Component | Good | Bad |
|-----------|------|-----|
| **Credit card input** | Auto-format with spaces, `inputmode="numeric"` | Raw input, `type="number"` |
| **OTP fields** | Separate digits + paste support + auto-submit | Single field or no paste |
| **Submit button** | Always enabled, validate on submit | Disabled until "valid" |
| **Loading >2s** | Progressive messages or skeleton | Static "Loading..." spinner |
| **Modal close** | X + outside click + Escape key | X button only |
| **Feedback** | Inline near action | Toast notification |
| **Options 2-5** | Radio buttons/cards visible | Dropdown |
| **Options 10+** | Searchable combobox | Long dropdown |

## Patterns

### Input Formatting

**Credit cards, phone, IBAN:** Auto-format with visual separators.

```tsx
// Store raw, display formatted
const [raw, setRaw] = useState('')
const formatted = raw.replace(/(\d{4})/g, '$1 ').trim()

<input
  inputMode="numeric"        // NOT type="number"
  value={formatted}
  placeholder="4242 4242 4242 4242"
  onChange={e => setRaw(e.target.value.replace(/\D/g, ''))}
/>
```

### OTP Verification

**Must have:** Separate digit fields + paste support + auto-submit on last digit.

```tsx
const handlePaste = (e: ClipboardEvent) => {
  const digits = e.clipboardData.getData('text').replace(/\D/g, '')
  digits.split('').forEach((d, i) => fields[i]?.setValue(d))
  if (digits.length === maxLength) submitOtp(digits)
}

const handleChange = (index: number, value: string) => {
  // Auto-advance to next field
  if (value && index < maxLength - 1) fields[index + 1].focus()
  // Auto-submit when complete
  if (getAllDigits().length === maxLength) submitOtp(getAllDigits())
}
```

**Desktop:** Add visible "Paste" button (browser permission prompt is acceptable).

### Modal Closing

Support all three methods:

```tsx
<dialog
  onClick={e => e.target === e.currentTarget && close()}  // outside click
  onKeyDown={e => e.key === 'Escape' && close()}          // escape key
>
  <button onClick={close}>×</button>                       // X button
  {children}
</dialog>
```

**Exception:** Disable outside-click for destructive/critical confirmations.

### Submit Buttons

**Keep enabled.** Validate on submit, show inline errors.

```tsx
// Bad: disabled={!isValid}
// Good: always enabled, validate on click
<button type="submit">Submit</button>
{errors.map(e => <span className="error">{e}</span>)}
```

**Only disable:** During submission (with loading indicator).

### Loading States

| Duration | Pattern |
|----------|---------|
| <300ms | Nothing |
| 300ms-2s | Spinner or skeleton |
| >2s | Progressive messages |

```tsx
// Progressive messages for long operations
const messages = ['Connecting...', 'Processing...', 'Almost done...']
const [msgIndex, setMsgIndex] = useState(0)

useEffect(() => {
  const timer = setInterval(() => setMsgIndex(i => Math.min(i + 1, messages.length - 1)), 2000)
  return () => clearInterval(timer)
}, [])
```

**Skeleton loading:** Match actual content layout (not generic spinner).

### Inline vs Toast Feedback

**Prefer inline** for contextual actions. Place feedback near user focus.

```tsx
// Bad: toast("Copied!")
// Good: inline confirmation
<button onClick={copy}>
  {copied ? '✓ Copied' : 'Copy'}
</button>
```

Toasts: Only for background operations user didn't initiate.

### Dropdowns vs Visible Options

| Options | Use |
|---------|-----|
| 2-5 | Radio buttons, cards, segmented control |
| 6-9 | Dropdown acceptable |
| 10+ | Searchable combobox required |

### FAB (Floating Action Button)

- Primary action only (create, compose)
- Bottom-right corner
- One per screen max
- Hide on scroll down, show on scroll up

### Scroll to Top

- Show after 300-500px scroll
- Bottom-right, upward arrow
- Skip if content < 2 viewport heights

## Source

[UX Good Patterns](https://uxgoodpatterns.com/)
