# Contract: Authentication Route Guard

**Date**: 2026-04-30 | **Feature**: 003-login-ui | **Status**: FINAL

This document defines the interface contract for the authentication route guard used to protect routes in the application.

---

## Overview

The **Auth Route Guard** (`auth.guard.ts`) is a functional Angular route guard that determines whether a user can navigate to a protected route based on the presence of a session token in browser session storage.

**Guard Type**: CanActivateFn (function-based route guard per Angular 18+ patterns)

**Scope**: Applied to all protected routes (e.g., `/chat` and any future authenticated routes).

---

## Guard Decision Logic

```typescript
canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
  const sessionToken = sessionStorage.getItem('auth_token');
  
  // If token exists, user is authenticated
  if (sessionToken) {
    return true;  // Allow navigation to protected route
  }
  
  // If no token, redirect to login
  router.navigate(['/login']);
  return false;  // Block navigation
}
```

---

## Redirect Guard (Special Case for /login Route)

For the `/login` route specifically, an additional guard checks if the user is already authenticated:

```typescript
canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
  const sessionToken = sessionStorage.getItem('auth_token');
  
  // If already authenticated, redirect away from login page
  if (sessionToken) {
    router.navigate(['/chat']);
    return false;
  }
  
  // If not authenticated, allow access to login form
  return true;
}
```

---

## Input/Output Specification

### Inputs
- **Route**: The target route being activated (e.g., `/chat`, `/login`).
- **State**: Current router state (URL, query params, fragments).
- **Session Token**: Read from `sessionStorage.getItem('auth_token')`.

### Outputs
- **Return Value**: `true` (allow navigation) or `false` (block, optionally redirect).
- **Side Effects**:
  - May call `router.navigate()` to redirect to `/login` or `/chat`.
  - No mutations to session storage or other state.

---

## Behavior Specification

| Scenario | Session Token Present? | Navigation Target | Guard Decision | Action |
|----------|--------|---|---|---|
| User logs in, navigates to /chat | YES | /chat | ALLOW (true) | Navigate to /chat |
| User navigates to /chat without token | NO | /chat | BLOCK + REDIRECT (false) | Redirect to /login |
| User navigates to /login without token | NO | /login | ALLOW (true) | Navigate to /login (show form) |
| Authenticated user navigates to /login | YES | /login | BLOCK + REDIRECT (false) | Redirect to /chat |
| User refreshes page while on /chat | YES | /chat | ALLOW (true) | Navigate to /chat (token persists in sessionStorage) |
| User closes tab, opens new tab, navigates to /chat | NO | /chat | BLOCK + REDIRECT (false) | Redirect to /login (token cleared by sessionStorage) |

---

## Error Handling

- **Invalid/Expired Token**: Not handled in this feature (simulated auth always succeeds). Future features may add token validation.
- **Navigation Failure**: Router handles. Guard only returns boolean; does not catch navigation errors.
- **Missing sessionStorage**: Guard treats missing sessionStorage as "no token" (supported in all modern browsers; no special handling needed).

---

## Performance Expectations

- **Guard Execution Time**: < 1ms (synchronous lookup in sessionStorage).
- **No Network Calls**: Entirely synchronous and local.
- **No Side Effects on UI**: Only redirects; does not render or update components.

---

## Accessibility Considerations

- **Keyboard Navigation**: Guard does not affect keyboard navigation; all redirects use `router.navigate()` which works with keyboard.
- **Screen Readers**: Redirect operations are transparent to screen readers; no ARIA updates needed.
- **Focus Management**: After redirect, browser/router naturally moves focus to new route. No additional focus management needed.

---

## Testing Requirements

### Unit Test Cases

1. **Allow authenticated user to /chat**: Session token present → return true.
2. **Block unauthenticated user to /chat**: No session token → return false and redirect to /login.
3. **Allow unauthenticated user to /login**: No session token → return true.
4. **Block authenticated user from /login**: Session token present → return false and redirect to /chat.
5. **Verify router.navigate() called with correct path** when blocking/redirecting.
6. **Verify sessionStorage.getItem() called** to check for token.

### Integration Test Cases

1. **User logs in, then navigates between /chat and /login**: Guards work correctly.
2. **User refreshes page on /chat while authenticated**: Guard re-checks token, allows navigation.
3. **Session token cleared externally**: Guard detects absence, redirects to /login.

---

## Future Enhancements (Out of Scope)

- Token expiration checks (currently not implemented; tokens persist for session duration).
- Role-based access control (RBAC): Extend guard to check user roles before allowing route.
- Feature flags: Conditionally protect routes based on feature availability.
- Audit logging: Log all guard decisions for security monitoring.

---

## Contract Compliance Checklist

- ✅ Synchronous primary path (no unnecessary async).
- ✅ Clear decision logic (allow or redirect).
- ✅ No mutations to authentication state (guard only reads sessionStorage).
- ✅ Handles all edge cases (token present/absent, /login vs. protected routes).
- ✅ Testable and observable behavior.
- ✅ Compatible with Angular 21+ CanActivateFn pattern.
- ✅ WCAG 2.1 AA compliant (guard is invisible to users; no accessibility concerns).
- ✅ Follows Constitution Principle V (feature-based architecture): guard is part of auth feature.
