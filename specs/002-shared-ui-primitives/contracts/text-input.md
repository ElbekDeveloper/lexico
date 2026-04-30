# Contract: TextInputComponent

**Selector**: `app-text-input`
**File**: `src/app/shared/ui/text-input/text-input.component.ts`
**Barrel**: `src/app/shared/ui/index.ts`
**Implements**: `ControlValueAccessor`

---

## Usage

```typescript
// In the consuming component:
readonly emailCtrl = new FormControl('', [Validators.required, Validators.email]);
readonly passwordCtrl = new FormControl('', [Validators.required, Validators.minLength(8)]);
```

```html
<!-- Email field -->
<app-text-input
  label="Email"
  type="email"
  placeholder="you@example.com"
  [formControl]="emailCtrl"
  [errorMessage]="emailCtrl.errors?.['required'] ? 'Email is required' : ''"
/>

<!-- Password field with show/hide toggle -->
<app-text-input
  label="Password"
  type="password"
  [formControl]="passwordCtrl"
  [errorMessage]="passwordCtrl.touched && passwordCtrl.invalid ? 'Password must be 8+ characters' : ''"
/>

<!-- Plain text without form control (uncontrolled) -->
<app-text-input label="Search" placeholder="Type to search…" />
```

## Input API

| Input | Type | Default | Required | Description |
|-------|------|---------|----------|-------------|
| `label` | `string` | — | **Yes** | Visible label text above the input. Also used as the programmatic accessible name via the associated `<label>` element. |
| `type` | `string` | `'text'` | No | HTML input type. Supports all native values (`'text'`, `'email'`, `'password'`, `'search'`, etc.). When `'password'`, a show/hide toggle button appears. |
| `errorMessage` | `string` | `''` | No | Error message displayed below the input. When non-empty: error text renders, `aria-invalid="true"` is set on the `<input>`, and `aria-describedby` links to the error element. When empty or `undefined`: no error container is rendered (prevents CLS). |
| `placeholder` | `string` | `''` | No | Native `placeholder` attribute forwarded to the `<input>` element. |

## Reactive Forms Integration

`TextInputComponent` implements Angular's `ControlValueAccessor`. It is usable with
any directive that provides `NG_VALUE_ACCESSOR`:

- `[formControl]="ctrl"` — bind to a standalone `FormControl`
- `[formControlName]="'fieldName'"` — bind inside a `[formGroup]`
- `[(ngModel)]="value"` — bind via template-driven forms (not recommended per constitution)

**No manual wiring required.** The component registers itself via `NG_VALUE_ACCESSOR` in its
`providers` array.

## Output API

None. The component pushes value changes to the bound `FormControl` via CVA callbacks.

## Accessibility Contract

| Attribute / Element | Value | Condition |
|--------------------|-------|-----------|
| `<label for="inputId">` | `label()` | Always |
| `<input id="inputId">` | — | Always — stable unique id per instance |
| `aria-invalid` on `<input>` | `"true"` | When `errorMessage()` is non-empty |
| `aria-describedby` on `<input>` | `"${inputId}-error"` | When `errorMessage()` is non-empty |
| `<span id="${inputId}-error" role="alert">` | `errorMessage()` | When `errorMessage()` is non-empty |
| Toggle button `aria-label` | `"Show password"` / `"Hide password"` | When `type === 'password'` |
| Toggle button `type` | `"button"` | Always (prevents form submission) |
| Focus visible | ring, ≥ 3:1 contrast | When `<input>` is focused via keyboard |

## Password Toggle Behavior

When `type="password"`:
1. A toggle button appears at the right edge of the input wrapper.
2. The toggle button has `type="button"` (never submits the form).
3. `aria-label` alternates between `"Show password"` and `"Hide password"` based on
   current toggle state.
4. Activating the toggle switches the `<input type>` between `"password"` and `"text"`.
5. The input value is preserved across toggles (no value reset).

## Token Usage

| Token | Applied To |
|-------|-----------|
| `$color-text-primary` | Label text, input text |
| `$color-text-secondary` | Placeholder text |
| `$color-text-disabled` | Disabled input text |
| `$color-bg-surface` | Input background |
| `$color-border` | Input border (default state) |
| `$color-accent` | Input border (focus state) |
| `$border-radius-md` | Input border radius |
| `$spacing-2` (`8px`) | Input vertical padding |
| `$spacing-3` (`12px`) | Input horizontal padding |
| `$spacing-1` (`4px`) | Gap between label and input, error and input |
| `$font-size-sm` | Error message font size |
| `$font-size-md` | Input and label font size |

## Error rendering rule

```
errorMessage() === '' or undefined  →  @if block not rendered (zero height, zero CLS)
errorMessage() !== ''               →  <span role="alert"> renders with error text
```

The error span has `role="alert"` so that when it is inserted into the DOM (which happens
when `errorMessage` changes from empty to non-empty), screen readers announce it immediately
(`aria-live="assertive"` implied by `role="alert"`).

## File Structure

```
src/app/shared/ui/text-input/
├── text-input.component.ts        # Component class + template (external)
├── text-input.component.html      # External template
└── text-input.component.scss      # Component styles
```

Note: TextInput uses an external template (not inline) because the template is non-trivial.
