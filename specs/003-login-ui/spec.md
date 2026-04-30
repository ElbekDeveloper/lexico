# Feature Specification: Login Page

**Feature Branch**: `003-login-ui`
**Created**: 2026-04-30
**Status**: Draft
**Input**: User description: "Full login UI using shared components, with routing guard scaffold. No backend calls."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sign In Flow (Priority: P1)

A visitor navigates to the login page, enters their email address and password into clearly labelled fields, and clicks "Sign In". The button enters a loading state with a visible spinner, preventing double-submission. After a simulated delay the visitor is redirected to the main protected page of the application.

**Why this priority**: This is the core user journey. Without a working sign-in flow, no feature of the application is reachable. All other stories depend on the authenticated state this story produces.

**Independent Test**: Open `/login` in the browser. Enter any non-empty email and password. Click "Sign In". Confirm: (1) the button shows a spinner and becomes non-interactive, (2) the browser navigates to the protected page, (3) a session token is present in session-scoped browser storage.

**Acceptance Scenarios**:

1. **Given** the login page is open and valid non-empty values are in both fields, **When** the user clicks "Sign In", **Then** the button enters a loading state with a spinner visible and is non-interactive.
2. **Given** the button is in the loading state, **When** the simulated sign-in completes, **Then** the user is redirected to the protected application page.
3. **Given** a completed sign-in, **When** browser session storage is inspected, **Then** a session token value is present.

---

### User Story 2 - Protected Route Guard (Priority: P2)

A user who is not signed in attempts to navigate directly to a protected page by typing the URL. The application intercepts the navigation and redirects them to the login page. A user who is already signed in and navigates to `/login` is redirected away to the protected page.

**Why this priority**: Without the guard, unauthenticated users can bypass the login page entirely. This scaffold establishes the access-control pattern used for all protected routes across the app.

**Independent Test**: (a) Clear session storage, navigate directly to the protected route URL — confirm landing on `/login`. (b) Sign in, then navigate to `/login` — confirm redirect to the protected page.

**Acceptance Scenarios**:

1. **Given** no session token in browser storage, **When** a user navigates to a protected route, **Then** they are immediately redirected to `/login`.
2. **Given** a valid session token in browser storage, **When** a user navigates to a protected route, **Then** the navigation succeeds and the protected page renders normally.
3. **Given** a valid session token is present, **When** the user navigates to `/login`, **Then** they are redirected to the protected page instead.

---

### User Story 3 - Form Validation (Priority: P3)

A user attempts to submit the login form with one or both fields left blank. The form does not proceed to the sign-in step; instead, accessible error messages appear directly below the empty fields, enabling the user to correct their input before retrying.

**Why this priority**: Inline validation prevents pointless sign-in attempts on empty input and improves accessibility. The core flow (US1) functions without it, making this an enhancement.

**Independent Test**: Open `/login`, leave both fields blank, click "Sign In". Confirm: no loading state triggers, two error messages appear below the respective fields, each with `aria-invalid="true"` on the associated input.

**Acceptance Scenarios**:

1. **Given** the email field is empty, **When** the user clicks "Sign In", **Then** an error message appears below the email field and `aria-invalid="true"` is set on the email input.
2. **Given** the password field is empty, **When** the user clicks "Sign In", **Then** an error message appears below the password field and `aria-invalid="true"` is set on the password input.
3. **Given** validation errors are visible, **When** the user fills in both fields and clicks "Sign In", **Then** the errors disappear and the sign-in loading state begins.

---

### Edge Cases

- What if both fields are empty at submission? Both error messages MUST appear simultaneously; the sign-in action MUST NOT trigger.
- What if the user refreshes the browser during the loading state? The page reloads to the initial form state; no session token is stored.
- What if the user manually clears session storage while on a protected page? On the next navigation event the guard MUST redirect to `/login`.
- What if the user presses Enter in a field rather than clicking the button? The form MUST submit as if the button were clicked (native form submission behaviour).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A login page MUST exist at the `/login` route, displaying a descriptive heading, an email field with label, a password field with label, and a "Sign In" submit button.
- **FR-002**: The email and password fields MUST use the shared TextInput primitive. The "Sign In" button MUST use the shared Button primitive.
- **FR-003**: On form submission with all fields non-empty, the "Sign In" button MUST enter a loading state (spinner visible, non-interactive) and stay in that state until sign-in completes.
- **FR-004**: Sign-in MUST complete successfully after a simulated asynchronous delay, storing a session token in session-scoped browser storage (no real backend call).
- **FR-005**: After successful sign-in, the user MUST be automatically redirected to the protected application route (`/chat`).
- **FR-006**: A route guard MUST protect all routes other than `/login`; users without a session token MUST be redirected to `/login`.
- **FR-007**: When an already-authenticated user navigates to `/login`, the route guard MUST redirect them to `/chat`.
- **FR-008**: Submitting the form with an empty email field MUST display an accessible error message below the email input and MUST NOT trigger the sign-in flow.
- **FR-009**: Submitting the form with an empty password field MUST display an accessible error message below the password input and MUST NOT trigger the sign-in flow.
- **FR-010**: The login page MUST set a descriptive browser tab title (e.g., "Sign In — Lexi").
- **FR-011**: All interactive elements MUST have visible keyboard focus indicators and correct ARIA roles/labels, passing zero AXE violations (WCAG 2.1 AA minimum).

### Key Entities

- **Session Token**: A string stored in session-scoped browser storage indicating an authenticated session. Presence = authenticated; absence = unauthenticated. Cleared automatically when the browser tab closes.
- **Credentials**: Email (string) and password (string) entered by the user during sign-in. Neither value is persisted beyond form state.
- **Route Guard**: A gate evaluated on every navigation to a protected route. Reads the session token; permits navigation if present, redirects to `/login` if absent.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user with non-empty credentials can complete the full sign-in flow and reach the protected page in under 5 seconds.
- **SC-002**: All interactive elements on the login page pass zero AXE accessibility violations when audited in isolation and in combination.
- **SC-003**: Navigation to any protected route without a session token is blocked and redirected to `/login` imperceptibly fast (within one render cycle).
- **SC-004**: The application compiles and produces a production build with zero errors and zero warnings after adding this feature.
- **SC-005**: Zero ESLint violations across all files introduced by this feature.

## Assumptions

- Sign-in always succeeds — any non-empty email + password combination triggers the simulated flow. No credential validation logic is needed.
- Session-scoped browser storage (not persistent local storage) is used so the session expires when the tab closes, appropriate for an internal productivity tool.
- The post-login destination is the existing `/chat` route established in `001-auth-setup`.
- There is no registration, forgot-password, SSO, or multi-factor flow in this feature.
- Email format validation (regex) is out of scope; only non-empty presence checks are required.
- The shared Button, TextInput, and Spinner components from `002-shared-ui-primitives` are available via the `@app/shared/ui` barrel and are used directly.
- Dark theme only; no theme toggle is required.
- No "remember me" option; session-scoped token only.
- The Reactive Forms module is already provided at the application root (`001-auth-setup`).
