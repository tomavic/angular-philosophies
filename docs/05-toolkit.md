# The toolkit

`@ngrx-toolkit/core` adds extensions on top of `@ngrx/signals`: resources, mutations, devtools, storage sync and more. It
ships more than most features need, and every extension is a thing a reader has to learn. This chapter says what is
adopted, what is available but not yet needed, and what to avoid.

## Install

```bash
pnpm add @ngrx/signals @ngrx-toolkit/core
```

Starting with version 22 the package is **`@ngrx-toolkit/core`**. Version 21 and earlier were published as
`@angular-architects/ngrx-toolkit`. Match its major to your Angular major; v22 needs `@angular/core` 22, `@ngrx/signals` 22
and `@ngrx/store` 22 as peers.

## Inventory

**Adopted.** These are part of the standard store:

| Extension | Use |
| --- | --- |
| `withResource` | Reads, derived from state. See [04-data-access.md](04-data-access.md) |
| `withMutations`, `httpMutation` | Writes. `rxMutation` for a write that is not a plain HTTP call |
| `withDevtools`, `withDevToolsStub` | Only through `guardedDevtools`, below |
| `withMapper` | Redacting sensitive keys before they reach devtools |
| `withStorageSync` | Persisting part of a store to `localStorage` or `sessionStorage` |

**Available, add when a real need shows up.** Don't add these speculatively:

| Extension | Add it when |
| --- | --- |
| `withImmutableState` | A store mutated outside `patchState` caused a real bug. It throws in dev mode on such a mutation |
| `withReset` | A store needs a `resetState()` and the hand-written `reset()` has become repetitive |
| `withConditional` | You must swap between two feature sets of the same shape by a condition |
| `withUndoRedo` | A screen offers undo and redo |
| `withCallState` | A store is built on `rxMethod` and repeats `loading` and `error` flags. Resources and mutations already track their own status. See [06-custom-features.md](06-custom-features.md) for a smaller version |

**Leave alone.** These solve a shape of problem this guide avoids:

| Extension | Why not |
| --- | --- |
| `withDataService`, `withEntityResources` | Both assume the endpoint returns a bare array. A paginated envelope (`{ items, total }`) doesn't fit; use `withResource` |
| `withPagination` | Client-side paging of a collection that is already loaded. Server-side paging doesn't need it |
| `withRedux`, `createEffects` | A reducer and effects layer that this guide's facade rule exists to avoid. The toolkit's own docs mark `createEffects` deprecated in favour of `@ngrx/signals/events`. See [06-custom-features.md](06-custom-features.md) |
| `withFeatureFactory` | Deprecated. Use `withFeature` from `@ngrx/signals` |
| `patchState` from the toolkit | Deprecated alias of `updateState`. Use `patchState` from `@ngrx/signals` |

If you add an extension that is not marked adopted, update this table in the same change. The inventory is what stops the
toolkit from slowly becoming the whole architecture.

## Devtools, never raw

`withDevtools` connects to the Redux DevTools browser extension unconditionally. It does not check `isDevMode()`. A raw
`withDevtools()` call therefore ships to production, where anyone with the extension installed can read that store's
state. Every store goes through one wrapper:

```ts
import { isDevMode } from '@angular/core';
import { DevtoolsFeature, withDevToolsStub, withDevtools } from '@ngrx-toolkit/core';

export function guardedDevtools(name: string, ...features: DevtoolsFeature[]) {
  return isDevMode() ? withDevtools(name, ...features) : withDevToolsStub(name, ...features);
}
```

`withDevToolsStub` is the toolkit's own mechanism for this: it never touches the devtools connection. Keep one copy of the
wrapper in a shared `util` or `core` library, and grep for `withDevtools(` before merging. It should only appear inside
that file. The file is [guarded-devtools.ts](../templates/signal-store/guarded-devtools.ts).

When a store's tracked state holds a full entity row, also pass `withMapper` and redact any password-, token- or
secret-shaped key before it reaches devtools. That is defence in depth on top of the server not sending those fields. A
store that holds only ids, names and counts has nothing to mask, so don't add one.

## Storage sync

```ts
withStorageSync({
  key: 'app-layout',
  select: ({ theme, language }) => ({ theme, language }), // persist only what should survive a reload
}),
```

Place it right after `withState`. By default it reads on init and writes on every state change, so methods that used to
call `localStorage.setItem` after `patchState` simply drop that call. `select` keeps transient state such as
`sidebarCollapsed` out of storage. See [layout.store.ts](../templates/signal-store/layout.store.ts).

Guard any direct `window` access for server rendering. Storage sync handles that for you, hand-written code doesn't.

## Rules

<!-- rules -->
- Install `@ngrx-toolkit/core` for Angular 22 (`@angular-architects/ngrx-toolkit` for 21 and earlier), with the same major as Angular.
- Use `withResource`, `withMutations`/`httpMutation`, `guardedDevtools`, `withMapper` and `withStorageSync` as the standard extensions.
- Add `withImmutableState`, `withReset`, `withConditional`, `withUndoRedo` or `withCallState` only when a real need appears, and update the inventory in the same change.
- Do not use `withDataService`, `withEntityResources`, `withPagination`, `withRedux`, `createEffects` or `withFeatureFactory`.
- Use `withFeature` from `@ngrx/signals` instead of `withFeatureFactory`, and `patchState` from `@ngrx/signals` instead of the toolkit's.
- Never call `withDevtools` directly; call `guardedDevtools(name, ...)` from one shared file.
- Add `withMapper` to redact secret-shaped keys when a store's tracked state holds a full entity row.
- Persist state with `withStorageSync` and a `select` that lists only what should survive a reload; place it right after `withState`.
<!-- /rules -->
