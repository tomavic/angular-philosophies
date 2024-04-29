import { patchState, signalStoreFeature, type, withMethods, withState } from '@ngrx/signals';

/** A feature that needs another feature declares it in `type<>()`; the compiler then rejects a wrong order. */
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

