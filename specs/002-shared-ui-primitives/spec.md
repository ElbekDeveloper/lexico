# Feature Specification: Shared UI Primitives

**Feature Branch**: `002-shared-ui-primitives`
**Created**: 2026-04-30
**Status**: Draft
**Input**: User description: "Build reusable primitives used across login and chat pages."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Button Component (Priority: P1)

A developer building the login form or chat page needs a button that handles primary actions
(e.g., "Sign in", "Send") and secondary actions (e.g., "Cancel"). The button handles the
loading state automatically — when a loading flag is set, the button disables itself and shows
a spinner, preventing double-submission.

**Why this priority**: Buttons are the most frequently used interactive primitive. Every form
action and chat operation depends on them. No feature UI can be built without this.

**Independent Test**: Add `<app-button variant="primary" [loading]="false">Sign In</app-button>`
to any component. Confirm it renders with the accent-color background, correct typography, and
transitions to a spinner state when `[loading]="true"` — all without additional configuration.

**Acceptance Scenarios**:

1. **Given** a page with `<app-button variant="primary">`, **When** it renders, **Then** the
   button displays with the accent color background and the correct token-based typography.
2. **Given** a primary button with `[loading]="true"`, **When** it renders, **Then** the button
   shows a spinner, is non-interactive, and does not emit click events.
3. **Given** a button focused via keyboard, **When** it receives focus, **Then** a visible focus
   ring appears meeting WCAG 2.4.7 minimum contrast (≥ 3:1).
4. **Given** a button with `[disabled]="true"`, **When** the user clicks or keyboard-activates it,
   **Then** no action triggers and the cursor indicates the disabled state.

---

### User Story 2 - Text Input Component (Priority: P2)

A developer building the login form needs a text input that renders a label above it, displays
validation error messages below it, and integrates with Angular Reactive Forms without manual
`ControlValueAccessor` wiring in the consuming component.

**Why this priority**: The login form depends on accessible, Reactive-Forms-compatible inputs.
Without this primitive the login feature cannot meet accessibility or form validation requirements.

**Independent Test**: Add `<app-text-input label="Email" [formControl]="ctrl" errorMessage="Required">`
inside a `[formGroup]`. Confirm the label is visually and programmatically associated, the control
value updates on input, and the error message appears/disappears with `errorMessage` binding.

**Acceptance Scenarios**:

1. **Given** a TextInput with a `label` input, **When** it renders, **Then** a `<label>` element
   is visible and correctly associated with the input via `for`/`id` attributes.
2. **Given** a TextInput bound to a Reactive Forms control, **When** the user types, **Then**
   the control value updates in real time.
3. **Given** a TextInput with a non-empty `errorMessage`, **When** it renders, **Then** the error
   message appears below the input with `aria-invalid="true"` on the input element.
4. **Given** a TextInput with `type="password"`, **When** it renders, **Then** a show/hide toggle
   button is present with an accessible label, and activating it reveals or masks the text.

---

### User Story 3 - Spinner Component (Priority: P3)

A developer needs a visual loading indicator to display while an HTTP request is in flight — for
example, while the login API call is pending or while chat history is loading. The spinner must
announce its loading state to screen readers without requiring additional ARIA markup from the
consuming component.

**Why this priority**: Login and chat both involve async operations. A spinner provides visual
feedback that prevents users from thinking the app has frozen.

**Independent Test**: Add `<app-spinner />` to any template. Confirm an animated visual indicator
renders and an accessible announcement is present (verify `role="status"` or `aria-label` via
AXE inspection).

**Acceptance Scenarios**:

1. **Given** `<app-spinner />` in a template, **When** the page renders, **Then** an animated
   loading indicator is visible.
2. **Given** the Spinner rendered in the DOM, **When** a screen reader navigates to it, **Then**
   it announces a loading state via `role="status"` and an accessible label.
3. **Given** `<app-spinner label="Signing in…" />`, **When** it renders, **Then** the custom label
   is used as the accessible name instead of the default "Loading…".

---

### Edge Cases

- What if the Button receives both `[disabled]="true"` and `[loading]="true"` simultaneously? The
  button MUST remain non-interactive; the loading spinner takes visual precedence.
- What if `errorMessage` is an empty string or undefined? The TextInput MUST NOT render an empty
  error container to avoid layout shift (CLS).
- What if the Spinner renders without a containing element with a live region? The Spinner MUST
  include its own `role="status"` so it is self-contained and requires no additional ARIA from
  the consumer.
- What if a consumer sets `[loading]="true"` inside the button's click handler? The button MUST
  ignore subsequent click events while already in the loading state.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A Button primitive MUST be provided as a standalone component at
  `src/app/shared/ui/button/button.component.ts`.
- **FR-002**: Button MUST support a `variant` input accepting `"primary"` | `"secondary"`,
  defaulting to `"primary"`.
- **FR-003**: Button MUST support a `loading` boolean input; when `true`, the button MUST be
  non-interactive and render the Spinner component internally at `size="sm"`.
- **FR-004**: Button MUST support a `disabled` boolean input that prevents interaction and applies
  correct accessible disabled semantics (`aria-disabled` or native `disabled`).
- **FR-005**: Button MUST support a `type` input accepting `"button"` | `"submit"`, defaulting to
  `"button"` to prevent accidental form submission; setting `type="submit"` enables native form
  submission (Enter key submits the form, assistive-technology form mode works correctly).
- **FR-006**: A TextInput primitive MUST be provided as a standalone component at
  `src/app/shared/ui/text-input/text-input.component.ts`.
- **FR-007**: TextInput MUST implement Angular's `ControlValueAccessor` interface so it integrates
  directly with Reactive Forms without per-consumer boilerplate.
- **FR-008**: TextInput MUST support a `label` string input rendered as an accessible `<label>`
  element programmatically associated with the input field.
- **FR-009**: TextInput MUST support a `type` string input (`"text"`, `"email"`, `"password"`, etc.)
  defaulting to `"text"`.
- **FR-010**: TextInput MUST support an `errorMessage` string input; when non-empty, the error
  MUST display below the input and `aria-invalid="true"` MUST be set on the input element.
- **FR-011**: TextInput with `type="password"` MUST include a show/hide toggle with an accessible
  label; toggling MUST switch the input type between `"password"` and `"text"`.
- **FR-012**: A Spinner primitive MUST be provided as a standalone component at
  `src/app/shared/ui/spinner/spinner.component.ts`.
- **FR-013**: Spinner MUST include `role="status"` and an accessible label (default: `"Loading…"`)
  readable by screen readers without any additional ARIA from the consuming component.
- **FR-014**: Spinner MUST support an optional `label` string input to override the default
  accessible label.
- **FR-014a**: Spinner MUST support a `size` input accepting `"sm"` | `"md"`, defaulting to
  `"md"`; Button's loading state renders Spinner at `size="sm"`.
- **FR-015**: All three primitives MUST use design tokens from `src/styles/tokens.scss` exclusively
  for colors, spacing, border radius, and typography — no hard-coded values in component stylesheets.
- **FR-016**: All three primitives MUST declare `changeDetection: ChangeDetectionStrategy.OnPush`.
- **FR-017**: All three primitives MUST be exported from a barrel file at
  `src/app/shared/ui/index.ts`.
- **FR-018**: TextInput MUST support an optional `placeholder` string input passed through to the
  native input element's `placeholder` attribute.

### Key Entities

- **Button**: Interactive action trigger. Inputs: `variant` (`"primary"` | `"secondary"`),
  `type` (`"button"` | `"submit"`, default `"button"`), `loading` (boolean), `disabled` (boolean).
  Emits native click events unless loading or disabled.
- **TextInput**: Form-bound text entry field. Implements `ControlValueAccessor`. Inputs: `label`
  (string), `type` (string), `errorMessage` (string), `placeholder` (string). Internal signal
  tracks password visibility state.
- **Spinner**: Stateless loading indicator. Inputs: `label` (optional string), `size` (`"sm"` | `"md"`,
  default `"md"`). No internal state. Used standalone and internally by Button when loading.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A developer can import and use any of the three primitives in a new component with
  zero configuration beyond adding it to the component's `imports` array.
- **SC-002**: All three primitives pass zero AXE accessibility violations when rendered in
  isolation and combined on a form page.
- **SC-003**: Each primitive renders exclusively with design tokens — zero hard-coded color,
  spacing, or typography values appear in component stylesheets.
- **SC-004**: The application compiles with zero errors and zero warnings after adding all three
  primitives (`ng build --configuration production`).
- **SC-005**: Zero ESLint rule violations across all files introduced by this feature.

## Clarifications

### Session 2026-04-30

- Q: Should Button support a `type` input to allow `"submit"` for native form submission (Enter key, screen reader form mode)? → A: Yes — Button MUST support a `type` input accepting `"button"` | `"submit"`, defaulting to `"button"`. FR-005 updated accordingly.
- Q: Should Button's loading indicator reuse the Spinner component or implement its own CSS animation? → A: Button uses Spinner internally at `size="sm"`; Spinner gains a `size` input (`"sm"` | `"md"`, default `"md"`). FR-003 and FR-014a updated accordingly.

## Assumptions

- Primitives are purely presentational — no API calls, routing, or business logic.
- Icon-only button variant is out of scope for this feature; a future `IconButton` primitive can
  extend or compose the Button.
- The TextInput is single-line only; multi-line (textarea) support is a separate future primitive.
- Dark theme is the only visual mode; no light/dark toggle is needed.
- `stylePreprocessorOptions.includePaths` is already configured (feature `001-auth-setup`), so
  `@use 'tokens'` works in component stylesheets without path prefixes.
- All primitives live under `src/app/shared/ui/` per Constitution Principle V.
- No third-party component library; all primitives are implemented from scratch using SCSS tokens.
- Reactive Forms is already provided at root level (feature `001-auth-setup`).
