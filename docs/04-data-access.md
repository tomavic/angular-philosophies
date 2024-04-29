# Data access

How a page reads from the server, writes to it, and shows what went wrong. The tools are `httpResource` for reads,
`httpMutation` for writes, functional interceptors for everything cross-cutting, and signals for the result.

## Reads: resources derived from state

A read is a resource whose request is computed from signals. When a signal the request reads changes, the resource
refetches by itself. Nobody calls `load()`.

```ts
withResource(
  store => ({
    list: httpResource<Page<Order>>(
      () => ({ url: '/api/orders', params: { page: store.page(), ...(store.status() ? { status: store.status()! } : {}) } }),
      { defaultValue: EMPTY_PAGE },
    ),
  }),
  { errorHandling: 'previous value' },
),
```

`withResource` comes from `@ngrx-toolkit/core` and is marked `@experimental` in v22. A named resource adds
`listValue()`, `listStatus()`, `listError()`, `listIsLoading()` and a private `_listReload()` to the store. A component
reads those signals and nothing else.

Two things go on every resource, and neither is optional:

- **A `defaultValue`.** Without one the value type is `T | undefined`, and every consumer needs a `?.` or a `??`.
- **`errorHandling: 'previous value'`.** The default (`'undefined value'`) widens the type the same way.

Together they keep the value non-nullable end to end, so `store.listValue().items` is always an array. If you find
yourself writing `?.` on a resource value in a component, the store is missing one of the two. Fix the store.

### What "previous value" does and does not keep

This is worth knowing exactly, because it is easy to assume more than it does.

| Situation | What `listValue()` holds |
| --- | --- |
| A reload of the same request fails (`refresh()`) | The last good value. `listError()` is set, so the page can say the data is stale |
| A changed filter or page starts a new request and it fails | The `defaultValue`. A new request is not a reload, so there is no previous value to keep |

Both are covered by tests in [order-list.store.spec.ts](../templates/testing/examples/order-list.store.spec.ts). Design the
page for both: show the stale list with a "try again" button after a failed reload, and show the empty state plus an error
after a failed filter.

### A read that only one component needs

A resource used by one component and nothing else can live in the component with plain `httpResource`. Move it into a store
when a second component needs the result or the call becomes a command. A page reading several resources folds their
statuses into one with [`apiStatus`](../templates/signal-store/api-status.ts), so the template has a single skeleton and a
single error state:

```ts
protected readonly status = apiStatus(this.orders.status, this.stats.status);
```

## Writes: mutations, not resources

`httpResource` is for GET. Every POST, PATCH, PUT and DELETE is an `httpMutation`:

```ts
withMutations(store => ({
  cancel: httpMutation({
    request: (id: number) => ({ url: `/api/orders/${id}/cancel`, method: 'POST', body: {} }),
    onSuccess: () => store._listReload(),
  }),
})),
```

Each mutation exposes `cancelIsPending()`, `cancelStatus()`, `cancelError()`, and the method itself returns a promise of a
result, so a component can `await store.cancel(id)` and branch on the status. Check the API's real verbs first: if it has
no `PUT`, a save is `PATCH` when an id exists and `POST` when it doesn't, and one mutation can pick between them in its
`request` function.

A successful write reloads the reads it affected, inside `onSuccess`, so the list and the stats never disagree.

## Don't fetch what you already know

If an endpoint returns a compile-time constant (the values of an enum, a fixed list of options), do not call it. Put the
constant in the model file (`ORDER_STATUS_OPTIONS`) and use it. The endpoint can keep existing for other consumers; stopping
one call is not a reason to delete a route. Search the whole repository for other callers before removing either side.

## Interceptors

Cross-cutting HTTP behaviour lives in functional interceptors, registered once, in order, by a single provider function
such as `provideShopInterceptors()`:

| Interceptor | Job |
| --- | --- |
| API prefix | Adds the base URL from configuration |
| Clean query params | Drops empty and `undefined` params so a store doesn't have to |
| Accept-Language | Sends the current language, so a language change refetches in the right one |
| Response unwrap | Unwraps a `{ data }` envelope if the backend uses one |
| Error | Turns a failed request into a typed error and a toast |
| Unauthorised | Sends a 401 to the login page and clears the session |

Anything that needs an exception, such as a guest flow that must not send credentials, asks for it with an `HttpContext`
token (`GUEST_REQUEST`) that the interceptor reads. The interceptor never matches feature URLs, because then the core
library would know about its features.

## Errors

- Backend errors are typed once (`ApiError`, `ApiErrorResult` in the core models) and mapped by the error interceptor.
- A failed read shows an error state with a retry that calls the store's `refresh()`. A failed write shows a toast or an
  inline message, chosen by where the user is looking.
- Translate the message. Interceptors and stores carry translation keys, and the template translates them.
- Track `status` and `error` in state for commands built with `rxMethod`; resources and mutations track their own.

## Rules

<!-- rules -->
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
<!-- /rules -->
