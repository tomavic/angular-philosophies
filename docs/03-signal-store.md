# The signal store

NgRx SignalStore is the centre of this guide. It gives a page one object with its state, its derived values, its API calls
and its actions, built from small features that compose. Everything here targets `@ngrx/signals` 22.

## The rule

**A `signalStore` is the facade, the API layer and the state layer for its slice.** It is not a plain service next to a
store next to some `.subscribe()` wiring. From that follow three consequences:

- Components inject a store and read signals. They never inject `HttpClient` or a data service.
- Components never `.subscribe()`. Anything reactive is a signal, a resource or an `rxMethod`.
- Components never call a `load()` method after a filter changes. Reads are resources derived from state, so changing the
  filter signal changes the request. See [04-data-access.md](04-data-access.md).

## One store per view

When a feature has a list, a detail page and a form, each page gets its own store:

```
orders/
  order.model.ts          types and static option lists. No store, no injection
  order.store.ts          feature store: reference data every view needs, providedIn: 'root'
  order-list/
    order-list.store.ts   view store, provided by the component
    order-list.component.ts
    order-list.component.html
  order-form/
    order-form.store.ts   view store, provided by the component
    ...
```

Do not merge list state and form state because they belong to the same feature. Each view owns its filters, paging, dialog
state and its own reads and writes.

| Store | Provided | Why |
| --- | --- | --- |
| Feature store (reference data, lookups) | `{ providedIn: 'root' }` | Stable for the session and shared by every view, so it is fetched once |
| View store (list, detail, form) | `providers: [OrderListStore]` on the component | Filters, paging and dialog state must reset when the user leaves, not leak into the next visit |
| Cross-feature state (auth, layout) | a library store, `providedIn: 'root'` | Owned by a library, never by one feature |

State shared by two features belongs in a library store. A feature must never reach into another feature's store.

## The shape of a store

The full file is [templates/signal-store/order-list.store.ts](../templates/signal-store/order-list.store.ts). The skeleton:

```ts
interface OrderListState {
  page: number;
  search: string;
  status: OrderStatus | null;
}

const initialState: OrderListState = { page: 1, search: '', status: null };

export const OrderListStore = signalStore(
  guardedDevtools('orderList'),
  withState(initialState),
  withProps(...),       // injected services, debounced signals, private helpers
  withResource(...),    // reads
  withMutations(...),   // writes
  withComputed(...),    // derived values
  withMethods(...),     // actions
);
```

The order is deliberate. Each feature can use what the ones above it added, so state comes first and methods last.

- **Type the state** with an interface and name the starting value `initialState`. A store that outlives its page also
  exposes `reset()`, which is `patchState(store, initialState)`.
- **Change state only with `patchState`.** Never mutate an array or an object in place; replace it.
- **Put derived values in `withComputed`**, not in methods and not in the template.
- **Inject with `inject()` inside `withProps`, `withMethods` or `withHooks`.** A store has no constructor.
- **Prefix private members with `_`.** Underscore-prefixed state, props and methods are not exposed on the store instance, so
  `_debouncedSearch` and `_listReload` stay inside the store. Expose a deliberate method (`refresh()`) when callers need it.
- **Reset the page when a filter changes.** Every filter setter patches `page: 1` in the same call, because a filter applied
  on page 5 can leave you past the last page.
- **Never type a store as `any`.** If declaration emit complains in a library, export an interface for the public surface.

## Commands that are not plain requests

A search that must not overlap itself, or a command with several steps, is better as an `rxMethod`:

```ts
search: rxMethod<string>(
  pipe(
    tap(() => store.setLoading()),
    exhaustMap(q =>
      http.get<Page<Product>>('/api/products', { params: { q } }).pipe(
        tapResponse({
          next: ({ items }) => patchState(store, { products: items }),
          error: () => store.setError('search-failed'),
        }),
      ),
    ),
  ),
),
```

Choose the flattening operator on purpose: `switchMap` for a search where only the latest matters, `exhaustMap` for a submit
that must not run twice, `concatMap` when order matters. The complete store is
[product-search.store.ts](../templates/signal-store/product-search.store.ts). It also shows `setLoading` and `setError`,
which come from the custom feature in [06-custom-features.md](06-custom-features.md).

Reach for `rxMethod` when you need operators. A request derived from state is a resource, and a plain command is a mutation.

## State that survives a reload

Persist with `withStorageSync`, never with hand-written `localStorage.getItem` calls. See
[05-toolkit.md](05-toolkit.md) and [layout.store.ts](../templates/signal-store/layout.store.ts), which persists only the
theme and the language and leaves `sidebarCollapsed` alone.

## Testing a store

A store spec injects the store with a fake `HttpClient`, drives it through its public methods and asserts on its signals.
The complete example is
[order-list.store.spec.ts](../templates/testing/examples/order-list.store.spec.ts), and [09-testing.md](09-testing.md)
explains the toolkit it uses. Every store gets a spec.

## Rules

<!-- rules -->
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
<!-- /rules -->
