# Configurar Sentry en Aplicación de Ionic

1. Crear una cuenta en Sentry
2. Crear un proyecto nuevo y seleccionar la opción de Angular
3. Instalar los siguientes paquetes npm en el proyecto

```sh
npm install @sentry/capacitor @sentry/angular-ivy  @sentry/tracing
```

Un problema que encontré al realizar la instalación de los comandos anteriores, es que al ejecutar el comando ionic-serve, aparece en la terminal el siguiente error:

```sh
[ng] Error: node_modules/@sentry/capacitor/node_modules/@sentry/types/types/globals.d.ts:2:11 - error TS2451: Cannot redeclare block-scoped variable '__DEBUG_BUILD__'.
[ng]
[ng] 2     const __DEBUG_BUILD__: boolean;
[ng]             ~~~~~~~~~~~~~~~
[ng]
[ng]   node_modules/@sentry/types/types/globals.d.ts:2:11
[ng]     2     const __DEBUG_BUILD__: boolean;
[ng]                 ~~~~~~~~~~~~~~~
[ng]     '__DEBUG_BUILD__' was also declared here.
[ng]
[ng]
[ng] Error: node_modules/@sentry/types/types/globals.d.ts:2:11 - error TS2451: Cannot redeclare block-scoped variable '__DEBUG_BUILD__'.
[ng]
[ng] 2     const __DEBUG_BUILD__: boolean;
[ng]             ~~~~~~~~~~~~~~~
[ng]
[ng]   node_modules/@sentry/capacitor/node_modules/@sentry/types/types/globals.d.ts:2:11
[ng]     2     const __DEBUG_BUILD__: boolean;
[ng]                 ~~~~~~~~~~~~~~~
[ng]     '__DEBUG_BUILD__' was also declared here.
```

Este es un problema asociado a la versión 16 de Angular, por lo que de momento la solución fue instalar las librerías mencionadas anteriormente, con las siguientes versiones:

```sh
npm i @sentry/angular-ivy@7.56.0 @sentry/capacitor@0.12.2 @sentry/tracing@7.56.0 --save-exact
```


1. En el dashboard de tu cuenta en Sentry, debes obtener tus llaves de acceso de tu proyecto creado.
   Para ello debes hacer la siguiente navegación

   ir a Settings -> Projects -> [PROJECT_NAME] -> Client Keys

2. Agregar configuración de Sentry en fichero main.ts

```typescript
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

import * as SentryAngular from '@sentry/angular-ivy';
import { environment } from './environments/environment';
import packageInfo from '../package.json';

if (environment.production) {
  enableProdMode();
}

SentryAngular.init({
  dsn: environment.sentryUrl,
  release: `[RELEASE_NAME]-${packageInfo.version}`,

  integrations: [
    new SentryAngular.BrowserTracing({
      // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
      tracePropagationTargets: ['localhost', /^https:\/\/yourserver\.io\/api/],
      routingInstrumentation: SentryAngular.routingInstrumentation,
    }),
    new SentryAngular.Replay(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.log(err));

```

6. En el fichero app.module, se debe realizar lo siguiente

```typescript
import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy, Router } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import * as SentryAngular from '@sentry/angular-ivy';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: ErrorHandler,
      useValue: SentryAngular.createErrorHandler({
        showDialog: false,
      }),
    },
    {
      provide: SentryAngular.TraceService,
      deps: [Router],
    },
    {
      provide: APP_INITIALIZER,
      useFactory: () => () => {},
      deps: [SentryAngular.TraceService],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

```

7. Generar "Source Maps" con angular para Sentry. Para ello debes abrir el fichero angular.json
   
```json
"build": {
    "configurations": {
        "production": {
            "sourceMap": {
            "hidden": true,
            "scripts": true,
            "styles": true
            }
        }
    }
}
```
   
8. Ahora también necesitamos el Sentry CLI para subir fácilmente esos archivos, así que primero instálalo (ya sea global o como una dependencia de tu paquete, lo que prefieras) y luego inicia sesión:

```sh
# Install the sentry CLI for sourcemaps
npm i -g @sentry/cli
 
# Login to get an auth token
sentry-cli login
```

Cuando ejecute el comando "sentry-cli" login, deberás permitir abrir el navegador para que vayas a crear un "Auth Token" que te permitirá hacer login. Luego de obtener el token, debes copiarlo en la terminal.

9. El siguiente paso es crear una compilación de producción de su aplicación y, a continuación, cargar los mapas de origen generados en Sentry con el siguiente comando:

```sh
ionic buid --prod
sentry-cli releases --org ticmash --project ionic-sentry-angular files sentry-angular-app-0.0.1 upload-sourcemaps ./www
```

La plantilla básica para ese comando tiene este aspecto, así que simplemente completa tu información:


```sh
sentry-cli releases --org <YOUR-SENTRY-ORG> --project <YOUR-SENTRY-PROJECT> files <RELEASE_NAME> upload-sourcemaps ./www
```


Además de la organización y el nombre de tu proyecto, la parte importante aquí es el RELEASE_NAME

Este valor tiene que ser el mismo que en el archivo main.ts donde definimos la versión:

```sh
release: `sentry-angular-app-${packageInfo.version}`
```

9. Finalmente hay que añadir las plataformas android e ios en el proyecto


# Enlaces de Interes
https://docs.sentry.io/platforms/javascript/guides/capacitor/

