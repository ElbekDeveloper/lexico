# Contract: Application Routes

**Branch**: `001-auth-setup` | **Date**: 2026-04-29

## Route Table

| Path | Component | Load Strategy | Notes |
|------|-----------|---------------|-------|
| `/login` | `LoginComponent` | Lazy (`loadComponent`) | Placeholder; replaced by auth feature |
| `/chat` | `ChatComponent` | Lazy (`loadComponent`) | Placeholder; replaced by chat feature |
| `**` | — | Redirect | Redirects to `/login` |

## Redirect Behaviour

- Any unmatched path (including empty path `/`) is redirected to `/login`.
- Angular Router evaluates routes top-to-bottom; the wildcard `**` MUST be the last entry.

## Lazy Load Entry Points

```
src/app/features/auth/login.component.ts   → default export: LoginComponent
src/app/features/chat/chat.component.ts    → default export: ChatComponent
```

Both components are standalone (`standalone` is the Angular 21 default; do NOT set
`standalone: true` explicitly).
