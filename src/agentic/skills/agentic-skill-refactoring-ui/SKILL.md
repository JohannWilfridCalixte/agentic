---
name: agentic:skill:refactoring-ui
description: Use when designing UI, choosing colors, typography, spacing, creating visual hierarchy, or making design decisions. Based on Refactoring UI by Wathan & Schoger.
---

# Refactoring UI

Practical UI design principles from Refactoring UI (Wathan & Schoger).

## Starting From Scratch

- **Don't design in grayscale** - Work with real colors; grayscale hides hierarchy problems
- **Start with a feature, not a layout** - Build the actual UI, not the shell
- **Detail comes later** - Start low-fidelity
- **Design in cycles** - Short iterations, don't finish everything at once

## Hierarchy (Most Important)

Visual hierarchy determines what users see first.

| Technique | Primary | Secondary | Tertiary |
|-----------|---------|-----------|----------|
| **Color** | Dark/black | Grey | Light grey |
| **Weight** | Bold (600-700) | Normal (400-500) | Normal/Light |
| **Size** | Larger | Base | Smaller |

**Rules:**
- Size isn't everything - combine weight + color + size
- De-emphasize by reducing contrast
- Labels are last resort - data often speaks for itself
- Balance weight and contrast - icons may need reduced contrast next to text

## Spacing & Layout

**Spacing scale (px):** 4, 8, 12, 16, 24, 32, 48, 64, 96

**Rules:**
- Start with too much white space - remove later
- Use a defined scale, not arbitrary values
- Don't fill the whole screen - elements need only the space they need
- Grids are overrated - don't force 12 columns
- Avoid ambiguous spacing - related things closer together

## Typography

**Type scale:** Limit to defined set of sizes (e.g., 12, 14, 16, 18, 20, 24, 30, 36, 48)

| Context | Line Height | Letter Spacing |
|---------|-------------|----------------|
| Headings | 1.2-1.25 | Tighter (-0.02em) |
| Body text | 1.5-1.75 | Normal |
| All-caps | - | Wider (+0.05em) |

**Rules:**
- 45-75 characters per line
- Align mixed sizes to baseline, not center
- Left-align most text; center only short independent blocks
- Not all links need color - context makes them obvious

## Color

**Use HSL, not hex** - Easier to manipulate.

### Building a Palette

1. Pick base color (middle of range)
2. Pick darkest and lightest shades
3. Fill in gaps (5-10 shades per color)

**Palette structure:**
- **Greys:** 8-10 shades (add subtle saturation for personality - cool blue, warm brown)
- **Primary:** 5-10 shades
- **Accents:** 5-10 shades each

**Rules:**
- Define shades upfront, don't pick on the fly
- Accessible doesn't mean ugly - use color strategically
- Don't rely only on color - support colorblindness with icons/text

## Depth & Shadows

**Shadow scale:** Define a set like spacing (e.g., sm, md, lg, xl)

| Elevation | Shadow | Use Case |
|-----------|--------|----------|
| Raised | Small, sharp | Buttons |
| Floating | Medium, softer | Dropdowns, cards |
| Modal | Large, diffuse | Modals, dialogs |

**Techniques:**
- Two shadows > one (ambient + direct light)
- Tinted shadows look more natural
- Overlap elements for depth without shadows
- Lighter elements appear closer

## Images & Icons

- **Text on images:** Add overlay, gradient, shadow, or blur
- **Don't scale up icons** - Use larger icons or put in a shape
- **Don't scale down screenshots** - Use partial/cropped views
- **User-uploaded content:** Set constraints, add backgrounds

## Finishing Touches

Small details that elevate designs:

| Default | Upgraded |
|---------|----------|
| Bullets | Icons |
| Plain underlines | Custom styled |
| Block quotes | Colored background + left border |
| Borders | Box shadows or different backgrounds |
| Plain tables | No lines, zebra stripes, or subtle dividers |
| Plain dropdowns | Icons, descriptions |
| Plain radios | Cards |

**Quick wins:**
- Accent borders (top of cards, left of alerts)
- Subtle background patterns or gradients
- Design empty states intentionally

## Anti-Patterns

| Bad | Good |
|-----|------|
| Grayscale first, color later | Color from the start |
| Rely only on font size | Combine size + weight + color |
| Fill entire screen width | Constrain to needed space |
| Arbitrary spacing values | Defined spacing scale |
| Pick colors on the fly | Pre-defined palette |
| Generic "Loading..." | Progressive messages or skeleton |
| Borders everywhere | Shadows, spacing, or backgrounds |

## Source

Refactoring UI by Adam Wathan & Steve Schoger (2018)
