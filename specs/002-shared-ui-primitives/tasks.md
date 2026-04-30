# Tasks: Shared UI Primitives

**Input**: Design documents from `specs/002-shared-ui-primitives/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not included — no automated tests requested in spec. Manual verification steps per
story are provided in `quickstart.md`.

**Organization**: Tasks are grouped by user story to enable independent implementation and
testing of each story.

> ⚠️ **Implementation Order Note**: US3 (Spinner, P3) is placed before US1 (Button, P1) because
> Button has an internal composition dependency on Spinner. Spinner MUST exist before Button can
> compile. TextInput (US2, P2) is independent of both and may run in parallel with US1 after
> Phase 1 is complete.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths are included in every description

---

## Phase 1: Setup (Build Configuration)

**Purpose**: Add `@app/*` TypeScript path alias — unblocks clean barrel imports across all
three components and all future consumers.

- [x] T001 Update `tsconfig.json` — add `"paths": { "@app/*": ["src/app/*"] }` inside the
  existing `compilerOptions` object. The file currently has no `paths` key. Place it after
  `"module": "preserve"`. This enables `import { ButtonComponent } from '@app/shared/ui'`
  throughout the codebase.

**Checkpoint**: Build configuration ready — `@app/shared/ui` barrel imports will resolve.

---

## Phase 2: User Story 3 — Spinner Component (Priority: P3) ⚡ Unblocks US1

**Goal**: A stateless animated loading indicator that is self-contained for accessibility
(`role="status"` + `aria-label`), renders at two sizes (`sm` = 16 px, `md` = 24 px), and uses
only design tokens for colors.

> **Why before US1?** ButtonComponent imports SpinnerComponent internally. Spinner MUST be
> implemented and TypeScript-resolvable before Button tasks begin.

**Independent Test**: Add `<app-spinner />` to any component template, run `ng serve`, confirm
an animated ring is visible in the browser. Run AXE from DevTools — confirm `role="status"` and
`aria-label="Loading…"` are present and no violations are reported.

- [x] T002 [P] [US3] Create `src/app/shared/ui/spinner/spinner.component.ts` — standalone
  `SpinnerComponent` (do NOT set `standalone: true`), `changeDetection: ChangeDetectionStrategy.OnPush`,
  selector `app-spinner`, `styleUrl: './spinner.component.scss'`, two signal inputs:
  `readonly label = input<string>('Loading…')` and `readonly size = input<'sm' | 'md'>('md')`.
  Inline template:
  ```html
  <span role="status" [attr.aria-label]="label()">
    <span
      class="spinner__ring"
      [class.spinner__ring--sm]="size() === 'sm'"
      [class.spinner__ring--md]="size() === 'md'"
      aria-hidden="true"
    ></span>
  </span>
  ```
  Imports from `@angular/core`: `ChangeDetectionStrategy`, `Component`, `input`.

- [x] T003 [P] [US3] Create `src/app/shared/ui/spinner/spinner.component.scss` — use
  `@use 'tokens'` (no path prefix). Define:
  - `:host { display: inline-flex; align-items: center; justify-content: center; }`
  - `.spinner__ring { border-radius: 50%; border: 2px solid tokens.$color-bg-elevated;
    border-top-color: tokens.$color-accent; animation: lexico-spin 0.75s linear infinite; }`
  - `.spinner__ring--sm { width: 16px; height: 16px; }`
  - `.spinner__ring--md { width: 24px; height: 24px; }`
  - `@keyframes lexico-spin { to { transform: rotate(360deg); } }`
  Zero hard-coded color values; all colors come from tokens.

**Checkpoint**: US3 complete — `<app-spinner />` renders animated ring, passes AXE scan.

---

## Phase 3: User Story 1 — Button Component (Priority: P1) 🎯 MVP

**Goal**: A standalone button supporting `primary`/`secondary` variants, a `type` input for
native form submission, a `loading` state that renders the Spinner at `sm` size and prevents
interaction, and a `disabled` state — all accessible and token-styled.

**Dependencies**: Requires T002, T003 (Phase 2) — Button imports SpinnerComponent.

**Independent Test**: Add `<app-button variant="primary" [loading]="false">Sign In</app-button>`
to any component, run `ng serve`. Confirm: accent-color background, correct typography, spinner
appears and button becomes non-interactive when `[loading]="true"`, disabled styling when
`[disabled]="true"`. AXE scan shows zero violations.

- [x] T004 [P] [US1] Create `src/app/shared/ui/button/button.component.ts` — standalone
  `ButtonComponent`, `changeDetection: ChangeDetectionStrategy.OnPush`, selector `app-button`,
  `styleUrl: './button.component.scss'`, `imports: [SpinnerComponent]`. Four signal inputs:
  `readonly variant = input<'primary' | 'secondary'>('primary')`,
  `readonly type = input<'button' | 'submit'>('button')`,
  `readonly loading = input<boolean>(false)`,
  `readonly disabled = input<boolean>(false)`.
  One computed: `readonly isDisabled = computed(() => this.loading() || this.disabled())`.
  Inline template:
  ```html
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
  ```
  CRITICAL: `[disabled]="isDisabled() || null"` — the `|| null` removes the attribute when false
  (binding to `false` would add `disabled="false"` which still disables the button).
  CRITICAL: `aria-hidden="true"` on `<app-spinner>` prevents double screen reader announcement
  (button already has `aria-busy="true"`).
  Imports from `@angular/core`: `ChangeDetectionStrategy`, `Component`, `computed`, `input`.
  Import `SpinnerComponent` from `'../spinner/spinner.component'`.

- [x] T005 [P] [US1] Create `src/app/shared/ui/button/button.component.scss` — use `@use 'tokens'`.
  Define base `.btn` class with: `display: inline-flex; align-items: center; justify-content: center;
  gap: tokens.$spacing-2; padding: tokens.$spacing-3 tokens.$spacing-4;
  border: 1px solid transparent; border-radius: tokens.$border-radius-md;
  font-family: tokens.$font-family-base; font-size: tokens.$font-size-md;
  font-weight: tokens.$font-weight-medium; line-height: 1; cursor: pointer;
  transition: opacity 0.15s ease, background-color 0.15s ease;`.
  Focus ring: `&:focus-visible { outline: 2px solid tokens.$color-accent; outline-offset: 2px; }`.
  Primary modifier: `.btn--primary { background: tokens.$color-accent; color: tokens.$color-text-primary; }
  .btn--primary:hover:not(:disabled) { opacity: 0.9; }`.
  Secondary modifier: `.btn--secondary { background: tokens.$color-bg-surface; color: tokens.$color-text-primary;
  border-color: tokens.$color-border; } .btn--secondary:hover:not(:disabled) { background: tokens.$color-bg-elevated; }`.
  Disabled state: `.btn--disabled, .btn:disabled { opacity: 0.5; cursor: not-allowed; }`.
  Loading state: `.btn--loading { cursor: wait; }`.
  Zero hard-coded color values allowed.

**Checkpoint**: US1 complete — Button renders correctly, loading spinner appears and blocks
interaction, `type="submit"` triggers form `(ngSubmit)`, AXE scan passes.

---

## Phase 4: User Story 2 — TextInput Component (Priority: P2)

**Goal**: A standalone Reactive-Forms-compatible text input with an accessible `<label>`,
error message display with `aria-invalid`, a password show/hide toggle, and zero manual wiring
required from consumers.

**Dependencies**: Requires T001 (Phase 1) for path alias. Independent of US1 and US3.

**Independent Test**: Create a `FormControl`, bind `<app-text-input label="Email"
[formControl]="ctrl" [errorMessage]="'Required'" />`, run `ng serve`. Confirm: label renders
above input, typing updates `ctrl.value` in DevTools console, error message appears with red
styling and `aria-invalid="true"`. With `type="password"`, confirm toggle reveals/masks text.
AXE scan passes.

- [x] T006 [P] [US2] Create `src/app/shared/ui/text-input/text-input.component.ts` — standalone
  `TextInputComponent`, `changeDetection: ChangeDetectionStrategy.OnPush`, selector `app-text-input`,
  `templateUrl: './text-input.component.html'`, `styleUrl: './text-input.component.scss'`,
  `providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: TextInputComponent, multi: true }]`,
  `implements ControlValueAccessor`.
  Signal inputs (use `input.required<string>()` for label):
  `readonly label = input.required<string>()`,
  `readonly type = input<string>('text')`,
  `readonly errorMessage = input<string>('')`,
  `readonly placeholder = input<string>('')`.
  Internal signals: `readonly value = signal<string>('')`, `readonly showPassword = signal<boolean>(false)`.
  Computed: `readonly effectiveType = computed<string>(() => this.type() === 'password' && this.showPassword() ? 'text' : this.type())`,
  `readonly hasError = computed<boolean>(() => this.errorMessage().length > 0)`.
  Stable DOM id: `static #idCounter = 0; readonly inputId = \`text-input-\${++TextInputComponent.#idCounter}\``.
  Private CVA callbacks (NOT signals): `#onChange: (value: string) => void = () => {}`,
  `#onTouched: () => void = () => {}`.
  CVA methods: `writeValue(value: string): void { this.value.set(value ?? ''); }`,
  `registerOnChange(fn: (value: string) => void): void { this.#onChange = fn; }`,
  `registerOnTouched(fn: () => void): void { this.#onTouched = fn; }`.
  Protected handlers: `protected onInput(event: Event): void { const val = (event.target as HTMLInputElement).value; this.value.set(val); this.#onChange(val); }`,
  `protected onBlur(): void { this.#onTouched(); }`,
  `protected togglePasswordVisibility(): void { this.showPassword.update(v => !v); }`.
  Imports from `@angular/core`: `ChangeDetectionStrategy`, `Component`, `computed`, `input`, `signal`.
  Imports from `@angular/forms`: `ControlValueAccessor`, `NG_VALUE_ACCESSOR`.

- [x] T007 [P] [US2] Create `src/app/shared/ui/text-input/text-input.component.html` — external
  template. Structure:
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
  CRITICAL: `[attr.aria-invalid]="hasError() ? 'true' : null"` must be on the `<input>`, not the host.
  CRITICAL: `role="alert"` on the error span causes immediate screen reader announcement.
  CRITICAL: `type="button"` on the toggle button prevents form submission when clicked.
  CRITICAL: `aria-hidden="true"` on emoji spans — screen readers use the button's `aria-label` instead.

- [x] T008 [P] [US2] Create `src/app/shared/ui/text-input/text-input.component.scss` — use
  `@use 'tokens'`. BEM structure:
  `.text-input { display: flex; flex-direction: column; gap: tokens.$spacing-1; }`.
  `&__label { font-family: tokens.$font-family-base; font-size: tokens.$font-size-md;
  font-weight: tokens.$font-weight-medium; color: tokens.$color-text-primary; }`.
  `&__field-wrapper { position: relative; display: flex; align-items: center; }`.
  `&__input { width: 100%; padding: tokens.$spacing-2 tokens.$spacing-3;
  background: tokens.$color-bg-surface; border: 1px solid tokens.$color-border;
  border-radius: tokens.$border-radius-md; font-family: tokens.$font-family-base;
  font-size: tokens.$font-size-md; color: tokens.$color-text-primary; outline: none;
  transition: border-color 0.15s ease; }`.
  `&__input::placeholder { color: tokens.$color-text-secondary; }`.
  `&__input:focus { border-color: tokens.$color-accent; }`.
  `&__input[aria-invalid='true'] { border-color: #e53e3e; }` — NOTE: `#e53e3e` is an intentional
  hard-coded exception. No `$color-error` token exists yet in `tokens.scss`. Add a comment:
  `// TODO: replace with tokens.$color-error once that token is added`.
  `&__toggle { position: absolute; right: tokens.$spacing-2; background: transparent; border: none;
  cursor: pointer; padding: tokens.$spacing-1; color: tokens.$color-text-secondary; line-height: 1; }`.
  `&__toggle:focus-visible { outline: 2px solid tokens.$color-accent; border-radius: tokens.$border-radius-sm; }`.
  `&__error { font-family: tokens.$font-family-base; font-size: tokens.$font-size-sm;
  color: #e53e3e; }` — same intentional exception as above.

**Checkpoint**: US2 complete — TextInput binds to `[formControl]`, label is associated, error
message appears with `aria-invalid`, password toggle works, AXE scan passes.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Barrel export, lint, production build verification.

- [x] T009 Create `src/app/shared/ui/index.ts` — barrel file exporting all three components:
  ```typescript
  export { ButtonComponent }    from './button/button.component';
  export { TextInputComponent } from './text-input/text-input.component';
  export { SpinnerComponent }   from './spinner/spinner.component';
  ```
  This file is the only export surface consumers should import from (via `@app/shared/ui`).
  No type-only exports needed — Angular component types are inferred from the class.

- [x] T010 [P] Run `ng lint` from repo root — verify zero lint violations across all files
  introduced by this feature: `tsconfig.json`, `spinner.component.ts`, `spinner.component.scss`,
  `button.component.ts`, `button.component.scss`, `text-input.component.ts`,
  `text-input.component.html`, `text-input.component.scss`, `index.ts`.
  Fix any violations before marking complete (SC-005).

- [x] T011 [P] Run `ng build --configuration production` from repo root — verify zero errors
  and zero budget warnings. Confirm the three new component files are included in the production
  bundle (visible as lazy chunks or in the stats output). Confirm the `@app/*` path alias
  resolves correctly in the production build (SC-004).

**Checkpoint**: All success criteria met — feature complete and production-build-clean.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (US3/Spinner)**: Depends on Phase 1; provides Spinner to Phase 3
- **Phase 3 (US1/Button)**: Depends on Phase 2 (imports `SpinnerComponent`)
- **Phase 4 (US2/TextInput)**: Depends on Phase 1 only — can overlap with Phases 2 and 3
- **Phase 5 (Polish)**: Depends on Phases 2, 3, 4 all complete

### User Story Dependency Conflict Resolution

Button (US1, P1) cannot be built before Spinner (US3, P3) due to internal composition.
The implementation order is therefore:

```
Phase 2: US3 (Spinner) ──► Phase 3: US1 (Button)
Phase 1 ──►                                        ──► Phase 5 (Polish)
           Phase 4: US2 (TextInput, independent) ──►
```

### Within Each Phase

- T002 + T003 (Spinner TS + SCSS): Different files — fully parallel
- T004 + T005 (Button TS + SCSS): Different files — fully parallel (both need Spinner from Phase 2)
- T006 + T007 + T008 (TextInput TS + HTML + SCSS): Different files — fully parallel
- T009 (barrel): Depends on T002, T004, T006 (component classes must exist)
- T010 + T011 (lint + build): Different operations — fully parallel, both need T009

---

## Parallel Execution Examples

### Phase 2 — Spinner (2 files, launch simultaneously)

```
Task T002: "Create src/app/shared/ui/spinner/spinner.component.ts"
Task T003: "Create src/app/shared/ui/spinner/spinner.component.scss"
```

### Phase 3 — Button (2 files, launch simultaneously after Phase 2)

```
Task T004: "Create src/app/shared/ui/button/button.component.ts"
Task T005: "Create src/app/shared/ui/button/button.component.scss"
```

### Phase 4 — TextInput (3 files, launch simultaneously after Phase 1)

```
Task T006: "Create src/app/shared/ui/text-input/text-input.component.ts"
Task T007: "Create src/app/shared/ui/text-input/text-input.component.html"
Task T008: "Create src/app/shared/ui/text-input/text-input.component.scss"
```

### Phase 5 — Polish (after all components + barrel exist)

```
Task T010: "Run ng lint"
Task T011: "Run ng build --configuration production"
```

---

## Implementation Strategy

### MVP First (User Story 1 — Button)

1. Complete Phase 1: Setup (`tsconfig.json`)
2. Complete Phase 2: Spinner (required by Button)
3. Complete Phase 3: Button (P1 deliverable)
4. **STOP and VALIDATE**: Confirm `<app-button variant="primary" [loading]="true">` renders a
   spinner, is non-interactive, and passes AXE.
5. US1 is independently shippable as the MVP.

### Incremental Delivery

1. Setup → Path alias active
2. US3 (Spinner) → Animated spinner + self-contained ARIA → **Unblocks Button**
3. US1 (Button) → Primary/secondary, loading, disabled → **MVP — first shippable UI primitive**
4. US2 (TextInput) → Reactive Forms integration, error display, password toggle → **Login form unblocked**
5. Polish → Barrel export, lint, production build → **Branch ready to merge**

### Parallel Team Strategy

With two developers after Phase 1 + 2 complete:

- Developer A: US1 — T004, T005 (Button)
- Developer B: US2 — T006, T007, T008 (TextInput)
- After both complete: T009 (barrel), then T010, T011 (lint + build)

---

## Notes

- `[P]` tasks touch different files and have no shared in-flight dependencies
- `[Story]` label maps each task to its user story for traceability and independent testing
- Do NOT set `standalone: true` in component decorators — it is the Angular 21 default
- Do NOT use `@Input`, `@Output`, or constructor injection — use `input()`, `output()`, `inject()`
- `[disabled]="isDisabled() || null"` is intentional — `|| null` removes the attribute when false; binding to `false` would still add `disabled="false"` which browsers treat as disabled
- `aria-hidden="true"` on `<app-spinner>` inside Button is intentional — Button's `aria-busy="true"` handles the loading announcement; without this the screen reader would announce "Loading…" twice
- The two `#e53e3e` hard-coded color values in `text-input.component.scss` are intentional exceptions — no `$color-error` token exists yet; they are commented with `TODO: replace with tokens.$color-error`
- `input.required<string>()` MUST be used for TextInput's `label` input — this enforces a compile-time error if a consumer omits the required label (critical for accessibility)
- `static #idCounter = 0` in TextInputComponent is a class-level counter ensuring unique IDs per instance — resets between test suite runs
