import { Component } from '@angular/core';

import * as Sentry from '@sentry/capacitor';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  constructor() {}

  failFunction() {
    const foo: any = null;
    const bar = foo.test;
  }

  throwJsError() {
    throw new Error('I am a manual error...!!!');
  }

  throwJsErrorTwo() {
    throw new Error('Hostia puta...!!!');
  }

  captureSentryError() {
    Sentry.captureException('Directly captured the error with Sentry');
  }

  errorWithScope() {
    Sentry.configureScope((scope) => {
      scope.setUser({
        id: '42',
        username: 'Big Simon',
        email: 'saimon@devdactic.com',
      });

      scope.setTag('language', 'DE');
    });
    this.failFunction();
  }
}
