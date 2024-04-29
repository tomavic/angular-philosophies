# Custom store features

`signalStoreFeature` lets you package state, computed values and methods as one reusable piece, and put it in any store
with a single line. It is the most powerful thing in SignalStore and the easiest to overuse.

## When to write one

**Write a feature the third time you copy the same block between stores.** Not before.

A feature written on the first use guesses at what varies. After three real copies you know which parts are the same and
which differ, and the feature takes exactly those as parameters. This is the same rule as
[the philosophy chapter](00-philosophy.md): write the abstraction the third time.

Three blocks that show up again and again in list and search stores, and are the usual first features:

| Feature | The repeated code |
| --- | --- |
| `withRequestStatus()` | A `loading` flag, an `error` flag and a `loaded` flag that can disagree, in every `rxMethod` store |
| `withServerPagination()` | `page`, `pageSize`, `total`, `pageCount` and a `setPage` in every list store |
| `withFilters()` | A filter patch that also has to send the user back to page 1 |

Reads built on resources and writes built on mutations don't need `withRequestStatus`: they already expose `status`,
`isLoading` and `error`. It exists for stores built on `rxMethod`.

## A feature with state, computed values and methods

```ts
export type RequestStatus = 'idle' | 'loading' | 'success' | 'error';

export function withRequestStatus() {
  return signalStoreFeature(
    withState<{ status: RequestStatus; error: string | null }>({ status: 'idle', error: null }),
    withComputed(({ status }) => ({
      isLoading: computed(() => status() === 'loading'),
      isSuccess: computed(() => status() === 'success'),
      isError: computed(() => status() === 'error'),
    })),
    withMethods(store => ({
      setLoading() { patchState(store, { status: 'loading', error: null }); },
      setSuccess() { patchState(store, { status: 'success', error: null }); },
      setError(error: string) { patchState(store, { status: 'error', error }); },
    })),
  );
}
```

One `status` field cannot be `loading` and `error` at once, which the three-flag version can. The file is
[with-request-status.ts](../templates/signal-store/with-request-status.ts), and
[product-search.store.ts](../templates/signal-store/product-search.store.ts) uses it with `rxMethod`.

## A feature that needs another feature

When a feature depends on something the store must already have, say so with `type<>()` in the first argument. The compiler
then rejects the store if the dependency is missing or in the wrong order:

```ts
export function withFilters<F extends Record<string, unknown>>(initial: F) {
  return signalStoreFeature(
    { methods: type<{ firstPage(): void }>() },
    withState({ filters: initial }),
    withMethods(store => ({
      patchFilters(patch: Partial<F>) {
        patchState(store, s => ({ filters: { ...s.filters, ...patch } }));
        store.firstPage();
      },
    })),
  );
}
```

`withFilters` needs `firstPage()`, which `withServerPagination()` provides, so it must come after it in the store. See
[with-filters.ts](../templates/signal-store/with-filters.ts) and
[with-server-pagination.ts](../templates/signal-store/with-server-pagination.ts).

## Connecting a feature to a store's own signals

A feature that takes a signal as a parameter is reused with any store that has one. `withFeature` hands the store to a
function that returns the feature:

```ts
function withOrderLabel(orderId: Signal<number>) {
  return signalStoreFeature(withComputed(() => ({ label: computed(() => `Order #${orderId()}`) })));
}

export const OrderHeaderStore = signalStore(
  withState({ orderId: 0 }),
  withFeature(({ orderId }) => withOrderLabel(orderId)),
);
```

This replaces the toolkit's deprecated `withFeatureFactory`. See [order-header.store.ts](../templates/signal-store/order-header.store.ts).

## State that follows other state

`withLinkedState` adds writable state that is computed from other signals and resets itself when its source changes. Use it
instead of an `effect` that sets state:

```ts
withLinkedState(({ options }) => ({
  selectedOption: linkedSignal<Option[], Option | undefined>({
    source: options,
    computation: (next, previous) => next.find(o => o.id === previous?.value?.id) ?? next[0],
  }),
})),
```

The selection survives a refetch if the option still exists, and falls back to the first one if not. The file is
[options.store.ts](../templates/signal-store/options.store.ts).

For a function that reacts to a signal and doesn't need operators, `signalMethod` is lighter than `rxMethod`.

## When stores must talk to each other

Stores should not inject each other. When two stores really need to coordinate (a cart that changes when an order is
placed), use the events plugin from `@ngrx/signals/events`. One side dispatches a named event, the other reacts to it, and
neither knows the other exists.

```ts
export const cartEvents = eventGroup({
  source: 'Cart',
  events: {
    added: type<{ sku: string; qty: number }>(),
    cleared: type<void>(),
  },
});

export const CartStore = signalStore(
  { providedIn: 'root' },
  withState({ lines: {} as Record<string, number> }),
  withReducer(
    on(cartEvents.added, ({ payload }, state) => ({
      lines: { ...state.lines, [payload.sku]: (state.lines[payload.sku] ?? 0) + payload.qty },
    })),
    on(cartEvents.cleared, () => ({ lines: {} })),
  ),
);
```

A component dispatches with `injectDispatch(cartEvents).added({ sku, qty })`. See [cart-events.ts](../templates/signal-store/cart-events.ts)
and [cart.store.ts](../templates/signal-store/cart.store.ts). This is the replacement for the toolkit's `withRedux`, and it is
the answer to "billing needs something from orders" in [01-architecture.md](01-architecture.md). Use it sparingly: most
state is one page's state, and a page's store is enough.

## Rules

<!-- rules -->
- Write a custom `signalStoreFeature` only after the same block has been copied between stores three times.
- Use one `status` field (`idle | loading | success | error`) instead of separate `loading`, `error` and `loaded` flags in `rxMethod` stores.
- Do not use `withRequestStatus` with resources or mutations; they already track their own status.
- Declare what a feature needs from the store with `type<>()` as its first argument so the compiler checks order.
- Connect a reusable feature to a store's own signals with `withFeature`, not `withFeatureFactory`.
- Use `withLinkedState` or `linkedSignal` for state that follows other state instead of an `effect` that sets signals.
- Use `signalMethod` for reactions that need no operators, and `rxMethod` when they do.
- Never inject one store into another; coordinate stores with `@ngrx/signals/events` event groups.
<!-- /rules -->
