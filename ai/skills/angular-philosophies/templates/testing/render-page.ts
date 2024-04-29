import { importProvidersFrom, Type } from '@angular/core';
import { TranslocoTestingModule, TranslocoTestingOptions } from '@jsverse/transloco';
import { TEST_LANGS } from './test-langs';
import { render } from './testing-utils';

/**
 * Real Transloco with in-memory translations, so templates render real text and a missing key is logged.
 * The translations come from `test-langs.ts`; replace them with your real files there.
 */
export function provideTestTransloco(options: TranslocoTestingOptions = {}) {
  return importProvidersFrom(
    TranslocoTestingModule.forRoot({
      langs: TEST_LANGS,
      translocoConfig: {
        availableLangs: ['en', 'ar'],
        defaultLang: 'en',
        missingHandler: { allowEmpty: true, logMissingKey: true, useFallbackTranslation: false },
      },
      preloadLangs: true,
      ...options,
    }),
  );
}

/** `render` plus the providers almost every routed page needs. Add your own (animations, config) here once. */
export function renderPage<T>(
  component: Type<T>,
  providers: Parameters<typeof render<T>>[1] = [],
  options?: Parameters<typeof render<T>>[2],
) {
  return render(component, [provideTestTransloco(), ...providers], options);
}
