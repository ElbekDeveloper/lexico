# Contract: SpinnerComponent

**Selector**: `app-spinner`
**File**: `src/app/shared/ui/spinner/spinner.component.ts`
**Barrel**: `src/app/shared/ui/index.ts`

---

## Usage

```html
<!-- Default (standalone page-level loading) -->
<app-spinner />

<!-- Custom accessible label -->
<app-spinner label="Loading chat history…" />

<!-- Small (used inside Button — consumers rarely set this directly) -->
<app-spinner size="sm" />

<!-- Conditionally shown while data loads -->
@if (isLoading()) {
  <app-spinner label="Loading messages…" />
}
```

## Input API

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `label` | `string` | `'Loading…'` | Accessible label text set on `aria-label` of the `role="status"` element. Screen readers announce this text when the Spinner is inserted into the DOM (via `aria-live="polite"` implied by `role="status"`). |
| `size` | `'sm' \| 'md'` | `'md'` | Visual size. `'sm'` = 16×16 px (used internally by Button). `'md'` = 24×24 px (standalone). |

## Output API

None. Spinner is stateless; it emits no events.

## Visual Specification

| Size | Width | Height | Ring border-width | Animation |
|------|-------|--------|------------------|-----------|
| `sm` | 16px | 16px | 2px | 0.75s linear spin |
| `md` | 24px | 24px | 2px | 0.75s linear spin |

Ring colors:
- Track (rest of ring): `$color-bg-elevated`
- Active arc (top segment): `$color-accent`
- Animation: `transform: rotate(0 → 360deg)`, GPU-composited, no layout/paint

## Accessibility Contract

| Element | Role / Attribute | Value |
|---------|-----------------|-------|
| Outer `<span>` | `role="status"` | Implies `aria-live="polite"` — announces when inserted |
| Outer `<span>` | `aria-label` | Value of `label()` input |
| Inner `<span>` (ring) | `aria-hidden` | `"true"` — purely decorative |

**When conditionally rendered** (`@if`): As soon as the `<app-spinner>` is inserted into the
DOM, its `role="status"` causes screen readers to queue an announcement of the `aria-label`
value after the current utterance completes.

**When used inside Button**: Button sets `aria-hidden="true"` on the `<app-spinner>` host
element so the Spinner does not announce. The `<button aria-busy="true">` handles the
loading announcement instead.

## Token Usage

| Token | Applied To |
|-------|-----------|
| `$color-bg-elevated` | Spinner ring track (inactive arc) |
| `$color-accent` | Spinner ring active arc (top) |

Spinner uses no spacing, typography, or border-radius tokens (the ring shape is defined by
the circular `border-radius: 50%` and fixed pixel dimensions).

## File Structure

```
src/app/shared/ui/spinner/
├── spinner.component.ts        # Component class (inline template)
└── spinner.component.scss      # Component styles
```

Spinner uses an inline template because the template is minimal (2 elements).

## Composition Note

`ButtonComponent` imports `SpinnerComponent` and renders it internally:

```html
<!-- Inside button.component.html -->
@if (loading()) {
  <app-spinner size="sm" label="Loading…" aria-hidden="true" />
}
```

This is the only internal composition relationship among the three primitives.
`SpinnerComponent` MUST be implemented before `ButtonComponent`.
