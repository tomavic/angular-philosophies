# Testing

A unit test answers one question: **given these inputs and these collaborators, does this file do the right thing?** This
chapter is the way I write specs, and [templates/testing/](../templates/testing/) is the toolkit that makes it quick. All of it
runs on Jest 30 with `jest-preset-angular`, zoneless. With Vitest, replace `jest.fn` and `jest.spyOn` with `vi.fn` and
`vi.spyOn`; nothing else changes.

## The idea

- The file under test is **real**. Everything it `inject()`s is a **fake** you control.
- Every test starts from a **fresh world**: new fakes, a new component, nothing left over from the last test.
- A test asserts on what the file **does**: what it renders, what its public signals hold, what it asked its collaborators
  to do. Never on private fields.

And four things that are not used in specs:

| Don't | Because | Do instead |
| --- | --- | --- |
| `TestBed.configureTestingModule` in a spec | Boilerplate that hides what the test is about | `render`, `renderPage`, `injectService` |
| `{ provide: Service, useValue: {...} }` | Untyped, shared between tests, drifts from the real API | `fakeService(Service, () => ({...}))` |
| `HttpTestingController` | Verbose, and doesn't work with `httpResource` as naturally | `fakeHttp({ url: body })` |
| `as jest.Mock` casts | Hide wrong types | `fakeService` is typed, so `fake.method` is already a mock |

The only `useValue` allowed is for an injection token such as `DOCUMENT` or `PLATFORM_ID`.

## The toolkit

Copy [templates/testing/](../templates/testing/) to `src/app/core/test/`, map `@/core/test` in `tsconfig` and Jest
([jest.config.example.js](../templates/testing/jest.config.example.js) shows how), and import from that one place.

| Need | Use |
| --- | --- |
| Render a component | `render(Component, providers, options?)` |
| Render a routed page (adds translations) | `renderPage(Component, providers, options?)` |
| Get a service or a store | `injectService(Service, [Service, ...fakes])` |
| Run an `inject()` function (guard, resolver) | `runInContext(() => guard(route, state), fakes)` |
| Fake any service | `fakeService(Service, () => ({ method: jest.fn() }))` |
| Fake HTTP, including `httpResource` | `fakeHttp({ '/api/x': body, '/api/y': httpError(500) })` |
| Router and route | `fakeRouter()`, `fakeRoute({ params, queryParams, data })` |
| Storage | `fakeStorage(StorageService, { language: 'en' })` |
| Force a resource state | `setResource(resource, { value } / { status } / { error })` |
| Run pending effects | `flushEffects()` |
| Wait for async work and render | `await view.whenStable()` |

### What a fake gives you

```ts
const files = fakeService(FileDownloadService, () => ({ save: jest.fn() }));

files.fake.save; // the live fake the component received, typed, a jest.Mock here
expect(files.fake.save).toHaveBeenCalledWith('order-77.json', expect.any(String));
```

- `x.fake` is the instance the code under test is using **in this test**.
- The **factory form** `() => ({ ... })` builds a new fake per test, so no `jest.clearAllMocks()` is ever needed.
- Helpers with controls expose them on `x._`: `http._.reply(url, body)`, `http._.calls(url)`, `route._.setQueryParams({...})`.
- Types come from the real service. If the real member is a signal, the fake is a `signal(...)`; if it is an observable, use
  `of(...)` or a `Subject`. A wrong shape fails to compile, which is how stubs faking APIs that no longer exist get found.

### What a view gives you

| Read the DOM | Act like a user | Drive the component |
| --- | --- | --- |
| `view.$('css' or Component)`, `view.$All(...)` | `.click()`, `.input('x')`, `.type('x')` | `view.host`, the instance |
| `view.$testId('LOGIN_BTN')` | `.keydown('Enter')`, `.paste('x')` | `view.setInput('name', value)`, typed |
| `view.getByText('Cancel')` | `.focus()`, `.mouseEnter()` | `view.detectChanges()` |
| `.textContent`, `.attr()`, `.hasClass()` | | `view.inject(Service)` |

Typed `setInput` uses Angular's private `ɵINPUT_SIGNAL_BRAND_WRITE_TYPE`. That is the one private API in the toolkit; if a
future Angular renames it, one type in `testing-utils.ts` is the only line to change.

## The recipe

1. Read the file, and its template, and classify it.
2. List every injection.
3. Pick a fake for each one.
4. List the behaviours and branches, as test names, before writing code.
5. Decide the describes.
6. Write the spec.
7. Run with coverage and close the gaps.

### 1. Classify

| Kind | Build it with |
| --- | --- |
| Service, store, guard class | `injectService(Service, [Service, ...fakes])` |
| Component with no translations | `render(Component, fakes)` |
| Page or component using Transloco | `renderPage(Component, fakes)` |
| Directive or pipe | `render(TestHost, fakes)` with a tiny host component |
| Pure function | Call it directly. No Angular needed |

### 2. List every injection

Collect them from five places: `inject()` fields, constructor parameters, `inject*` helper functions (open them to see what
they inject), `httpResource` and `resource` calls (`httpResource` uses `HttpClient`), and the component's own `providers`
plus its child components, since rendering builds those too.

**An injection you don't use still has to be satisfied.** A component that injects a toaster but never calls it still makes
Angular build the real one, and the real one may need a library service you didn't expect. The first run fails with
`NG0201: No provider found`. Fake it with an empty object.

### 3. Pick a fake

Go top to bottom and stop at the first rule that fits:

| The injection is | Do this |
| --- | --- |
| `HttpClient`, including `httpResource` | `fakeHttp({ url: body })` |
| `Router` or `ActivatedRoute` | `fakeRouter()` or `fakeRoute({ params })` |
| Translations | Real, through `renderPage` |
| A root store that is plain state with no dependencies | Keep it **real** and seed it through its own methods |
| Anything else | `fakeService(X, () => ({ onlyWhatIsUsed: jest.fn() }))` |
| An injection token | `{ provide: TOKEN, useValue }` |

Two rules for `fakeService`: **fake only what the code uses** (`{ save: jest.fn() }` is enough when only `save()` is called),
and **match the real types** so the fake can't drift.

When a service is also declared in the component's own `providers`, a fake in the shared list is ignored, because the
component's provider wins. Use the `providers` option, which overrides everywhere:

```ts
view = await renderPage(Component, providers, { providers: [fakeService(Toaster, {})] });
```

### 4. List behaviours before writing code

Walk the file and note every place it can go two ways: `if`, `?:`, `&&`, `??`, `?.`, `@if`, `@for` with `@empty`, `@switch`,
`next` and `error` callbacks, every public method and every computed. Write one line per behaviour:

- renders the title and no error before the user does anything
- confirming with an empty, blank or HTML reason shows the error and sends nothing
- confirming with a valid reason sends the trimmed text and the id from the dialog
- while sending, it shows loading, disables Back and ignores a second click
- the API says yes: the dialog closes with `true`
- the API says no: the dialog stays open

Each line is one `it(...)`, named as a sentence. Variants of one check use `it.each`.

### 5. Decide the describes

This is the step people get wrong most often.

> **A top-level `describe` is one world: one set of providers, fixed when the component is created.**
> **A nested `describe` groups tests that share an extra `beforeEach` action inside that world.**

For each condition ask: *can I change it from inside a test, through a fake?*

| Same describe: a test can change it | New top-level describe: it can't |
| --- | --- |
| A fake's signal: `language.fake.language.set('ar')` | Something read once in a constructor or field initialiser |
| A fake's return value: `x.fake.get.mockReturnValue(...)` | The route snapshot: `fakeRoute({ params })` |
| A later HTTP answer: `http._.reply(url, body)` then reload | Dialog data |
| User input: `.input()`, `.click()`, `setInput()` | The first HTTP answer, when you assert the first render |
| | A component-level provider |

For the second column, add a top-level describe that swaps only that one fake through `options.providers`:

```ts
describe('OrderDetailsComponent when the API fails', () => {
  it('shows the error instead of the order', async () => {
    const view = await renderPage(OrderDetailsComponent, providers, {
      providers: [fakeHttp({ [ORDER_URL]: httpError(500) })],
    });
    await view.whenStable();
    ...
```

Trying to swap a fake inside a test fails with "Cannot configure the test module when the test module has already been
instantiated". That error means you need another describe.

### 6. Write the spec

Every spec has the same shape. [order-details.component.spec.ts](../templates/testing/examples/order-details.component.spec.ts)
is the complete version:

```ts
// 1. Fakes: one per injection, at module level, factory form.
const http = fakeHttp({ [ORDER_URL]: order });
const route = fakeRoute({ params: { orderId: '77' } });

// 2. The shared provider list.
const providers = [provideRouter([]), http, route, language, files];

// 3. One describe per world.
describe('OrderDetailsComponent', () => {
  let view: RenderResult<OrderDetailsComponent>;

  // 4. Build the world in beforeEach.
  beforeEach(async () => {
    view = await renderPage(OrderDetailsComponent, providers);
    await view.whenStable(); // let httpResource load and the template render
  });

  // 5. One behaviour per it, named as a sentence.
  it('loads the order named in the route', () => {
    expect(http._.calls(ORDER_URL)).toBe(1);
    expect(view.$testId('ORDER_TITLE').textContent).toBe('Order 77');
  });
});

// 6. Variant worlds swap one fake.
```

Habits that keep specs readable:

- **Arrange, act, assert**, with a blank line between.
- **Name helpers after what the user does**, so tests read like a story:
  `const confirmButton = () => view.getByText('Confirm')` and `const answer = (ok: boolean) => api.fake.cancel.mock.calls[0][1](ok)`.
- **Prefer the DOM and public signals** over private members. Use `component['x']` rather than `as any` only when there is no public way.
- **Make test data `satisfies` the real model**: `const order = { ... } satisfies Order;`, so a renamed field fails to compile.

### 7. Coverage

Run one spec with coverage for its source file, then read the uncovered lines. For each gap decide:

| The gap is | Do this |
| --- | --- |
| A real state you haven't tested | Add the test |
| Code that can never run (a `?.` after validation, an unused `computed`) | Simplify the code if behaviour stays the same, and list the edit in the pull request |
| Can't be simplified safely | `/* istanbul ignore next */` with a one-line reason |

## Cookbook

**HTTP.**

```ts
const http = fakeHttp({
  '/api/orders': { items: [] }, // a body; the longest matching key wins
  '/api/limits': httpError(500), // an error reply
});

http._.reply('/api/orders', { items: [a] }); // change the answer for later requests in this test
http._.calls('/api/orders'); // how many requests hit it
expect(http.fake.post).toHaveBeenCalledWith('/api/x', body);

const slow = fakeHttp({}, { pending: true }); // every request waits
slow._.flush('/api/orders', body); // answer it
slow._.fail('/api/orders', 403); // or fail it
```

An unknown URL fails with `fakeHttp: no route for GET /api/...`, so a missing route never passes silently.

**Resources.** Prefer the real thing: serve the data with `fakeHttp` and `await view.whenStable()`. To reload after changing
the answer: `http._.reply(...)`, `view.host.order.reload()`, `await view.whenStable()`. To force a state without HTTP, use
`setResource(view.host.list, { status: 'reloading' })` **before** the first `detectChanges` that reads the resource, because
a `computed` that already read it keeps its cached value.

**A callback passed to a service.** Capture it, then fire it when the test is ready, as the dialog spec does with `answer(true)`.

**Signals in fakes.** Put `signal(...)` in the factory and change it with `x.fake.sig.set(...)`, as `language` does in the page spec.

**Inputs and outputs.**

```ts
view = await render(Card, [], { inputs: { title: 'Hello' } }); // typed against the component
view.setInput('amount', '42'); // typed, accepts the input's transform type
const value = await firstOutputFrom(view.host.saved); // the next output emission
```

**Effects and timers.** `flushEffects()` runs pending effects. `jest.useFakeTimers()` with `advanceTimersByTimeAsync(ms)`
covers `setTimeout` and debounce. A store spec's version of `whenStable` is a small `settle()` that flushes effects, lets the
resource finish and flushes again, as in [order-list.store.spec.ts](../templates/testing/examples/order-list.store.spec.ts).

**A store.** `injectService(Store, [Store, http])`, call its methods, assert on its signals. See the same file.

## Pitfalls

| Symptom | Cause and fix |
| --- | --- |
| `NG0201: No provider found for X` | Something in the tree injects X. Fake it, even if your file never calls it |
| A fake in `providers` is ignored | The component declares that service in its own `providers`. Use `{ providers: [fake] }` in the options |
| "Cannot configure the test module ... already instantiated" | You swapped a fake inside a test. Make a new top-level describe |
| The DOM still shows the loading state | `httpResource` hasn't settled. `await view.whenStable()` |
| `setResource` has no effect | It ran after a `computed` cached the real value. Call it before the first `detectChanges` |
| A boolean input is always on | You passed `signal(false)` instead of `false`. Typed `setInput` catches it |
| Tests pass alone and fail together | A shared mutable object at module level. Use the factory form of `fakeService` |
| A debounced store never updates | Fake timers are on but effects weren't flushed. Call `flushEffects()`, then advance the timers |

## Review checklist

- Every `inject()` in the file and in its children is satisfied by a fake, or kept real on purpose.
- No `TestBed`, no `useValue` for services, no `as jest.Mock`, no `HttpTestingController`.
- Fakes are module-level and use the factory form. The provider list is shared.
- One top-level describe per world; variants swap one fake through `options.providers`.
- Test names are sentences about behaviour, and each `it` checks one behaviour.
- Every branch in the `.ts` and the template has a test, or a listed code simplification.
- The new spec is at full coverage for its file, and the whole suite is green.

## Rules

<!-- rules -->
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
<!-- /rules -->
