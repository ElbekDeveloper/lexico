# Implementation Plan: Shared UI Primitives

**Branch**: `002-shared-ui-primitives` | **Date**: 2026-04-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/002-shared-ui-primitives/spec.md`

## Summary

Build three standalone Angular 21 UI primitive components — `ButtonComponent`,
`TextInputComponent`, and `SpinnerComponent` — for reuse across login and chat pages.
Spinner is implemented first (no deps); Button depends on Spinner; TextInput is independent of
both and can run in parallel with Button. A tsconfig path alias (`@app/*`) enables clean barrel
imports. All components use OnPush change detection, signals-first state, `inject()`-based
dependencies, and SCSS design tokens exclusively — zero hard-coded style values.

## Technical Context

**Language/Version**: TypeScript 5.9.2, Angular 21.2
**Primary Dependencies**: @angular/core 21.2, @angular/forms 21.2, sass
**Storage**: N/A — all components are stateless or locally stateful signals
**Testing**: Vitest via `@angular/build:unit-test` (Angular 21 CLI default). No spec files in this feature.
**Target Platform**: Modern browsers (Chrome 120+, Firefox 120+, Safari 17+)
**Project Type**: Angular component library (shared UI primitives within an SPA)
**Performance Goals**: INP < 200 ms, CLS < 0.1, LCP < 2.5 s (Constitution IV); components are OnPush so re-renders are signal-triggered only
**Constraints**: Zero lint errors (SC-005), zero build errors (SC-004), WCAG 2.1 AA with zero AXE violations (SC-002), TypeScript strict mode, no NgModules, no `any` type
**Scale/Scope**: 3 reusable components; ~6 files total

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. SDD | ✅ PASS | spec.md + clarifications complete before implementation |
| II. Angular Signals-First | ✅ PASS | All components: standalone, OnPush, `input()` API, `signal()` + `computed()` for state, `inject()` for DI, no NgModules, no `any`, no decorator-based injection |
| III. Accessible by Default | ✅ PASS | `role="status"` on Spinner, `aria-invalid` + `aria-describedby` on TextInput, `aria-busy` on Button loading, visible focus rings |
| IV. Performance-Governed Delivery | ✅ PASS | OnPush components; CSS-only animation (GPU-composited, no layout/paint); no images; lazy-loaded route architecture unchanged |
| V. Feature-Based Architecture | ✅ PASS | All three components live in `src/app/shared/ui/`; SCSS uses `@use 'tokens'` |

*No violations. Complexity Tracking table omitted.*

## Project Structure

### Documentation (this feature)

```text
specs/002-shared-ui-primitives/
├── plan.md              # This file
├── research.md          # CVA pattern, accessibility decisions, spinner CSS
├── data-model.md        # Complete component API specs (inputs, signals, computed)
├── quickstart.md        # Developer guide and manual verification steps
├── contracts/
│   ├── button.md        # ButtonComponent contract
│   ├── text-input.md    # TextInputComponent contract
│   └── spinner.md       # SpinnerComponent contract
└── tasks.md             # Phase 2 output (/speckit-tasks — not created here)
```

### Source Code

```text
src/
├── app/
│   └── shared/
│       ├── interceptors/               # Already exists (001-auth-setup)
│       └── ui/                         # NEW — created by this feature
│           ├── index.ts                # Barrel file — exports all 3 components
│           ├── button/
│           │   ├── button.component.ts         # ButtonComponent class + inline template
│           │   └── button.component.scss       # Token-only button styles
│           ├── text-input/
│           │   ├── text-input.component.ts     # TextInputComponent class
│           │   ├── text-input.component.html   # External template (non-trivial markup)
│           │   └── text-input.component.scss   # Token-only text-input styles
│           └── spinner/
│               ├── spinner.component.ts        # SpinnerComponent class + inline template
│               └── spinner.component.scss      # Token-only spinner styles
└── styles/
    └── tokens.scss                     # Already exists (001-auth-setup)

tsconfig.json (modified):
  compilerOptions.paths: { "@app/*": ["src/app/*"] }   # NEW — enables @app/shared/ui imports
```

**Structure Decision**: All three components live under `src/app/shared/ui/` per Constitution
Principle V. Each component has its own subdirectory matching the component filename prefix.
Button and Spinner use inline templates (minimal markup). TextInput uses an external `.html`
template (complex multi-element structure). All stylesheets are external `.scss` files
(never inline) as required by Constitution V.

---

## Critical Implementation Details

This section provides exact, unambiguous implementation instructions for an AI agent.
Reference `data-model.md` for the complete API table and `contracts/` for usage contracts.

### T-setup: tsconfig.json path alias

Add `paths` to `tsconfig.json` `compilerOptions` (note: `tsconfig.json` has no `paths` key
currently):

```json
"compilerOptions": {
  "paths": {
    "@app/*": ["src/app/*"]
  }
}
```

**WHY**: Without this, consumers would need deep relative imports like
`'../../../shared/ui/button/button.component'`. The alias gives `'@app/shared/ui'` from
anywhere in the project.

---

### SpinnerComponent — complete implementation

**File**: `src/app/shared/ui/spinner/spinner.component.ts`

```typescript
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './spinner.component.scss',
  template: `
    <span role="status" [attr.aria-label]="label()">
      <span
        class="spinner__ring"
        [class.spinner__ring--sm]="size() === 'sm'"
        [class.spinner__ring--md]="size() === 'md'"
        aria-hidden="true"
      ></span>
    </span>
  `,
})
export class SpinnerComponent {
  readonly label = input<string>('Loading…');   // "Loading…"
  readonly size  = input<'sm' | 'md'>('md');
}
```

**File**: `src/app/shared/ui/spinner/spinner.component.scss`

```scss
@use 'tokens';

:host {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.spinner__ring {
  border-radius: 50%;
  border: 2px solid tokens.$color-bg-elevated;
  border-top-color: tokens.$color-accent;
  animation: lexico-spin 0.75s linear infinite;

  &--sm { width: 16px; height: 16px; }
  &--md { width: 24px; height: 24px; }
}

@keyframes lexico-spin {
  to { transform: rotate(360deg); }
}
```

**Key rules**:
- `aria-hidden="true"` MUST be on the inner ring `<span>`, NOT on the outer `role="status"` span.
- Do NOT add `standalone: true` to the `@Component` decorator (Angular 21 default).
- `label()` default value uses the unicode ellipsis character `…` (not three periods) for
  correct screen reader pronunciation.

---

### ButtonComponent — complete implementation

**File**: `src/app/shared/ui/button/button.component.ts`

```typescript
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { SpinnerComponent } from '../spinner/spinner.component';

@Component({
  selector: 'app-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SpinnerComponent],
  styleUrl: './button.component.scss',
  template: `
    <button
      [type]="type()"
      [class]="'btn btn--' + variant() + (isDisabled() ? ' btn--disabled' : '') + (loading() ? ' btn--loading' : '')"
      [disabled]="isDisabled() || null"
      [attr.aria-busy]="loading() ? 'true' : null"
    >
      @if (loading()) {
        <app-spinner size="sm" label="Loading…" aria-hidden="true" />
      }
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  readonly variant  = input<'primary' | 'secondary'>('primary');
  readonly type     = input<'button' | 'submit'>('button');
  readonly loading  = input<boolean>(false);
  readonly disabled = input<boolean>(false);

  readonly isDisabled = computed(() => this.loading() || this.disabled());
}
```

**File**: `src/app/shared/ui/button/button.component.scss`

```scss
@use 'tokens';

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: tokens.$spacing-2;
  padding: tokens.$spacing-3 tokens.$spacing-4;
  border: 1px solid transparent;
  border-radius: tokens.$border-radius-md;
  font-family: tokens.$font-family-base;
  font-size: tokens.$font-size-md;
  font-weight: tokens.$font-weight-medium;
  line-height: 1;
  cursor: pointer;
  transition: opacity 0.15s ease, background-color 0.15s ease;

  &:focus-visible {
    outline: 2px solid tokens.$color-accent;
    outline-offset: 2px;
  }

  &--primary {
    background: tokens.$color-accent;
    color: tokens.$color-text-primary;

    &:hover:not(:disabled) { opacity: 0.9; }
  }

  &--secondary {
    background: tokens.$color-bg-surface;
    color: tokens.$color-text-primary;
    border-color: tokens.$color-border;

    &:hover:not(:disabled) { background: tokens.$color-bg-elevated; }
  }

  &--disabled,
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &--loading {
    cursor: wait;
  }
}
```

**Key rules**:
- `[disabled]="isDisabled() || null"`: The `|| null` pattern is REQUIRED. Without it, Angular
  emits `disabled="false"` which still disables the button. `null` removes the attribute entirely.
- `aria-hidden="true"` on `<app-spinner>` inside the button is REQUIRED to prevent double
  announcements (button has `aria-busy="true"` which already handles the loading state).
- The `imports` array MUST contain `SpinnerComponent` (not a module).
- Do NOT use `ngClass` — use `[class]` string binding as shown.

---

### TextInputComponent — complete implementation

**File**: `src/app/shared/ui/text-input/text-input.component.ts`

```typescript
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

@Component({
  selector: 'app-text-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './text-input.component.html',
  styleUrl: './text-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: TextInputComponent,
      multi: true,
    },
  ],
})
export class TextInputComponent implements ControlValueAccessor {
  // Signal inputs (replaces @Input decorators)
  readonly label        = input.required<string>();
  readonly type         = input<string>('text');
  readonly errorMessage = input<string>('');
  readonly placeholder  = input<string>('');

  // Internal reactive state
  readonly value        = signal<string>('');
  readonly showPassword = signal<boolean>(false);

  // Computed derived state
  readonly effectiveType = computed<string>(() =>
    this.type() === 'password' && this.showPassword() ? 'text' : this.type(),
  );
  readonly hasError = computed<boolean>(() => this.errorMessage().length > 0);

  // Stable unique DOM id for <label for="..."> / <input id="..."> association
  static #idCounter = 0;
  readonly inputId = `text-input-${++TextInputComponent.#idCounter}`;

  // CVA callbacks — Angular DI infrastructure, NOT signals
  #onChange: (value: string) => void = () => {};
  #onTouched: () => void = () => {};

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.#onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.#onTouched = fn;
  }

  // Template event handlers (protected — callable from template, not from outside)
  protected onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.value.set(val);
    this.#onChange(val);
  }

  protected onBlur(): void {
    this.#onTouched();
  }

  protected togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }
}
```

**File**: `src/app/shared/ui/text-input/text-input.component.html`

```html
<div class="text-input">
  <label class="text-input__label" [for]="inputId">{{ label() }}</label>

  <div class="text-input__field-wrapper">
    <input
      class="text-input__input"
      [id]="inputId"
      [type]="effectiveType()"
      [value]="value()"
      [placeholder]="placeholder()"
      [attr.aria-invalid]="hasError() ? 'true' : null"
      [attr.aria-describedby]="hasError() ? inputId + '-error' : null"
      (input)="onInput($event)"
      (blur)="onBlur()"
    />

    @if (type() === 'password') {
      <button
        class="text-input__toggle"
        type="button"
        [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'"
        (click)="togglePasswordVisibility()"
      >
        @if (showPassword()) {
          <span aria-hidden="true">🙈</span>
        } @else {
          <span aria-hidden="true">👁</span>
        }
      </button>
    }
  </div>

  @if (hasError()) {
    <span
      class="text-input__error"
      [id]="inputId + '-error'"
      role="alert"
    >{{ errorMessage() }}</span>
  }
</div>
```

**Note on emoji icons in the password toggle**: The emoji placeholder (`👁` / `🙈`) is used
as a stand-in for the actual icon implementation. A future design pass will replace these
with SCSS-styled SVG icons or CSS pseudo-elements. The `aria-hidden="true"` on the emoji
`<span>` ensures they are ignored by screen readers; the button's `aria-label` carries the
accessible name.

**File**: `src/app/shared/ui/text-input/text-input.component.scss`

```scss
@use 'tokens';

.text-input {
  display: flex;
  flex-direction: column;
  gap: tokens.$spacing-1;

  &__label {
    font-family: tokens.$font-family-base;
    font-size: tokens.$font-size-md;
    font-weight: tokens.$font-weight-medium;
    color: tokens.$color-text-primary;
  }

  &__field-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  &__input {
    width: 100%;
    padding: tokens.$spacing-2 tokens.$spacing-3;
    background: tokens.$color-bg-surface;
    border: 1px solid tokens.$color-border;
    border-radius: tokens.$border-radius-md;
    font-family: tokens.$font-family-base;
    font-size: tokens.$font-size-md;
    color: tokens.$color-text-primary;
    outline: none;
    transition: border-color 0.15s ease;

    &::placeholder { color: tokens.$color-text-secondary; }

    &:focus { border-color: tokens.$color-accent; }

    &[aria-invalid='true'] {
      border-color: #e53e3e;  // INTENTIONAL: no error-color token exists yet;
                               // replace when an error token is added to tokens.scss
    }
  }

  &__toggle {
    position: absolute;
    right: tokens.$spacing-2;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: tokens.$spacing-1;
    color: tokens.$color-text-secondary;
    line-height: 1;

    &:focus-visible {
      outline: 2px solid tokens.$color-accent;
      border-radius: tokens.$border-radius-sm;
    }
  }

  &__error {
    font-family: tokens.$font-family-base;
    font-size: tokens.$font-size-sm;
    color: #e53e3e;   // Same as above — replace when error token added
  }
}
```

**Key rules**:
- `input.required<string>()` MUST be used for `label` (not `input<string>()`). The
  `required` form triggers a compile-time error if a consumer omits the `label` attribute.
- The `providers` array with `NG_VALUE_ACCESSOR` MUST be in the `@Component` decorator —
  this is what makes the component work with `[formControl]` and `formControlName`.
- `writeValue` MUST call `this.value.set(value ?? '')` — the `?? ''` guards against `null`
  which Angular Reactive Forms sends when a control is reset.
- `role="alert"` on the error `<span>` ensures screen readers announce the error immediately
  when it appears (not politely — errors are urgent).
- The two `#e53e3e` hard-coded color values are flagged as intentional exceptions pending
  the addition of an `$color-error` token in a future `tokens.scss` update.

---

### Barrel File

**File**: `src/app/shared/ui/index.ts`

```typescript
export { ButtonComponent }    from './button/button.component';
export { TextInputComponent } from './text-input/text-input.component';
export { SpinnerComponent }   from './spinner/spinner.component';
```

No type-only exports are needed (TypeScript infers component types from the class definitions).
