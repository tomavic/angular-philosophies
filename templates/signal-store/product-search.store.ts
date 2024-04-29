import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { exhaustMap, pipe, tap } from 'rxjs';
import { withFilters } from './with-filters';
import { withRequestStatus } from './with-request-status';
import { withServerPagination } from './with-server-pagination';

interface Product { id: number; name: string }
interface Page<T> { items: T[]; total: number }

export const ProductSearchStore = signalStore(
  withState({ products: [] as Product[] }),
  withRequestStatus(),
  withServerPagination(),
  withFilters({ q: '' }),
  withMethods((store, http = inject(HttpClient)) => ({
    // A command or a search that must not overlap itself: rxMethod + exhaustMap + tapResponse.
    search: rxMethod<string>(
      pipe(
        tap(() => store.setLoading()),
        exhaustMap(q =>
          http.get<Page<Product>>('/api/products', { params: { q, page: store.page() } }).pipe(
            tapResponse({
              next: ({ items, total }) => {
                patchState(store, { products: items });
                store.setTotal(total);
                store.setSuccess();
              },
              error: () => store.setError('search-failed'),
            }),
          ),
        ),
      ),
    ),
  })),
);
