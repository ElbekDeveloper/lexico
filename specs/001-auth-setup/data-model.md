# Data Model: Authentication & Project Foundation Setup

**Branch**: `001-auth-setup` | **Date**: 2026-04-29

This feature introduces no runtime data entities. The "model" is a set of
compile-time configuration types and interfaces that form the contract between
foundation setup and all future features.

---

## Environment Interface

```typescript
// src/environments/environment.ts
export interface Environment {
  apiUrl: string;
}

export const environment: Environment = {
  apiUrl: 'http://localhost:3000/api',
};

// src/environments/environment.prod.ts
export const environment: Environment = {
  apiUrl: '__API_URL__',  // replaced by CI/CD envsubst at deploy time
};
```

**Constraint**: `apiUrl` MUST NOT have a trailing slash. The interceptor uses
`req.url.startsWith(environment.apiUrl)` for prefix matching.

---

## HTTP Interceptor Type

```typescript
// Functional interceptor signature (from @angular/common/http)
type HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => Observable<HttpEvent<unknown>>;
```

The `authInterceptor` implementation satisfies this type. It is a pure function with
no constructor dependencies; it reads `environment.apiUrl` at call time via direct
import.

---

## Route Configuration Type

```typescript
// src/app/app.routes.ts
import { Routes } from '@angular/router';

// Three entries required:
// 1. { path: 'login',  loadComponent: () => import(...LoginComponent) }
// 2. { path: 'chat',   loadComponent: () => import(...ChatComponent) }
// 3. { path: '**',     redirectTo: 'login' }
type AppRoutes = Routes; // Routes = Route[]
```

---

## Application Config Shape

```typescript
// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';

// providers array must include:
// - provideBrowserGlobalErrorListeners()   — already present
// - provideRouter(routes)                  — already present
// - provideHttpClient(
//     withInterceptors([authInterceptor]),
//     withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' }),
//   )
// - importProvidersFrom(ReactiveFormsModule)
```

---

## SCSS Token Variables

All token names below are the compile-time SCSS variable interface. Any component
that `@use 'tokens'` can access these names.

| Variable | Type | Description |
|----------|------|-------------|
| `$color-bg-primary` | color | Page background (near-black) |
| `$color-bg-surface` | color | Card / panel surface (slightly lighter) |
| `$color-bg-elevated` | color | Elevated surface (hover states, tooltips) |
| `$color-text-primary` | color | Primary body text (near-white) |
| `$color-text-secondary` | color | Muted / supporting text |
| `$color-text-disabled` | color | Disabled text |
| `$color-accent` | color | Brand / accent color (`#004068`) |
| `$color-border` | color | Subtle divider / border |
| `$border-radius-sm` | length | Small radius (e.g. 4px) |
| `$border-radius-md` | length | Medium radius (e.g. 8px) |
| `$border-radius-lg` | length | Large radius (e.g. 16px) |
| `$spacing-1` | length | Spacing scale step 1 (e.g. 4px) |
| `$spacing-2` | length | Spacing scale step 2 (e.g. 8px) |
| `$spacing-3` | length | Spacing scale step 3 (e.g. 12px) |
| `$spacing-4` | length | Spacing scale step 4 (e.g. 16px) |
| `$spacing-6` | length | Spacing scale step 6 (e.g. 24px) |
| `$spacing-8` | length | Spacing scale step 8 (e.g. 32px) |
| `$font-family-base` | string | Base font stack |
| `$font-size-sm` | length | Small text (e.g. 12px) |
| `$font-size-md` | length | Body text (e.g. 14px) |
| `$font-size-lg` | length | Heading text (e.g. 18px) |
| `$font-size-xl` | length | Large heading (e.g. 24px) |
| `$font-weight-regular` | number | Regular weight (400) |
| `$font-weight-medium` | number | Medium weight (500) |
| `$font-weight-bold` | number | Bold weight (700) |

**Note**: Exact pixel values are implementation defaults. All variables MUST be
defined as SCSS variables (compile-time), not CSS custom properties.
