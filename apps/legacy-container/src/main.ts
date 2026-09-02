import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { renderStartupFailure } from './app/startup-failure';

bootstrapApplication(App, appConfig).catch((err) => renderStartupFailure(err));
