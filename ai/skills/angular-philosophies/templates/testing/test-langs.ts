/**
 * The translations every `renderPage` test uses. In a real app import your own files:
 *   import ar from '../../../../public/i18n/ar.json';
 *   import en from '../../../../public/i18n/en.json';
 *   export const TEST_LANGS = { en, ar };
 * so a test renders the same text users see, and a renamed key fails the test.
 */
export const TEST_LANGS = {
  en: {
    orders: {
      title: 'Order {{ id }}',
      loading: 'Loading order',
      error: 'The order could not be loaded',
      download: 'Download',
      cancel: { title: 'Cancel order', reasonRequired: 'A reason is required', confirm: 'Confirm', back: 'Back' },
    },
  },
  ar: {},
};
