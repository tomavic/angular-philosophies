import { setupZonelessTestEnv } from 'jest-preset-angular/setup-env/zoneless';

// Unknown elements and properties fail the test instead of logging, so a typo in a template can't pass silently.
setupZonelessTestEnv({ errorOnUnknownElements: true, errorOnUnknownProperties: true });
