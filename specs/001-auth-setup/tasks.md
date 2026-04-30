# Tasks: Authentication & Project Foundation Setup

**Input**: Design documents from `specs/001-auth-setup/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not included — no automated tests requested in spec. Independent test
criteria per story are provided as manual verification steps.

**Organization**: Tasks are grouped by user story to enable independent implementation
and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths are included in every description

---

## Phase 1: Setup (Build Configuration)

**Purpose**: `angular.json` changes that gate all three user stories. No runtime code.

- [x] T001 Configure `angular.json` — add `fileReplacements` block under `configurations.production` (`environment.ts` → `environment.prod.ts`), add `stylePreprocessorOptions: { "includePaths": ["src/styles"] }` under `build.options`, and add `"src/styles/tokens.scss"` to the `build.options.styles` array alongside `"src/styles.scss"`

**Checkpoint**: Build configuration ready. Environment swap and token includePaths active.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Environment files required by the HTTP interceptor (US2). Must exist before Phase 4.

**⚠️ CRITICAL**: US2 interceptor cannot be written without `environment.apiUrl` in scope.

- [x] T002 [P] Create `src/environments/environment.ts` — export `Environment` interface `{ apiUrl: string }` and `export const environment: Environment = { apiUrl: 'http://localhost:3000/api' }`
- [x] T003 [P] Create `src/environments/environment.prod.ts` — export `export const environment: Environment = { apiUrl: '__API_URL__' }` (imports `Environment` type from `environment.ts` via type-only import)

**Checkpoint**: Foundation ready — environment files in place, US2 can now proceed after US1.

---

## Phase 3: User Story 1 — App Boots Without Errors (Priority: P1) 🎯 MVP

**Goal**: Application compiles, routes to `/login` and `/chat` resolve lazy-loaded
placeholder views, wildcard redirects to `/login`, zero console errors.

**Independent Test**: Run `ng serve --configuration development`. Navigate to
`http://localhost:4200/login` — placeholder view loads. Navigate to
`http://localhost:4200/chat` — placeholder view loads. Navigate to
`http://localhost:4200/unknown` — redirects to `/login`. Browser console shows zero
TypeScript or lint errors.

- [x] T004 [P] [US1] Update `src/app/app.ts` — add `changeDetection: ChangeDetectionStrategy.OnPush` to `@Component` decorator; remove the unused `title` signal and `signal` import; keep `RouterOutlet` import
- [x] T005 [P] [US1] Replace `src/app/app.html` with a minimal clean template containing only `<router-outlet />` (removes the Angular welcome placeholder entirely)
- [x] T006 [P] [US1] Create `src/app/features/auth/login.component.ts` — standalone component (do NOT set `standalone: true`), `changeDetection: ChangeDetectionStrategy.OnPush`, inline template `<main><h1>Login</h1></main>`, selector `app-login`, class `LoginComponent`
- [x] T007 [P] [US1] Create `src/app/features/chat/chat.component.ts` — standalone component (do NOT set `standalone: true`), `changeDetection: ChangeDetectionStrategy.OnPush`, inline template `<main><h1>Chat</h1></main>`, selector `app-chat`, class `ChatComponent`
- [x] T008 [US1] Update `src/app/app.routes.ts` — define `routes: Routes` with three entries: `{ path: 'login', loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) }`, `{ path: 'chat', loadComponent: () => import('./features/chat/chat.component').then(m => m.ChatComponent) }`, `{ path: '**', redirectTo: 'login' }` (depends on T006, T007)

**Checkpoint**: US1 complete — run the independent test above to validate before proceeding.

---

## Phase 4: User Story 2 — HTTP Requests Carry Auth Credentials (Priority: P2)

**Goal**: Any `HttpClient` request whose URL begins with `environment.apiUrl` automatically
includes `withCredentials: true`. XSRF token cookie is forwarded as a header on
state-changing requests. ReactiveFormsModule provided at root.

**Independent Test**: In browser DevTools Network tab, trigger any `HttpClient` GET to
`http://localhost:3000/api/*`. Confirm `credentials: include` in the request. Confirm
the app still compiles with zero errors.

**Dependencies**: Requires T002, T003 (Phase 2) for `environment.apiUrl`.

- [x] T009 [US2] Create `src/app/shared/interceptors/auth.interceptor.ts` — export `const authInterceptor: HttpInterceptorFn` that returns `next(req)` unchanged if `!req.url.startsWith(environment.apiUrl)`, otherwise returns `next(req.clone({ withCredentials: true }))`; import `environment` from `../../environments/environment`
- [x] T010 [US2] Update `src/app/app.config.ts` — add `provideHttpClient(withInterceptors([authInterceptor]), withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' }))` and `importProvidersFrom(ReactiveFormsModule)` to the `providers` array; keep existing `provideBrowserGlobalErrorListeners()` and `provideRouter(routes)` entries (depends on T009)

**Checkpoint**: US2 complete — verify interceptor is invoked and credentials flag is set for API-bound requests.

---

## Phase 5: User Story 3 — Design System Tokens Available (Priority: P3)

**Goal**: All SCSS token variables are accessible in any component stylesheet via
`@use 'tokens'` with no path prefix and no per-component config changes.

**Independent Test**: Add `@use 'tokens'; .smoke-test { color: tokens.$color-text-primary; }`
to any component SCSS file and run `ng build`. Confirm zero compilation errors, then
remove the smoke-test rule.

**Dependencies**: Requires T001 (Phase 1) for `stylePreprocessorOptions.includePaths`.

- [x] T011 [US3] Create `src/styles/tokens.scss` — define all SCSS variables per `specs/001-auth-setup/contracts/tokens.md`: colors (`$color-bg-primary: #0d0d0d`, `$color-bg-surface: #1a1a1a`, `$color-bg-elevated: #242424`, `$color-text-primary: #ececec`, `$color-text-secondary: #8e8ea0`, `$color-text-disabled: #565869`, `$color-accent: #004068`, `$color-border: #2e2e2e`), border-radius (`$border-radius-sm: 4px`, `$border-radius-md: 8px`, `$border-radius-lg: 16px`), spacing scale (`$spacing-1: 4px` through `$spacing-8: 32px`), and typography (`$font-family-base: 'Inter', system-ui, sans-serif`, font sizes sm/md/lg/xl, font weights regular/medium/bold)

**Checkpoint**: US3 complete — run the independent test above to validate token resolution.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation ensuring all success criteria are met end-to-end.

- [x] T012 [P] Run `ng lint` from repo root — verify zero lint violations across all files introduced or modified by this feature (`app.ts`, `app.html`, `app.routes.ts`, `app.config.ts`, `login.component.ts`, `chat.component.ts`, `auth.interceptor.ts`, `environment.ts`, `environment.prod.ts`, `tokens.scss`); fix any violations (SC-005)
- [x] T013 [P] Run `ng build --configuration production` from repo root — verify zero errors and zero budget warnings for feature code; confirm environment file replacement is applied (SC-001, FR-009)

**Checkpoint**: All success criteria met — feature complete and production-build-clean.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 completion
- **Phase 3 (US1)**: Depends on Phase 1 (routes need app shell clean); can overlap with Phase 2
- **Phase 4 (US2)**: Depends on Phase 2 (environment files) and Phase 3 (app shell must boot)
- **Phase 5 (US3)**: Depends on Phase 1 (angular.json includePaths); independent of Phases 2–4
- **Phase 6 (Polish)**: Depends on Phases 3, 4, 5 all complete

### User Story Dependencies

- **US1 (P1)**: After Phase 1 — no dependency on other stories
- **US2 (P2)**: After Phase 2 (environment files) — no dependency on US3
- **US3 (P3)**: After Phase 1 (angular.json) — no dependency on US1 or US2

### Within Each Phase

- T004, T005, T006, T007 (US1): All touch different files — fully parallel
- T008 (US1): References component paths from T006, T007 — run last in Phase 3
- T009 (US2): Must exist before T010 (app.config.ts imports the interceptor)
- T002, T003 (Foundational): Independent environment files — fully parallel
- T012, T013 (Polish): Different operations (lint vs build) — can run in parallel

---

## Parallel Example: User Story 1

```bash
# All four tasks touch different files — launch simultaneously:
Task T004: "Update src/app/app.ts — add OnPush, remove title signal"
Task T005: "Replace src/app/app.html with router-outlet only"
Task T006: "Create src/app/features/auth/login.component.ts"
Task T007: "Create src/app/features/chat/chat.component.ts"

# Then, after all four complete:
Task T008: "Update src/app/app.routes.ts — lazy routes + wildcard redirect"
```

## Parallel Example: Foundational Phase

```bash
# Both environment files are independent:
Task T002: "Create src/environments/environment.ts"
Task T003: "Create src/environments/environment.prod.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (`angular.json`)
2. Complete Phase 2: Foundational (environment files)
3. Complete Phase 3: User Story 1 (routes + placeholder components)
4. **STOP and VALIDATE**: Navigate to `/login`, `/chat`, and `/unknown` in the browser
5. Confirm zero console errors — US1 is independently shippable

### Incremental Delivery

1. Setup + Foundational → Config and env files ready
2. US1 → App boots, routes work → **Demo-able: base shell complete**
3. US2 → HTTP credentials wired → **All API calls get credentials automatically**
4. US3 → Design tokens live → **Visual layer unblocked for all future components**
5. Polish → Production build verified → **Branch ready to merge**

### Parallel Team Strategy

With two developers after Phase 1 + 2 complete:
- Developer A: US1 (T004–T008) — app shell
- Developer B: US3 (T011) — design tokens (Phase 1 already done)
- After US1 done: Developer A continues to US2 (T009–T010)

---

## Notes

- `[P]` tasks touch different files and have no shared in-flight dependencies
- `[Story]` label maps each task to its user story for traceability and independent testing
- Do NOT set `standalone: true` in component decorators — it is the Angular 21 default
- Do NOT use `@Input`, `@Output`, or constructor injection — use `input()`, `output()`, `inject()`
- `app.ts` currently imports `signal` — remove it along with the `title` property when updating T004
- `environment.prod.ts` MUST import the `Environment` type via `import type` to avoid circular runtime issues
- Each user story has an independent test that can be validated without completing other stories
