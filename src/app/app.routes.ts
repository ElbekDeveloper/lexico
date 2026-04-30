import { Routes } from '@angular/router';
import { authGuard } from './features/auth/guards/auth.guard';
import { authRedirectGuard } from './features/auth/guards/auth-redirect.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
    canActivate: [authRedirectGuard],
  },
  {
    path: 'chat',
    loadComponent: () =>
      import('./features/chat/chat.component').then((m) => m.ChatComponent),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: 'login' },
];
