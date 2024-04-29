import { computed } from '@angular/core';
import { patchState, signalStoreFeature, type, withComputed, withMethods, withState } from '@ngrx/signals';

export type RequestStatus = 'idle' | 'loading' | 'success' | 'error';

/** One status field instead of a `loading` flag, an `error` flag and a `loaded` flag that can disagree. */
export function withRequestStatus() {
  return signalStoreFeature(
    withState<{ status: RequestStatus; error: string | null }>({ status: 'idle', error: null }),
    withComputed(({ status }) => ({
      isLoading: computed(() => status() === 'loading'),
      isSuccess: computed(() => status() === 'success'),
      isError: computed(() => status() === 'error'),
    })),
    withMethods(store => ({
      setLoading() {
        patchState(store, { status: 'loading', error: null });
      },
      setSuccess() {
        patchState(store, { status: 'success', error: null });
      },
      setError(error: string) {
        patchState(store, { status: 'error', error });
      },
    })),
  );
}
