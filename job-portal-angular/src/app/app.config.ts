import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { jwtInterceptor } from './interceptors/jwt.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(), 
    provideRouter(routes, withInMemoryScrolling({ 
      anchorScrolling: 'enabled', 
      scrollPositionRestoration: 'enabled' 
    })),
    provideHttpClient(withInterceptors([jwtInterceptor, errorInterceptor])),
     provideAnimations(),
    provideToastr()
  ]
};
