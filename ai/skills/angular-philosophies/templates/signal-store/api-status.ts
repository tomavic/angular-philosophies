import { computed, ResourceStatus, Signal } from '@angular/core';

/**
 * Folds several resource statuses into one for the template: 'error' if any failed, 'loading' if any is
 * loading or reloading, otherwise 'idle'. A page with three resources then has one skeleton and one error state.
 */
export function apiStatus(...statuses: (Signal<ResourceStatus> | (() => ResourceStatus))[]) {
  return computed(() => {
    const values = statuses.map(status => status());
    if (values.includes('error')) return 'error';
    if (values.includes('loading') || values.includes('reloading')) return 'loading';
    return 'idle';
  });
}
