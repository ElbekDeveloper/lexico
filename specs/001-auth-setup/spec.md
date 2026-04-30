# Feature Specification: Authentication & Project Foundation Setup

**Feature Branch**: `001-auth-setup`
**Created**: 2026-04-28
**Status**: Draft
**Input**: User description: "Authentication library and project foundation setup"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - App Boots Without Errors (Priority: P1)

A developer clones the repository, installs dependencies, and runs the development
server. The application starts successfully, all routes resolve without errors, and
the browser console shows zero TypeScript compilation or lint errors.

**Why this priority**: This is the gate for all future work. Nothing can be built
on a broken foundation.

**Independent Test**: Run `ng serve`, navigate to `/login` and `/chat` in the browser,
confirm both routes load placeholder views without any console errors.

**Acceptance Scenarios**:

1. **Given** a freshly cloned repo with dependencies installed, **When** the developer
   runs the dev server, **Then** the app compiles with zero lint and zero TypeScript
   errors.
2. **Given** the running app, **When** the user navigates to `/login`, **Then** the
   route resolves and displays a placeholder view without errors.
3. **Given** the running app, **When** the user navigates to `/chat`, **Then** the
   route resolves lazily and displays a placeholder view without errors.

---

### User Story 2 - HTTP Requests Carry Auth Credentials (Priority: P2)

When the application makes any HTTP request to the backend API, the interceptor
scaffold automatically attaches authentication credentials (HttpOnly JWT cookie
forwarding) without requiring manual configuration per request.

**Why this priority**: The interceptor is the foundation for all authenticated API
calls; without it, every feature that talks to the backend would need manual wiring.

**Independent Test**: Trigger a test HTTP request (e.g., via Angular's `HttpClient`)
and verify in the browser's network tab that the request includes credentials, or
verify interceptor code is wired but does not break compilation.

**Acceptance Scenarios**:

1. **Given** the HTTP interceptor is registered at the app level, **When** any
   `HttpClient` request is made, **Then** the interceptor function is invoked and
   attaches the appropriate credential header/cookie strategy.
2. **Given** the interceptor scaffold, **When** the app compiles, **Then** there are
   zero type errors related to the interceptor.

---

### User Story 3 - Design System Tokens Available (Priority: P3)

A developer creating a new UI component imports the global SCSS tokens (colors,
typography, spacing) and uses them without any additional configuration. The tokens
reflect a dark, ChatGPT/Claude-like theme.

**Why this priority**: Tokens must exist before any UI component is built; this story
unblocks the entire visual layer.

**Independent Test**: Create a temporary SCSS rule that references a token variable
(e.g., `$color-bg-primary`) and confirm the project compiles without errors.

**Acceptance Scenarios**:

1. **Given** the file `src/styles/tokens.scss` exists, **When** any component SCSS file
   imports it, **Then** all defined token variables resolve without compilation errors.
2. **Given** the tokens file, **When** a developer opens it, **Then** it contains
   color, typography, and spacing tokens matching a dark UI palette.

---

### Edge Cases

- What happens when a user navigates to an undefined route? The router MUST redirect
  to `/login` as the default fallback.
- What happens if the interceptor is registered but the backend is unreachable? The
  interceptor MUST not throw; HTTP errors propagate normally to the caller.
- What happens if `tokens.scss` is imported but a token variable is misspelled? SCSS
  compilation MUST fail with a descriptive error (standard SCSS behavior — no special
  handling needed).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Angular Router MUST be configured with a lazy-loaded route for `/login`
  pointing to a standalone placeholder component at
  `src/app/features/auth/login.component.ts`.
- **FR-002**: The Angular Router MUST be configured with a lazy-loaded route for `/chat`
  pointing to a standalone placeholder component at
  `src/app/features/chat/chat.component.ts`.
- **FR-003**: The router MUST redirect any unmatched path to `/login`.
- **FR-004**: `HttpClient` MUST be provided at the application root level.
- **FR-005**: An HTTP functional interceptor scaffold MUST be registered at the app
  level; it MUST attach `withCredentials: true` to outgoing requests (HttpOnly cookie
  forwarding strategy).
- **FR-005a**: Angular's built-in XSRF protection MUST be enabled via
  `withXsrfConfiguration()` in `provideHttpClient()` so that the XSRF token cookie is
  automatically read and forwarded as a request header on all state-changing requests.
- **FR-005b**: The interceptor MUST apply `withCredentials: true` only to requests
  whose URL begins with `environment.apiUrl`; all other outgoing requests MUST pass
  through unmodified.
- **FR-011**: Angular environment files MUST be created at `src/environments/environment.ts`
  (development, `apiUrl: 'http://localhost:3000/api'`) and
  `src/environments/environment.prod.ts` (production, `apiUrl: '__API_URL__'` as a
  CI/CD substitution token replaced by `envsubst` or `sed` at deploy time). The `angular.json` `fileReplacements`
  configuration MUST swap the development file for the production file during
  `ng build --configuration production`.
- **FR-006**: Reactive Forms MUST be provided at the application root level so feature
  modules can use `ReactiveFormsModule` without re-providing it.
- **FR-007**: A global SCSS tokens file MUST exist at `src/styles/tokens.scss` and
  MUST define SCSS variables (compile-time, no CSS custom properties) for: background
  colors, surface colors, text colors, accent/brand color (`#004068`), border radius,
  spacing scale, and base typography (font family, sizes, weights).
- **FR-008**: The tokens file MUST be referenced in `angular.json` under `styles` AND
  `stylePreprocessorOptions.includePaths` MUST include `"src/styles"` so that any
  component stylesheet can write `@use 'tokens'` (no path prefix) without any
  per-component or per-project configuration changes after initial setup.
- **FR-009**: The application MUST compile with zero errors under `ng build --configuration production`.
- **FR-010**: All configuration MUST comply with Constitution Principle II: no NgModules,
  `inject()` function only, standalone components, `ChangeDetectionStrategy.OnPush`.

### Key Entities

- **AppConfig**: The root application configuration object (`app.config.ts`) that
  provides router, HTTP client, and interceptors using the functional provider API.
- **AuthInterceptor**: A functional HTTP interceptor (`auth.interceptor.ts`) that
  attaches `withCredentials: true` only to outgoing requests whose URL begins with
  `environment.apiUrl`; all other requests pass through unmodified.
- **DesignTokens**: The SCSS token file (`src/styles/tokens.scss`) defining the
  visual design system primitives.
- **PlaceholderRoute**: A minimal standalone Angular component used as a route target
  for `/login` and `/chat` until feature components are implemented.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The application builds to completion (`ng build`) with zero errors and
  zero warnings related to this feature's setup code.
- **SC-002**: Both `/login` and `/chat` routes resolve successfully in the browser
  within the standard Angular bootstrap time (< 3 s on localhost).
- **SC-003**: A developer can add a new UI component and immediately use any token
  variable from `tokens.scss` without modifying any configuration file.
- **SC-004**: Any HTTP request made via `HttpClient` automatically includes credentials
  without any per-call configuration, verifiable in < 1 minute of inspection.
- **SC-005**: Zero lint rule violations are reported by the project's ESLint
  configuration when scanning all files introduced by this feature.

## Clarifications

### Session 2026-04-29

- Q: How should SCSS token variables be made available in component stylesheets without per-component path imports (resolving tension between FR-007 compile-time variables, FR-008, and SC-003)? → A: Add `stylePreprocessorOptions.includePaths: ["src/styles"]` to `angular.json`; keep `tokens.scss` in `styles` array; components use `@use 'tokens'` with no path.
- Q: Where should the lazy-loaded placeholder components for `/login` and `/chat` live in the feature directory structure? → A: `src/app/features/auth/login.component.ts` for `/login` and `src/app/features/chat/chat.component.ts` for `/chat` — separate feature directories using final names.
- Q: What value should `environment.ts` use for `apiUrl` in development? → A: `http://localhost:3000/api`.
- Q: What placeholder should `environment.prod.ts` use for `apiUrl` to support CI/CD substitution? → A: `'__API_URL__'` — explicit substitution token for `envsubst`/`sed` pipelines.

### Session 2026-04-28

- Q: Should the interceptor scaffold include CSRF token handling, or is CSRF deferred? → A: Enable Angular's built-in XSRF support via `withXsrfConfiguration()` in `provideHttpClient()`.
- Q: Should the interceptor target only internal API requests, and how should the base URL be configured? → A: Angular environment files (`src/environments/environment.ts`); interceptor applies credentials only to requests whose URL starts with `environment.apiUrl`.
- Q: Should tokens be SCSS variables, CSS custom properties, or both? → A: SCSS variables only (compile-time). Primary brand/accent color is `#004068`.

## Assumptions

- The Angular CLI project has already been scaffolded (`ng new lexico` or equivalent);
  this feature configures the generated scaffold rather than creating it from scratch.
- Reactive Forms is provided at root level for convenience; individual feature
  components will import `ReactiveFormsModule` directly in their own standalone
  component imports array as needed.
- The JWT authentication strategy uses HttpOnly cookies (not `Authorization` headers);
  the interceptor scaffold adds `withCredentials: true` only — no token string
  manipulation is in scope for this feature.
- Dark theme tokens are modelled on a ChatGPT/Claude-like palette (near-black
  backgrounds, light text, subtle surface elevation, single accent color); exact hex
  values are defined by this feature as sensible defaults and can be revised later.
- No backend API exists yet; the interceptor scaffold is wired and compiles but
  makes no assumptions about endpoint URLs.
- `angular.json` already includes a `styles` array entry for `src/styles.scss`;
  `tokens.scss` will be added alongside it.
