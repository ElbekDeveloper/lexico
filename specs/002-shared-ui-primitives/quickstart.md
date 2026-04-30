# Developer Quickstart: Shared UI Primitives

**Branch**: `002-shared-ui-primitives` | **Date**: 2026-04-30

---

## Prerequisites

- Feature `001-auth-setup` is merged or present locally (provides SCSS tokens and
  `ReactiveFormsModule` at root)
- Node.js 22+, npm 11+, Angular CLI 21

---

## Running the App

```bash
npm install
npm start
# http://localhost:4200
```

---

## Running Tests

```bash
npm test
```

Tests use Vitest via `@angular/build:unit-test`. Test files are co-located as `*.spec.ts`.
This feature introduces no spec files (manual verification only — see sections below).

---

## Building for Production

```bash
ng build --configuration production
```

Zero errors and zero budget warnings expected after implementing all three primitives.

---

## Using the Primitives in a New Component

### 1. Import from the barrel

```typescript
import { ButtonComponent, TextInputComponent, SpinnerComponent } from '@app/shared/ui';
// or with relative path:
import { ButtonComponent, TextInputComponent } from '../../shared/ui';
```

Add to the component's `imports` array (no module setup needed — all are standalone):

```typescript
@Component({
  imports: [ButtonComponent, TextInputComponent],
  // ...
})
export class LoginComponent { ... }
```

### 2. Button

```html
<!-- Default primary button -->
<app-button (click)="onSubmit()">Sign In</app-button>

<!-- Submit type (triggers (ngSubmit) + Enter key submission) -->
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <app-button type="submit" [loading]="isSubmitting()">Sign In</app-button>
</form>

<!-- Secondary -->
<app-button variant="secondary" (click)="onCancel()">Cancel</app-button>
```

### 3. TextInput

```typescript
readonly emailCtrl = new FormControl('', [Validators.required, Validators.email]);
```

```html
<form [formGroup]="form">
  <app-text-input
    label="Email"
    type="email"
    placeholder="you@example.com"
    formControlName="email"
    [errorMessage]="emailCtrl.touched && emailCtrl.invalid
      ? 'Enter a valid email'
      : ''"
  />
</form>
```

### 4. Spinner

```html
<!-- Page-level loading -->
@if (isLoading()) {
  <app-spinner label="Loading chat history…" />
}

<!-- Inline small (rarely needed manually — Button handles this automatically) -->
<app-spinner size="sm" />
```

---

## Path Alias Setup

`tsconfig.json` should contain (added by this feature's T001 task):

```json
"compilerOptions": {
  "paths": {
    "@app/*": ["src/app/*"]
  }
}
```

This enables `import { ButtonComponent } from '@app/shared/ui'` throughout the codebase.

---

## Manual Verification: SC-001 — Zero-config import

1. Add `ButtonComponent` to any existing component's `imports` array.
2. Add `<app-button>Hello</app-button>` to its template.
3. Run `ng serve`. Confirm the button renders with the accent-color background and correct
   typography in the browser. No configuration beyond the `imports` addition should be needed.

---

## Manual Verification: SC-002 — AXE zero violations

1. Run `npm start`.
2. Navigate to any page that renders the primitives.
3. Open Chrome DevTools → **Console** tab.
4. Install the [axe DevTools browser extension](https://www.deque.com/axe/devtools/) if not present.
5. Run AXE scan. Confirm **zero violations** for:
   - Button: focus ring visible, `type` attribute present, `aria-busy` during loading.
   - TextInput: `<label>` associated, `aria-invalid` when error present, toggle button labeled.
   - Spinner: `role="status"`, `aria-label` present, inner ring `aria-hidden="true"`.

---

## Manual Verification: SC-003 — Token-only styles

1. Open any of these files in the browser DevTools:
   - `button.component.scss`
   - `text-input.component.scss`
   - `spinner.component.scss`
2. Search for any hex color values (e.g., `#`, `rgb(`) or pixel-size values that are NOT
   from token variables. There should be **zero** hard-coded color or typography values.
   (Pixel dimensions for spinner ring size are acceptable as they match the token scale.)

---

## Manual Verification: SC-004 — TextInput Reactive Forms integration

1. Create a test component with a `FormControl`:
   ```typescript
   readonly ctrl = new FormControl('initial value');
   ```
2. Bind: `<app-text-input label="Test" [formControl]="ctrl" />`
3. Type in the input. Run `console.log(ctrl.value)` in DevTools. Confirm it matches the
   typed value in real time.
4. Set `ctrl.setValue('programmatic')` in DevTools console. Confirm the input displays
   "programmatic" without page reload.

---

## Manual Verification: Password Toggle

1. Add `<app-text-input label="Password" type="password" [formControl]="ctrl" />`
2. Type text into the field — characters should be masked.
3. Click the eye/toggle button — characters should be revealed.
4. Click again — characters should be re-masked.
5. Confirm the toggle button has an accessible `aria-label` of "Show password" /
   "Hide password" (inspect via DevTools → Accessibility tab).
