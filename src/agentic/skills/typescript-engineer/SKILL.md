---
name: typescript-engineer
description: Use when writing TypeScript code - covers types, error handling, style, and patterns
---

# TypeScript Engineer

## Core principles

### Aim for maximal end to end typesafety

Not exhaustive list: no `any`, no `as` cast.

### Aim for types as narrow as possible

```typescript
type RGB = `#${string}` | [number, number, number];
type PrimaryColor = 'red' | 'green' | 'blue';

interface Options {
  readonly colors: Record<PrimaryColor, RGB>;
  readonly level: 1 | 2 | 3;
  readonly type: 'foo' | 'bar';
  readonly comment?: string;
}

// ✅ Narrow type
const options = { color: { red: '#F00', green: '#0F0', blue: [0, 0, 255] }, type: 'foo', level: 2 } satisfies Options;

// ✅ Works because TypeScript understand it's a string; not overwritten by the const version
console.log(options.color.red.toLowerCase());

// ❌ No precision on typing
const a: Options = { type: 'foo', level: 2 };
```

### Aim for maximum inference from TypeScript

```typescript
// ✅ TypeScript can infer
const a = 2;

// ❌ Useless typing
const a: number = 2;
```

## Types

### interface vs type

| Use Case | Keyword |
|----------|---------|
| Object shapes | `interface` |
| Unions, aliases, functions | `type` |

```typescript
// ✅ interface for objects
interface User {
  readonly id: string;
  readonly name: string;
}

// ✅ type for unions/aliases
type UserRole = 'admin' | 'member' | 'guest';
type UserId = string;
```

### readonly everywhere

All interface/type properties `readonly`. All arrays `readonly T[]`.

**Note:** `readonly` is TypeScript type syntax. Do NOT put it in runtime code like `z.object({ readonly x: ... })` - that's invalid JS.

### No any, no as

| Forbidden | Use Instead |
|-----------|-------------|
| `any` | Specific type or `unknown` + narrowing |
| `as` casts | Type guards |
| `object` | Specific interface |

```typescript
// ❌ item as Product
// ✅ if (item.type === 'product') { /* item is Product */ }
```

### Zod schemas

Schema name = type name. Infer types from schemas.

```typescript
// ✅ Schema and type share name
const User = z.object({ id: z.string(), name: z.string() });
type User = z.infer<typeof User>;

// ❌ Separate interface
interface User { id: string; name: string; }
const UserSchema = z.object({ id: z.string(), name: z.string() });
```

### Type inference

Let TS infer when obvious. Annotate empty arrays.

```typescript
const users = getUsers();            // ✅ inferred
const count = 0;                     // ✅ inferred
const errors = [] satisfies Error[]; // ✅ empty array needs type
```

### Return types

**Primary rule: avoid explicit return types.**

Return types can lie. Inference cannot.

| Approach | Risk |
|----------|------|
| Explicit return type | Can be wider, narrower, or false |
| Inferred | Always matches actual value |
| `as const` + inferred | Narrow AND truthful |

**Problem:** Discriminated unions lose precision with explicit return types.

```typescript
// ❌ Inferred without as const = too wide
function getResult() {
  return Math.random() > 0.5
    ? { status: 'ok', value: 'foo' }
    : { status: 'error', error: new Error('bar') }
}
// result.value is string | undefined even after narrowing

// ❌ Explicit return type = right shape but still wide
function getResult(): Result<string> { ... }
// result.value is string (not 'foo')

// ✅ as const = narrow AND truthful
function getResult() {
  return Math.random() > 0.5
    ? { status: 'ok', value: 'foo' } as const
    : { status: 'error', error: new Error('bar') } as const
}
// result.value is 'foo' after narrowing
```

**Problem:** Return types can hide leaked data.

```typescript
type User = { username: string; email: string }

// ❌ Return type hides password leak
const getUser = (): User => {
  return { username: 'user', email: 'a@b.com', password: 'SECRET' };
}
// Type says User, but password IS returned at runtime

// ✅ Inferred exposes the truth
const getUser = () => {
  return { username: 'user', email: 'a@b.com', password: 'SECRET' };
}
// Type shows password - bug is visible
```

**Problem:** Function overloads can be completely false.

```typescript
// ❌ Overloads lie about runtime behavior
function getUser(role: 'user'): { role: 'user' };
function getUser(role: 'admin'): { role: 'admin' };
function getUser(role: 'user' | 'admin') {
  if (role === 'user') return { role: 'admin' };  // BUG: swapped!
  return { role: 'user' };
}
// getUser('user') typed as { role: 'user' } but returns { role: 'admin' }

// ✅ as const reveals actual values
function getUser(role: 'user' | 'admin') {
  if (role === 'user') return { role: 'admin' as const };
  return { role: 'user' as const };
}
// Type: { role: 'admin' } | { role: 'user' } - truth visible
```

**When return types ARE acceptable:**
- Public API contracts where you WANT the abstraction
- Generic functions where inference fails
- Recursive functions (required by TS)

Default: let TypeScript infer. Use `as const` to narrow.

## Error Handling

### Result/Option monads

Domain logic returns `Result<T, E>` or `Option<T>`. No throwing.

```typescript
// ✅ Explicit error handling
function calculate(input: Input): Result<Output, CalcError> {
  if (!isValid(input)) return Err({ code: 'INVALID_INPUT', message: '...' });

  return Ok(compute(input));
}

// ❌ Throwing
function calculate(input: Input): number {
  if (!isValid(input)) throw new Error('Invalid');

  return compute(input);
}
```

Error types include `code` field for programmatic handling:

```typescript
interface CalcError {
  readonly code: 'INVALID_INPUT' | 'OVERFLOW';
  readonly message: string;
}
```

**Exception:** Catch external errors at infrastructure boundaries, wrap in Result.

## Switch Exhaustiveness

All switches on unions use `satisfies never` in default.

```typescript
function getPrice(item: CartItem): number {
  switch (item.type) {
    case 'product': return item.unitPrice * item.quantity;
    case 'service': return item.hourlyRate * item.hours;
    default: throw new Error(`unexpected type ${item.type satisfies never}`); // ✅ compile-time + runtime safety
  }
}
```

## Code Style

### Spacing

Blank lines between logical blocks:
- Between declarations and control flow
- Between validation and business logic
- Before complex multi-line statements

**Exception:** log + return = single block.

### Naming

No abbreviations except: `id`, `url`, `api`, `db`, `err` (catch), `req`/`res` (HTTP handlers).

| ❌ | ✅ |
|---|---|
| `qty` | `quantity` |
| `idx` | `index` |
| `val` | `value` |
| `cfg` | `config` |

### Guard clauses

Single-line for simple guards:

```typescript
if (!user) return null;                           // ✅ simple
if (!user || !user.isActive) { return null; }    // ✅ complex condition
```

### Nesting

Max depth = 3. Extract functions for deeper logic.

```typescript
// ❌ 4 levels deep
switch (data.type) {
  case 'x':
    switch (data.mode) {
      case 'y':
        if (condition) {
          // Level 4 - too deep!
        }
    }
}

// ✅ Extract helper
function handleX(data: X): Result { /* ... */ }
```

## Strategy Pattern

Use when same discriminator switched in 3+ locations with 5+ lines per branch.

```typescript
// Define interface
interface ItemStrategy<T> {
  readonly type: ItemType;
  readonly validate: (data: unknown) => Result<T, Error>;
  readonly calculate: (data: T) => number;
}

// Implement as plain objects (not classes)
const ProductStrategy: ItemStrategy<Product> = {
  type: 'product',
  validate: (data) => validateProduct(data),
  calculate: (data) => data.unitPrice * data.quantity,
};

// Factory with "satisfies never"
function getStrategy(type: ItemType): ItemStrategy<ItemData> {
  switch (type) {
    case 'product': return ProductStrategy;
    case 'service': return ServiceStrategy;
    default: throw new Error(`unexpected type: ${type satisfies never}`);
  }
}
```

## Red Flags

- `type` for object shapes (use `interface`)
- Missing `readonly` on interface properties
- `readonly` inside `z.object({})` (that's runtime JS, not type syntax)
- `any` or `as` casts
- Explicit return types (prefer inference + `as const`)
- Function overloads (they can lie; use union returns instead)
- Throwing in domain logic
- Switch without `satisfies never`
- Nesting > 3 levels
- Abbreviated variable names
