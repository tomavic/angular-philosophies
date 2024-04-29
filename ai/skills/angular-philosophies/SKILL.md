---
name: angular-philosophies
description: An opinionated style guide for writing Angular 22 apps. Use it whenever you write, change, review or test Angular code: components and templates, NgRx SignalStore stores and custom store features, @ngrx-toolkit/core (withResource, withMutations, withStorageSync, devtools), httpResource and HTTP interceptors, Nx workspace structure and module boundaries by domain, forms, lazy routes, Transloco and Arabic right-to-left layouts, accessibility and contrast, Jest specs with fakes, and ESLint, Prettier and commit conventions. Also use it when asked how a feature or library should be organised in an Angular monorepo.
---

# Angular Philosophies

Follow these rules when you work on Angular code. Where the project you are in has its own rules (an `AGENTS.md`, a `CLAUDE.md`), those win over this skill.

## How to use this skill

1. Find the task below and read that chapter from `references/` before writing code. The rules further down are a summary, and the chapter has the reasons and the exceptions.
2. Copy the closest file from `templates/` instead of writing a pattern from scratch.
3. Check the work against the rules for the chapters you touched.

| Task | Read | Copy from |
| --- | --- | --- |
| Deciding where code goes, adding a library | `references/01-architecture.md` | `templates/config/eslint.boundaries.js` |
| Writing or changing a component or template | `references/02-components.md` | `templates/signal-store/order-list.component.ts` |
| Writing or changing a store | `references/03-signal-store.md` | `templates/signal-store/order-list.store.ts` |
| Reading or writing server data, interceptors, errors | `references/04-data-access.md` | `templates/signal-store/order-list.store.ts`, `api-status.ts` |
| Choosing a toolkit extension, devtools, storage sync | `references/05-toolkit.md` | `templates/signal-store/guarded-devtools.ts`, `layout.store.ts` |
| Writing a custom store feature, or stores that must coordinate | `references/06-custom-features.md` | `templates/signal-store/with-*.ts`, `cart.store.ts` |
| Forms, routes, translations, right-to-left | `references/07-forms-routing-i18n.md` |  |
| Anything visual or interactive | `references/08-accessibility.md` | `templates/a11y/contrast.ts` |
| Writing a spec | `references/09-testing.md` | `templates/testing/` (toolkit and `examples/`) |
| Lint, format, commits, scripts | `references/10-tooling.md` | `templates/config/` |

## Stack

Angular 22 (standalone, zoneless, signals), TypeScript 6.0 strict, `@ngrx/signals` 22, `@ngrx-toolkit/core` 22, Nx, pnpm, Jest 30. Do not introduce a version Angular does not list as supported.

## Philosophy

- Build only what the current task needs; do not add flags, options or abstractions for hypothetical cases.
- Prefer the Angular platform (`httpResource`, signal APIs, router, forms) over a new dependency.
- Write a shared abstraction the third time the same code appears, not the first.
- When touching a file, fix nearby smells or leave a `TODO` with a reason; never rewrite inside a feature branch.
- Express every rule a machine can check as a lint rule or a type, not as documentation.
- Treat accessibility and right-to-left support as part of "done", not as follow-up work.

## Architecture

- Give every library exactly one `scope:*` tag and one `type:*` tag in its `project.json`.
- Enforce module boundaries with `@nx/enforce-module-boundaries`; dependencies flow only downward through util, data-access, core, ui, feature, shell.
- Never let a domain import another domain, and never let `scope:shared` import a domain.
- Keep code inside the app feature until a second consumer exists; then promote it to a library.
- Split a library with secondary entry points, not with extra libraries.
- Export by name from each `index.ts`; do not `export *` runtime code.
- Import through path aliases (`@shop/...`, `@/...`); never use `../../` across feature or library boundaries.
- Make `type:util` code free of Angular injection; pass language and configuration as parameters.
- Forbid sibling entry points from importing each other with `no-restricted-imports` in the library's own ESLint config.
- Duplicate small code instead of adding an `if (guest)`-style mode flag to a shared function.
- Name files `<name>.component.ts`, `<name>.store.ts`, `<name>.service.ts`, `<name>.model.ts`, `<feature>.routes.ts`, and keep each spec beside its source.

## Components

- Write components as standalone without `standalone: true`, and without `changeDetection` (OnPush is the Angular 22 default).
- Inject dependencies with `inject()` in field initialisers; do not use constructors for injection.
- Use the `host: {}` object; never `@HostBinding` or `@HostListener`.
- Use `input()`, `model()`, `output()`, `viewChild()`; do not use the decorator forms in new code.
- Run zoneless with `provideZonelessChangeDetection()`; every value a template reads must be a signal.
- Use `computed` or `linkedSignal` to derive state; use `effect()` only for side effects outside Angular.
- Use `@if`, `@for` (always with `track`), `@switch`, `@empty`, `@defer`; never `*ngIf`, `*ngFor`, `ngClass` or `ngStyle`.
- Keep templates free of logic beyond a condition; move the rest into a `computed`.
- Keep presentational components free of stores and `HttpClient`; they take inputs and emit outputs.
- Put pages in `type:feature` libraries and presentational components in `type:ui` libraries.
- Add `data-testid` to interactive elements and to elements that tests assert on.
- Use named exports and `loadComponent` with a `.then(m => m.XComponent)` for routed components.
- Use utility classes and design tokens for styling; no hex colours and no per-component stylesheets.
- Keep `@Injectable({ providedIn: 'root' })` for stateless services; put shared state in a signal store.

## The signal store

- Make a `signalStore` the facade, API layer and state layer for its slice; components never inject `HttpClient` or a data service.
- Never call `.subscribe()` in a component; use signals, resources or `rxMethod`.
- Never add a `load()` method that a component must call after a filter changes; derive reads from state with resources.
- Use one store per view (list, detail, form), provided by the component with `providers: [XStore]`.
- Provide a feature store for shared reference data with `{ providedIn: 'root' }`; put cross-feature state in a library store.
- Never let a feature import another feature's store.
- Type state with an interface, name the starting value `initialState`, and expose `reset()` when the store outlives its page.
- Change state only with `patchState`; never mutate arrays or objects in place.
- Put derived values in `withComputed`; inject dependencies with `inject()` inside `withProps`, `withMethods` or `withHooks`.
- Prefix private store members with `_` and expose a deliberate method when callers need them.
- Reset `page` to 1 in every filter setter.
- Never type a store as `any`.
- Use `rxMethod` only when operators are needed; choose `switchMap`, `exhaustMap` or `concatMap` deliberately.
- Persist state with `withStorageSync`, never with hand-written `localStorage` calls.
- Give every store a spec.

## Data access

- Read server data with resources derived from state (`httpResource` via `withResource`); never with a `load()` method.
- Give every resource a `defaultValue` and `{ errorHandling: 'previous value' }`; never write `?.` or `??` on a resource value in a component.
- Design pages for both failure cases: a failed reload keeps the last value, a failed changed request falls back to the `defaultValue`.
- Keep a resource in its component only while one component uses it; move it into a store when a second needs it.
- Fold several resource statuses into one with `apiStatus` so a page has one loading state and one error state.
- Write with `withMutations` and `httpMutation`; never use `httpResource` for POST, PATCH, PUT or DELETE.
- Reload the affected reads in a mutation's `onSuccess`.
- Check the API's real verbs before choosing PUT or PATCH.
- Never call an endpoint for a compile-time constant; keep it as a `const` in the model file.
- Search the whole repository for other callers before deleting a frontend call or a backend route.
- Implement cross-cutting HTTP behaviour as functional interceptors registered by one provider function.
- Never let an interceptor match feature URLs; use an `HttpContext` token for exceptions.
- Type backend errors once and show failures through translation keys.

## The toolkit

- Install `@ngrx-toolkit/core` for Angular 22 (`@angular-architects/ngrx-toolkit` for 21 and earlier), with the same major as Angular.
- Use `withResource`, `withMutations`/`httpMutation`, `guardedDevtools`, `withMapper` and `withStorageSync` as the standard extensions.
- Add `withImmutableState`, `withReset`, `withConditional`, `withUndoRedo` or `withCallState` only when a real need appears, and update the inventory in the same change.
- Do not use `withDataService`, `withEntityResources`, `withPagination`, `withRedux`, `createEffects` or `withFeatureFactory`.
- Use `withFeature` from `@ngrx/signals` instead of `withFeatureFactory`, and `patchState` from `@ngrx/signals` instead of the toolkit's.
- Never call `withDevtools` directly; call `guardedDevtools(name, ...)` from one shared file.
- Add `withMapper` to redact secret-shaped keys when a store's tracked state holds a full entity row.
- Persist state with `withStorageSync` and a `select` that lists only what should survive a reload; place it right after `withState`.

## Custom store features

- Write a custom `signalStoreFeature` only after the same block has been copied between stores three times.
- Use one `status` field (`idle | loading | success | error`) instead of separate `loading`, `error` and `loaded` flags in `rxMethod` stores.
- Do not use `withRequestStatus` with resources or mutations; they already track their own status.
- Declare what a feature needs from the store with `type<>()` as its first argument so the compiler checks order.
- Connect a reusable feature to a store's own signals with `withFeature`, not `withFeatureFactory`.
- Use `withLinkedState` or `linkedSignal` for state that follows other state instead of an `effect` that sets signals.
- Use `signalMethod` for reactions that need no operators, and `rxMethod` when they do.
- Never inject one store into another; coordinate stores with `@ngrx/signals/events` event groups.

## Forms, routing, translations and right-to-left

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

## Accessibility

- Measure contrast with a function or tool; require 7:1 for small text, 4.5:1 for other text, and 3:1 for large text, icons, borders and focus rings.
- Use brand colours only for fills, borders and large text; give small text a neutral token with a measured ratio.
- Check light and dark themes separately.
- Never let colour alone carry meaning; pair it with text, an icon or a pattern.
- Mark invalid controls with `aria-invalid` and show the error as text.
- Use native `<button>` and `<a>` for interactive elements; never a clickable `<div>`.
- Keep focus visible with at least 3:1 contrast; never remove the outline without replacing it.
- Move focus into a dialog on open, trap it while open, and return it on close; move focus to the heading after a route change.
- Give every control an accessible name; prefer native elements over ARIA.
- Announce dynamic errors and status changes with `role="alert"` or `aria-live`.
- Keep body text at 16px or more, touch targets at 44px or more, and honour `prefers-reduced-motion`.
- Enable the Angular ESLint template accessibility rules and do not switch them off to ship.

## Testing

- Test the real file with fakes for everything it injects; start every test from a fresh world.
- Assert on behaviour (DOM, public signals, calls on fakes), never on private fields.
- Never use `TestBed.configureTestingModule` directly, `{ provide, useValue }` for services, `HttpTestingController` or `as jest.Mock` in specs.
- Import every test utility from `@/core/test`.
- Fake services with `fakeService(X, () => ({ ... }))` in the factory form, at module level, one per `inject()`.
- Fake only what the code uses, and match the real types so the fake cannot drift.
- Fake HTTP, including `httpResource`, with `fakeHttp`; let unknown URLs fail loudly.
- Satisfy every injection in the tree, including ones the code never calls.
- Keep a root store real when it is plain state with no dependencies, and seed it through its own methods.
- Write one top-level `describe` per world; use a new top-level describe with `options.providers` for anything a test cannot change through a fake.
- Name tests as sentences, check one behaviour per `it`, and use `it.each` for variants of one check.
- List the behaviours and branches before writing the spec.
- Make test data `satisfies` the real model.
- Give every store, service, guard and component a spec beside it.
- Wait with `await view.whenStable()`; for stores flush effects and then settle the resource.

## Tooling

- Use pnpm only, and run Nx through it (`pnpm nx ...`); use Nx generators and targets instead of `ng generate` and `ng build` in an Nx workspace.
- Use `pnpm nx affected -t lint,test` for CI and pre-push checks.
- Keep Angular and TypeScript at versions listed together on angular.dev/reference/versions; never move TypeScript ahead of Angular.
- Enable `strict`, `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `noImplicitReturns` and `strictTemplates`; never disable a strict flag to pass a build.
- Use an ESLint flat config with `@nx/enforce-module-boundaries`, `angular-eslint`, and the template accessibility rules.
- Do not use `any`; if unavoidable, add an eslint-disable comment with the reason beside it.
- Format with Prettier: 120 columns, single quotes, `trailingComma: all`, `arrowParens: avoid`, one attribute per line, imports sorted `@angular`, `rxjs`, third-party, relative.
- Never raise formatting in review; let the pre-commit hook format.
- Write Conventional Commits with an emoji and the project name as scope; enforce with commitlint.
- Run lint-staged on pre-commit, commitlint on commit-msg, and build and test on pre-push.
- Hold a global coverage threshold of 80% and give every new spec full coverage of its own file.
- Commit an `AGENTS.md` at the root and in areas with their own rules; keep the root file short.
