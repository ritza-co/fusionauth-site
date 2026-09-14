import { ApplicationConfig, provideBrowserGlobalErrorListeners, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { FusionAuthModule } from '@fusionauth/angular-sdk';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    importProvidersFrom(FusionAuthModule.forRoot({
      clientId: 'e9fdb985-9173-4e01-9d73-ac2d60d1dc8e',
      serverUrl: 'http://localhost:9011',
      redirectUri: 'http://localhost:4200',
      postLogoutRedirectUri: 'http://localhost:4200/logged-out',
      scope: 'openid email profile offline_access',
      shouldAutoRefresh: true,
    }))
  ]
};