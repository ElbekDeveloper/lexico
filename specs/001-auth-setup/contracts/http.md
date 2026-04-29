# Contract: HTTP Interceptor Behaviour

**Branch**: `001-auth-setup` | **Date**: 2026-04-29

## Interceptor: `authInterceptor`

**File**: `src/app/shared/interceptors/auth.interceptor.ts`  
**Type**: `HttpInterceptorFn`  
**Registration**: `provideHttpClient(withInterceptors([authInterceptor]), ...)`

## Behaviour Rules

| Condition | Action |
|-----------|--------|
| `req.url.startsWith(environment.apiUrl)` is `true` | Clone request with `{ withCredentials: true }` and forward |
| `req.url.startsWith(environment.apiUrl)` is `false` | Forward original request unmodified |

## XSRF Protection

Registered via `withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' })`.

- Angular reads the `XSRF-TOKEN` cookie automatically.
- Forwards it as `X-XSRF-TOKEN` header on all state-changing requests (POST, PUT, PATCH, DELETE).
- Applied globally to all `HttpClient` requests (not scoped to `apiUrl`).

## Environment Values

| Environment | `apiUrl` value |
|-------------|----------------|
| Development | `http://localhost:3000/api` |
| Production  | `__API_URL__` (CI/CD substitution token) |

## Guarantees

- The interceptor MUST NOT throw. HTTP errors propagate normally to the caller.
- The interceptor MUST NOT modify request URLs, headers, or body beyond adding `withCredentials`.
- Zero per-call configuration is required by consumers.
