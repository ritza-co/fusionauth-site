import { Routes } from '@angular/router';
import { authGuard } from './auth-guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./home-page/home-page').then((m) => m.HomePage),
    canActivate: [authGuard(false, '/account')],
  },
  {
    path: 'logged-out',
    loadComponent: () =>
      import('./home-page/home-page').then((m) => m.HomePage),
    canActivate: [authGuard(false, '/account')],
  },
  {
    path: 'account',
    loadComponent: () =>
      import('./account-page/account-page').then((m) => m.AccountPage),
    canActivate: [authGuard(true, '/')],
  },
  {
    path: 'make-change',
    loadComponent: () =>
      import('./make-change-page/make-change-page').then((m) => m.MakeChangePage),
    canActivate: [authGuard(true, '/')],
  },
  {
    path: '**',
    redirectTo: '',
  }
];