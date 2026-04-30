# Data Model: Shared UI Primitives

**Branch**: `002-shared-ui-primitives` | **Date**: 2026-04-30

This feature introduces three Angular component entities. Components are the "data model" for
a UI primitive library — their public API (inputs, outputs, host attributes) is the contract
that consuming features depend on.

---

## Entity 1: ButtonComponent

**File**: `src/app/shared/ui/button/button.component.ts`
**Selector**: `app-button`

### Inputs (Angular `input()` signal API)

| Input | Type | Default | Required | Description |
|-------|------|---------|----------|-------------|
| `variant` | `'primary' \| 'secondary'` | `'primary'` | No | Visual style variant |
| `type` | `'button' \| 'submit'` | `'button'` | No | HTML button type attribute |
| `loading` | `boolean` | `false` | No | When true: renders Spinner, disables interaction |
| `disabled` | `boolean` | `false` | No | When true: disables interaction, applies disabled styles |

### Computed Values

| Signal | Type | Expression | Description |
|--------|------|------------|-------------|
| `isDisabled` | `Signal<boolean>` | `computed(() => this.loading() \|\| this.disabled())` | Combined disabled state for the native `disabled` attribute |

### Outputs

None. Consumers use native `(click)` event binding. When `isDisabled()` is `true`, the
native `disabled` attribute prevents all click events at the browser level — no JS event
filtering needed.

### Host Bindings (`host` object in `@Component`)

None required. All bindings live on the `<button>` element inside the template.

### Internal State

None. The component is purely input-driven.

### Template Structure

```
app-button (host: no meaningful host attributes)
  └── <button [type] [disabled] [attr.aria-busy] [class]>
        ├── @if (loading()) → <app-spinner size="sm" label="Loading…" aria-hidden="true" />
        └── <ng-content />   (button label text projected from parent)
```

### CSS Class Strategy

CSS classes on the `<button>` element are driven by the `variant()` signal:
- `variant="primary"` → adds class `btn--primary`
- `variant="secondary"` → adds class `btn--secondary`
- Always present: `btn` (base styles)

Template binding: `[class]="'btn btn--' + variant()"`

### Dependencies

- Imports `SpinnerComponent` (must be built first — see Phase 3 note in plan.md)
- No service dependencies

---

## Entity 2: TextInputComponent

**File**: `src/app/shared/ui/text-input/text-input.component.ts`
**Selector**: `app-text-input`
**Implements**: `ControlValueAccessor` (from `@angular/forms`)

### Inputs (Angular `input()` signal API)

| Input | Type | Default | Required | Description |
|-------|------|---------|----------|-------------|
| `label` | `string` | — | **Yes** (`input.required`) | Visible label text; also used as accessible name via `<label>` |
| `type` | `string` | `'text'` | No | HTML input type (`'text'`, `'email'`, `'password'`, etc.) |
| `errorMessage` | `string` | `''` | No | Error text shown below input; when non-empty, `aria-invalid="true"` is set |
| `placeholder` | `string` | `''` | No | Native HTML `placeholder` attribute value |

### Computed Values

| Signal | Type | Expression | Description |
|--------|------|------------|-------------|
| `effectiveType` | `Signal<string>` | `computed(() => type() === 'password' && showPassword() ? 'text' : type())` | Actual `type` attribute on `<input>`, resolves password toggle |
| `hasError` | `Signal<boolean>` | `computed(() => errorMessage().length > 0)` | Drives `aria-invalid` and error container visibility |

### Internal State (signals)

| Signal | Type | Initial | Description |
|--------|------|---------|-------------|
| `value` | `WritableSignal<string>` | `''` | Current input value, kept in sync with CVA `writeValue` calls |
| `showPassword` | `WritableSignal<boolean>` | `false` | Password visibility toggle state |

### Instance Fields (non-signal)

| Field | Type | Description |
|-------|------|-------------|
| `inputId` | `string` | Unique stable DOM id (e.g., `text-input-1`). Set once at construction via static counter. Used for `<label for="...">` and `<input id="...">` association. |
| `#onChange` | `(v: string) => void` | CVA `registerOnChange` callback; called on every `(input)` event |
| `#onTouched` | `() => void` | CVA `registerOnTouched` callback; called on every `(blur)` event |

### ControlValueAccessor Methods

| Method | When Called | Effect |
|--------|------------|--------|
| `writeValue(v)` | Reactive Forms sets initial or programmatic value | `this.value.set(v ?? '')` |
| `registerOnChange(fn)` | During form control binding | Stores `fn` as `#onChange` |
| `registerOnTouched(fn)` | During form control binding | Stores `fn` as `#onTouched` |

### Template Event Handlers (protected)

| Handler | Trigger | Effect |
|---------|---------|--------|
| `onInput(event)` | `(input)` event on `<input>` | `value.set(newVal); #onChange(newVal)` |
| `onBlur()` | `(blur)` event on `<input>` | `#onTouched()` |
| `togglePasswordVisibility()` | `(click)` on toggle button | `showPassword.update(v => !v)` |

### Template Structure

```
app-text-input (host)
  └── <div class="text-input">
        ├── <label [for]="inputId">{{ label() }}</label>
        ├── <div class="text-input__field-wrapper">
        │     ├── <input
        │     │     [id]="inputId"
        │     │     [type]="effectiveType()"
        │     │     [value]="value()"
        │     │     [placeholder]="placeholder()"
        │     │     [attr.aria-invalid]="hasError() ? 'true' : null"
        │     │     [attr.aria-describedby]="hasError() ? inputId + '-error' : null"
        │     │     (input)="onInput($event)"
        │     │     (blur)="onBlur()"
        │     │   />
        │     └── @if (type() === 'password') {
        │           <button type="button"
        │             (click)="togglePasswordVisibility()"
        │             [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'"
        │           >...</button>
        │         }
        └── @if (hasError()) {
              <span
                [id]="inputId + '-error'"
                class="text-input__error"
                role="alert"
              >{{ errorMessage() }}</span>
            }
```

### Providers

```typescript
providers: [
  { provide: NG_VALUE_ACCESSOR, useExisting: TextInputComponent, multi: true },
]
```

### Dependencies

- Imports: none (no child components)
- `NG_VALUE_ACCESSOR` from `@angular/forms`

---

## Entity 3: SpinnerComponent

**File**: `src/app/shared/ui/spinner/spinner.component.ts`
**Selector**: `app-spinner`

### Inputs (Angular `input()` signal API)

| Input | Type | Default | Required | Description |
|-------|------|---------|----------|-------------|
| `label` | `string` | `'Loading…'` | No | Accessible label for `aria-label` on the `role="status"` element |
| `size` | `'sm' \| 'md'` | `'md'` | No | Visual size: `sm` = 16 × 16 px (used by Button); `md` = 24 × 24 px (standalone) |

### Internal State

None. Spinner is fully stateless.

### Template Structure

```
app-spinner (host: display: contents — no visual wrapper)
  └── <span role="status" [attr.aria-label]="label()">
        └── <span
              class="spinner__ring"
              [class.spinner__ring--sm]="size() === 'sm'"
              [class.spinner__ring--md]="size() === 'md'"
              aria-hidden="true"
            ></span>
```

`aria-hidden="true"` on the inner ring prevents screen readers from announcing the empty
`<span>`. The outer `role="status"` + `aria-label` carries the full announcement.

When used inside Button's loading state, Button sets `aria-hidden="true"` on the
`<app-spinner>` host element so the Spinner's `role="status"` does not double-announce
(Button itself has `aria-busy="true"` for this purpose).

### SCSS Size Variables

| Size | Width | Height | Border-width |
|------|-------|--------|-------------|
| `sm` | 16px | 16px | 2px |
| `md` | 24px | 24px | 2px |

### Dependencies

None.

---

## Barrel File

**File**: `src/app/shared/ui/index.ts`

Exports all three component classes for single-import convenience:

```typescript
export { ButtonComponent }    from './button/button.component';
export { TextInputComponent } from './text-input/text-input.component';
export { SpinnerComponent }   from './spinner/spinner.component';
```

---

## Dependency Graph

```
SpinnerComponent    (no deps — implement first)
      ↓
ButtonComponent     (depends on SpinnerComponent)
      ↓
TextInputComponent  (no component deps — can run in parallel with Button after Spinner done)

barrel index.ts     (depends on all three — implement last)
```

---

## tsconfig Path Alias

**File**: `tsconfig.json`

Add to `compilerOptions.paths`:
```json
"@app/*": ["src/app/*"]
```

This enables clean imports throughout the app:
```typescript
import { ButtonComponent } from '@app/shared/ui';
```
