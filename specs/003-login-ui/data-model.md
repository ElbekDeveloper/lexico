# Data Model: Login UI Feature

**Date**: 2026-04-30 | **Feature**: 003-login-ui | **Status**: COMPLETE

This document defines all entities, their fields, relationships, and state transitions for the login UI feature.

---

## Core Entities

### 1. Session Token

**Purpose**: Represents the user's authenticated session.

**Fields**:
- `value` (string): The opaque token string (e.g., UUID or JWT). Non-empty.
- `expiresAt` (number | null): Milliseconds since epoch when token expires. Not used in this feature (session-scoped token expires on tab close).

**Validation Rules**:
- MUST be non-empty string after sign-in.
- MUST be stored in `sessionStorage["auth_token"]`.
- MUST be cleared when tab closes (automatic via sessionStorage).
- MUST be checked before allowing access to protected routes.

**State Transitions**:
```
[Not Present] --sign-in-successful--> [Present in sessionStorage] --tab-close-or-logout--> [Not Present]
```

**Constraints**:
- Max length: 500 characters (reasonable for token strings).
- Format: Any non-empty string (no specific format validation for simulated auth).

---

### 2. Login Credentials

**Purpose**: User-provided email and password for sign-in attempt.

**Fields**:
- `email` (string): Email address entered by user. Must be non-empty.
- `password` (string): Password entered by user. Must be non-empty.

**Validation Rules**:
- `email`: MUST NOT be empty (required). Email format validation is out of scope (no regex validation).
- `password`: MUST NOT be empty (required). No minimum length requirement.

**Constraints**:
- `email` max length: 254 characters (per RFC 5321).
- `password` max length: 500 characters (practical limit).
- Neither field is persisted after sign-in; they exist only in form state.

**State Transitions**:
```
[User enters values] -> [Validates on blur] -> [Submits] -> [Compared against validation rules] -> [Success/Failure]
```

---

### 3. Form State

**Purpose**: Tracks the login form's validation state and submission progress.

**Fields**:
- `email` (FormControl): Reactive Forms control for email input.
  - `value`: string (user input).
  - `valid`: boolean (non-empty).
  - `touched`: boolean (user interacted with field).
  - `errors`: { required?: true } (validation errors).
- `password` (FormControl): Reactive Forms control for password input.
  - `value`: string (user input).
  - `valid`: boolean (non-empty).
  - `touched`: boolean (user interacted with field).
  - `errors`: { required?: true } (validation errors).
- `isSubmitting` (signal<boolean>): Whether sign-in is in progress.

**Validation Rules**:
- Form is valid only if both email and password are non-empty.
- Errors only display after the user has touched the field (`touched: true`).
- Submit button is disabled if form is invalid OR submission is in progress.
- Spinner is shown ONLY while `isSubmitting` is true.

**State Transitions**:
```
[Pristine] -> [User enters email] -> [email.touched=true] 
   -> [User enters password] -> [password.touched=true]
   -> [Validates as required] -> [Form valid]
   -> [User clicks Sign In] -> [isSubmitting=true, spinner shown]
   -> [Simulated delay completes] -> [Token stored, redirect to /chat]
```

---

### 4. Route Guard State

**Purpose**: Determines whether a user can navigate to protected routes.

**Fields**:
- `hasSessionToken` (boolean): True if session token exists in sessionStorage.

**Validation Rules**:
- If `hasSessionToken` is false:
  - User navigates to protected route (e.g., `/chat`) → redirect to `/login`.
  - User navigates to `/login` → allow (show login form).
- If `hasSessionToken` is true:
  - User navigates to protected route (e.g., `/chat`) → allow.
  - User navigates to `/login` → redirect to `/chat` (already authenticated).

**State Transitions**:
```
[No token] --navigate to /login--> [Show login form]
[No token] --navigate to /chat--> [Redirect to /login]
[Has token] --navigate to /login--> [Redirect to /chat]
[Has token] --navigate to /chat--> [Show chat page]
[Has token] --tab close--> [Token cleared, sessionStorage empty]
[No token] --navigate to /chat--> [Redirect to /login]
```

---

## Relationships

```
┌─────────────────┐
│ Login Component │
│    (UI Layer)   │
└────────┬────────┘
         │
         ├─ Uses: FormGroup (email, password controls)
         │
         ├─ Uses: TextInput component (shared)
         │
         ├─ Uses: Button component (shared)
         │
         ├─ Uses: Spinner component (shared)
         │
         └─ Calls: SessionService.setToken()
                   │
                   ├─ Stores Session Token in sessionStorage
                   │
                   └─ Triggers router redirect to /chat

┌──────────────────┐
│  Route Guard     │
│  (Router Layer)  │
└────────┬─────────┘
         │
         ├─ Calls: SessionService.getToken()
         │
         ├─ Returns: boolean (canActivate)
         │
         └─ May redirect: to /login or /chat
```

---

## Validation Rules Summary

| Entity | Field | Validation | Error Message |
|--------|-------|-----------|---------|
| Credentials | email | Required (non-empty) | "Email is required" |
| Credentials | password | Required (non-empty) | "Password is required" |
| Form | Both fields | Both required | Show both error messages |
| Session Token | value | Non-empty string | N/A (stored only on success) |

---

## State Transitions Diagram

```
╔════════════════════════════════════════════════════════════════╗
║                    LOGIN FEATURE STATE FLOW                    ║
╚════════════════════════════════════════════════════════════════╝

START: User navigates to /login
  │
  ├─→ [Route Guard Check] Session token exists?
  │   ├─ YES → Redirect to /chat (already authenticated)
  │   └─ NO → Proceed to login form
  │
  └─→ [Login Component] Render empty form
      │
      ├─→ [User enters email] email.value = "user@example.com"
      ├─→ [User enters password] password.value = "password123"
      │
      ├─→ [User clicks "Sign In" or presses Enter]
      │   │
      │   ├─→ [Form Validation]
      │   │   ├─ Email empty? YES → Show "Email is required"
      │   │   ├─ Password empty? YES → Show "Password is required"
      │   │   └─ Both filled? YES → Proceed to sign-in
      │   │
      │   └─→ [Submission Flow]
      │       │
      │       ├─→ Set isSubmitting = true (button disabled, spinner shown)
      │       ├─→ Simulate 1-2 second delay
      │       ├─→ Store token: sessionStorage.setItem("auth_token", "token_value")
      │       ├─→ Set isSubmitting = false
      │       └─→ Redirect to /chat (router.navigate(['/chat']))
      │
      └─→ [Protected Route Navigation]
          │
          ├─→ [Route Guard Check] Session token exists?
          │   ├─ YES → Allow navigation to /chat
          │   └─ NO → Redirect to /login
          │
          └─→ [Chat Component] Renders (user authenticated)
```

---

## No Further Unknowns

All entities, fields, validations, and state transitions are finalized. Ready for implementation.
