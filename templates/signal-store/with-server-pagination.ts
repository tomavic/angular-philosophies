import { computed } from '@angular/core';
import { patchState, signalStoreFeature, withComputed, withMethods, withState } from '@ngrx/signals';

export function withServerPagination(pageSize = 20) {
  return signalStoreFeature(
    withState({ page: 1, pageSize, total: 0 }),
    withComputed(({ page, pageSize, total }) => ({
      pageCount: computed(() => Math.max(1, Math.ceil(total() / pageSize()))),
      hasNext: computed(() => page() * pageSize() < total()),
    })),
    withMethods(store => ({
      setPage(page: number) {
        patchState(store, { page });
      },
      setTotal(total: number) {
        patchState(store, { total });
      },
      /** Call after any filter change: a filter on page 5 can leave you past the last page. */
      firstPage() {
        patchState(store, { page: 1 });
      },
    })),
  );
}
