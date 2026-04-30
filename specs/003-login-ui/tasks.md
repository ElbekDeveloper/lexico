---
description: "Task list for Login UI feature implementation (003-login-ui)"
---

# Tasks: Login UI

**Input**: Design documents from `/specs/003-login-ui/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Test tasks ARE included (per Feature Spec FR-011 accessibility requirement and QA best practices)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, routing structure, and dependency verification

- [ ] T001 Verify shared UI components available from `src/app/shared/ui/` (Button, TextInput, Spinner)
- [ ] T002 Create feature directory structure: `src/app/features/auth/login/`, `src/app/features/auth/services/`, `src/app/features/auth/guards/`
- [ ] T003 Create barrel export file `src/app/features/auth/index.ts` for feature exports

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core session management service required by all other components

**⚠️ CRITICAL**: SessionService MUST be complete before login component, guards, or route configuration can be implemented

### Session Service Implementation

- [ ] T004 Create session management service `src/app/features/auth/services/session.service.ts` with:
  - `setToken(token: string): void` method (stores token in `sessionStorage["auth_token"]`)
  - `getToken(): string | null` method (retrieves from sessionStorage)
  - `hasToken(): boolean` method (checks token existence)
  - `clearToken(): void` method (removes token from sessionStorage)

### Session Service Tests

- [ ] T005 Create unit tests `src/app/features/auth/services/session.service.spec.ts` with test cases:
  - `setToken` stores token in sessionStorage
  - `getToken` retrieves stored token
  - `hasToken` returns true when token exists, false when absent
  - `clearToken` removes token from sessionStorage
  - Token persistence across component lifecycle

**Checkpoint**: SessionService is complete and all tests pass - foundation ready for user story implementation

---

## Phase 3: User Story 1 - Sign In Flow (Priority: P1) 🎯 MVP

**Goal**: Implement the core sign-in functionality allowing users to enter credentials, submit the form, see a loading state, and be redirected to the protected application upon successful (simulated) authentication.

**Independent Test**: 
1. Navigate to `/login` in browser
2. Enter any non-empty email and password
3. Click "Sign In"
4. Confirm: (a) button shows spinner and becomes non-interactive, (b) browser navigates to `/chat` after ~1-2 seconds, (c) session token is present in `sessionStorage["auth_token"]`

### Login Component Implementation

- [ ] T006 [P] [US1] Create login component `src/app/features/auth/login/login.component.ts` with:
  - `@Component` decorator with `standalone: true`
  - `changeDetection: ChangeDetectionStrategy.OnPush`
  - FormGroup with email and password FormControls (Validators.required)
  - `isSubmitting` signal to track submission state
  - Inject SessionService, Router, Title service

- [ ] T007 [P] [US1] Create login component template `src/app/features/auth/login/login.component.html` with:
  - Form heading: "Sign In"
  - TextInput for email with label "Email address" (bound to form control)
  - TextInput for password with label "Password" (type="password", bound to form control)
  - Submit button "Sign In" using shared Button component (disabled when form invalid OR isSubmitting)
  - Spinner shown inside button only while isSubmitting is true
  - Native form submission (Enter key support)

- [ ] T008 [P] [US1] Create login component styles `src/app/features/auth/login/login.component.scss` with:
  - Form container styling (padding, max-width, centered layout)
  - Heading styles (font size, color, margin)
  - Form field spacing and alignment
  - Loading state visual feedback

- [ ] T009 [US1] Implement sign-in flow logic in login component `src/app/features/auth/login/login.component.ts`:
  - `onSubmit()` method that:
    1. Validates form is valid (no submission if invalid)
    2. Sets `isSubmitting` to true
    3. Simulates async authentication with `setTimeout(~1500ms)`
    4. On completion: calls `SessionService.setToken('mock_token_' + Date.now())`
    5. Navigates to `/chat` via `Router.navigate(['/chat'])`
    6. Resets `isSubmitting` to false
  - `ngOnInit()` method that sets browser tab title via `Title.setTitle('Sign In — Lexi')`

- [ ] T010 [US1] Set up routing for login feature by updating `src/app/app.routes.ts`:
  - Add route: `{ path: 'login', component: LoginComponent }`
  - Ensure route is lazy-loaded with feature bundle

### Login Component Tests

- [ ] T011 [P] [US1] Create unit tests `src/app/features/auth/login/login.component.spec.ts` with test cases:
  - Form renders with email input, password input, and Sign In button
  - Form is initially pristine and disabled (button disabled due to empty fields)
  - Entering email and password enables Sign In button
  - Clicking Sign In with valid credentials sets isSubmitting to true
  - Button shows spinner while isSubmitting is true
  - After simulated delay, SessionService.setToken is called with mock token
  - After simulated delay, Router.navigate is called with '/chat'
  - Tab title is set to 'Sign In — Lexi' on component init
  - Form resets after successful submission

**Checkpoint**: User Story 1 is complete - visitors can sign in and reach the protected page

---

## Phase 4: User Story 2 - Protected Route Guard (Priority: P2)

**Goal**: Implement route protection that prevents unauthenticated users from accessing protected routes and redirects already-authenticated users away from the login page.

**Independent Test**: 
1. (a) Clear sessionStorage, navigate directly to `/chat` → confirm redirect to `/login`
2. (b) Sign in to get token, navigate to `/login` → confirm redirect to `/chat`

### Route Guard Implementation

- [ ] T012 [P] [US2] Create auth guard `src/app/features/auth/guards/auth.guard.ts` that:
  - Implements `CanActivateFn` functional guard pattern
  - Injects SessionService and Router
  - Check logic: if `SessionService.hasToken()` returns true → return true (allow)
  - Check logic: if `SessionService.hasToken()` returns false → call `Router.navigate(['/login'])` and return false (block)
  - NOTE: Guard will be applied to protected routes; separate logic for /login redirect added in Phase 4.2

- [ ] T013 [US2] Create special guard for `/login` route `src/app/features/auth/guards/auth-redirect.guard.ts` that:
  - Implements `CanActivateFn` functional guard pattern
  - Injects SessionService and Router
  - Check logic: if `SessionService.hasToken()` returns true → call `Router.navigate(['/chat'])` and return false (authenticated users redirected away)
  - Check logic: if `SessionService.hasToken()` returns false → return true (allow unauthenticated users to see login form)

- [ ] T014 [US2] Update routing in `src/app/app.routes.ts` to apply guards:
  - Add guard to `/login` route: `{ path: 'login', component: LoginComponent, canActivate: [authRedirectGuard] }`
  - Add guard to `/chat` route (and other protected routes): `{ path: 'chat', component: ChatComponent, canActivate: [authGuard] }`
  - Ensure both guards are provided in `app.config.ts` via `provideRouter()` or equivalent

### Route Guard Tests

- [ ] T015 [P] [US2] Create unit tests `src/app/features/auth/guards/auth.guard.spec.ts` with test cases:
  - Guard returns true when token is present
  - Guard returns false and calls Router.navigate(['/login']) when token is absent
  - Router.navigate is called with correct path '/login'

- [ ] T016 [P] [US2] Create unit tests `src/app/features/auth/guards/auth-redirect.guard.spec.ts` with test cases:
  - Guard returns true when token is absent (allow access to /login)
  - Guard returns false and calls Router.navigate(['/chat']) when token is present
  - Router.navigate is called with correct path '/chat'

### Route Guard Integration Tests

- [ ] T017 [US2] Create integration tests `src/app/features/auth/login/login.component.spec.ts` or separate file:
  - Unauthenticated navigation to `/chat` redirects to `/login` (guard blocks)
  - Authenticated navigation to `/chat` succeeds (guard allows)
  - Authenticated navigation to `/login` redirects to `/chat` (redirect guard blocks and redirects)
  - Token cleared externally (simulated) triggers guard redirect on next navigation

**Checkpoint**: User Story 2 is complete - protected routes are guarded and authentication state controls navigation

---

## Phase 5: User Story 3 - Form Validation (Priority: P3)

**Goal**: Implement client-side form validation with inline error messages that appear only after user interaction, meeting accessibility requirements.

**Independent Test**: 
1. Open `/login`, leave both fields blank, click "Sign In"
2. Confirm: no loading state triggers, two error messages appear below respective fields
3. Each invalid input has `aria-invalid="true"` attribute
4. Fill in both fields → errors disappear and sign-in loading state begins

### Validation UI Implementation

- [ ] T018 [US3] Update login component template `src/app/features/auth/login/login.component.html` to add validation error display:
  - Add conditional error message for email field using `@if`:
    - Show when: `email.invalid && email.touched`
    - Message: "Email is required"
    - Markup: `<div role="alert" class="error-message">{message}</div>`
  - Add conditional error message for password field using `@if`:
    - Show when: `password.invalid && password.touched`
    - Message: "Password is required"
    - Markup: `<div role="alert" class="error-message">{message}</div>`
  - Add `[aria-invalid]="email.invalid && email.touched"` binding to email TextInput
  - Add `[aria-invalid]="password.invalid && password.touched"` binding to password TextInput

- [ ] T019 [US3] Update login component styles `src/app/features/auth/login/login.component.scss` for error visibility:
  - `.error-message` class: color (red/error-color from design tokens), font size, margin-top
  - Ensure error text has sufficient contrast with background (WCAG AA 4.5:1 ratio)
  - Optional: Add visual indicator (border color change, icon) on invalid inputs

- [ ] T020 [US3] Update login component logic `src/app/features/auth/login/login.component.ts`:
  - In `onSubmit()` method, add check: if form is invalid, mark all fields as touched
  - This ensures error messages appear when user attempts to submit empty form
  - Do NOT submit if form invalid

### Validation Tests

- [ ] T021 [P] [US3] Create unit tests `src/app/features/auth/login/login.component.spec.ts` (add to existing test file):
  - Empty email field shows "Email is required" error only after touch
  - Empty password field shows "Password is required" error only after touch
  - No error shown before touch (pristine field)
  - Error disappears when field is filled (becomes valid)
  - Submitting form with empty email marks field as touched and shows error
  - Submitting form with empty password marks field as touched and shows error
  - Submitting form with both fields empty shows both errors simultaneously
  - aria-invalid="true" is set on invalid fields after touch

### Accessibility Audit

- [ ] T022 [US3] Run AXE accessibility audit on login page:
  - Use AXE DevTools or similar to audit `/login` route
  - Confirm ZERO violations
  - Verify form has proper labels, error messages, ARIA attributes
  - Test keyboard navigation (Tab, Enter, focus management)
  - Verify color contrast meets WCAG AA (4.5:1 for normal text)
  - Document results in test output or screenshot

**Checkpoint**: User Story 3 is complete - form validation with accessible error messages works end-to-end

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final refinements, comprehensive testing, accessibility validation, and documentation

### Edge Cases & Additional Testing

- [ ] T023 [P] Create edge case tests in `src/app/features/auth/login/login.component.spec.ts`:
  - Page refresh during loading state → resets form to initial state (no token stored)
  - User closes tab during loading → token not stored (sessionStorage scope)
  - User manually clears sessionStorage while on `/chat` → next navigation to protected route redirects to `/login`
  - Form resubmission after first successful submission (should not happen due to redirect, but verify)
  - Pressing Enter in email or password field triggers form submission (native behavior)

- [ ] T024 [P] Create browser compatibility tests:
  - Login flow works in Chrome, Firefox, Safari, Edge
  - sessionStorage behaves consistently across browsers
  - Keyboard navigation works as expected

### Accessibility Compliance

- [ ] T025 Comprehensive accessibility audit:
  - Run full AXE audit on entire login flow (forms, messages, redirects)
  - Test with screen reader (NVDA or JAWS) to verify:
    - Form heading is announced
    - Labels are associated with inputs
    - Error messages are announced when they appear (role="alert")
    - Button text is clear and understandable
    - Focus management is logical (Tab order correct)
  - Test keyboard-only navigation (no mouse):
    - Tab through all interactive elements
    - Enter/Space to activate button
    - Ensure no keyboard traps

### Performance Validation

- [ ] T026 Verify performance targets (from Constitution Principle IV):
  - LCP < 2.5s: Measure login page load time in DevTools
  - CLS < 0.1: Verify no layout shifts during form interaction or loading state
  - INP < 200ms: Verify button click and form submission are responsive

### Documentation & Code Quality

- [ ] T027 [P] Verify code quality:
  - Run ESLint: `npm run lint` → zero violations in new files
  - Run TypeScript: `npm run build` → zero type errors
  - Verify no `console.log`, `console.error`, or `debugger` statements in production code

- [ ] T028 Create feature documentation:
  - Add comment block in login.component.ts explaining key logic
  - Document session token expiration behavior (session-scoped)
  - Document route guard decision logic in auth.guard.ts comments

### Production Build Verification

- [ ] T029 Final production build and validation:
  - Build command: `npm run build`
  - Verify zero errors, zero warnings
  - Verify bundle size is acceptable (simple form component)
  - Verify feature works correctly in production build (test sign-in flow)

---

## Dependencies & Execution Order

```
Phase 1: Setup
    ↓
Phase 2: Foundational (SessionService) ← BLOCKING
    ↓
Phase 3: User Story 1 (Sign In) ← depends on SessionService
    ├─ Phase 4: User Story 2 (Route Guard) ← can run in parallel with US1 (different files)
    ├─ Phase 5: User Story 3 (Validation) ← depends on US1 component existing
    ↓
Phase 6: Polish & Cross-Cutting Concerns
```

**Parallel Execution Opportunities**:
- T006, T007, T008 (US1 component files): No interdependencies, can be implemented in parallel
- T012, T013 (US2 guards): Different files, can be implemented in parallel
- T023, T024, T025, T027 (tests and audits): Can be run as team in parallel

---

## MVP Scope Recommendation

**Minimum Viable Product** (Recommended for first release):
- ✅ Phase 1: Setup
- ✅ Phase 2: Foundational (SessionService complete)
- ✅ Phase 3: User Story 1 (Sign In Flow) - Core MVP
- ✅ Phase 4: User Story 2 (Route Guard) - Critical for security
- ⚠️ Phase 5: User Story 3 (Validation) - Can be Phase 2 if time permits (FR-008, FR-009 are requirements)
- ✅ Phase 6 (Accessibility + Build Verification) - Non-negotiable per Constitution

**Total MVP Tasks**: T001-T017 (~17 tasks) + T022 (accessibility audit)
**Estimated Timeline**: 2-3 days for experienced Angular developer

**Phase 2 Enhancement** (if time):
- Add remaining edge case tests (T023, T024)
- Browser compatibility testing (T024)

---

## Implementation Strategy

### Day 1: Foundation & Core Feature
1. T001-T003: Setup project structure
2. T004-T005: Implement SessionService with tests
3. T006-T011: Implement LoginComponent (US1) with tests

### Day 2: Route Protection & Validation
1. T012-T017: Implement AuthGuard (US2) with tests
2. T018-T022: Implement Form Validation (US3) and accessibility

### Day 3: Polish & Validation
1. T023-T029: Edge cases, accessibility audit, production build

---

## Success Criteria Checklist

✅ All acceptance scenarios for US1, US2, US3 pass
✅ Zero AXE accessibility violations (FR-011)
✅ WCAG 2.1 AA compliant
✅ Production build with zero errors and warnings (SC-004, SC-005)
✅ Keyboard navigation works (Tab, Enter)
✅ Form submission under 5 seconds (SC-001)
✅ Session token persists correctly in sessionStorage
✅ Route guard redirects work imperceptibly fast (SC-003)

---

## Task Summary

- **Total Tasks**: 29
- **Phase 1 (Setup)**: 3 tasks
- **Phase 2 (Foundation)**: 2 tasks
- **Phase 3 (US1 - Sign In)**: 6 tasks (6 impl + 5 tests)
- **Phase 4 (US2 - Route Guard)**: 6 tasks (3 impl + 3 tests + 1 integration)
- **Phase 5 (US3 - Validation)**: 5 tasks (3 impl + 2 tests + 1 audit)
- **Phase 6 (Polish)**: 7 tasks

**Parallelizable Tasks**: T006-T008 (component files), T012-T013 (guards), T023-T027 (tests/audits)
**Blocking Tasks**: T004-T005 (SessionService blocks everything else)
**MVP Tasks**: T001-T022 (all core user stories + accessibility)
