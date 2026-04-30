# Implementation Plan: Login UI

**Branch**: `003-login-ui` | **Date**: 2026-04-30 | **Spec**: [specs/003-login-ui/spec.md](specs/003-login-ui/spec.md)
**Input**: Feature specification from `/specs/003-login-ui/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Build a complete login page UI at `/login` using shared UI primitives (Button, TextInput, Spinner) from `002-shared-ui-primitives`. Implement a reactive form with client-side validation, simulated authentication flow, and route guards to protect all authenticated routes. The feature establishes the authentication UX pattern for the entire application.

## Technical Context

**Language/Version**: TypeScript 5.9.2, Angular 21.2.0  
**Primary Dependencies**: @angular/forms (Reactive Forms), @angular/router, @app/shared/ui  
**Storage**: Window.sessionStorage (browser session storage only)  
**Testing**: Vitest with Angular testing utilities  
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Web application (single-page Angular app)  
**Performance Goals**: LCP < 2.5s, CLS < 0.1, INP < 200ms (from Constitution Principle IV)  
**Constraints**: WCAG 2.1 AA accessibility compliance (zero AXE violations), Reactive Forms mandatory, no backend calls  
**Scale/Scope**: Single feature — login page with form validation and route guard scaffold

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|-----------|------|--------|
| **I. Spec-Driven Development** | Spec approved before coding? | ✅ PASS — Spec approved; plan links to spec; PR will reference it |
| **II. Signals-First Architecture** | Standalone components only? Signals for state? OnPush change detection? No NgModules? | ✅ PASS — Will use standalone components, signals, OnPush, Reactive Forms; no NgModules |
| **III. Accessible by Default** | Zero AXE violations? WCAG 2.1 AA compliant? | ✅ PASS — FR-011 mandates zero AXE violations; shared TextInput & Button are already accessible |
| **IV. Performance-Governed Delivery** | LCP < 2.5s, CLS < 0.1, INP < 200ms? NgOptimizedImage used? Routes lazy-loaded? | ✅ PASS — Simple login form; no images; lazy-loaded feature route; performance budget compliant |
| **V. Feature-Based Architecture** | Feature in src/app/features/<name>/? Lazy-loaded route? Single responsibility? | ✅ PASS — Will be at src/app/features/auth/login/; lazy-loaded under `/login` route; isolated responsibility |

**Gate Result**: ✅ ALL GATES PASS — Feature is constitution-compliant and ready for Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/003-login-ui/
├── plan.md              # This file (/speckit-plan command output)
├── spec.md              # Feature specification (approved)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   └── login-guard.md   # Route guard contract
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── features/
│   │   ├── auth/                      # Existing from 001-auth-setup
│   │   │   ├── login/                 # NEW - Login feature
│   │   │   │   ├── login.component.ts
│   │   │   │   ├── login.component.scss
│   │   │   │   ├── login.component.spec.ts
│   │   │   │   └── login-form.service.ts
│   │   │   ├── guards/                # NEW - Route guards
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── auth.guard.spec.ts
│   │   │   └── services/              # NEW - Auth services
│   │   │       ├── session.service.ts
│   │   │       └── session.service.spec.ts
│   │   └── chat/                      # Existing protected route
│   │       └── chat.component.ts
│   ├── shared/
│   │   ├── ui/
│   │   │   ├── button/                # From 002-shared-ui-primitives
│   │   │   ├── text-input/            # From 002-shared-ui-primitives
│   │   │   ├── spinner/               # From 002-shared-ui-primitives
│   │   │   └── index.ts
│   │   └── interceptors/
│   │       └── auth.interceptor.ts    # Existing
│   ├── app.routes.ts                  # Updated with login route & guards
│   └── app.config.ts
└── styles/
    └── tokens.scss                    # Design tokens (colors, spacing, etc.)
```

**Structure Decision**: Single-project Angular web application with feature-based directory structure. The login feature extends the existing `auth` feature module established in `001-auth-setup`. All new auth-related components (login, guards, session service) are co-located under `src/app/features/auth/` to maintain feature isolation and lazy-loading pattern.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**Status**: No constitution violations. All principles are satisfied by the design.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
