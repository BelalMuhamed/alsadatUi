import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { registerLocaleData } from '@angular/common';
import localeAr from '@angular/common/locales/ar';

// تسجيل اللغة العربية
registerLocaleData(localeAr);
export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(withFetch()),provideRouter(routes), provideClientHydration(), provideAnimationsAsync(),// 🔥 أهم سطر لتفعيل العربية
    { provide: LOCALE_ID, useValue: 'ar-EG' }]
};
