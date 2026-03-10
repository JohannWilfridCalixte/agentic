---
name: python-engineer
description: Use when writing Python code - covers typing, error handling, style, imports, and patterns
---

# Python Engineer

Target: Python 3.12+. Strict type checking with pyright or mypy in strict mode.

## Core Principles

### Maximal end-to-end type safety

No `Any`. No `# type: ignore` without error code. No `cast()` unless wrapping untyped third-party code.

### Types as narrow as possible

```python
from typing import Literal

type Color = Literal["red", "green", "blue"]
type Level = Literal[1, 2, 3]

@dataclass(frozen=True, slots=True)
class Options:
    color: Color
    level: Level
    comment: str = ""

# ✅ Narrow — type checker knows exact values
options = Options(color="red", level=2)

# ❌ Stringly-typed
def set_color(color: str) -> None: ...
```

### Let the type checker infer

```python
# ✅ Inferred
users = get_users()
count = 0

# ❌ Redundant annotation
users: list[User] = get_users()
count: int = 0

# ✅ Annotate when inference fails
items: list[Item] = []
```

## Types

### dataclass vs Pydantic vs TypedDict vs NamedTuple

| Use Case | Tool |
|----------|------|
| Internal domain objects | `@dataclass(frozen=True, slots=True)` |
| External/untrusted data (APIs, config) | `pydantic.BaseModel` |
| Dict-shaped data (JSON payloads) | `TypedDict` |
| Lightweight immutable records | `NamedTuple` |

```python
# ✅ Internal domain object
@dataclass(frozen=True, slots=True)
class User:
    id: str
    name: str
    role: UserRole

# ✅ API boundary validation
class UserCreate(BaseModel):
    model_config = ConfigDict(strict=True, frozen=True, extra="forbid")

    name: Annotated[str, Field(min_length=1, max_length=100)]
    email: str
    role: Literal["admin", "user", "viewer"]

# ✅ JSON shape
class ApiResponse(TypedDict):
    status: str
    data: dict[str, object]
```

### Immutability by default

All dataclasses: `frozen=True, slots=True`. All Pydantic models: `frozen=True`.

### Generic syntax (3.12+)

```python
# ✅ New syntax — no TypeVar boilerplate
class Stack[T]:
    def __init__(self) -> None:
        self._items: list[T] = []

    def push(self, item: T) -> None:
        self._items.append(item)

    def pop(self) -> T:
        return self._items.pop()

def first[T](items: list[T]) -> T:
    return items[0]

# ✅ Bounded generics
from collections.abc import Hashable
def dedupe[T: Hashable](items: list[T]) -> list[T]: ...

# ✅ Type aliases
type JSON = dict[str, "JSON"] | list["JSON"] | str | int | float | bool | None
type Handler[**P] = Callable[P, Awaitable[None]]

# ❌ Old style
T = TypeVar("T")
class Stack(Generic[T]): ...
```

### Parameters: accept broad, return narrow

Accept `Sequence`, `Mapping`, `Iterable` in parameters (covariant, flexible). Return concrete types.

```python
from collections.abc import Sequence

# ✅ Accepts any sequence (list, tuple, etc.)
def total(prices: Sequence[Decimal]) -> Decimal:
    return sum(prices)

# ❌ Rejects tuples, generators, etc.
def total(prices: list[Decimal]) -> Decimal:
    return sum(prices)
```

### No Any, no cast, no bare type: ignore

| Forbidden | Use Instead |
|-----------|-------------|
| `Any` | `object` + narrowing, or specific type |
| `cast()` | Type guard or `TypeIs` |
| `# type: ignore` | `# type: ignore[specific-code]` + comment why |
| `dict` (bare) | `dict[str, int]` |
| `list` (bare) | `list[str]` |
| `tuple` (bare) | `tuple[str, ...]` or `tuple[str, int]` |

```python
# ❌ Any hides bugs
def process(data: Any) -> Any: ...

# ✅ object forces narrowing
def process(data: object) -> str:
    if isinstance(data, str):
        return data.upper()
    raise TypeError(f"expected str, got {type(data).__name__}")
```

### Protocol over ABC

Prefer structural subtyping. No inheritance needed.

```python
from typing import Protocol

# ✅ Structural — any class with .close() works
class Closeable(Protocol):
    def close(self) -> None: ...

def cleanup(resource: Closeable) -> None:
    resource.close()

# ❌ Forces inheritance
from abc import ABC, abstractmethod
class Closeable(ABC):
    @abstractmethod
    def close(self) -> None: ...
```

Use ABC only when you need shared implementation (mixin methods).

### TypeIs for narrowing (3.13+ / typing_extensions)

```python
from typing_extensions import TypeIs  # typing.TypeIs on 3.13+

def is_str_list(val: list[object]) -> TypeIs[list[str]]:
    return all(isinstance(x, str) for x in val)

def process(items: list[object]) -> None:
    if is_str_list(items):
        # items is list[str] — both branches narrowed
        print(items[0].upper())
```

Prefer `TypeIs` over `TypeGuard` — it narrows both branches.

### Pydantic schemas

Schema = type. Infer types from models, not the other way around.

```python
# ✅ Schema IS the type — like Zod
class User(BaseModel):
    model_config = ConfigDict(strict=True, frozen=True, extra="forbid")
    id: str
    name: str

# Use directly — no separate interface
def get_user() -> User: ...

# ✅ Discriminated unions
class Cat(BaseModel):
    pet_type: Literal["cat"]
    meow_volume: int

class Dog(BaseModel):
    pet_type: Literal["dog"]
    bark_volume: int

class Owner(BaseModel):
    pet: Annotated[Cat | Dog, Field(discriminator="pet_type")]

# ❌ Separate dataclass + schema
@dataclass
class User:
    id: str
    name: str

class UserSchema(BaseModel):  # duplication
    id: str
    name: str
```

### No @overload

`@overload` signatures can lie — implementation doesn't have to match. Use union returns instead.

```python
# ❌ Overloads can be false
@overload
def fetch(url: str, fmt: Literal["json"]) -> dict: ...
@overload
def fetch(url: str, fmt: Literal["text"]) -> str: ...

# ✅ Union return — truth visible
def fetch(url: str, fmt: Literal["json", "text"]) -> dict | str: ...
```

**Exception:** `@overload` acceptable in typed stubs for untyped third-party code.

### Return types

**Annotate return types on public functions. Let inference handle private/internal.**

Unlike TypeScript (where inference is stronger), Python's type checkers benefit from explicit return annotations on public APIs.

```python
# ✅ Public function — annotate return
def calculate_total(items: list[Item]) -> Decimal: ...

# ✅ Private helper — skip return annotation, infer it
def _sum_prices(prices: Sequence[Decimal]):
    return sum(prices)

# ✅ Complex return — annotation clarifies
def fetch_user(user_id: str) -> User | None: ...
```

## Error Handling

### Result pattern for domain logic

Domain logic returns `Result[T, E]`. No raising for expected failures.

```python
from dataclasses import dataclass

@dataclass(frozen=True, slots=True)
class Ok[T]:
    value: T

@dataclass(frozen=True, slots=True)
class Err[E]:
    error: E

type Result[T, E] = Ok[T] | Err[E]

# ✅ Explicit error handling
def calculate(input: Input) -> Result[Output, CalcError]:
    if not is_valid(input):
        return Err(CalcError(code="INVALID_INPUT", message="..."))
    return Ok(compute(input))

# Pattern matching to consume
match calculate(data):
    case Ok(value):
        print(value)
    case Err(error):
        log.error(error.message)

# ❌ Raising for expected failures
def calculate(input: Input) -> int:
    if not is_valid(input):
        raise ValueError("Invalid")  # caller can forget to catch
    return compute(input)
```

Error types include `code` field for programmatic handling:

```python
@dataclass(frozen=True, slots=True)
class CalcError:
    code: Literal["INVALID_INPUT", "OVERFLOW"]
    message: str
```

**Exception:** Catch external/infrastructure errors at boundaries, wrap in Result.

### Exception rules (when not using Result)

- Never bare `except:` — always `except Exception` minimum
- Always specify exception type: `except ValueError as e:`
- Never silently swallow: log + re-raise or handle explicitly
- Custom exception hierarchies for domain errors

```python
# ✅ Specific, logged
try:
    result = parse(data)
except ValueError as e:
    logger.warning("parse failed", exc_info=e)
    raise

# ❌ Bare except, silently swallowed
try:
    result = parse(data)
except:
    pass
```

## Match Exhaustiveness

All match statements on unions/enums use `assert_never` in wildcard case.

```python
from typing import assert_never

class Status(enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"

def describe(status: Status) -> str:
    match status:
        case Status.ACTIVE:
            return "User is active"
        case Status.INACTIVE:
            return "User is inactive"
        case Status.SUSPENDED:
            return "User is suspended"
        case _ as unreachable:
            assert_never(unreachable)  # ✅ compile-time + runtime
```

## Code Style

### Imports

1. `from __future__ import annotations` first (if needed)
2. Standard library
3. Third-party
4. Local/project
5. Blank lines between groups
6. Alphabetical within groups
7. `TYPE_CHECKING` block for type-only imports (breaks circular deps)
8. Absolute imports only — no relative imports

```python
from __future__ import annotations

import enum
from collections.abc import Sequence
from dataclasses import dataclass
from typing import TYPE_CHECKING, Literal

from pydantic import BaseModel, ConfigDict, Field
from returns.result import Result, Success, Failure

from myapp.core.config import settings
from myapp.models.user import User

if TYPE_CHECKING:
    from myapp.services.auth import AuthService
```

**`from __future__ import annotations`:** Makes all annotations strings (lazy evaluation). Enables forward references and breaks import cycles. **Caveat:** Don't use with Pydantic models that need runtime annotation access — Pydantic v2 handles this, but custom `get_type_hints()` calls will break.

**`TYPE_CHECKING` block:** Import types only needed for annotations here. Prevents circular imports — the import never runs at runtime.

Auto-fix: `ruff check --fix --select I` or `ruff format`.

### Naming

PEP 8 conventions. No abbreviations except: `id`, `url`, `api`, `db`, `err` (catch), `req`/`res` (HTTP handlers).

| Entity | Convention | Example |
|--------|-----------|---------|
| Variables, functions | `snake_case` | `user_count`, `get_user()` |
| Classes | `PascalCase` | `UserService` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_RETRIES` |
| Type aliases | `PascalCase` | `type UserMap = dict[str, User]` |
| Private | Leading `_` | `_internal_cache` |

| ❌ | ✅ |
|---|---|
| `qty` | `quantity` |
| `idx` | `index` |
| `val` | `value` |
| `cfg` | `config` |

### Guard clauses

Early returns to avoid nesting:

```python
def process(user: User | None) -> Result[Output, AppError]:
    if user is None:
        return Err(AppError(code="NOT_FOUND", message="no user"))
    if not user.is_active:
        return Err(AppError(code="INACTIVE", message="user inactive"))

    return Ok(compute(user))
```

### Nesting

Max depth = 3. Extract functions for deeper logic.

### Spacing

Blank lines between logical blocks:
- Between declarations and control flow
- Between validation and business logic
- Two blank lines before top-level definitions (PEP 8)

## Patterns

### Strategy pattern

Use when same discriminator matched in 3+ locations with 5+ lines per branch.

```python
from typing import Protocol

class PricingStrategy(Protocol):
    def calculate(self, item: Item) -> Decimal: ...

@dataclass(frozen=True, slots=True)
class ProductPricing:
    def calculate(self, item: Item) -> Decimal:
        return item.unit_price * item.quantity

@dataclass(frozen=True, slots=True)
class ServicePricing:
    def calculate(self, item: Item) -> Decimal:
        return item.hourly_rate * item.hours

def get_strategy(item_type: ItemType) -> PricingStrategy:
    match item_type:
        case ItemType.PRODUCT:
            return ProductPricing()
        case ItemType.SERVICE:
            return ServicePricing()
        case _ as unreachable:
            assert_never(unreachable)
```

### Common anti-patterns

```python
# ❌ Mutable default argument
def add_item(item: str, items: list[str] = []) -> list[str]: ...

# ✅ None sentinel
def add_item(item: str, items: list[str] | None = None) -> list[str]:
    if items is None:
        items = []
    items.append(item)
    return items

# ❌ isinstance chain (use match)
if isinstance(shape, Circle):
    ...
elif isinstance(shape, Square):
    ...

# ✅ Structural pattern matching
match shape:
    case Circle(radius=r):
        area = math.pi * r ** 2
    case Square(side=s):
        area = s ** 2

# ❌ String formatting
msg = "Hello %s" % name
msg = "Hello {}".format(name)

# ✅ f-string
msg = f"Hello {name}"

# ❌ Checking emptiness with len()
if len(items) > 0: ...

# ✅ Truthiness
if items: ...
```

## Red Flags

- `Any` anywhere (use `object` + narrowing or specific type)
- `cast()` outside third-party wrappers
- `# type: ignore` without error code
- Bare generic: `dict`, `list`, `tuple` without parameters
- Mutable default arguments
- `@dataclass` without `frozen=True, slots=True`
- Pydantic model without `strict=True, frozen=True, extra="forbid"`
- Bare `except:` or `except Exception: pass`
- Raising exceptions for expected domain failures (use Result)
- Match without `assert_never` in wildcard case
- `isinstance` chains instead of pattern matching
- Old-style `TypeVar("T")` instead of 3.12+ `[T]` syntax
- Old-style `Union[X, Y]` / `Optional[X]` instead of `X | Y` / `X | None`
- `from typing import List, Dict, Tuple` (use builtins: `list`, `dict`, `tuple`)
- Nesting > 3 levels
- Abbreviated variable names
- Missing `TYPE_CHECKING` block for type-only imports
- `@overload` (they can lie; use union returns instead)
- `global` keyword usage
- Star imports (`from module import *`)
- `eval()` / `exec()`
- Mutable class variables (`class Foo: items = []`)
- Relative imports (`from .module import x`)
