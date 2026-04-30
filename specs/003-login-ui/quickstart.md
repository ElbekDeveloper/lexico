# Quickstart: Login UI Feature

**Date**: 2026-04-30 | **Feature**: 003-login-ui | **Status**: COMPLETE

A quick guide to understanding and implementing the login UI feature for the Lexi application.

---

## Feature Summary

Implement a complete login page at the `/login` route using Angular standalone components and shared UI primitives. The feature includes:

1. **Login Form** with email and password fields using shared TextInput components
2. **Form Validation** with inline error messages (required field checks only)
3. **Sign-In Flow** with simulated async behavior and visual loading state (spinner + disabled button)
4. **Session Token Storage** in browser session storage after successful login
5. **Route Guard** to protect authenticated routes and prevent unauthenticated access
6. **Tab Title** set to "Sign In — Lexi" on the login page

---

## Key Design Decisions

### 1. **Storage**: Session Storage Only
- Token stored in `sessionStorage["auth_token"]` (clears when tab closes)
- No persistent authentication needed for internal productivity tool

### 2. **Form State**: Reactive Forms
- Use Angular FormGroup with email and password FormControls
- Built-in Validators.required for each field
- Button disabled if form invalid OR submission in progress

### 3. **Shared Components**: Button, TextInput, Spinner
- From `002-shared-ui-primitives` feature (already implemented)
- Already accessible (pass AXE checks)
- Imported via `@app/shared/ui` barrel export

### 4. **Async Simulation**: setTimeout-based Flow
- ~1-2 second delay to simulate backend authentication
- Shows spinner while submitting
- Redirects to `/chat` on success
- No real backend call

### 5. **Route Protection**: Single Auth Guard
- Check for session token in guard logic
- Redirect unauthenticated users to `/login`
- Redirect authenticated users away from `/login` to `/chat`

---

## Architecture Overview

```
src/app/
├── features/
│   ├── auth/                          # Auth feature (from 001-auth-setup)
│   │   ├── login/
│   │   │   ├── login.component.ts     # NEW: Main login page component
│   │   │   ├── login.component.scss   # NEW: Component styles
│   │   │   └── login.component.spec.ts# NEW: Unit tests
│   │   ├── guards/
│   │   │   ├── auth.guard.ts          # NEW: Route guard
│   │   │   └── auth.guard.spec.ts     # NEW: Guard tests
│   │   └── services/
│   │       ├── session.service.ts     # NEW: Session token management
│   │       └── session.service.spec.ts# NEW: Service tests
│   └── chat/
│       └── chat.component.ts          # Existing protected route
├── shared/
│   └── ui/
│       ├── button/                    # From 002-shared-ui-primitives
│       ├── text-input/                # From 002-shared-ui-primitives
│       ├── spinner/                   # From 002-shared-ui-primitives
│       └── index.ts                   # Barrel export
└── app.routes.ts                      # Updated with /login route & guards
```

---

## File Breakdown

### **login.component.ts**
- Declare as standalone component with `@Component`
- Use Reactive Forms with FormGroup
- Implement sign-in simulation (setTimeout with 1-2s delay)
- Call SessionService.setToken() on success
- Redirect via Router.navigate(['/chat'])
- Set browser tab title via Title service

**Key Signals/State**:
- `isSubmitting$`: Signal tracking whether sign-in is in progress

**Key Methods**:
- `onSubmit()`: Handle form submission, validate, simulate async flow
- `ngOnInit()`: Set browser tab title to "Sign In — Lexi"

### **session.service.ts**
- Injectable singleton (providedIn: 'root')
- Methods:
  - `setToken(token: string): void` → store in sessionStorage
  - `getToken(): string | null` → retrieve from sessionStorage
  - `clearToken(): void` → remove from sessionStorage (for logout, if added later)
  - `hasToken(): boolean` → check existence without returning value

### **auth.guard.ts**
- Function-based guard (CanActivateFn per Angular 18+ patterns)
- Check SessionService.hasToken()
- Return true (allow) if token present
- Redirect and return false if token absent
- Special case: /login route redirects authenticated users to /chat

### **app.routes.ts** (Updated)
- Add route: `{ path: 'login', component: LoginComponent }`
- Add guard to protected routes: `{ path: 'chat', component: ChatComponent, canActivate: [authGuard] }`
- Add guard to /login to redirect authenticated users away

---

## Step-by-Step Implementation

### Phase 1: Services
1. Create `src/app/features/auth/services/session.service.ts`
   - Implement token getters/setters using sessionStorage
2. Create unit tests for session service

### Phase 2: Route Guard
1. Create `src/app/features/auth/guards/auth.guard.ts`
   - Inject SessionService and Router
   - Implement decision logic (allow/redirect)
2. Create unit tests for auth guard

### Phase 3: Login Component
1. Create `src/app/features/auth/login/login.component.ts`
   - Declare standalone component
   - Import shared TextInput, Button, Spinner from @app/shared/ui
   - Implement FormGroup with email and password controls
   - Implement sign-in flow with setTimeout simulation
2. Create `login.component.scss` with component styles
3. Implement the template with:
   - Heading: "Sign In"
   - TextInput for email (label, validation error message)
   - TextInput for password (label, validation error message)
   - Button for "Sign In" (disabled when form invalid or submitting, shows spinner while submitting)
   - Inline error messages with `role="alert"` and `aria-invalid` on inputs
4. Create unit tests covering:
   - Form submission with valid credentials
   - Form validation (empty email, empty password, both empty)
   - Loading state display during submission
   - Redirect to /chat on success
   - Token stored in sessionStorage

### Phase 4: Routing
1. Update `src/app/app.routes.ts`:
   - Add /login route → LoginComponent
   - Add guards to /chat and other protected routes
   - Add redirect guard for /login route (authenticated users → /chat)

### Phase 5: Integration Testing
1. Test full user flows:
   - Navigate to /login, enter credentials, submit, verify redirect to /chat
   - Verify session token in sessionStorage
   - Verify unauthenticated navigation to /chat redirects to /login
   - Verify authenticated navigation to /login redirects to /chat

---

## Shared Component Integration

### TextInput Usage
```typescript
<app-text-input
  [value]="email.value"
  [changeEvent]="(value) => email.setValue(value)"
  (blur)="email.markAsTouched()"
  [aria-invalid]="email.invalid && email.touched"
  label="Email address"
  type="email"
/>
@if (email.invalid && email.touched && email.errors?.['required']) {
  <div role="alert" class="error">Email is required</div>
}
```

### Button Usage
```typescript
<button
  [disabled]="form.invalid || isSubmitting()"
  (click)="onSubmit()"
  class="btn-primary"
>
  @if (isSubmitting()) {
    <app-spinner size="small" />
  } @else {
    Sign In
  }
</button>
```

### Spinner Usage
```typescript
@if (isSubmitting()) {
  <app-spinner size="small" color="primary" aria-label="Signing in..." />
}
```

---

## Accessibility Checklist (WCAG 2.1 AA)

- [ ] Form has semantic `<form>` element
- [ ] Labels properly associated with inputs (TextInput component handles this)
- [ ] Error messages have `role="alert"` for screen reader announcement
- [ ] Invalid inputs have `aria-invalid="true"`
- [ ] Button has visible focus indicator (shared Button component ensures this)
- [ ] Color contrast meets 4.5:1 ratio for text (design tokens ensure this)
- [ ] Keyboard navigation works (Enter to submit, Tab to move between fields)
- [ ] All interactive elements are keyboard accessible
- [ ] Pass all AXE checks (automated audit)

---

## Performance Checklist (Core Web Vitals)

- [ ] LCP (Largest Contentful Paint) < 2.5s (simple form, no heavy assets)
- [ ] CLS (Cumulative Layout Shift) < 0.1 (no layout thrashing; stable form)
- [ ] INP (Interaction to Next Paint) < 200ms (form submission responsive)
- [ ] No images (TextInput/Button/Spinner are components, not images)
- [ ] Use ChangeDetectionStrategy.OnPush for all components

---

## Testing Strategy

### Unit Tests (Vitest)

**session.service.spec.ts**:
- setToken stores in sessionStorage
- getToken retrieves from sessionStorage
- hasToken returns true/false correctly
- clearToken removes from sessionStorage

**auth.guard.spec.ts**:
- Token present → return true (allow)
- Token absent → return false + redirect to /login
- /login route with token → redirect to /chat

**login.component.spec.ts**:
- Form validation: empty email/password shows errors
- Form valid with both fields filled
- Submit button disabled when form invalid
- Submit shows spinner, disables button
- Simulated async completes, token stored, redirect to /chat
- Tab title set to "Sign In — Lexi"

### Integration Tests

- Navigate to /login → form renders
- Fill form, submit → redirect to /chat, token in sessionStorage
- Navigate to /chat without token → redirect to /login
- Navigate to /chat with token → page renders

### Accessibility Audit (AXE)

- Run AXE on login page in isolation
- Verify zero violations
- Check keyboard navigation, screen reader compatibility

---

## Success Criteria

From the feature spec:

- **SC-001**: User completes sign-in flow in < 5 seconds ✓
- **SC-002**: Zero AXE accessibility violations ✓
- **SC-003**: Unprotected routes redirect imperceptibly fast ✓
- **SC-004**: Production build with zero errors/warnings ✓
- **SC-005**: Zero ESLint violations ✓

All user stories (US1, US2, US3) and acceptance scenarios must pass.

---

## Dependencies & Prerequisites

✅ **Must Have Before Starting**:
- Angular 21.2.0 (available in project)
- Reactive Forms (@angular/forms) - included in project
- Router (@angular/router) - included in project
- Shared UI components (002-shared-ui-primitives feature) - must be complete
- TypeScript 5.9.2 (available in project)
- Vitest (available in project for testing)

✅ **Architecture Prerequisites**:
- App routes already configured in app.routes.ts
- Chat route exists at /chat (from 001-auth-setup)
- Project uses standalone components (per Constitution)
- ProjectStructure: features/auth/ already exists

---

## Implementation Order

1. **SessionService** (simplest, no dependencies)
2. **AuthGuard** (depends on SessionService)
3. **LoginComponent** (depends on shared components + SessionService)
4. **Route configuration** (ties everything together)
5. **Integration tests** (validates full flow)

---

## Common Pitfalls to Avoid

❌ **Don't use @Input/@Output decorators** — Use `input()` and `output()` functions (per Constitution)
❌ **Don't use ngClass/ngStyle** — Use `class` and `style` bindings directly
❌ **Don't use template-driven forms** — Use Reactive Forms only
❌ **Don't forget aria-invalid and role="alert"** — Required for accessibility
❌ **Don't store token in localStorage** — Use sessionStorage (session-scoped only)
❌ **Don't make real backend calls** — Simulate with setTimeout
❌ **Don't forget browser tab title** — Set via Title service

---

## Resources

- Feature Spec: [specs/003-login-ui/spec.md](../spec.md)
- Data Model: [specs/003-login-ui/data-model.md](../data-model.md)
- Route Guard Contract: [specs/003-login-ui/contracts/auth-guard.md](../contracts/auth-guard.md)
- Research: [specs/003-login-ui/research.md](../research.md)
- Constitution: [.specify/memory/constitution.md](../../../.specify/memory/constitution.md)
- Angular Docs: https://angular.io/guide/standalone-components
- Reactive Forms: https://angular.io/guide/reactive-forms
- WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/
