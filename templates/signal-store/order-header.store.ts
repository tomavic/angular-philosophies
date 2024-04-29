import { computed, Signal } from '@angular/core';
import { signalStore, signalStoreFeature, withComputed, withFeature, withState } from '@ngrx/signals';

/** A feature that takes a signal as a parameter, so it can be reused with any store that has one. */
function withOrderLabel(orderId: Signal<number>) {
  return signalStoreFeature(withComputed(() => ({ label: computed(() => `Order #${orderId()}`) })));
}

export const OrderHeaderStore = signalStore(
  withState({ orderId: 0 }),
  // withFeature hands the store's own signals to a feature: the way to connect a reusable feature to a store.
  withFeature(({ orderId }) => withOrderLabel(orderId)),
);
