# Contract: SCSS Design Tokens

**Branch**: `001-auth-setup` | **Date**: 2026-04-29

**File**: `src/styles/tokens.scss`  
**Access pattern**: `@use 'tokens'` in any component SCSS (no path prefix required)

## Usage

```scss
@use 'tokens';

.element {
  color: tokens.$color-text-primary;
  background: tokens.$color-bg-surface;
  padding: tokens.$spacing-4;
}
```

## Token Reference

### Colors

| Variable | Description | Approximate Value |
|----------|-------------|-------------------|
| `$color-bg-primary` | Page / app background | `#0d0d0d` |
| `$color-bg-surface` | Card, panel, input surface | `#1a1a1a` |
| `$color-bg-elevated` | Elevated surface (dropdowns, tooltips) | `#242424` |
| `$color-text-primary` | Primary body text | `#ececec` |
| `$color-text-secondary` | Supporting / muted text | `#8e8ea0` |
| `$color-text-disabled` | Disabled state text | `#565869` |
| `$color-accent` | Brand / action color | `#004068` |
| `$color-border` | Divider / border | `#2e2e2e` |

### Border Radius

| Variable | Description | Value |
|----------|-------------|-------|
| `$border-radius-sm` | Small | `4px` |
| `$border-radius-md` | Medium | `8px` |
| `$border-radius-lg` | Large | `16px` |

### Spacing Scale

| Variable | Description | Value |
|----------|-------------|-------|
| `$spacing-1` | 4px | `4px` |
| `$spacing-2` | 8px | `8px` |
| `$spacing-3` | 12px | `12px` |
| `$spacing-4` | 16px | `16px` |
| `$spacing-6` | 24px | `24px` |
| `$spacing-8` | 32px | `32px` |

### Typography

| Variable | Description | Value |
|----------|-------------|-------|
| `$font-family-base` | Base font stack | `'Inter', system-ui, sans-serif` |
| `$font-size-sm` | Small text | `12px` |
| `$font-size-md` | Body text | `14px` |
| `$font-size-lg` | Heading | `18px` |
| `$font-size-xl` | Large heading | `24px` |
| `$font-weight-regular` | Regular | `400` |
| `$font-weight-medium` | Medium | `500` |
| `$font-weight-bold` | Bold | `700` |

## Constraints

- All variables are SCSS compile-time variables (not CSS custom properties).
- Exact hex values are defaults; they MAY be revised in a future design iteration.
- Do NOT convert to CSS custom properties without a spec amendment.
- Color contrast: `$color-text-primary` on `$color-bg-primary` MUST meet ≥ 4.5:1
  (WCAG AA normal text). Verify with a contrast checker when values are finalized.
