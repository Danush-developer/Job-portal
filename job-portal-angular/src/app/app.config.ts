import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { jwtInterceptor } from './interceptors/jwt.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(), 
    provideRouter(routes, withHashLocation(), withInMemoryScrolling({ 
      anchorScrolling: 'enabled', 
      scrollPositionRestoration: 'enabled' 
    })),
    provideHttpClient(withInterceptors([jwtInterceptor, errorInterceptor]))
  ]
};
