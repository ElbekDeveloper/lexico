# Research: Authentication & Project Foundation Setup

**Branch**: `001-auth-setup` | **Date**: 2026-04-29

No NEEDS CLARIFICATION items remained after `/speckit-clarify`. This document records
the key technical decisions and their rationale for audit and task-generation context.

---

## Decision 1: Angular Functional Interceptors

**Decision**: Use `HttpInterceptorFn` with `withInterceptors([authInterceptor])` inside
`provideHttpClient()`.

**Rationale**: Angular 14+ class-based interceptors are deprecated in standalone apps.
Functional interceptors are tree-shakeable, type-safe, and composable without DI class
boilerplate. Angular 21 enforces the functional approach.

**Implementation pattern**:
```typescript
// auth.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) return next(req);
  return next(req.clone({ withCredentials: true }));
};

// app.config.ts
provideHttpClient(
  withInterceptors([authInterceptor]),
  withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' }),
)
```

**Alternatives considered**:
- Class-based `HttpInterceptor` — deprecated in standalone Angular, rejected.
- Manual `Authorization` header injection — out of scope; JWT strategy uses HttpOnly
  cookies, not bearer tokens.

---

## Decision 2: XSRF Configuration

**Decision**: `withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' })`
passed as a feature to `provideHttpClient()`.

**Rationale**: Angular's built-in XSRF support reads a cookie and forwards it as a
request header automatically on state-changing requests (POST/PUT/PATCH/DELETE).
The default cookie/header names match common server frameworks (Django, Spring, Express
with `csurf`). Explicit configuration documents intent clearly even though the values
match the defaults.

**Alternatives considered**:
- Custom XSRF interceptor — unnecessary; Angular's built-in implementation is
  sufficient and well-tested.

---

## Decision 3: SCSS Token Accessibility Strategy

**Decision**: Add `stylePreprocessorOptions: { includePaths: ['src/styles'] }` to
`angular.json` build options, and list `src/styles/tokens.scss` in the `styles` array.
Component stylesheets use `@use 'tokens'` (no path prefix required).

**Rationale**: SCSS compile-time variables are not propagated by CSS global loading
alone — the file must be `@use`-d in each consuming SCSS file. `includePaths` makes the
`src/styles/` directory a search root so that `@use 'tokens'` resolves without a
relative path. This satisfies SC-003 ("without modifying any configuration file")
because the `angular.json` change is a one-time foundation setup, not a per-component
change. CSS custom properties were rejected to preserve compile-time SCSS semantics
(FR-007 clarification).

**Alternatives considered**:
- CSS custom properties at `:root` — rejected by clarification (FR-007 mandates SCSS
  variables for compile-time safety).
- Per-component `@use 'src/styles/tokens'` — verbose, violates SC-003 spirit.

---

## Decision 4: ReactiveFormsModule at Root

**Decision**: `importProvidersFrom(ReactiveFormsModule)` in `app.config.ts` providers
array (FR-006).

**Rationale**: In standalone Angular, `ReactiveFormsModule` provides no DI tokens
itself (its value is its directives). However, the spec mandates root-level provision
for consistency. Each feature component will still import `ReactiveFormsModule` in its
`imports` array to use form directives, but the root provision signals intent and
eliminates any edge-case DI issues.

**Alternatives considered**:
- Per-component import only — correct in practice, but deviates from FR-006.

---

## Decision 5: Environment Files & fileReplacements

**Decision**: Create `src/environments/environment.ts` (dev) and
`src/environments/environment.prod.ts` (prod) with an `Environment` interface.
Configure `fileReplacements` in `angular.json` under `configurations.production`.

**Rationale**: Standard Angular CLI pattern. The `'__API_URL__'` production placeholder
is a `sed`/`envsubst` CI/CD substitution token — it fails loudly if substitution is
skipped (requests to `'__API_URL__'` will 404 immediately), preventing silent
misconfiguration.

**Alternatives considered**:
- Runtime environment injection via `APP_INITIALIZER` — over-engineered for this
  foundation; the Angular `fileReplacements` approach is simpler and compile-time safe.
- Empty string `''` — `startsWith('')` would match all requests in production if
  substitution is forgotten; rejected on safety grounds.

---

## Decision 6: Angular 21 Zoneless

**Decision**: The project uses Angular 21's zoneless change detection (no zone.js
dependency). The existing `provideBrowserGlobalErrorListeners()` in `app.config.ts`
is the Angular 21 equivalent of the zone.js error handler.

**Rationale**: The scaffolded `app.config.ts` already uses `provideBrowserGlobalErrorListeners()`
rather than zone.js providers, confirming zoneless mode. All components must use
`ChangeDetectionStrategy.OnPush` and signals for state — already required by
Constitution II.

---

## Decision 7: Test Runner

**Decision**: Vitest via `@angular/build:unit-test` (configured in `angular.json`).

**Rationale**: Angular 21 CLI uses Vitest as the default test runner (replacing
Karma/Jasmine). The `package.json` confirms `vitest ^4.0.8` as a dev dependency.
Test files follow `*.spec.ts` convention, co-located with source files.
