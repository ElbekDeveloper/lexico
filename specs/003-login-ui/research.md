# Research: Login UI Feature

**Date**: 2026-04-30 | **Feature**: 003-login-ui | **Status**: COMPLETE

This document consolidates research findings, design decisions, and evaluated alternatives for implementing the login UI feature.

---

## Decision: Session Storage for Authentication Tokens

**Decision**: Use `Window.sessionStorage` to store the authentication token (session-scoped, cleared on tab close).

**Rationale**:
- Session-scoped storage automatically clears when the browser tab closes, appropriate for an internal productivity tool (Lexi).
- No persistent authentication across browser restarts is needed per feature requirements.
- Session storage is synchronous (no async overhead) and available in all modern browsers.
- Simpler security model than localStorage (no long-lived tokens to steal).

**Alternatives Considered**:
1. **localStorage**: Persistent storage across browser sessions. Rejected because requirements explicitly require session-scoped tokens.
2. **In-memory signals**: No persistence across page reloads. Rejected because user should remain logged in during the same browser session.
3. **HttpOnly cookies**: Best practice for production systems. Rejected because this feature simulates authentication (no backend); cookies require server-side configuration outside the scope of this feature.

---

## Decision: Reactive Forms with Validators

**Decision**: Use Angular Reactive Forms API with built-in validators (Validators.required) for form state management and validation.

**Rationale**:
- Constitution Principle II mandates Reactive Forms (template-driven forms are prohibited).
- Reactive Forms provide type-safe, testable, and predictable form state via FormGroup and FormControl.
- Built-in validators (required) are sufficient for this feature; custom validators not needed for P3 validation stories.
- FormGroup status (valid/invalid) integrates cleanly with signal-based state for reactive UI updates.

**Alternatives Considered**:
1. **Template-driven forms**: Simpler syntax but less testable and harder to reason about. Rejected per Constitution.
2. **Custom state signals**: Duplicates work done by FormGroup; introduces maintenance burden. Rejected in favor of native API.

---

## Decision: Shared UI Components for Form Fields

**Decision**: Use shared `TextInput` and `Button` components from `002-shared-ui-primitives` for all form inputs and submission button. Use shared `Spinner` component inside the button during loading state.

**Rationale**:
- `002-shared-ui-primitives` is a completed feature and provides production-ready, accessible components.
- TextInput and Button are explicitly required by FR-002 ("MUST use the shared TextInput primitive", "button MUST use the shared Button primitive").
- Shared components ensure consistent styling, accessibility (AXE-compliant), and keyboard navigation across the app.
- Reduces code duplication and maintenance surface.

**Alternatives Considered**:
1. **Native HTML input/button elements**: No component reuse; duplicate accessibility work. Rejected per requirements.
2. **Third-party UI library (Material, Bootstrap)**: Adds dependency bloat; components are already provided in-house. Rejected in favor of existing shared primitives.

---

## Decision: Route Guard Pattern for Protected Routes

**Decision**: Implement a single, reusable authentication guard (`auth.guard.ts`) that checks for session token presence and redirects unauthenticated users to `/login`. Apply guard to all protected routes (e.g., `/chat`).

**Rationale**:
- Centralized guard logic prevents duplication and makes it easy to update protection rules globally.
- Guards are evaluated at the router level, before any component is instantiated (efficient).
- Consistent redirect destination (`/login`) provides clear user experience.
- Straightforward to extend with additional checks (e.g., token expiry, role-based access) in future features.

**Alternatives Considered**:
1. **Component-level checks in ngOnInit**: Decentralized logic; hard to enforce consistently. Rejected in favor of router guards.
2. **HTTP interceptor only**: Interceptors handle API calls, not routing. Rejected in favor of dedicated guard.
3. **Separate guards per route**: Redundant; central guard is simpler. Rejected in favor of reusable guard.

---

## Decision: Simulated Async Sign-In Flow

**Decision**: Simulate the sign-in flow with a `setTimeout` delay (~1-2 seconds) before storing the token and redirecting. No backend call is made.

**Rationale**:
- Feature requirements explicitly state "No backend calls" (from assumptions section).
- Simulated delay allows testing of loading states (button spinner, disabled state) without external dependencies.
- Demonstrates the sign-in UX pattern that real authentication will follow in future features.
- Keeps feature scope small and testable in isolation.

**Alternatives Considered**:
1. **Synchronous immediate token storage**: No loading state to test; doesn't reflect real user experience. Rejected.
2. **Real backend endpoint**: Out of scope per requirements ("simulated asynchronous delay"). Rejected.

---

## Decision: Error Messages Below Form Fields

**Decision**: Display inline validation error messages directly below each form field. Set `aria-invalid="true"` on the input element when invalid. Mark error message with `role="alert"` for screen readers.

**Rationale**:
- Inline errors are visually associated with the field they describe (better UX than modals or top-level alerts).
- `aria-invalid` is the accessible way to signal form errors per ARIA Authoring Practices.
- `role="alert"` ensures screen readers announce errors immediately when they appear.
- Meets FR-008, FR-009, and Constitution Principle III (Accessible by Default).

**Alternatives Considered**:
1. **Modal alert on validation failure**: Intrusive; interrupts user flow. Rejected.
2. **Only visual error indicators (red border)**: No text; inaccessible to screen reader users. Rejected.
3. **Tooltip on hover**: Errors hidden until hover; not keyboard-accessible. Rejected in favor of always-visible inline.

---

## Decision: Browser Tab Title Update

**Decision**: Set the browser tab title to "Sign In — Lexi" using Angular's Title service (e.g., `this.title.setTitle('Sign In — Lexi')`).

**Rationale**:
- Satisfies FR-010 ("MUST set a descriptive browser tab title").
- Helps users distinguish browser tabs; useful when multiple Lexi tabs are open.
- Angular's Title service is the standard, accessible way to set document title.
- No performance impact; executed once on component init.

**Alternatives Considered**:
1. **Direct DOM manipulation (`document.title`)**: Works but less idiomatic in Angular. Rejected in favor of Title service.
2. **Meta tag in HTML**: Already set globally; can be overridden per-route via Title service. Rejected in favor of programmatic override.

---

## Decision: Redirect Authenticated Users Away from /login

**Decision**: If a user with a valid session token navigates to `/login`, the guard redirects them to `/chat` (the protected application page).

**Rationale**:
- Satisfies US2 Acceptance Scenario 3: "Given a valid session token is present, When the user navigates to `/login`, Then they are redirected to the protected page instead."
- Prevents already-authenticated users from re-entering credentials unnecessarily.
- Improves UX: login page is not reachable once authenticated.

**Alternatives Considered**:
1. **Allow authenticated users to view login page**: Confusing UX; no clear reason to show login form to already-logged-in users. Rejected.
2. **Show "already logged in" message on `/login`**: Misleading; violates principle of single URL → single meaningful page. Rejected.

---

## Decision: Session Token Storage Key

**Decision**: Use the key `"auth_token"` for storing the session token in `sessionStorage`.

**Rationale**:
- Descriptive key name makes debugging and auditing easier.
- Consistent naming convention across the app (can be shared with backend in future).
- Simple string key (not nested) avoids complexity.

**Alternatives Considered**:
1. **Nested object** (e.g., `sessionStorage.setItem('auth', JSON.stringify({ token: '...' }))`): Adds serialization overhead. Rejected for simplicity of this feature.
2. **Generic key** (e.g., `"token"`): Too ambiguous; "auth_token" is clearer. Rejected in favor of descriptive key.

---

## Decision: Form State Management Pattern

**Decision**: Use Angular's FormGroup with form-level validation state. Bind button disabled state to `this.form.invalid`. Show loading spinner only when submission is in progress (separate boolean signal).

**Rationale**:
- FormGroup.invalid automatically reflects the form's validation state.
- Separating "form invalid" from "submission in progress" states allows independent UI logic (e.g., show error messages when form is invalid; show spinner when submission is pending).
- Signals for submission state integrate with Constitution's signals-first architecture.
- Testable: form state is concrete and mockable.

**Alternatives Considered**:
1. **Single "submitting" state covering both validation and loading**: Conflates two concerns; makes error message logic complex. Rejected.
2. **Manual form state tracking in component**: Reimplements FormGroup logic; error-prone. Rejected in favor of native API.

---

## Decision: Keyboard Submission (Enter Key)

**Decision**: Allow form submission via Enter key in text inputs (native form behavior). No additional logic needed.

**Rationale**:
- Native HTML form submission automatically submits on Enter in an input field within a form element.
- Requirement US1 Edge Cases: "If the user presses Enter in a field rather than clicking the button? The form MUST submit as if the button were clicked."
- No additional code needed; standard browser behavior.

**Alternatives Considered**:
1. **Prevent Enter key**: Unusual; confuses users familiar with form UX. Rejected.
2. **Custom Enter key handler**: Redundant; native behavior is correct. Rejected in favor of browser default.

---

## Technical Patterns

### Input() and output() Functions (Per Constitution II)

All component inputs and outputs will use the modern `input()` and `output()` functions instead of `@Input` and `@Output` decorators.

Example:
```typescript
export const LoginComponent = component({
  selector: 'app-login',
  template: `...`,
  inputs: {
    redirectUrl: input<string>(''),
  },
  outputs: {
    signIn: output<{ email: string; password: string }>(),
  },
});
```

### ChangeDetectionStrategy.OnPush (Per Constitution II)

All components will declare `changeDetection: ChangeDetectionStrategy.OnPush` in their `@Component` decorator for performance and predictability.

### Avoid `ngClass` and `ngStyle` (Per Constitution II)

All class and style bindings will use native class/style bindings, not `ngClass`/`ngStyle`.

Example:
```typescript
// ✅ CORRECT
<div [class.error]="isError" [style.color]="errorColor">
```

```typescript
// ❌ INCORRECT
<div [ngClass]="{ error: isError }" [ngStyle]="{ color: errorColor }">
```

### Accessibility: aria-invalid and role="alert" (Per Constitution III)

Error messages will include:
- `aria-invalid="true"` on invalid inputs
- `role="alert"` on error message containers (for screen reader announcements)

Example:
```typescript
<app-text-input
  [value]="email.value"
  [aria-invalid]="email.invalid && email.touched"
  label="Email address"
  @if (email.invalid && email.touched) {
    <div role="alert">Email is required</div>
  }
/>
```

---

## No Unknowns Remaining

All technical decisions are finalized. No NEEDS CLARIFICATION items remain. The feature is ready for Phase 1 design.
