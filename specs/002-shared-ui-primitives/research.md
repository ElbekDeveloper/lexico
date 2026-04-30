# Research: Shared UI Primitives

**Branch**: `002-shared-ui-primitives` | **Date**: 2026-04-30
**Input**: Technical decisions required by `spec.md` and constitution Principles II–IV

---

## Decision 1: ControlValueAccessor integration pattern in Angular 21

**Decision**: Use the `NG_VALUE_ACCESSOR` injection token declared in the component's `providers`
array. Implement `ControlValueAccessor` methods (`writeValue`, `registerOnChange`,
`registerOnTouched`) directly as class methods. Store CVA callbacks as private class fields
(not signals — they are Angular infrastructure callbacks, not reactive state).

**Rationale**:
- Angular 21 no longer supports constructor injection (`@Inject`, constructor parameters).
  All dependencies use `inject()`. However, `NG_VALUE_ACCESSOR` does not need `inject()` —
  it is declared in `providers` and Angular's DI resolves it automatically.
- Injecting `NgControl` via `inject(NgControl, { optional: true, self: true })` is a valid
  alternative but tightly couples the component to knowing it's inside a form. The
  `NG_VALUE_ACCESSOR` provider approach is the canonical Angular pattern and is form-agnostic.
- `writeValue` / `registerOnChange` / `registerOnTouched` are NOT Angular signals — they
  are DI-managed callbacks provided by the parent form. Wrapping them in signals adds
  unnecessary complexity. They are stored as private class fields (fat-arrow functions
  initialized to no-ops).
- The internal value (what the user has typed) IS a signal (`signal<string>('')`), since
  it drives template re-render under `OnPush`.

**Implementation pattern** (exact code to follow):
```typescript
import { ChangeDetectionStrategy, Component, signal, computed, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-text-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: TextInputComponent,
      multi: true,
    },
  ],
  // ...
})
export class TextInputComponent implements ControlValueAccessor {
  // Angular signal inputs (replaces @Input decorators — Angular 21)
  readonly label    = input.required<string>();
  readonly type     = input<string>('text');
  readonly errorMessage = input<string>('');
  readonly placeholder  = input<string>('');

  // Internal reactive state
  readonly value        = signal<string>('');
  readonly showPassword = signal<boolean>(false);

  // Computed: resolves the live <input> type attribute
  // When type is "password" and toggle is on, renders as "text" to reveal chars
  readonly effectiveType = computed<string>(() =>
    this.type() === 'password' && this.showPassword() ? 'text' : this.type(),
  );

  // Unique DOM id for <label for="..."> association
  // Static counter ensures uniqueness even if multiple instances exist on the same page
  static #idCounter = 0;
  readonly inputId = `text-input-${++TextInputComponent.#idCounter}`;

  // CVA callbacks — NOT signals (Angular DI infrastructure)
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

  // Template event handlers
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

**Alternatives considered**:
- `inject(NgControl, { optional: true, self: true })` — rejected because it requires a
  constructor-like initialization block (`afterNextRender` or `effect`) to set
  `ngControl.valueAccessor = this`, which is less clean.
- Using `model()` signal for two-way binding — rejected because `model()` does NOT
  interoperate with `ReactiveFormsModule`. CVA is the only supported integration path.

---

## Decision 2: Button disabled / loading accessibility semantics

**Decision**:
- For `disabled` input: apply native HTML `disabled` attribute to the `<button>` element.
- For `loading` input: apply native `disabled` + `aria-busy="true"` to the `<button>` element.
- Both states prevent click events natively (no JS event filtering needed).
- The `isDisabled` computed combines both: `computed(() => this.disabled() || this.loading())`.

**Rationale**:
- Native `disabled` on `<button>` is universally supported and removes the element from the
  natural tab order. For temporary states (loading), this is acceptable because the user's
  focus is typically on waiting for the operation to complete.
- `aria-busy="true"` on the button while loading signals to screen readers that the element
  is currently processing — this is the correct ARIA 1.2 pattern for in-progress actions.
- Alternative (`aria-disabled` + `pointer-events: none`) keeps the button focusable during
  loading. Rejected because it requires extra CSS and JS to prevent click propagation, and
  ARIA 1.1 screen readers may announce disabled buttons as clickable.

**Implementation**:
```html
<button
  [type]="type()"
  [disabled]="isDisabled() || null"
  [attr.aria-busy]="loading() ? 'true' : null"
  ...
>
```
Note: `[disabled]="false"` adds the attribute as `disabled="false"` which is STILL disabled.
Use `isDisabled() || null` — Angular will remove the attribute entirely when the value is `null`.

---

## Decision 3: Spinner implementation — pure CSS vs SVG vs CDK

**Decision**: Pure CSS border animation. No SVG, no Angular CDK, no third-party dependency.

**Implementation**:
```scss
// In spinner.component.scss
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

Component template:
```html
<span
  role="status"
  [attr.aria-label]="label()"
>
  <span
    class="spinner__ring"
    [class.spinner__ring--sm]="size() === 'sm'"
    [class.spinner__ring--md]="size() === 'md'"
    aria-hidden="true"
  ></span>
</span>
```

**Rationale**:
- CSS `border-top` + `rotate` animation is GPU-accelerated (triggers compositor layer only,
  zero layout/paint — CLS-safe).
- `aria-hidden="true"` on the visual ring prevents screen readers from reading the empty
  `<span>` as an element. The outer `role="status"` + `aria-label` carries the announcement.
- `role="status"` implies `aria-live="polite"` — when this element is inserted into the DOM
  (via `@if`), screen readers will announce the label after the current utterance completes.

**Alternatives considered**:
- SVG circle with `stroke-dasharray` — visually richer but heavier; overkill for a simple
  spinner.
- Angular CDK `ProgressSpinner` — adds dependency and diverges from token-only styling goal.

---

## Decision 4: Button loading state uses SpinnerComponent internally

**Decision**: `ButtonComponent` imports and renders `SpinnerComponent` in its template when
`loading()` is `true`. The Spinner renders at `size="sm"` with `label="Loading…"`.

**Implementation**:
```html
<!-- button.component.html -->
<button ...>
  @if (loading()) {
    <app-spinner size="sm" label="Loading…" aria-hidden="true" />
  }
  <ng-content />
</button>
```

Note: `aria-hidden="true"` on the Spinner inside the Button suppresses its `role="status"`
announcement because the `aria-busy="true"` on the `<button>` already announces loading
state to screen readers. Without this, the screen reader would announce "Loading…" twice.

**Dependency ordering**: Spinner MUST be implemented and tested before Button. Tasks for
Spinner are Phase 3 (P3-priority primitive) but they must be completed before Button tasks
begin.

---

## Decision 5: TextInput unique ID generation

**Decision**: Use a static class-level counter to generate unique `inputId` values per instance.

```typescript
static #idCounter = 0;
readonly inputId = `text-input-${++TextInputComponent.#idCounter}`;
```

This is set as a class field (not a signal) because the ID never changes after construction —
no reactive subscription needed. The `<label>` and `<input>` both reference this via
`[for]="inputId"` and `[id]="inputId"`.

**Rationale**: Avoids `crypto.randomUUID()` (not universally available in all environments)
and `Math.random()` (could theoretically collide under SSR). Counter always produces unique
sequential IDs within a browser session. Deterministic in tests (reset between test suites).

---

## Decision 6: No unit tests in this feature

**Decision**: No spec (`*.spec.ts`) files are created by this feature. Manual verification
steps in `quickstart.md` cover acceptance scenarios.

**Rationale**: Per spec — "no automated tests requested." The constitution does not mandate
unit tests for component libraries. AXE verification (SC-002) is a manual browser check per
`quickstart.md`.

**Note for future features**: When the login form feature (issue #4) is implemented, it will
exercise these components in a full page context where AXE automation can be run.

---

## Decision 7: Barrel file strategy

**Decision**: Single barrel at `src/app/shared/ui/index.ts` re-exporting all three component
classes. No type re-exports (TS types are inferred from the components themselves).

```typescript
export { ButtonComponent }   from './button/button.component';
export { TextInputComponent } from './text-input/text-input.component';
export { SpinnerComponent }   from './spinner/spinner.component';
```

**Usage in a consumer**:
```typescript
import { ButtonComponent, TextInputComponent } from '@app/shared/ui';
```

This requires `paths` configuration in `tsconfig.json` (`"@app/*": ["src/app/*"]`) — this
is a setup task in Phase 1. Without the alias, consumers import via relative path:
```typescript
import { ButtonComponent } from '../../shared/ui';
```

**Decision on tsconfig path alias**: Add `@app/*` → `src/app/*` alias in `tsconfig.json`
to avoid deep relative imports throughout the codebase.
