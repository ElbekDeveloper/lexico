# Developer Quickstart: Authentication & Project Foundation Setup

**Branch**: `001-auth-setup` | **Date**: 2026-04-29

---

## Prerequisites

- Node.js 22+ and npm 11+
- Angular CLI 21: `npm install -g @angular/cli@21`

---

## Running the App

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:4200)
npm start

# Navigate to:
# http://localhost:4200/login   → placeholder login view
# http://localhost:4200/chat    → placeholder chat view (lazy-loaded)
# http://localhost:4200/unknown → redirects to /login
```

---

## Running Tests

```bash
npm test
```

Tests use Vitest via `@angular/build:unit-test`. Test files are co-located with
source files as `*.spec.ts`.

---

## Building for Production

```bash
npm run build
```

The build will fail if `environment.prod.ts` still contains `'__API_URL__'`
as the `apiUrl` and you expect real API calls — replace it via:

```bash
# CI/CD substitution example
sed -i "s|__API_URL__|https://api.yourhost.com/api|g" \
  dist/lexico/browser/main.js
```

Or set the value directly in `environment.prod.ts` for local production testing.

---

## Using Design Tokens in Component SCSS

`tokens.scss` is configured in `stylePreprocessorOptions.includePaths`.
In any component stylesheet:

```scss
@use 'tokens';

.my-component {
  background: tokens.$color-bg-surface;
  color: tokens.$color-text-primary;
  padding: tokens.$spacing-4;
  border-radius: tokens.$border-radius-md;
}
```

No path prefix or relative import needed.

---

## Adding a New Feature Route

1. Create `src/app/features/<feature-name>/<name>.component.ts`
2. Add a lazy-loaded entry to `src/app/app.routes.ts`:
   ```typescript
   {
     path: '<route-path>',
     loadComponent: () =>
       import('./features/<feature-name>/<name>.component').then(m => m.NameComponent),
   }
   ```

---

## HTTP API Calls

All `HttpClient` requests whose URL begins with `environment.apiUrl`
(`http://localhost:3000/api` in development) automatically include
`withCredentials: true` for HttpOnly cookie forwarding. No per-call configuration
is needed.

XSRF tokens are automatically read from the `XSRF-TOKEN` cookie and forwarded as
the `X-XSRF-TOKEN` request header on state-changing requests.

---

## Manual Verification: SC-002 & SC-004

### SC-002 — Route resolution < 3 s on localhost

Run `npm start`, open Chrome DevTools → **Network** tab, navigate to `/login` then
`/chat`. Confirm the **Load** timer in the waterfall is under 3 s for each route.
Lazy chunks (`login-component`, `chat-component`) should appear as separate requests.

### SC-004 — HTTP credentials auto-attached (< 1 min)

1. Add a temporary button to any component that calls
   `inject(HttpClient).get('http://localhost:3000/api/test').subscribe()`.
2. Open DevTools → **Network** tab, trigger the request.
3. Confirm the request shows `credentials: include` in the **Request Headers**.
4. Remove the temporary button after verification.
