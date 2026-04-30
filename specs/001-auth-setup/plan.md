# Implementation Plan: Authentication & Project Foundation Setup

**Branch**: `001-auth-setup` | **Date**: 2026-04-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/001-auth-setup/spec.md`

## Summary

Configure the Angular 21 application shell: lazy-loaded routing for `/login` and
`/chat` with wildcard redirect, a functional HTTP interceptor attaching `withCredentials`
to API-bound requests with XSRF protection, root-level provider registration for
HttpClient and ReactiveFormsModule, SCSS design tokens exposed via
`stylePreprocessorOptions.includePaths` for zero-path `@use 'tokens'` access, and
Angular environment files with CI/CD-friendly production placeholders. All code is
standalone, OnPush, and signals-first; no NgModules introduced.

## Technical Context

**Language/Version**: TypeScript 5.9.2, Angular 21.2  
**Primary Dependencies**: @angular/core 21.2, @angular/router 21.2,
@angular/common/http 21.2, @angular/forms 21.2, sass  
**Storage**: N/A  
**Testing**: Vitest + `@angular/build:unit-test` (Angular 21 CLI default)  
**Target Platform**: Modern browsers (Chrome 120+, Firefox 120+, Safari 17+)  
**Project Type**: Single-page Angular application  
**Performance Goals**: Route resolution < 3 s on localhost (SC-002);
LCP < 2.5 s, CLS < 0.1, INP < 200 ms (Constitution IV)  
**Constraints**: Zero lint errors (SC-005), zero build errors (SC-001),
WCAG 2.1 AA (Constitution III), no NgModules (Constitution II), TypeScript strict  
**Scale/Scope**: Foundation layer for a chat application; no user-facing data entities

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. SDD | ✅ PASS | spec.md + clarifications complete before any implementation |
| II. Angular Signals-First | ✅ PASS | Standalone, OnPush, `inject()`, no NgModules, strict TS, no `any` |
| III. Accessible by Default | ✅ PASS | Placeholder components require semantic landmark + page `<title>`, AXE-clean |
| IV. Performance-Governed Delivery | ✅ PASS | Lazy-loaded routes; no static images in this feature |
| V. Feature-Based, Lazy-Loaded Architecture | ✅ PASS | `features/auth/`, `features/chat/`; SCSS tokens in `src/styles/`; no inline styles |

*No violations. Complexity Tracking table omitted.*

## Project Structure

### Documentation (this feature)

```text
specs/001-auth-setup/
├── plan.md              # This file (/speckit-plan output)
├── research.md          # Phase 0: decisions & rationale
├── data-model.md        # Phase 1: configuration types & interfaces
├── quickstart.md        # Phase 1: developer onboarding guide
├── contracts/
│   ├── routes.md        # Route path & redirect contract
│   ├── http.md          # Interceptor behaviour contract
│   └── tokens.md        # SCSS token variable contract
└── tasks.md             # Phase 2 output (/speckit-tasks — not created here)
```

### Source Code

```text
src/
├── app/
│   ├── app.config.ts                        # Root providers (router, HTTP, forms)
│   ├── app.ts                               # Root component (add OnPush + ChangeDetection)
│   ├── app.html                             # Root template (<router-outlet>)
│   ├── app.scss                             # Root component styles
│   ├── app.routes.ts                        # /login, /chat, ** → /login
│   ├── shared/
│   │   └── interceptors/
│   │       └── auth.interceptor.ts          # Functional HTTP interceptor
│   └── features/
│       ├── auth/
│       │   └── login.component.ts           # Standalone placeholder for /login
│       └── chat/
│           └── chat.component.ts            # Standalone placeholder for /chat
├── environments/
│   ├── environment.ts                       # { apiUrl: 'http://localhost:3000/api' }
│   └── environment.prod.ts                  # { apiUrl: '__API_URL__' }
└── styles/
    └── tokens.scss                          # SCSS compile-time token variables

angular.json (modified):
  build.options.styles:                  add 'src/styles/tokens.scss'
  build.options.stylePreprocessorOptions: { includePaths: ['src/styles'] }
  build.configurations.production.fileReplacements:
    environment.ts → environment.prod.ts
```

**Structure Decision**: Single Angular SPA. Feature placeholders live under
`src/app/features/<feature>/` to establish permanent directory names.
Interceptor is registered at the provider level in `app.config.ts` (no separate
directory needed — it is a single file and a configuration concern, not a feature).
SCSS tokens in `src/styles/` per constitution V.
