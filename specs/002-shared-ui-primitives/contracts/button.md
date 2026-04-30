# Contract: ButtonComponent

**Selector**: `app-button`
**File**: `src/app/shared/ui/button/button.component.ts`
**Barrel**: `src/app/shared/ui/index.ts`

---

## Usage

```html
<!-- Primary action (default) -->
<app-button (click)="submit()">Sign In</app-button>

<!-- Form submit button (triggers form's ngSubmit on Enter) -->
<app-button type="submit" [loading]="isSubmitting()">Sign In</app-button>

<!-- Secondary action -->
<app-button variant="secondary" (click)="cancel()">Cancel</app-button>

<!-- Disabled state -->
<app-button [disabled]="!form.valid">Sign In</app-button>

<!-- Loading state (during async operation) -->
<app-button [loading]="isLoading()">Sign In</app-button>
```

## Input API

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary'` | `'primary'` | Visual style. Primary uses `$color-accent` background; secondary uses transparent background with `$color-border` border. |
| `type` | `'button' \| 'submit'` | `'button'` | HTML `type` attribute. Use `'submit'` to trigger `(ngSubmit)` on the parent form when the button is clicked or Enter is pressed. |
| `loading` | `boolean` | `false` | When `true`: renders an internal Spinner at `size="sm"`, sets native `disabled` on the `<button>`, and sets `aria-busy="true"`. Click events are suppressed. |
| `disabled` | `boolean` | `false` | When `true`: sets native `disabled` on the `<button>`. Click events are suppressed. No spinner is shown. |

## Output API

None. Consumers bind `(click)` on the host element directly.

## Slots (Content Projection)

| Slot | Description |
|------|-------------|
| Default `<ng-content>` | Button label text. May be plain text or inline elements. MUST contain visible text for accessibility. |

## CSS Classes Applied to Internal `<button>` Element

| Class | Condition |
|-------|-----------|
| `btn` | Always |
| `btn--primary` | When `variant() === 'primary'` |
| `btn--secondary` | When `variant() === 'secondary'` |
| `btn--loading` | When `loading() === true` |
| `btn--disabled` | When `isDisabled() === true` |

## Accessibility Contract

| Attribute | Value | Condition |
|-----------|-------|-----------|
| `type` | `"button"` or `"submit"` | Always (from `type` input) |
| `disabled` | present | When `loading() || disabled()` |
| `aria-busy` | `"true"` | When `loading() === true` |
| Focus ring | visible, ≥ 3:1 contrast | When focused via keyboard |
| Internal Spinner | `aria-hidden="true"` | When `loading() === true` — the button's `aria-busy` already announces loading state |

## Token Usage

| Token | Applied To |
|-------|-----------|
| `$color-accent` | Primary button background |
| `$color-bg-surface` | Secondary button background |
| `$color-text-primary` | Button text color |
| `$color-border` | Secondary button border |
| `$border-radius-md` | Button border radius |
| `$spacing-3` (`12px`) | Vertical padding |
| `$spacing-4` (`16px`) | Horizontal padding |
| `$font-size-md` | Button label font size |
| `$font-weight-medium` | Button label font weight |

## Behavior Contracts

### Loading state
1. When `[loading]="true"` is set, the `<button>` receives `disabled` attribute and `aria-busy="true"`.
2. A `<app-spinner size="sm" aria-hidden="true">` appears inside the button, before the projected content.
3. Clicking the button while loading has no effect (native `disabled` blocks events).
4. When `[loading]` returns to `false`, `disabled` and `aria-busy` are removed; the Spinner disappears.

### Disabled vs Loading precedence
- If both `[disabled]="true"` AND `[loading]="true"`, the button is `disabled`; the Spinner is shown (loading visual takes precedence).

### Type="submit" behavior
- When `type="submit"`, clicking the button (or pressing Enter while any form control inside the `<form>` is focused) submits the form and triggers the form's `(ngSubmit)` handler.
- `type="submit"` combined with `[loading]="true"` is safe: the `disabled` attribute prevents form re-submission while the operation is in flight.

## Import

```typescript
import { ButtonComponent } from '@app/shared/ui';
// or
import { ButtonComponent } from '../../../shared/ui';
```

## File Structure

```
src/app/shared/ui/button/
├── button.component.ts        # Component class + template (inline)
└── button.component.scss      # Component styles
```
