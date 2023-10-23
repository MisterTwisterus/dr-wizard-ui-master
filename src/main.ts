import {enableProdMode, importProvidersFrom, isDevMode} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {provideRouter, RouteReuseStrategy} from '@angular/router';
import {IonicModule, IonicRouteStrategy} from '@ionic/angular';

import {routes} from './app/app.routes';
import {AppComponent} from './app/app.component';
import {environment} from './environments/environment';
import {provideServiceWorker} from '@angular/service-worker';
import {HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi} from "@angular/common/http";
import {TokenInterceptor} from "./app/core/interceptor/TokenInterceptor";
import {IonicStorageModule} from "@ionic/storage-angular";
import {Drivers} from "@ionic/storage";


if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    {
      provide: RouteReuseStrategy, useClass: IonicRouteStrategy
    },
    importProvidersFrom(
      IonicModule.forRoot({}),
    ),
    importProvidersFrom(IonicStorageModule.forRoot({
      name: 'dr-wizard-ui',
      driverOrder: [Drivers.IndexedDB]
    })),
    provideRouter(routes),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
    provideHttpClient(
      withInterceptorsFromDi(),
    ),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
  ],
});
