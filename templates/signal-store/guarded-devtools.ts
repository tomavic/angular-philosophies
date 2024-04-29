import { isDevMode } from '@angular/core';
import { DevtoolsFeature, withDevToolsStub, withDevtools } from '@ngrx-toolkit/core';

/** withDevtools connects to the browser extension unconditionally. Every store goes through this wrapper instead. */
export function guardedDevtools(name: string, ...features: DevtoolsFeature[]) {
  return isDevMode() ? withDevtools(name, ...features) : withDevToolsStub(name, ...features);
}
