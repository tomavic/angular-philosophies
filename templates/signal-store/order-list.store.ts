import { httpResource } from '@angular/common/http';
import { computed } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { patchState, signalStore, withComputed, withMethods, withProps, withState } from '@ngrx/signals';
import { httpMutation, withMutations, withResource } from '@ngrx-toolkit/core';
import { debounceTime } from 'rxjs';
import { guardedDevtools } from './guarded-devtools';
import { Order, OrderStatus, Page } from './order.model';

interface OrderListState {
  page: number;
  search: string;
  status: OrderStatus | null;
}

const initialState: OrderListState = { page: 1, search: '', status: null };
const EMPTY_PAGE: Page<Order> = { items: [], total: 0 };

export const OrderListStore = signalStore(
  guardedDevtools('orderList'),
  withState(initialState),
  // A debounced copy of the search box. Derived state stays a signal, never a subscription.
  withProps(store => ({
    _debouncedSearch: toSignal(toObservable(store.search).pipe(debounceTime(300)), { initialValue: '' }),
  })),
  // Reads are resources derived from state: changing a filter re-derives the request, nobody calls load().
  withResource(
    store => ({
      list: httpResource<Page<Order>>(
        () => ({
          url: '/api/orders',
          params: {
            page: store.page(),
            ...(store._debouncedSearch() ? { search: store._debouncedSearch() } : {}),
            ...(store.status() ? { status: store.status()! } : {}),
          },
        }),
        { defaultValue: EMPTY_PAGE },
      ),
    }),
    { errorHandling: 'previous value' },
  ),
  withMutations(store => ({
    cancel: httpMutation({
      request: (id: number) => ({ url: `/api/orders/${id}/cancel`, method: 'POST', body: {} }),
      onSuccess: () => store._listReload(),
    }),
  })),
  withComputed(store => ({
    pageCount: computed(() => Math.max(1, Math.ceil(store.listValue().total / 20))),
  })),
  withMethods(store => ({
    setSearch(search: string) {
      patchState(store, { search, page: 1 });
    },
    setStatus(status: OrderStatus | null) {
      patchState(store, { status, page: 1 });
    },
    setPage(page: number) {
      patchState(store, { page });
    },
    /** Refetch the same request. A failed reload keeps the last good value; see docs/04-data-access.md. */
    refresh() {
      store._listReload();
    },
    reset() {
      patchState(store, initialState);
    },
  })),
);
