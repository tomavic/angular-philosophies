# Forms, routing, translations and right-to-left

The parts of an app that every screen touches: how a form validates, how a route loads, how text is translated, and how the
layout flips for Arabic.

## Forms

**Reactive Forms are the default.** Validators and input directives (digits only, trimmed text, IBAN-shaped, and so on)
live in a shared `validators` and `directives` library and are written against Reactive Forms, so every form gets them for
free.

- A form control is typed: `new FormControl('', { nonNullable: true })`, never an untyped `FormControl(null)`.
- Validators are functions in the shared library, named for what they check. Error messages are translation keys keyed by the
  validator's error name, so the template maps `errors` to `t('errors.' + key)` once, in a shared error component.
- A form with unsaved changes extends a small `FormDeactivate` base and is protected by a `canDeactivate` guard, so leaving
  the page asks first.
- Sanitise on the way in, not only on the server: trim text and reject markup that has no business in the field. See the
  reason check in [cancel-order-dialog.component.ts](../templates/testing/examples/cancel-order-dialog.component.ts).
- A submit button is disabled while the request is pending and a second click is ignored in code as well, because disabled
  is a visual state and not a guarantee.

Angular 22 ships Signal Forms as public API, with parts still marked experimental. They are the likely future of forms. This
guide stays on Reactive Forms for now because the shared validators and directives are built on them, and mixing two form
systems in one app costs more than either saves. A small new form in a codebase with no such investment may reasonably try
Signal Forms.

## Routing

- **Lazy by default.** Every feature is a `loadComponent` or `loadChildren`. Only the shell is in the main bundle.
- **One routes file per feature**, named `<feature>.routes.ts`, exporting a `Routes` array. The app's route table only points
  at features, it doesn't list their children.
- **Bind route data to inputs** with `withComponentInputBinding()`, so a page declares `orderId = input<string>()` instead of
  injecting `ActivatedRoute`.
- **Page titles are translation keys** in the route's `title`, resolved by a title strategy that translates them.
- **Guards are functional and built by factories**: `createRoleGuard('manager')`, `createPermissionGuard(Permission.Refunds)`.
  A factory keeps the rule in the route table where reviewers read it.
- **Unauthenticated and authenticated pages sit under different shells**, each with its own layout.

```ts
export const routes: Routes = [
  {
    path: 'orders',
    title: 'titles.orders',
    canActivate: [authGuard, createRoleGuard('manager')],
    loadChildren: () => import('@shop/orders/feature/orders').then(m => m.ORDERS_ROUTES),
  },
];
```

Provide `withComponentInputBinding()` and a preloading strategy in `app.config.ts`. `PreloadAllModules` is a fine start for
an app of this size; switch to a custom strategy when the bundle list grows.

## Translations

The app uses Transloco with one file per language, `public/i18n/en.json` and `public/i18n/ar.json`.

- **Every key exists in every language file.** A missing Arabic key is a bug caught in review, and the test setup logs it
  (see `provideTestTransloco` in [09-testing.md](09-testing.md)).
- Keys are camelCase and nested by feature: `orders.cancel.reasonRequired`.
- A template uses the structural directive once at the top, with a prefix: `*transloco="let t; prefix: 'orders.cancel'"`.
- Stores, interceptors and services carry **keys**, never translated strings. The template translates.
- A read that depends on language (an `Accept-Language` header) reads the language signal inside its request, so a language
  change refetches. See [OrderDetailsComponent](../templates/testing/examples/order-details.component.ts).
- Format dates and numbers through one helper that takes the language as a parameter, so Arabic digits and calendars are
  decided in one place, and the helper stays a pure function.

## Right-to-left

Arabic is not a translation file, it is a layout. The language store exposes a `dir` computed, and the root element binds it:

```ts
// layout.store.ts
withComputed(({ language }) => ({
  isRtl: computed(() => language() === 'ar'),
  dir: computed(() => (language() === 'ar' ? 'rtl' : 'ltr')),
})),
```

Then write styles so they need no per-language code:

- **Use logical properties**, never left and right. With utility classes that is `ms-4` and `pe-2` instead of `ml-4` and
  `pr-2`, `text-start` instead of `text-left`, `start-0` instead of `left-0`.
- **Mirror directional icons**: arrows, chevrons, "back" and "next". Icons that carry no direction (a magnifier, a bin) stay.
- **Don't mirror** numerals, logos, charts' time axes, phone numbers or code.
- **Use a font with Arabic glyphs** as the primary font, not as a fallback, so the two scripts have matching weight and height.
- **Test it.** Switch the language in a spec (`layout.fake.language.set('ar')`) and assert on what changes, and look at every
  new screen in Arabic once before merging.

## Rules

<!-- rules -->
- Use Reactive Forms as the default; build validators and input directives in a shared library and reuse them.
- Type every form control; use `nonNullable` controls.
- Make validator error messages translation keys keyed by the error name.
- Protect forms with unsaved changes with a `canDeactivate` guard.
- Trim and reject unwanted markup in form input in code, and ignore a second submit while a request is pending.
- Lazy-load every feature with `loadComponent` or `loadChildren`; keep one `<feature>.routes.ts` per feature.
- Use `withComponentInputBinding()` and read route values through `input()`, not `ActivatedRoute`.
- Put translation keys in route `title`; build guards with factory functions such as `createRoleGuard`.
- Provide an entry for every key in every language file; keep keys camelCase and nested by feature.
- Carry translation keys in stores, interceptors and services; translate only in templates.
- Read the language signal inside a request that depends on language so it refetches on change.
- Expose a `dir` computed from the language store and bind it on the root element.
- Use logical properties (`ms-*`, `pe-*`, `text-start`, `start-*`), never physical left and right.
- Mirror directional icons in right-to-left; do not mirror numerals, logos or code.
<!-- /rules -->
